/* ============================================================
   AChETIQ - Piezas compartidas de la tarjeta de materia
   (materia-card.js)
   ------------------------------------------------------------
   Constructores de .card-materia comunes a las vistas que listan
   materias del Plan 2023:
     · Apuntes Académicos  (assets/js/apuntes.js) — CTA «Acceder
       al repositorio», enlace externo a la carpeta de Drive.
     · Simulaciones        (assets/js/simulaciones.js) — CTA
       «Acceder a los simuladores», enlace interno.
   Extraídos de apuntes.js sin cambios de markup: el aspecto de la
   tarjeta lo gobierna assets/css/cards.css §4.9.

   REGLAS DE SEGURIDAD (FASE_1 §7.2): todo texto entra por
   textContent (createElement) y toda ruta pasa por safeHref().
   ============================================================ */

'use strict';

import { createElement, safeHref, coverSkeleton } from './loaders.js';

export var YEAR_LABEL = {
  1: '1º año',
  2: '2º año',
  3: '3º año',
  4: '4º año',
  5: '5º año'
};

/* Año válido (1–5) o null. */
export function anioDe(m) {
  return (m && Number.isInteger(m.anio) && m.anio >= 1 && m.anio <= 5) ? m.anio : null;
}

export function buildCover(m) {
  var cover = createElement('div', {
    class: 'card-materia__cover',
    attrs: { 'aria-hidden': 'true' }
  });

  /* Imagen representativa de la materia (campo `imagen`). Contrato
     16:9 (1280×720): width/height explícitos reservan el alto ANTES
     de cargar (CLS < 0,1 — RENDIMIENTO_Presupuesto.md). El color
     por año del cover queda de fondo como fallback mientras carga o
     si falta la imagen. La imagen es decorativa (el nombre va en el
     <h3>): alt vacío bajo el cover ya marcado aria-hidden. La ruta
     pasa por safeHref(). */
  var rawImg = (m && typeof m.imagen === 'string') ? m.imagen.trim() : '';
  var imgSrc = rawImg ? safeHref(window.AChETIQBase.resolve(rawImg)) : null;
  if (imgSrc) {
    var img = createElement('img', {
      attrs: {
        src: imgSrc, alt: '', width: '1280', height: '720',
        loading: 'lazy', decoding: 'async'
      }
    });
    /* Mientras la imagen (lazy) baja, un esqueleto gris con barrido
       cubre la caja del cover; se retira al resolverse la imagen. El
       estilo vive en assets/css/cards.css (.card-materia__cover-skeleton). */
    coverSkeleton(cover, img);
    cover.appendChild(img);
  }
  return cover;
}

export function buildBody(anio, nombre, statusNode) {
  var body = createElement('div', { class: 'card-materia__body' });
  if (anio) {
    body.appendChild(createElement('p', {
      class: 'card-materia__year caption',
      text: YEAR_LABEL[anio]
    }));
  }
  body.appendChild(createElement('h3', {
    class: 'card-materia__name',
    text: nombre
  }));
  body.appendChild(statusNode);
  return body;
}

/* Estado de la variante enlazada: afordancia editorial E05 —rótulo
   en cobalto + flecha (→) que avanza al hover/foco de la tarjeta—.
   `externo` agrega el refuerzo sr-only de pestaña nueva. El glifo
   flecha es decorativo (aria-hidden). */
export function buildLinkedStatus(texto, externo) {
  var status = createElement('p', {
    class: 'card-materia__status card-materia__status--link'
  });
  status.appendChild(createElement('span', {
    class: 'card-materia__cta',
    text: texto
  }));
  status.appendChild(createElement('span', {
    class: 'card-materia__arrow',
    text: '→',
    attrs: { 'aria-hidden': 'true' }
  }));
  if (externo) {
    status.appendChild(createElement('span', {
      class: 'sr-only',
      text: ' (se abre en una pestaña nueva)'
    }));
  }
  return status;
}
