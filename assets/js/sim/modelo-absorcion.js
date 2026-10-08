/* ============================================================
   AChETIQ — Simulador · McCabe-Thiele, absorción de gases
   (modelo-absorcion.js)
   ------------------------------------------------------------
   Módulo PURO (sin DOM). Notación de Treybal / Geankoplis:
   etapas numeradas desde el TOPE de la columna.

        solvente  L′_s, X_0  ──▶ ┌─────────┐ ──▶ gas tratado V′_s, Y_1
                                 │ etapa 1 │
                                 │   ⋮     │
                                 │ etapa N │
        líquido   L′_s, X_N  ◀── └─────────┘ ◀── gas de entrada V′_s, Y_{N+1}

   HIPÓTESIS DEL MODELO
     · Absorción de un único soluto; gas portador insoluble y
       solvente no volátil: V′_s y L′_s (libres de soluto)
       constantes a lo largo de la columna.
     · Operación isotérmica, a presión constante y en estado
       estacionario; equilibrio dado en relaciones molares.
     · Eficiencia de Murphree de fase gas E_MV uniforme.

   ECUACIONES
     Relaciones molares:  X = x/(1 − x),  Y = y/(1 − y)
     Recta de operación:  Y = (L′_s/V′_s)(X − X_0) + Y_1
     Balance global:      X_N = X_0 + (V′_s/L′_s)(Y_{N+1} − Y_1)
     Solvente mínimo:     (L′_s/V′_s)_min = máx [Y*(X) − Y_1]/(X − X_0),
                          X ∈ (X_0, X*(Y_{N+1})]
     Pseudoequilibrio:    Y_ps = Y_op − E_MV (Y_op − Y*)
     Kremser (Y* = M·X):  A = L′_s/(M V′_s)
       N = ln{[(Y_{N+1} − M X_0)/(Y_1 − M X_0)](1 − 1/A) + 1/A} / ln A
     Lewis (E_MV → E_o):  E_o = ln[1 + E_MV(1/A − 1)] / ln(1/A)
   ============================================================ */

'use strict';

import { raiz, maximoEn, parsearPares } from './numerico.js';
import { linealRelaciones, henryFracciones, tablaRelaciones } from './equilibrio.js';

export var MAX_ETAPAS = 200;

/* Pares X–Y ILUSTRATIVOS (relaciones molares) para el modo
   tabulado: curva cóncava hacia abajo que, con la especificación
   por defecto, produce un pinch tangente intermedio. NO
   corresponden a ningún sistema real: reemplazarlos por datos de
   bibliografía. */
export var PARES_EJEMPLO =
  '0.000, 0.0000\n0.005, 0.0140\n0.010, 0.0260\n0.015, 0.0360\n' +
  '0.020, 0.0445\n0.030, 0.0580\n0.040, 0.0685\n0.050, 0.0770\n' +
  '0.060, 0.0845\n0.070, 0.0915\n0.080, 0.0985\n0.090, 0.1060\n' +
  '0.100, 0.1140\n0.120, 0.1320';

export var DEFAULTS = {
  Vs: 100,
  yIn: 0.10,
  especSalida: 'y',
  yOut: 0.015,
  recuperacion: 0.85,
  x0: 0,
  E: 1,
  modoL: 'L',
  Ls: 195,
  lRatio: 1.5,
  equilibrio: { tipo: 'lineal', M: 1.5, m: 1.5, texto: PARES_EJEMPLO, metodo: 'monotona' }
};

export var aRelacion = function (f) { return f / (1 - f); };
export var aFraccion = function (r) { return r / (1 + r); };

export function construirEquilibrio(cfg) {
  if (cfg.tipo === 'tabla') {
    var lectura = parsearPares(cfg.texto);
    return { modelo: tablaRelaciones(lectura.pares, cfg.metodo), lectura: lectura };
  }
  if (cfg.tipo === 'henry') return { modelo: henryFracciones(cfg.m), lectura: null };
  return { modelo: linealRelaciones(cfg.M), lectura: null };
}

/* Kremser en relaciones molares (solo equilibrio lineal Y* = M·X). */
export function kremser(Yin, Y1, X0, M, A) {
  var num = Yin - M * X0, den = Y1 - M * X0;
  if (!(den > 0)) return NaN;
  if (Math.abs(A - 1) < 1e-9) return (Yin - Y1) / den;
  var arg = (num / den) * (1 - 1 / A) + 1 / A;
  return arg > 0 ? Math.log(arg) / Math.log(A) : Infinity;
}

export function lewis(E, A) {
  if (Math.abs(A - 1) < 1e-9) return E;
  return Math.log(1 + E * (1 / A - 1)) / Math.log(1 / A);
}

/* Escalonamiento desde el tope (X_0, Y_1): horizontal hasta el
   pseudoequilibrio (X_n), vertical hasta la recta de operación
   (Y_{n+1}); termina al alcanzar X_N. */
function escalonar(eq, op, X0, Y1, XN, E, Xtecho) {
  var ps = function (X) { var o = op(X); return o - E * (o - eq.y(X)); };
  var etapas = [];
  var Xprev = X0, Y = Y1;
  for (var n = 1; n <= MAX_ETAPAS; n++) {
    var YY = Y;
    var Xn = raiz(function (X) { return ps(X) - YY; }, Xprev, Xtecho);
    if (Xn == null || Xn - Xprev < 1e-12) {
      return { etapas: etapas, nFrac: Infinity, n: etapas.length, pinch: true, tope: false };
    }
    if (Xn >= XN) {
      var frac = (XN - Xprev) / (Xn - Xprev);
      etapas.push({ n: n, X0: Xprev, Y: Y, X: Xn, Y1: op(Xn), ultima: true });
      return { etapas: etapas, nFrac: n - 1 + frac, n: n, pinch: false, tope: false };
    }
    var Ynext = op(Xn);
    etapas.push({ n: n, X0: Xprev, Y: Y, X: Xn, Y1: Ynext, ultima: false });
    Xprev = Xn;
    Y = Ynext;
  }
  return { etapas: etapas, nFrac: Infinity, n: etapas.length, pinch: false, tope: true };
}

export function calcular(p, eqConstruido) {
  var res = { ok: false, errores: [], avisos: [], p: p };
  var eq = eqConstruido.modelo;
  var lectura = eqConstruido.lectura;
  res.eq = eq;

  /* ── Validación ── */
  if (!(p.Vs > 0)) res.errores.push('El caudal de gas portador V′_s debe ser positivo.');
  if (!(p.yIn > 0 && p.yIn < 1)) res.errores.push('La fracción molar del gas de entrada debe estar en (0, 1).');
  if (!(p.x0 >= 0 && p.x0 < 1)) res.errores.push('La fracción molar del solvente de entrada debe estar en [0, 1).');
  if (!(p.E > 0 && p.E <= 1)) res.errores.push('La eficiencia de Murphree debe estar en (0, 1].');
  if (p.especSalida === 'recuperacion') {
    if (!(p.recuperacion > 0 && p.recuperacion < 1)) res.errores.push('La recuperación debe estar entre 0 % y 100 %.');
  } else if (!(p.yOut > 0 && p.yOut < p.yIn)) {
    res.errores.push('La fracción molar del gas de salida debe cumplir 0 < y_1 < y_{N+1}.');
  }
  if (eq.tipo === 'lineal' && !(eq.M > 0)) res.errores.push('La pendiente M debe ser positiva.');
  if (eq.tipo === 'henry' && !(eq.m > 0)) res.errores.push('La constante m debe ser positiva.');
  if (eq.tipo === 'tabla') {
    if (lectura.errores.length) {
      res.avisos.push({ nivel: 'aviso', texto: 'Se ignoraron ' + lectura.errores.length +
        ' línea(s) de datos que no pudieron leerse (línea ' +
        lectura.errores.map(function (e) { return e.linea; }).join(', ') + ').' });
    }
    if (lectura.pares.filter(function (pp) { return pp[0] > 0; }).length < 2) {
      res.errores.push('Se necesitan al menos dos pares X–Y con X > 0.');
    } else if (!eq.monotona) {
      res.errores.push('Los datos de equilibrio deben ser estrictamente crecientes en Y.');
    }
  }
  if (res.errores.length) return res;

  var Yin = aRelacion(p.yIn);
  var X0 = aRelacion(p.x0);
  var Y1 = p.especSalida === 'recuperacion' ? Yin * (1 - p.recuperacion) : aRelacion(p.yOut);
  res.Yin = Yin; res.Y1 = Y1; res.X0 = X0;
  res.recuperacion = (Yin - Y1) / Yin;

  if (!(eq.y(X0) < Y1)) {
    res.errores.push('El solvente de entrada está en equilibrio con un gas más rico que el gas tratado (Y*(X_0) ≥ Y_1): no puede absorber hasta esa especificación.');
    return res;
  }

  /* ── Solvente mínimo ── */
  var Xmax = eq.x(Yin);
  if (!(Xmax > X0) || !isFinite(Xmax)) {
    res.errores.push('No se pudo invertir la curva de equilibrio en Y_{N+1}.');
    return res;
  }
  var m = maximoEn(function (X) {
    return X > X0 ? (eq.y(X) - Y1) / (X - X0) : -Infinity;
  }, X0 + (Xmax - X0) * 1e-9, Xmax, 600);
  var LVmin = m.valor;
  var tipoPinch = Math.abs(m.x - Xmax) < 1e-6 * Math.max(1, Xmax) ? 'fondo' : 'tangente';
  res.LVmin = LVmin;
  res.Lmin = LVmin * p.Vs;
  res.pinch = { X: m.x, Y: eq.y(m.x), tipo: tipoPinch };
  res.XNmax = X0 + (Yin - Y1) / LVmin;

  var Ls = p.modoL === 'ratio' ? p.lRatio * res.Lmin : p.Ls;
  if (!(Ls > 0)) { res.errores.push('El caudal de solvente L′_s debe ser positivo.'); return res; }
  var LV = Ls / p.Vs;
  res.Ls = Ls; res.LV = LV; res.lRatio = Ls / res.Lmin;
  var XN = X0 + (Yin - Y1) / LV;
  res.XN = XN;
  res.soluto = p.Vs * (Yin - Y1);
  res.op = function (X) { return Y1 + LV * (X - X0); };
  res.psEquilibrio = function (X) { var o = res.op(X); return o - p.E * (o - eq.y(X)); };

  if (eq.tipo === 'tabla' && (XN > eq.rangoDatos[1] || Xmax > eq.rangoDatos[1])) {
    res.avisos.push({ nivel: 'aviso', texto: 'La construcción supera el último dato tabulado (X = ' +
      String(eq.rangoDatos[1]).replace('.', ',') + '): la curva se extrapola linealmente.' });
  }

  /* ── Escalonamiento ── */
  var techo = Math.max(XN, Xmax) * 4 + 1e-6;
  if (eq.tipo === 'henry' && isFinite(eq.dominio[1])) techo = Math.min(techo, eq.dominio[1] * 0.999999);
  var real = escalonar(eq, res.op, X0, Y1, XN, p.E, techo);
  res.escalones = real;
  res.teorico = p.E < 1 ? escalonar(eq, res.op, X0, Y1, XN, 1, techo) : real;

  if (LV <= LVmin * (1 + 1e-9)) {
    res.avisos.push({ nivel: 'error', texto: 'L′_s ≤ L′_{s,mín}: la recta de operación toca o cruza la curva de equilibrio (pinch ' +
      (tipoPinch === 'fondo' ? 'en el fondo' : 'tangente') + '). Se requerirían infinitas etapas.' });
  } else if (real.pinch) {
    res.avisos.push({ nivel: 'error', texto: 'La construcción se detiene en un pinch antes de alcanzar X_N.' });
  } else if (real.tope) {
    res.avisos.push({ nivel: 'aviso', texto: 'Se alcanzó el tope de ' + MAX_ETAPAS + ' etapas sin llegar a X_N.' });
  } else if (res.lRatio < 1.1) {
    res.avisos.push({ nivel: 'info', texto: 'L′_s/L′_{s,mín} < 1,1: la columna opera cerca del pinch y el número de etapas es muy sensible al caudal de solvente.' });
  }

  /* ── Verificación analítica (Kremser + Lewis) ── */
  if (eq.tipo === 'lineal') {
    var A = LV / eq.M;
    var Nk = kremser(Yin, Y1, X0, eq.M, A);
    var Eo = lewis(p.E, A);
    res.kremser = { aplica: true, A: A, N: Nk, Eo: Eo, Nreal: Nk / Eo };
  } else {
    res.kremser = { aplica: false };
  }

  /* ── Resumen de corrientes (esquema del equipo) ──
     Caudales libres de soluto constantes; caudal total = caudal
     libre de soluto × (1 + relación molar). */
  res.corrientes = [
    { id: 'Gin', nombre: 'Gas de entrada', libre: p.Vs, total: p.Vs * (1 + Yin), R: Yin, f: aFraccion(Yin) },
    { id: 'Gout', nombre: 'Gas tratado', libre: p.Vs, total: p.Vs * (1 + Y1), R: Y1, f: aFraccion(Y1) },
    { id: 'Lin', nombre: 'Solvente', libre: Ls, total: Ls * (1 + X0), R: X0, f: aFraccion(X0) },
    { id: 'Lout', nombre: 'Líquido de salida', libre: Ls, total: Ls * (1 + XN), R: XN, f: aFraccion(XN) }
  ];

  res.ok = true;
  return res;
}
