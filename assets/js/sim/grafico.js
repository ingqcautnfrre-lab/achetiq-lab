/* ============================================================
   AChETIQ — Simuladores · renderizador SVG (grafico.js)
   ------------------------------------------------------------
   Diagrama cartesiano de McCabe-Thiele dibujado como SVG nativo
   (la CSP del sitio no admite bibliotecas de CDN). El viewBox se
   iguala al tamaño real en píxeles (ResizeObserver): los textos
   conservan su cuerpo a cualquier ancho en lugar de escalarse.

   ESCENA (lo que entrega cada simulador en actualizar()):
     {
       dominio: { x:[a,b], y:[c,d] },
       ejes:    { x:'x', y:'y', xTitulo, yTitulo },
       titulo, descripcion,                 (accesibles: <title>/<desc>)
       capas:   [ … ]                       (ver tipos abajo)
     }
   Tipos de capa (todas con `clase` → .sim-svg__<clase>):
     · curva     f(x) muestreada en [x0, x1]; corta el trazo donde
                 f no es finita.
     · linea     polilínea por puntos [[x,y], …].
     · escalones construcción por etapas { etapas, hasta, alim,
                 rotulo:{dx,dy,ancla} } con bandas alternas.
     · puntos    marcadores { x, y, etiqueta, ancla, dx, dy }.
     · guia      línea punteada desde (x,y) hasta el eje x.
   Las etiquetas directas usan la notación de notacion.js.

   INTERACCIÓN
     · Cursor en cruz con lectura de coordenadas.
     · Arrastre (ratón / lápiz) sobre el área de trazado: zoom a
       la ventana marcada; doble clic o restablecerVista() vuelve.
     · Al pasar sobre una etapa, onEtapa(n) (y resaltarEtapa(n)
       desde la tabla, en sentido inverso).
   ============================================================ */

'use strict';

import { enSVG } from './notacion.js';
import { fmt } from './numerico.js';

var NS = 'http://www.w3.org/2000/svg';
var contador = 0;

function nodo(tag, attrs, padre) {
  var n = document.createElementNS(NS, tag);
  if (attrs) {
    for (var k in attrs) {
      if (attrs[k] != null) n.setAttribute(k, String(attrs[k]));
    }
  }
  if (padre) padre.appendChild(n);
  return n;
}

/* Paso «redondo» (1, 2, 2,5 o 5 × 10^k) para ~n divisiones. */
function pasoNice(rango, n) {
  var bruto = rango / n;
  var pot = Math.pow(10, Math.floor(Math.log10(bruto)));
  var r = bruto / pot;
  var f = r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10;
  return f * pot;
}

function marcas(a, b, n) {
  var paso = pasoNice(b - a, n);
  var ini = Math.ceil(a / paso - 1e-9) * paso;
  var out = [];
  for (var v = ini; v <= b + paso * 1e-9; v += paso) out.push(Math.abs(v) < paso * 1e-9 ? 0 : v);
  return { valores: out, paso: paso };
}

function decimalesDe(paso) {
  return Math.max(0, Math.min(6, -Math.floor(Math.log10(paso) + 1e-9)));
}

export function crearGrafico(host, opciones) {
  var o = opciones || {};
  var id = 'simg-' + (++contador);
  var escena = null;
  var zoom = null;
  var anchoForzado = null;   /* exportación: render a tamaño fijo */
  var ver = { grilla: true, rotulos: true, numeros: true };
  var etapaActiva = null;
  var M = { l: 58, r: 18, t: 18, b: 50 };
  var W = 0, H = 0;

  var envoltura = document.createElement('div');
  envoltura.className = 'sim-plot__lienzo';
  host.appendChild(envoltura);

  var svg = nodo('svg', {
    class: 'sim-svg',
    role: 'img',
    'aria-labelledby': id + '-t ' + id + '-d',
    xmlns: NS
  }, envoltura);
  var titulo = nodo('title', { id: id + '-t' }, svg);
  var desc = nodo('desc', { id: id + '-d' }, svg);
  var defs = nodo('defs', null, svg);
  var clip = nodo('clipPath', { id: id + '-clip' }, defs);
  var clipRect = nodo('rect', null, clip);

  var gFondo = nodo('g', { class: 'sim-svg__fondo' }, svg);
  var gGrilla = nodo('g', { class: 'sim-svg__grilla', 'aria-hidden': 'true' }, svg);
  var gDatos = nodo('g', { 'clip-path': 'url(#' + id + '-clip)' }, svg);
  var gEjes = nodo('g', { class: 'sim-svg__ejes', 'aria-hidden': 'true' }, svg);
  var gRotulos = nodo('g', { class: 'sim-svg__rotulos', 'aria-hidden': 'true' }, svg);
  var gCursor = nodo('g', { class: 'sim-svg__cursor', 'aria-hidden': 'true' }, svg);
  var gZoom = nodo('g', { 'aria-hidden': 'true' }, svg);

  var lectura = document.createElement('p');
  lectura.className = 'sim-plot__lectura';
  lectura.setAttribute('aria-hidden', 'true');
  lectura.hidden = true;
  envoltura.appendChild(lectura);

  var dientes = [];   /* [{ n, caja:[x0,x1,y0,y1], poligono }] */

  /* ── Escalas ── */
  function dom() { return zoom || (escena && escena.dominio) || { x: [0, 1], y: [0, 1] }; }
  function sx(x) { var d = dom().x; return M.l + (x - d[0]) / (d[1] - d[0]) * (W - M.l - M.r); }
  function sy(y) { var d = dom().y; return H - M.b - (y - d[0]) / (d[1] - d[0]) * (H - M.t - M.b); }
  function ix(px) { var d = dom().x; return d[0] + (px - M.l) / (W - M.l - M.r) * (d[1] - d[0]); }
  function iy(py) { var d = dom().y; return d[0] + (H - M.b - py) / (H - M.t - M.b) * (d[1] - d[0]); }

  function trazo(puntos) {
    var s = '', abierto = false;
    for (var i = 0; i < puntos.length; i++) {
      var p = puntos[i];
      if (!p || !isFinite(p[0]) || !isFinite(p[1])) { abierto = false; continue; }
      var X = sx(p[0]), Y = sy(p[1]);
      /* Acota coordenadas extremas (curvas que divergen) para que
         el navegador no reciba valores enormes. */
      Y = Math.max(-1e4, Math.min(1e4, Y));
      s += (abierto ? 'L' : 'M') + X.toFixed(2) + ',' + Y.toFixed(2);
      abierto = true;
    }
    return s;
  }

  function texto(padre, x, y, contenido, attrs) {
    var t = nodo('text', Object.assign({ x: x.toFixed(1), y: y.toFixed(1) }, attrs || {}), padre);
    enSVG(t, contenido);
    return t;
  }

  /* Rótulo directo con halo (paint-order) para legibilidad sobre
     las series. */
  function rotulo(padre, x, y, contenido, ancla, clase) {
    return texto(padre, x, y, contenido, {
      class: 'sim-svg__rotulo' + (clase ? ' sim-svg__rotulo--' + clase : ''),
      'text-anchor': ancla || 'start'
    });
  }

  /* ── Render completo ── */
  function render() {
    if (!escena) return;
    var r = envoltura.getBoundingClientRect();
    W = anchoForzado || Math.max(280, Math.round(r.width));
    ver = Object.assign({ grilla: true, rotulos: true, numeros: true }, escena.mostrar || {});
    H = W;
    M = W < 520 ? { l: 52, r: 12, t: 14, b: 44 } : { l: 60, r: 18, t: 18, b: 50 };
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    titulo.textContent = escena.titulo || '';
    desc.textContent = escena.descripcion || '';

    [gFondo, gGrilla, gDatos, gEjes, gRotulos, gCursor, gZoom].forEach(function (g) {
      while (g.firstChild) g.removeChild(g.firstChild);
    });
    dientes = [];

    clipRect.setAttribute('x', M.l);
    clipRect.setAttribute('y', M.t);
    clipRect.setAttribute('width', W - M.l - M.r);
    clipRect.setAttribute('height', H - M.t - M.b);

    nodo('rect', {
      class: 'sim-svg__area', x: M.l, y: M.t,
      width: W - M.l - M.r, height: H - M.t - M.b
    }, gFondo);

    dibujarGrilla();
    escena.capas.forEach(function (c) {
      if (c.oculta) return;
      if (c.tipo === 'curva') capaCurva(c);
      else if (c.tipo === 'linea') capaLinea(c);
      else if (c.tipo === 'escalones') capaEscalones(c);
      else if (c.tipo === 'puntos') capaPuntos(c);
      else if (c.tipo === 'guia') capaGuia(c);
    });
    if (etapaActiva != null) marcarDiente(etapaActiva);
  }

  function dibujarGrilla() {
    var d = dom();
    var nDiv = W < 520 ? 5 : 10;
    var mx = marcas(d.x[0], d.x[1], nDiv);
    var my = marcas(d.y[0], d.y[1], nDiv);
    var decX = decimalesDe(mx.paso), decY = decimalesDe(my.paso);

    mx.valores.forEach(function (v) {
      var X = sx(v);
      if (ver.grilla) nodo('line', { x1: X, x2: X, y1: M.t, y2: H - M.b }, gGrilla);
      nodo('line', { class: 'sim-svg__tick', x1: X, x2: X, y1: H - M.b, y2: H - M.b + 5 }, gEjes);
      texto(gEjes, X, H - M.b + 18, fmt(v, decX), { class: 'sim-svg__num', 'text-anchor': 'middle' });
    });
    my.valores.forEach(function (v) {
      var Y = sy(v);
      if (ver.grilla) nodo('line', { x1: M.l, x2: W - M.r, y1: Y, y2: Y }, gGrilla);
      nodo('line', { class: 'sim-svg__tick', x1: M.l - 5, x2: M.l, y1: Y, y2: Y }, gEjes);
      texto(gEjes, M.l - 8, Y + 4, fmt(v, decY), { class: 'sim-svg__num', 'text-anchor': 'end' });
    });
    nodo('rect', {
      class: 'sim-svg__marco', x: M.l, y: M.t,
      width: W - M.l - M.r, height: H - M.t - M.b
    }, gEjes);

    /* Títulos de eje: versión corta en anchos angostos (no deben
       superponerse a los números ni salir del lienzo). */
    var e = escena.ejes || {};
    var corto = W < 520;
    texto(gEjes, (M.l + W - M.r) / 2, H - 8, (corto && e.xCorto) || e.xTitulo || '', {
      class: 'sim-svg__eje', 'text-anchor': 'middle'
    });
    texto(gEjes, 0, 0, (corto && e.yCorto) || e.yTitulo || '', {
      class: 'sim-svg__eje', 'text-anchor': 'middle',
      transform: 'translate(12 ' + ((M.t + H - M.b) / 2).toFixed(1) + ') rotate(-90)'
    });
  }

  function puntosCurva(c) {
    var d = dom();
    var a = Math.max(c.x[0], d.x[0]), b = Math.min(c.x[1], d.x[1]);
    if (!(b > a)) return [];
    var n = c.n || 240;
    var pts = [];
    for (var i = 0; i <= n; i++) {
      var x = a + (b - a) * i / n;
      var y = c.f(x);
      pts.push(isFinite(y) ? [x, y] : null);
    }
    return pts;
  }

  function capaCurva(c) {
    var pts = puntosCurva(c);
    nodo('path', { class: 'sim-svg__serie sim-svg__' + c.clase, d: trazo(pts) }, gDatos);
    if (c.etiqueta) etiquetaSerie(c, function (x) { return c.f(x); });
  }

  function capaLinea(c) {
    nodo('path', { class: 'sim-svg__serie sim-svg__' + c.clase, d: trazo(c.p) }, gDatos);
    if (c.etiqueta) {
      var p = c.p;
      etiquetaSerie(c, function (x) {
        for (var i = 0; i < p.length - 1; i++) {
          var a = p[i], b = p[i + 1];
          if ((x - a[0]) * (x - b[0]) <= 0 && a[0] !== b[0]) {
            return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
          }
        }
        return NaN;
      });
    }
  }

  /* Rótulo directo de una serie: en la abscisa `en` (o en el punto
     explícito `p`), desplazado en píxeles. Si cae fuera del área
     visible (por zoom) se omite. */
  function etiquetaSerie(c, f) {
    if (!ver.rotulos) return;
    var e = c.etiqueta;
    var x, y;
    if (e.p) { x = e.p[0]; y = e.p[1]; } else { x = e.en; y = f(x); }
    if (!isFinite(x) || !isFinite(y)) return;
    var X = sx(x) + (e.dx || 0), Y = sy(y) + (e.dy || 0);
    if (X < M.l + 4 || X > W - M.r - 4 || Y < M.t + 10 || Y > H - M.b - 4) return;
    if (e.guia) {
      /* Línea guía corta desde la serie hasta el rótulo desplazado a
         una zona libre del diagrama. */
      var gx = X - Math.sign(e.dx || 0) * 3, gy = Y + (e.dy < 0 ? 3 : -11);
      nodo('line', { class: 'sim-svg__lider', x1: sx(x), y1: sy(y), x2: gx, y2: gy }, gRotulos);
    }
    rotulo(gRotulos, X, Y, e.texto, e.ancla, c.clase);
  }

  function capaEscalones(c) {
    var g = nodo('g', { class: 'sim-svg__escalones' }, gDatos);
    var gb = nodo('g', { class: 'sim-svg__bandas' }, g);
    var hasta = c.hasta == null ? c.etapas.length : c.hasta;
    var pts = [];
    var total = c.etapas.length;
    var cada = total > 40 ? 10 : total > 20 ? 5 : 1;
    var ro = c.rotulo || { dx: -5, dy: -6, ancla: 'end' };

    for (var i = 0; i < Math.min(hasta, total); i++) {
      var e = c.etapas[i];
      pts.push([e.x0, e.y], [e.x, e.y], [e.x, e.y1]);
      /* Capa pasiva (p. ej. reflujo total de referencia): solo el
         trazo, sin bandas, rótulos ni interacción. */
      if (c.pasiva) continue;
      var poli = nodo('polygon', {
        class: 'sim-svg__banda' + (i % 2 ? ' sim-svg__banda--par' : '') +
          (e.seccion ? ' sim-svg__banda--' + (e.seccion === 'rect' ? 'rect' : 'strip') : '') +
          (e.n === c.alim ? ' sim-svg__banda--alim' : ''),
        /* xc (opcional): cierre de la banda sobre la recta de
           operación en la última etapa parcial (absorción). */
        points: [[e.x0, e.y], [e.x, e.y], [e.x, e.y1]].concat(e.xc != null ? [[e.xc, e.y1]] : []).map(function (p) {
          return sx(p[0]).toFixed(2) + ',' + sy(p[1]).toFixed(2);
        }).join(' ')
      }, gb);
      dientes.push({
        n: e.n,
        caja: [Math.min(e.x0, e.x), Math.max(e.x0, e.x), Math.min(e.y, e.y1), Math.max(e.y, e.y1)],
        poligono: poli
      });

      var esUltima = (i === total - 1);
      var esActual = (c.hasta != null && i === hasta - 1);
      var rotular = ver.numeros && (e.n === 1 || e.n % cada === 0 || e.n === c.alim || esUltima || esActual);
      if (rotular) {
        var X = sx(e.x) + ro.dx, Y = sy(e.y) + ro.dy;
        /* Ancho aproximado del número (mono 10,5 px) para no invadir
           el margen de los ejes. */
        var ancho = String(e.n).length * 6.5;
        var izq = ro.ancla === 'end' ? X - ancho : X;
        var der = ro.ancla === 'end' ? X : X + ancho;
        if (izq > M.l + 2 && der < W - M.r - 2 && Y > M.t + 8 && Y < H - M.b - 2) {
          rotulo(gRotulos, X, Y, String(e.n), ro.ancla, 'etapa' + (e.n === c.alim ? ' sim-svg__rotulo--alim' : ''));
        }
      }
    }
    var claseSerie = 'sim-svg__serie sim-svg__' + (c.clase || 'etapas');
    if (c.hasta != null && c.hasta >= 1 && pts.length >= 3) {
      /* Modo paso a paso: la última etapa visible se traza aparte
         (pathLength = 1) para animar su dibujo con stroke-dashoffset. */
      nodo('path', { class: claseSerie, d: trazo(pts.slice(0, -3)) }, g);
      nodo('path', {
        class: claseSerie + ' sim-svg__nueva', pathLength: 1,
        d: trazo(pts.slice(-3))
      }, g);
    } else {
      nodo('path', { class: claseSerie, d: trazo(pts) }, g);
    }

    if (!c.pasiva && c.alim && c.alim <= hasta) {
      var ea = c.etapas[c.alim - 1];
      if (ea) {
        nodo('circle', {
          class: 'sim-svg__alim', cx: sx(ea.x), cy: sy(ea.y), r: 5.5
        }, gRotulos);
      }
    }
  }

  function capaPuntos(c) {
    c.items.forEach(function (p) {
      if (!isFinite(p.x) || !isFinite(p.y)) return;
      var X = sx(p.x), Y = sy(p.y);
      if (X < M.l - 1 || X > W - M.r + 1 || Y < M.t - 1 || Y > H - M.b + 1) return;
      nodo('circle', { class: 'sim-svg__punto sim-svg__punto--' + (p.clase || c.clase || 'base'), cx: X, cy: Y, r: p.r || 4.5 }, gRotulos);
      if (p.etiqueta) {
        var tx = X + (p.dx == null ? 8 : p.dx);
        var ty = Y + (p.dy == null ? -8 : p.dy);
        var anc = p.ancla || 'start';
        /* Evita que el rótulo salga del área: invierte el ancla. */
        if (anc === 'start' && tx > W - M.r - 70) { anc = 'end'; tx = X - Math.abs(p.dx == null ? 8 : p.dx); }
        if (anc === 'end' && tx < M.l + 70) { anc = 'start'; tx = X + Math.abs(p.dx == null ? 8 : p.dx); }
        var tyc = Math.max(M.t + 12, Math.min(H - M.b - 6, ty));
        if (p.guia) {
          nodo('line', { class: 'sim-svg__lider', x1: X, y1: Y, x2: tx + (anc === 'end' ? 3 : -3), y2: tyc - 4 }, gRotulos);
        }
        rotulo(gRotulos, tx, tyc, p.etiqueta, anc, 'punto');
      }
    });
  }

  function capaGuia(c) {
    var X = sx(c.x), Y = sy(c.y);
    if (X < M.l || X > W - M.r) return;
    nodo('line', {
      class: 'sim-svg__guia', x1: X, x2: X,
      y1: Math.max(M.t, Math.min(H - M.b, Y)), y2: H - M.b
    }, gDatos);
  }

  /* ── Hover de etapas ── */
  function marcarDiente(n) {
    dientes.forEach(function (d) {
      d.poligono.classList.toggle('is-activa', d.n === n);
    });
  }

  function etapaEn(x, y) {
    for (var i = 0; i < dientes.length; i++) {
      var c = dientes[i].caja;
      var tolx = (dom().x[1] - dom().x[0]) * 0.004;
      var toly = (dom().y[1] - dom().y[0]) * 0.004;
      if (x >= c[0] - tolx && x <= c[1] + tolx && y >= c[2] - toly && y <= c[3] + toly) return dientes[i].n;
    }
    return null;
  }

  /* ── Puntero: cursor en cruz, lectura y zoom por arrastre ── */
  var arrastre = null;

  function local(ev) {
    var r = svg.getBoundingClientRect();
    return { x: (ev.clientX - r.left) * (W / r.width), y: (ev.clientY - r.top) * (H / r.height) };
  }
  function dentro(p) { return p.x >= M.l && p.x <= W - M.r && p.y >= M.t && p.y <= H - M.b; }

  function limpiarCursor() {
    while (gCursor.firstChild) gCursor.removeChild(gCursor.firstChild);
    lectura.hidden = true;
  }

  svg.addEventListener('pointermove', function (ev) {
    if (!escena) return;
    var p = local(ev);
    limpiarCursor();
    if (arrastre) {
      while (gZoom.firstChild) gZoom.removeChild(gZoom.firstChild);
      var x0 = Math.max(M.l, Math.min(arrastre.x, p.x)), x1 = Math.min(W - M.r, Math.max(arrastre.x, p.x));
      var y0 = Math.max(M.t, Math.min(arrastre.y, p.y)), y1 = Math.min(H - M.b, Math.max(arrastre.y, p.y));
      nodo('rect', { class: 'sim-svg__zoom', x: x0, y: y0, width: x1 - x0, height: y1 - y0 }, gZoom);
      return;
    }
    if (!dentro(p)) {
      if (etapaActiva != null) { etapaActiva = null; marcarDiente(null); if (o.onEtapa) o.onEtapa(null); }
      return;
    }
    nodo('line', { x1: p.x, x2: p.x, y1: M.t, y2: H - M.b }, gCursor);
    nodo('line', { x1: M.l, x2: W - M.r, y1: p.y, y2: p.y }, gCursor);
    var x = ix(p.x), y = iy(p.y);
    var e = escena.ejes || {};
    var span = Math.max(dom().x[1] - dom().x[0], dom().y[1] - dom().y[0]);
    var dec = Math.max(3, decimalesDe(span / 100) + 1);
    lectura.textContent = (e.xPlano || 'x') + ' = ' + fmt(x, dec) + '   ' + (e.yPlano || 'y') + ' = ' + fmt(y, dec);
    lectura.hidden = false;

    var n = etapaEn(x, y);
    if (n !== etapaActiva) {
      etapaActiva = n;
      marcarDiente(n);
      if (o.onEtapa) o.onEtapa(n);
    }
  });

  svg.addEventListener('pointerleave', function () {
    limpiarCursor();
    if (etapaActiva != null) { etapaActiva = null; marcarDiente(null); if (o.onEtapa) o.onEtapa(null); }
  });

  svg.addEventListener('pointerdown', function (ev) {
    if (ev.pointerType === 'touch' || ev.button !== 0) return;
    var p = local(ev);
    if (!dentro(p)) return;
    arrastre = p;
    svg.setPointerCapture(ev.pointerId);
  });

  svg.addEventListener('pointerup', function (ev) {
    if (!arrastre) return;
    var p = local(ev);
    var a = arrastre;
    arrastre = null;
    while (gZoom.firstChild) gZoom.removeChild(gZoom.firstChild);
    if (Math.abs(p.x - a.x) < 12 || Math.abs(p.y - a.y) < 12) return;
    var xa = ix(Math.max(M.l, Math.min(a.x, p.x))), xb = ix(Math.min(W - M.r, Math.max(a.x, p.x)));
    var ya = iy(Math.min(H - M.b, Math.max(a.y, p.y))), yb = iy(Math.max(M.t, Math.min(a.y, p.y)));
    zoom = { x: [xa, xb], y: [ya, yb] };
    render();
    if (o.onZoom) o.onZoom(true);
  });

  svg.addEventListener('dblclick', function () { restablecerVista(); });

  function restablecerVista() {
    if (!zoom) return;
    zoom = null;
    render();
    if (o.onZoom) o.onZoom(false);
  }

  var ro = new ResizeObserver(function () { render(); });
  ro.observe(envoltura);

  return {
    svg: svg,
    actualizar: function (nueva) {
      escena = nueva;
      render();
    },
    restablecerVista: restablecerVista,
    hayZoom: function () { return !!zoom; },
    resaltarEtapa: function (n) { etapaActiva = n; marcarDiente(n); },
    /* Re-dibuja el diagrama a un ancho fijo (independiente de la
       pantalla), ejecuta `fn(svg)` y restaura el render normal. Todo
       ocurre en la misma tarea: no llega a pintarse. */
    conAncho: function (ancho, fn) {
      anchoForzado = ancho;
      var previa = etapaActiva;
      etapaActiva = null;
      render();
      try { return fn(svg); }
      finally { anchoForzado = null; etapaActiva = previa; render(); }
    }
  };
}

/* Serializa el SVG con los estilos computados como ATRIBUTOS DE
   PRESENTACIÓN (fill, stroke, font-*…), para exportarlo como archivo
   autónomo: fuera de la página la hoja de estilos no viaja con él. Se
   evita el atributo style= a propósito (la CSP del sitio no admite
   estilos en línea, ni siquiera en nodos clonados). */
var PROPS = ['fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-dasharray',
  'stroke-linecap', 'stroke-linejoin', 'stroke-opacity', 'opacity', 'font-family',
  'font-size', 'font-weight', 'letter-spacing', 'paint-order'];

export function serializarSVG(svg) {
  var copia = svg.cloneNode(true);
  var orig = svg.querySelectorAll('*');
  var dest = copia.querySelectorAll('*');
  for (var i = 0; i < orig.length; i++) {
    var cs = window.getComputedStyle(orig[i]);
    for (var k = 0; k < PROPS.length; k++) {
      var v = cs.getPropertyValue(PROPS[k]);
      if (v) dest[i].setAttribute(PROPS[k], v);
    }
    if (cs.getPropertyValue('display') === 'none') dest[i].setAttribute('display', 'none');
    dest[i].removeAttribute('class');
  }
  copia.removeAttribute('class');
  copia.setAttribute('xmlns', NS);
  var fondo = document.createElementNS(NS, 'rect');
  fondo.setAttribute('width', '100%');
  fondo.setAttribute('height', '100%');
  fondo.setAttribute('fill', '#ffffff');
  copia.insertBefore(fondo, copia.querySelector('g'));
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(copia);
}
