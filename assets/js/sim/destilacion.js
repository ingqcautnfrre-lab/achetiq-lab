/* ============================================================
   AChETIQ — Simulador · McCabe-Thiele para destilación binaria
   (destilacion.js)
   ------------------------------------------------------------
   Cablea el modelo puro (modelo-destilacion.js) con el armazón
   común (armazon.js): controles → calcular() → escena SVG,
   resultado, ficha, tabla de etapas, lectura guiada y
   exportación. Se carga por import() dinámico al abrir su
   desplegable (acordeon.js).
   ============================================================ */

'use strict';

import * as Modelo from './modelo-destilacion.js';
import { fmt } from './numerico.js';
import { crearArmazon } from './armazon.js';
import { el, elNotacion, grupo, campo, segmentado, selector, areaDatos, ficha, avisos, boton } from './ui.js';
import { enHTML } from './notacion.js';

var CONDICIONES = [
  { valor: 'subenfriado', etiqueta: 'Líquido subenfriado (q > 1)', q: 1.2 },
  { valor: 'liquido', etiqueta: 'Líquido saturado (q = 1)', q: 1 },
  { valor: 'mezcla', etiqueta: 'Mezcla líquido–vapor (0 < q < 1)', q: 0.5 },
  { valor: 'vapor', etiqueta: 'Vapor saturado (q = 0)', q: 0 },
  { valor: 'sobrecalentado', etiqueta: 'Vapor sobrecalentado (q < 0)', q: -0.3 }
];

function condicionDe(q) {
  if (q > 1 + 1e-6) return 'subenfriado';
  if (Math.abs(q - 1) <= 1e-6) return 'liquido';
  if (q > 1e-6) return 'mezcla';
  if (Math.abs(q) <= 1e-6) return 'vapor';
  return 'sobrecalentado';
}

function copiaDefaults() {
  var d = Modelo.DEFAULTS;
  return Object.assign({}, d, { equilibrio: Object.assign({}, d.equilibrio) });
}

export function montar(raiz) {
  var p = copiaDefaults();
  var eqCache = null, eqClave = '';
  var res = null;

  var A = crearArmazon(raiz, {
    id: 'dest',
    titulo: 'Diagrama x–y de McCabe-Thiele para la destilación binaria',
    tituloExport: 'Diagrama de McCabe-Thiele — destilación binaria',
    archivo: 'mccabe-thiele-destilacion',
    elementos: [
      { grupo: 'Curvas y rectas', items: [
        { id: 'eq', etiqueta: 'Curva de equilibrio', clase: 'eq', etiquetaLeyenda: 'Equilibrio' },
        { id: 'ps', etiqueta: 'Pseudoequilibrio (E_{MV} < 1)', clase: 'ps', etiquetaLeyenda: 'Pseudoequilibrio' },
        { id: 'diag', etiqueta: 'Diagonal y = x', clase: 'diag', leyenda: false },
        { id: 'rect', etiqueta: 'Recta de rectificación', clase: 'rect', etiquetaLeyenda: 'Rectificación' },
        { id: 'strip', etiqueta: 'Recta de agotamiento', clase: 'strip', etiquetaLeyenda: 'Agotamiento' },
        { id: 'q', etiqueta: 'Recta q', clase: 'q' }
      ] },
      { grupo: 'Construcción', items: [
        { id: 'etapas', etiqueta: 'Escalones (etapas)', clase: 'etapas', etiquetaLeyenda: 'Etapas' },
        { id: 'numeros', etiqueta: 'Números de etapa', glifo: '1·2' },
        { id: 'rmin', etiqueta: 'Reflujo mínimo', clase: 'rmin', activa: false },
        { id: 'total', etiqueta: 'Reflujo total (N_{mín})', clase: 'total', activa: false, etiquetaLeyenda: 'Reflujo total' }
      ] },
      { grupo: 'Anotaciones', items: [
        { id: 'comp', etiqueta: 'Puntos x_B, x_F, x_D', glifo: '●' },
        { id: 'rotulos', etiqueta: 'Rótulos de las curvas', glifo: 'Aa' },
        { id: 'grilla', etiqueta: 'Cuadrícula', glifo: '#' }
      ] }
    ],
    subtituloExport: function () {
      if (!res || !res.ok) return '';
      var eqTxt = p.equilibrio.tipo === 'alfa' ? 'α = ' + fmt(p.equilibrio.alfa, 2) : 'equilibrio tabulado';
      return eqTxt + ' · x_D = ' + fmt(p.xD, 3) + ' · x_F = ' + fmt(p.xF, 3) + ' · x_B = ' + fmt(p.xB, 3) +
        ' · q = ' + fmt(p.q, 2) + ' · R = ' + fmt(res.R, 3) + ' (R/R_{mín} = ' + fmt(res.rRatio, 2) + ')' +
        ' · E_{MV} = ' + fmt(p.E, 2);
    },
    csv: function () {
      if (!res || !res.ok) return null;
      var filas = [
        ['McCabe-Thiele — destilación binaria (AChETIQ)'],
        ['Equilibrio', p.equilibrio.tipo === 'alfa' ? 'alfa = ' + p.equilibrio.alfa : 'datos x-y'],
        ['x_D', p.xD], ['x_F', p.xF], ['x_B', p.xB], ['q', p.q], ['R', res.R], ['R_min', res.Rmin], ['E_MV', p.E],
        [],
        ['Etapa', 'Sección', 'x_n', 'y_n']
      ];
      res.escalones.etapas.forEach(function (e) {
        filas.push([e.n, nombreSeccion(e), Number(e.x.toFixed(6)), Number(e.y.toFixed(6))]);
      });
      return filas;
    },
    alCambiarCapas: function () { dibujar(); },
    alCambiarPaso: function () { dibujar(); }
  });

  /* ── Controles ── */
  var C = {};
  var g1 = grupo('Equilibrio líquido–vapor');
  C.modoEq = segmentado({
    leyenda: 'Modelo de equilibrio',
    opciones: [{ valor: 'alfa', etiqueta: 'α constante' }, { valor: 'tabla', etiqueta: 'Datos x–y' }]
  }, p.equilibrio.tipo, function (v) { p.equilibrio.tipo = v; visibilidad(); recalcular(); });
  C.alfa = campo({ etiqueta: 'Volatilidad relativa, α', simbolo: 'α', min: 1.05, max: 10, paso: 0.01, dec: 2, limMin: 1.001, limMax: 100 },
    p.equilibrio.alfa, function (v) { p.equilibrio.alfa = v; recalcular(); });
  C.metodo = selector({
    etiqueta: 'Interpolación entre datos',
    opciones: [{ valor: 'monotona', etiqueta: 'Cúbica monótona (Fritsch–Carlson)' }, { valor: 'lineal', etiqueta: 'Lineal por tramos' }]
  }, p.equilibrio.metodo, function (v) { p.equilibrio.metodo = v; recalcular(); });
  C.datos = areaDatos({
    etiqueta: 'Pares x, y (uno por línea)',
    ayuda: 'Fracciones molares del componente más volátil. Los extremos (0, 0) y (1, 1) se agregan solos. Los datos precargados son ilustrativos y no corresponden a un sistema real: reemplazalos por datos de bibliografía o de laboratorio.'
  }, p.equilibrio.texto, function (v) { p.equilibrio.texto = v; recalcular(); });
  var restaurarDatos = boton('Restaurar datos de ejemplo', 'sim-boton--enlace', function () {
    p.equilibrio.texto = Modelo.PARES_EJEMPLO;
    C.datos.fijar(p.equilibrio.texto);
    recalcular();
  });
  [C.modoEq.nodo, C.alfa.nodo, C.metodo.nodo, C.datos.nodo, restaurarDatos].forEach(function (n) { g1.appendChild(n); });

  var g2 = grupo('Especificación de productos');
  g2.appendChild(el('p', 'sim-grupo__nota', 'Fracción molar del componente más volátil.'));
  C.xD = campo({ etiqueta: 'Destilado, x_D', simbolo: 'x_D', min: 0.5, max: 0.999, paso: 0.001, dec: 3, limMin: 0.002, limMax: 0.9999 },
    p.xD, function (v) { p.xD = v; recalcular(); });
  C.xF = campo({ etiqueta: 'Alimentación, x_F', simbolo: 'x_F', min: 0.05, max: 0.95, paso: 0.005, dec: 3, limMin: 0.001, limMax: 0.999 },
    p.xF, function (v) { p.xF = v; recalcular(); });
  C.xB = campo({ etiqueta: 'Residuo, x_B', simbolo: 'x_B', min: 0.001, max: 0.5, paso: 0.001, dec: 3, limMin: 0.0001, limMax: 0.998 },
    p.xB, function (v) { p.xB = v; recalcular(); });
  [C.xD.nodo, C.xF.nodo, C.xB.nodo].forEach(function (n) { g2.appendChild(n); });

  var g3 = grupo('Alimentación');
  C.cond = selector({ etiqueta: 'Condición térmica', opciones: CONDICIONES }, condicionDe(p.q), function (v) {
    var c = CONDICIONES.filter(function (x) { return x.valor === v; })[0];
    p.q = c.q;
    C.q.fijar(p.q);
    recalcular();
  });
  C.q = campo({
    etiqueta: 'Fracción líquida, q', simbolo: 'q', min: -1, max: 2, paso: 0.01, dec: 2, limMin: -10, limMax: 10,
    ayuda: 'q = (H_V − H_F) / (H_V − H_L): moles de líquido que cada mol de alimentación aporta a la sección de agotamiento.'
  }, p.q, function (v) { p.q = v; C.cond.fijar(condicionDe(v)); recalcular(); });
  C.F = campo({ etiqueta: 'Caudal de alimentación, F', unidad: 'kmol/h', simbolo: 'F', min: 1, max: 1000, paso: 1, dec: 1, limMin: 0.001, limMax: 1e6 },
    p.F, function (v) { p.F = v; recalcular(); });
  [C.cond.nodo, C.q.nodo, C.F.nodo].forEach(function (n) { g3.appendChild(n); });

  var g4 = grupo('Reflujo');
  C.modoR = segmentado({
    leyenda: 'Especificar mediante',
    opciones: [{ valor: 'R', etiqueta: 'R' }, { valor: 'ratio', etiqueta: 'R/R_{mín}' }]
  }, p.modoR, function (v) {
    /* Al cambiar de modo se conserva el R vigente. */
    if (res && res.ok) {
      if (v === 'ratio') { p.rRatio = Math.max(1.0001, res.rRatio); C.ratio.fijar(p.rRatio); }
      else { p.R = res.R; C.R.fijar(p.R); }
    }
    p.modoR = v; visibilidad(); recalcular();
  });
  C.R = campo({ etiqueta: 'Relación de reflujo, R = L/D', simbolo: 'R', min: 0.05, max: 10, paso: 0.01, dec: 2, limMin: 0.001, limMax: 1000 },
    p.R, function (v) { p.R = v; recalcular(); });
  C.ratio = campo({ etiqueta: 'Múltiplo del mínimo, R/R_{mín}', simbolo: 'R/R_{mín}', min: 1.01, max: 4, paso: 0.01, dec: 2, limMin: 1.0001, limMax: 50 },
    p.rRatio, function (v) { p.rRatio = v; recalcular(); });
  [C.modoR.nodo, C.R.nodo, C.ratio.nodo].forEach(function (n) { g4.appendChild(n); });

  var g5 = grupo('Eficiencia de etapa');
  C.E = campo({
    etiqueta: 'Eficiencia de Murphree, E_{MV}', simbolo: 'E_{MV}', min: 0.1, max: 1, paso: 0.01, dec: 2, limMin: 0.01, limMax: 1,
    ayuda: 'E_{MV} = (y_n − y_{n+1}) / (y^*_n − y_{n+1}). Con E_{MV} < 1 la construcción escalona sobre el pseudoequilibrio.'
  }, p.E, function (v) { p.E = v; recalcular(); });
  g5.appendChild(C.E.nodo);

  [g1, g2, g3, g4, g5].forEach(function (g) { A.controles.appendChild(g); });
  A.cabControles.appendChild(boton('Restablecer', 'sim-boton--sutil', function () {
    p = copiaDefaults();
    C.modoEq.fijar(p.equilibrio.tipo); C.alfa.fijar(p.equilibrio.alfa); C.metodo.fijar(p.equilibrio.metodo);
    C.datos.fijar(p.equilibrio.texto); C.xD.fijar(p.xD); C.xF.fijar(p.xF); C.xB.fijar(p.xB);
    C.q.fijar(p.q); C.cond.fijar(condicionDe(p.q)); C.F.fijar(p.F); C.modoR.fijar(p.modoR);
    C.R.fijar(p.R); C.ratio.fijar(p.rRatio); C.E.fijar(p.E);
    A.grafico.restablecerVista();
    visibilidad(); recalcular();
  }, { 'aria-label': 'Restablecer los valores por defecto' }));

  function visibilidad() {
    var tabla = p.equilibrio.tipo === 'tabla';
    C.alfa.mostrar(!tabla);
    C.metodo.mostrar(tabla);
    C.datos.mostrar(tabla);
    restaurarDatos.hidden = !tabla;
    C.R.mostrar(p.modoR === 'R');
    C.ratio.mostrar(p.modoR === 'ratio');
  }

  function nombreSeccion(e) {
    if (e.ultima) return 'Calderín';
    if (e.seccion === 'alimentacion') return 'Alimentación';
    return e.seccion === 'rect' ? 'Rectificación' : 'Agotamiento';
  }

  /* ── Cálculo ── */
  function recalcular() {
    var clave = JSON.stringify(p.equilibrio);
    if (clave !== eqClave) { eqCache = Modelo.construirEquilibrio(p.equilibrio); eqClave = clave; }
    res = Modelo.calcular(p, eqCache);
    if (res.ok) A.paso.total = res.escalones.etapas.length;
    if (A.paso.k > A.paso.total) A.paso.k = Math.max(1, A.paso.total);
    dibujar();
    pintarResultados();
  }

  /* ── Escena del diagrama ── */
  function dibujar() {
    var r = res;
    var capas = [];
    var desc = '';
    capas.push({ tipo: 'linea', clase: 'diag', p: [[0, 0], [1, 1]], oculta: !A.visible('diag') });
    if (r && r.eq) {
      capas.push({
        tipo: 'curva', clase: 'eq', f: r.eq.y, x: [0, 1], n: 300, oculta: !A.visible('eq'),
        etiqueta: { texto: 'Equilibrio', en: 0.42, dx: -44, dy: -30, ancla: 'end', guia: true }
      });
    }
    if (r && r.ok) {
      var L = r.rectas, pp = r.p;
      if (A.visible('total')) {
        capas.push({ tipo: 'escalones', clase: 'total', etapas: r.reflujoTotal.etapas, pasiva: true });
      }
      if (pp.E < 1) {
        capas.push({ tipo: 'curva', clase: 'ps', f: r.psEquilibrio, x: [pp.xB, pp.xD], n: 300, oculta: !A.visible('ps') });
      }
      if (A.visible('rmin') && r.rectasMin) {
        var Lm = r.rectasMin;
        capas.push({
          tipo: 'linea', clase: 'rmin', p: [[pp.xB, pp.xB], [Lm.xi, Lm.yi], [pp.xD, pp.xD]],
          etiqueta: { texto: 'R_{mín}', p: [r.pinch.x, r.pinch.y], dx: -10, dy: -10, ancla: 'end' }
        });
        capas.push({ tipo: 'puntos', clase: 'pinch', items: [{ x: r.pinch.x, y: r.pinch.y, r: 5 }] });
      }
      if (A.visible('rect')) {
        capas.push({ tipo: 'linea', clase: 'ext', p: [[0, pp.xD / (r.R + 1)], [L.xi, L.yi]] });
        capas.push({
          tipo: 'linea', clase: 'rect', p: [[L.xi, L.yi], [pp.xD, pp.xD]],
          etiqueta: { texto: 'Rectificación', en: L.xi + (pp.xD - L.xi) * 0.55, dx: 10, dy: 22, ancla: 'start' }
        });
        capas.push({
          tipo: 'puntos', clase: 'corte', items: [{
            x: 0, y: pp.xD / (r.R + 1), r: 3.5, etiqueta: 'x_D/(R+1)', dx: 8, dy: 4, ancla: 'start'
          }]
        });
      }
      if (A.visible('strip')) {
        capas.push({
          tipo: 'linea', clase: 'strip', p: [[pp.xB, pp.xB], [L.xi, L.yi]],
          etiqueta: { texto: 'Agotamiento', en: pp.xB + (L.xi - pp.xB) * 0.5, dx: 10, dy: 20, ancla: 'start' }
        });
      }
      if (A.visible('q') && r.qExtremo) {
        var qx = r.qExtremo;
        var fin = (Math.hypot(L.xi - pp.xF, L.yi - pp.xF) > Math.hypot(qx.x - pp.xF, qx.y - pp.xF)) ? [L.xi, L.yi] : [qx.x, qx.y];
        capas.push({
          tipo: 'linea', clase: 'q', p: [[pp.xF, pp.xF], fin],
          etiqueta: { texto: 'q', p: [(pp.xF + fin[0]) / 2, (pp.xF + fin[1]) / 2], dx: 8, dy: 4, ancla: 'start' }
        });
      }
      var comp = A.visible('comp');
      capas.push({ tipo: 'guia', x: pp.xB, y: pp.xB, oculta: !comp });
      capas.push({ tipo: 'guia', x: pp.xF, y: pp.xF, oculta: !comp });
      capas.push({ tipo: 'guia', x: pp.xD, y: pp.xD, oculta: !comp });
      if (A.visible('etapas')) {
        capas.push({
          tipo: 'escalones', clase: 'etapas', etapas: r.escalones.etapas,
          alim: r.escalones.alim, hasta: A.paso.activo ? A.paso.k : null,
          rotulo: { dx: -6, dy: -7, ancla: 'end' }
        });
      }
      capas.push({
        tipo: 'puntos', clase: 'comp', oculta: !comp, items: [
          { x: pp.xB, y: pp.xB, etiqueta: 'x_B', dx: 9, dy: 14 },
          { x: pp.xF, y: pp.xF, etiqueta: 'x_F', dx: 9, dy: 14 },
          { x: pp.xD, y: pp.xD, etiqueta: 'x_D', dx: 9, dy: 14 }
        ]
      });
      if (A.visible('rect') || A.visible('strip')) {
        capas.push({ tipo: 'puntos', clase: 'inter', items: [{ x: L.xi, y: L.yi, r: 3.5 }] });
      }
      desc = textoResultado(r, true);
    } else if (r) {
      desc = 'Especificación no válida: ' + r.errores.join(' ');
    }

    A.grafico.actualizar({
      dominio: { x: [0, 1], y: [0, 1] },
      ejes: {
        xTitulo: 'x — fracción molar del más volátil en el líquido',
        yTitulo: 'y — fracción molar del más volátil en el vapor',
        xCorto: 'x — líquido', yCorto: 'y — vapor',
        xPlano: 'x', yPlano: 'y'
      },
      titulo: 'Diagrama de McCabe-Thiele para destilación binaria',
      descripcion: desc,
      mostrar: { grilla: A.visible('grilla'), rotulos: A.visible('rotulos'), numeros: A.visible('numeros') },
      capas: capas
    });
    A.mostrarElemento('ps', !!(r && r.ok && r.p.E < 1));
    if (A.paso.activo && r && r.ok) A.pintarPaso(narrarEtapa(r, A.paso.k));
    A.ajustarPlot();
  }

  /* ── Resultado principal (oración) ── */
  function textoResultado(r, plano) {
    var e = r.escalones;
    if (!isFinite(e.nFrac)) {
      return 'Infinitas etapas: la relación de reflujo no supera el reflujo mínimo (R mínimo = ' + fmt(r.Rmin, 3) + ').';
    }
    var platos = e.n - 1;
    var base = (r.p.E < 1 ? e.n + ' etapas reales' : e.n + ' etapas teóricas') +
      ' (' + platos + (platos === 1 ? ' plato' : ' platos') + ' más el calderín), con alimentación en la etapa ' + e.alim;
    if (plano) return 'Se requieren ' + base + '.';
    return base;
  }

  function pintarResultados() {
    var r = res;
    if (!r.ok) {
      A.kpis([{ etiqueta: 'Resultado', valor: '—', nota: 'especificación no válida' }]);
      avisos(A.avisos, r.errores.map(function (t) { return { nivel: 'error', texto: t }; }).concat(r.avisos));
      ficha(A.ficha, []);
      A.tbody.replaceChildren();
      A.lectura.replaceChildren(el('p', null, 'Corregí los valores marcados para ver la interpretación del diagrama.'));
      A.anunciar('Especificación no válida.');
      return;
    }
    var e = r.escalones;
    var finito = isFinite(e.nFrac);
    var platos = e.n - 1;
    A.kpis([
      {
        etiqueta: r.p.E < 1 ? 'Etapas reales' : 'Etapas teóricas',
        valor: finito ? String(e.n) : '∞',
        nota: !finito ? 'R no supera R_{mín}'
          : (r.p.E < 1 && isFinite(r.teorico.nFrac) ? r.teorico.n + ' teóricas con E_{MV} = 1'
            : platos + (platos === 1 ? ' plato' : ' platos') + ' + calderín'),
        destacado: true
      },
      { etiqueta: 'Alimentación', valor: finito && e.alim ? 'Etapa ' + e.alim : '—', nota: 'contada desde el tope' },
      { etiqueta: 'Reflujo mínimo, R_{mín}', valor: fmt(r.Rmin, 3), nota: 'R/R_{mín} = ' + fmt(r.rRatio, 2) },
      { etiqueta: 'Reflujo total, N_{mín}', valor: fmt(r.Nmin, 2), nota: r.NminFenske != null ? 'Fenske: ' + fmt(r.NminFenske, 2) : 'etapas a reflujo total' }
    ]);
    avisos(A.avisos, r.avisos);
    A.anunciar(textoResultado(r, true));

    /* Ficha técnica */
    var b = r.balance;
    var items = [
      { termino: 'Reflujo mínimo, R_{mín}', valor: fmt(r.Rmin, 4), nota: r.pinch.tipo === 'alimentacion' ? 'pinch en la recta q' : 'pinch tangente en x = ' + fmt(r.pinch.x, 3) },
      { termino: 'Reflujo de operación, R', valor: fmt(r.R, 3), nota: 'R/R_{mín} = ' + fmt(r.rRatio, 3) }
    ];
    if (r.RminUnderwood != null) items.push({ termino: 'R_{mín} por Underwood', valor: fmt(r.RminUnderwood, 4), nota: 'verificación analítica (α constante)' });
    items.push({ termino: 'Etapas teóricas', valor: fmtEtapas(r.teorico), nota: 'construcción gráfica, incluye el calderín' });
    if (r.p.E < 1) items.push({ termino: 'Etapas reales (E_{MV} = ' + fmt(r.p.E, 2) + ')', valor: fmtEtapas(e) });
    items.push({ termino: 'Etapa de alimentación', valor: e.alim ? String(e.alim) : '—', nota: 'contada desde el tope' });
    items.push({ termino: 'Reflujo total, N_{mín}', valor: fmt(r.Nmin, 2), nota: r.NminFenske != null ? 'Fenske: ' + fmt(r.NminFenske, 2) : 'escalonamiento sobre la diagonal' });
    items.push({ termino: 'Intersección de rectas', valor: '(' + fmt(r.rectas.xi, 4) + '; ' + fmt(r.rectas.yi, 4) + ')' });
    items.push({ termino: 'L/V (rectificación)', valor: fmt(b.LV, 4) });
    items.push({ termino: 'L̄/V̄ (agotamiento)', valor: fmt(b.LVb, 4), nota: 'V̄/B = ' + fmt(b.VbB, 3) });
    items.push({ termino: 'Destilado, D', valor: fmt(b.D, 2) + ' kmol/h', nota: 'residuo B = ' + fmt(b.B, 2) + ' kmol/h' });
    items.push({ termino: 'Recuperación del más volátil', valor: fmt(b.recD * 100, 2) + ' %', nota: 'en el destilado' });
    ficha(A.ficha, items);

    /* Tabla de etapas */
    A.limpiarFilas();
    A.thead.replaceChildren();
    var trh = el('tr');
    ['Etapa', 'Sección', 'x_n', 'y_n'].forEach(function (h, i) {
      trh.appendChild(elNotacion('th', i > 1 ? 'sim-tabla__num' : null, h, { scope: 'col' }));
    });
    A.thead.appendChild(trh);
    A.tbody.replaceChildren();
    e.etapas.forEach(function (et) {
      var tr = el('tr', et.seccion === 'alimentacion' ? 'is-alim' : null);
      tr.appendChild(el('th', null, String(et.n), { scope: 'row' }));
      tr.appendChild(el('td', null, nombreSeccion(et)));
      tr.appendChild(el('td', 'sim-tabla__num', fmt(et.x, 4)));
      tr.appendChild(el('td', 'sim-tabla__num', fmt(et.y, 4)));
      A.registrarFila(et.n, tr);
      A.tbody.appendChild(tr);
    });
    A.notaTabla.replaceChildren();
    enHTML(A.notaTabla, 'y_n es el vapor que sale de la etapa n y x_n el líquido que la abandona. La etapa 1 está en el tope (condensador total: y_1 = x_D); la última es el calderín parcial.' +
      (r.p.E < 1 ? ' Con E_{MV} < 1, y_n proviene del pseudoequilibrio.' : ''));

    pintarLectura(r);
  }

  function fmtEtapas(e) {
    if (!isFinite(e.nFrac)) return '∞';
    return e.n + ' (' + fmt(e.nFrac, 2) + ')';
  }

  /* ── Narración del modo paso a paso ── */
  function narrarEtapa(r, k) {
    var e = r.escalones.etapas[k - 1];
    var span = el('span');
    if (!e) return span;
    var curva = r.p.E < 1 ? 'el pseudoequilibrio' : 'la curva de equilibrio';
    var t;
    if (k === 1) {
      t = 'Etapa 1. Con condensador total, el vapor que sale del tope tiene y_1 = x_D = ' + fmt(e.y, 4) +
        '. La horizontal hasta ' + curva + ' da x_1 = ' + fmt(e.x, 4) + '.';
    } else {
      t = 'Etapa ' + k + '. Desde (x_{' + (k - 1) + '}; y_{' + k + '}) = (' + fmt(e.x0, 4) + '; ' + fmt(e.y, 4) +
        ') sobre la recta de operación, la horizontal hasta ' + curva + ' da x_{' + k + '} = ' + fmt(e.x, 4) + '.';
    }
    if (e.ultima) {
      var f = (e.x0 - r.p.xB) / (e.x0 - e.x);
      t += ' Como x_{' + k + '} ≤ x_B, la construcción termina: esta etapa es el calderín y cubre una fracción ' + fmt(f, 2) + ' del escalón.';
    } else if (e.seccion === 'alimentacion') {
      t += ' x_{' + k + '} cae por debajo de la intersección de las rectas (x = ' + fmt(r.rectas.xi, 4) +
        '): es la etapa óptima de alimentación y la vertical baja ya hasta la recta de agotamiento, y_{' + (k + 1) + '} = ' + fmt(e.y1, 4) + '.';
    } else {
      t += ' La vertical hasta la recta de ' + (e.seccion === 'rect' ? 'rectificación' : 'agotamiento') +
        ' fija el vapor que asciende desde la etapa inferior: y_{' + (k + 1) + '} = ' + fmt(e.y1, 4) + '.';
    }
    return enHTML(span, t);
  }

  /* ── Lectura guiada (interpretación del estado actual) ── */
  function pintarLectura(r) {
    var pp = r.p;
    var parrafos = [];
    var ratio = r.rRatio;
    if (!isFinite(r.escalones.nFrac)) {
      parrafos.push('Con R ≤ R_{mín} las rectas de operación tocan la curva de equilibrio: en ese punto (pinch) la fuerza impulsora se anula y los escalones se hacen infinitamente pequeños. Aumentá R para recuperar una construcción finita.');
    } else if (ratio < 1.1) {
      parrafos.push('R/R_{mín} = ' + fmt(ratio, 2) + ': la columna opera muy cerca del pinch. Los escalones se apiñan en torno a la intersección de las rectas y una pequeña variación de R cambia mucho el número de etapas.');
    } else if (ratio <= 1.5) {
      parrafos.push('R/R_{mín} = ' + fmt(ratio, 2) + ': dentro del intervalo 1,2–1,5 que la heurística de diseño más difundida asocia al óptimo económico entre costo fijo (etapas) y costo operativo (condensador y calderín).');
    } else {
      parrafos.push('R/R_{mín} = ' + fmt(ratio, 2) + ': las rectas de operación se acercan a la diagonal y se requieren menos etapas, a costa de mayores caudales internos y, por lo tanto, de más energía en el calderín y el condensador. En el límite R → ∞ (reflujo total) se obtiene N_{mín} = ' + fmt(r.Nmin, 2) + '.');
    }
    var cond = condicionDe(pp.q);
    var textoQ = {
      subenfriado: 'La alimentación es un líquido subenfriado (q > 1): la recta q tiene pendiente mayor que 1 y se inclina hacia la derecha; parte del vapor ascendente condensa al calentar la alimentación.',
      liquido: 'La alimentación es líquido saturado (q = 1): la recta q es vertical en x = x_F.',
      mezcla: 'La alimentación es una mezcla líquido–vapor (0 < q < 1): la recta q tiene pendiente negativa q/(q − 1) = ' + fmt(pp.q / (pp.q - 1), 2) + '.',
      vapor: 'La alimentación es vapor saturado (q = 0): la recta q es horizontal en y = x_F.',
      sobrecalentado: 'La alimentación es vapor sobrecalentado (q < 0): la recta q tiene pendiente positiva menor que 1; parte del líquido descendente se evapora al enfriarla.'
    }[cond];
    parrafos.push(textoQ + ' Cuanto menor es q, mayor es el reflujo mínimo necesario para la misma separación.');
    parrafos.push(r.pinch.tipo === 'alimentacion'
      ? 'El reflujo mínimo queda fijado por el punto donde la recta q corta la curva de equilibrio: es el caso habitual con volatilidad relativa constante.'
      : 'El reflujo mínimo queda fijado por un pinch tangente en x = ' + fmt(r.pinch.x, 3) + ': la recta de operación toca la curva antes de llegar a la recta q, situación típica de sistemas no ideales.');
    if (pp.E < 1) {
      parrafos.push('Con E_{MV} = ' + fmt(pp.E, 2) + ' cada etapa real recorre solo esa fracción de la distancia vertical entre la recta de operación y el equilibrio; por eso el pseudoequilibrio (trazo discontinuo) queda entre ambas curvas y la columna necesita ' + r.escalones.n + ' etapas en lugar de ' + r.teorico.n + '.');
    }
    parrafos.push('El corte de la recta de rectificación con el eje y, x_D/(R + 1) = ' + fmt(pp.xD / (r.R + 1), 4) + ', es la forma clásica de trazarla a mano.');
    A.lectura.replaceChildren();
    parrafos.forEach(function (t) { A.lectura.appendChild(enHTML(el('p'), t)); });
  }

  visibilidad();
  recalcular();
}
