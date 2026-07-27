/* ============================================================
   TIEMPOS DE AMOR — Formulario de asistencia (RSVP)
   Paso 1: buscar invitado en la lista (leída de Google Sheets)
   Paso 2: confirmar asistentes, alergias, canción y mensaje
   Envío: fetch no-cors + FormData a Google Apps Script
   ============================================================ */

/* ------------------------------------------------------------
   1) PEGA AQUÍ LA URL DE TU APPS SCRIPT (termina en /exec)
   Mientras contenga "PEGA_AQUI" el formulario funciona en
   MODO DEMOSTRACIÓN: usa la lista de ejemplo de js/invitados.js
   y valida/muestra el éxito SIN enviar ni leer nada de verdad.
   En cuanto pegues tu URL real, la búsqueda lee en vivo la
   pestaña "Invitados" de tu Google Sheet (ver apps-script.gs).
   ------------------------------------------------------------ */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyXSpA4Zo6BJ7_CY2xKSm-wLGFJAni7mbS-A65JTTc1RZTTGkFOJusNlkFOk5RQtK1kRg/exec";
const MODO_DEMO = SCRIPT_URL.includes("PEGA_AQUI");

/* Opciones de alergias / intolerancias ("ninguna" es excluyente) */
const ALERGIAS = [
  { valor: "ninguna",  etiqueta: "Ninguna" },
  { valor: "gluten",   etiqueta: "Gluten / celiaquía" },
  { valor: "lacteos",  etiqueta: "Lácteos" },
  { valor: "lactosa",  etiqueta: "Lactosa" },
  { valor: "huevo",    etiqueta: "Huevo" },
  { valor: "frutos_secos", etiqueta: "Frutos secos" },
  { valor: "mariscos", etiqueta: "Mariscos / crustáceos" },
  { valor: "pescado",  etiqueta: "Pescado" },
  { valor: "soja",     etiqueta: "Soja" },
  { valor: "otro",     etiqueta: "Otro" },
];

/* ---------- Utilidades ---------- */
function normaliza(s) {
  return (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/\s+/g, " ")
    .trim();
}

/* "Adrián" + "González Abellán" -> "Adrián G. A." */
function anonimiza(nombre, apellidos) {
  const iniciales = apellidos.split(/\s+/).filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + ".").join(" ");
  return `${nombre} ${iniciales}`.trim();
}

function nombreCompleto(m) { return `${m.nombre} ${m.apellidos}`.trim(); }

/* ---------- Carga de invitados ----------
   En modo demo usa la lista de ejemplo de window.INVITADOS (confirmado:
   true/false). En modo real pide la pestaña "Invitados" al Apps Script
   por GET: cada miembro llega con "fila" (fila real en la Sheet, para
   poder marcarla luego) y "estado" ("pendiente" | "si" | "no"). */
function normalizarMiembro(m) {
  const estado = m.estado || (m.confirmado ? "si" : "pendiente");
  return { fila: m.fila != null ? m.fila : null, nombre: m.nombre, apellidos: m.apellidos, estado };
}

async function cargarInvitados() {
  if (MODO_DEMO) {
    return (window.INVITADOS && window.INVITADOS.grupos) ? window.INVITADOS.grupos : [];
  }
  const resp = await fetch(SCRIPT_URL, { method: "GET" });
  const datos = await resp.json();
  if (!datos || !datos.ok) throw new Error((datos && datos.error) || "Respuesta inválida del servidor");
  return datos.grupos || [];
}

/* ---------- Índice de invitados (precalculado una sola vez) ----------
   Con ~300 invitados un escaneo lineal ya es instantáneo (son
   microsegundos), así que el "cuello de botella" real no es el tamaño
   de la lista sino normalizar (minúsculas + quitar acentos) el nombre
   y los apellidos de cada invitado en CADA búsqueda. Aquí lo hacemos
   una única vez al cargar la página (justo después de recibir los
   datos) y lo reutilizamos en todas las búsquedas, para que ninguna
   tenga que esperar, aunque la lista crezca. */
let INDICE_INVITADOS = null;

function construirIndiceInvitados(grupos) {
  const indice = [];
  for (const grupoIn of grupos || []) {
    const grupo = { id: grupoIn.id, miembros: (grupoIn.miembros || []).map(normalizarMiembro) };
    for (const m of grupo.miembros) {
      indice.push({
        grupo,
        miembro: m,
        nombreNorm: normaliza(m.nombre),
        apellidosNorm: normaliza(m.apellidos),
      });
    }
  }
  return indice;
}

/* ---------- Búsqueda del invitado ---------- */
function buscarInvitado(nombreIn, apellidosIn) {
  const indice = INDICE_INVITADOS || [];

  const nN = normaliza(nombreIn);
  const aTokens = normaliza(apellidosIn).split(" ").filter(Boolean);
  if (!nN || aTokens.length === 0) return null;

  for (const entrada of indice) {
    const nombreOk = entrada.nombreNorm === nN || entrada.nombreNorm.startsWith(nN);
    // todos los apellidos escritos deben aparecer en los apellidos del invitado
    const apellidosOk = aTokens.every(t => entrada.apellidosNorm.includes(t));
    if (nombreOk && apellidosOk) {
      return { grupo: entrada.grupo, miembroEncontrado: entrada.miembro };
    }
  }
  return null;
}

/* ---------- Referencias DOM ---------- */
let elBuscar, elNombre, elApellidos, elAvisoBuscar;
let elPaso1, elPaso2, elGrupoMsg, elAsistentes, elFormConfirmar, elEstado, elMensajeNovios;
let grupoActivo = null;

/* ---------- Render del Paso 2 ---------- */
function renderPaso2(resultado) {
  grupoActivo = resultado.grupo;
  const encontrado = resultado.miembroEncontrado;
  const anon = anonimiza(encontrado.nombre, encontrado.apellidos);

  // Cabecera / mensaje según estado
  if (encontrado.estado === "si") {
    elGrupoMsg.className = "aviso aviso--ok";
    elGrupoMsg.innerHTML =
      `Sabemos que estás tan deseoso/a como nosotros de que llegue el gran día :). ` +
      `<strong>Tu asistencia ya ha sido confirmada.</strong>`;
    elGrupoMsg.hidden = false;
  } else if (encontrado.estado === "no") {
    elGrupoMsg.className = "aviso aviso--info";
    elGrupoMsg.innerHTML =
      `Ya nos dijiste que no podrás acompañarnos. Si algo ha cambiado, escríbenos directamente a ` +
      `<a href="mailto:hola@tiemposdeamor.com">hola@tiemposdeamor.com</a>.`;
    elGrupoMsg.hidden = false;
  } else {
    elGrupoMsg.className = "invitado-resultado";
    elGrupoMsg.innerHTML =
      `<h3>¡Te hemos encontrado, ${anon}! 👋</h3>` +
      `<p style="margin:0">Confirma a continuación tu asistencia y la de tu acompañante.</p>`;
    elGrupoMsg.hidden = false;
  }

  // Tarjetas por cada miembro del grupo
  elAsistentes.innerHTML = "";
  resultado.grupo.miembros.forEach((m, i) => {
    const anonM = anonimiza(m.nombre, m.apellidos);
    const card = document.createElement("div");
    card.className = "asistente-card";
    card.dataset.nombreCompleto = nombreCompleto(m);
    card.dataset.fila = m.fila != null ? String(m.fila) : "";

    if (m.estado === "si" || m.estado === "no") {
      const clase = m.estado === "si" ? "aviso--ok" : "aviso--info";
      const texto = m.estado === "si"
        ? "✅ Ya ha confirmado su asistencia. ¡Gracias!"
        : "Ya nos avisó de que no podrá asistir.";
      card.innerHTML =
        `<h3>${anonM}</h3>` +
        `<p class="aviso ${clase}" style="margin:0">${texto}</p>`;
      card.dataset.yaConfirmado = "true";
      elAsistentes.appendChild(card);
      return;
    }

    const alergHTML = ALERGIAS.map(a =>
      `<label>
         <input type="checkbox" class="alergia" name="alergia-${i}" value="${a.valor}">
         <span>${a.etiqueta}</span>
       </label>`).join("");

    card.innerHTML = `
      <h3>${anonM}</h3>
      <div class="form-grupo" role="radiogroup" aria-label="¿Asistirá ${anonM}?">
        <span style="font-weight:700; display:block; margin-bottom:6px">¿Asistirá?</span>
        <label style="display:inline-flex; gap:6px; margin-right:18px; font-weight:400">
          <input type="radio" name="asiste-${i}" value="Sí" class="asiste"> Sí, allí estaré 🎉
        </label>
        <label style="display:inline-flex; gap:6px; font-weight:400">
          <input type="radio" name="asiste-${i}" value="No" class="asiste"> No podré ir 😢
        </label>
      </div>

      <div class="detalle-asistente oculto">
        <fieldset class="fieldset">
          <legend>Alergias o intolerancias</legend>
          <p class="pista" style="margin-top:0">Marca todas las que apliquen. "Ninguna" desmarca el resto.</p>
          <div class="check-grid">${alergHTML}</div>
        </fieldset>

        <div class="form-grupo">
          <label for="obs-${i}">Observaciones <span class="pista">(opcional)</span></label>
          <textarea id="obs-${i}" class="observaciones"
            placeholder="Ej.: dieta vegetariana / vegana, sin cerdo, otra intolerancia..."></textarea>
        </div>

        <div class="form-grupo">
          <label for="cancion-${i}">La canción que no puede faltar 🎵 <span class="pista">(opcional)</span></label>
          <input type="text" id="cancion-${i}" class="cancion"
            placeholder="Artista - Título">
        </div>
      </div>
    `;
    elAsistentes.appendChild(card);

    // Mostrar/ocultar detalle según "asiste"
    const detalle = card.querySelector(".detalle-asistente");
    card.querySelectorAll(".asiste").forEach(r => {
      r.addEventListener("change", () => {
        detalle.classList.toggle("oculto", r.value !== "Sí" || !r.checked);
      });
    });

    // "Ninguna" excluyente
    const checks = card.querySelectorAll(".alergia");
    checks.forEach(chk => {
      chk.addEventListener("change", () => {
        if (chk.value === "ninguna" && chk.checked) {
          checks.forEach(o => { if (o.value !== "ninguna") o.checked = false; });
        } else if (chk.value !== "ninguna" && chk.checked) {
          checks.forEach(o => { if (o.value === "ninguna") o.checked = false; });
        }
      });
    });
  });

  // Cambiar de paso
  elPaso1.classList.add("oculto");
  elPaso2.classList.remove("oculto");
  elEstado.hidden = true;
  elPaso2.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------- Recoger datos del Paso 2 ---------- */
function recogerDatos() {
  const asistentes = [];
  const cards = elAsistentes.querySelectorAll(".asistente-card");
  let faltaDecision = false;

  cards.forEach(card => {
    if (card.dataset.yaConfirmado === "true") return; // ya confirmado, se ignora
    const seleccion = card.querySelector(".asiste:checked");
    if (!seleccion) { faltaDecision = true; return; }

    const asiste = seleccion.value;
    let alergias = [], observaciones = "", cancion = "";
    if (asiste === "Sí") {
      alergias = Array.from(card.querySelectorAll(".alergia:checked")).map(c => c.value);
      observaciones = card.querySelector(".observaciones").value.trim();
      cancion = card.querySelector(".cancion").value.trim();
    }
    asistentes.push({
      fila: card.dataset.fila ? Number(card.dataset.fila) : null,
      nombreCompleto: card.dataset.nombreCompleto,
      asiste,
      alergias,
      observaciones,
      cancion
    });
  });

  return { asistentes, faltaDecision };
}

/* ---------- Estados de envío ---------- */
function setEstado(tipo, mensaje) {
  elEstado.className = "aviso aviso--" + tipo;
  elEstado.innerHTML = mensaje;
  elEstado.hidden = false;
}

/* ---------- Envío ---------- */
async function enviar(datos) {
  const btn = document.getElementById("btn-enviar");
  const payloadAsistentes = JSON.stringify(datos.asistentes);
  const mensajeNovios = elMensajeNovios.value.trim();

  const fd = new FormData();
  fd.append("timestamp", new Date().toISOString());
  fd.append("grupoId", grupoActivo ? grupoActivo.id : "");
  fd.append("mensajeNovios", mensajeNovios);
  fd.append("asistentes", payloadAsistentes);

  // MODO DEMOSTRACIÓN: no se envía nada
  if (MODO_DEMO) {
    setEstado("demo",
      "🧪 <strong>Modo demostración.</strong> Todo válido: en producción esto se " +
      "habría enviado a Google Sheets. Pega la URL de tu Apps Script en <code>SCRIPT_URL</code> " +
      "(js/rsvp.js) para activar el envío real.<br><br>" +
      "<details><summary>Ver datos que se enviarían</summary>" +
      "<pre style='white-space:pre-wrap; overflow:auto'>" +
      escaparHTML(JSON.stringify({
        timestamp: fd.get("timestamp"),
        grupoId: fd.get("grupoId"),
        mensajeNovios,
        asistentes: datos.asistentes
      }, null, 2)) + "</pre></details>");
    exitoFinal();
    return;
  }

  // ENVÍO REAL
  try {
    btn.disabled = true;
    setEstado("info", "⏳ Enviando tu confirmación...");
    await fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", body: fd });
    // Con no-cors no podemos leer la respuesta; si no lanza error, lo damos por bueno.
    setEstado("ok", "🎉 <strong>¡Confirmación recibida!</strong> Gracias, nos vemos en el festival.");
    exitoFinal();
  } catch (err) {
    btn.disabled = false;
    setEstado("error",
      "⚠️ No hemos podido enviar tu confirmación. Revisa tu conexión e inténtalo de nuevo. " +
      "Si el problema continúa, escríbenos a <a href='mailto:hola@tiemposdeamor.com'>hola@tiemposdeamor.com</a>.");
  }
}

function exitoFinal() {
  // Ocultamos el formulario tras confirmar
  elFormConfirmar.querySelector("#zona-formulario").classList.add("oculto");
}

function escaparHTML(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ---------- Carga inicial de la lista de invitados ----------
   Deshabilita el botón "Buscar" mientras se carga (en modo real es una
   petición de red al Apps Script) para que nadie busque contra una
   lista vacía, y avisa si la carga falla. */
async function iniciarCargaInvitados() {
  const btnBuscarSubmit = elBuscar.querySelector('button[type="submit"]');
  if (btnBuscarSubmit) btnBuscarSubmit.disabled = true;
  elAvisoBuscar.className = "aviso aviso--info";
  elAvisoBuscar.textContent = "Cargando la lista de invitados…";
  elAvisoBuscar.hidden = false;

  try {
    const grupos = await cargarInvitados();
    INDICE_INVITADOS = construirIndiceInvitados(grupos);
    elAvisoBuscar.hidden = true;
  } catch (err) {
    elAvisoBuscar.className = "aviso aviso--error";
    elAvisoBuscar.textContent =
      "No hemos podido cargar la lista de invitados. Recarga la página o inténtalo de nuevo en unos minutos.";
  } finally {
    if (btnBuscarSubmit) btnBuscarSubmit.disabled = false;
  }
}

/* ---------- Arranque ---------- */
document.addEventListener("DOMContentLoaded", () => {
  elBuscar        = document.getElementById("form-buscar");
  elNombre        = document.getElementById("buscar-nombre");
  elApellidos     = document.getElementById("buscar-apellidos");
  elAvisoBuscar   = document.getElementById("aviso-buscar");
  elPaso1         = document.getElementById("paso1");
  elPaso2         = document.getElementById("paso2");
  elGrupoMsg      = document.getElementById("grupo-mensaje");
  elAsistentes    = document.getElementById("asistentes-cont");
  elFormConfirmar = document.getElementById("form-confirmar");
  elEstado        = document.getElementById("estado-envio");
  elMensajeNovios = document.getElementById("mensaje-novios");

  if (!elBuscar) return; // no estamos en confirmar.html

  if (MODO_DEMO) {
    const banner = document.getElementById("banner-demo");
    if (banner) banner.hidden = false;
  }

  iniciarCargaInvitados();

  // Paso 1: buscar
  elBuscar.addEventListener("submit", (e) => {
    e.preventDefault();
    elAvisoBuscar.hidden = true;
    const res = buscarInvitado(elNombre.value, elApellidos.value);
    if (!res) {
      elAvisoBuscar.className = "aviso aviso--info";
      elAvisoBuscar.textContent =
        "No hemos podido encontrar a ese invitado/a. Prueba con otro nombre o revisa cómo está escrito. Si crees que es un error, escríbenos.";
      elAvisoBuscar.hidden = false;
      return;
    }
    renderPaso2(res);
  });

  // Volver a buscar
  const volver = document.getElementById("btn-volver");
  if (volver) volver.addEventListener("click", () => {
    elPaso2.classList.add("oculto");
    elPaso1.classList.remove("oculto");
    elFormConfirmar.querySelector("#zona-formulario").classList.remove("oculto");
    elEstado.hidden = true;
    elPaso1.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Paso 2: confirmar
  elFormConfirmar.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = recogerDatos();
    if (datos.faltaDecision) {
      setEstado("error", "Indica si cada persona asistirá o no antes de enviar. 🙏");
      return;
    }
    if (datos.asistentes.length === 0) {
      setEstado("info", "No hay nada que confirmar: parece que ya está todo hecho. ¡Gracias!");
      return;
    }
    enviar(datos);
  });
});
