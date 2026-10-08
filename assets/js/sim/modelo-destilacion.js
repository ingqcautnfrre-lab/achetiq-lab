/* ============================================================
   AChETIQ — Simulador · McCabe-Thiele, destilación binaria
   (modelo-destilacion.js)
   ------------------------------------------------------------
   Módulo PURO (sin DOM). calcular(params) devuelve la
   construcción completa del diagrama x–y y los resultados.

   HIPÓTESIS DEL MODELO
     · Mezcla binaria; presión constante.
     · Flujo molar constante (CMO) en cada sección.
     · Condensador total (x_D = y_1); reboiler parcial contado
       como una etapa de equilibrio (ideal).
     · Eficiencia de Murphree de vapor E_MV uniforme en los platos;
       el reboiler se escalona sobre la curva de equilibrio real.
     · Alimentación en la etapa óptima, especificada por su fracción
       vaporizada f = 1 − q = (H_F − H_L)/(H_V − H_L).

   ECUACIONES
     Equilibrio (α constante):   y* = αx / [1 + (α − 1)x]
     Rectificación:              y = R/(R+1)·x + x_D/(R+1)
     Recta de alimentación:      y = −(1−f)/f·x + x_F/f
                                 (vertical en x = x_F si f = 0)
     Agotamiento:                recta por (x_B, x_B) y por la
                                 intersección de las dos anteriores
     Pseudoequilibrio:           y_ps = y_op + E_MV (y* − y_op)
     Balance global:             D/F = (x_F − x_B)/(x_D − x_B)
     Fenske (α constante):       N_min = ln[(x_D/(1−x_D))·((1−x_B)/x_B)] / ln α
     Caudales de agotamiento:    L̄ = L + (1 − f)F;  V̄ = V − fF
     Underwood (binario):        Σ α_i x_F,i/(α_i − θ) = f
                                 R_min + 1 = Σ α_i x_D,i/(α_i − θ)
   ============================================================ */

'use strict';

import { raiz, maximoEn, parsearPares } from './numerico.js';
import { alfaConstante, tablaXY } from './equilibrio.js';

export var MAX_ETAPAS = 150;

/* Pares x–y ILUSTRATIVOS para el modo tabulado: su volatilidad
   relativa implícita decrece de ≈6,3 (x = 0,05) a ≈1,3 (x = 0,90),
   de modo que la curva se aplana cerca del tope y muestra un pinch
   tangente en la sección de rectificación.
   NO corresponden a ningún sistema real: el usuario debe
   reemplazarlos por datos de bibliografía. */
export var PARES_EJEMPLO =
  '0.00, 0.000\n0.05, 0.250\n0.10, 0.392\n0.15, 0.480\n0.20, 0.540\n' +
  '0.30, 0.618\n0.40, 0.672\n0.50, 0.717\n0.60, 0.760\n0.70, 0.806\n' +
  '0.80, 0.857\n0.90, 0.919\n1.00, 1.000';

export var DEFAULTS = {
  equilibrio: { tipo: 'alfa', alfa: 2.5, texto: PARES_EJEMPLO, metodo: 'monotona' },
  xF: 0.45,
  xD: 0.98,
  xB: 0.02,
  f: 0.2,
  modoR: 'R',
  R: 2,
  rRatio: 1.3,
  E: 1,
  F: 100
};

/* ── Rectas de operación para una relación de reflujo R ───────── */
function rectas(R, xF, xD, xB, q) {
  var s = R / (R + 1);
  var xi;
  if (Math.abs(q - 1) < 1e-12) {
    xi = xF;
  } else {
    var k = q / (q - 1);
    if (Math.abs(s - k) < 1e-12) return null;
    xi = (xF * (1 - k) - (1 - s) * xD) / (s - k);
  }
  var yi = s * xi + (1 - s) * xD;
  if (!(xi > xB) || !(xi < xD)) return null;
  var ms = (yi - xB) / (xi - xB);
  return {
    s: s,
    ms: ms,
    xi: xi,
    yi: yi,
    rect: function (x) { return xD + s * (x - xD); },
    strip: function (x) { return xB + ms * (x - xB); },
    op: function (x) { return x >= xi ? xD + s * (x - xD) : xB + ms * (x - xB); }
  };
}

/* Holgura mínima entre la curva de equilibrio y las rectas de
   operación en [x_B, x_D]. > 0: construcción factible. Devuelve
   también la abscisa donde la holgura es mínima (pinch). */
function holgura(eq, R, xF, xD, xB, q) {
  var L = rectas(R, xF, xD, xB, q);
  if (!L) return { valor: -1, x: NaN };
  var a = maximoEn(function (x) { return L.rect(x) - eq.y(x); }, L.xi, xD, 300);
  var b = maximoEn(function (x) { return L.strip(x) - eq.y(x); }, xB, L.xi, 300);
  return a.valor >= b.valor
    ? { valor: -a.valor, x: a.x, seccion: 'rect' }
    : { valor: -b.valor, x: b.x, seccion: 'strip' };
}

/* R_min general: menor R con holgura ≥ 0. Bisección sobre R (la
   holgura crece con R). Cubre pinch en la recta q y pinch
   tangente en cualquiera de las dos secciones. */
function reflujoMinimo(eq, xF, xD, xB, q) {
  var hi = 1;
  while (holgura(eq, hi, xF, xD, xB, q).valor <= 0 && hi < 1e5) hi *= 2;
  if (hi >= 1e5) return null;
  var lo = 0;
  for (var i = 0; i < 80; i++) {
    var m = 0.5 * (lo + hi);
    if (holgura(eq, m, xF, xD, xB, q).valor > 0) hi = m; else lo = m;
    if (hi - lo < 1e-11 * Math.max(1, hi)) break;
  }
  var h = holgura(eq, hi, xF, xD, xB, q);
  var L = rectas(hi, xF, xD, xB, q);
  var tipo = (L && Math.abs(h.x - L.xi) < 1e-4) ? 'alimentacion' : 'tangente';
  return { R: hi, x: h.x, y: eq.y(h.x), tipo: tipo, seccion: h.seccion };
}

/* Underwood para un binario de α constante (componente pesado con
   volatilidad relativa 1). θ es la raíz entre 1 y α. */
export function underwood(alfa, xF, xD, q) {
  var f = function (t) { return alfa * xF / (alfa - t) + (1 - xF) / (1 - t) - (1 - q); };
  var th = raiz(f, 1 + 1e-12, alfa - 1e-12);
  if (th == null) return NaN;
  return alfa * xD / (alfa - th) + (1 - xD) / (1 - th) - 1;
}

export function fenske(alfa, xD, xB) {
  return Math.log((xD / (1 - xD)) * ((1 - xB) / xB)) / Math.log(alfa);
}

/* Escalonamiento desde (x_D, x_D) entre la recta de operación
   op(x) y el pseudoequilibrio. xi = abscisa de cambio de sección
   (para reflujo total, xi = −∞ y op es la diagonal).
   Reboiler ideal: en cada etapa se prueba primero la horizontal
   hasta la curva de equilibrio REAL; si ya alcanza x_B, esa etapa
   es el reboiler parcial (etapa de equilibrio) y la construcción
   termina. Si no, la etapa es un plato y escalona sobre el
   pseudoequilibrio. Como el pseudoequilibrio queda entre la recta
   de operación y la curva, x_ps ≥ x_eq: ningún plato puede cruzar
   x_B antes que el reboiler. Con E = 1 coincide con el
   escalonamiento clásico. */
function escalonar(eq, op, xi, xD, xB, E) {
  var ps = function (x) { var o = op(x); return o + E * (eq.y(x) - o); };
  var etapas = [];
  var xPrev = xD, y = xD, alim = null, pinch = false;
  for (var n = 1; n <= MAX_ETAPAS; n++) {
    var yy = y;
    var xEq = raiz(function (x) { return eq.y(x) - yy; }, 0, xPrev);
    var esReboiler = xEq != null && xEq <= xB;
    var xn = esReboiler ? xEq : raiz(function (x) { return ps(x) - yy; }, 0, xPrev);
    if (xn == null || xPrev - xn < 1e-9) { pinch = true; break; }
    var seccion = 'rect';
    if (alim == null && xn < xi) { alim = n; seccion = 'alimentacion'; }
    else if (alim != null) seccion = 'strip';
    if (esReboiler) {
      var frac = (xPrev - xB) / (xPrev - xn);
      etapas.push({ n: n, x0: xPrev, y: y, x: xn, y1: xn, seccion: seccion, ultima: true, ideal: true });
      return { etapas: etapas, nFrac: n - 1 + frac, n: n, alim: alim, pinch: false, tope: false };
    }
    var yNext = op(xn);
    etapas.push({ n: n, x0: xPrev, y: y, x: xn, y1: yNext, seccion: seccion, ultima: false });
    xPrev = xn;
    y = yNext;
  }
  return {
    etapas: etapas,
    nFrac: Infinity,
    n: etapas.length,
    alim: alim,
    pinch: pinch,
    tope: !pinch
  };
}

/* Extremo superior de la recta q: su intersección con la curva de
   equilibrio (para el trazado). */
function extremoRectaQ(eq, xF, q) {
  if (Math.abs(q - 1) < 1e-12) return { x: xF, y: eq.y(xF) };
  var k = q / (q - 1);
  var lin = function (x) { return xF + k * (x - xF); };
  var g = function (x) { return lin(x) - eq.y(x); };
  var x = (k >= 1) ? raiz(g, xF, 1) : raiz(g, 0, xF);
  if (x == null) return null;
  return { x: x, y: lin(x) };
}

export function construirEquilibrio(cfg) {
  if (cfg.tipo === 'tabla') {
    var lectura = parsearPares(cfg.texto);
    return { modelo: tablaXY(lectura.pares, cfg.metodo), lectura: lectura };
  }
  return { modelo: alfaConstante(cfg.alfa), lectura: null };
}

export function calcular(p, eqConstruido) {
  var res = { ok: false, errores: [], avisos: [], p: p };
  /* La especificación usa f; las rectas se escriben con q = 1 − f. */
  var xF = p.xF, xD = p.xD, xB = p.xB, q = 1 - p.f, E = p.E;
  var eq = eqConstruido.modelo;
  var lectura = eqConstruido.lectura;
  res.eq = eq;

  /* ── Validación de la especificación ── */
  if (!(xB > 0 && xB < xF && xF < xD && xD < 1)) {
    res.errores.push('Las composiciones deben cumplir 0 < x_B < x_F < x_D < 1.');
  }
  if (!isFinite(p.f)) res.errores.push('La fracción vaporizada f debe ser un número.');
  if (!(E > 0 && E <= 1)) res.errores.push('La eficiencia de Murphree debe estar en (0, 1].');
  if (!(p.F > 0)) res.errores.push('El caudal de alimentación F debe ser positivo.');
  if (eq.tipo === 'alfa' && !(eq.alfa > 1)) {
    res.errores.push('La volatilidad relativa debe ser mayor que 1.');
  }
  if (eq.tipo === 'tabla') {
    if (lectura.errores.length) {
      res.avisos.push({ nivel: 'aviso', texto: 'Se ignoraron ' + lectura.errores.length +
        ' línea(s) de datos que no pudieron leerse (línea ' +
        lectura.errores.map(function (e) { return e.linea; }).join(', ') + ').' });
    }
    if (lectura.pares.filter(function (pp) { return pp[0] > 0 && pp[0] < 1; }).length < 2) {
      res.errores.push('Se necesitan al menos dos pares x–y interiores (0 < x < 1).');
    } else if (!eq.monotona) {
      res.errores.push('Los datos de equilibrio deben ser crecientes en y.');
    }
  }
  if (res.errores.length) return res;

  if (eq.tipo === 'tabla') {
    var cruza = eq.azeotropos.filter(function (a) { return a > xB && a < xD; });
    if (cruza.length) {
      res.errores.push('La curva de equilibrio cruza la diagonal en x ≈ ' +
        cruza.map(function (a) { return a.toFixed(3).replace('.', ','); }).join('; ') +
        ' (azeótropo): esa composición no puede superarse por destilación convencional.');
      return res;
    }
    if (eq.y(xD) <= xD || eq.y(xB) <= xB) {
      res.errores.push('En el intervalo [x_B, x_D] la curva de equilibrio debe quedar por encima de la diagonal.');
      return res;
    }
  }

  /* ── Reflujo mínimo ── */
  var rmin = reflujoMinimo(eq, xF, xD, xB, q);
  if (!rmin) {
    res.errores.push('No existe una relación de reflujo finita que satisfaga la especificación con este equilibrio.');
    return res;
  }
  res.Rmin = rmin.R;
  res.pinch = rmin;
  res.rectasMin = rectas(rmin.R, xF, xD, xB, q);
  if (eq.tipo === 'alfa') {
    res.RminUnderwood = underwood(eq.alfa, xF, xD, q);
    res.NminFenske = fenske(eq.alfa, xD, xB);
  }

  var R = p.modoR === 'ratio' ? p.rRatio * rmin.R : p.R;
  res.R = R;
  res.rRatio = R / rmin.R;
  var L = rectas(R, xF, xD, xB, q);
  if (!L) {
    res.errores.push(R < rmin.R
      ? 'R = ' + R.toFixed(3).replace('.', ',') + ' es menor que R_{mín} = ' +
        rmin.R.toFixed(3).replace('.', ',') + ': las rectas de operación no se cortan dentro del intervalo [x_B, x_D].'
      : 'Con R = ' + R.toFixed(3).replace('.', ',') +
        ' la intersección de las rectas de operación cae fuera del intervalo [x_B, x_D].');
    return res;
  }
  res.rectas = L;
  res.qExtremo = extremoRectaQ(eq, xF, q);

  /* ── Balances (F, D, B, caudales internos) ── */
  var F = p.F;
  var D = F * (xF - xB) / (xD - xB);
  var B = F - D;
  var Lr = R * D, V = (R + 1) * D;
  var Ls = Lr + (1 - p.f) * F, Vs = V - p.f * F;
  res.balance = {
    F: F, D: D, B: B, L: Lr, V: V, Lb: Ls, Vb: Vs,
    LV: L.s, LVb: Ls / Vs, VbB: Vs / B,
    recD: D * xD / (F * xF),
    recB: B * (1 - xB) / (F * (1 - xF))
  };
  if (!(Vs > 0)) {
    res.errores.push('El caudal de vapor en la sección de agotamiento resulta V̄ ≤ 0: aumentá R o disminuí f.');
    return res;
  }

  /* ── Escalonamiento: real (E_MV) y teórico (E = 1) ── */
  var real = escalonar(eq, L.op, L.xi, xD, xB, E);
  res.escalones = real;
  res.teorico = (E < 1) ? escalonar(eq, L.op, L.xi, xD, xB, 1) : real;
  res.psEquilibrio = function (x) { var o = L.op(x); return o + E * (eq.y(x) - o); };

  /* N_min a reflujo total (diagonal como recta de operación, E = 1). */
  var total = escalonar(eq, function (x) { return x; }, -Infinity, xD, xB, 1);
  res.reflujoTotal = total;
  res.Nmin = total.nFrac;

  if (R <= rmin.R * (1 + 1e-9)) {
    res.avisos.push({ nivel: 'error', texto: 'R ≤ R_{mín}: las rectas de operación tocan o cruzan la curva de equilibrio (pinch). Se requerirían infinitas etapas.' });
  } else if (real.pinch) {
    res.avisos.push({ nivel: 'error', texto: 'La construcción se detiene en un pinch: la recta de operación alcanza la curva antes de x_B.' });
  } else if (real.tope) {
    res.avisos.push({ nivel: 'aviso', texto: 'Se alcanzó el tope de ' + MAX_ETAPAS + ' etapas sin llegar a x_B.' });
  } else if (res.rRatio < 1.1) {
    res.avisos.push({ nivel: 'info', texto: 'R/R_{mín} < 1,1: la columna opera cerca del pinch y el número de etapas es muy sensible a R.' });
  }
  if (eq.tipo === 'tabla' && eq.azeotropos.length) {
    res.avisos.push({ nivel: 'info', texto: 'Los datos presentan un azeótropo en x ≈ ' +
      eq.azeotropos.map(function (a) { return a.toFixed(3).replace('.', ','); }).join('; ') +
      ', fuera del intervalo de separación especificado.' });
  }

  /* ── Resumen de corrientes (esquema del equipo) ──
     Condensador total: el vapor de tope y el reflujo tienen la
     composición del destilado. Las corrientes del reboiler toman las
     composiciones de la construcción: líquido que baja de la etapa
     N − 1 y vapor que sale de la etapa N (reboiler). */
  var et = real.etapas;
  var finita = isFinite(real.nFrac) && et.length > 0;
  var ultima = finita ? et[et.length - 1] : null;
  var penultima = finita && et.length > 1 ? et[et.length - 2] : null;
  res.corrientes = [
    { id: 'F', nombre: 'Alimentación', caudal: F, x: xF },
    { id: 'D', nombre: 'Destilado', caudal: D, x: xD },
    { id: 'B', nombre: 'Residuo', caudal: B, x: xB },
    { id: 'L', nombre: 'Reflujo', caudal: Lr, x: xD },
    { id: 'V', nombre: 'Vapor de tope', caudal: V, x: xD },
    { id: 'Lb', nombre: 'Líquido al reboiler', caudal: Ls, x: penultima ? penultima.x : NaN },
    { id: 'Vb', nombre: 'Vapor del reboiler', caudal: Vs, x: ultima ? ultima.y : NaN }
  ];

  res.ok = true;
  return res;
}
