/* ============================================================
   AChETIQ — Simuladores · notación con subíndices (notacion.js)
   ------------------------------------------------------------
   Convierte una notación compacta tipo LaTeX en nodos DOM, sin
   innerHTML (CSP + seguridad):
       'x_D'        → x<sub>D</sub>
       'Y_{N+1}'    → Y<sub>N+1</sub>
       'Y^*'        → Y<sup>*</sup>
   En HTML produce <sub>/<sup>; en SVG, <tspan> con baseline-shift.
   ============================================================ */

'use strict';

/* Parte el texto en trozos { t, tipo: 'normal' | 'sub' | 'sup' }. */
export function trozos(texto) {
  var s = String(texto);
  var out = [];
  var buf = '';
  for (var i = 0; i < s.length; i++) {
    var c = s.charAt(i);
    if ((c === '_' || c === '^') && i + 1 < s.length) {
      if (buf) { out.push({ t: buf, tipo: 'normal' }); buf = ''; }
      var tipo = c === '_' ? 'sub' : 'sup';
      var contenido;
      if (s.charAt(i + 1) === '{') {
        var fin = s.indexOf('}', i + 2);
        if (fin === -1) fin = s.length;
        contenido = s.slice(i + 2, fin);
        i = fin;
      } else {
        contenido = s.charAt(i + 1);
        i += 1;
      }
      out.push({ t: contenido, tipo: tipo });
      continue;
    }
    buf += c;
  }
  if (buf) out.push({ t: buf, tipo: 'normal' });
  return out;
}

/* Texto plano equivalente (para aria-label, CSV, title). */
export function plano(texto) {
  return trozos(texto).map(function (p) { return p.t; }).join('');
}

/* Agrega los trozos como nodos HTML dentro de `padre`. */
export function enHTML(padre, texto) {
  trozos(texto).forEach(function (p) {
    if (p.tipo === 'normal') {
      padre.appendChild(document.createTextNode(p.t));
    } else {
      var n = document.createElement(p.tipo);
      n.textContent = p.t;
      padre.appendChild(n);
    }
  });
  return padre;
}

/* Agrega los trozos como <tspan> dentro de un <text> SVG. */
export function enSVG(textoSVG, texto) {
  var NS = 'http://www.w3.org/2000/svg';
  var pendiente = false;
  trozos(texto).forEach(function (p) {
    var ts = document.createElementNS(NS, 'tspan');
    ts.textContent = p.t;
    if (p.tipo === 'sub') {
      ts.setAttribute('baseline-shift', 'sub');
      ts.setAttribute('class', 'sim-svg__sub');
      pendiente = true;
    } else if (p.tipo === 'sup') {
      ts.setAttribute('baseline-shift', 'super');
      ts.setAttribute('class', 'sim-svg__sub');
      pendiente = true;
    } else if (pendiente) {
      /* Tras un subíndice, el texto normal vuelve a la línea base. */
      ts.setAttribute('baseline-shift', '0');
      pendiente = false;
    }
    textoSVG.appendChild(ts);
  });
  return textoSVG;
}
