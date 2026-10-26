#!/usr/bin/env node
/**
 * test:sim — pruebas de los modelos numéricos de los simuladores
 * (assets/js/sim/). Corre con el runner nativo de Node, sin
 * dependencias:
 *
 *   npm run test:sim        (≡ node --test scripts/test-simuladores.mjs)
 *
 * Casos de validación (docs/SIMULADORES.md §Validación):
 *   · Destilación — valores por defecto del simulador de referencia
 *     (TLK Energy): α = 2,5; R = 2; f = 0,2 (q = 1 − f = 0,8);
 *     x_F = 0,45; x_D = 0,98;
 *     x_B = 0,02. La referencia informa 17 etapas; el pinch gráfico
 *     y Underwood coinciden en R_min = 1,5570 (la referencia muestra
 *     1,529: discrepancia documentada).
 *   · Absorción — valores por defecto del simulador de referencia
 *     (Almajose): V′ = 100; y_{N+1} = 0,10; y_1 = 0,015; x_0 = 0;
 *     Y* = 1,5 X; L′ = 195; E_MV = 0,70 (el simulador arranca con
 *     E_MV = 1; la prueba fija 0,70 para reproducir la referencia).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as D from "../assets/js/sim/modelo-destilacion.js";
import * as A from "../assets/js/sim/modelo-absorcion.js";
import { interpolador, parsearPares, fmt } from "../assets/js/sim/numerico.js";

const cerca = (a, b, tol, msg) =>
  assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} ≠ ${b} (tol ${tol})`);

const dest = (over = {}) => {
  const p = { ...D.DEFAULTS, ...over, equilibrio: { ...D.DEFAULTS.equilibrio, ...(over.equilibrio || {}) } };
  return D.calcular(p, D.construirEquilibrio(p.equilibrio));
};
const abs = (over = {}) => {
  const p = { ...A.DEFAULTS, ...over, equilibrio: { ...A.DEFAULTS.equilibrio, ...(over.equilibrio || {}) } };
  return A.calcular(p, A.construirEquilibrio(p.equilibrio));
};

/* ── Utilidades numéricas ───────────────────────────────────────── */

test("interpolación monótona: pasa por los nodos y no sobreoscila", () => {
  const xs = [0, 0.1, 0.2, 0.5, 1];
  const ys = [0, 0.5, 0.55, 0.56, 1];
  const f = interpolador(xs, ys, "monotona");
  xs.forEach((x, i) => cerca(f(x), ys[i], 1e-12, `nodo ${x}`));
  for (let x = 0; x <= 1; x += 0.001) {
    assert.ok(f(x + 0.001) >= f(x) - 1e-12, `monotonía en ${x}`);
  }
});

test("parser de pares: separadores, comentarios y errores", () => {
  const r = parsearPares("# X, Y\n0.1, 0.2\n0,3;0,4\n0.5\t0.6\nfoo\n0.7 0.8");
  assert.deepEqual(r.pares, [[0.1, 0.2], [0.3, 0.4], [0.5, 0.6], [0.7, 0.8]]);
  assert.equal(r.errores.length, 1);
  assert.equal(r.errores[0].linea, 5);
});

test("formato es-AR", () => {
  assert.equal(fmt(1.5570314, 3), "1,557");
  assert.equal(fmt(-0.25, 2), "−0,25");
  assert.equal(fmt(Infinity), "∞");
});

/* ── Destilación ────────────────────────────────────────────────── */

test("destilación — caso de referencia (TLK)", () => {
  const r = dest();
  assert.equal(r.ok, true);
  assert.equal(r.escalones.n, 17, "etapas enteras");
  cerca(r.escalones.nFrac, 16.908, 1e-3, "etapas fraccionales");
  assert.equal(r.escalones.alim, 9, "etapa de alimentación");
  cerca(r.Rmin, 1.55703, 1e-5, "R_min gráfico");
  cerca(r.Rmin, r.RminUnderwood, 1e-6, "R_min gráfico vs Underwood");
  assert.equal(r.pinch.tipo, "alimentacion");
  cerca(r.NminFenske, 8.4947, 1e-4, "Fenske");
  assert.equal(Math.ceil(r.Nmin), 9, "N_min gráfico (entero)");
  cerca(r.balance.D, 100 * (0.45 - 0.02) / (0.98 - 0.02), 1e-9, "D");
  cerca(r.balance.LVb, r.rectas.ms, 1e-9, "L̄/V̄ = pendiente de agotamiento");
});

test("destilación — condiciones térmicas de la alimentación (f = 1 − q)", () => {
  for (const f of [-0.3, 0, 0.5, 1, 1.5]) {
    const r = dest({ f, modoR: "ratio", rRatio: 1.5 });
    assert.equal(r.ok, true, `f = ${f}: ${r.errores}`);
    cerca(r.Rmin, r.RminUnderwood, 1e-6, `R_min f = ${f}`);
    assert.ok(isFinite(r.escalones.nFrac), `etapas finitas f = ${f}`);
    cerca(r.R, 1.5 * r.Rmin, 1e-9, "R = 1,5 R_min");
    /* V − V̄ = f·F: la fracción vaporizada se suma al vapor de rectificación. */
    cerca(r.balance.V - r.balance.Vb, f * r.balance.F, 1e-9, "V − V̄ = fF");
  }
  /* R_min crece al aumentar f (alimentación más vaporizada). */
  const rm = [-0.3, 0, 0.5, 1, 1.5].map((f) => dest({ f }).Rmin);
  for (let i = 1; i < rm.length; i++) assert.ok(rm[i] > rm[i - 1]);
});

test("destilación — R < R_min se informa como pinch", () => {
  const r = dest({ R: 1.5 });
  assert.equal(r.ok, true);
  assert.equal(r.escalones.nFrac, Infinity);
  assert.ok(r.avisos.some((a) => a.nivel === "error"));
});

test("destilación — eficiencia de Murphree aumenta las etapas", () => {
  const r = dest({ E: 0.7 });
  assert.equal(r.ok, true);
  assert.equal(r.teorico.n, 17);
  assert.ok(r.escalones.nFrac > r.teorico.nFrac / 0.7 * 0.8);
  assert.ok(r.escalones.n > 17);
});

test("destilación — reboiler ideal con E_MV < 1", () => {
  const r = dest({ E: 0.6 });
  assert.equal(r.ok, true);
  const et = r.escalones.etapas;
  const ult = et[et.length - 1];
  assert.equal(ult.ultima, true);
  assert.equal(ult.ideal, true);
  /* La última etapa (reboiler) cae sobre la curva de equilibrio real. */
  cerca(r.eq.y(ult.x), ult.y, 1e-7, "reboiler sobre el equilibrio");
  /* Los platos caen sobre el pseudoequilibrio y no alcanzan x_B. */
  for (const e of et.slice(0, -1)) {
    cerca(r.psEquilibrio(e.x), e.y, 1e-7, `plato ${e.n} sobre el pseudoequilibrio`);
    assert.ok(e.x > r.p.xB);
  }
  /* Con E = 1 el reboiler ideal no cambia nada: 17 etapas. */
  assert.equal(dest({ E: 1 }).escalones.n, 17);
  /* Cota: N_real − 1 platos superan (N_teórico − 1) platos ideales. */
  assert.ok(r.escalones.n - 1 > r.teorico.n - 1);
});

test("destilación — especificación incoherente", () => {
  assert.equal(dest({ xB: 0.5 }).ok, false);
  assert.equal(dest({ equilibrio: { alfa: 0.9 } }).ok, false);
});

test("destilación — datos tabulados con pinch tangente", () => {
  const r = dest({ equilibrio: { tipo: "tabla" }, xF: 0.4, xD: 0.95, xB: 0.05, f: 0, R: 3 });
  assert.equal(r.ok, true, String(r.errores));
  assert.equal(r.pinch.tipo, "tangente");
  assert.ok(r.pinch.x > 0.4 && r.pinch.x < 0.95);
  assert.ok(isFinite(r.escalones.nFrac));
});

test("destilación — datos tabulados con azeótropo en el intervalo", () => {
  const texto = "0.1, 0.3\n0.3, 0.5\n0.5, 0.6\n0.7, 0.7\n0.8, 0.78\n0.9, 0.88";
  const r = dest({ equilibrio: { tipo: "tabla", texto } });
  assert.equal(r.ok, false);
  assert.match(r.errores[0], /azeótropo/);
});

/* ── Absorción ──────────────────────────────────────────────────── */

test("absorción — caso de referencia (Almajose)", () => {
  /* La referencia usa E_MV = 0,70 (el simulador arranca con E_MV = 1). */
  const r = abs({ E: 0.7 });
  assert.equal(r.ok, true);
  cerca(r.Lmin, 129.4416, 1e-4, "L′_min");
  cerca(r.XN, 0.0491706, 1e-7, "X_N");
  cerca(r.recuperacion, 0.862944, 1e-6, "recuperación");
  assert.equal(r.pinch.tipo, "fondo");
  assert.equal(r.escalones.n, 6, "etapas reales enteras");
  /* Construcción desde el tope: 5,086 (la referencia, desde el
     fondo, informa 5,1005; la diferencia está en la etapa parcial). */
  cerca(r.escalones.nFrac, 5.0857, 1e-3, "etapas reales fraccionales");
  /* La referencia, que numera desde el fondo, informa para su etapa 1
     X = 0,0491706 e Y = 0,0849625: es el punto del pseudoequilibrio
     en X_N (Y_op(X_N) = Y_{N+1}). Verifica la definición de E_MV. */
  cerca(r.psEquilibrio(r.XN), 0.0849625, 1e-7, "pseudoequilibrio en X_N");
  cerca(r.kremser.N, 3.42009, 1e-5, "Kremser");
  cerca(r.teorico.nFrac, 3.3884, 1e-3, "etapas teóricas (E = 1)");
  cerca(r.kremser.Nreal, 5.0929, 1e-3, "Kremser / E_o (Lewis)");
  assert.equal(Math.ceil(r.teorico.nFrac), Math.ceil(r.kremser.N));
});

test("absorción y destilación — E_MV = 1 por defecto", () => {
  assert.equal(A.DEFAULTS.E, 1);
  assert.equal(D.DEFAULTS.E, 1);
  const r = abs();
  assert.equal(r.escalones, r.teorico);
  assert.equal(r.escalones.n, 4);
});

test("absorción — especificación por recuperación y por L′/L′_min", () => {
  const r = abs({ especSalida: "recuperacion", recuperacion: 0.9, modoL: "ratio", lRatio: 1.4 });
  assert.equal(r.ok, true);
  cerca(r.Y1, (0.1 / 0.9) * 0.1, 1e-12, "Y_1");
  cerca(r.Ls, 1.4 * r.Lmin, 1e-9, "L′");
});

test("absorción — y* = m·x con m < 1 produce pinch tangente", () => {
  const r = abs({ yIn: 0.4, equilibrio: { tipo: "henry", m: 0.8 }, modoL: "ratio", lRatio: 1.5 });
  assert.equal(r.ok, true);
  assert.equal(r.pinch.tipo, "tangente");
  assert.equal(r.kremser.aplica, false);
  /* En la tangencia la pendiente de la curva iguala a (L′/V′)_min. */
  const h = 1e-6;
  const pend = (r.eq.y(r.pinch.X + h) - r.eq.y(r.pinch.X - h)) / (2 * h);
  cerca(pend, r.LVmin, 1e-4, "tangencia");
});

test("absorción — L′ < L′_min se informa como pinch", () => {
  const r = abs({ Ls: 120, E: 0.7 });
  assert.equal(r.escalones.nFrac, Infinity);
  assert.ok(r.avisos.some((a) => a.nivel === "error"));
});

test("absorción — solvente demasiado cargado", () => {
  const r = abs({ x0: 0.02 });
  assert.equal(r.ok, false);
});

test("absorción — datos tabulados ilustrativos", () => {
  const r = abs({ equilibrio: { tipo: "tabla" }, modoL: "ratio", lRatio: 1.5 });
  assert.equal(r.ok, true, String(r.errores));
  assert.ok(isFinite(r.escalones.nFrac));
});

/* ── Resumen de corrientes (esquema del equipo) ─────────────────── */

test("destilación — corrientes: cierre de balances global y por componente", () => {
  for (const over of [{}, { f: -0.2, R: 3, F: 250 }, { E: 0.7 }]) {
    const r = dest(over);
    const c = Object.fromEntries(r.corrientes.map((k) => [k.id, k]));
    cerca(c.F.caudal, c.D.caudal + c.B.caudal, 1e-9, "F = D + B");
    cerca(c.F.caudal * c.F.x, c.D.caudal * c.D.x + c.B.caudal * c.B.x, 1e-9, "F x_F = D x_D + B x_B");
    cerca(c.V.caudal, c.L.caudal + c.D.caudal, 1e-9, "V = L + D");
    cerca(c.Lb.caudal, c.Vb.caudal + c.B.caudal, 1e-9, "L̄ = V̄ + B");
    assert.ok(c.Lb.x > 0 && c.Lb.x < 1 && c.Vb.x > 0 && c.Vb.x < 1, "composiciones del reboiler");
  }
});

test("absorción — corrientes: balance de soluto", () => {
  for (const over of [{}, { E: 0.7 }, { equilibrio: { tipo: "henry", m: 0.8 }, yIn: 0.4, modoL: "ratio", lRatio: 1.5 }]) {
    const r = abs(over);
    const c = Object.fromEntries(r.corrientes.map((k) => [k.id, k]));
    const absorbidoGas = c.Gin.libre * (c.Gin.R - c.Gout.R);
    const absorbidoLiq = c.Lin.libre * (c.Lout.R - c.Lin.R);
    cerca(absorbidoGas, absorbidoLiq, 1e-9, "V′(Y_{N+1} − Y_1) = L′(X_N − X_0)");
    cerca(c.Gin.total - c.Gout.total, absorbidoGas, 1e-9, "caudal total de gas");
    cerca(c.Lout.total - c.Lin.total, absorbidoGas, 1e-9, "caudal total de líquido");
  }
});
