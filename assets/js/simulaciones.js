/* ============================================================
   AChETIQ - Loader «simulaciones» (pages/recursos/simulaciones.html)
   ------------------------------------------------------------
   Pinta una .card-materia por cada materia de
   data/simulaciones.json que ya cuenta con simuladores. Reutiliza
   la tarjeta de Apuntes Académicos (assets/js/materia-card.js)
   con el CTA «Acceder a los simuladores»: el destino es la página
   interna de la materia (misma pestaña), donde los simuladores se
   presentan en desplegables.

   ESQUEMA de data/simulaciones.json
     [{ id, nombre, anio, imagen, href, simuladores:[{ id, titulo }] }]
   Para sumar una materia: agregar su entrada y crear su página en
   pages/recursos/simulaciones/<id>.html (ver docs/SIMULADORES.md).
   ============================================================ */

'use strict';

import { registerLoader, registerSkeleton, createElement, safeHref } from './loaders.js';
import { anioDe, buildCover, buildBody, buildLinkedStatus } from './materia-card.js';

registerLoader('simulaciones', function (container, data) {
  var lista = (Array.isArray(data) ? data.slice() : []).sort(function (a, b) {
    return (anioDe(a) || 99) - (anioDe(b) || 99);
  });

  var grid = createElement('div', {
    class: 'grid-cards simulaciones__grid'
  });

  lista.forEach(function (m) {
    var href = (typeof m.href === 'string' && m.href.trim())
      ? safeHref(window.AChETIQBase.resolve(m.href.trim()))
      : null;
    if (!href) return;
    var anio = anioDe(m);
    var n = Array.isArray(m.simuladores) ? m.simuladores.length : 0;
    var attrs = {
      href: href,
      'data-materia-id': m.id || '',
      /* El nombre accesible contiene el texto visible del CTA y de
         la materia (WCAG 2.5.3, etiqueta en el nombre). */
      'aria-label': 'Acceder a los simuladores de ' + (m.nombre || '') +
        (n ? ' (' + n + (n === 1 ? ' simulador' : ' simuladores') + ')' : '')
    };
    if (anio) attrs['data-anio'] = anio;

    var card = createElement('a', {
      class: 'card card-materia card-materia--enlace',
      attrs: attrs
    });
    card.appendChild(buildCover(m));
    card.appendChild(buildBody(anio, m.nombre || '', buildLinkedStatus('Acceder a los simuladores', false)));
    grid.appendChild(card);
  });

  container.appendChild(grid);
});

/* Silueta de carga: una tarjeta, con la misma grilla del render
   real (sin salto de maquetación al llegar los datos). */
registerSkeleton('simulaciones', function (container) {
  container.replaceChildren();
  container.setAttribute('data-loader-state', 'loading');
  var box = function (shape) {
    return createElement('span', { class: 'skeleton safe-motion ' + shape, attrs: { 'aria-hidden': 'true' } });
  };
  var grid = createElement('div', { class: 'grid-cards simulaciones__grid', attrs: { 'aria-hidden': 'true' } });
  var card = createElement('div', { class: 'skeleton-card' });
  card.appendChild(box('skeleton-card__cover'));
  var body = createElement('div', { class: 'skeleton-card__body' });
  body.appendChild(box('skeleton-line skeleton-line--year'));
  body.appendChild(box('skeleton-line skeleton-line--title'));
  body.appendChild(box('skeleton-line skeleton-line--status'));
  card.appendChild(body);
  grid.appendChild(card);
  container.appendChild(grid);
  var status = createElement('p', { class: 'sr-only', attrs: { role: 'status', 'aria-live': 'polite' } });
  container.appendChild(status);
  requestAnimationFrame(function () { status.textContent = 'Cargando simuladores…'; });
});
