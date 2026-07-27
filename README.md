# Tiempos de Amor — Wedding Fest 💛

Web de boda de **Ana Rubio Cánovas y Adrián González Abellán** · Totana · 17 OCT 2026.
Sitio **estático** (HTML + CSS + JS) con estética de cartel de festival, pensado para
alojarse **gratis en GitHub Pages**.

---

## 🗂️ Estructura

```
tiemposdeamor/
├── index.html          Portada (nombres, fecha, foto/vídeo, agradecimiento)
├── info.html           Info básica: cuándo, cuenta atrás, itinerario, sin niños
├── como-llegar.html    Mapas e indicaciones (ceremonia/banquete y fiesta)
├── regalo.html         Texto + IBAN con botón "copiar"
├── faq.html            Preguntas frecuentes (acordeón nativo)
├── confirmar.html      Formulario de asistencia en 2 pasos
├── css/
│   └── styles.css      Hoja de estilos ÚNICA compartida por todas las páginas
├── js/
│   ├── main.js         Cabecera + nav + pie (compartidos), menú móvil, cuenta atrás, copiar IBAN
│   ├── invitados.js    Lista de invitados de DEMOSTRACIÓN (la real vive en Google Sheets)
│   └── rsvp.js         Búsqueda (lee la Sheet en vivo) + formulario + envío a Google Sheets
├── data/
│   └── invitados.json  Copia legible de la lista de demostración
├── img/
│   ├── favicon.svg     Corazón rojo "TDAF" sobre amarillo (ya hecho)
│   └── LEEME.txt       Dónde poner tu foto/vídeo y el mosaico
├── apps-script.gs      Código del backend (Google Apps Script) + instrucciones
├── CNAME               Dominio personalizado (tiemposdeamor.com)
├── .nojekyll           Evita el procesado Jekyll en GitHub Pages
└── README.md           Este archivo
```

> La **cabecera, la navegación y el pie** se generan una sola vez en `js/main.js`
> y se inyectan en todas las páginas. Así solo se editan en un sitio.
> Todos los enlaces son **relativos**: la web funciona igual abriéndola en local
> o publicada en GitHub Pages.

---

## ✅ Lista de personalización (qué editar)

1. **Fecha/hora y textos globales** → `js/main.js`, objeto `CONFIG` (fecha de la
   cuenta atrás, monograma `TDAF`, nombres, dominio, enlaces del menú).
2. **Foto o vídeo de portada (vertical)** → añade `img/portada.mp4`
   (+ `img/portada-poster.jpg`) o `img/portada.jpg` y sigue `img/LEEME.txt`.
   En `index.html`, descomenta el bloque de vídeo/imagen y borra el marcador.
3. **Mosaico del cartel** → añade `img/mosaico.jpeg` y descomenta su `<img>` en
   `index.html`.
4. **IBAN y titulares** → `regalo.html`: cambia el texto del `#iban-valor` **y** el
   atributo `data-iban` del botón (los dos deben coincidir).
5. **Dirección exacta de la ceremonia y ubicación de la fiesta** → `como-llegar.html`
   (hay marcadores `[...]`). Actualiza también el enlace de Google Maps de la fiesta
   cuando tengas la ubicación.
6. **Lista de invitados** → se edita en la **Google Sheet** (pestaña "Invitados"),
   no en el repo. `js/invitados.js` / `data/invitados.json` son solo datos de
   ejemplo para el modo demostración (mientras no tengas `SCRIPT_URL` configurada).
7. **Formulario → Google Sheets** → pega tu URL en `SCRIPT_URL` (`js/rsvp.js`).
   Mientras contenga `PEGA_AQUI`, la web está en **modo demostración** (busca en la
   lista de ejemplo y valida/enseña el resultado, pero no lee ni envía nada real).

---

## 📝 Formulario de asistencia (cómo funciona)

La lista de invitados vive en una **Google Sheet con dos pestañas** (ver
`apps-script.gs` para el paso a paso completo de instalación):

- **"Invitados"** (`Grupo | Nombre | Apellidos | Confirmación`): la fuente de
  verdad. La edita el usuario a mano para dar de alta invitados; la columna
  "Confirmación" la rellena la propia web sola (✅ si asiste, ❌ si no) en cuanto
  esa persona responde, y a partir de ahí queda bloqueada (no puede volver a
  confirmar). "Grupo" agrupa a quien se sienta junto (p. ej. "Familia Pérez").
- **"Confirmados"**: solo las personas que han dicho que **sí** asisten, una
  fila por persona, con alergias, observaciones, canción y el mensaje a los
  novios. Quien dice que no, no aparece aquí (solo se marca la ❌ en Invitados).

Flujo del formulario:

- **Paso 1:** al cargar la página, la web pide la pestaña "Invitados" al Apps
  Script (`fetch` GET) y arma un índice de búsqueda en el navegador. El
  invitado escribe nombre y apellidos y pulsa *Buscar*.
  - Si **no está**: mensaje sutil "No hemos podido encontrar a ese invitado/a...".
  - Si **está y no ha respondido**: se muestra su nombre anonimizado (p. ej.
    *Adrián G. A.*) por confidencialidad y aparecen las tarjetas de su grupo.
  - Si esa persona **ya confirmó que sí**: "Sabemos que estás tan deseoso/a
    como nosotros de que llegue el gran día :). Tu asistencia ya ha sido
    confirmada."
  - Si esa persona **ya dijo que no**: se le avisa de que ya respondió, sin
    poder volver a enviar el formulario (puede escribir un correo si cambia
    de idea).
- **Paso 2:** por cada asistente se indica si asiste, sus **alergias/intolerancias**
  (selección múltiple; *Ninguna* es excluyente), **observaciones** (sugerencia de
  vegetariano/vegano) y **la canción que no puede faltar**. Hay un **mensaje libre
  para los novios** siempre visible.
- **Envío:** `FormData` + `fetch(..., { method: "POST", mode: "no-cors" })`. El
  Apps Script marca ✅/❌ en "Invitados" para cada asistente y, si dijo que sí,
  añade también su fila en "Confirmados".

### Activar el backend (Google Sheets)
Sigue el paso a paso que hay al final de **`apps-script.gs`** (crear la hoja con
las pestañas "Invitados" y "Confirmados", rellenar tu lista real en "Invitados",
pegar el script, desplegar como *Aplicación web* con "Ejecutar como: yo" y
"Quién tiene acceso: cualquier usuario", copiar la URL `/exec` y pegarla en
`SCRIPT_URL`). Hasta que no lo hagas, la web funciona en **modo demostración**
con la lista de ejemplo de `js/invitados.js`.

---

## 🚀 Desplegar en GitHub Pages (resumen)

1. Crea un repositorio en GitHub y **sube todos estos ficheros** (incluidos `CNAME` y
   `.nojekyll`) a la raíz.
2. En el repo: **Settings → Pages** → *Build and deployment* → *Source*: **Deploy from
   a branch** → rama `main` y carpeta `/ (root)` → *Save*.
3. Espera 1–2 minutos. Tu web estará en `https://<usuario>.github.io/<repo>/`.
4. **Dominio propio (`tiemposdeamor.com`):** el fichero `CNAME` ya lo configura en
   Pages. En tu proveedor de dominio crea los registros DNS de GitHub Pages
   (registros `A` a las IP de GitHub y/o un `CNAME` `www` → `<usuario>.github.io`).

### 🔒 Forzar siempre HTTPS (nunca HTTP)
1. **Imprescindible:** en el repo, **Settings → Pages**, marca la casilla
   **"Enforce HTTPS"** en cuanto esté disponible (tarda unos minutos tras
   configurar el dominio en emitirse el certificado). Esto hace que GitHub
   redirija automáticamente cualquier petición HTTP a HTTPS a nivel de
   servidor — es el mecanismo real y el único que no se puede saltar.
2. Como refuerzo (por si alguien llega por HTTP antes de que el punto
   anterior esté activo, o mientras propaga el DNS), la web ya incluye en
   todas las páginas:
   - Un pequeño script al principio de `<head>` que redirige a HTTPS al
     instante si detecta `http:`.
   - Una etiqueta `Content-Security-Policy: upgrade-insecure-requests`,
     para que el navegador cargue en HTTPS cualquier recurso aunque algo
     se cuele apuntando a `http://`.

   Estas dos capas son solo un cinturón de seguridad extra: **el paso 1
   (Enforce HTTPS en GitHub Pages) es el que de verdad importa.**

### Probar en local
Abre `index.html` en el navegador (doble clic). Funciona todo, incluida la búsqueda de
invitados y el modo demo del formulario. *(El "copiar IBAN" y el envío real dan su
mejor versión al estar publicado en `https://`.)*

---

Hecho con 💛 para Ana &amp; Adrián. ¡Viva el Sí!
