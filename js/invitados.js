/* ============================================================
   LISTA DE INVITADOS — Tiempos de Amor
   ------------------------------------------------------------
   Se carga como JS (y no por fetch del .json) para que la
   búsqueda funcione TAMBIÉN al abrir la web en local (file://),
   donde el navegador bloquea fetch por seguridad (CORS).

   - Cada "grupo" es una invitación. Las personas del mismo grupo
     se sientan juntas (ese id viaja al Google Sheet).
   - "confirmado: true" simula a alguien que YA confirmó.
   - Hay una copia legible en data/invitados.json; si editas aquí,
     mantén las dos igual (o edita solo este fichero).

   👉 EJEMPLO con 4 parejas de nombres inventados. Sustituye por
      tus invitados reales antes de publicar.
   ============================================================ */
window.INVITADOS = {
  grupos: [
    {
      id: "g1",
      miembros: [
        { nombre: "Lucía", apellidos: "Martín Pérez", confirmado: false },
        { nombre: "Pablo", apellidos: "Sánchez Ruiz", confirmado: false }
      ]
    },
    {
      id: "g2",
      miembros: [
        { nombre: "Carla", apellidos: "Gómez Ortega", confirmado: true },
        { nombre: "Diego", apellidos: "Navarro León", confirmado: false }
      ]
    },
    {
      id: "g3",
      miembros: [
        { nombre: "Marta", apellidos: "Ferrer Gil", confirmado: false },
        { nombre: "Javier", apellidos: "Romero Díaz", confirmado: false }
      ]
    },
    {
      id: "g4",
      miembros: [
        { nombre: "Elena", apellidos: "Castro Vidal", confirmado: false },
        { nombre: "Hugo", apellidos: "Moreno Serra", confirmado: false }
      ]
    }
  ]
};
