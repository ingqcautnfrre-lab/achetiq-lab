/* ============================================================
   AChETIQ — Simuladores · esquema del equipo (esquema.js)
   ------------------------------------------------------------
   Dibuja la columna que corresponde al resultado del simulador:
   se redibuja con el número de etapas y la etapa de alimentación,
   y rotula cada corriente con su caudal y composición.

     · destilación: N − 1 platos + reboiler parcial (etapa N),
       condensador total con acumulador y reflujo al plato 1,
       alimentación en la etapa óptima; platos teñidos por sección
       con los colores de sus rectas en el diagrama.
     · absorción:   N etapas (1 en el tope, notación Treybal);
       solvente y gas tratado en el tope, gas de entrada y líquido
       de salida en el fondo.

   SVG nativo con clases (simuladores.css §4b): sin innerHTML ni
   estilos en línea (CSP). Las etapas son interactivas: al pasar el
   puntero se invoca onEtapa(n) para resaltar el escalón del
   diagrama y la fila de la tabla; resaltar(n) hace lo inverso.
   ============================================================ */

'use strict';

import { enSVG } from './notacion.js';

var NS = 'http://www.w3.org/2000/svg';
var contador = 0;

function nodo(tag, attrs, padre) {
  var n = document.createElementNS(NS, tag);
  if (attrs) for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, String(attrs[k]));
  if (padre) padre.appendChild(n);
  return n;
}

function texto(padre, x, y, contenido, clase, ancla) {
  var t = nodo('text', { x: x.toFixed(1), y: y.toFixed(1), class: clase, 'text-anchor': ancla || 'start' }, padre);
  enSVG(t, contenido);
  return t;
}

/* Rótulo de corriente: nombre (Hanken) + líneas de datos (mono). */
var INTERLINEA = 17;

function rotuloCorriente(padre, x, y, nombre, lineas, ancla) {
  texto(padre, x, y, nombre, 'sim-esq__corriente', ancla);
  (lineas || []).forEach(function (l, i) {
    if (l) texto(padre, x, y + 18 + i * INTERLINEA, l, 'sim-esq__dato', ancla);
  });
}

function flecha(padre, puntos, id, clase) {
  var d = puntos.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join('');
  return nodo('path', { d: d, class: 'sim-esq__linea' + (clase ? ' ' + clase : ''), 'marker-end': 'url(#' + id + ')' }, padre);
}

export function crearEsquema(host, opciones) {
  var o = opciones || {};
  var id = 'sesq-' + (++contador);
  /* Contenedor desplazable en pantallas angostas: enfocable para
     poder desplazarlo con el teclado. */
  var marco = document.createElement('div');
  marco.className = 'sim-esq__marco';
  marco.setAttribute('tabindex', '0');
  marco.setAttribute('role', 'region');
  marco.setAttribute('aria-label', 'Esquema del equipo');
  host.appendChild(marco);
  var svg = nodo('svg', { class: 'sim-esq', role: 'img', 'aria-labelledby': id + '-t ' + id + '-d' }, marco);
  var titulo = nodo('title', { id: id + '-t' }, svg);
  var desc = nodo('desc', { id: id + '-d' }, svg);
  var defs = nodo('defs', null, svg);
  var marker = nodo('marker', {
    id: id + '-punta', viewBox: '0 0 10 10', refX: 9, refY: 5,
    markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse'
  }, defs);
  nodo('path', { d: 'M0,0L10,5L0,10z', class: 'sim-esq__punta' }, marker);
  var g = nodo('g', null, svg);

  var etapas = [];   /* [{ n, nodo }] */
  var activa = null;

  function limpiar() {
    while (g.firstChild) g.removeChild(g.firstChild);
    etapas = [];
  }

  function registrar(n, el) {
    etapas.push({ n: n, nodo: el });
    el.addEventListener('pointerenter', function () { marcar(n); if (o.onEtapa) o.onEtapa(n); });
    el.addEventListener('pointerleave', function () { marcar(null); if (o.onEtapa) o.onEtapa(null); });
  }

  function marcar(n) {
    activa = n;
    etapas.forEach(function (e) { e.nodo.classList.toggle('is-activa', e.n === n); });
  }

  /* Cuerpo de columna con sus etapas. Devuelve la geometría para
     ubicar las corrientes. nPlatos = etapas dentro de la columna. */
  function columna(cx, ancho, y0, nPlatos, seccionDe, alim, inviable) {
    var alto = Math.min(520, Math.max(250, nPlatos * 24));
    var paso = alto / nPlatos;
    var x0 = cx - ancho / 2, x1 = cx + ancho / 2;
    var gc = nodo('g', { class: 'sim-esq__columna' + (inviable ? ' is-inviable' : '') }, g);
    nodo('rect', { x: x0, y: y0, width: ancho, height: alto, rx: 14, class: 'sim-esq__cuerpo' }, gc);
    var cada = nPlatos > 40 ? 10 : nPlatos > 20 ? 5 : 1;
    /* En columnas densas los platos dejan libre una franja a la
       izquierda para que la numeración no quede tachada. */
    var xp = paso < 18 ? x0 + 30 : x0 + 4;
    for (var i = 0; i < nPlatos; i++) {
      var n = i + 1;
      var ya = y0 + i * paso, yb = ya + paso;
      var sec = seccionDe(n);
      var banda = nodo('rect', {
        x: x0 + 1, y: ya + (i === 0 ? 6 : 0), width: ancho - 2,
        height: paso - (i === 0 ? 6 : 0) - (i === nPlatos - 1 ? 6 : 0),
        class: 'sim-esq__etapa sim-esq__etapa--' + sec + (n === alim ? ' is-alim' : '')
      }, gc);
      if (!inviable) registrar(n, banda);
      /* Plato: línea horizontal con bajante alternado (si hay lugar). */
      if (i < nPlatos - 1) {
        nodo('line', { x1: xp, x2: x1 - 4, y1: yb, y2: yb, class: 'sim-esq__plato' }, gc);
        if (paso >= 14) {
          /* Bajantes alternados, fuera de la franja de numeración. */
          var xb = (i % 2) ? x0 + ancho * 0.36 : x1 - ancho * 0.2;
          nodo('line', { x1: xb, x2: xb, y1: yb, y2: yb + paso * 0.55, class: 'sim-esq__bajante' }, gc);
        }
      }
      if (!inviable && (n === 1 || n === nPlatos || n === alim || n % cada === 0) && paso >= 9) {
        /* Los extremos se apartan del borde redondeado del casco. */
        var yn = Math.min(Math.max(ya + paso / 2 + 4, y0 + 15), y0 + alto - 6);
        texto(gc, x0 + 9, yn, String(n), 'sim-esq__num' + (n === alim ? ' is-alim' : ''), 'start');
      }
    }
    return { x0: x0, x1: x1, y0: y0, y1: y0 + alto, paso: paso, cx: cx };
  }

  /* Aviso de pinch: placa centrada sobre la columna atenuada. */
  function aviso(x, y) {
    var ga = nodo('g', { class: 'sim-esq__aviso' }, g);
    nodo('rect', { x: x - 78, y: y - 26, width: 156, height: 48, rx: 8 }, ga);
    texto(ga, x, y - 5, 'Se requerirían', 'sim-esq__inviable', 'middle');
    texto(ga, x, y + 12, 'infinitas etapas', 'sim-esq__inviable', 'middle');
  }

  function llave(x, ya, yb, lineas) {
    var gl = nodo('g', { class: 'sim-esq__seccion' }, g);
    nodo('path', {
      d: 'M' + x + ',' + (ya + 2) + 'h6V' + (yb - 2) + 'h-6',
      class: 'sim-esq__llave'
    }, gl);
    var ym = (ya + yb) / 2 - (lineas.length - 1) * INTERLINEA / 2;
    lineas.forEach(function (l, i) {
      if (l) texto(gl, x + 14, ym + i * INTERLINEA + 4, l, i === 0 ? 'sim-esq__seccion-titulo' : 'sim-esq__dato', 'start');
    });
  }

  /* ── Destilación ─────────────────────────────────────────── */
  /* Lienzo de 760 unidades de ancho: corrientes de entrada a la
     izquierda, columna al centro, secciones y productos a la
     derecha. d.F / d.D / d.B / d.L son listas de líneas; d.V, d.Lb,
     d.Vb, d.LV y d.LVb, textos simples. */
  function destilacion(d) {
    var W = 760;
    var finita = isFinite(d.n) && d.n >= 2;
    var N = finita ? d.n : 14;
    var nPlatos = N - 1;          /* el reboiler es la etapa N */
    var alim = finita ? d.alim : Math.round(nPlatos / 2);
    var y0 = 124;
    var cx = 360, ancho = 100;
    var c = columna(cx, ancho, y0, nPlatos, function (n) {
      return n < alim ? 'rect' : n === alim ? 'alim' : 'strip';
    }, alim, !finita);

    /* Vapor de tope → condensador total → acumulador. */
    var yc = 54, xc = 520;
    nodo('path', { d: 'M' + cx + ',' + c.y0 + 'V' + yc + 'H' + (xc - 20), class: 'sim-esq__linea' }, g);
    texto(g, cx - 10, 96, d.V, 'sim-esq__dato', 'end');
    var cond = nodo('g', { class: 'sim-esq__equipo' }, g);
    nodo('circle', { cx: xc, cy: yc, r: 20 }, cond);
    nodo('path', { d: 'M' + (xc - 13) + ',' + (yc + 8) + 'l6.5,-16l6.5,16l6.5,-16l6.5,16', class: 'sim-esq__serpentin' }, cond);
    texto(g, xc, yc - 30, 'Condensador total', 'sim-esq__equipo-nombre', 'middle');
    nodo('path', { d: 'M' + xc + ',' + (yc + 20) + 'V' + 94, class: 'sim-esq__linea' }, g);
    nodo('rect', { x: xc - 34, y: 94, width: 68, height: 22, rx: 11, class: 'sim-esq__tambor' }, g);

    /* Destilado. */
    flecha(g, [[xc + 34, 105], [624, 105]], id + '-punta');
    rotuloCorriente(g, 632, 101, 'Destilado, D', d.D, 'start');

    /* Reflujo al plato 1. */
    var yR = c.y0 + c.paso * 0.5;
    flecha(g, [[xc - 34, 105], [446, 105], [446, yR], [c.x1 + 1, yR]], id + '-punta');
    rotuloCorriente(g, 456, 136, 'Reflujo', d.L, 'start');

    /* Alimentación en la etapa óptima. */
    var yF = c.y0 + (alim - 0.5) * c.paso;
    flecha(g, [[40, yF], [c.x0 - 1, yF]], id + '-punta', 'sim-esq__linea--alim');
    rotuloCorriente(g, 40, yF - 16 - INTERLINEA * (d.F || []).length - 18, 'Alimentación, F', d.F, 'start');

    /* Reboiler parcial (etapa N); con E_MV < 1 se lo considera
       etapa ideal (d.ideal) y se rotula como tal. */
    var yk = c.y1 + 42;
    nodo('path', { d: 'M' + (cx - 26) + ',' + c.y1 + 'V' + yk, class: 'sim-esq__linea' }, g);
    var reb = nodo('rect', {
      x: cx - 74, y: yk, width: 148, height: 50, rx: 25,
      class: 'sim-esq__reboiler' + (finita ? '' : ' is-inviable')
    }, g);
    if (finita) registrar(N, reb);
    texto(g, cx, yk + 22, 'Reboiler parcial', 'sim-esq__equipo-nombre', 'middle');
    texto(g, cx, yk + 38, finita ? 'etapa ' + N + (d.ideal ? ' · ideal' : '') : '—', 'sim-esq__num', 'middle');
    flecha(g, [[cx + 38, yk], [cx + 38, c.y1 - 1]], id + '-punta');
    texto(g, cx - 34, c.y1 + 27, d.Lb, 'sim-esq__dato', 'end');
    texto(g, cx + 46, c.y1 + 27, d.Vb, 'sim-esq__dato', 'start');

    /* Residuo. */
    flecha(g, [[cx + 74, yk + 25], [624, yk + 25]], id + '-punta');
    rotuloCorriente(g, 632, yk + 21, 'Residuo, B', d.B, 'start');

    /* Secciones. */
    if (finita) {
      var platosRect = alim - 1, platosStrip = nPlatos - alim + 1;
      if (platosRect > 0) {
        llave(590, c.y0, c.y0 + (alim - 1) * c.paso, [
          'Rectificación', platosRect + (platosRect === 1 ? ' plato' : ' platos'), d.LV
        ]);
      }
      llave(590, c.y0 + (alim - 1) * c.paso, c.y1, [
        'Agotamiento', platosStrip + (platosStrip === 1 ? ' plato' : ' platos'), '+ 1 reboiler', d.LVb
      ]);
    } else {
      aviso(cx, c.y0 + (c.y1 - c.y0) / 2);
    }

    var H = yk + 50 + 30;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  }

  /* ── Absorción ───────────────────────────────────────────── */
  /* d.Lin / d.Gout / d.Gin / d.Lout: listas de líneas. */
  function absorcion(d) {
    var W = 760;
    var finita = isFinite(d.n) && d.n >= 1;
    var N = finita ? d.n : 10;
    var y0 = 108;
    var cx = 360, ancho = 110;
    var c = columna(cx, ancho, y0, N, function () { return 'op'; }, null, !finita);

    /* Tope: solvente entra por la izquierda; gas tratado sale arriba. */
    var ys = c.y0 + c.paso * 0.5;
    flecha(g, [[40, ys], [c.x0 - 1, ys]], id + '-punta');
    rotuloCorriente(g, 40, ys - 16 - INTERLINEA * (d.Lin || []).length - 18, 'Solvente', d.Lin, 'start');
    flecha(g, [[cx, c.y0], [cx, 46], [560, 46]], id + '-punta');
    rotuloCorriente(g, 568, 42, 'Gas tratado', d.Gout, 'start');

    /* Fondo: gas entra por la izquierda; líquido sale abajo. */
    var yg = c.y1 - c.paso * 0.5;
    flecha(g, [[40, yg], [c.x0 - 1, yg]], id + '-punta');
    rotuloCorriente(g, 40, yg + 24, 'Gas de entrada', d.Gin, 'start');
    flecha(g, [[cx, c.y1], [cx, c.y1 + 40], [560, c.y1 + 40]], id + '-punta');
    rotuloCorriente(g, 568, c.y1 + 36, 'Líquido de salida', d.Lout, 'start');

    if (finita) {
      llave(c.x1 + 30, c.y0, c.y1, [
        N + (N === 1 ? ' etapa' : ' etapas') + (d.real ? ' reales' : ' teóricas'), d.LV, d.soluto
      ]);
    } else {
      aviso(cx, c.y0 + (c.y1 - c.y0) / 2);
    }

    var H = Math.max(c.y1 + 40 + 64, yg + 24 + 60);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  }

  return {
    svg: svg,
    dibujar: function (d) {
      limpiar();
      titulo.textContent = d.titulo || 'Esquema del equipo';
      desc.textContent = d.descripcion || '';
      if (d.tipo === 'destilacion') destilacion(d); else absorcion(d);
      if (activa != null) marcar(activa);
    },
    resaltar: function (n) { marcar(n); }
  };
}
