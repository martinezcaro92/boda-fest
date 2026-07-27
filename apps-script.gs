/**
 * ============================================================
 *  TIEMPOS DE AMOR — Google Apps Script (backend del RSVP)
 * ------------------------------------------------------------
 *  Recibe las confirmaciones del formulario de la web y las
 *  vuelca en la pestaña "Respuestas", UNA FILA POR ASISTENTE.
 *  Así se ve claramente qué intolerancia tiene cada persona y,
 *  gracias a la columna "Grupo (mesa)", qué invitados han
 *  confirmado juntos (para sentarlos en la misma mesa).
 *
 *  Pasos de instalación al final de este archivo.
 * ============================================================
 */

var NOMBRE_HOJA = 'Respuestas';

var CABECERAS = [
  'Marca temporal',
  'Grupo (mesa)',
  'Nombre completo',
  '¿Asiste?',
  'Alergias / intolerancias',
  'Observaciones',
  'Canción imprescindible',
  'Mensaje a los novios'
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // evita escrituras simultáneas
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var hoja = ss.getSheetByName(NOMBRE_HOJA);
    if (!hoja) {
      hoja = ss.insertSheet(NOMBRE_HOJA);
    }
    // Crear cabecera la primera vez
    if (hoja.getLastRow() === 0) {
      hoja.appendRow(CABECERAS);
      hoja.getRange(1, 1, 1, CABECERAS.length).setFontWeight('bold');
      hoja.setFrozenRows(1);
    }

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

    // Una fila por cada persona confirmada (nombre COMPLETO, no anonimizado)
    asistentes.forEach(function (a) {
      var alergias = Array.isArray(a.alergias) ? a.alergias.join(', ') : (a.alergias || '');
      hoja.appendRow([
        timestamp,
        grupoId,
        a.nombreCompleto || '',
        a.asiste || '',
        alergias,
        a.observaciones || '',
        a.cancion || '',
        mensajeNovios
      ]);
    });

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, filas: asistentes.length }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/** Opcional: comprobar en el navegador que el despliegue está vivo. */
function doGet() {
  return ContentService
    .createTextOutput('Tiempos de Amor RSVP: el backend funciona. Usa POST para enviar datos.')
    .setMimeType(ContentService.MimeType.TEXT);
}

/* ============================================================
   CÓMO INSTALARLO (paso a paso)
   ------------------------------------------------------------
   1. Crea una hoja de cálculo nueva en Google Sheets
      (sheets.new). Ponle el nombre que quieras, p. ej.
      "Confirmaciones Tiempos de Amor".

   2. En el menú superior: Extensiones → Apps Script.
      Se abre el editor de scripts vinculado a esa hoja.

   3. Borra el código de ejemplo y PEGA todo el contenido de
      este archivo (apps-script.gs). Guarda (icono de disquete).

   4. Despliega como aplicación web:
      - Botón azul "Implementar" (arriba a la derecha)
        → "Nueva implementación".
      - Tipo (rueda dentada) → "Aplicación web".
      - Descripción: "RSVP boda".
      - "Ejecutar como": Yo (tu cuenta).
      - "Quién tiene acceso": Cualquier usuario.
      - "Implementar". Autoriza los permisos que te pida
        (elige tu cuenta → Configuración avanzada →
        "Ir a (nombre) (no seguro)" → Permitir).

   5. Copia la URL que termina en /exec
      (algo como https://script.google.com/macros/s/AKfy.../exec).

   6. Pega esa URL en la constante SCRIPT_URL del fichero
      js/rsvp.js de la web, sustituyendo el valor de ejemplo.
      En cuanto dejes de tener "PEGA_AQUI" en la URL, la web
      sale del modo demostración y empieza a enviar de verdad.

   7. (Al hacer cambios en el script) usa "Implementar →
      Gestionar implementaciones → editar (lápiz) → Versión:
      Nueva versión" para que los cambios surtan efecto.

   NOTA: la web envía con fetch en modo "no-cors", así que el
   navegador no lee la respuesta (es normal y esperado). Las
   filas aparecerán igualmente en la pestaña "Respuestas".
   ============================================================ */
