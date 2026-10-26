/* ============================================================
   AChETIQ — Simuladores · desplegables de la página de materia
   (acordeon.js)
   ------------------------------------------------------------
   Entrada JS de pages/recursos/simulaciones/<materia>.html.

   Cada simulador vive en un <details class="sim"> nativo (abre y
   cierra sin JS; name="simuladores" lo vuelve exclusivo). Este
   módulo:
     · carga el simulador con import() dinámico la PRIMERA vez que
       se abre su desplegable (no pesa en la carga inicial de la
       página: presupuesto de JS, RENDIMIENTO_Presupuesto.md);
     · abre y enfoca el desplegable indicado en el #hash
       (enlaces profundos: …/operaciones-unitarias-ii#destilacion-binaria);
     · mantiene el #hash sincronizado con el desplegable abierto.
   ============================================================ */

'use strict';

var CARGADORES = {
  absorcion: function () { return import('./absorcion.js'); },
  destilacion: function () { return import('./destilacion.js'); }
};

function iniciar(det) {
  if (det.hasAttribute('data-sim-iniciado')) return;
  var host = det.querySelector('[data-sim-app]');
  var tipo = det.getAttribute('data-simulador');
  if (!host || !CARGADORES[tipo]) return;
  det.setAttribute('data-sim-iniciado', '');
  host.setAttribute('aria-busy', 'true');
  CARGADORES[tipo]()
    .then(function (m) { m.montar(host); })
    .catch(function (err) {
      console.error('[AChETIQ simuladores] No se pudo cargar «' + tipo + '»:', err);
      det.removeAttribute('data-sim-iniciado');
      var p = document.createElement('p');
      p.className = 'sim-app__error';
      p.setAttribute('role', 'alert');
      p.textContent = 'No se pudo cargar el simulador. Probá recargar la página.';
      host.replaceChildren(p);
    })
    .then(function () { host.removeAttribute('aria-busy'); });
}

function abrirDesdeHash(desplazar) {
  var id = decodeURIComponent(window.location.hash.slice(1));
  if (!id) return;
  var det = document.getElementById(id);
  if (!det || !det.matches('details.sim')) return;
  det.open = true;
  iniciar(det);
  if (desplazar) {
    var summary = det.querySelector('summary');
    if (summary) {
      summary.focus({ preventScroll: true });
      det.scrollIntoView({ block: 'start' });
    }
  }
}

function arrancar() {
  var lista = document.querySelectorAll('details.sim[data-simulador]');
  lista.forEach(function (det) {
    det.addEventListener('toggle', function () {
      if (det.open) {
        iniciar(det);
        if (window.location.hash !== '#' + det.id && window.history.replaceState) {
          window.history.replaceState(null, '', '#' + det.id);
        }
      }
    });
    if (det.open) iniciar(det);
  });
  abrirDesdeHash(true);
  window.addEventListener('hashchange', function () { abrirDesdeHash(true); });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', arrancar, { once: true });
} else {
  arrancar();
}
