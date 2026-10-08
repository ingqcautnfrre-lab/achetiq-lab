/* ============================================================
   AChETIQ — Simuladores · piezas de interfaz (ui.js)
   ------------------------------------------------------------
   Controles y bloques compartidos por los simuladores. Todo el
   DOM se construye con createElement/textContent (sin innerHTML)
   y ningún estilo se escribe en línea: la presentación vive en
   assets/css/simuladores.css.

     · campo()        deslizador + campo numérico sincronizados,
                      con validación en línea (aria-invalid +
                      mensaje asociado por aria-describedby).
     · segmentado()   grupo de radios con aspecto de control
                      segmentado (fieldset + legend).
     · selector()     <select> con etiqueta.
     · areaDatos()    <textarea> para pares tabulados.
     · grupo()        <fieldset> con leyenda.
     · pestanas()     patrón ARIA tabs (flechas, Inicio, Fin).
     · anunciador()   región viva educada con retardo.
     · ficha()        <dl> de resultados.
     · avisos()       mensajes de factibilidad con glifo + texto.
     · descargar()    archivo generado en el cliente (Blob).
   ============================================================ */

'use strict';

import { createElement } from '../loaders.js';
import { enHTML, plano } from './notacion.js';
import { fmt } from './numerico.js';

var uid = 0;
function nuevoId(base) { return 'sim-' + base + '-' + (++uid); }

export function el(tag, clase, texto, attrs) {
  return createElement(tag, { class: clase || null, text: texto == null ? null : texto, attrs: attrs || null });
}

/* Elemento con notación (subíndices) como contenido. */
export function elNotacion(tag, clase, notacion, attrs) {
  return enHTML(el(tag, clase, null, attrs), notacion);
}

/* ── Grupo de controles ─────────────────────────────────────── */
export function grupo(leyenda, clase) {
  var fs = el('fieldset', 'sim-grupo' + (clase ? ' ' + clase : ''));
  fs.appendChild(el('legend', 'sim-grupo__leyenda', leyenda));
  return fs;
}

/* ── Deslizador + número ────────────────────────────────────── */
/* def: { etiqueta, unidad?, min, max, paso, dec, limMin?, limMax?,
          rangoTexto?, ayuda? }
   min/max acotan el deslizador; limMin/limMax (opcionales) amplían
   lo admisible por teclado en el campo numérico. */
export function campo(def, valor, alCambiar) {
  var idNum = nuevoId('num');
  var idAyuda = nuevoId('ayuda');
  var idError = nuevoId('error');
  var limMin = def.limMin == null ? def.min : def.limMin;
  var limMax = def.limMax == null ? def.max : def.limMax;
  var dec = def.dec == null ? 2 : def.dec;

  var raiz = el('div', 'sim-campo');
  var cab = el('div', 'sim-campo__cab');
  var label = elNotacion('label', 'sim-campo__etiqueta', def.etiqueta, { for: idNum });
  var caja = el('span', 'sim-campo__caja');
  var num = el('input', 'sim-campo__numero', null, {
    id: idNum, type: 'number', inputmode: 'decimal',
    min: limMin, max: limMax, step: 'any',
    'aria-describedby': idAyuda + ' ' + idError,
    autocomplete: 'off'
  });
  caja.appendChild(num);
  if (def.unidad) caja.appendChild(elNotacion('span', 'sim-campo__unidad', def.unidad, { 'aria-hidden': 'true' }));
  cab.appendChild(label);
  cab.appendChild(caja);
  raiz.appendChild(cab);

  var rango = null;
  if (!def.sinDeslizador) {
    rango = el('input', 'sim-campo__rango', null, {
      type: 'range', min: def.min, max: def.max, step: def.paso,
      'aria-label': plano(def.etiqueta) + (def.unidad ? ' (' + plano(def.unidad) + ')' : ''),
      'aria-describedby': idAyuda
    });
    raiz.appendChild(rango);
  }
  var ayuda = elNotacion('p', 'sim-campo__ayuda', def.ayuda ||
    ('Entre ' + fmt(limMin, dec) + ' y ' + fmt(limMax, dec) + (def.unidad ? ' ' + plano(def.unidad) : '') + '.'),
    { id: idAyuda });
  var error = el('p', 'sim-campo__error', null, { id: idError, hidden: '' });
  raiz.appendChild(ayuda);
  raiz.appendChild(error);

  function pintar(v) {
    num.value = String(Number(v.toFixed(Math.max(dec, 0) + 2)));
    if (rango) {
      rango.value = String(Math.min(def.max, Math.max(def.min, v)));
      rango.setAttribute('aria-valuetext', plano(def.simbolo || def.etiqueta) + ' = ' + fmt(v, dec));
      /* Porcentaje de recorrido para el relleno de la pista
         (custom property vía CSSOM: compatible con la CSP). */
      var pct = (Math.min(def.max, Math.max(def.min, v)) - def.min) / (def.max - def.min) * 100;
      rango.style.setProperty('--sim-pct', pct.toFixed(2) + '%');
    }
  }
  function marcarError(msg) {
    if (msg) {
      num.setAttribute('aria-invalid', 'true');
      error.textContent = msg;
      error.hidden = false;
    } else {
      num.removeAttribute('aria-invalid');
      error.textContent = '';
      error.hidden = true;
    }
  }

  if (rango) {
    rango.addEventListener('input', function () {
      var v = Number(rango.value);
      marcarError(null);
      pintar(v);
      alCambiar(v);
    });
  }
  num.addEventListener('input', function () {
    var bruto = num.value.trim().replace(',', '.');
    if (bruto === '' || bruto === '-' || bruto === '.') return;
    var v = Number(bruto);
    if (!isFinite(v)) { marcarError('Ingresá un número válido.'); return; }
    if (v < limMin || v > limMax) {
      marcarError('El valor debe estar entre ' + fmt(limMin, dec) + ' y ' + fmt(limMax, dec) + '.');
      return;
    }
    marcarError(null);
    if (rango) {
      rango.value = String(Math.min(def.max, Math.max(def.min, v)));
      var pct = (Math.min(def.max, Math.max(def.min, v)) - def.min) / (def.max - def.min) * 100;
      rango.style.setProperty('--sim-pct', pct.toFixed(2) + '%');
      rango.setAttribute('aria-valuetext', plano(def.simbolo || def.etiqueta) + ' = ' + fmt(v, dec));
    }
    alCambiar(v);
  });
  num.addEventListener('blur', function () {
    if (num.getAttribute('aria-invalid') === 'true') return;
    if (num.value.trim() === '') pintar(valorActual());
  });

  var valorActual = function () { return Number(num.value); };
  pintar(valor);

  return {
    nodo: raiz,
    fijar: function (v) { marcarError(null); pintar(v); },
    mostrar: function (si) { raiz.hidden = !si; },
    marcarError: marcarError
  };
}

/* ── Control segmentado ─────────────────────────────────────── */
/* def: { leyenda, opciones:[{ valor, etiqueta }] } */
export function segmentado(def, valor, alCambiar) {
  var nombre = nuevoId('seg');
  var fs = el('fieldset', 'sim-seg');
  fs.appendChild(el('legend', 'sim-seg__leyenda', def.leyenda));
  var fila = el('div', 'sim-seg__opciones');
  var radios = [];
  def.opciones.forEach(function (op) {
    var id = nuevoId('opt');
    var r = el('input', 'sim-seg__radio', null, { type: 'radio', name: nombre, id: id, value: op.valor });
    if (op.valor === valor) r.checked = true;
    var l = elNotacion('label', 'sim-seg__opcion', op.etiqueta, { for: id });
    r.addEventListener('change', function () { if (r.checked) alCambiar(op.valor); });
    radios.push(r);
    fila.appendChild(r);
    fila.appendChild(l);
  });
  fs.appendChild(fila);
  return {
    nodo: fs,
    fijar: function (v) { radios.forEach(function (r) { r.checked = (r.value === v); }); }
  };
}

/* ── Selector ───────────────────────────────────────────────── */
export function selector(def, valor, alCambiar) {
  var id = nuevoId('sel');
  var raiz = el('div', 'sim-campo sim-campo--select');
  raiz.appendChild(elNotacion('label', 'sim-campo__etiqueta', def.etiqueta, { for: id }));
  var s = el('select', 'sim-select', null, { id: id });
  def.opciones.forEach(function (op) {
    var o = el('option', null, op.etiqueta, { value: op.valor });
    s.appendChild(o);
  });
  s.value = valor;
  s.addEventListener('change', function () { alCambiar(s.value); });
  raiz.appendChild(s);
  return {
    nodo: raiz,
    fijar: function (v) { s.value = v; },
    mostrar: function (si) { raiz.hidden = !si; }
  };
}

/* ── Área de datos tabulados ────────────────────────────────── */
export function areaDatos(def, valor, alCambiar) {
  var id = nuevoId('datos');
  var idAyuda = nuevoId('ayuda');
  var raiz = el('div', 'sim-campo sim-campo--datos');
  raiz.appendChild(elNotacion('label', 'sim-campo__etiqueta', def.etiqueta, { for: id }));
  var ta = el('textarea', 'sim-datos', null, {
    id: id, rows: '9', spellcheck: 'false', autocomplete: 'off',
    'aria-describedby': idAyuda
  });
  ta.value = valor;
  var espera = null;
  ta.addEventListener('input', function () {
    clearTimeout(espera);
    espera = setTimeout(function () { alCambiar(ta.value); }, 250);
  });
  raiz.appendChild(ta);
  raiz.appendChild(el('p', 'sim-campo__ayuda', def.ayuda, { id: idAyuda }));
  return {
    nodo: raiz,
    fijar: function (v) { ta.value = v; },
    mostrar: function (si) { raiz.hidden = !si; }
  };
}

/* ── Pestañas (patrón ARIA tabs) ────────────────────────────── */
export function pestanas(items) {
  var raiz = el('div', 'sim-tabs');
  var lista = el('div', 'sim-tabs__lista', null, { role: 'tablist' });
  var botones = [];
  var paneles = [];
  items.forEach(function (it, i) {
    var idTab = nuevoId('tab');
    var idPanel = nuevoId('panel');
    var b = el('button', 'sim-tabs__tab', it.titulo, {
      type: 'button', role: 'tab', id: idTab,
      'aria-controls': idPanel,
      'aria-selected': i === 0 ? 'true' : 'false',
      tabindex: i === 0 ? '0' : '-1'
    });
    var p = el('div', 'sim-tabs__panel', null, {
      role: 'tabpanel', id: idPanel, 'aria-labelledby': idTab, tabindex: '0'
    });
    if (i !== 0) p.hidden = true;
    p.appendChild(it.panel);
    botones.push(b);
    paneles.push(p);
    lista.appendChild(b);
  });
  function activar(i, foco) {
    botones.forEach(function (b, k) {
      var on = k === i;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.setAttribute('tabindex', on ? '0' : '-1');
      paneles[k].hidden = !on;
    });
    if (foco) botones[i].focus();
  }
  botones.forEach(function (b, i) {
    b.addEventListener('click', function () { activar(i, false); });
    b.addEventListener('keydown', function (ev) {
      var n = botones.length, j = null;
      if (ev.key === 'ArrowRight') j = (i + 1) % n;
      else if (ev.key === 'ArrowLeft') j = (i - 1 + n) % n;
      else if (ev.key === 'Home') j = 0;
      else if (ev.key === 'End') j = n - 1;
      if (j != null) { ev.preventDefault(); activar(j, true); }
    });
  });
  raiz.appendChild(lista);
  paneles.forEach(function (p) { raiz.appendChild(p); });
  return { nodo: raiz, activar: activar };
}

/* ── Región viva con retardo ────────────────────────────────── */
export function anunciador(padre) {
  var n = el('p', 'sr-only', null, { role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' });
  padre.appendChild(n);
  var espera = null, ultimo = '';
  return function (texto) {
    clearTimeout(espera);
    espera = setTimeout(function () {
      if (texto === ultimo) return;
      ultimo = texto;
      n.textContent = texto;
    }, 700);
  };
}

/* ── Ficha de resultados (<dl>) ─────────────────────────────── */
/* items: [{ termino (notación), valor, nota? }] */
export function ficha(dl, items) {
  dl.replaceChildren();
  items.forEach(function (it) {
    var fila = el('div', 'sim-ficha__fila');
    fila.appendChild(elNotacion('dt', 'sim-ficha__termino', it.termino));
    var dd = el('dd', 'sim-ficha__valor');
    enHTML(dd, it.valor);
    if (it.nota) dd.appendChild(elNotacion('span', 'sim-ficha__nota', it.nota));
    fila.appendChild(dd);
    dl.appendChild(fila);
  });
}

/* ── Avisos de factibilidad ─────────────────────────────────── */
var GLIFOS = { error: '!', aviso: '!', info: 'i' };
var NIVELES = { error: 'Error', aviso: 'Advertencia', info: 'Nota' };
export function avisos(contenedor, lista) {
  contenedor.replaceChildren();
  lista.forEach(function (a) {
    var nivel = a.nivel || 'error';
    var p = el('p', 'sim-aviso sim-aviso--' + nivel);
    p.appendChild(el('span', 'sim-aviso__glifo', GLIFOS[nivel], { 'aria-hidden': 'true' }));
    var cuerpo = el('span', 'sim-aviso__texto');
    cuerpo.appendChild(el('span', 'sr-only', NIVELES[nivel] + ': '));
    enHTML(cuerpo, a.texto);
    p.appendChild(cuerpo);
    contenedor.appendChild(p);
  });
  contenedor.hidden = lista.length === 0;
}

/* ── Descarga de archivos generados ─────────────────────────── */
export function descargar(nombre, contenido, tipo) {
  var blob = new Blob([contenido], { type: tipo });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

/* CSV para Excel en configuración regional es-AR: separador «;»,
   coma decimal y BOM UTF-8 (para que los acentos se lean bien). */
export function csv(filas) {
  return '﻿' + filas.map(function (f) {
    return f.map(function (c) {
      var s = (typeof c === 'number') ? String(c).replace('.', ',') : String(c == null ? '' : c);
      return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }).join(';');
  }).join('\r\n');
}

/* Botón de herramienta (secundario compacto). */
export function boton(texto, clase, alPulsar, attrs) {
  var b = el('button', 'sim-boton' + (clase ? ' ' + clase : ''), null, Object.assign({ type: 'button' }, attrs || {}));
  enHTML(b, texto);
  b.addEventListener('click', alPulsar);
  return b;
}
