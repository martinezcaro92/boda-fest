/* ============================================================
   TIEMPOS DE AMOR — JS compartido por todas las páginas
   Cabecera + navegación + pie inyectados aquí (una sola fuente),
   menú móvil, cuenta atrás en vivo y botón de copiar IBAN.
   ============================================================ */

/* ---------- CONFIGURACIÓN GLOBAL (editable) ---------- */
const CONFIG = {
  monograma: 'TDAF',
  novios: 'Ana & Adrián',
  // Fecha y hora de la boda (formato ISO, zona horaria de España).
  // sábado 17 de octubre de 2026, 12:30
  fechaBoda: '2026-10-17T12:30:00+02:00',
  dominio: 'tiemposdeamor.com',
  // Enlaces de navegación. Rutas relativas para que funcione en local y en GitHub Pages.
  nav: [
    { texto: 'Inicio',     href: 'index.html' },
    { texto: 'Info',       href: 'info.html' },
    { texto: 'Cómo llegar',href: 'como-llegar.html' },
    { texto: 'Regalo',     href: 'regalo.html' },
    { texto: 'FAQ',        href: 'faq.html' },
    { texto: 'Confirmar asistencia', href: 'confirmar.html', cta: true },
  ],
};

/* ---------- Utilidad: nombre del fichero actual ---------- */
function paginaActual() {
  const p = window.location.pathname.split('/').pop();
  return p === '' ? 'index.html' : p;
}

/* ---------- Corazón SVG con "TDAF" (marca / favicon) ---------- */
function corazonSVG(size = 26) {
  return `<svg class="corazon" width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <path fill="currentColor" stroke="#14110F" stroke-width="2" stroke-linejoin="round"
      d="M16 29C6 22 2 16.5 2 11.2 2 6.7 5.4 3.5 9.4 3.5c2.6 0 4.9 1.3 6.6 3.6 1.7-2.3 4-3.6 6.6-3.6 4 0 7.4 3.2 7.4 7.7C30 16.5 26 22 16 29z"/>
  </svg>`;
}

/* ---------- Inyectar CABECERA + NAV ---------- */
function montarCabecera() {
  const cont = document.getElementById('site-header');
  if (!cont) return;
  const actual = paginaActual();

  const enlaces = CONFIG.nav.map(item => {
    const activo = item.href === actual ? ' aria-current="page"' : '';
    const clase = item.cta ? ' class="nav__cta"' : '';
    return `<li><a href="${item.href}"${clase}${activo}>${item.texto}</a></li>`;
  }).join('');

  cont.innerHTML = `
  <header class="site-header">
    <nav class="nav" aria-label="Navegación principal">
      <a class="nav__marca" href="index.html" aria-label="${CONFIG.novios} — Inicio">
        ${corazonSVG(24)} <span>${CONFIG.monograma}</span>
      </a>
      <button class="nav__toggle" id="nav-toggle" aria-expanded="false" aria-controls="nav-lista" aria-label="Abrir menú">
        <span aria-hidden="true">☰</span>
      </button>
      <ul class="nav__lista" id="nav-lista">${enlaces}</ul>
    </nav>
  </header>`;

  // Menú móvil (hamburguesa)
  const toggle = document.getElementById('nav-toggle');
  const lista = document.getElementById('nav-lista');
  toggle.addEventListener('click', () => {
    const abierto = lista.classList.toggle('abierto');
    toggle.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    toggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  });
  // Cerrar al pulsar un enlace (en móvil)
  lista.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    lista.classList.remove('abierto');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

/* ---------- Inyectar PIE ---------- */
function montarPie() {
  const cont = document.getElementById('site-footer');
  if (!cont) return;
  const anio = new Date().getFullYear();
  cont.innerHTML = `
  <footer class="site-footer">
    <div class="marca">${corazonSVG(30)} ${CONFIG.monograma}</div>
    <p>${CONFIG.novios} · Tiempos de Amor · Wedding Fest</p>
    <p>17 OCT 2026  · Totana</p>
    <p>#TiemposDeAmor</p>
    <p style="opacity:.6">© ${anio} · Hecho con amor por José Manuel Mona</p>
  </footer>`;
}

/* ---------- CUENTA ATRÁS EN VIVO ---------- */
function iniciarCuentaAtras() {
  const cont = document.getElementById('cuenta-atras');
  if (!cont) return;
  const destino = new Date(CONFIG.fechaBoda).getTime();

  function pintar() {
    const ahora = Date.now();
    let dif = destino - ahora;

    if (dif <= 0) {
      cont.innerHTML = `<p class="cuenta--fin">¡Hoy es el gran día! 🎉 ¡Viva el Sí!</p>`;
      return true; // detener
    }
    const dia = Math.floor(dif / 86400000); dif -= dia * 86400000;
    const hor = Math.floor(dif / 3600000);  dif -= hor * 3600000;
    const min = Math.floor(dif / 60000);    dif -= min * 60000;
    const seg = Math.floor(dif / 1000);

    const item = (n, l) => `
      <div class="cuenta__item">
        <span class="cuenta__num">${String(n).padStart(2,'0')}</span>
        <span class="cuenta__label">${l}</span>
      </div>`;
    cont.innerHTML = item(dia,'Días') + item(hor,'Horas') + item(min,'Min') + item(seg,'Seg');
    return false;
  }

  if (pintar()) return;
  const id = setInterval(() => { if (pintar()) clearInterval(id); }, 1000);
}

/* ---------- COPIAR IBAN ---------- */
function iniciarCopiarIban() {
  const btn = document.getElementById('btn-copiar-iban');
  if (!btn) return;
  const aviso = document.getElementById('iban-copiado');

  btn.addEventListener('click', async () => {
    const iban = (btn.dataset.iban || '').replace(/\s+/g, '');
    try {
      await navigator.clipboard.writeText(iban);
      if (aviso) aviso.textContent = '✅ ¡IBAN copiado al portapapeles!';
    } catch (e) {
      // Método alternativo si clipboard no está disponible (p. ej. file://)
      const tmp = document.createElement('textarea');
      tmp.value = iban;
      document.body.appendChild(tmp);
      tmp.select();
      try { document.execCommand('copy'); if (aviso) aviso.textContent = '✅ ¡IBAN copiado!'; }
      catch (_) { if (aviso) aviso.textContent = 'Copia manualmente: ' + iban; }
      document.body.removeChild(tmp);
    }
    if (aviso) setTimeout(() => { aviso.textContent = ''; }, 4000);
  });
}

/* ---------- VÍDEO DE PORTADA (autoplay con sonido) ---------- */
function iniciarVideoPortada() {
  const video = document.getElementById('video-portada');
  if (!video) return;
  const btnSonido = document.getElementById('btn-sonido');

  const intentarConSonido = () => {
    video.muted = false;
    const intento = video.play();
    if (intento === undefined) return;
    intento.catch(() => {
      // La mayoría de navegadores bloquean el autoplay con sonido si el
      // usuario aún no ha interactuado con la página. En ese caso lo
      // reproducimos silenciado (para que al menos arranque solo) y
      // dejamos un botón para activar el sonido con un toque.
      video.muted = true;
      video.play().catch(() => {});
      if (btnSonido) btnSonido.hidden = false;
    });
  };

  if (btnSonido) {
    btnSonido.addEventListener('click', () => {
      video.muted = false;
      video.play();
      btnSonido.hidden = true;
    });
  }

  intentarConSonido();
}

/* ---------- Arranque ---------- */
document.addEventListener('DOMContentLoaded', () => {
  montarCabecera();
  montarPie();
  iniciarCuentaAtras();
  iniciarCopiarIban();
  iniciarVideoPortada();
});
