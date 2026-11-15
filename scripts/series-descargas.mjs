#!/usr/bin/env node
/**
 * series-descargas.mjs — descargas por ejercicio de una guía de Series Resueltas.
 * Herramienta interna de publicación (no se sirve).
 *
 *   node scripts/series-descargas.mjs <materia>
 *   p. ej.: node scripts/series-descargas.mjs ingenieria-de-las-reacciones-quimicas
 *
 * Lee la guía publicada (assets/docs/series-resueltas/<materia>.html) y escribe, para
 * cada ejercicio, en assets/docs/series-resueltas/<materia>/:
 *   · Sxx-Eyy.pdf — la versión completa del ejercicio, tal como la imprime la guía
 *     («Descargar PDF»: solo ese ejercicio, desplegables abiertos, paleta clara, A4),
 *     con número de página al pie;
 *   · Sxx-Eyy.md  — «Óptimo para IA»: Markdown con todo el ejercicio, las ecuaciones
 *     en LaTeX y los valores de cada figura (window.guiaMarkdownEjercicio de la guía).
 * Los nombres usan el id corto (S06-E01-2024 → S06-E01). Imprime un JSON con el
 * tamaño de cada archivo, para los rótulos de la página de la materia.
 *
 * Requiere Playwright (como scripts/shoot.mjs):
 *   npx playwright install chromium      (o un Chromium global)
 */
import { chromium } from "playwright";
import { mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const materia = process.argv[2];
if (!materia) {
  console.error("Uso: node scripts/series-descargas.mjs <materia>");
  process.exit(2);
}
const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const guia = join(raiz, "assets/docs/series-resueltas", `${materia}.html`);
const salida = join(raiz, "assets/docs/series-resueltas", materia);
mkdirSync(salida, { recursive: true });

const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errores = [];
page.on("pageerror", (e) => errores.push(String(e)));
await page.goto(pathToFileURL(guia).href, { waitUntil: "load", timeout: 180000 });

const faltan = await page.evaluate(() =>
  ["guiaMarkdownEjercicio", "guiaPrepararPdf", "guiaTerminarPdf", "guiaVersion"].filter((f) => typeof window[f] !== "function"));
if (faltan.length) {
  console.error(`La guía no trae las funciones de descarga (${faltan.join(", ")}): recompilarla con el motor actual.`);
  process.exit(1);
}
const materiaTitulo = await page.evaluate(() => (document.querySelector(".portada h1") || {}).textContent?.trim() || document.title);
const ids = await page.evaluate(() => [...document.querySelectorAll("article.ejercicio")].map((a) => a.id));
const informe = [];

for (const id of ids) {
  const corto = id.replace(/-\d{4}$/, "");
  const md = await page.evaluate((x) => window.guiaMarkdownEjercicio(x), id);
  writeFileSync(join(salida, `${corto}.md`), md);

  const meta = await page.evaluate(async (x) => {
    location.hash = x;
    await new Promise((r) => setTimeout(r, 120));
    window.guiaVersion("completa");
    window.dispatchEvent(new Event("beforeprint")); // abre los desplegables, como al imprimir
    window.guiaPrepararPdf(x);
    const art = document.getElementById(x);
    const grupo = art.closest("section.grupo");
    const serie = (grupo.getAttribute("data-titulo") || "").split(" — ")[0];
    const ej = art.querySelector(".ejercicio-cabecera .antetitulo").textContent.split("·")[0].trim();
    const titulo = art.querySelector(".ejercicio-cabecera h3").textContent.trim();
    document.title = `${serie} · ${ej} — ${titulo}`; // título del PDF
    return { serie, ej, titulo };
  }, id);
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: join(salida, `${corto}.pdf`),
    preferCSSPageSize: true,
    printBackground: false,
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate:
      '<div style="width:100%;padding:0 15mm;display:flex;justify-content:space-between;' +
      'font-family:system-ui,sans-serif;font-size:7.5px;color:#6b7785">' +
      `<span>AChETIQ · Series Resueltas · ${materiaTitulo} · ${meta.serie} · ${meta.ej}</span>` +
      '<span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
  });
  await page.emulateMedia({ media: "screen" });
  await page.evaluate(() => {
    window.guiaTerminarPdf();
    window.dispatchEvent(new Event("afterprint"));
    window.guiaVersion(null);
  });
  informe.push({
    id,
    archivo: corto,
    pdf: statSync(join(salida, `${corto}.pdf`)).size,
    md: statSync(join(salida, `${corto}.md`)).size,
  });
}

await browser.close();
if (errores.length) {
  console.error("Errores de la guía:", errores);
  process.exit(1);
}
console.log(JSON.stringify(informe, null, 1));
