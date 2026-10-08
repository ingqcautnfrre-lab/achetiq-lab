# 01 — SEO Optimization Pass (AChETIQ, static HTML on GitHub Pages)

> Paste everything below the line into Claude Code at the repo root. It is
> self-contained. Read `00-index.md` first for the stack facts this prompt relies on.

---

You are a senior technical-SEO engineer. Optimize the **search visibility and
crawlability** of this site **without** changing its visible content, layout, or the
static-HTML / GitHub-Pages architecture.

## 1. Objective
Raise this site's technical SEO to a verifiable standard: **Lighthouse SEO ≥ 95 on
every page**, **zero indexability blockers**, and **valid structured data** that
passes Google's Rich Results test and Schema.org validation — with `robots.txt`,
`sitemap.xml`, canonical URLs, and JSON-LD that did not previously exist.

## 2. Scope
**In scope:** `index.html`, `404.html`, all `pages/**/*.html`, the template
`partials/_boilerplate.html`, and `scripts/build-urls.mjs` (the existing meta-injection
script — extend its pattern). New files to generate: `robots.txt`, `sitemap.xml`, and
a `scripts/build-seo.mjs` (or an extension of `build-urls.mjs`) that produces them from
`BASE_URL` in `site.config.mjs`.
**Out of scope:** visible copy rewrites, design/CSS, JS behavior, performance work
(that is `03`), any i18n/hreflang work (the site is **monolingual es-AR** — do **not**
add hreflang), and switching away from GitHub Pages.

## 3. Preconditions (measure before you change anything)
1. Confirm the baseline exists (`05-baseline-audit.md`). If `prompts/optimization/baseline/` has no SEO numbers, **run the baseline SEO audit first**.
2. Run Lighthouse SEO on the 4 reference pages and record scores + every failing audit:
   ```
   npx --yes lighthouse http://localhost:8099/ --only-categories=seo --output=json --output-path=/tmp/seo-index.json --quiet --chrome-flags="--headless=new --no-sandbox"
   ```
   (Serve the repo statically first, e.g. `npx --yes serve -l 8099 .` or `python3 -m http.server 8099`.)
3. Inventory current state: `grep -rl 'rel="canonical"' .` (expect none), `ls robots.txt sitemap.xml` (expect missing), `grep -rl 'application/ld+json' .` (expect none). Record these as the "before" facts.
4. Read `scripts/build-urls.mjs` fully — your new generation logic must follow its idempotent, `BASE_URL`-driven pattern and not fight it.

## 4. Methodology (mandatory loop — no change without numbers)
**Measure → Diagnose → Implement → Verify → Document.** For each sub-task: record the
failing Lighthouse audit / missing artifact (Measure), explain the root cause
(Diagnose), make the smallest change (Implement), re-run Lighthouse + validators
(Verify), and append a before/after line to the pass report (Document). Never batch
unrelated changes into one commit.

## 5. Stack-specific guidance
- **Canonical URLs:** add one `<link rel="canonical" href="…">` per page. Do **not**
  hard-code the origin — generate it from `BASE_URL` via the build script so a domain
  switch (to the official site, `https://achetiq.github.io`) stays a one-line change. Put a placeholder token in
  `partials/_boilerplate.html` that the script fills, mirroring how og:url is handled.
- **Per-route metadata:** verify each page has a **unique** `<title>` and
  `<meta name="description">`. The pattern is `Page - AChETIQ`; check for duplicates and
  empty/placeholder descriptions across all pages.
- **Open Graph / Twitter:** these are partly handled by `build-urls.mjs`. Verify every
  page emits `og:title`, `og:description`, `og:type`, `og:url`, `og:image`,
  `og:locale=es_AR`, `twitter:card=summary_large_image`, `twitter:image`. Fix gaps in
  the template, not page-by-page.
- **Structured data (JSON-LD):** add a site-wide `EducationalOrganization` (it is a
  student association at UTN-FRRe — `EducationalOrganization` or `Organization` with
  `parentOrganization`) block in the template `<head>`, including `name`, `url`, `logo`,
  `sameAs` (pull the social URLs already in `data/redes.json`), and `address`. Add
  page-appropriate types where they fit (e.g. `BreadcrumbList` for nested
  `gabinetes/` and `recursos/` pages; `Event` only if event pages carry real dates).
  Do not invent data — source it from `data/*.json` and existing page copy.
- **`robots.txt`:** generate at repo root, allowing all, with an absolute `Sitemap:`
  line built from `BASE_URL`. Keep `404.html`'s `noindex,follow` as-is.
- **`sitemap.xml`:** generate from the actual page set (walk the tree the way
  `build-urls.mjs` already does). Use absolute `BASE_URL` locs, sensible `lastmod`
  (git commit date or file mtime), and **exclude** `404.html` and any non-indexable page.
- **Semantic HTML & headings:** verify exactly one `<h1>` per page and a non-skipping
  `h1→h2→h3` order. Note that some headings live in `data/*.json`-driven content
  rendered by `assets/js/loaders.js` — check the rendered DOM (via `scripts/shoot.mjs`
  or Lighthouse), not just the static HTML.
- **Image `alt`:** audit the ~18 raw `<img>` tags **and** the JSON-driven images.
  Every meaningful image needs a descriptive Spanish `alt`; decorative images get
  `alt=""`. For JSON-rendered images, fix the data or the renderer, not output HTML.
- **Crawlability:** the site is already 100% static (ideal). State this in the report;
  do not introduce client-only rendering for indexable content.

## 6. Tooling
- `npx --yes lighthouse … --only-categories=seo` (per page).
- Schema validation: paste rendered JSON-LD into Google Rich Results Test and the
  Schema.org validator; or `npx --yes structured-data-testing-tool` against served URLs.
- `npx --yes linkinator http://localhost:8099/ --recurse` to catch broken links / 404s.
- `grep`/ripgrep for canonical/description/alt inventories.
- `node scripts/build-urls.mjs` (and your new `build-seo`/`build:sitemap`) to regenerate artifacts; wire a new npm script (`"build:seo"`).

## 7. Acceptance criteria (numeric, pass/fail)
- Lighthouse **SEO ≥ 95** on all 4 reference pages (and spot-check 2 nested pages).
- **Zero** indexability blockers (no unintended `noindex`, no blocked resources, valid `robots.txt`).
- `sitemap.xml` validates (XML well-formed, all locs 200, absolute URLs) and is referenced from `robots.txt`.
- JSON-LD passes Rich Results **with zero errors**; ≥ 1 valid `Organization`/`EducationalOrganization` entity site-wide.
- 100% of meaningful images have non-empty `alt`; decorative images use `alt=""`.
- Every page: unique non-empty `<title>` and `<meta name="description">`; exactly one `<h1>`.

## 8. Output expectations
Small, atomic commits (e.g. "seo: add canonical link generation", "seo: site-wide
Organization JSON-LD", "seo: generate robots.txt + sitemap.xml"). A short report
(`prompts/optimization/reports/seo.md`) with a per-page before/after Lighthouse-SEO
table and a checklist of artifacts added. No drive-by content rewrites.

## 9. Guardrails
- **Do not** break the `npm run build` chain or the `build-urls.mjs` idempotence; new
  generation must be deterministic and re-runnable.
- **Do not** hard-code an origin anywhere — always derive from `BASE_URL`.
- **Do not** add hreflang/i18n; the site is monolingual es-AR.
- **Do not** change visible copy beyond `alt`/`<title>`/meta; if a title/description
  must change for SEO, state the trade-off (brand wording vs. keyword clarity) in the
  report and keep the institution's formal tone (no exclamation marks — see
  `INSTRUCCION_PROYECTO.md`).
- If structured data would require data the repo does not have, **say so** and stop at
  the validated subset rather than fabricating fields.
