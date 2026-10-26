/* ============================================================
   AChETIQ — Simuladores · armazón común (armazon.js)
   ------------------------------------------------------------
   Composición compartida por los dos simuladores:

     ┌ Parámetros ──┐ ┌ Gráfico ─────────────────────────────────┐
     │ fieldsets…   │ │ indicadores clave        paso a paso·vista│
     │              │ │ ┌ diagrama SVG ─────────┐ ┌ Elementos ───┐ │
     │              │ │ │                        │ │ ☑ series…    │ │
     │              │ │ └────────────────────────┘ │ Descargar PNG│ │
     │              │ │ avisos · paso a paso       └──────────────┘ │
     └──────────────┘ └──────────────────────────────────────────┘
                      ┌ Esquema del equipo: columna + corrientes ┐
     ┌ Resultados: Ficha técnica · Etapas · Cómo leer el diagrama ┐

   Todos los paneles son estáticos (ninguno acompaña al
   desplazamiento de la página).

   La lógica de cada simulador vive en destilacion.js y
   absorcion.js; acá hay estructura, el panel de elementos (que es
   a la vez leyenda, interruptor de capas y selector de lo que
   entra en la imagen descargada), la exportación y el control del
   modo paso a paso.
   ============================================================ */

'use strict';

import { el, elNotacion, boton, pestanas, anunciador, descargar, csv } from './ui.js';
import { crearGrafico, serializarSVG } from './grafico.js';
import { exportarPNG } from './exportar.js';
import { crearEsquema } from './esquema.js';
import { enHTML } from './notacion.js';

var NS = 'http://www.w3.org/2000/svg';

/* Muestra de trazo de una serie (misma clase que en el diagrama). */
function muestra(clase) {
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'sim-check__muestra');
  svg.setAttribute('viewBox', '0 0 28 12');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  var l = document.createElementNS(NS, 'path');
  l.setAttribute('d', clase === 'etapas' || clase === 'total' ? 'M2 10H14V2H26' : 'M2 9L26 3');
  l.setAttribute('class', 'sim-svg__serie sim-svg__' + clase);
  svg.appendChild(l);
  return svg;
}

/* Glifo para los elementos que no son series. */
function glifo(texto) {
  return el('span', 'sim-check__glifo', texto, { 'aria-hidden': 'true' });
}

function iconoDescarga() {
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', 'sim-descarga__icono');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  ['M12 4v11', 'm7 10 5 5 5-5', 'M5 20h14'].forEach(function (d) {
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    svg.appendChild(p);
  });
  return svg;
}

export function crearArmazon(raiz, cfg) {
  raiz.replaceChildren();
  raiz.classList.add('sim-app');

  /* ── Panel de parámetros ── */
  var controles = el('form', 'sim-panel sim-app__controles', null, {
    'aria-labelledby': cfg.id + '-param', novalidate: ''
  });
  controles.addEventListener('submit', function (ev) { ev.preventDefault(); });
  var cabCtrl = el('div', 'sim-panel__cab');
  cabCtrl.appendChild(el('h3', 'sim-panel__titulo', 'Parámetros de diseño', { id: cfg.id + '-param' }));
  controles.appendChild(cabCtrl);

  /* ── Panel del gráfico ── */
  var figura = el('section', 'sim-panel sim-figura', null, { 'aria-labelledby': cfg.id + '-fig' });
  figura.appendChild(el('h3', 'sr-only', cfg.titulo, { id: cfg.id + '-fig' }));

  var cab = el('div', 'sim-figura__cab');
  var kpis = el('dl', 'sim-kpis');
  var utiles = el('div', 'sim-figura__utiles');
  cab.appendChild(kpis);
  cab.appendChild(utiles);

  var plotHost = el('div', 'sim-plot');
  var pie = el('div', 'sim-figura__pie');
  var ayudaZoom = el('p', 'sim-plot__ayuda', 'Arrastrá sobre el diagrama para ampliar una zona; doble clic para volver a la vista completa.');
  var avisos = el('div', 'sim-avisos', null, { hidden: '' });
  var pasoBarra = el('div', 'sim-paso', null, { hidden: '' });
  var pasoCtrl = el('div', 'sim-paso__controles');
  var pasoTexto = el('p', 'sim-paso__texto', null, { 'aria-live': 'polite' });
  pie.appendChild(avisos);
  pie.appendChild(pasoBarra);
  pie.appendChild(ayudaZoom);

  /* ── Panel lateral: elementos del gráfico + descarga ── */
  var lado = el('aside', 'sim-elementos', null, { 'aria-labelledby': cfg.id + '-elem' });
  lado.appendChild(el('h4', 'sim-elementos__titulo', 'Elementos del gráfico', { id: cfg.id + '-elem' }));
  /* Lista de casillas; el bloque de descarga va debajo. */
  var lista = el('div', 'sim-elementos__lista');
  lado.appendChild(lista);

  var visibles = {};
  var checks = {};
  var series = [];   /* para la leyenda de la imagen */
  var grafico = null;

  function agregarGrupo(nombre, items, alCambiar) {
    var fs = el('fieldset', 'sim-elementos__grupo');
    fs.appendChild(el('legend', 'sim-elementos__leyenda', nombre));
    items.forEach(function (it) {
      visibles[it.id] = it.activa !== false;
      var lab = el('label', 'sim-check');
      var cb = el('input', 'sim-check__caja', null, { type: 'checkbox' });
      cb.checked = visibles[it.id];
      cb.addEventListener('change', function () {
        visibles[it.id] = cb.checked;
        if (alCambiar) alCambiar();
      });
      lab.appendChild(cb);
      lab.appendChild(it.clase ? muestra(it.clase) : glifo(it.glifo || ''));
      lab.appendChild(elNotacion('span', 'sim-check__texto', it.etiqueta));
      fs.appendChild(lab);
      checks[it.id] = lab;
      if (it.clase) series.push(it);
    });
    lista.appendChild(fs);
  }

  cfg.elementos.forEach(function (g) { agregarGrupo(g.grupo, g.items, cfg.alCambiarCapas); });

  var descarga = el('div', 'sim-descarga');
  descarga.appendChild(el('h4', 'sim-elementos__titulo', 'Descargar gráfico'));
  /* Agregados que solo existen en la imagen descargada (no en
     pantalla): casillas compactas en una fila. */
  var incluir = el('fieldset', 'sim-descarga__incluir');
  incluir.appendChild(el('legend', 'sim-elementos__leyenda', 'Incluir en la imagen'));
  [['img-titulo', 'Título'], ['img-param', 'Parámetros'], ['img-leyenda', 'Leyenda']].forEach(function (o) {
    visibles[o[0]] = true;
    var lab = el('label', 'sim-check sim-check--compacto');
    var cb = el('input', 'sim-check__caja', null, { type: 'checkbox' });
    cb.checked = true;
    cb.addEventListener('change', function () { visibles[o[0]] = cb.checked; });
    lab.appendChild(cb);
    lab.appendChild(el('span', 'sim-check__texto', o[1]));
    incluir.appendChild(lab);
  });
  descarga.appendChild(incluir);
  var idRes = cfg.id + '-res';
  var filaRes = el('div', 'sim-descarga__fila');
  filaRes.appendChild(el('label', 'sim-descarga__etiqueta', 'Resolución', { for: idRes }));
  var selRes = el('select', 'sim-select sim-descarga__select', null, { id: idRes });
  [['2', '2× · ≈ 1 700 px'], ['3', '3× · ≈ 2 500 px'], ['4', '4× · ≈ 3 400 px']].forEach(function (o, i) {
    var op = el('option', null, o[1], { value: o[0] });
    if (i === 1) op.selected = true;
    selRes.appendChild(op);
  });
  filaRes.appendChild(selRes);
  descarga.appendChild(filaRes);
  var estadoDescarga = el('p', 'sim-descarga__estado', null, { role: 'status', 'aria-live': 'polite' });
  var btnPNG = el('button', 'btn btn-primary sim-descarga__png', null, { type: 'button' });
  btnPNG.appendChild(iconoDescarga());
  btnPNG.appendChild(document.createTextNode('Descargar PNG'));
  btnPNG.addEventListener('click', function () {
    btnPNG.disabled = true;
    estadoDescarga.textContent = 'Generando la imagen…';
    var leyenda = series.filter(function (s) {
      return visibles[s.id] && !checks[s.id].hidden && s.leyenda !== false;
    }).map(function (s) { return { clase: s.clase, etiqueta: s.etiquetaLeyenda || s.etiqueta }; });
    exportarPNG({
      grafico: grafico,
      escala: Number(selRes.value),
      ancho: 800,
      titulo: visibles['img-titulo'] ? cfg.tituloExport : null,
      subtitulo: visibles['img-param'] && cfg.subtituloExport ? cfg.subtituloExport() : null,
      leyenda: visibles['img-leyenda'] ? leyenda : [],
      nombre: cfg.archivo + '.png'
    }).then(function () {
      estadoDescarga.textContent = 'Imagen descargada.';
    }).catch(function (err) {
      console.error('[AChETIQ simuladores] Exportación PNG:', err);
      estadoDescarga.textContent = 'No se pudo generar la imagen.';
    }).then(function () { btnPNG.disabled = false; });
  });
  descarga.appendChild(btnPNG);
  var pieDescarga = el('div', 'sim-descarga__pie');
  pieDescarga.appendChild(boton('Descargar SVG (vectorial)', 'sim-boton--enlace', function () {
    descargar(cfg.archivo + '.svg', serializarSVG(grafico.svg), 'image/svg+xml');
  }));
  pieDescarga.appendChild(estadoDescarga);
  descarga.appendChild(pieDescarga);
  lado.appendChild(descarga);

  figura.appendChild(cab);
  figura.appendChild(plotHost);
  figura.appendChild(lado);
  figura.appendChild(pie);

  /* ── Panel del esquema del equipo ── */
  var esqPanel = el('section', 'sim-panel sim-esquema', null, { 'aria-labelledby': cfg.id + '-esq' });
  var esqCab = el('div', 'sim-panel__cab sim-esquema__cab');
  esqCab.appendChild(el('h3', 'sim-panel__titulo', 'Esquema del equipo', { id: cfg.id + '-esq' }));
  esqCab.appendChild(el('p', 'sim-esquema__bajada', cfg.bajadaEsquema || 'La columna se redibuja con el número de etapas calculado.'));
  esqPanel.appendChild(esqCab);
  var esqCuerpo = el('div', 'sim-esquema__cuerpo');
  var esqHost = el('div', 'sim-esquema__dibujo');
  var esqDatos = el('div', 'sim-esquema__datos');
  esqDatos.appendChild(el('h4', 'sim-elementos__titulo', 'Resumen de corrientes'));
  var corrMarco = el('div', 'sim-corrientes__marco', null, { tabindex: '0', role: 'region', 'aria-label': 'Resumen de corrientes' });
  var corrTabla = el('table', 'sim-corrientes');
  corrMarco.appendChild(corrTabla);
  esqDatos.appendChild(corrMarco);
  var corrNota = el('p', 'sim-tabla__nota');
  esqDatos.appendChild(corrNota);
  esqCuerpo.appendChild(esqHost);
  esqCuerpo.appendChild(esqDatos);
  esqPanel.appendChild(esqCuerpo);

  /* ── Panel de resultados (pestañas) ── */
  var detalle = el('section', 'sim-panel sim-app__detalle', null, { 'aria-labelledby': cfg.id + '-res-t' });
  detalle.appendChild(el('h3', 'sr-only', 'Resultados', { id: cfg.id + '-res-t' }));
  var fichaDl = el('dl', 'sim-ficha');

  var tablaEnvoltura = el('div', 'sim-tabla__marco', null, { tabindex: '0', role: 'region', 'aria-label': 'Tabla de etapas' });
  var tabla = el('table', 'sim-tabla');
  tabla.appendChild(el('caption', 'sr-only', 'Composiciones por etapa'));
  var thead = el('thead');
  var tbody = el('tbody');
  tabla.appendChild(thead);
  tabla.appendChild(tbody);
  tablaEnvoltura.appendChild(tabla);
  var panelEtapas = el('div', 'sim-etapas');
  var notaTabla = el('p', 'sim-tabla__nota');
  panelEtapas.appendChild(tablaEnvoltura);
  panelEtapas.appendChild(notaTabla);
  var accionesTabla = el('div', 'sim-etapas__acciones');
  accionesTabla.appendChild(boton('Descargar tabla (CSV)', 'sim-boton--secundario', function () {
    var filasCsv = cfg.csv && cfg.csv();
    if (filasCsv) descargar(cfg.archivo + '.csv', csv(filasCsv), 'text/csv;charset=utf-8');
  }));
  accionesTabla.appendChild(boton('Imprimir', 'sim-boton--secundario', function () { window.print(); }));
  panelEtapas.appendChild(accionesTabla);

  var panelLectura = el('div', 'sim-lectura');
  var tabs = pestanas([
    { titulo: 'Ficha técnica', panel: fichaDl },
    { titulo: 'Etapas', panel: panelEtapas },
    { titulo: 'Cómo leer el diagrama', panel: panelLectura }
  ]);
  detalle.appendChild(tabs.nodo);

  raiz.appendChild(controles);
  raiz.appendChild(figura);
  raiz.appendChild(esqPanel);
  raiz.appendChild(detalle);

  var anunciar = anunciador(raiz);

  /* ── Gráfico ── */
  var filas = {};
  var btnVista = boton('Restablecer vista', 'sim-boton--sutil', function () { grafico.restablecerVista(); }, { hidden: '' });
  /* Resaltado vinculado: diagrama ↔ esquema ↔ tabla de etapas. */
  grafico = crearGrafico(plotHost, {
    onEtapa: function (n) { resaltarFila(n); esquema.resaltar(n); },
    onZoom: function (activo) { btnVista.hidden = !activo; }
  });
  var esquema = crearEsquema(esqHost, {
    onEtapa: function (n) { grafico.resaltarEtapa(n); resaltarFila(n); }
  });

  function resaltarFila(n) {
    Object.keys(filas).forEach(function (k) {
      filas[k].classList.toggle('is-activa', Number(k) === n);
    });
  }

  /* ── Paso a paso ── */
  var paso = { activo: false, k: 1, total: 0 };
  var btnPaso = boton('Paso a paso', 'sim-boton--toggle', function () {
    paso.activo = !paso.activo;
    btnPaso.setAttribute('aria-pressed', paso.activo ? 'true' : 'false');
    pasoBarra.hidden = !paso.activo;
    paso.k = 1;
    if (!paso.activo) esquema.resaltar(null);
    cfg.alCambiarPaso();
  }, { 'aria-pressed': 'false' });
  utiles.appendChild(btnPaso);
  utiles.appendChild(btnVista);

  var btnAnt = boton('← Anterior', 'sim-boton--sutil', function () { mover(-1); }, { 'aria-label': 'Etapa anterior' });
  var contador = el('span', 'sim-paso__contador');
  var btnSig = boton('Siguiente →', 'sim-boton--sutil', function () { mover(1); }, { 'aria-label': 'Etapa siguiente' });
  var btnTodas = boton('Ver todas', 'sim-boton--sutil', function () {
    paso.activo = false;
    btnPaso.setAttribute('aria-pressed', 'false');
    pasoBarra.hidden = true;
    esquema.resaltar(null);
    cfg.alCambiarPaso();
    btnPaso.focus();
  });
  pasoCtrl.appendChild(contador);
  pasoCtrl.appendChild(btnAnt);
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

  return {
    controles: controles,
    cabControles: cabCtrl,
    avisos: avisos,
    ficha: fichaDl,
    thead: thead,
    tbody: tbody,
    notaTabla: notaTabla,
    lectura: panelLectura,
    grafico: grafico,
    anunciar: anunciar,
    esquema: esquema,
    corrientes: corrTabla,
    notaCorrientes: corrNota,
    visible: function (id) { return !!visibles[id]; },
    mostrarElemento: function (id, si) { if (checks[id]) checks[id].hidden = !si; },
    paso: paso,
    /* Indicadores clave: [{ etiqueta, valor, nota?, destacado? }] */
    kpis: function (lista) {
      kpis.replaceChildren();
      lista.forEach(function (k) {
        var d = el('div', 'sim-kpi' + (k.destacado ? ' sim-kpi--destacado' : ''));
        d.appendChild(elNotacion('dt', 'sim-kpi__etiqueta', k.etiqueta));
        var dd = el('dd', 'sim-kpi__valor');
        enHTML(dd, k.valor);
        if (k.nota) dd.appendChild(elNotacion('span', 'sim-kpi__nota', k.nota));
        d.appendChild(dd);
        kpis.appendChild(d);
      });
    },
    pintarPaso: function (texto) {
      contador.textContent = 'Etapa ' + paso.k + ' de ' + paso.total;
      btnAnt.disabled = paso.k <= 1;
      btnSig.disabled = paso.k >= paso.total;
      pasoTexto.replaceChildren();
      pasoTexto.appendChild(texto);
    },
    registrarFila: function (n, tr) {
      filas[n] = tr;
      tr.addEventListener('pointerenter', function () { grafico.resaltarEtapa(n); esquema.resaltar(n); });
      tr.addEventListener('pointerleave', function () { grafico.resaltarEtapa(null); esquema.resaltar(null); });
    },
    limpiarFilas: function () { filas = {}; }
  };
}
