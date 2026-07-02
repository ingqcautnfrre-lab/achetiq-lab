#!/usr/bin/env node
/**
 * build:seo — genera los artefactos SEO a nivel de sitio: robots.txt y
 * sitemap.xml, ambos derivados de BASE_URL (site.config.mjs).
 *
 *   · robots.txt — permite todo el rastreo y publica la URL absoluta del
 *     sitemap. (En GitHub Pages bajo subpath, robots.txt solo es autoritativo
 *     en el host raíz; se incluye para el dominio propio futuro
 *     —achetiq.org.ar— y es inofensivo en github.io. El sitemap conviene,
 *     además, enviarlo por Search Console.)
 *
 *   · sitemap.xml — se construye recorriendo el árbol real de páginas (igual
 *     que build-urls.mjs), con <loc> absolutos y <lastmod> tomado de la fecha
 *     del último commit de cada archivo (estable y determinista; mtime como
 *     respaldo). Excluye 404.html y cualquier página noindex.
 *
 * Idempotente: sin commits nuevos, re-ejecutarlo produce archivos idénticos.
 * Sin dependencias externas.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { BASE_URL } from "../site.config.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const baseUrl = BASE_URL.replace(/\/+$/, "");

/** Todos los .html bajo `dir`, recursivo y ordenado (salida determinista). */
function walkHtml(dir) {
  const out = [];
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walkHtml(full));
    else if (entry.endsWith(".html")) out.push(full);
  }
  return out;
}

/** Ruta absoluta de archivo → URL canónica del sitio (igual que build-urls). */
function siteUrlFor(absPath) {
  const rel = relative(ROOT, absPath).split(sep).join("/");
  return rel === "index.html" ? `${baseUrl}/` : `${baseUrl}/${rel.replace(/\.html$/, "")}`;
}

/** ¿La página se excluye del índice (meta robots noindex)? */
function isNoindex(html) {
  return /<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html);
}

/** Fecha del último commit (YYYY-MM-DD) que tocó el archivo; mtime si no hay git. */
function lastmodFor(absPath) {
  try {
    const out = execFileSync(
      "git",
      ["log", "-1", "--format=%cs", "--", absPath],
      { cwd: ROOT, encoding: "utf8" }
    ).trim();
    if (out) return out;
  } catch {
    /* sin repo git: respaldo a mtime */
  }
  return statSync(absPath).toISOString
    ? statSync(absPath).mtime.toISOString().slice(0, 10)
    : new Date(statSync(absPath).mtimeMs).toISOString().slice(0, 10);
}

const xmlEscape = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ── conjunto de páginas indexables ─────────────────────────────────── */
const candidates = [join(ROOT, "index.html"), ...walkHtml(join(ROOT, "pages"))];
const pages = candidates
  .filter((f) => relative(ROOT, f) !== "404.html")
  .filter((f) => !isNoindex(readFileSync(f, "utf8")))
  .map((f) => ({ loc: siteUrlFor(f), lastmod: lastmodFor(f) }));

/* ── sitemap.xml ────────────────────────────────────────────────────── */
const urls = pages
  .map(
    (p) =>
      `  <url>\n    <loc>${xmlEscape(p.loc)}</loc>\n    <lastmod>${p.lastmod}</lastmod>\n  </url>`
  )
  .join("\n");
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  `${urls}\n` +
  `</urlset>\n`;

/* ── robots.txt ─────────────────────────────────────────────────────── */
const robots =
  `# robots.txt — AChETIQ\n` +
  `# Generado por scripts/build-seo.mjs desde BASE_URL (site.config.mjs).\n` +
  `User-agent: *\n` +
  `Allow: /\n` +
  `\n` +
  `Sitemap: ${baseUrl}/sitemap.xml\n`;

/* ── escritura idempotente ──────────────────────────────────────────── */
let changed = 0;
function emit(name, content) {
  const path = join(ROOT, name);
  let before = "";
  try {
    before = readFileSync(path, "utf8");
  } catch {
    /* archivo nuevo */
  }
  if (before !== content) {
    writeFileSync(path, content);
    changed++;
    console.log(`  updated  ${name}`);
  } else {
    console.log(`  ok       ${name}`);
  }
}

console.log(`build:seo — BASE_URL = ${baseUrl}`);
emit("sitemap.xml", sitemap);
emit("robots.txt", robots);
console.log(
  `Done. ${changed} file(s) updated. ${pages.length} URL(s) in sitemap.`
);
