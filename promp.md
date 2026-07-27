# Prompt maestro para generar una web de boda

**Cómo usarlo:** rellena los campos entre corchetes `[ ]` del bloque “DATOS DE LA BODA” y luego copia y pega **todo** lo que hay debajo de la línea `=========== COPIA DESDE AQUÍ ===========` como primer mensaje a tu asistente de IA. Si no sabes algún dato, déjalo indicado (“por decidir”) y la IA lo dejará como editable.

---

=========== COPIA DESDE AQUÍ ===========

Actúa como un experto en diseño y desarrollo de páginas web para bodas. Quiero que generes una web **completa, profesional y lista para publicar**, con un estilo **sencillo y muy cuidado**. Trabaja en español (salvo que indique otro idioma abajo) y entrégame al final **todos los ficheros en un ZIP descargable**, correctamente organizados en carpetas y enlazados entre sí.

## DATOS DE LA BODA
- Nombres completos de los novios: Ana Rubio Cánovas y Adrián González Abellán
- Monograma / nombres cortos para la cabecera y el pie: [p. ej. “PJ & G” o los nombres completos]
- Idioma de la web: español
- Fecha y hora de la boda: sábado 17 de octubre de 2026, 12:30
- Fecha límite para confirmar asistencia: 15 de septiembre de 2026
- Lugar de la ceremonia (nombre, dirección y ciudad): Jardines del Restaurante Venta de la Rata, Totana
- Lugar del cóctel: Piscina del Restaurante Venta de la Rata, Totana
- Lugar de la celebración / banquete (nombre, dirección y ciudad): Salón del Restaurante Venta de la Rata, Totana
- Lugar de la fiesta: Recinto del festival Tiempos de Amor (se proporcionará ubicación más adelante)
- Número de cuenta (IBAN) y titulares para los regalos: Dejarlo por defecto y se modificará más adelante
- Estilo y temática + preferencias de color: Festival de música, con diseño alternativo con los colores proporcionados en la imagen adjunta de Tiempos de Amor. Puede servir como referencia la web de un festival oficial como Sonorama Ribera
- Tipografías preferidas (si tienes alguna): Tipo festivaleras pero que se entiendan para todos los públicos
- Foto o vídeo de portada disponible: Si, se incluirá en el sistema de ficheros generado (no en este prompt). Tener en cuenta que el video está grabado en vertical
- Dominio que usaré (si lo tengo): tiemposdeamor.com
- Detalles especiales a tener en cuenta: El evento no está pensado para que asistan niños (utilizar algo similar a: Como queremos que disfruteis al máximo del evento, os animamos a dejar a los peques con los abuelos, tieos o quien mejor los mime por unas horas)

## SECCIONES QUE DEBE INCLUIR
Genera estas secciones (quita o añade según lo que yo haya indicado arriba):
1. **Portada**: nombres, fecha y un espacio destacado para la foto o el vídeo de los novios (vertical) y mensaje de agradecimiento como cierre
2. **Información básica**: día y hora, **cuenta atrás** en vivo hasta la boda, lugar de la ceremonia e **itinerario** del día (p. ej. ceremonia, cóctel, comida, fiesta, tentempié) presentado como una línea temporal.
3. **Cómo llegar**: indicaciones a la ceremonia y a la celebración y enlaces a mapa de las dos ubicaciones.
4. **Regalo de boda**: un texto introductorio cálido y un cuadro con el número de cuenta y un botón para copiar el IBAN.
5. **Preguntas frecuentes** (4–5): incluye al menos “¿puedo llevar a mis hijos?” (boda con niños) y temas como código de vestimenta, fecha límite de confirmación y resolución de dudas para las diferentes ubicaciones.
6. **Formulario de asistencia** (ver requisitos técnicos más abajo).


## ESTILO Y DISEÑO
- Estética similar a la web de un festival nacional. Se ha utilizado como inspiración la web del festival Sonorama Ribera y el cartel de la gira de conciertos de Viva Suecia. Se pretende que sea una única columna de información por página, donde los colores seleccionados sean los mismos que el cartel adjunto
- En caso de tener que cargar alguna fuente. hazlo desde Google Fonts. **Evita los clichés** de plantilla genérica.
- **Responsive** y con **menú móvil** (hamburguesa).
- **Accesible**: etiquetas asociadas a los campos, foco visible por teclado, atributos ARIA donde aplique y respeto a `prefers-reduced-motion`.
- Detalles que aportan: favicon con un corazon rojo que incluya las letras TDAF y fondo amarillo (#F2BE1E), marcador elegante para la foto mientras no haya una real, cuenta atrás, itinerario en línea temporal, acordeón nativo para las FAQ y botón de copiar IBAN.
- Todos los textos deben quedar **redactados y listos**, pero claramente **editables**, con marcadores donde falten datos reales (nombres, fecha, lugares, IBAN, foto).
- Te proporciono una imagen (mosaico.jpeg) para que te sirva de referencia para poner en la web, ya que las invitaciones y el flayer donde se especifica el menú de la boda utiliza ese diseño.

## REQUISITOS TÉCNICOS
- Sitio **estático** (HTML + CSS + JS), pensado para alojarse **gratis en GitHub Pages**.
- **Estructura de carpetas** clara: páginas `.html` en la raíz, estilos en `css/`, scripts en `js/`, imágenes en `img/`. Usa una **hoja de estilos compartida** y JS compartido entre todas las páginas, con **cabecera (navegación) y pie consistentes** y **enlaces relativos** (para que funcione tanto en un “project site” de GitHub como abriéndolo en local).
- Incluye también: fichero `CNAME` con mi dominio (si lo he indicado), fichero `.nojekyll`, y un `README.md` con la lista de personalización y un resumen del despliegue.
- Tratar de poner en un único sitio aquellas partes de la web que sean comunes a las diferentes vistas (header, footer, nav, etc.).

## FORMULARIO DE ASISTENCIA (muy importante)
Quiero recoger las respuestas en **Google Sheets**, **sin usar iframe**. Implementa el formulario en HTML propio y envía los datos por `fetch` con **Google Apps Script**. ESte formulario estará articulado en dos pasos:
1. 2 cuadros de texto (nombre y apellidos) y botón buscar. Esto permitirá buscar en un fichero JSON (o el tipo de fichero más apropiado) para verificar si el invitado marcado está en dicho fichero.
2. Si no está la persona indicará algo similar a "No se ha podido encontrar el invitado/a, pruebe con otro nombre" (más sutil). Si el invitado está en la lista se pondrá su nombre y su primera letra de cada apellido por confidencialidad (ej. Adrián González Abellan - Adrián G. A.) y podrá confirmar tanto a él mismo como a su acompañante(s). Es importante que si una persona ya ha confirmado su asistencia le ponga un mensaje que diga algo del tipo "Sabemos que estás tan deseoso como nosotros de que llegue el gran día :). Tu asistencia ya ha sido confirmada". Por cada asistente deberá cofirmarse las intolerancias **alergias o intolerancias en selección múltiple** (ninguna, gluten/celiaquía, lácteos, lactosa, huevo, frutos secos, mariscos/crustáceos, pescado, soja, otro; con “ninguna” excluyente del resto. Añadir también observaciones (con older sugiriendo vegetariano/vegano, etc.), y “la canción que no puede faltar”. Añade un mensaje libre para los novios siempre visible.

Requisitos:
- El envío debe usar `FormData` con `fetch(..., { method: "POST", mode: "no-cors", body })` para evitar problemas de CORS con Apps Script, y debe añadir un `timestamp`.
- Incluye un **modo demostración**: mientras la constante `SCRIPT_URL` tenga un valor de ejemplo, el formulario valida y muestra el mensaje de éxito sin enviar nada (avisándolo). Maneja estados de “enviando”, éxito y error con mensajes claros.
- Entrégame también el **código de Google Apps Script** (`doPost` que vuelca en cada fila los datos de la persona que ha confirmado (nombre completo, ejemplo Adrián Gonzalez Abellan (no Adrián G. A.)) en una pestaña “Respuestas”, creando la cabecera la primera vez) **y un paso a paso** para: crear la hoja, pegar el script, desplegarlo como aplicación web (“Ejecutar como: yo”, “Quién tiene acceso: cualquier usuario”), copiar la URL `/exec` y pegarla en `SCRIPT_URL`.
- Por cada asistente debe quedar claro que tipo de intolerancia presenta en el Google Sheet y qué personas han confirmado juntas para ponerlas juntas también en la mesa
- Generar un JSON (o el tipo de fichero escogido) de ejemplo con 4 parejas invitadas (nombres inventados) para comprobar que el funcionamiento de la web es correcto, tal y como se ha especificado previamente.

## FORMA DE TRABAJAR
- Si te falta algún dato clave, pregúntame de forma concreta; 
- Prioriza un resultado **excelente, coherente y listo para usar**. Verifica que no haya enlaces internos rotos antes de entregar el ZIP.

=========== FIN DE LA COPIA ===========