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
│   ├── invitados.js    LISTA DE INVITADOS (se edita aquí) — usada por la búsqueda
│   └── rsvp.js         Lógica del formulario y envío a Google Sheets
├── data/
│   └── invitados.json  Copia legible de la lista (referencia/edición cómoda)
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
6. **Lista de invitados** → `js/invitados.js` (es el fichero que usa la web).
   Mantén `data/invitados.json` igual si quieres una copia ordenada. Cada `grupo` es
   una invitación (se sientan juntos). Pon `confirmado: true` solo para simular a
   alguien que ya confirmó.
7. **Formulario → Google Sheets** → pega tu URL en `SCRIPT_URL` (`js/rsvp.js`).
   Mientras contenga `PEGA_AQUI`, la web está en **modo demostración** (valida y
   enseña el resultado, pero no envía nada).

---

## 📝 Formulario de asistencia (cómo funciona)

- **Paso 1:** el invitado escribe nombre y apellidos y pulsa *Buscar*. Se comprueba
  contra `js/invitados.js`.
  - Si **no está**: mensaje sutil "No hemos podido encontrar a ese invitado/a...".
  - Si **está**: se muestra su nombre anonimizado (p. ej. *Adrián G. A.*) por
    confidencialidad y aparecen las tarjetas de su grupo (él y su acompañante).
  - Si esa persona **ya confirmó**: mensaje "Sabemos que estás tan deseoso/a como
    nosotros de que llegue el gran día :). Tu asistencia ya ha sido confirmada."
- **Paso 2:** por cada asistente se indica si asiste, sus **alergias/intolerancias**
  (selección múltiple; *Ninguna* es excluyente), **observaciones** (sugerencia de
  vegetariano/vegano) y **la canción que no puede faltar**. Hay un **mensaje libre
  para los novios** siempre visible.
- **Envío:** `FormData` + `fetch(..., { method: "POST", mode: "no-cors" })` con un
  `timestamp`. Se escribe **una fila por asistente** en la pestaña *Respuestas*, con
  el **nombre completo** (no anonimizado) y el **Grupo (mesa)** para sentar juntos a
  quienes confirmaron juntos.

### Activar el backend (Google Sheets)
Sigue el paso a paso que hay al final de **`apps-script.gs`** (crear hoja, pegar el
script, desplegar como *Aplicación web* con "Ejecutar como: yo" y "Quién tiene acceso:
cualquier usuario", copiar la URL `/exec` y pegarla en `SCRIPT_URL`).

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
   Marca *Enforce HTTPS* cuando esté disponible.

### Probar en local
Abre `index.html` en el navegador (doble clic). Funciona todo, incluida la búsqueda de
invitados y el modo demo del formulario. *(El "copiar IBAN" y el envío real dan su
mejor versión al estar publicado en `https://`.)*

---

Hecho con 💛 para Ana &amp; Adrián. ¡Viva el Sí!
