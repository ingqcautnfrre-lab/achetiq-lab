#!/usr/bin/env node
/**
 * build:jsonld — genera e inyecta los datos estructurados (JSON-LD).
 *
 * Produce dos tipos de entidad Schema.org y los escribe «in place» en el
 * <head> de cada página servida, dentro de una región marcada:
 *
 *   1. EducationalOrganization (AChETIQ) — bloque único a nivel de sitio,
 *      presente en todas las páginas y en la plantilla. Se arma desde los
 *      datos reales del repo (data/redes.json, data/instituciones.json) y
 *      desde BASE_URL (site.config.mjs): nada de orígenes hard-codeados.
 *
 *   2. BreadcrumbList — solo en páginas con miga de pan visible
 *      (<ol class="breadcrumbs__list">). Se PARSEA de ese HTML visible para
 *      que el dato estructurado coincida exactamente con lo que ve el usuario
 *      (requisito de Google). Las URLs relativas se resuelven contra la URL
 *      absoluta de la página.
 *
 * Diseño — reescritura idempotente entre marcadores:
 *   El sitio se sirve tal cual desde GitHub Pages (sin paso de build en el
 *   servidor), así que el JSON-LD debe existir ya resuelto en el HTML
 *   entregado. Este script reemplaza el contenido entre los marcadores
 *   <!-- SEO:JSON-LD --> … <!-- /SEO:JSON-LD -->; si no existen, inserta la
 *   región antes de </head>. Ejecutarlo dos veces no cambia nada.
 *
 * Migración de dominio: editar BASE_URL en site.config.mjs y re-ejecutar.
 *
 * Sin dependencias externas.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { BASE_URL } from "../site.config.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const baseUrl = BASE_URL.replace(/\/+$/, "");

/* ── lectura de datos del repo (fuente única de verdad) ─────────────── */
const readJson = (rel) => JSON.parse(readFileSync(join(ROOT, rel), "utf8"));
const redes = readJson("data/redes.json");
const instituciones = readJson("data/instituciones.json");
const aneiqa = instituciones.find((i) => i.id === "aneiqa") || {};

/* Perfiles sociales: solo los campos no nulos con forma de URL. Al completar
   un campo null en data/redes.json (linkedin, youtube…) aparece solo. */
const SOCIAL_KEYS = ["instagram", "facebook", "linkedin", "youtube", "twitter"];
const sameAs = SOCIAL_KEYS
  .map((k) => redes[k])
  .filter((v) => typeof v === "string" && /^https?:\/\//.test(v));

/**
 * EducationalOrganization de AChETIQ. Campos sourced del repo:
 *  · name/alternateName ...... copia institucional (footer, sobre-achetiq).
 *  · foundingDate ............. «fundada el 30 de abril de 2009» (index.html).
 *  · email .................... data/redes.json.
 *  · address .................. data/redes.json (direccion_facultad,
 *                               «Calle French 414, H3506 Resistencia, Chaco»).
 *  · parentOrganization ....... data/instituciones.json (ANEIQA).
 *  · sameAs ................... data/redes.json (perfiles no nulos).
 */
const organization = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "@id": `${baseUrl}/#organization`,
  name: "Asociación Chaqueña de Estudiantes Tecnológicos de Ingeniería Química",
  alternateName: "AChETIQ",
  url: `${baseUrl}/`,
  logo: `${baseUrl}/icon-512.png`,
  image: `${baseUrl}/assets/img/og-image-achetiq.png`,
  description:
    "Asociación civil sin fines de lucro que nuclea a los estudiantes de la " +
    "carrera de Ingeniería Química de la Universidad Tecnológica Nacional, " +
    "Facultad Regional Resistencia (UTN FRRe).",
  foundingDate: "2009-04-30",
  email: redes.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Calle French 414",
    postalCode: "H3506",
    addressLocality: "Resistencia",
    addressRegion: "Chaco",
    addressCountry: "AR",
  },
  parentOrganization: {
    "@type": "EducationalOrganization",
    name: aneiqa.nombre,
    alternateName: aneiqa.nombre_corto,
    url: aneiqa.web,
  },
  sameAs,
};

/**
 * WebSite del sitio — señal principal que usa Google para el «nombre del
 * sitio» (el texto que aparece sobre el título en los resultados). Se fija
 * en la marca corta «AChETIQ»; el nombre largo queda como alternateName y
 * como <title> de cada página. Debe ser consistente con og:site_name.
 */
const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${baseUrl}/#website`,
  name: "AChETIQ",
  alternateName:
    "Asociación Chaqueña de Estudiantes Tecnológicos de Ingeniería Química",
  url: `${baseUrl}/`,
  publisher: { "@id": `${baseUrl}/#organization` },
};

/* ── utilidades ─────────────────────────────────────────────────────── */

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

/** Quita etiquetas, decodifica entidades básicas y colapsa espacios. */
function textOf(html) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Resuelve un href relativo de la miga contra la URL absoluta de la página. */
function resolveItem(href, pageUrl) {
  return new URL(href, pageUrl).href.replace(/\/index\.html$/, "/");
}

/**
 * BreadcrumbList parseado de la miga de pan visible, o null si no hay.
 * Cada <li> es un enlace (name + item) o el ítem actual (name, sin item).
 */
function buildBreadcrumb(html, pageUrl) {
  const ol = html.match(/<ol class="breadcrumbs__list">([\s\S]*?)<\/ol>/);
  if (!ol) return null;

  const items = [];
  const liRe = /<li\b[^>]*>([\s\S]*?)<\/li>/g;
  let m;
  while ((m = liRe.exec(ol[1])) !== null) {
    const inner = m[1];
    const a = inner.match(/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    const li = {
      "@type": "ListItem",
      position: items.length + 1,
      name: textOf(a ? a[2] : inner),
    };
    if (a) li.item = resolveItem(a[1], pageUrl);
    items.push(li);
  }
  if (items.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

/* ── render + inyección de la región marcada ────────────────────────── */
const BEGIN = "<!-- SEO:JSON-LD — generado por scripts/build-jsonld.mjs · no editar a mano -->";
const END = "<!-- /SEO:JSON-LD -->";
const REGION = /[ \t]*<!-- SEO:JSON-LD[\s\S]*?<!-- \/SEO:JSON-LD -->\n?/;

/** Serializa cada entidad en su <script> con sangría de 2 espacios. */
function renderBlock(entities) {
  const scripts = entities
    .map((e) => {
      const json = JSON.stringify(e, null, 2)
        .split("\n")
        .map((l) => "  " + l)
        .join("\n");
      return `  <script type="application/ld+json">\n${json}\n  </script>`;
    })
    .join("\n");
  return `  ${BEGIN}\n${scripts}\n  ${END}\n`;
}

/** Inserta/reemplaza la región antes de </head>. */
function inject(html, block) {
  if (REGION.test(html)) return html.replace(REGION, block);
  return html.replace(/<\/head>/, `${block}</head>`);
}

/* ── ejecución ──────────────────────────────────────────────────────── */

// Páginas indexables (excluye 404.html: noindex) + la plantilla, que recibe
// solo la Organization como referencia para páginas nuevas.
const pageFiles = [
  join(ROOT, "index.html"),
  ...walkHtml(join(ROOT, "pages")),
].filter((f) => relative(ROOT, f) !== "404.html");
const templateFile = join(ROOT, "partials", "_boilerplate.html");

let scanned = 0;
let updated = 0;

function process(file, { withBreadcrumb }) {
  scanned++;
  const before = readFileSync(file, "utf8");
  const entities = [organization, website];
  if (withBreadcrumb) {
    const crumb = buildBreadcrumb(before, siteUrlFor(file));
    if (crumb) entities.push(crumb);
  }
  const after = inject(before, renderBlock(entities));
  const label = relative(ROOT, file).split(sep).join("/");
  if (after !== before) {
    writeFileSync(file, after);
    updated++;
    console.log(`  updated  ${label}`);
  } else {
    console.log(`  ok       ${label}`);
  }
}

console.log(`build:jsonld — BASE_URL = ${baseUrl}`);
for (const f of pageFiles) process(f, { withBreadcrumb: true });
process(templateFile, { withBreadcrumb: false });
console.log(`Done. ${updated} file(s) updated, ${scanned} scanned.`);
