/* ============================================================
   AChETIQ — Simulador · McCabe-Thiele para absorción de gases
   (absorcion.js)
   ------------------------------------------------------------
   Cablea el modelo puro (modelo-absorcion.js) con el armazón
   común. Notación de Treybal / Geankoplis: etapa 1 en el tope;
   el solvente entra con X_0, el gas tratado sale con Y_1, el gas
   entra por el fondo con Y_{N+1} y el líquido sale con X_N.
   ============================================================ */

'use strict';

import * as Modelo from './modelo-absorcion.js';
import { fmt, fmtSig } from './numerico.js';
import { crearArmazon } from './armazon.js';
import { el, elNotacion, grupo, campo, segmentado, selector, areaDatos, ficha, avisos, boton } from './ui.js';
import { enHTML } from './notacion.js';

function copiaDefaults() {
  var d = Modelo.DEFAULTS;
  return Object.assign({}, d, { equilibrio: Object.assign({}, d.equilibrio) });
}

/* Cota superior «redonda» para los ejes. */
function techo(v) {
  if (!(v > 0)) return 1;
  var pot = Math.pow(10, Math.floor(Math.log10(v)));
  var pasos = [1, 1.2, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10];
  for (var i = 0; i < pasos.length; i++) if (pasos[i] * pot >= v) return pasos[i] * pot;
  return 10 * pot;
}

export function montar(raiz) {
  var p = copiaDefaults();
  var eqCache = null, eqClave = '';
  var res = null;

  var A = crearArmazon(raiz, {
    id: 'abs',
    titulo: 'Diagrama X–Y de McCabe-Thiele para la absorción de gases',
    tituloExport: 'Diagrama de McCabe-Thiele — absorción de gases',
    archivo: 'mccabe-thiele-absorcion',
    elementos: [
      { grupo: 'Curvas y rectas', items: [
        { id: 'eq', etiqueta: 'Curva de equilibrio', clase: 'eq', etiquetaLeyenda: 'Equilibrio' },
        { id: 'ps', etiqueta: 'Pseudoequilibrio (E_{MV} < 1)', clase: 'ps', etiquetaLeyenda: 'Pseudoequilibrio' },
        { id: 'op', etiqueta: 'Recta de operación', clase: 'op', etiquetaLeyenda: 'Operación' }
      ] },
      { grupo: 'Construcción', items: [
        { id: 'etapas', etiqueta: 'Escalones (etapas)', clase: 'etapas', etiquetaLeyenda: 'Etapas' },
        { id: 'numeros', etiqueta: 'Números de etapa', glifo: '1·2' },
        { id: 'lmin', etiqueta: 'Solvente mínimo', clase: 'rmin', activa: false, etiquetaLeyenda: 'Solvente mínimo' }
      ] },
      { grupo: 'Anotaciones', items: [
        { id: 'comp', etiqueta: 'Tope y fondo', glifo: '●' },
        { id: 'rotulos', etiqueta: 'Rótulos de las curvas', glifo: 'Aa' },
        { id: 'grilla', etiqueta: 'Cuadrícula', glifo: '#' }
      ] }
    ],
    subtituloExport: function () {
      if (!res || !res.ok) return '';
      var eqTxt = p.equilibrio.tipo === 'lineal' ? 'Y^* = ' + fmt(p.equilibrio.M, 3) + ' X'
        : p.equilibrio.tipo === 'henry' ? 'y^* = ' + fmt(p.equilibrio.m, 3) + ' x' : 'equilibrio tabulado';
      return eqTxt + ' · Y_{N+1} = ' + fmtSig(res.Yin, 4) + ' · Y_1 = ' + fmtSig(res.Y1, 4) +
        ' · X_0 = ' + fmtSig(res.X0, 4) + ' · L′_s/V′_s = ' + fmt(res.LV, 3) +
        ' (L′_s/L′_{s,mín} = ' + fmt(res.lRatio, 2) + ') · E_{MV} = ' + fmt(p.E, 2);
    },
    csv: function () {
      if (!res || !res.ok) return null;
      var filas = [
        ['McCabe-Thiele — absorción de gases (AChETIQ)'],
        ['V\'s (kmol/h)', p.Vs], ['Y_N+1', res.Yin], ['Y_1', res.Y1], ['X_0', res.X0], ['X_N', res.XN],
        ['L\'s (kmol/h)', res.Ls], ['L\'s,min (kmol/h)', res.Lmin], ['E_MV', p.E],
        [],
        ['Etapa', 'X_n', 'Y_n', 'x_n', 'y_n']
      ];
      res.escalones.etapas.forEach(function (e) {
        filas.push([e.n, Number(e.X.toPrecision(7)), Number(e.Y.toPrecision(7)),
          Number(Modelo.aFraccion(e.X).toPrecision(7)), Number(Modelo.aFraccion(e.Y).toPrecision(7))]);
      });
      return filas;
    },
    bajadaEsquema: 'Columna a contracorriente con la etapa 1 en el tope. Se redibuja con el número de etapas; pasá el puntero sobre una etapa para ubicarla en el diagrama.',
    alCambiarCapas: function () { dibujar(); },
    alCambiarPaso: function () { dibujar(); }
  });

  /* ── Controles ── */
  var C = {};
  var g1 = grupo('Gas de alimentación');
  C.Vs = campo({ etiqueta: 'Gas portador (libre de soluto), V′_s', unidad: 'kmol/h', simbolo: 'V′_s', min: 1, max: 1000, paso: 1, dec: 1, limMin: 0.001, limMax: 1e6 },
    p.Vs, function (v) { p.Vs = v; recalcular(); });
  C.yIn = campo({ etiqueta: 'Soluto en el gas de entrada, y_{N+1}', simbolo: 'y_{N+1}', min: 0.005, max: 0.5, paso: 0.001, dec: 4, limMin: 0.00001, limMax: 0.95 },
    p.yIn, function (v) { p.yIn = v; recalcular(); });
  [C.Vs.nodo, C.yIn.nodo].forEach(function (n) { g1.appendChild(n); });

  var g2 = grupo('Especificación del gas tratado');
  C.espec = segmentado({
    leyenda: 'Especificar mediante',
    opciones: [{ valor: 'y', etiqueta: 'y_1' }, { valor: 'recuperacion', etiqueta: 'Recuperación' }]
  }, p.especSalida, function (v) {
    if (res && res.ok) {
      if (v === 'recuperacion') { p.recuperacion = res.recuperacion; C.rec.fijar(p.recuperacion * 100); }
      else { p.yOut = Modelo.aFraccion(res.Y1); C.yOut.fijar(p.yOut); }
    }
    p.especSalida = v; visibilidad(); recalcular();
  });
  C.yOut = campo({ etiqueta: 'Soluto en el gas de salida, y_1', simbolo: 'y_1', min: 0.0005, max: 0.2, paso: 0.0005, dec: 4, limMin: 0.000001, limMax: 0.9 },
    p.yOut, function (v) { p.yOut = v; recalcular(); });
  C.rec = campo({ etiqueta: 'Recuperación del soluto', unidad: '%', simbolo: 'Recuperación', min: 10, max: 99.9, paso: 0.1, dec: 1, limMin: 0.1, limMax: 99.999,
    ayuda: 'Fracción del soluto que ingresa con el gas y queda en el líquido: (Y_{N+1} − Y_1)/Y_{N+1}.' },
    p.recuperacion * 100, function (v) { p.recuperacion = v / 100; recalcular(); });
  [C.espec.nodo, C.yOut.nodo, C.rec.nodo].forEach(function (n) { g2.appendChild(n); });

  var g3 = grupo('Solvente');
  C.x0 = campo({ etiqueta: 'Soluto en el solvente de entrada, x_0', simbolo: 'x_0', min: 0, max: 0.05, paso: 0.0005, dec: 4, limMin: 0, limMax: 0.9 },
    p.x0, function (v) { p.x0 = v; recalcular(); });
  C.modoL = segmentado({
    leyenda: 'Caudal de solvente',
    opciones: [{ valor: 'L', etiqueta: 'L′_s' }, { valor: 'ratio', etiqueta: 'L′_s/L′_{s,mín}' }]
  }, p.modoL, function (v) {
    if (res && res.ok) {
      if (v === 'ratio') { p.lRatio = Math.max(1.0001, res.lRatio); C.ratio.fijar(p.lRatio); }
      else { p.Ls = res.Ls; C.Ls.fijar(p.Ls); }
    }
    p.modoL = v; visibilidad(); recalcular();
  });
  C.Ls = campo({ etiqueta: 'Solvente (libre de soluto), L′_s', unidad: 'kmol/h', simbolo: 'L′_s', min: 1, max: 1000, paso: 1, dec: 1, limMin: 0.001, limMax: 1e6 },
    p.Ls, function (v) { p.Ls = v; recalcular(); });
  C.ratio = campo({ etiqueta: 'Múltiplo del mínimo, L′_s/L′_{s,mín}', simbolo: 'L′_s/L′_{s,mín}', min: 1.01, max: 4, paso: 0.01, dec: 2, limMin: 1.0001, limMax: 50 },
    p.lRatio, function (v) { p.lRatio = v; recalcular(); });
  [C.x0.nodo, C.modoL.nodo, C.Ls.nodo, C.ratio.nodo].forEach(function (n) { g3.appendChild(n); });

  var g4 = grupo('Equilibrio');
  C.modoEq = segmentado({
    leyenda: 'Relación de equilibrio',
    opciones: [
      { valor: 'lineal', etiqueta: 'Y^* = M·X' },
      { valor: 'henry', etiqueta: 'y^* = m·x' },
      { valor: 'tabla', etiqueta: 'Datos X–Y' }
    ]
  }, p.equilibrio.tipo, function (v) { p.equilibrio.tipo = v; visibilidad(); recalcular(); });
  C.M = campo({ etiqueta: 'Pendiente en relaciones molares, M', simbolo: 'M', min: 0.1, max: 5, paso: 0.01, dec: 3, limMin: 0.001, limMax: 1000,
    ayuda: 'Recta de equilibrio en relaciones molares libres de soluto: Y^* = M·X.' },
    p.equilibrio.M, function (v) { p.equilibrio.M = v; recalcular(); });
  C.m = campo({ etiqueta: 'Constante de distribución, m', simbolo: 'm', min: 0.1, max: 5, paso: 0.01, dec: 3, limMin: 0.001, limMax: 1000,
    ayuda: 'Ley de Henry en fracciones molares, y^* = m·x; en relaciones molares resulta Y^* = mX/[1 + (1 − m)X], una curva.' },
    p.equilibrio.m, function (v) { p.equilibrio.m = v; recalcular(); });
  C.metodo = selector({
    etiqueta: 'Interpolación entre datos',
    opciones: [{ valor: 'monotona', etiqueta: 'Cúbica monótona (Fritsch–Carlson)' }, { valor: 'lineal', etiqueta: 'Lineal por tramos' }]
  }, p.equilibrio.metodo, function (v) { p.equilibrio.metodo = v; recalcular(); });
  C.datos = areaDatos({
    etiqueta: 'Pares X, Y (uno por línea)',
    ayuda: 'Relaciones molares libres de soluto: X = x/(1 − x), Y = y/(1 − y). Los datos precargados son ilustrativos y no corresponden a un sistema real: reemplazalos por datos de bibliografía o de laboratorio.'
  }, p.equilibrio.texto, function (v) { p.equilibrio.texto = v; recalcular(); });
  var restaurarDatos = boton('Restaurar datos de ejemplo', 'sim-boton--enlace', function () {
    p.equilibrio.texto = Modelo.PARES_EJEMPLO;
    C.datos.fijar(p.equilibrio.texto);
    recalcular();
  });
  [C.modoEq.nodo, C.M.nodo, C.m.nodo, C.metodo.nodo, C.datos.nodo, restaurarDatos].forEach(function (n) { g4.appendChild(n); });

  var g5 = grupo('Eficiencia de etapa');
  C.E = campo({
    etiqueta: 'Eficiencia de Murphree, E_{MV}', simbolo: 'E_{MV}', min: 0.1, max: 1, paso: 0.01, dec: 2, limMin: 0.01, limMax: 1,
    ayuda: 'E_{MV} = (Y_{n+1} − Y_n) / (Y_{n+1} − Y^*_n), referida a la fase gas.'
  }, p.E, function (v) { p.E = v; recalcular(); });
  g5.appendChild(C.E.nodo);

  [g1, g2, g3, g4, g5].forEach(function (g) { A.controles.appendChild(g); });
  A.cabControles.appendChild(boton('Restablecer', 'sim-boton--sutil', function () {
    p = copiaDefaults();
    C.Vs.fijar(p.Vs); C.yIn.fijar(p.yIn); C.espec.fijar(p.especSalida); C.yOut.fijar(p.yOut);
    C.rec.fijar(p.recuperacion * 100); C.x0.fijar(p.x0); C.modoL.fijar(p.modoL); C.Ls.fijar(p.Ls);
    C.ratio.fijar(p.lRatio); C.modoEq.fijar(p.equilibrio.tipo); C.M.fijar(p.equilibrio.M);
    C.m.fijar(p.equilibrio.m); C.metodo.fijar(p.equilibrio.metodo); C.datos.fijar(p.equilibrio.texto);
    C.E.fijar(p.E);
    A.grafico.restablecerVista();
    visibilidad(); recalcular();
  }, { 'aria-label': 'Restablecer los valores por defecto' }));

  function visibilidad() {
    var t = p.equilibrio.tipo;
    C.M.mostrar(t === 'lineal');
    C.m.mostrar(t === 'henry');
    C.metodo.mostrar(t === 'tabla');
    C.datos.mostrar(t === 'tabla');
    restaurarDatos.hidden = t !== 'tabla';
    C.yOut.mostrar(p.especSalida === 'y');
    C.rec.mostrar(p.especSalida === 'recuperacion');
    C.Ls.mostrar(p.modoL === 'L');
    C.ratio.mostrar(p.modoL === 'ratio');
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

  /* Etapas en el formato del renderizador. La vertical de la última
     etapa (parcial) se corta en Y_{N+1}: más allá del fondo la recta
     de operación no existe físicamente. */
  function adaptar(etapas, Yin, XN) {
    return etapas.map(function (e) {
      return {
        n: e.n, x0: e.X0, y: e.Y, x: e.X,
        y1: e.ultima ? Math.min(e.Y1, Yin) : e.Y1,
        xc: e.ultima && e.Y1 > Yin ? XN : null,
        ultima: e.ultima
      };
    });
  }

  /* ── Escena del diagrama ── */
  function dibujar() {
    var r = res;
    var capas = [];
    var desc = '';
    var dom = { x: [0, 0.1], y: [0, 0.12] };
    if (r && r.ok) {
      var Xs = Math.max(r.XN, r.XNmax || 0, r.X0);
      dom = { x: [0, techo(Xs * 1.1)], y: [0, techo(r.Yin * 1.1)] };
      var eq = r.eq;
      var xEq = Math.min(dom.x[1], isFinite(eq.dominio[1]) ? eq.dominio[1] * 0.999 : Infinity);
      var xLab = eq.x(dom.y[1] * 0.55);
      capas.push({
        tipo: 'curva', clase: 'eq', f: eq.y, x: [0, xEq], n: 300, oculta: !A.visible('eq'),
        etiqueta: { texto: 'Equilibrio', en: isFinite(xLab) ? Math.min(xLab, dom.x[1] * 0.8) : dom.x[1] * 0.6, dx: 40, dy: 30, ancla: 'start', guia: true }
      });
      if (r.p.E < 1) {
        capas.push({ tipo: 'curva', clase: 'ps', f: r.psEquilibrio, x: [r.X0, r.XN], n: 300, oculta: !A.visible('ps') });
      }
      if (A.visible('lmin')) {
        capas.push({
          tipo: 'linea', clase: 'rmin', p: [[r.X0, r.Y1], [r.XNmax, r.Yin]],
          etiqueta: { texto: 'L′_{s,mín}', p: [r.XNmax, r.Yin], dx: 8, dy: 16, ancla: 'start' }
        });
        capas.push({ tipo: 'puntos', clase: 'pinch', items: [{ x: r.pinch.X, y: r.pinch.Y, r: 5 }] });
      }
      if (A.visible('op')) {
        capas.push({
          tipo: 'linea', clase: 'op', p: [[r.X0, r.Y1], [r.XN, r.Yin]],
          etiqueta: { texto: 'Operación', en: r.X0 + (r.XN - r.X0) * 0.42, dx: -12, dy: -10, ancla: 'end' }
        });
      }
      var comp = A.visible('comp');
      capas.push({ tipo: 'guia', x: r.XN, y: r.Yin, oculta: !comp });
      if (A.visible('etapas')) {
        capas.push({
          tipo: 'escalones', clase: 'etapas', etapas: adaptar(r.escalones.etapas, r.Yin, r.XN),
          hasta: A.paso.activo ? A.paso.k : null,
          rotulo: { dx: 7, dy: 15, ancla: 'start' }
        });
      }
      capas.push({
        tipo: 'puntos', clase: 'comp', oculta: !comp, items: [
          { x: r.X0, y: r.Y1, etiqueta: 'Tope (X_0; Y_1)', dx: 64, dy: 44, ancla: 'start', guia: true },
          { x: r.XN, y: r.Yin, etiqueta: 'Fondo (X_N; Y_{N+1})', dx: -10, dy: -10, ancla: 'end' }
        ]
      });
      desc = textoPlano(r);
    } else if (r) {
      desc = 'Especificación no válida: ' + r.errores.join(' ');
    }

    A.grafico.actualizar({
      dominio: dom,
      ejes: {
        xTitulo: 'X — relación molar de soluto en el líquido (libre de soluto)',
        yTitulo: 'Y — relación molar de soluto en el gas (libre de soluto)',
        xCorto: 'X — líquido (libre de soluto)', yCorto: 'Y — gas (libre de soluto)',
        xPlano: 'X', yPlano: 'Y'
      },
      titulo: 'Diagrama de McCabe-Thiele para absorción de gases',
      descripcion: desc,
      mostrar: { grilla: A.visible('grilla'), rotulos: A.visible('rotulos'), numeros: A.visible('numeros') },
      capas: capas
    });
    A.mostrarElemento('ps', !!(r && r.ok && r.p.E < 1));
    if (A.paso.activo && r && r.ok) {
      A.pintarPaso(narrarEtapa(r, A.paso.k));
      A.esquema.resaltar(A.paso.k);
    }
  }

  function textoPlano(r) {
    var e = r.escalones;
    if (!isFinite(e.nFrac)) return 'Infinitas etapas: el caudal de solvente no supera el mínimo (L′s mínimo = ' + fmt(r.Lmin, 2) + ' kmol/h).';
    return 'Se requieren ' + e.n + (r.p.E < 1 ? ' etapas reales' : ' etapas teóricas') + ' (' + fmt(e.nFrac, 2) + ' en la construcción gráfica).';
  }

  function pintarResultados() {
    var r = res;
    if (!r.ok) {
      A.kpis([{ etiqueta: 'Resultado', valor: '—', nota: 'especificación no válida' }]);
      pintarEsquema(null);
      avisos(A.avisos, r.errores.map(function (t) { return { nivel: 'error', texto: t }; }).concat(r.avisos));
      ficha(A.ficha, []);
      A.tbody.replaceChildren();
      A.lectura.replaceChildren(el('p', null, 'Corregí los valores marcados para ver la interpretación del diagrama.'));
      A.anunciar('Especificación no válida.');
      return;
    }
    var e = r.escalones;
    var finito = isFinite(e.nFrac);
    A.kpis([
      {
        etiqueta: r.p.E < 1 ? 'Etapas reales' : 'Etapas teóricas',
        valor: finito ? String(e.n) : '∞',
        nota: !finito ? 'L′_s no supera L′_{s,mín}'
          : fmt(e.nFrac, 2) + ' en la construcción' + (r.p.E < 1 && isFinite(r.teorico.nFrac) ? ' · ' + r.teorico.n + ' teóricas' : ''),
        destacado: true
      },
      { etiqueta: 'Solvente mínimo, L′_{s,mín}', valor: fmt(r.Lmin, 1), nota: 'kmol/h · L′_s/L′_{s,mín} = ' + fmt(r.lRatio, 2) },
      { etiqueta: 'Recuperación', valor: fmt(r.recuperacion * 100, 1) + ' %', nota: 'del soluto alimentado' },
      { etiqueta: 'Líquido de salida, X_N', valor: fmtSig(r.XN, 4), nota: 'x_N = ' + fmtSig(Modelo.aFraccion(r.XN), 4) }
    ]);
    avisos(A.avisos, r.avisos);
    A.anunciar(textoPlano(r));
    pintarEsquema(r);

    var items = [
      { termino: 'Gas de entrada, Y_{N+1}', valor: fmtSig(r.Yin, 5), nota: 'y_{N+1} = ' + fmtSig(r.p.yIn, 4) },
      { termino: 'Gas tratado, Y_1', valor: fmtSig(r.Y1, 5), nota: 'y_1 = ' + fmtSig(Modelo.aFraccion(r.Y1), 4) },
      { termino: 'Solvente de entrada, X_0', valor: fmtSig(r.X0, 5) },
      { termino: 'Líquido de salida, X_N', valor: fmtSig(r.XN, 5), nota: 'máximo en equilibrio: ' + fmtSig(r.XNmax, 5) },
      { termino: 'Solvente mínimo, L′_{s,mín}', valor: fmt(r.Lmin, 2) + ' kmol/h', nota: r.pinch.tipo === 'fondo' ? 'pinch en el fondo de la columna' : 'pinch tangente en X = ' + fmtSig(r.pinch.X, 4) },
      { termino: 'Solvente de operación, L′_s', valor: fmt(r.Ls, 2) + ' kmol/h', nota: 'L′_s/L′_{s,mín} = ' + fmt(r.lRatio, 3) },
      { termino: 'Pendiente de operación, L′_s/V′_s', valor: fmt(r.LV, 4) },
      { termino: 'Recuperación del soluto', valor: fmt(r.recuperacion * 100, 2) + ' %' },
      { termino: 'Soluto absorbido', valor: fmt(r.soluto, 3) + ' kmol/h', nota: 'V′_s (Y_{N+1} − Y_1)' },
      { termino: 'Etapas teóricas', valor: fmtEtapas(r.teorico), nota: 'construcción gráfica' }
    ];
    if (r.p.E < 1) items.push({ termino: 'Etapas reales (E_{MV} = ' + fmt(r.p.E, 2) + ')', valor: fmtEtapas(e) });
    if (r.kremser.aplica) {
      items.push({ termino: 'Factor de absorción, A', valor: fmt(r.kremser.A, 4), nota: 'A = L′_s/(M V′_s)' });
      items.push({ termino: 'Etapas teóricas (Kremser)', valor: isFinite(r.kremser.N) ? fmt(r.kremser.N, 3) : '∞', nota: 'verificación analítica' });
      if (r.p.E < 1) items.push({ termino: 'Eficiencia global, E_o (Lewis)', valor: fmt(r.kremser.Eo, 4), nota: 'N_{reales} ≈ ' + fmt(r.kremser.Nreal, 3) });
    } else {
      items.push({ termino: 'Kremser', valor: 'no aplica', nota: 'exige equilibrio lineal en relaciones molares' });
    }
    ficha(A.ficha, items);

    A.limpiarFilas();
    A.thead.replaceChildren();
    var trh = el('tr');
    ['Etapa', 'X_n', 'Y_n', 'x_n', 'y_n'].forEach(function (h, i) {
      trh.appendChild(elNotacion('th', i > 0 ? 'sim-tabla__num' : null, h, { scope: 'col' }));
    });
    A.thead.appendChild(trh);
    A.tbody.replaceChildren();
    e.etapas.forEach(function (et) {
      var tr = el('tr');
      tr.appendChild(el('th', null, String(et.n), { scope: 'row' }));
      tr.appendChild(el('td', 'sim-tabla__num', fmtSig(et.X, 5)));
      tr.appendChild(el('td', 'sim-tabla__num', fmtSig(et.Y, 5)));
      tr.appendChild(el('td', 'sim-tabla__num', fmtSig(Modelo.aFraccion(et.X), 5)));
      tr.appendChild(el('td', 'sim-tabla__num', fmtSig(Modelo.aFraccion(et.Y), 5)));
      A.registrarFila(et.n, tr);
      A.tbody.appendChild(tr);
    });
    A.notaTabla.replaceChildren();
    enHTML(A.notaTabla, 'Etapas numeradas desde el tope. X_n es el líquido que abandona la etapa n e Y_n el gas que sale de ella hacia la etapa superior. Las mayúsculas son relaciones molares libres de soluto; las minúsculas, fracciones molares.' +
      (r.p.E < 1 ? ' Con E_{MV} < 1, Y_n proviene del pseudoequilibrio.' : ''));

    pintarLectura(r);
  }

  /* ── Esquema del equipo + resumen de corrientes ── */
  function pintarEsquema(r) {
    var kmol = ' kmol/h';
    if (!r) {
      A.esquema.dibujar({
        tipo: 'absorcion', n: Infinity, titulo: 'Esquema de la columna de absorción',
        descripcion: 'Especificación no válida.',
        Lin: ['—'], Gout: ['—'], Gin: ['—'], Lout: ['—'], LV: '', soluto: ''
      });
      A.corrientes.replaceChildren();
      A.notaCorrientes.textContent = 'Corregí la especificación para ver las corrientes.';
      return;
    }
    var c = {};
    r.corrientes.forEach(function (k) { c[k.id] = k; });
    var e = r.escalones;
    var finito = isFinite(e.nFrac);
    A.esquema.dibujar({
      tipo: 'absorcion',
      n: finito ? e.n : Infinity,
      real: r.p.E < 1,
      titulo: 'Esquema de la columna de absorción',
      descripcion: finito
        ? 'Columna de ' + e.n + ' etapas. Gas de entrada con Y_N+1 = ' + fmtSig(c.Gin.R, 4) +
          ', gas tratado con Y_1 = ' + fmtSig(c.Gout.R, 4) + ', líquido de salida con X_N = ' + fmtSig(c.Lout.R, 4) + '.'
        : 'Con un caudal de solvente menor o igual que el mínimo se requerirían infinitas etapas.',
      Lin: ['L′_s = ' + fmt(c.Lin.libre, 1) + kmol, 'X_0 = ' + fmtSig(c.Lin.R, 4)],
      Gout: ['V′_s = ' + fmt(c.Gout.libre, 1) + kmol, 'Y_1 = ' + fmtSig(c.Gout.R, 4), 'y_1 = ' + fmtSig(c.Gout.f, 4)],
      Gin: ['V′_s = ' + fmt(c.Gin.libre, 1) + kmol, 'Y_{N+1} = ' + fmtSig(c.Gin.R, 4), 'y_{N+1} = ' + fmtSig(c.Gin.f, 4)],
      Lout: ['L′_s = ' + fmt(c.Lout.libre, 1) + kmol, 'X_N = ' + fmtSig(c.Lout.R, 4), 'x_N = ' + fmtSig(c.Lout.f, 4)],
      LV: 'L′_s/V′_s = ' + fmt(r.LV, 3),
      soluto: 'Absorbido: ' + fmt(r.soluto, 2) + kmol
    });

    var t = A.corrientes;
    t.replaceChildren();
    t.appendChild(el('caption', 'sr-only', 'Caudales y composiciones de las corrientes de la columna'));
    var thead = el('thead');
    var trh = el('tr');
    ['Corriente', 'Libre de soluto (kmol/h)', 'Total (kmol/h)', 'Relación molar', 'Fracción molar'].forEach(function (h, i) {
      trh.appendChild(el('th', i ? 'sim-tabla__num' : null, h, { scope: 'col' }));
    });
    thead.appendChild(trh);
    t.appendChild(thead);
    var tb = el('tbody');
    r.corrientes.forEach(function (k, i) {
      var tr = el('tr', i === 2 ? 'is-separador' : null);
      tr.appendChild(el('th', null, k.nombre, { scope: 'row' }));
      tr.appendChild(el('td', 'sim-tabla__num', fmt(k.libre, 2)));
      tr.appendChild(el('td', 'sim-tabla__num', fmt(k.total, 2)));
      tr.appendChild(el('td', 'sim-tabla__num', fmtSig(k.R, 4)));
      tr.appendChild(el('td', 'sim-tabla__num', fmtSig(k.f, 4)));
      tb.appendChild(tr);
    });
    t.appendChild(tb);
    A.notaCorrientes.replaceChildren();
    enHTML(A.notaCorrientes, 'Soluto absorbido: V′_s (Y_{N+1} − Y_1) = L′_s (X_N − X_0) = ' + fmt(r.soluto, 3) +
      ' kmol/h · recuperación ' + fmt(r.recuperacion * 100, 2) + ' %. El caudal total es el caudal libre de soluto multiplicado por (1 + relación molar).');
  }

  function fmtEtapas(e) {
    if (!isFinite(e.nFrac)) return '∞';
    return e.n + ' (' + fmt(e.nFrac, 2) + ')';
  }

  function narrarEtapa(r, k) {
    var e = r.escalones.etapas[k - 1];
    var span = el('span');
    if (!e) return span;
    var curva = r.p.E < 1 ? 'el pseudoequilibrio' : 'la curva de equilibrio';
    var t;
    if (k === 1) {
      t = 'Etapa 1. El gas tratado sale del tope con Y_1 = ' + fmtSig(e.Y, 4) + ' y el solvente entra con X_0 = ' +
        fmtSig(e.X0, 4) + '. La horizontal desde (X_0; Y_1) hasta ' + curva + ' da X_1 = ' + fmtSig(e.X, 4) + ', el líquido que abandona la etapa 1.';
    } else {
      t = 'Etapa ' + k + '. Desde (X_{' + (k - 1) + '}; Y_{' + k + '}) = (' + fmtSig(e.X0, 4) + '; ' + fmtSig(e.Y, 4) +
        ') sobre la recta de operación, la horizontal hasta ' + curva + ' da X_{' + k + '} = ' + fmtSig(e.X, 4) + '.';
    }
    if (e.ultima) {
      var f = (r.XN - e.X0) / (e.X - e.X0);
      t += ' Como X_{' + k + '} ≥ X_N = ' + fmtSig(r.XN, 4) + ', la construcción termina: la última etapa cubre una fracción ' + fmt(f, 2) + ' del escalón.';
    } else {
      t += ' La vertical hasta la recta de operación da Y_{' + (k + 1) + '} = ' + fmtSig(e.Y1, 4) + ', el gas que asciende desde la etapa ' + (k + 1) + '.';
    }
    return enHTML(span, t);
  }

  function pintarLectura(r) {
    var par = [];
    if (!isFinite(r.escalones.nFrac)) {
      par.push('Con L′_s ≤ L′_{s,mín} la recta de operación toca la curva de equilibrio: la fuerza impulsora se anula en el pinch y se requerirían infinitas etapas. Aumentá el caudal de solvente.');
    } else if (r.lRatio < 1.1) {
      par.push('L′_s/L′_{s,mín} = ' + fmt(r.lRatio, 2) + ': la recta de operación casi toca la curva de equilibrio y los escalones se apiñan cerca del pinch; el número de etapas es muy sensible al caudal de solvente.');
    } else {
      par.push('L′_s/L′_{s,mín} = ' + fmt(r.lRatio, 2) + ': aumentar el solvente hace más empinada la recta de operación, la aleja del equilibrio y reduce las etapas, pero diluye el líquido de salida (X_N = ' + fmtSig(r.XN, 4) + ') y encarece su regeneración.');
    }
    par.push(r.pinch.tipo === 'fondo'
      ? 'El solvente mínimo queda fijado en el fondo de la columna: con L′_{s,mín} el líquido saldría en equilibrio con el gas de entrada, X_N = X^*(Y_{N+1}).'
      : 'El solvente mínimo queda fijado por un pinch tangente en X = ' + fmtSig(r.pinch.X, 4) + ': la curvatura del equilibrio hace que la recta de operación lo toque antes de llegar al fondo.');
    if (r.kremser.aplica) {
      par.push('Factor de absorción A = ' + fmt(r.kremser.A, 3) + (r.kremser.A > 1
        ? ': mayor que 1, de modo que con suficientes etapas la recuperación puede acercarse al 100 %.'
        : ': menor que 1, por lo que la recuperación queda acotada aun con infinitas etapas.') +
        ' Con equilibrio lineal, la ecuación de Kremser da ' + (isFinite(r.kremser.N) ? fmt(r.kremser.N, 2) : '∞') + ' etapas teóricas, coherente con la construcción gráfica.');
    }
    if (r.p.E < 1) {
      par.push('Con E_{MV} = ' + fmt(r.p.E, 2) + ' cada etapa real solo recorre esa fracción de la distancia vertical entre la recta de operación y el equilibrio: el pseudoequilibrio (trazo discontinuo) queda entre ambas y se necesitan ' + r.escalones.n + ' etapas en lugar de ' + r.teorico.n + '.');
    }
    par.push('En relaciones molares libres de soluto la recta de operación es exactamente recta aunque el caudal total de gas y de líquido cambie a lo largo de la columna; expresada en fracciones molares sería una curva.');
    A.lectura.replaceChildren();
    par.forEach(function (t) { A.lectura.appendChild(enHTML(el('p'), t)); });
  }

  visibilidad();
  recalcular();
}
