/* ============================================================
   AChETIQ - Loader «series-resueltas» (pages/recursos/series-resueltas.html)
   ------------------------------------------------------------
   Pinta una .card-materia por cada materia de
   data/series-resueltas.json que ya cuenta con series de
   ejercicios resueltas. Reutiliza la tarjeta de Apuntes
   Académicos y Simulaciones (assets/js/materia-card.js) con el
   CTA «Acceder a las series resueltas»: el destino es la página
   interna de la materia (misma pestaña), que lista las series en
   desplegables y enlaza la guía de ejercicios resueltos.

   ESQUEMA de data/series-resueltas.json
     [{ id, nombre, anio, imagen, href,
        series:[{ numero, titulo, ejercicios }] }]
   Para sumar una materia o una serie: ver docs/SERIES_RESUELTAS.md.
   ============================================================ */

'use strict';

import { registerLoader, registerSkeleton, createElement, safeHref } from './loaders.js';
import { anioDe, buildCover, buildBody, buildLinkedStatus } from './materia-card.js';

/* «Serie 4», «Series 4 y 5», «Series 1, 2 y 3». */
function rotuloSeries(series) {
  var nums = series
    .map(function (s) { return s && Number.isInteger(s.numero) ? s.numero : null; })
    .filter(function (n) { return n !== null; });
  if (!nums.length) return '';
  if (nums.length === 1) return 'Serie ' + nums[0];
  return 'Series ' + nums.slice(0, -1).join(', ') + ' y ' + nums[nums.length - 1];
}

registerLoader('series-resueltas', function (container, data) {
  var lista = (Array.isArray(data) ? data.slice() : []).sort(function (a, b) {
    return (anioDe(a) || 99) - (anioDe(b) || 99);
  });

  var grid = createElement('div', {
    class: 'grid-cards series-resueltas__grid'
  });

  lista.forEach(function (m) {
    var href = (typeof m.href === 'string' && m.href.trim())
      ? safeHref(window.AChETIQBase.resolve(m.href.trim()))
      : null;
    if (!href) return;
    var anio = anioDe(m);
    var rotulo = rotuloSeries(Array.isArray(m.series) ? m.series : []);
    var attrs = {
      href: href,
      'data-materia-id': m.id || '',
      /* El nombre accesible contiene el texto visible del CTA y de
         la materia (WCAG 2.5.3, etiqueta en el nombre). */
      'aria-label': 'Acceder a las series resueltas de ' + (m.nombre || '') +
        (rotulo ? ' (' + rotulo + ')' : '')
    };
    if (anio) attrs['data-anio'] = anio;

    var card = createElement('a', {
      class: 'card card-materia card-materia--enlace',
      attrs: attrs
    });
    card.appendChild(buildCover(m));
    card.appendChild(buildBody(anio, m.nombre || '', buildLinkedStatus('Acceder a las series resueltas', false)));
    grid.appendChild(card);
  });

  container.appendChild(grid);
});

/* Silueta de carga: una tarjeta, con la misma grilla del render
   real (sin salto de maquetación al llegar los datos). */
registerSkeleton('series-resueltas', function (container) {
  container.replaceChildren();
  container.setAttribute('data-loader-state', 'loading');
  var box = function (shape) {
    return createElement('span', { class: 'skeleton safe-motion ' + shape, attrs: { 'aria-hidden': 'true' } });
  };
  var grid = createElement('div', { class: 'grid-cards series-resueltas__grid', attrs: { 'aria-hidden': 'true' } });
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
  requestAnimationFrame(function () { status.textContent = 'Cargando series resueltas…'; });
});
