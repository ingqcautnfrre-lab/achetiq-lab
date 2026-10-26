/* ============================================================
   AChETIQ — Seguimiento de Carrera (seguimiento.js)
   ------------------------------------------------------------
   Herramienta interactiva de seguimiento académico (P4.4/P4.5).
   Fuente de verdad funcional: content/spec_seguimiento.md.

   RESPONSABILIDADES
     - Precargar el plan académico desde data/plan_academico.json
       (catálogo de 54 materias: niveles, cargas horarias y
       correlatividades). Es dato de la herramienta, no del
       estudiante (spec §4).
     - Renderizar las tres pestañas (Seguimiento, Registro de
       Exámenes Finales, Nota al Estudiante) sin recargar la
       página ni perder estado (spec §3.1).
     - Permitir marcar estado y nota final por materia, registrar
       intentos de examen, y calcular en tiempo real los nueve
       KPIs (spec §6) y la disponibilidad por correlatividades
       (spec §7).
     - Persistir el estado del estudiante en localStorage bajo la
       clave achetiq:seguimiento:estado:v1 (spec §5.2), con
       manejo robusto de datos corruptos o ausentes.
     - Exportar/importar respaldo JSON canónico y exportar la
       planilla de seguimiento a Excel (.xlsx) poblando la plantilla
       de assets/docs (spec §11).

   PRIVACIDAD: el estado vive sólo en este navegador. Nada se
   envía a ningún servidor (spec §12).

   SEGURIDAD (FASE_1 §7.2): toda inserción de texto usa
   textContent vía createElement; nunca innerHTML con datos.

   Sin dependencias externas. ES module nativo.
   ============================================================ */

'use strict';

import { createElement } from './loaders.js';


/* ─────────────────────────────────────────────────────────────
   1. Constantes del dominio (spec §5)
   ───────────────────────────────────────────────────────────── */

const STORAGE_KEY = 'achetiq:seguimiento:estado:v1';
const SCHEMA_VERSION = 1;
const SAVE_DEBOUNCE_MS = 300;

const ESTADOS = ['No Cursada', 'Cursando', 'Regular', 'Aprobada'];
const ESTADO_DEFAULT = 'No Cursada';

/* Orden canónico de niveles para el agrupamiento de filas
   (spec §8.1: I → V → X). */
const NIVELES = ['I', 'II', 'III', 'IV', 'V', 'X'];
const NIVEL_LABEL = {
  I: 'Nivel I', II: 'Nivel II', III: 'Nivel III',
  IV: 'Nivel IV', V: 'Nivel V', X: 'Nivel X — Electivas'
};

/* Disponibilidad → presentación. Réplica de la columna
   «H DISPONIBLE» del Excel (spec §7.1). Las clases mapean a los
   tokens de color de estado en seguimiento.css. Los íconos son
   texto Unicode (sin dependencia de una librería de íconos). */
const DISP_PRESENTACION = {
  'Aprobada':      { clase: 'aprobada',      icono: '✓', texto: 'Aprobada' },
  'Regular':       { clase: 'regular',       icono: '◐', texto: 'Regular' },
  'Cursando':      { clase: 'cursando',      icono: '▸', texto: 'Cursando' },
  'Disponible':    { clase: 'disponible',    icono: '✓', texto: 'Disponible' },
  'No Disponible': { clase: 'no-disponible', icono: '✕', texto: 'No disponible' }
};

const MAX_INTENTOS = 6;
const NOTA_APROBACION = 6;


/* ─────────────────────────────────────────────────────────────
   2. Estado en memoria
   ───────────────────────────────────────────────────────────── */

let plan = null;              /* JSON del plan académico. */
let materiaByNumero = new Map();
let estado = null;            /* Estado del estudiante (spec §5.1). */

/* Referencias a nodos por materia para refrescos puntuales. */
const segRefs = new Map();    /* numero → refs de la pestaña Seguimiento */
const finRefs = new Map();    /* numero → refs de la pestaña Finales */

let saveTimer = null;
let liveRegion = null;        /* aria-live para anuncios de cambios. */
let openPopover = null;       /* popover de faltantes abierto (móvil). */


/* ─────────────────────────────────────────────────────────────
   3. Helpers de bajo nivel
   ───────────────────────────────────────────────────────────── */

function defaultRecord() {
  return { estado: ESTADO_DEFAULT, nota_final: null, intentos: [] };
}

/* Registro de una materia (o el por defecto, sin persistirlo).
   Una materia sin registro se interpreta como No Cursada sin nota
   ni intentos (spec §5.1). */
function getRecord(numero) {
  const r = estado.materias[String(numero)];
  return r || defaultRecord();
}

function getEstado(numero) {
  return getRecord(numero).estado;
}

/* Aplica una mutación al registro de una materia y agenda guardado. */
function mutate(numero, fn) {
  const key = String(numero);
  const rec = estado.materias[key] || defaultRecord();
  fn(rec);
  estado.materias[key] = rec;
  scheduleSave();
}

function isInt(n) {
  return typeof n === 'number' && Number.isInteger(n);
}

function isNotaValida(n) {
  return isInt(n) && n >= 1 && n <= 10;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isFechaValida(s) {
  if (typeof s !== 'string' || !ISO_DATE_RE.test(s)) return false;
  const d = new Date(s + 'T00:00:00Z');
  return !Number.isNaN(d.getTime());
}

function announce(msg) {
  if (liveRegion) liveRegion.textContent = msg;
}


/* ─────────────────────────────────────────────────────────────
   4. Persistencia robusta en localStorage (spec §5.2, §10.1)
   ───────────────────────────────────────────────────────────── */

/* Lee y sanea el estado guardado. Cualquier problema (ausencia,
   JSON corrupto, tipos inesperados, localStorage inaccesible en
   modo privado) se resuelve devolviendo un estado vacío válido,
   sin romper la página (spec — criterio de aceptación §13.14). */
function loadEstado() {
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    console.warn('[seguimiento] localStorage no accesible:', e);
    return freshEstado();
  }
  if (raw == null) return freshEstado();

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.warn('[seguimiento] Estado corrupto en localStorage; se ignora.', e);
    return freshEstado();
  }
  return sanitizeEstado(parsed);
}

function freshEstado() {
  return {
    schema_version: SCHEMA_VERSION,
    plan_version: plan ? plan.version : null,
    actualizado_en: null,
    materias: {}
  };
}

/* Normaliza un objeto arbitrario al esquema canónico (spec §5.1),
   descartando todo lo que no encaje sin perder lo que sí. */
function sanitizeEstado(obj) {
  const out = freshEstado();
  if (!obj || typeof obj !== 'object') return out;

  if (isInt(obj.schema_version)) out.schema_version = obj.schema_version;
  if (typeof obj.plan_version === 'string') out.plan_version = obj.plan_version;

  const src = (obj.materias && typeof obj.materias === 'object') ? obj.materias : {};
  for (const key of Object.keys(src)) {
    const rec = sanitizeRecord(src[key]);
    if (rec) out.materias[key] = rec;
  }
  return out;
}

function sanitizeRecord(r) {
  if (!r || typeof r !== 'object') return null;
  const rec = defaultRecord();

  rec.estado = ESTADOS.indexOf(r.estado) >= 0 ? r.estado : ESTADO_DEFAULT;
  rec.nota_final = isNotaValida(r.nota_final) ? r.nota_final : null;

  if (Array.isArray(r.intentos)) {
    for (const it of r.intentos) {
      if (rec.intentos.length >= MAX_INTENTOS) break;
      if (it && typeof it === 'object' &&
          isFechaValida(it.fecha) && isNotaValida(it.nota)) {
        rec.intentos.push({ fecha: it.fecha, nota: it.nota });
      }
    }
  }
  return rec;
}

/* Serializa el estado vigente al esquema canónico. Poda los
   registros de materias del plan que están en su valor por
   defecto, para no inflar localStorage (spec §5.1). Conserva
   registros de materias ausentes del plan actual (spec §10.2.4). */
function serializeEstado() {
  const materias = {};
  for (const key of Object.keys(estado.materias)) {
    const rec = estado.materias[key];
    const enPlan = materiaByNumero.has(Number(key));
    if (enPlan && isDefaultRecord(rec)) continue;
    materias[key] = {
      estado: rec.estado,
      nota_final: rec.nota_final,
      intentos: rec.intentos.map((it) => ({ fecha: it.fecha, nota: it.nota }))
    };
  }
  return {
    schema_version: SCHEMA_VERSION,
    plan_version: plan ? plan.version : estado.plan_version,
    actualizado_en: new Date().toISOString(),
    materias
  };
}

function isDefaultRecord(rec) {
  return rec.estado === ESTADO_DEFAULT &&
         rec.nota_final == null &&
         (!rec.intentos || rec.intentos.length === 0);
}

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(persist, SAVE_DEBOUNCE_MS);
}

function persist() {
  saveTimer = null;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeEstado()));
  } catch (e) {
    console.warn('[seguimiento] No se pudo guardar en localStorage:', e);
    announce('No se pudo guardar el progreso en este navegador. ' +
             'Revisá si el almacenamiento está habilitado.');
  }
}


/* ─────────────────────────────────────────────────────────────
   5. Disponibilidad por correlatividades (spec §7)
   ───────────────────────────────────────────────────────────── */

function disponibilidad(numero) {
  const m = materiaByNumero.get(Number(numero));
  if (!m) return 'No Disponible';
  const st = getEstado(numero);
  if (st === 'Aprobada') return 'Aprobada';
  if (st === 'Regular') return 'Regular';
  if (st === 'Cursando') return 'Cursando';

  /* st === 'No Cursada' */
  for (const c of m.cursadas_requeridas) {
    const ec = getEstado(c);
    if (ec !== 'Regular' && ec !== 'Aprobada') return 'No Disponible';
  }
  for (const a of m.aprobadas_requeridas) {
    if (getEstado(a) !== 'Aprobada') return 'No Disponible';
  }
  return 'Disponible';
}

/* Texto de «Materias faltantes» (spec §7.2). Orden ascendente por
   numero; delimitador "; "; termina en ";". */
function faltantesTexto(numero) {
  const disp = disponibilidad(numero);
  if (disp === 'Aprobada' || disp === 'Regular' || disp === 'Cursando') return '—';
  if (disp === 'Disponible') return 'Sin faltantes';

  const m = materiaByNumero.get(Number(numero));
  const faltan = [];
  for (const c of m.cursadas_requeridas) {
    const ec = getEstado(c);
    if (ec !== 'Regular' && ec !== 'Aprobada') faltan.push({ n: c, accion: 'regular' });
  }
  for (const a of m.aprobadas_requeridas) {
    if (getEstado(a) !== 'Aprobada') faltan.push({ n: a, accion: 'aprobada' });
  }
  faltan.sort((x, y) => x.n - y.n);

  let out = '';
  for (const f of faltan) {
    const mat = materiaByNumero.get(Number(f.n));
    const nombre = mat ? mat.nombre : '';
    out += f.n + '-' + nombre + ' (' + f.accion + '); ';
  }
  return out.trim();
}


/* ─────────────────────────────────────────────────────────────
   6. Nota efectiva y KPIs (spec §6)
   ───────────────────────────────────────────────────────────── */

/* Último intento aprobatorio (nota ≥ 6) de un arreglo de intentos,
   en orden cronológico por fecha; null si ninguno alcanza la
   aprobación. Base de la nota efectiva con intentos (spec §6.6) y de
   la auto-población de la nota en Seguimiento (regla #4). */
function ultimaAprobatoria(intentos) {
  let res = null;
  intentos.slice()
    .sort((a, b) => (a.fecha < b.fecha ? -1 : (a.fecha > b.fecha ? 1 : 0)))
    .forEach((it) => { if (it.nota >= NOTA_APROBACION) res = it.nota; });
  return res;
}

/* Nota final efectiva por materia (spec §6.6). */
function notaEfectiva(numero) {
  const rec = getRecord(numero);
  if (rec.intentos.length > 0) {
    return ultimaAprobatoria(rec.intentos); /* null si ninguno alcanza 6 */
  }
  if (rec.estado === 'Aprobada' && isNotaValida(rec.nota_final) &&
      rec.nota_final >= NOTA_APROBACION) {
    return rec.nota_final;
  }
  return null;
}

function materiasDelTipo(tipo) {
  return plan.materias.filter((m) => m.tipo === tipo);
}

function computeKPIs() {
  const obl = materiasDelTipo('obligatoria');
  const ele = materiasDelTipo('electiva');
  const todas = plan.materias;

  /* 6.1 Aprobadas (obl + elect) */
  const aprobadas = todas.filter((m) => getEstado(m.numero) === 'Aprobada').length;

  /* 6.2 Avance (% sobre obligatorias) */
  const oblAprob = obl.filter((m) => getEstado(m.numero) === 'Aprobada').length;
  const totalObl = plan.total_obligatorias || obl.length;
  const avance = totalObl > 0 ? oblAprob / totalObl : 0;

  /* 6.3 No Cursadas / Cursando (sólo obligatorias) */
  const noCursCurs = obl.filter((m) => {
    const e = getEstado(m.numero);
    return e === 'No Cursada' || e === 'Cursando';
  }).length;

  /* 6.4 Disponibles (sólo obligatorias) */
  const disponibles = obl.filter((m) =>
    disponibilidad(m.numero) === 'Disponible').length;

  /* 6.5 Regulares (obl + elect) */
  const regulares = todas.filter((m) => getEstado(m.numero) === 'Regular').length;

  /* 6.6 Promedio sin aplazos: notas efectivas ≥ 6 */
  const efectivas = [];
  for (const m of todas) {
    const ne = notaEfectiva(m.numero);
    if (ne != null && ne >= NOTA_APROBACION) efectivas.push(ne);
  }
  const promSin = efectivas.length
    ? efectivas.reduce((a, b) => a + b, 0) / efectivas.length : null;

  /* 6.7 Promedio con aplazos: todas las notas de los intentos de
     examen final MÁS las notas finales cargadas directamente en la
     pestaña Seguimiento para materias sin intentos (promoción directa
     que no pasa por el registro de finales). Cada intento se cuenta
     individualmente (los aplazos pesan); para las materias sin
     intentos, la nota final de Seguimiento aporta un único valor. Así
     no se penaliza a quien sólo carga la nota de promoción. */
  const valoresConAplazos = [];
  for (const m of todas) {
    const rec = getRecord(m.numero);
    if (rec.intentos.length > 0) {
      for (const it of rec.intentos) valoresConAplazos.push(it.nota);
    } else if (isNotaValida(rec.nota_final)) {
      valoresConAplazos.push(rec.nota_final);
    }
  }
  const promCon = valoresConAplazos.length
    ? valoresConAplazos.reduce((a, b) => a + b, 0) / valoresConAplazos.length : null;

  /* 6.8 bis Horas de obligatorias aprobadas (sin electivas) */
  const hsObl = obl
    .filter((m) => getEstado(m.numero) === 'Aprobada')
    .reduce((acc, m) => acc + (m.carga_horaria || 0), 0);

  /* 6.8 Horas electivas aprobadas */
  const hsElect = ele
    .filter((m) => getEstado(m.numero) === 'Aprobada')
    .reduce((acc, m) => acc + (m.carga_horaria || 0), 0);

  /* 6.9 % electivas completadas */
  const hReq = plan.horas_electivas_requeridas || 24;
  const porcElect = hReq > 0 ? hsElect / hReq : 0;

  return {
    aprobadas, avance, noCursCurs, disponibles, regulares,
    promSin, promCon, hsObl, hsElect, porcElect
  };
}


/* ─── Formato de presentación de KPIs (spec §6.10) ───────────── */

function fmtPct(frac) {
  return (frac * 100).toFixed(1).replace('.', ',') + ' %';
}

function fmtProm(value) {
  if (value == null) return '—';
  return value.toFixed(2).replace('.', ',');
}


/* ─────────────────────────────────────────────────────────────
   7. Construcción de la interfaz
   ───────────────────────────────────────────────────────────── */

/* ─── 7.1 Dashboard de KPIs (spec §6, §8.1) ──────────────────── */

const KPI_DEFS = [
  { id: 'aprobadas',   label: 'Aprobadas',              hint: 'obligatorias + electivas', unit: null },
  { id: 'avance',      label: 'Avance',                 hint: 'sobre 41 obligatorias',    unit: null },
  { id: 'noCursCurs',  label: 'No cursadas / cursando', hint: 'sólo obligatorias',        unit: null },
  { id: 'disponibles', label: 'Disponibles',            hint: 'sólo obligatorias',        unit: null },
  { id: 'regulares',   label: 'Regulares',              hint: 'obligatorias + electivas', unit: null },
  { id: 'promSin',     label: 'Prom. sin aplazos',      hint: 'notas finales ≥ 6',        unit: null },
  { id: 'promCon',     label: 'Prom. con aplazos',      hint: 'intentos y promoción directa', unit: null },
  { id: 'hsObl',       label: 'Hs. obligatorias aprob.', hint: 'sin electivas',          unit: 'hs' },
  { id: 'hsElect',     label: 'Hs. electivas aprob.',   hint: 'sólo electivas',           unit: 'hs' },
  { id: 'porcElect',   label: '% electivas completadas', hint: 'sobre 24 hs requeridas',  unit: null }
];

const kpiValueNodes = new Map();

function buildDashboard(mount) {
  mount.replaceChildren();
  const grid = createElement('div', { class: 'seg-dashboard__grid' });

  KPI_DEFS.forEach((def) => {
    const card = createElement('div', { class: 'seg-kpi' });
    card.appendChild(createElement('p', {
      class: 'seg-kpi__label', text: def.label
    }));

    const valWrap = createElement('p', { class: 'seg-kpi__value-wrap' });
    const valNode = createElement('span', {
      class: 'seg-kpi__value', text: '—'
    });
    valWrap.appendChild(valNode);
    if (def.unit) {
      valWrap.appendChild(createElement('span', {
        class: 'seg-kpi__unit', text: ' ' + def.unit
      }));
    }
    card.appendChild(valWrap);

    card.appendChild(createElement('p', {
      class: 'seg-kpi__hint caption', text: def.hint
    }));

    grid.appendChild(card);
    kpiValueNodes.set(def.id, valNode);
  });

  mount.appendChild(grid);
}

function refreshDashboard() {
  const k = computeKPIs();
  setKpi('aprobadas', String(k.aprobadas));
  setKpi('avance', fmtPct(k.avance));
  setKpi('noCursCurs', String(k.noCursCurs));
  setKpi('disponibles', String(k.disponibles));
  setKpi('regulares', String(k.regulares));
  setKpi('promSin', fmtProm(k.promSin));
  setKpi('promCon', fmtProm(k.promCon));
  setKpi('hsObl', String(k.hsObl));
  setKpi('hsElect', String(k.hsElect));
  setKpi('porcElect', fmtPct(k.porcElect));
}

function setKpi(id, text) {
  const node = kpiValueNodes.get(id);
  if (node) node.textContent = text;
}


/* ─── 7.2 Tabla maestra de Seguimiento (spec §8.1) ───────────── */

const SEG_COLS = [
  'N°', 'Nivel', 'Asignatura', 'Cursadas req.', 'Aprobadas req.',
  'Estado', 'Nota final', 'Disponible', 'Materias faltantes', 'Hs.'
];

function buildSeguimientoTable(mount) {
  mount.replaceChildren();
  segRefs.clear();

  const scroll = createElement('div', { class: 'seg-table-scroll' });
  const table = createElement('table', {
    class: 'seg-table seg-table--seguimiento',
    attrs: { 'aria-label': 'Estado de las 54 materias del Plan 2023' }
  });

  const thead = createElement('thead');
  const htr = createElement('tr');
  SEG_COLS.forEach((c, i) => {
    htr.appendChild(createElement('th', {
      text: c,
      attrs: { scope: 'col', 'data-col': segColKey(i) }
    }));
  });
  thead.appendChild(htr);
  table.appendChild(thead);

  NIVELES.forEach((nivel) => {
    const delNivel = plan.materias.filter((m) => m.nivel === nivel);
    if (!delNivel.length) return;
    const tbody = createElement('tbody', {
      class: 'seg-table__group', attrs: { 'data-nivel': nivel }
    });

    /* Fila de encabezado de nivel (borde de acento, spec §8.1). */
    const gtr = createElement('tr', { class: 'seg-table__group-row' });
    gtr.appendChild(createElement('th', {
      class: 'seg-table__group-th',
      text: NIVEL_LABEL[nivel],
      attrs: { scope: 'colgroup', colspan: String(SEG_COLS.length) }
    }));
    tbody.appendChild(gtr);

    delNivel.forEach((m) => tbody.appendChild(buildSegRow(m)));
    table.appendChild(tbody);
  });

  scroll.appendChild(table);
  mount.appendChild(scroll);
}

function segColKey(i) {
  return ['num', 'nivel', 'nombre', 'curs', 'aprob',
          'estado', 'nota', 'disp', 'falt', 'hs'][i];
}

function buildSegRow(m) {
  const tr = createElement('tr', {
    class: 'seg-table__row', attrs: { 'data-numero': String(m.numero) }
  });

  tr.appendChild(cellTh(String(m.numero), 'num'));
  tr.appendChild(cellTd(m.nivel, 'nivel'));
  tr.appendChild(cellTd(m.nombre, 'nombre', 'seg-table__nombre'));
  tr.appendChild(cellTd(reqText(m.cursadas_requeridas), 'curs'));
  tr.appendChild(cellTd(reqText(m.aprobadas_requeridas), 'aprob'));

  /* Estado: dropdown (spec §8.1). */
  const tdEstado = createElement('td', { attrs: { 'data-col': 'estado' } });
  const selId = 'seg-estado-' + m.numero;
  const select = createElement('select', {
    class: 'form__input seg-table__select',
    attrs: {
      id: selId,
      'aria-label': 'Estado de ' + m.numero + '-' + m.nombre
    }
  });
  ESTADOS.forEach((opt) => {
    select.appendChild(createElement('option', {
      text: opt, attrs: { value: opt }
    }));
  });
  select.value = getEstado(m.numero);
  select.addEventListener('change', () => onEstadoChange(m.numero, select.value));
  tdEstado.appendChild(select);
  tr.appendChild(tdEstado);

  /* Nota final manual + advertencia (spec §8.1). */
  const tdNota = createElement('td', { attrs: { 'data-col': 'nota' } });
  const notaWrap = createElement('div', { class: 'seg-table__nota' });
  const notaId = 'seg-nota-' + m.numero;
  const notaInput = createElement('input', {
    class: 'form__input seg-table__nota-input',
    attrs: {
      id: notaId, type: 'number', min: '1', max: '10', step: '1',
      inputmode: 'numeric', 'aria-label': 'Nota final de ' + m.numero + '-' + m.nombre
    }
  });
  const rec = getRecord(m.numero);
  if (isNotaValida(rec.nota_final)) notaInput.value = String(rec.nota_final);
  notaInput.addEventListener('change', () => onNotaChange(m.numero, notaInput));
  notaWrap.appendChild(notaInput);

  const warn = buildWarnIcon();
  notaWrap.appendChild(warn);
  tdNota.appendChild(notaWrap);
  tr.appendChild(tdNota);

  /* Disponible: badge (botón con popover) (spec §7, §9). */
  const tdDisp = createElement('td', { attrs: { 'data-col': 'disp' } });
  const badge = createElement('button', {
    class: 'seg-badge',
    attrs: {
      type: 'button', 'aria-expanded': 'false',
      'aria-haspopup': 'true'
    }
  });
  const badgeIcon = createElement('span', {
    class: 'seg-badge__icon', attrs: { 'aria-hidden': 'true' }
  });
  const badgeText = createElement('span', { class: 'seg-badge__text' });
  badge.appendChild(badgeIcon);
  badge.appendChild(badgeText);

  const popover = createElement('div', {
    class: 'seg-popover',
    attrs: { role: 'region', hidden: '', 'aria-label': 'Correlatividades de ' + m.nombre }
  });
  badge.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePopover(m.numero);
  });
  tdDisp.appendChild(badge);
  tdDisp.appendChild(popover);
  tr.appendChild(tdDisp);

  /* Materias faltantes (texto). */
  const tdFalt = cellTd('—', 'falt', 'seg-table__faltantes');
  tr.appendChild(tdFalt);

  /* Carga horaria. */
  tr.appendChild(cellTd(String(m.carga_horaria), 'hs'));

  segRefs.set(m.numero, {
    select, notaInput, warn, badge, badgeIcon, badgeText, popover,
    faltCell: tdFalt
  });

  return tr;
}

function cellTd(text, col, extraClass) {
  return createElement('td', {
    class: extraClass || null,
    text: text,
    attrs: { 'data-col': col }
  });
}

function cellTh(text, col) {
  return createElement('th', {
    text: text, attrs: { scope: 'row', 'data-col': col }
  });
}

function reqText(arr) {
  return (arr && arr.length) ? arr.join(', ') : '—';
}

/* Ícono de advertencia (alert-triangle, ámbar) para discrepancia
   entre nota manual e intentos (spec §8.1). SVG inline accesible. */
function buildWarnIcon() {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'seg-table__warn');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('hidden', '');
  const tip = 'El valor manual no coincide con la última nota ' +
              'aprobatoria registrada en los intentos.';
  const title = document.createElementNS(NS, 'title');
  title.textContent = tip;
  svg.appendChild(title);
  const p1 = document.createElementNS(NS, 'path');
  p1.setAttribute('d',
    'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z');
  const l1 = document.createElementNS(NS, 'line');
  l1.setAttribute('x1', '12'); l1.setAttribute('y1', '9');
  l1.setAttribute('x2', '12'); l1.setAttribute('y2', '13');
  const l2 = document.createElementNS(NS, 'line');
  l2.setAttribute('x1', '12'); l2.setAttribute('y1', '17');
  l2.setAttribute('x2', '12.01'); l2.setAttribute('y2', '17');
  svg.appendChild(p1); svg.appendChild(l1); svg.appendChild(l2);
  return svg;
}


/* ─── 7.3 Tabla de Registro de Exámenes Finales (spec §8.2) ──── */

const FIN_HEAD = ['N°', 'Nivel', 'Asignatura', 'Estado', 'Nota final'];

function buildFinalesTable(mount) {
  mount.replaceChildren();
  finRefs.clear();

  const scroll = createElement('div', { class: 'seg-table-scroll' });
  const table = createElement('table', {
    class: 'seg-table seg-table--finales',
    attrs: { 'aria-label': 'Registro de exámenes finales por materia' }
  });

  const thead = createElement('thead');
  const htr = createElement('tr');
  FIN_HEAD.forEach((c) => {
    htr.appendChild(createElement('th', { text: c, attrs: { scope: 'col' } }));
  });
  for (let i = 1; i <= MAX_INTENTOS; i++) {
    htr.appendChild(createElement('th', {
      text: 'Fecha ' + i + '°', attrs: { scope: 'col' }
    }));
    htr.appendChild(createElement('th', {
      text: i + '° Nota', attrs: { scope: 'col' }
    }));
  }
  thead.appendChild(htr);
  table.appendChild(thead);

  const tbody = createElement('tbody');
  plan.materias.forEach((m) => tbody.appendChild(buildFinRow(m)));
  table.appendChild(tbody);

  scroll.appendChild(table);
  mount.appendChild(scroll);
}

function buildFinRow(m) {
  const tr = createElement('tr', { attrs: { 'data-numero': String(m.numero) } });
  tr.appendChild(cellTh(String(m.numero), 'num'));
  tr.appendChild(cellTd(m.nivel, 'nivel'));
  tr.appendChild(cellTd(m.nombre, 'nombre', 'seg-table__nombre'));

  const estadoCell = cellTd(getEstado(m.numero), 'estado');
  tr.appendChild(estadoCell);
  const notaCalcCell = cellTd('—', 'nota');
  tr.appendChild(notaCalcCell);

  const rec = getRecord(m.numero);
  const slots = [];
  for (let i = 0; i < MAX_INTENTOS; i++) {
    const it = rec.intentos[i];

    const tdFecha = createElement('td', { attrs: { 'data-col': 'fecha' } });
    const fechaInput = createElement('input', {
      class: 'form__input seg-fin__fecha',
      attrs: {
        type: 'date',
        'aria-label': 'Fecha del intento ' + (i + 1) + ' de ' + m.numero + '-' + m.nombre
      }
    });
    if (it && it.fecha) fechaInput.value = it.fecha;
    tdFecha.appendChild(fechaInput);

    const tdNota = createElement('td', { attrs: { 'data-col': 'nota' } });
    const notaInput = createElement('input', {
      class: 'form__input seg-fin__nota',
      attrs: {
        type: 'number', min: '1', max: '10', step: '1', inputmode: 'numeric',
        'aria-label': 'Nota del intento ' + (i + 1) + ' de ' + m.numero + '-' + m.nombre
      }
    });
    if (it && isNotaValida(it.nota)) notaInput.value = String(it.nota);
    tdNota.appendChild(notaInput);

    fechaInput.addEventListener('change', () => onIntentoChange(m.numero));
    notaInput.addEventListener('change', () => onIntentoChange(m.numero));

    tr.appendChild(tdFecha);
    tr.appendChild(tdNota);
    slots.push({ fechaInput, notaInput });
  }

  finRefs.set(m.numero, { estadoCell, notaCalcCell, slots });
  return tr;
}


/* ─────────────────────────────────────────────────────────────
   8. Manejadores de interacción
   ───────────────────────────────────────────────────────────── */

/* Refleja estado y nota de una materia en sus controles de la
   pestaña Seguimiento (dropdown + input) tras un cambio AUTOMÁTICO
   que el usuario no realizó directamente sobre esos controles
   (reglas #3 auto-«Aprobada» y #4 auto-población de la nota). */
function syncSegControls(numero) {
  const refs = segRefs.get(Number(numero));
  if (!refs) return;
  const rec = getRecord(numero);
  refs.select.value = rec.estado;
  refs.notaInput.value = isNotaValida(rec.nota_final) ? String(rec.nota_final) : '';
  refs.notaInput.removeAttribute('aria-invalid');
}

function onEstadoChange(numero, value) {
  if (ESTADOS.indexOf(value) < 0) return;
  mutate(numero, (rec) => { rec.estado = value; });
  const m = materiaByNumero.get(Number(numero));
  announce('Estado de ' + numero + '-' + m.nombre + ' actualizado a ' + value +
           '. Disponibilidad recalculada.');
  refreshAll();
}

function onNotaChange(numero, input) {
  const raw = input.value.trim();
  if (raw === '') {
    input.removeAttribute('aria-invalid');
    mutate(numero, (rec) => { rec.nota_final = null; });
    refreshAll();
    return;
  }
  const n = Number(raw);
  if (!isNotaValida(n)) {
    input.setAttribute('aria-invalid', 'true');
    announce('Nota inválida. Ingresá un entero entre 1 y 10.');
    return;
  }
  input.removeAttribute('aria-invalid');
  /* Una nota final ≥ 6 cargada directamente en Seguimiento aprueba
     la materia automáticamente (regla #3: «Aprobada» con 6 o más). */
  const aprueba = n >= NOTA_APROBACION;
  mutate(numero, (rec) => {
    rec.nota_final = n;
    if (aprueba) rec.estado = 'Aprobada';
  });
  if (aprueba) syncSegControls(numero);
  refreshAll();
}

/* Reconstruye el arreglo de intentos de una materia desde los 6
   pares (fecha, nota) de su fila en la pestaña Finales. Los pares
   incompletos (sólo fecha o sólo nota) se rechazan con feedback
   visual (spec §8.2). */
function onIntentoChange(numero) {
  const refs = finRefs.get(numero);
  if (!refs) return;
  const intentos = [];
  for (const slot of refs.slots) {
    const f = slot.fechaInput.value.trim();
    const nRaw = slot.notaInput.value.trim();
    slot.fechaInput.removeAttribute('aria-invalid');
    slot.notaInput.removeAttribute('aria-invalid');

    if (f === '' && nRaw === '') continue;

    const n = Number(nRaw);
    const fechaOk = isFechaValida(f);
    const notaOk = nRaw !== '' && isNotaValida(n);

    if (!fechaOk || !notaOk) {
      if (!fechaOk) slot.fechaInput.setAttribute('aria-invalid', 'true');
      if (!notaOk) slot.notaInput.setAttribute('aria-invalid', 'true');
      continue;
    }
    if (intentos.length < MAX_INTENTOS) intentos.push({ fecha: f, nota: n });
  }

  /* Nota final aprobatoria definitiva (último intento ≥ 6 en orden
     cronológico), si existe. */
  const aprobatoria = ultimaAprobatoria(intentos);
  mutate(numero, (rec) => {
    rec.intentos = intentos;
    /* Al registrar un final ≥ 6 en «Exámenes finales», esa nota se
       vuelca a la celda de nota de Seguimiento (regla #4) y la
       materia pasa a «Aprobada» (regla #3). */
    if (aprobatoria != null) {
      rec.nota_final = aprobatoria;
      rec.estado = 'Aprobada';
    }
  });
  if (aprobatoria != null) syncSegControls(numero);

  const m = materiaByNumero.get(Number(numero));
  announce('Intentos de ' + numero + '-' + m.nombre + ' actualizados. ' +
           'Promedios recalculados.');
  refreshAll();
}


/* ─────────────────────────────────────────────────────────────
   9. Refresco general (disponibilidad + KPIs + advertencias)
   ───────────────────────────────────────────────────────────── */

function refreshAll() {
  /* Disponibilidad, faltantes y advertencia por fila. */
  segRefs.forEach((refs, numero) => {
    const disp = disponibilidad(numero);
    const pres = DISP_PRESENTACION[disp];
    refs.badge.className = 'seg-badge seg-badge--' + pres.clase;
    refs.badgeIcon.textContent = pres.icono;
    refs.badgeText.textContent = pres.texto;

    const falt = faltantesTexto(numero);
    refs.faltCell.textContent = falt;
    buildPopoverContent(numero, refs.popover, falt);

    /* Advertencia de discrepancia nota manual ↔ intentos (regla #2).
       Sólo aparece cuando coexisten AMBOS: una nota cargada en
       Seguimiento Y al menos un intento en «Exámenes finales», y
       además no coinciden. Nunca aparece si no hay ninguna nota
       registrada, ni cuando la nota está en Seguimiento pero falta en
       «Exámenes finales» (p. ej. materias promovidas directamente).
       Se alterna el atributo `hidden` (no la propiedad IDL) para que
       el toggle funcione también sobre el ícono SVG. */
    const rec = getRecord(numero);
    const tieneNotaManual = isNotaValida(rec.nota_final);
    const hayIntentos = rec.intentos.length > 0;
    const ne = notaEfectiva(numero);
    const discrepa = tieneNotaManual && hayIntentos &&
                     (ne == null || rec.nota_final !== ne);
    if (discrepa) refs.warn.removeAttribute('hidden');
    else refs.warn.setAttribute('hidden', '');
  });

  /* Eco de estado y nota calculada en la pestaña Finales. */
  finRefs.forEach((refs, numero) => {
    refs.estadoCell.textContent = getEstado(numero);
    const ne = notaEfectiva(numero);
    refs.notaCalcCell.textContent = (ne == null) ? '—' : String(ne);
  });

  refreshDashboard();
}


/* ─────────────────────────────────────────────────────────────
   10. Popover de correlatividades (móvil) (spec §9)
   ───────────────────────────────────────────────────────────── */

function buildPopoverContent(numero, popover, faltText) {
  const m = materiaByNumero.get(Number(numero));
  popover.replaceChildren();

  const close = createElement('button', {
    class: 'seg-popover__close',
    text: '×',
    attrs: { type: 'button', 'aria-label': 'Cerrar' }
  });
  close.addEventListener('click', (e) => { e.stopPropagation(); closePopover(); });
  popover.appendChild(close);

  popover.appendChild(createElement('p', {
    class: 'seg-popover__title', text: m.numero + ' · ' + m.nombre
  }));
  popover.appendChild(popoverLine('Faltantes', faltText));
  popover.appendChild(popoverLine('Cursadas req.', reqText(m.cursadas_requeridas)));
  popover.appendChild(popoverLine('Aprobadas req.', reqText(m.aprobadas_requeridas)));
}

function popoverLine(label, value) {
  const p = createElement('p', { class: 'seg-popover__line' });
  p.appendChild(createElement('span', { class: 'seg-popover__label', text: label + ': ' }));
  p.appendChild(createElement('span', { text: value }));
  return p;
}

function togglePopover(numero) {
  const refs = segRefs.get(numero);
  if (!refs) return;
  if (openPopover === refs) { closePopover(); return; }
  closePopover();
  refs.popover.hidden = false;
  refs.badge.setAttribute('aria-expanded', 'true');
  openPopover = refs;
}

function closePopover() {
  if (!openPopover) return;
  openPopover.popover.hidden = true;
  openPopover.badge.setAttribute('aria-expanded', 'false');
  openPopover = null;
}


/* ─────────────────────────────────────────────────────────────
   11. Pestañas (spec §3.1) — patrón WAI-ARIA tabs
   ───────────────────────────────────────────────────────────── */

function wireTabs(root) {
  const tabs = Array.prototype.slice.call(root.querySelectorAll('.seg-tabs__tab'));
  const panels = {
    seguimiento: root.querySelector('#seg-panel-seguimiento'),
    finales: root.querySelector('#seg-panel-finales'),
    nota: root.querySelector('#seg-panel-nota')
  };

  function activate(tab, focus) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.setAttribute('tabindex', on ? '0' : '-1');
      const panel = panels[t.getAttribute('data-tab')];
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
  }

  tabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => activate(tab, false));
    tab.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(idx + 1) % tabs.length];
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(idx - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); activate(next, true); }
    });
  });

  const initial = tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
  if (initial) activate(initial, false);
}


/* ─────────────────────────────────────────────────────────────
   12. Diálogos modales (spec §8.4, §11) — <dialog> nativo
   ───────────────────────────────────────────────────────────── */

function makeDialog() {
  const d = createElement('dialog', { class: 'seg-dialog' });
  d.addEventListener('click', (e) => {
    /* Cierre al hacer clic en el backdrop (fuera del panel). */
    if (e.target === d) d.close();
  });
  document.body.appendChild(d);
  return d;
}

function dialogShell(titulo) {
  const wrap = createElement('div', { class: 'seg-dialog__panel' });
  wrap.appendChild(createElement('h2', { class: 'seg-dialog__title', text: titulo }));
  return wrap;
}

function dialogActions() {
  return createElement('div', { class: 'seg-dialog__actions' });
}

/* Exportar respaldo: selector de formato JSON / Excel (spec §8.4). */
function openExportDialog() {
  const d = makeDialog();
  const panel = dialogShell('Exportar respaldo');
  panel.appendChild(createElement('p', {
    class: 'seg-dialog__desc',
    text: 'Elegí el formato. El JSON es reimportable; el Excel (.xlsx) ' +
          'es la planilla de seguimiento con tus datos, para consulta ' +
          '(Excel, LibreOffice, Sheets).'
  }));
  const actions = dialogActions();
  const btnJson = createElement('button', {
    class: 'btn btn-primary', text: 'Descargar JSON', attrs: { type: 'button' }
  });
  const btnExcel = createElement('button', {
    class: 'btn btn-secondary', text: 'Exportar Excel (.xlsx)', attrs: { type: 'button' }
  });
  const btnCancel = createElement('button', {
    class: 'btn seg-btn-ghost', text: 'Cancelar', attrs: { type: 'button' }
  });
  btnJson.addEventListener('click', () => { exportJSON(); d.close(); });
  btnExcel.addEventListener('click', () => { exportXLSX(); d.close(); });
  btnCancel.addEventListener('click', () => d.close());
  actions.appendChild(btnJson);
  actions.appendChild(btnExcel);
  actions.appendChild(btnCancel);
  panel.appendChild(actions);
  d.appendChild(panel);

  d.addEventListener('close', () => d.remove());
  d.showModal();
}

/* Confirmación de importación (spec §11.2). */
function openImportConfirm(nuevoEstado) {
  const d = makeDialog();
  const panel = dialogShell('Importar respaldo');
  panel.appendChild(createElement('p', {
    class: 'seg-dialog__desc',
    text: '¿Reemplazar el progreso actual con el del archivo? ' +
          'Esta acción no se puede deshacer.'
  }));
  const actions = dialogActions();
  const ok = createElement('button', {
    class: 'btn btn-primary', text: 'Reemplazar', attrs: { type: 'button' }
  });
  const cancel = createElement('button', {
    class: 'btn seg-btn-ghost', text: 'Cancelar', attrs: { type: 'button' }
  });
  ok.addEventListener('click', () => { applyImported(nuevoEstado); d.close(); });
  cancel.addEventListener('click', () => d.close());
  actions.appendChild(ok);
  actions.appendChild(cancel);
  panel.appendChild(actions);
  d.appendChild(panel);
  d.addEventListener('close', () => d.remove());
  d.showModal();
}

/* Reiniciar progreso: doble confirmación con palabra clave
   (spec §8.4). */
function openResetDialog() {
  const d = makeDialog();
  const panel = dialogShell('Reiniciar progreso');
  panel.appendChild(createElement('p', {
    class: 'seg-dialog__desc',
    text: 'Esto borra todo tu progreso guardado en este navegador y ' +
          'no se puede deshacer. Para confirmar, escribí REINICIAR.'
  }));
  const field = createElement('div', { class: 'form__field' });
  const labelId = 'seg-reset-label';
  field.appendChild(createElement('label', {
    class: 'form__label', text: 'Escribí REINICIAR para habilitar',
    attrs: { id: labelId, for: 'seg-reset-input' }
  }));
  const input = createElement('input', {
    class: 'form__input',
    attrs: { id: 'seg-reset-input', type: 'text', autocomplete: 'off',
             'aria-labelledby': labelId }
  });
  field.appendChild(input);
  panel.appendChild(field);

  const actions = dialogActions();
  const ok = createElement('button', {
    class: 'btn btn-primary', text: 'Reiniciar',
    attrs: { type: 'button', disabled: '' }
  });
  const cancel = createElement('button', {
    class: 'btn seg-btn-ghost', text: 'Cancelar', attrs: { type: 'button' }
  });
  input.addEventListener('input', () => {
    if (input.value.trim() === 'REINICIAR') ok.removeAttribute('disabled');
    else ok.setAttribute('disabled', '');
  });
  ok.addEventListener('click', () => { resetProgreso(); d.close(); });
  cancel.addEventListener('click', () => d.close());
  actions.appendChild(ok);
  actions.appendChild(cancel);
  panel.appendChild(actions);
  d.appendChild(panel);
  d.addEventListener('close', () => d.remove());
  d.showModal();
}


/* ─────────────────────────────────────────────────────────────
   13. Exportar / Importar / Reiniciar (spec §11)
   ───────────────────────────────────────────────────────────── */

function fechaArchivo() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return '' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate());
}

function descargar(blob, nombre) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function exportJSON() {
  const data = serializeEstado();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  descargar(blob, 'achetiq-seguimiento-' + fechaArchivo() + '.json');
  announce('Respaldo JSON descargado.');
}

/* ─── Exportación a Excel (.xlsx) sobre la plantilla (spec §11.3) ──
   Reemplaza al antiguo CSV. El navegador no manipula binarios .xlsx
   de forma nativa, así que se usa xlsx-populate (window.XlsxPopulate,
   autoalojada y cargada bajo demanda; ver ensureXlsxPopulate). A
   diferencia de las librerías
   que reconstruyen el workbook (y rompían la hoja «Nota al Estudiante»
   con su formato avanzado), xlsx-populate MUTA el ZIP subyacente: todas
   las hojas, fórmulas y objetos visuales de la plantilla quedan
   perfectamente intactos. Además marca el libro para que Excel
   recalcule las fórmulas (promedios, KPIs, correlatividades) al abrir.
   Flujo:
     1) fetch() de la plantilla en blanco (assets/docs) como ArrayBuffer;
     2) carga con XlsxPopulate.fromDataAsync(buffer);
     3) volcado del estado vigente (estado y nota final) en las celdas
        específicas de la hoja «Seguimiento» (F = ESTADO, G = NOTA FINAL);
     4) outputAsync() → Blob y descarga limpia del archivo poblado.
   No es reimportable: es una foto para consulta. */

const XLSX_PLANTILLA = 'assets/docs/Seguimiento_de_Carrera.xlsx';
const XLSX_HOJA = 'Seguimiento';
const XLSX_FILA_INICIAL = 12; /* La primera materia ocupa la fila 12. */

/* Mapa determinista N° → fila, derivado de la estructura ESTÁTICA de
   la plantilla (sin buscar filas en tiempo de ejecución). La planilla
   NO ordena las filas por N°: intercala N° 40 (fila 27) y N° 41 (fila
   37) fuera de secuencia, por lo que `numero + 11` sería incorrecto
   para 26 de las 54 materias. Este arreglo lista los N° en el orden en
   que aparecen las filas a partir de XLSX_FILA_INICIAL. */
const SEG_ORDEN_FILAS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
  14, 15, 40, 16, 17, 18, 19, 20, 21, 22, 23, 24, 41,
  25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37,
  38, 39, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52,
  53, 54
];

const filaDeMateria = new Map(
  SEG_ORDEN_FILAS.map((numero, i) => [numero, XLSX_FILA_INICIAL + i])
);

/* Hoja secundaria de historial de exámenes finales. Cada materia ocupa
   la MISMA posición relativa que en «Seguimiento», desplazada 7 filas
   (la materia de la fila 12 en «Seguimiento» está en la fila 5 de
   «Finales»). Las columnas alternan fecha y nota para los 6 intentos:
   F/G = 1°, H/I = 2°, J/K = 3°, L/M = 4°, N/O = 5°, P/Q = 6°. */
const XLSX_FINALES_HOJA = 'Finales';
const XLSX_FINALES_OFFSET = 7;
const XLSX_FINALES_COL_FECHA = ['F', 'H', 'J', 'L', 'N', 'P'];
const XLSX_FINALES_COL_NOTA = ['G', 'I', 'K', 'M', 'O', 'Q'];

function plantillaURL() {
  const base = window.AChETIQBase;
  if (base && typeof base.resolve === 'function') {
    return base.resolve(XLSX_PLANTILLA);
  }
  return '../../' + XLSX_PLANTILLA;
}

/* ─── Carga perezosa de xlsx-populate (S03 — rendimiento) ──────────
   xlsx-populate pesa ≈193 KB gzip (642 KB planos). Sólo se necesita
   al EXPORTAR a Excel —una acción opcional y poco frecuente—, así que
   en lugar de descargarla y parsearla en cada visita de la página
   (antes: <script defer> en seguimiento.html, ~193 KB y ~642 KB de
   parse para todo visitante) se inyecta su <script> bajo demanda, la
   primera vez que el usuario exporta. Es un global UMD
   (window.XlsxPopulate), no un módulo ES, por lo que se carga con una
   etiqueta <script> y no con import() dinámico. La promesa se cachea:
   una sola descarga aunque se exporte varias veces. CSP: script-src
   'self' admite el mismo origen; sin SRI (autoalojada, idéntico al
   estado previo). */
const XLSX_VENDOR = 'assets/js/vendor/xlsx-populate.min.js';

function vendorURL() {
  const base = window.AChETIQBase;
  if (base && typeof base.resolve === 'function') {
    return base.resolve(XLSX_VENDOR);
  }
  return '../../' + XLSX_VENDOR;
}

let xlsxPromise = null;
function ensureXlsxPopulate() {
  if (window.XlsxPopulate) return Promise.resolve(window.XlsxPopulate);
  if (xlsxPromise) return xlsxPromise;
  xlsxPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = vendorURL();
    s.async = true;
    s.onload = () => {
      if (window.XlsxPopulate) resolve(window.XlsxPopulate);
      else reject(new Error('xlsx-populate cargó pero no expuso XlsxPopulate'));
    };
    s.onerror = () => {
      xlsxPromise = null; /* permite reintentar en una exportación posterior */
      reject(new Error('No se pudo cargar xlsx-populate'));
    };
    document.head.appendChild(s);
  });
  return xlsxPromise;
}

/* Vuelca el estado vigente en la plantilla: hoja «Seguimiento»
   (estado + nota final) y hoja «Finales» (historial de intentos). */
function poblarPlantilla(workbook) {
  poblarSeguimiento(workbook);
  poblarFinales(workbook);
}

/* Hoja «Seguimiento»: estado (F) y nota final (G) por materia, usando
   el mapa determinista de filas (sin localizador dinámico). */
function poblarSeguimiento(workbook) {
  const sheet = workbook.sheet(XLSX_HOJA) || workbook.sheet(0);
  if (!sheet) {
    throw new Error('La plantilla no contiene la hoja «' + XLSX_HOJA + '».');
  }

  plan.materias.forEach((m) => {
    const rowIndex = filaDeMateria.get(m.numero);
    if (rowIndex == null) return;
    const rec = getRecord(m.numero);

    /* Estado (F): cadena exacta que esperan el desplegable y las
       fórmulas de la plantilla («No Cursada», «Cursando», «Regular»,
       «Aprobada»). */
    sheet.cell('F' + rowIndex).value(String(rec.estado));

    /* Nota final (G): NÚMERO estricto para que las fórmulas de promedio
       la computen (una cadena la ignoraría Excel); si no hay nota, se
       deja la celda vacía (undefined). */
    sheet.cell('G' + rowIndex).value(
      isNotaValida(rec.nota_final) ? Number(rec.nota_final) : undefined
    );
  });
}

/* Hoja «Finales»: historial de exámenes (fecha + nota de cada intento).
   El KPI «Promedio con aplazos» depende de que las notas de los intentos
   estén aquí como NÚMEROS. La fila de cada materia se deriva de la de
   «Seguimiento» menos el desplazamiento fijo. Si la plantilla no trae la
   hoja, se omite sin interrumpir el resto de la exportación. */
function poblarFinales(workbook) {
  const sheet = workbook.sheet(XLSX_FINALES_HOJA);
  if (!sheet) return;

  plan.materias.forEach((m) => {
    const segRow = filaDeMateria.get(m.numero);
    if (segRow == null) return;
    const finRow = segRow - XLSX_FINALES_OFFSET;
    const rec = getRecord(m.numero);

    rec.intentos.forEach((it, i) => {
      if (i >= MAX_INTENTOS) return;
      /* Fecha (ISO) como texto: no afecta a ningún KPI y evita los
         corrimientos de zona horaria de convertir a fecha de Excel.
         Si falta, se pasa `undefined` (nunca null ni ""): una cadena
         vacía rompería las fórmulas nativas de Excel. */
      sheet.cell(XLSX_FINALES_COL_FECHA[i] + finRow).value(
        isFechaValida(it.fecha) ? it.fecha : undefined
      );
      /* Nota del intento: NÚMERO estricto (los aplazos cuentan); si
         falta, `undefined` estricto para no corromper AVERAGE/SUM. */
      sheet.cell(XLSX_FINALES_COL_NOTA[i] + finRow).value(
        isNotaValida(it.nota) ? Number(it.nota) : undefined
      );
    });
  });
}

/* Fuerza a Excel a recalcular TODAS las fórmulas al abrir (KPIs de
   promedios, electivas, correlatividades), descartando los valores
   cacheados de la plantilla.

   xlsx-populate NO expone una API pública para esto: no existen
   `workbook.calcProperties(...)` ni `workbook.setting(...)` (ambas
   lanzan TypeError, verificado contra la fuente de la librería). El
   mecanismo soportado es marcar el atributo `fullCalcOnLoad` en el
   nodo <calcPr> del workbook.xml ya parseado, accesible por su modelo
   interno `_node`. Verificado de extremo a extremo: la salida contiene
   <calcPr ... fullCalcOnLoad="1"/> y, como xlsx-populate ya elimina
   calcChain.xml al cargar, Excel rehace el cálculo completo al abrir. */
function forzarRecalculoAlAbrir(workbook) {
  const wbNode = workbook && workbook._node;
  if (!wbNode || !Array.isArray(wbNode.children)) return;
  let calcPr = wbNode.children.find((c) => c && c.name === 'calcPr');
  if (!calcPr) {
    calcPr = { name: 'calcPr', attributes: {}, children: [] };
    wbNode.children.push(calcPr);
  }
  calcPr.attributes = calcPr.attributes || {};
  calcPr.attributes.fullCalcOnLoad = 1;
}

async function exportXLSX() {
  /* La librería se carga bajo demanda (ver ensureXlsxPopulate): la
     primera exportación dispara su descarga. Avisamos por el live
     region porque ahora puede haber una breve espera de red. */
  announce('Generando el archivo Excel…');

  let XlsxPopulate;
  try {
    XlsxPopulate = await ensureXlsxPopulate();
  } catch (e) {
    console.error('[seguimiento] No se pudo cargar xlsx-populate:', e);
    announce('No se pudo cargar la librería para generar el Excel.');
    window.alert('No se pudo cargar la librería para generar el archivo Excel. ' +
                 'Verificá tu conexión a internet e intentá de nuevo.');
    return;
  }

  let buffer;
  try {
    const res = await fetch(plantillaURL(), { credentials: 'same-origin' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    buffer = await res.arrayBuffer();
  } catch (e) {
    console.error('[seguimiento] No se pudo obtener la plantilla .xlsx:', e);
    announce('No se pudo obtener la plantilla de Excel.');
    window.alert('No se pudo obtener la plantilla de Excel. Probá de nuevo.');
    return;
  }

  let blob;
  try {
    /* xlsx-populate muta el ZIP cargado en su lugar: no reconstruye el
       workbook, así que todas las hojas y objetos visuales se conservan. */
    const workbook = await XlsxPopulate.fromDataAsync(buffer);
    poblarPlantilla(workbook);
    forzarRecalculoAlAbrir(workbook);
    blob = await workbook.outputAsync();
  } catch (e) {
    console.error('[seguimiento] No se pudo generar el Excel:', e);
    announce('No se pudo generar el archivo Excel.');
    window.alert('Ocurrió un error al generar el archivo Excel.');
    return;
  }

  descargar(blob, 'mi-seguimiento-achetiq.xlsx');
  announce('Planilla de seguimiento exportada a Excel.');
}

/* Importar JSON (spec §11.2): parse + validación de campos,
   tipos y versión; confirma antes de sobrescribir. */
function onFileChosen(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    let parsed;
    try {
      parsed = JSON.parse(String(reader.result));
    } catch (e) {
      announce('El archivo no es un JSON válido.');
      window.alert('No se pudo leer el archivo: no es un JSON válido.');
      return;
    }
    if (!parsed || typeof parsed !== 'object' ||
        !isInt(parsed.schema_version) ||
        !parsed.materias || typeof parsed.materias !== 'object') {
      announce('El archivo no tiene el formato de respaldo esperado.');
      window.alert('El archivo no tiene los campos obligatorios ' +
                   '(schema_version, materias).');
      return;
    }
    if (parsed.schema_version > SCHEMA_VERSION) {
      const seguir = window.confirm(
        'El archivo proviene de una versión más nueva de la herramienta. ' +
        'Algunos datos podrían no reconocerse. ¿Importar de todos modos?');
      if (!seguir) return;
    }
    const limpio = sanitizeEstado(parsed);
    openImportConfirm(limpio);
  };
  reader.onerror = () => {
    announce('No se pudo leer el archivo.');
    window.alert('No se pudo leer el archivo.');
  };
  reader.readAsText(file);
}

function applyImported(nuevoEstado) {
  estado = nuevoEstado;
  if (!estado.plan_version) estado.plan_version = plan.version;
  persist();
  syncControlsFromEstado();
  refreshAll();
  checkPlanVersion();
  announce('Respaldo importado. Tu progreso fue reemplazado.');
}

function resetProgreso() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('[seguimiento] No se pudo limpiar localStorage:', e);
  }
  estado = freshEstado();
  syncControlsFromEstado();
  refreshAll();
  announce('Progreso reiniciado. Todas las materias quedaron en No Cursada.');
}

/* Vuelca el estado vigente a los controles ya renderizados (tras
   importar o reiniciar), sin reconstruir las tablas. */
function syncControlsFromEstado() {
  segRefs.forEach((_refs, numero) => syncSegControls(numero));
  finRefs.forEach((refs, numero) => {
    const rec = getRecord(numero);
    refs.slots.forEach((slot, i) => {
      const it = rec.intentos[i];
      slot.fechaInput.value = (it && it.fecha) ? it.fecha : '';
      slot.notaInput.value = (it && isNotaValida(it.nota)) ? String(it.nota) : '';
      slot.fechaInput.removeAttribute('aria-invalid');
      slot.notaInput.removeAttribute('aria-invalid');
    });
  });
}


/* ─────────────────────────────────────────────────────────────
   14. Reconciliación de versión de plan (spec §10.2)
   ───────────────────────────────────────────────────────────── */

function checkPlanVersion() {
  const aviso = document.getElementById('seg-aviso-version');
  if (!aviso) return;
  const pv = estado.plan_version;
  if (pv && plan && pv !== plan.version) {
    aviso.textContent = 'Tu progreso fue creado con la versión ' + pv +
      ' del plan; ahora estás viendo la versión ' + plan.version +
      '. Los datos se conservaron y se muestran contra el plan actual; ' +
      'revisá las materias nuevas o modificadas.';
    aviso.hidden = false;
  } else {
    aviso.hidden = true;
  }
}


/* ─────────────────────────────────────────────────────────────
   15. Arranque
   ───────────────────────────────────────────────────────────── */

function planURL() {
  const base = window.AChETIQBase;
  if (base && typeof base.resolve === 'function') {
    return base.resolve('data/plan_academico.json');
  }
  return '../../data/plan_academico.json';
}

function validatePlan(data) {
  return data && typeof data === 'object' && Array.isArray(data.materias) &&
         data.materias.length > 0;
}

function init() {
  const root = document.querySelector('[data-seguimiento]');
  if (!root) return;

  liveRegion = root.querySelector('#seg-anuncio');
  const status = root.querySelector('#seg-status');

  fetch(planURL(), { credentials: 'same-origin' })
    .then((res) => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then((data) => {
      if (!validatePlan(data)) throw new Error('Plan académico inválido');
      plan = data;
      materiaByNumero = new Map();
      plan.materias.forEach((m) => materiaByNumero.set(m.numero, m));

      estado = loadEstado();
      if (!estado.plan_version) estado.plan_version = plan.version;

      buildDashboard(root.querySelector('#seg-dashboard'));
      buildSeguimientoTable(root.querySelector('#seg-tabla-seguimiento'));
      buildFinalesTable(root.querySelector('#seg-tabla-finales'));
      wireTabs(root);
      wireActions(root);
      refreshAll();
      checkPlanVersion();

      if (status) status.hidden = true;
      root.removeAttribute('aria-busy');
    })
    .catch((err) => {
      console.error('[seguimiento] No se pudo cargar el plan académico:', err);
      if (status) {
        status.replaceChildren();
        status.hidden = false;
        status.setAttribute('role', 'alert');
        status.appendChild(createElement('div', {
          class: 'loader-error',
          children: [createElement('p', {
            class: 'loader-error__message',
            text: 'No se pudo cargar el plan académico. Probá recargar la página.'
          })]
        }));
      }
      root.removeAttribute('aria-busy');
    });
}

function wireActions(root) {
  const btnExport = root.querySelector('#seg-btn-exportar');
  const btnImport = root.querySelector('#seg-btn-importar');
  const btnReset = root.querySelector('#seg-btn-reiniciar');
  const fileInput = root.querySelector('#seg-file-input');

  if (btnExport) btnExport.addEventListener('click', openExportDialog);
  if (btnImport && fileInput) {
    btnImport.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      onFileChosen(file);
      fileInput.value = ''; /* permite reimportar el mismo archivo. */
    });
  }
  if (btnReset) btnReset.addEventListener('click', openResetDialog);

  /* Cierre del popover de faltantes al tocar/click fuera o Escape. */
  document.addEventListener('click', (e) => {
    if (!openPopover) return;
    if (openPopover.popover.contains(e.target) ||
        openPopover.badge.contains(e.target)) return;
    closePopover();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePopover();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
