// Captura las páginas reales del sitio para incrustarlas en las historias de Instagram.
//
// Uso: node preparar_sitio.cjs <raíz del repo> <carpeta promo/historias-instagram>
// Requiere el sitio servido en http://127.0.0.1:8765/ (python3 -m http.server 8765).
//
// Para cada historia escribe:
//   <proyecto>/assets/site/pages/recursos/<pagina>.html   DOM real tras el JS, sin scripts
//   <proyecto>/assets/site/assets/...                      CSS, tipografías e imágenes del sitio
//   <proyecto>/medidas.json                               posiciones (px CSS) de los elementos animados
// y, para Seguimiento, los valores que calcula la herramienta real en cada paso (valores.json).
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [REPO, PROMO] = process.argv.slice(2);
const ORIGIN = 'http://127.0.0.1:8765/';
const W_APUNTES = 1200;        // vista web de escritorio (decisión del usuario, 23/11/2026)
const W_SEG = 1200;
let W = W_APUNTES;
const KEY = 'achetiq:seguimiento:estado:v1';

const PREP_CSS = `
*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}
.skip-link,[data-loader="footer"],footer.footer,#global-loader,.loader--overlay{display:none!important}
html{scroll-behavior:auto!important}
`;

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(src)) {
    const s = path.join(src, f), d = path.join(dst, f);
    if (fs.statSync(s).isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}

function copySiteAssets(proj) {
  const base = path.join(proj, 'assets/site/assets');
  fs.mkdirSync(path.join(base, 'css'), { recursive: true });
  fs.copyFileSync(path.join(REPO, 'assets/css/main.bundle.css'), path.join(base, 'css/main.bundle.css'));
  copyDir(path.join(REPO, 'assets/fonts'), path.join(base, 'fonts'));
  copyDir(path.join(REPO, 'assets/img/logo'), path.join(base, 'img/logo'));
  copyDir(path.join(REPO, 'assets/img/materias'), path.join(base, 'img/materias'));
}

async function serialize(page, extraCss) {
  return page.evaluate(({ css, origin }) => {
    document.querySelectorAll('select').forEach((sel) => Array.from(sel.options).forEach((o) => {
      if (o.selected) o.setAttribute('selected', ''); else o.removeAttribute('selected');
    }));
    document.querySelectorAll('input').forEach((i) => { if (i.value) i.setAttribute('value', i.value); });
    const d = document.documentElement.cloneNode(true);
    d.querySelectorAll('script, link[rel=preload], link[rel=modulepreload], link[rel=manifest], link[rel=icon], link[rel=apple-touch-icon], meta[http-equiv]').forEach((e) => e.remove());
    const st = document.createElement('style'); st.id = 'prep-video'; st.textContent = css;
    d.querySelector('head').appendChild(st);
    let html = '<!DOCTYPE html>\n' + d.outerHTML;
    return html.split(origin).join('../../');
  }, { css: PREP_CSS + (extraCss || ''), origin: ORIGIN });
}

async function loadReal(ctx, page, estado) {
  const p = await ctx.newPage();
  if (estado !== undefined) {
    await p.addInitScript(([k, e]) => { try { if (e) localStorage.setItem(k, e); else localStorage.removeItem(k); } catch (x) {} }, [KEY, estado]);
  }
  await p.goto(ORIGIN + 'pages/recursos/' + page + '.html', { waitUntil: 'networkidle' });
  await p.evaluate(async () => {
    document.querySelectorAll('img[loading=lazy]').forEach((i) => { i.loading = 'eager'; });
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 700));
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(700);
  return p;
}

const rect = (p, sel) => p.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return [r.x, r.y + window.scrollY, r.width, r.height].map((v) => Math.round(v * 10) / 10); });

async function measureFile(ctx, file, H, fn) {
  const p = await ctx.newPage();
  await p.setViewportSize({ width: W, height: H });
  await p.goto('file://' + file);
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => Promise.all(Array.from(document.images).map((i) => (i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; })))));
  await p.waitForTimeout(300);
  const out = await fn(p);
  out.docH = await p.evaluate(() => document.documentElement.scrollHeight);
  await p.close();
  return out;
}

// ─────────────── Historia 1 · Apuntes ───────────────
async function apuntes(ctx) {
  const proj = path.join(PROMO, 'apuntes');
  copySiteAssets(proj);
  const p = await loadReal(ctx, 'apuntes');
  await p.evaluate(() => {
    // pedido del 23/11/2026: la bibliografía no se sube al repositorio de apuntes
    const lead = document.querySelector('.page-header__lead');
    if (lead) lead.textContent = lead.textContent.replace(', guías de ejercicios y bibliografía aportados', ' y guías de ejercicios aportados');
  });
  const html = await serialize(p);
  const file = path.join(proj, 'assets/site/pages/recursos/apuntes.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  await p.close();

  const H = 2600;
  const m = await measureFile(ctx, file, H, async (q) => {
    const o = {};
    o.h1 = await rect(q, '.page-header__title');
    o.lead = await rect(q, '.page-header__lead');
    o.filtro = await rect(q, '.apuntes-filter');
    o.pill4 = await rect(q, '.pill-nav__pill[data-anio="4"]');
    o.pillTodos = await rect(q, '.pill-nav__pill[data-anio="all"]');
    o.grid = await rect(q, '.apuntes__grid');
    // filtro «4º año» como lo aplica apuntes.js: [hidden] en las demás tarjetas
    await q.evaluate(() => {
      document.querySelectorAll('.apuntes__grid > *').forEach((c) => { if (c.getAttribute('data-anio') !== '4') c.setAttribute('hidden', ''); });
    });
    const cards = await q.$$eval('.apuntes__grid > *:not([hidden])', (els) => els.map((e) => {
      const r = e.getBoundingClientRect(); const cv = e.querySelector('.card-materia__cover').getBoundingClientRect();
      return { nombre: e.querySelector('.card-materia__name').textContent, card: [r.x, r.y + window.scrollY, r.width, r.height], cover: [cv.x, cv.y + window.scrollY, cv.width, cv.height] };
    }));
    o.cards4 = cards;
    return o;
  });
  m.H = H; m.W = W;
  fs.writeFileSync(path.join(proj, 'medidas.json'), JSON.stringify(m, null, 1));
  console.log('apuntes', m.docH, m.cards4.map((c) => c.nombre));
}

// ─────────────── Historia 2 · Seguimiento ───────────────
const NIVELES_TABLA = ['I', 'II'];
const FINALES = [1, 2, 3, 4, 5, 6, 7, 8];
const SEG_CSS = `
#seg-tabla-finales th:nth-child(n+12),#seg-tabla-finales td:nth-child(n+12){display:none!important}
#seg-tabla-finales .seg-fin__fecha::placeholder{color:#6B6E76}
.seg-table-scroll{scrollbar-width:none}.seg-table-scroll::-webkit-scrollbar{display:none}
`;

function estado(base) { return JSON.stringify({ schema_version: 1, plan_version: '2023.1', actualizado_en: null, materias: base }); }
const REC = (e, n, it) => ({ estado: e, nota_final: n == null ? null : n, intentos: it || [] });

async function seguimiento(ctx) {
  W = W_SEG;
  const proj = path.join(PROMO, 'seguimiento');
  copySiteAssets(proj);
  const p = await loadReal(ctx, 'seguimiento', '');
  await p.setViewportSize({ width: W, height: 1000 });
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(700);
  await p.evaluate(([tabla, fin]) => {
    // subconjunto real de la tabla (mismas filas, estilos y controles del sitio)
    document.querySelectorAll('#seg-tabla-seguimiento tbody.seg-table__group').forEach((g) => { if (!tabla.includes(g.dataset.nivel)) g.remove(); });
    document.querySelectorAll('#seg-tabla-finales tbody tr').forEach((tr) => { if (!fin.includes(+tr.dataset.numero)) tr.remove(); });
    // fechas como en un navegador es-AR (dd/mm/aaaa)
    document.querySelectorAll('.seg-fin__fecha').forEach((i) => { i.type = 'text'; i.placeholder = 'dd/mm/aaaa'; });
  }, [NIVELES_TABLA, FINALES]);
  const html = await serialize(p, SEG_CSS);
  const file = path.join(proj, 'assets/site/pages/recursos/seguimiento.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  await p.close();

  const H = 3400;
  const m = await measureFile(ctx, file, H, async (q) => {
    const o = {};
    o.h1 = await rect(q, '.page-header__title');
    o.recursos = await rect(q, '.header-resources');
    o.privacidad = await rect(q, '.seguimiento__nota-privacidad');
    o.acciones = await rect(q, '.seguimiento__actions');
    o.tabs = await rect(q, '.seg-tabs');
    o.tab = {};
    for (const t of ['seguimiento', 'finales', 'nota']) o.tab[t] = await rect(q, `.seg-tabs__tab[data-tab="${t}"]`);
    o.kpis = await q.$$eval('#seg-dashboard .seg-kpi', (els) => els.map((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y + window.scrollY, r.width, r.height]; }));
    o.tabla = await rect(q, '#seg-tabla-seguimiento');
    o.filas = {};
    for (const n of [1, 3, 4, 5, 6, 9, 10, 11, 12, 13, 14]) {
      o.filas[n] = {
        fila: await rect(q, `#seg-tabla-seguimiento tr[data-numero="${n}"]`),
        sel: await rect(q, `#seg-estado-${n}`),
        badge: await rect(q, `#seg-tabla-seguimiento tr[data-numero="${n}"] .seg-badge`),
      };
    }
    // pestaña «Exámenes finales» visible, como la deja el JS al cambiar de pestaña
    await q.evaluate(() => {
      document.getElementById('seg-panel-seguimiento').hidden = true;
      document.getElementById('seg-panel-finales').hidden = false;
    });
    o.finPanel = await rect(q, '#seg-panel-finales');
    o.finScroll = await rect(q, '#seg-tabla-finales .seg-table-scroll');
    o.finIntro = await rect(q, '#seg-panel-finales .seg-panel__intro');
    o.kpiVals = await q.$$eval('#seg-dashboard .seg-kpi__value', (els) => els.map((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y + window.scrollY, r.width, r.height]; }));
    o.finScrollW = await q.$eval('#seg-tabla-finales .seg-table-scroll', (e) => e.scrollWidth);
    o.fin = {};
    for (const n of FINALES) {
      o.fin[n] = await q.$eval(`#seg-tabla-finales tr[data-numero="${n}"]`, (tr) => {
        const r = (e) => { const b = e.getBoundingClientRect(); return [b.x, b.y + window.scrollY, b.width, b.height]; };
        const tds = Array.from(tr.children).filter((c) => getComputedStyle(c).display !== 'none');
        return { fila: r(tr), nota: r(tr.querySelector('[data-col="nota"]')), inputs: Array.from(tr.querySelectorAll('input')).filter((i) => i.offsetParent).map(r), celdas: tds.map(r) };
      });
    }
    return o;
  });
  m.H = H; m.W = W;
  fs.writeFileSync(path.join(proj, 'medidas.json'), JSON.stringify(m, null, 1));
  console.log('seguimiento', m.docH, 'finScrollW', m.finScrollW);

  // valores de la herramienta real en cada paso de la historia
  const AGA = [{ fecha: '2024-02-20', nota: 4 }, { fecha: '2024-03-05', nota: 7 }];
  const FIS = [{ fecha: '2024-07-24', nota: 2 }, { fecha: '2024-12-11', nota: 5 }, { fecha: '2025-02-19', nota: 8 }];
  const base = () => ({ 3: REC('Regular'), 4: REC('Aprobada'), 5: REC('Regular'), 6: REC('Aprobada') });   // estado al terminar de marcar en el video (t_aga)
  const pasos = [];
  pasos.push(['inicial', {}]);
  pasos.push(['t_quimica', { 6: REC('Aprobada') }]);
  pasos.push(['t_am1', { 6: REC('Aprobada'), 4: REC('Aprobada') }]);
  pasos.push(['t_fis', { 6: REC('Aprobada'), 4: REC('Aprobada'), 5: REC('Regular') }]);
  pasos.push(['t_aga', { 6: REC('Aprobada'), 4: REC('Aprobada'), 5: REC('Regular'), 3: REC('Regular') }]);
  pasos.push(['t_iiq', base()]);
  for (let k = 1; k <= AGA.length; k++) { const b = base(); b[3] = REC(k === AGA.length ? 'Aprobada' : 'Regular', null, AGA.slice(0, k)); pasos.push(['f_aga' + k, b]); }
  for (let k = 1; k <= FIS.length; k++) { const b = base(); b[3] = REC('Aprobada', null, AGA); b[5] = REC(k === FIS.length ? 'Aprobada' : 'Regular', null, FIS.slice(0, k)); pasos.push(['f_fis' + k, b]); }
  const valores = {};
  for (const [nombre, est] of pasos) {
    const q = await loadReal(ctx, 'seguimiento', Object.keys(est).length ? estado(est) : '');
    await q.setViewportSize({ width: W, height: 1000 });
    valores[nombre] = await q.evaluate(() => ({
      kpis: Array.from(document.querySelectorAll('#seg-dashboard .seg-kpi')).map((k) => [k.querySelector('.seg-kpi__label').textContent, k.querySelector('.seg-kpi__value').textContent]),
      disp: Object.fromEntries(Array.from(document.querySelectorAll('#seg-tabla-seguimiento tr.seg-table__row')).map((tr) => [tr.dataset.numero, tr.querySelector('.seg-badge__text').textContent])),
      falt: Object.fromEntries(Array.from(document.querySelectorAll('#seg-tabla-seguimiento tr.seg-table__row')).map((tr) => [tr.dataset.numero, tr.querySelector('[data-col="falt"]').textContent])),
      notaFin: Object.fromEntries(Array.from(document.querySelectorAll('#seg-tabla-finales tbody tr')).map((tr) => [tr.dataset.numero, tr.querySelector('[data-col="nota"]').textContent])),
      estadoFin: Object.fromEntries(Array.from(document.querySelectorAll('#seg-tabla-finales tbody tr')).map((tr) => [tr.dataset.numero, tr.querySelector('[data-col="estado"]').textContent])),
    }));
    await q.close();
  }
  fs.writeFileSync(path.join(proj, 'valores.json'), JSON.stringify(valores, null, 1));
  console.log('valores', Object.keys(valores).join(' '));
}

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: 1000 }, deviceScaleFactor: 1, locale: 'es-AR' });
  await apuntes(ctx);
  await seguimiento(ctx);
  await b.close();
})();
