/* ============================================================
   AChETIQ — Simuladores · exportación PNG (exportar.js)
   ------------------------------------------------------------
   La CSP del sitio (img-src 'self') impide el camino habitual
   SVG → <img src="blob:…"> → canvas. Este módulo lo evita:
   RECORRE el SVG ya renderizado y lo vuelve a pintar en un
   <canvas> con la API 2D, leyendo los estilos computados de cada
   nodo (colores, trazos, discontinuos, tipografía). Path2D acepta
   directamente los atributos «d» del SVG.

   Soporta lo que produce grafico.js: g (con clip-path y opacidad),
   rect, line, path, polygon, circle y text con <tspan> de
   subíndice / superíndice y halo (paint-order: stroke).

   La imagen final suma, a elección del usuario, un título, una
   línea de parámetros y una leyenda de las series visibles; el
   fondo es blanco. Se descarga con canvas.toBlob() + <a download>
   (navegación a blob:, no alcanzada por img-src).
   ============================================================ */

'use strict';

import { trozos } from './notacion.js';

var NS = 'http://www.w3.org/2000/svg';

function numero(v, def) {
  var n = parseFloat(v);
  return isFinite(n) ? n : def;
}

function fuente(cs, tam) {
  return (cs.fontStyle || 'normal') + ' ' + (cs.fontWeight || '400') + ' ' +
    (tam || cs.fontSize) + ' ' + cs.fontFamily;
}

/* ── Recorrido del SVG ─────────────────────────────────────── */
function pintarNodo(ctx, el, raizSVG) {
  var tag = el.tagName.toLowerCase();
  if (tag === 'title' || tag === 'desc' || tag === 'defs' || tag === 'clippath') return;
  if (el.classList && (el.classList.contains('sim-svg__cursor') || el.classList.contains('sim-svg__zoom'))) return;
  var cs = window.getComputedStyle(el);
  if (cs.display === 'none' || cs.visibility === 'hidden') return;
  var opacidad = numero(cs.opacity, 1);

  if (tag === 'g' || tag === 'svg') {
    ctx.save();
    ctx.globalAlpha *= opacidad;
    var cp = el.getAttribute('clip-path');
    var m = cp && cp.match(/#([^)"']+)/);
    if (m) {
      var r = raizSVG.querySelector('[id="' + m[1] + '"] rect');
      if (r) {
        ctx.beginPath();
        ctx.rect(numero(r.getAttribute('x'), 0), numero(r.getAttribute('y'), 0),
          numero(r.getAttribute('width'), 0), numero(r.getAttribute('height'), 0));
        ctx.clip();
      }
    }
    for (var i = 0; i < el.children.length; i++) pintarNodo(ctx, el.children[i], raizSVG);
    ctx.restore();
    return;
  }

  if (tag === 'text') { pintarTexto(ctx, el, cs, opacidad); return; }

  var path = new Path2D();
  var rellenable = true;
  if (tag === 'path') {
    path = new Path2D(el.getAttribute('d') || '');
  } else if (tag === 'line') {
    path.moveTo(numero(el.getAttribute('x1'), 0), numero(el.getAttribute('y1'), 0));
    path.lineTo(numero(el.getAttribute('x2'), 0), numero(el.getAttribute('y2'), 0));
    rellenable = false;
  } else if (tag === 'rect') {
    path.rect(numero(el.getAttribute('x'), 0), numero(el.getAttribute('y'), 0),
      numero(el.getAttribute('width'), 0), numero(el.getAttribute('height'), 0));
  } else if (tag === 'circle') {
    path.arc(numero(el.getAttribute('cx'), 0), numero(el.getAttribute('cy'), 0),
      numero(el.getAttribute('r'), 0), 0, Math.PI * 2);
  } else if (tag === 'polygon' || tag === 'polyline') {
    var pts = (el.getAttribute('points') || '').trim().split(/[\s,]+/).map(Number);
    for (var k = 0; k + 1 < pts.length; k += 2) {
      if (k === 0) path.moveTo(pts[k], pts[k + 1]); else path.lineTo(pts[k], pts[k + 1]);
    }
    if (tag === 'polygon') path.closePath();
  } else {
    return;
  }

  var base = ctx.globalAlpha;
  if (rellenable && cs.fill && cs.fill !== 'none') {
    ctx.globalAlpha = base * opacidad * numero(cs.fillOpacity, 1);
    ctx.fillStyle = cs.fill;
    ctx.fill(path);
  }
  var ancho = numero(cs.strokeWidth, 0);
  if (cs.stroke && cs.stroke !== 'none' && ancho > 0) {
    ctx.globalAlpha = base * opacidad * numero(cs.strokeOpacity, 1);
    ctx.strokeStyle = cs.stroke;
    ctx.lineWidth = ancho;
    ctx.lineCap = cs.strokeLinecap || 'butt';
    ctx.lineJoin = cs.strokeLinejoin || 'miter';
    /* pathLength = 1 (trazo animado del paso a paso): su discontinuo
       está normalizado; en la imagen se dibuja continuo. */
    var dash = (!el.hasAttribute('pathLength') && cs.strokeDasharray && cs.strokeDasharray !== 'none')
      ? cs.strokeDasharray.split(/[\s,]+/).map(function (v) { return numero(v, 0); })
      : [];
    ctx.setLineDash(dash);
    ctx.stroke(path);
    ctx.setLineDash([]);
  }
  ctx.globalAlpha = base;
}

function pintarTexto(ctx, el, cs, opacidad) {
  var x = numero(el.getAttribute('x'), 0);
  var y = numero(el.getAttribute('y'), 0);
  var tam = numero(cs.fontSize, 12);
  var segs = [];
  el.childNodes.forEach(function (n) {
    if (n.nodeType === 3) {
      if (n.textContent) segs.push({ t: n.textContent, cs: cs, dy: 0 });
    } else if (n.nodeType === 1) {
      var tcs = window.getComputedStyle(n);
      var bs = tcs.baselineShift || n.getAttribute('baseline-shift') || '';
      var dy = bs === 'sub' ? tam * 0.3 : bs === 'super' ? -tam * 0.38 : 0;
      segs.push({ t: n.textContent, cs: tcs, dy: dy });
    }
  });
  if (!segs.length) return;

  ctx.save();
  var tr = el.getAttribute('transform') || '';
  var mt = tr.match(/translate\(\s*([-\d.]+)[\s,]+([-\d.]+)\s*\)/);
  var mr = tr.match(/rotate\(\s*([-\d.]+)\s*\)/);
  if (mt) ctx.translate(Number(mt[1]), Number(mt[2]));
  if (mr) ctx.rotate(Number(mr[1]) * Math.PI / 180);

  var total = 0;
  segs.forEach(function (sg) {
    ctx.font = fuente(sg.cs);
    sg.w = ctx.measureText(sg.t).width;
    total += sg.w;
  });
  var anc = cs.textAnchor;
  var cx = anc === 'middle' ? x - total / 2 : anc === 'end' ? x - total : x;
  var halo = cs.stroke && cs.stroke !== 'none' && numero(cs.strokeWidth, 0) > 0 &&
    /^\s*stroke/.test(cs.paintOrder || '');
  ctx.globalAlpha *= opacidad;
  ctx.textBaseline = 'alphabetic';
  segs.forEach(function (sg) {
    ctx.font = fuente(sg.cs);
    if (halo) {
      ctx.lineWidth = numero(cs.strokeWidth, 0);
      ctx.lineJoin = 'round';
      ctx.strokeStyle = cs.stroke;
      ctx.strokeText(sg.t, cx, y + sg.dy);
    }
    ctx.fillStyle = sg.cs.fill && sg.cs.fill !== 'none' ? sg.cs.fill : cs.fill;
    ctx.fillText(sg.t, cx, y + sg.dy);
    cx += sg.w;
  });
  ctx.restore();
}

/* Texto con notación (subíndices) en el canvas. Devuelve el ancho. */
function textoNotacion(ctx, texto, x, y, tam, peso, familia, color, medir) {
  var w = 0;
  trozos(texto).forEach(function (p) {
    var t = p.tipo === 'normal' ? tam : tam * 0.72;
    var dy = p.tipo === 'sub' ? tam * 0.3 : p.tipo === 'sup' ? -tam * 0.38 : 0;
    ctx.font = peso + ' ' + t + 'px ' + familia;
    if (!medir) { ctx.fillStyle = color; ctx.fillText(p.t, x + w, y + dy); }
    w += ctx.measureText(p.t).width;
  });
  return w;
}

/* Estilo de trazo de una serie (para la leyenda), leído de la hoja
   de estilos con un nodo temporal dentro del propio SVG. */
function estiloSerie(svg, clase) {
  var tmp = document.createElementNS(NS, 'path');
  tmp.setAttribute('class', 'sim-svg__serie sim-svg__' + clase);
  svg.appendChild(tmp);
  var cs = window.getComputedStyle(tmp);
  var e = {
    stroke: cs.stroke, ancho: numero(cs.strokeWidth, 2),
    dash: cs.strokeDasharray && cs.strokeDasharray !== 'none'
      ? cs.strokeDasharray.split(/[\s,]+/).map(function (v) { return numero(v, 0); }) : []
  };
  svg.removeChild(tmp);
  return e;
}

/* ── Composición y descarga ────────────────────────────────── */
/* op: { grafico, escala, ancho, titulo?, subtitulo?, leyenda?: [{ clase, etiqueta }],
         nombre } */
export function exportarPNG(op) {
  var listo = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  return listo.then(function () {
    return new Promise(function (resolver, rechazar) {
      op.grafico.conAncho(op.ancho || 760, function (svg) {
        try {
          var raizCs = window.getComputedStyle(svg);
          var tinta = raizCs.getPropertyValue('--color-text').trim() || '#131720';
          var tintaSuave = raizCs.getPropertyValue('--color-text-soft').trim() || '#444953';
          var familia = window.getComputedStyle(document.body).fontFamily;
          var vb = svg.viewBox.baseVal;
          var W = vb.width, H = vb.height;
          var pad = 28;
          var escala = op.escala || 2;

          var medidor = document.createElement('canvas').getContext('2d');
          var cab = 0;
          if (op.titulo) cab += 26;
          if (op.subtitulo) cab += 20;
          if (cab) cab += 14;

          /* Leyenda: filas que fluyen dentro del ancho disponible. */
          var items = (op.leyenda || []).map(function (it) {
            return { it: it, w: 34 + textoNotacion(medidor, it.etiqueta, 0, 0, 13, 500, familia, tinta, true) + 22 };
          });
          var filas = [], fila = [], usado = 0, maximo = W + 2 * pad - 2 * pad;
          items.forEach(function (o) {
            if (usado + o.w > maximo && fila.length) { filas.push(fila); fila = []; usado = 0; }
            fila.push(o); usado += o.w;
          });
          if (fila.length) filas.push(fila);
          var altoLeyenda = filas.length ? 16 + filas.length * 24 : 0;

          var Wt = W + 2 * pad;
          var Ht = pad + cab + H + altoLeyenda + pad - 8;
          var canvas = document.createElement('canvas');
          canvas.width = Math.round(Wt * escala);
          canvas.height = Math.round(Ht * escala);
          var ctx = canvas.getContext('2d');
          ctx.scale(escala, escala);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, Wt, Ht);

          var y = pad;
          if (op.titulo) {
            y += 18;
            textoNotacion(ctx, op.titulo, pad, y, 18, 600, familia, tinta, false);
            y += 8;
          }
          if (op.subtitulo) {
            y += 16;
            textoNotacion(ctx, op.subtitulo, pad, y, 13, 400, familia, tintaSuave, false);
            y += 4;
          }
          if (cab) y = pad + cab;

          ctx.save();
          ctx.translate(pad, y);
          for (var i = 0; i < svg.children.length; i++) pintarNodo(ctx, svg.children[i], svg);
          ctx.restore();

          var yl = y + H + 16;
          filas.forEach(function (f) {
            var x = pad;
            f.forEach(function (o) {
              var est = estiloSerie(svg, o.it.clase);
              ctx.save();
              ctx.strokeStyle = est.stroke;
              ctx.lineWidth = Math.max(1.5, Math.min(est.ancho, 3));
              ctx.setLineDash(est.dash);
              ctx.lineCap = 'round';
              ctx.beginPath();
              if (o.it.clase === 'etapas' || o.it.clase === 'total') {
                ctx.moveTo(x, yl - 1); ctx.lineTo(x + 12, yl - 1); ctx.lineTo(x + 12, yl - 9); ctx.lineTo(x + 26, yl - 9);
              } else {
                ctx.moveTo(x, yl - 2); ctx.lineTo(x + 26, yl - 8);
              }
              ctx.stroke();
              ctx.restore();
              textoNotacion(ctx, o.it.etiqueta, x + 34, yl, 13, 500, familia, tinta, false);
              x += o.w;
            });
            yl += 24;
          });

          canvas.toBlob(function (blob) {
            if (!blob) { rechazar(new Error('No se pudo generar la imagen.')); return; }
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = op.nombre || 'diagrama.png';
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
            resolver();
          }, 'image/png');
        } catch (err) {
          rechazar(err);
        }
      });
    });
  });
}
