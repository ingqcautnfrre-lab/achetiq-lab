/* ============================================================
   AChETIQ — Series Resueltas: menú «Descargar» de cada ejercicio
   (series-descargas.js). Lo enlazan las páginas de materia de
   pages/recursos/series-resueltas/.

   El menú es un <details> nativo (name="descarga-ejercicio": abrir
   uno cierra el anterior) y funciona sin JavaScript. Este script
   solo agrega el cierre esperable de un menú: al hacer clic fuera,
   con Esc (el foco vuelve al botón) y al elegir un formato.

   Sin dependencias externas.
   ============================================================ */

(function () {
  'use strict';

  var SEL = 'details.serie-ejercicios__descarga';

  function cerrarOtros(actual) {
    document.querySelectorAll(SEL + '[open]').forEach(function (d) {
      if (d !== actual) d.open = false;
    });
  }

  document.addEventListener('click', function (e) {
    var menu = e.target.closest(SEL);
    cerrarOtros(menu);
    if (menu && e.target.closest('a[download]')) {
      // La descarga sigue su curso; el menú se cierra después del clic.
      window.setTimeout(function () { menu.open = false; }, 0);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var activo = document.activeElement;
    var menu = activo && activo.closest ? activo.closest(SEL + '[open]') : null;
    if (!menu) { cerrarOtros(null); return; }
    menu.open = false;
    menu.querySelector('summary').focus();
  });
})();
