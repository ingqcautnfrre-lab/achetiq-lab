/* ============================================================
   AChETIQ — Simuladores · utilidades numéricas (numerico.js)
   ------------------------------------------------------------
   Módulo PURO (sin DOM ni window): lo consumen los modelos de
   McCabe-Thiele en el navegador y las pruebas de Node
   (scripts/test-simuladores.mjs).

   Contenido
     · raiz()            bisección con acotamiento garantizado.
     · maximoEn()        máximo de una función 1-D por barrido
                         denso + refinamiento por sección áurea.
     · interpolador()    lineal o cúbica monótona (Fritsch–Carlson,
                         sin sobreoscilación entre nodos: apta para
                         datos de equilibrio), con extrapolación
                         lineal en los extremos.
     · parsearPares()    lectura tolerante de pares «a, b» pegados
                         por el usuario (coma, punto y coma,
                         tabulador o espacios como separador).
     · fmt()             formato numérico es-AR (coma decimal).
   ============================================================ */

'use strict';

/* Raíz de f en [a, b] por bisección. Exige cambio de signo; si no
   lo hay devuelve null (el llamador decide qué hacer). 200
   iteraciones agotan la doble precisión en cualquier intervalo
   finito. */
export function raiz(f, a, b, tol) {
  var t = tol || 1e-14;
  var fa = f(a);
  var fb = f(b);
  if (!isFinite(fa) || !isFinite(fb)) return null;
  if (fa === 0) return a;
  if (fb === 0) return b;
  if (fa * fb > 0) return null;
  var lo = a, hi = b, flo = fa;
  for (var i = 0; i < 200; i++) {
    var m = 0.5 * (lo + hi);
    var fm = f(m);
    if (fm === 0 || Math.abs(hi - lo) < t) return m;
    if ((fm < 0) === (flo < 0)) { lo = m; flo = fm; } else { hi = m; }
  }
  return 0.5 * (lo + hi);
}

/* Máximo de f en [a, b]: barrido de n puntos y refinamiento por
   sección áurea alrededor del mejor nodo. Devuelve { x, valor }.
   Robusto para funciones con un único máximo local relevante o con
   máximo en el borde (caso del pinch en el extremo). */
export function maximoEn(f, a, b, n) {
  var pasos = n || 400;
  var mejorX = a, mejorV = -Infinity;
  var h = (b - a) / pasos;
  for (var i = 0; i <= pasos; i++) {
    var x = a + i * h;
    var v = f(x);
    if (isFinite(v) && v > mejorV) { mejorV = v; mejorX = x; }
  }
  var lo = Math.max(a, mejorX - h);
  var hi = Math.min(b, mejorX + h);
  var g = (Math.sqrt(5) - 1) / 2;
  var c = hi - g * (hi - lo);
  var d = lo + g * (hi - lo);
  var fc = f(c), fd = f(d);
  for (var k = 0; k < 120 && hi - lo > 1e-15; k++) {
    if (fc > fd) { hi = d; d = c; fd = fc; c = hi - g * (hi - lo); fc = f(c); }
    else { lo = c; c = d; fc = fd; d = lo + g * (hi - lo); fd = f(d); }
  }
  var xr = 0.5 * (lo + hi);
  var vr = f(xr);
  if (isFinite(vr) && vr > mejorV) { mejorV = vr; mejorX = xr; }
  /* Los bordes se evalúan explícitamente: el refinamiento no los
     alcanza si el máximo está exactamente en a o en b. */
  var va = f(a), vb = f(b);
  if (isFinite(va) && va > mejorV) { mejorV = va; mejorX = a; }
  if (isFinite(vb) && vb > mejorV) { mejorV = vb; mejorX = b; }
  return { x: mejorX, valor: mejorV };
}

/* Interpolador sobre nodos (xs crecientes). metodo: 'lineal' |
   'monotona'. Fuera del rango de datos extrapola linealmente con la
   pendiente del tramo extremo (el modelo avisa cuando la operación
   sale del rango tabulado). */
export function interpolador(xs, ys, metodo) {
  var n = xs.length;
  var d = new Array(n);
  var delta = new Array(n - 1);
  for (var i = 0; i < n - 1; i++) {
    delta[i] = (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]);
  }

  if (metodo === 'monotona' && n > 2) {
    /* Pendientes de Fritsch–Carlson (1980): media armónica
       ponderada en nodos interiores, extremos por diferencia
       de tres puntos acotada. Preserva la monotonía de los datos. */
    for (var j = 1; j < n - 1; j++) {
      if (delta[j - 1] * delta[j] <= 0) { d[j] = 0; continue; }
      var h0 = xs[j] - xs[j - 1];
      var h1 = xs[j + 1] - xs[j];
      var w1 = 2 * h1 + h0;
      var w2 = h1 + 2 * h0;
      d[j] = (w1 + w2) / (w1 / delta[j - 1] + w2 / delta[j]);
    }
    d[0] = extremo(xs[1] - xs[0], xs[2] - xs[1], delta[0], delta[1]);
    d[n - 1] = extremo(xs[n - 1] - xs[n - 2], xs[n - 2] - xs[n - 3],
                       delta[n - 2], delta[n - 3]);
  }

  return function (x) {
    if (x <= xs[0]) return ys[0] + delta[0] * (x - xs[0]);
    if (x >= xs[n - 1]) return ys[n - 1] + delta[n - 2] * (x - xs[n - 1]);
    var lo = 0, hi = n - 1;
    while (hi - lo > 1) {
      var m = (lo + hi) >> 1;
      if (xs[m] <= x) lo = m; else hi = m;
    }
    var h = xs[hi] - xs[lo];
    var t = (x - xs[lo]) / h;
    if (metodo !== 'monotona' || n <= 2) return ys[lo] + t * (ys[hi] - ys[lo]);
    var t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[lo] + (t3 - 2 * t2 + t) * h * d[lo] +
           (-2 * t3 + 3 * t2) * ys[hi] + (t3 - t2) * h * d[hi];
  };
}

function extremo(h0, h1, del0, del1) {
  var dd = ((2 * h0 + h1) * del0 - h0 * del1) / (h0 + h1);
  if (dd * del0 <= 0) return 0;
  if (del0 * del1 <= 0 && Math.abs(dd) > Math.abs(3 * del0)) return 3 * del0;
  return dd;
}

/* Lee pares numéricos, uno por línea. Acepta separadores coma,
   punto y coma, tabulador o espacios; el decimal debe ser punto
   cuando el separador es coma (con «;» o tabulador se admite
   también la coma decimal). Devuelve los pares ordenados por la
   primera coordenada, sin duplicados, y la lista de líneas que no
   pudieron leerse. */
export function parsearPares(texto) {
  var pares = [];
  var errores = [];
  var lineas = String(texto || '').split(/\r?\n/);
  for (var i = 0; i < lineas.length; i++) {
    var l = lineas[i].trim();
    if (!l || l.charAt(0) === '#') continue;
    var partes;
    if (/[;\t]/.test(l)) {
      partes = l.split(/\s*[;\t]\s*/).map(function (s) { return s.replace(',', '.'); });
    } else {
      partes = l.split(/\s*,\s*|\s+/);
    }
    partes = partes.filter(function (s) { return s !== ''; });
    var a = Number(partes[0]);
    var b = Number(partes[1]);
    if (partes.length !== 2 || !isFinite(a) || !isFinite(b)) {
      errores.push({ linea: i + 1, texto: l });
      continue;
    }
    pares.push([a, b]);
  }
  pares.sort(function (p, q) { return p[0] - q[0]; });
  var unicos = [];
  for (var k = 0; k < pares.length; k++) {
    if (k > 0 && pares[k][0] === pares[k - 1][0]) continue;
    unicos.push(pares[k]);
  }
  return { pares: unicos, errores: errores };
}

/* Formato es-AR: coma decimal, sin separador de miles en cifras
   técnicas pequeñas. dec = cifras decimales fijas. */
export function fmt(valor, dec) {
  if (valor === Infinity) return '∞';
  if (!isFinite(valor)) return '—';
  var d = (dec == null) ? 4 : dec;
  var s = Number(valor).toFixed(d);
  if (s === '-' + (0).toFixed(d)) s = (0).toFixed(d);
  return s.replace('-', '−').replace('.', ',');
}

/* Cifras significativas adaptadas a la magnitud (para tablas con
   valores que abarcan varios órdenes, p. ej. relaciones molares). */
export function fmtSig(valor, sig) {
  if (!isFinite(valor)) return '—';
  var s = sig || 5;
  if (valor === 0) return '0';
  var mag = Math.floor(Math.log10(Math.abs(valor)));
  var dec = Math.max(0, Math.min(10, s - 1 - mag));
  return fmt(valor, dec);
}

export function acotar(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}
