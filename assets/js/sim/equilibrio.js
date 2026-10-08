/* ============================================================
   AChETIQ — Simuladores · modelos de equilibrio (equilibrio.js)
   ------------------------------------------------------------
   Módulo PURO. Cada modelo expone la misma interfaz:
     { tipo, y(x), x(y), dominio:[min, max], datos?, azeotropos? }
   donde y(x) es la composición de equilibrio del vapor/gas en
   función de la del líquido, y x(y) su inversa (por fórmula
   cerrada o por bisección sobre la función creciente).

   Destilación binaria (fracciones molares del más volátil):
     · alfaConstante(α)        y* = αx / [1 + (α − 1)x]
     · tablaXY(pares, método)  datos x–y interpolados; se fuerzan
                               los extremos (0,0) y (1,1) y se
                               detectan azeótropos (cruces y = x).

   Absorción (relaciones molares libres de soluto, X = x/(1−x),
   Y = y/(1−y)):
     · linealRelaciones(M)     Y* = M·X
     · henryFracciones(m)      y* = m·x  →  Y* = mX / [1 + (1 − m)X]
     · tablaRelaciones(pares)  datos X–Y interpolados.
   ============================================================ */

'use strict';

import { raiz, interpolador } from './numerico.js';

/* ── Destilación ─────────────────────────────────────────────── */

export function alfaConstante(alfa) {
  return {
    tipo: 'alfa',
    alfa: alfa,
    dominio: [0, 1],
    y: function (x) { return alfa * x / (1 + (alfa - 1) * x); },
    x: function (y) { return y / (alfa - (alfa - 1) * y); },
    azeotropos: []
  };
}

export function tablaXY(pares, metodo) {
  var nodos = pares.filter(function (p) {
    return p[0] > 0 && p[0] < 1;
  }).slice();
  nodos.unshift([0, 0]);
  nodos.push([1, 1]);
  var xs = nodos.map(function (p) { return p[0]; });
  var ys = nodos.map(function (p) { return p[1]; });
  var f = interpolador(xs, ys, metodo);
  var y = function (x) { return Math.min(1, Math.max(0, f(x))); };

  /* Cruces interiores de y*(x) − x: azeótropos. Se buscan sobre una
     malla fina y se refinan por bisección. */
  var azeotropos = [];
  var N = 2000, prev = y(1e-6) - 1e-6;
  for (var i = 1; i < N; i++) {
    var xi = i / N;
    var g = y(xi) - xi;
    if (g === 0 || (g < 0) !== (prev < 0)) {
      var a = (i - 1) / N;
      var r = raiz(function (t) { return y(t) - t; }, a, xi);
      if (r != null && r > 1e-4 && r < 1 - 1e-4) azeotropos.push(r);
    }
    prev = g;
  }

  var monotona = true;
  for (var k = 1; k < ys.length; k++) if (ys[k] < ys[k - 1]) monotona = false;

  return {
    tipo: 'tabla',
    dominio: [0, 1],
    datos: pares,
    monotona: monotona,
    azeotropos: azeotropos,
    y: y,
    x: function (yy) {
      var r = raiz(function (t) { return y(t) - yy; }, 0, 1);
      return r == null ? NaN : r;
    }
  };
}

/* ── Absorción (relaciones molares) ──────────────────────────── */

export function linealRelaciones(M) {
  return {
    tipo: 'lineal',
    M: M,
    dominio: [0, Infinity],
    y: function (X) { return M * X; },
    x: function (Y) { return Y / M; }
  };
}

/* y* = m·x en fracciones molares, expresada en relaciones molares.
   Derivación: con x = X/(1+X) e y = Y/(1+Y), Y/(1+Y) = mX/(1+X)
   ⇒ Y* = mX / [1 + (1 − m)X]. Para m > 1 la función diverge en
   X = 1/(m − 1) (y* → 1): el dominio físico se acota allí. */
export function henryFracciones(m) {
  var Xlim = m > 1 ? 1 / (m - 1) : Infinity;
  return {
    tipo: 'henry',
    m: m,
    dominio: [0, Xlim],
    y: function (X) {
      var den = 1 + (1 - m) * X;
      return den > 0 ? m * X / den : Infinity;
    },
    x: function (Y) { return Y / (m + (m - 1) * Y); }
  };
}

export function tablaRelaciones(pares, metodo) {
  var nodos = pares.filter(function (p) { return p[0] >= 0 && p[1] >= 0; });
  if (!nodos.length || nodos[0][0] > 0) nodos.unshift([0, 0]);
  var xs = nodos.map(function (p) { return p[0]; });
  var ys = nodos.map(function (p) { return p[1]; });
  var f = interpolador(xs, ys, metodo);
  var Xmax = xs[xs.length - 1];
  var monotona = true;
  for (var k = 1; k < ys.length; k++) if (ys[k] <= ys[k - 1]) monotona = false;
  var y = function (X) { return f(X); };
  return {
    tipo: 'tabla',
    datos: pares,
    monotona: monotona,
    rangoDatos: [xs[0], Xmax],
    dominio: [0, Infinity],
    y: y,
    x: function (Y) {
      /* Acotamiento creciente: la extrapolación lineal permite
         invertir algo más allá del último dato (con aviso). */
      var hi = Math.max(Xmax, 1e-6);
      for (var i = 0; i < 60 && y(hi) < Y; i++) hi *= 2;
      var r = raiz(function (t) { return y(t) - Y; }, 0, hi);
      return r == null ? NaN : r;
    }
  };
}
