/**
 * ============================================================
 *  TIEMPOS DE AMOR — Google Apps Script (backend del RSVP)
 * ------------------------------------------------------------
 *  La Sheet tiene DOS pestañas:
 *
 *  1) "Invitados" — la lista real de invitados (la editas tú a
 *     mano). Es la fuente de verdad que la web lee para buscar.
 *     Columnas: Grupo | Nombre | Apellidos | Confirmación
 *       - "Grupo": texto libre que agrupa a quien se sienta junto
 *         (p. ej. "Familia Pérez"). Ese mismo texto es el que
 *         luego se guarda como "Grupo (mesa)" en "Confirmados".
 *       - "Confirmación": la rellena la web sola (✅ si asiste,
 *         ❌ si no) en cuanto esa persona responde. Mientras esté
 *         vacía, esa persona puede buscarse y confirmar; en
 *         cuanto tiene ✅ o ❌, queda bloqueada (no puede volver
 *         a enviar el formulario).
 *
 *  2) "Confirmados" — SOLO las personas que han dicho que SÍ
 *     asisten, una fila por persona, con el detalle del
 *     formulario (alergias, canción, mensaje...). Quien dice que
 *     no, no aparece aquí: solo se marca la ❌ en "Invitados".
 *
 *  Pasos de instalación al final de este archivo.
 * ============================================================
 */

var HOJA_INVITADOS = 'Invitados';
var HOJA_CONFIRMADOS = 'Confirmados';

// Columnas de "Invitados" (1 = A, 2 = B, ...)
var COL_GRUPO = 1;
var COL_NOMBRE = 2;
var COL_APELLIDOS = 3;
var COL_CONFIRMACION = 4;

var CABECERAS_INVITADOS = ['Grupo', 'Nombre', 'Apellidos', 'Confirmación'];

var CABECERAS_CONFIRMADOS = [
  'Marca temporal',
  'Grupo (mesa)',
  'Nombre completo',
  'Alergias / intolerancias',
  'Observaciones',
  'Canción imprescindible',
  'Mensaje a los novios'
];

/* ---------- Utilidad: coger o crear una hoja con su cabecera ---------- */
function obtenerHoja(nombre, cabeceras) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(nombre);
  if (!hoja) {
    hoja = ss.insertSheet(nombre);
  }
  if (hoja.getLastRow() === 0) {
    hoja.appendRow(cabeceras);
    hoja.getRange(1, 1, 1, cabeceras.length).setFontWeight('bold');
    hoja.setFrozenRows(1);
  }
  return hoja;
}

/* ---------- GET: la web pide la lista de invitados ----------
   Se sirve como JSON simple (sin cabeceras especiales), por eso
   se puede leer con fetch() normal desde el navegador sin líos
   de CORS: un GET así se considera una petición "simple". */
function doGet(e) {
  try {
    var hoja = obtenerHoja(HOJA_INVITADOS, CABECERAS_INVITADOS);
    var filas = hoja.getLastRow();
    var gruposPorId = {};
    var ordenGrupos = [];

    if (filas > 1) {
      var datos = hoja.getRange(2, 1, filas - 1, 4).getValues();
      datos.forEach(function (fila, i) {
        var numFila = i + 2; // +2: la cabecera es la fila 1
        var grupo = String(fila[COL_GRUPO - 1] || '').trim();
        var nombre = String(fila[COL_NOMBRE - 1] || '').trim();
        var apellidos = String(fila[COL_APELLIDOS - 1] || '').trim();
        var marca = String(fila[COL_CONFIRMACION - 1] || '').trim();
        if (!nombre && !apellidos) return; // fila vacía, se ignora

        var estado = marca === '✅' ? 'si' : (marca === '❌' ? 'no' : 'pendiente');

        if (!gruposPorId[grupo]) {
          gruposPorId[grupo] = { id: grupo, miembros: [] };
          ordenGrupos.push(grupo);
        }
        gruposPorId[grupo].miembros.push({
          fila: numFila,
          nombre: nombre,
          apellidos: apellidos,
          estado: estado
        });
      });
    }

    var grupos = ordenGrupos.map(function (g) { return gruposPorId[g]; });

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, grupos: grupos }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/* ---------- POST: la web envía una confirmación ---------- */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // evita escrituras simultáneas
  try {
    var hojaInvitados = obtenerHoja(HOJA_INVITADOS, CABECERAS_INVITADOS);
    var hojaConfirmados = obtenerHoja(HOJA_CONFIRMADOS, CABECERAS_CONFIRMADOS);

    var params = (e && e.parameter) ? e.parameter : {};
    var timestamp = params.timestamp || new Date().toISOString();
    var grupoId = params.grupoId || '';
    var mensajeNovios = params.mensajeNovios || '';

    var asistentes = [];
    try {
      asistentes = JSON.parse(params.asistentes || '[]');
    } catch (err) {
      asistentes = [];
    }

    var procesados = 0;
    var omitidos = 0;

    asistentes.forEach(function (a) {
      var fila = Number(a.fila);
      if (!fila || fila < 2) { omitidos++; return; }

      // Defensa extra: si esa fila ya tiene ✅ o ❌, no se vuelve a tocar
      // (aunque el candado real de cara al usuario ya se hace en la web,
      // antes de dejarle enviar el formulario).
      var actual = String(hojaInvitados.getRange(fila, COL_CONFIRMACION).getValue() || '').trim();
      if (actual === '✅' || actual === '❌') { omitidos++; return; }

      var asiste = a.asiste === 'Sí';
      hojaInvitados.getRange(fila, COL_CONFIRMACION).setValue(asiste ? '✅' : '❌');
      procesados++;

      if (asiste) {
        var alergias = Array.isArray(a.alergias) ? a.alergias.join(', ') : (a.alergias || '');
        hojaConfirmados.appendRow([
          timestamp,
          grupoId,
          a.nombreCompleto || '',
          alergias,
          a.observaciones || '',
          a.cancion || '',
          mensajeNovios
        ]);
      }
    });

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, procesados: procesados, omitidos: omitidos }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/* ============================================================
   CÓMO INSTALARLO (paso a paso)
   ------------------------------------------------------------
   1. Crea una hoja de cálculo nueva en Google Sheets (sheets.new).
      Ponle el nombre que quieras, p. ej. "Boda Ana y Adrián".

   2. Crea dentro DOS pestañas (botón "+" abajo a la izquierda),
      llamadas exactamente:
        - Invitados
        - Confirmados
      (Si las dejas vacías, el script les pone la cabecera solo
      la primera vez que se usan.)

   3. Rellena la pestaña "Invitados" con tu lista real, en este
      orden de columnas: Grupo | Nombre | Apellidos | Confirmación
      - Deja "Confirmación" vacía: la rellena la web sola.
      - Usa el mismo texto de "Grupo" para todas las personas que
        se sienten juntas (p. ej. "Familia Pérez" para las 2
        personas de esa invitación).

   4. En el menú superior: Extensiones → Apps Script. Se abre el
      editor de scripts vinculado a esa hoja.

   5. Borra el código de ejemplo y PEGA todo el contenido de este
      archivo (apps-script.gs). Guarda (icono de disquete).

   6. Despliega como aplicación web:
      - Botón azul "Implementar" (arriba a la derecha)
        → "Nueva implementación".
      - Tipo (rueda dentada) → "Aplicación web".
      - Descripción: "RSVP boda".
      - "Ejecutar como": Yo (tu cuenta).
      - "Quién tiene acceso": Cualquier usuario.
      - "Implementar". Autoriza los permisos que te pida
        (elige tu cuenta → Configuración avanzada →
        "Ir a (nombre) (no seguro)" → Permitir).

   7. Copia la URL que termina en /exec
      (algo como https://script.google.com/macros/s/AKfy.../exec).

   8. Pega esa URL en la constante SCRIPT_URL del fichero
      js/rsvp.js de la web, sustituyendo el valor de ejemplo.
      En cuanto dejes de tener "PEGA_AQUI" en la URL, la web sale
      del modo demostración: busca en tu Sheet de verdad y envía
      las confirmaciones ahí.

   9. (Al hacer cambios en el script) usa "Implementar →
      Gestionar implementaciones → editar (lápiz) → Versión:
      Nueva versión" para que los cambios surtan efecto.

   NOTA: la búsqueda de invitados usa fetch normal (GET), así que
   el navegador SÍ lee la respuesta. El envío del formulario sigue
   usando fetch en modo "no-cors" (POST), así que ahí el navegador
   no lee la respuesta — es normal y esperado; las filas y las
   marcas ✅/❌ se actualizan igualmente en la Sheet.
   ============================================================ */
