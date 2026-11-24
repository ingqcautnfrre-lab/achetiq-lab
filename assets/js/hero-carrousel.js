/* AChETIQ — Slideshow de fondo del hero (hero-carrousel.js)
   ------------------------------------------------------------
   Cross-fade (desvanecido) entre fotografías institucionales a
   pantalla completa sobre el bloque .hero de index.html.

   · Vanilla JS, sin dependencias — coherente con el stack del sitio.
   · Orden cronológico INVERSO (del presente al pasado) definido en
     HERO_IMAGES.
   · 5 s visible por imagen; cross-fade de --transition-hero (~1 s,
     definido en CSS sobre .hero__slide).
   · Loop infinito: tras 2014 vuelve a 2026.
   · Respeta prefers-reduced-motion: muestra sólo la primera imagen.
   · Pausa cuando la pestaña no está visible.

   BEM: contenedor [data-hero-slideshow] (.hero__slideshow);
        cada capa .hero__slide; activa .hero__slide--active.
   ============================================================ */

(function () {
  'use strict';

  /* Directorio de imágenes, relativo a index.html. */
  var HERO_BASE = 'assets/img/hero/';

  /* Orden cronológico INVERSO (presente → pasado) — bases de los derivados WebP generados
     a partir de los originales de assets/img/hero/ (S6 — rendimiento:
     los JPG originales, 0,5–3,7 MB c/u, quedan fuera del peso de
     página). Cada base existe en 800 / 1280 / 1920 px de ancho
     (sufijo «-<ancho>.webp»). El primer cuadro está precargado desde
     el <head> de index.html con fetchpriority="high" (es el elemento
     LCP): si se cambia el orden o los anchos aquí, actualizar también
     ese <link rel="preload"> (imagesrcset/imagesizes). */
  var HERO_IMAGES = [
    '2026',   /* CoNEIQ 2026 */
    '2025',
    '2020',
    '2018',
    '2015-2',
    '2014'
  ];

  var HOLD_MS = 5000;   /* tiempo visible por imagen */

  /* Variante responsive (S7): se elige UNA vez al iniciar, según el
     viewport — 800w hasta 768 px, 1280w hasta 1280 px, 1920w el
     resto. Debe coincidir con el imagesizes del <link rel="preload">
     de index.html para que el cuadro precargado sea exactamente el
     que se usa (sin doble descarga). No se re-evalúa en resize: un
     cambio de variante a mitad de rotación re-descargaría cuadros ya
     vistos sin beneficio visual (background-size: cover absorbe la
     diferencia). */
  var HERO_WIDTH = (function () {
    if (window.matchMedia) {
      if (window.matchMedia('(max-width: 768px)').matches) return '800';
      if (window.matchMedia('(max-width: 1280px)').matches) return '1280';
    }
    return '1920';
  })();

  var stage = document.querySelector('[data-hero-slideshow]');
  if (!stage || HERO_IMAGES.length === 0) return;

  function setBackground(slide, base) {
    slide.style.backgroundImage =
      "url('" + HERO_BASE + base + '-' + HERO_WIDTH + ".webp')";
  }

  /* Construir las capas en orden e inyectarlas en el contenedor.
     Carga programada (S6): sólo el primer cuadro (visible, LCP)
     recibe su background-image de inmediato. Los demás se cargan
     UNO POR DELANTE de la rotación (ver prefetchNext): el cuadro
     i+1 se pide al mostrarse el cuadro i, con HOLD_MS (5 s) de
     margen de descarga. Así el primer render no compite por ancho
     de banda y solo se descarga lo que se llega a ver. */
  var slides = HERO_IMAGES.map(function (base, i) {
    var slide = document.createElement('div');
    slide.className = 'hero__slide';
    if (i === 0) {
      setBackground(slide, base);
      slide.classList.add('hero__slide--active');
    }
    stage.appendChild(slide);
    return slide;
  });

  /* El primer cuadro lo pinta el CSS sobre [data-hero-slideshow] para que
     sea el elemento LCP sin esperar a este script diferido (headers.css
     §HERO). Ya construido el slide[0] idéntico ENCIMA (mismo archivo,
     opacity 1), se limpia ese fondo del contenedor para que los
     cross-fades posteriores compongan sobre la base oscura del .hero, no
     sobre el cuadro 1. slide[0] cubre el contenedor con el mismo pixel:
     la limpieza es invisible. */
  stage.style.backgroundImage = 'none';

  /* Con una sola imagen no hay nada que rotar. */
  if (slides.length < 2) return;

  /* Movimiento reducido: imagen fija, sin temporizador. Salir antes
     de programar la carga diferida también evita descargar cuadros
     que nunca se mostrarían. */
  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  /* Asigna el background del cuadro i si aún no lo tiene (la
     asignación dispara la descarga). Idempotente. */
  function prefetchSlide(i) {
    if (slides[i] && !slides[i].style.backgroundImage) {
      setBackground(slides[i], HERO_IMAGES[i]);
    }
  }

  /* El siguiente cuadro de la rotación se pide con un ciclo entero
     de anticipación. El primero (cuadro 2) espera a window.load
     para no competir con los recursos críticos del primer render. */
  function prefetchNext() {
    prefetchSlide((current + 1) % slides.length);
  }

  if (document.readyState === 'complete') {
    prefetchNext();
  } else {
    window.addEventListener('load', prefetchNext, { once: true });
  }

  var current = 0;
  var timer = null;

  function show(next) {
    slides[current].classList.remove('hero__slide--active');
    slides[next].classList.add('hero__slide--active');
    current = next;
    prefetchNext();
  }

  function advance() {
    show((current + 1) % slides.length);   /* loop infinito */
  }

  function start() {
    if (!timer) timer = window.setInterval(advance, HOLD_MS);
  }

  function stop() {
    if (timer) { window.clearInterval(timer); timer = null; }
  }

  /* Pausar/reanudar según visibilidad de la pestaña: ahorra trabajo
     mientras el documento no se ve (no es un control de usuario). */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else start();
  });

  start();
})();
