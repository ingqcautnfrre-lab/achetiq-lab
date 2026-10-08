/* ============================================================
   AChETIQ — Simuladores · armazón común (armazon.js)
   ------------------------------------------------------------
   Arma la composición compartida por los dos simuladores y
   devuelve las referencias que cada uno completa:

     ┌ controles ┐ ┌ figura ──────────────────────────────┐
     │ fieldsets │ │ capas (chips) · paso a paso · vista  │
     │   …       │ │ diagrama SVG                         │
     │           │ │ barra «paso a paso» + narración      │
     │           │ │ resultado principal + avisos         │
     └───────────┘ └──────────────────────────────────────┘
     ┌ ficha de resultados ─────────────────────────────────┐
     ┌ pestañas: Etapas · Cómo leer el diagrama ────────────┐
     ┌ exportación: SVG · CSV · imprimir ───────────────────┐

   La lógica de cada simulador vive en destilacion.js y
   absorcion.js; acá solo hay estructura, la leyenda-interruptor
   de capas y el control del modo paso a paso.
   ============================================================ */

'use strict';

import { el, elNotacion, boton, pestanas, anunciador } from './ui.js';
import { crearGrafico } from './grafico.js';

var NS = 'http://www.w3.org/2000/svg';

/* Muestra de trazo para cada chip de la leyenda: una línea corta
   con la misma clase que la serie (color + patrón de trazo). */
function muestra(clase) {
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'sim-chip__muestra');
  svg.setAttribute('viewBox', '0 0 28 12');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  var l = document.createElementNS(NS, 'path');
  l.setAttribute('d', clase === 'etapas' || clase === 'total' ? 'M2 2H14V10H26' : 'M2 9L26 3');
  l.setAttribute('class', 'sim-svg__serie sim-svg__' + clase);
  svg.appendChild(l);
  return svg;
}

export function crearArmazon(raiz, cfg) {
  raiz.replaceChildren();
  raiz.classList.add('sim-app');
  raiz.setAttribute('data-estado', 'listo');

  /* ── Columna de controles ── */
  var controles = el('form', 'sim-app__controles', null, {
    'aria-labelledby': cfg.id + '-param', novalidate: ''
  });
  controles.addEventListener('submit', function (ev) { ev.preventDefault(); });
  controles.appendChild(el('h3', 'sim-app__titulo', 'Parámetros de diseño', { id: cfg.id + '-param' }));

  /* ── Figura ── */
  var escenario = el('div', 'sim-app__escenario');
  var figura = el('figure', 'sim-figura', null, { 'aria-labelledby': cfg.id + '-fig' });
  var barra = el('div', 'sim-figura__barra');
  var leyenda = el('div', 'sim-leyenda', null, { role: 'group', 'aria-label': 'Capas visibles del diagrama' });
  barra.appendChild(leyenda);

  var plotHost = el('div', 'sim-plot');
  var bajoPlot = el('div', 'sim-figura__bajo');
  var ayudaZoom = el('p', 'sim-plot__ayuda', 'Arrastrá sobre el diagrama para ampliar una zona; doble clic para volver a la vista completa.');
  var utiles = el('div', 'sim-figura__utiles');
  bajoPlot.appendChild(ayudaZoom);
  bajoPlot.appendChild(utiles);

  var pasoBarra = el('div', 'sim-paso', null, { hidden: '' });
  var pasoCtrl = el('div', 'sim-paso__controles');
  var pasoTexto = el('p', 'sim-paso__texto', null, { 'aria-live': 'polite' });

  var pie = el('div', 'sim-figura__pie');
  pie.appendChild(el('span', 'sr-only', cfg.titulo + '. ', { id: cfg.id + '-fig' }));
  var resultado = el('p', 'sim-resultado');
  var avisos = el('div', 'sim-avisos', null, { hidden: '' });
  pie.appendChild(resultado);
  pie.appendChild(avisos);

  /* Columna lateral (≥ 1360 px): resultado + paso a paso junto al
     diagrama; en anchos menores se apila debajo. */
  var lado = el('div', 'sim-figura__lado');
  lado.appendChild(pie);
  lado.appendChild(pasoBarra);

  figura.appendChild(barra);
  figura.appendChild(plotHost);
  figura.appendChild(bajoPlot);
  figura.appendChild(lado);
  escenario.appendChild(figura);

  /* ── Ficha y pestañas ── */
  var detalle = el('div', 'sim-app__detalle');
  var secFicha = el('section', 'sim-bloque', null, { 'aria-labelledby': cfg.id + '-ficha' });
  secFicha.appendChild(el('h3', 'sim-bloque__titulo', 'Ficha de resultados', { id: cfg.id + '-ficha' }));
  var fichaDl = el('dl', 'sim-ficha');
  secFicha.appendChild(fichaDl);

  var tablaEnvoltura = el('div', 'sim-tabla__marco', null, { tabindex: '0', role: 'region', 'aria-label': 'Tabla de etapas' });
  var tabla = el('table', 'sim-tabla');
  var caption = el('caption', 'sr-only', 'Composiciones por etapa');
  var thead = el('thead');
  var tbody = el('tbody');
  tabla.appendChild(caption);
  tabla.appendChild(thead);
  tabla.appendChild(tbody);
  tablaEnvoltura.appendChild(tabla);
  var panelEtapas = el('div');
  var notaTabla = el('p', 'sim-tabla__nota');
  panelEtapas.appendChild(tablaEnvoltura);
  panelEtapas.appendChild(notaTabla);

  var panelLectura = el('div', 'sim-lectura');
  var tabs = pestanas([
    { titulo: 'Etapas', panel: panelEtapas },
    { titulo: 'Cómo leer el diagrama', panel: panelLectura }
  ]);

  var herramientas = el('div', 'sim-herramientas', null, { role: 'group', 'aria-label': 'Exportar resultados' });

  detalle.appendChild(secFicha);
  detalle.appendChild(tabs.nodo);
  detalle.appendChild(herramientas);

  raiz.appendChild(controles);
  raiz.appendChild(escenario);
  raiz.appendChild(detalle);

  var anunciar = anunciador(raiz);

  /* ── Leyenda-interruptor de capas ── */
  var visibles = {};
  var chips = {};
  cfg.capas.forEach(function (c) {
    visibles[c.id] = c.activa !== false;
    var b = el('button', 'sim-chip', null, { type: 'button', 'aria-pressed': visibles[c.id] ? 'true' : 'false' });
    b.appendChild(muestra(c.clase));
    b.appendChild(elNotacion('span', 'sim-chip__texto', c.etiqueta));
    b.addEventListener('click', function () {
      visibles[c.id] = !visibles[c.id];
      b.setAttribute('aria-pressed', visibles[c.id] ? 'true' : 'false');
      cfg.alCambiarCapas();
    });
    chips[c.id] = b;
    leyenda.appendChild(b);
  });

  /* ── Gráfico ── */
  var filas = {};
  var grafico = crearGrafico(plotHost, {
    onEtapa: function (n) { resaltarFila(n); },
    onZoom: function (activo) { btnVista.hidden = !activo; }
  });

  function resaltarFila(n) {
    Object.keys(filas).forEach(function (k) {
      filas[k].classList.toggle('is-activa', Number(k) === n);
    });
  }

  var btnVista = boton('Restablecer vista', 'sim-boton--sutil', function () { grafico.restablecerVista(); }, { hidden: '' });

  /* ── Paso a paso ── */
  var paso = { activo: false, k: 1, total: 0 };
  var btnPaso = boton('Paso a paso', 'sim-boton--toggle', function () {
    paso.activo = !paso.activo;
    btnPaso.setAttribute('aria-pressed', paso.activo ? 'true' : 'false');
    pasoBarra.hidden = !paso.activo;
    paso.k = 1;
    cfg.alCambiarPaso();
  }, { 'aria-pressed': 'false' });
  utiles.appendChild(btnPaso);
  utiles.appendChild(btnVista);

  var btnAnt = boton('← Anterior', 'sim-boton--sutil', function () { mover(-1); }, { 'aria-label': 'Etapa anterior' });
  var contador = el('span', 'sim-paso__contador', null, { 'aria-live': 'off' });
  var btnSig = boton('Siguiente →', 'sim-boton--sutil', function () { mover(1); }, { 'aria-label': 'Etapa siguiente' });
  var btnTodas = boton('Ver todas', 'sim-boton--sutil', function () {
    paso.activo = false;
    btnPaso.setAttribute('aria-pressed', 'false');
    pasoBarra.hidden = true;
    cfg.alCambiarPaso();
    btnPaso.focus();
  });
  pasoCtrl.appendChild(btnAnt);
  pasoCtrl.appendChild(contador);
  pasoCtrl.appendChild(btnSig);
  pasoCtrl.appendChild(btnTodas);
  pasoBarra.appendChild(pasoCtrl);
  pasoBarra.appendChild(pasoTexto);
  pasoBarra.addEventListener('keydown', function (ev) {
    if (ev.key === 'ArrowRight') { ev.preventDefault(); mover(1); }
    else if (ev.key === 'ArrowLeft') { ev.preventDefault(); mover(-1); }
  });

  function mover(d) {
    paso.k = Math.max(1, Math.min(paso.total, paso.k + d));
    cfg.alCambiarPaso();
  }

  /* ── Tamaño del diagrama en escritorio ──
     Con la figura fija (sticky, ≥ 1100 px) el diagrama se acota para
     que la figura COMPLETA —leyenda, diagrama, paso a paso y
     resultado— quepa en la altura visible. Se mide lo que ocupa el
     resto de la figura y se asigna el remanente (CSSOM: compatible
     con la CSP). */
  var escritorio = window.matchMedia('(min-width: 1100px)');
  var conLado = window.matchMedia('(min-width: 1360px)');
  var ajustando = false;
  function ajustarPlot() {
    if (ajustando) return;
    ajustando = true;
    requestAnimationFrame(function () {
      ajustando = false;
      if (!escritorio.matches) { plotHost.style.maxWidth = ''; return; }
      var nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) || 56;
      var otros = conLado.matches
        ? barra.offsetHeight + bajoPlot.offsetHeight + 24
        : figura.offsetHeight - plotHost.offsetHeight;
      var disp = window.innerHeight - nav - 40 - otros;
      plotHost.style.maxWidth = Math.max(352, Math.floor(disp)) + 'px';
    });
  }
  window.addEventListener('resize', ajustarPlot);
  [escritorio, conLado].forEach(function (mq) {
    if (mq.addEventListener) mq.addEventListener('change', ajustarPlot);
  });

  return {
    controles: controles,
    resultado: resultado,
    avisos: avisos,
    ficha: fichaDl,
    thead: thead,
    tbody: tbody,
    notaTabla: notaTabla,
    lectura: panelLectura,
    herramientas: herramientas,
    grafico: grafico,
    anunciar: anunciar,
    visible: function (id) { return !!visibles[id]; },
    mostrarChip: function (id, si) { if (chips[id]) chips[id].hidden = !si; },
    paso: paso,
    ajustarPlot: ajustarPlot,
    pintarPaso: function (texto) {
      contador.textContent = 'Etapa ' + paso.k + ' de ' + paso.total;
      btnAnt.disabled = paso.k <= 1;
      btnSig.disabled = paso.k >= paso.total;
      pasoTexto.replaceChildren();
      pasoTexto.appendChild(texto);
    },
    registrarFila: function (n, tr) {
      filas[n] = tr;
      tr.addEventListener('pointerenter', function () { grafico.resaltarEtapa(n); });
      tr.addEventListener('pointerleave', function () { grafico.resaltarEtapa(null); });
    },
    limpiarFilas: function () { filas = {}; }
  };
}
