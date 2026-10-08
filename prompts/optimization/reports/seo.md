# SEO Optimization Pass — Report

> Pillar `01-seo.md`. Static HTML on GitHub Pages, monolingual **es-AR**.
> Scope honored: no visible-copy rewrites, no design/CSS/JS-behavior changes, no
> hreflang, still GitHub Pages. All URLs derive from `BASE_URL`
> (`site.config.mjs`) — no hard-coded origin anywhere.

Date: 2026-06-26 · Tooling: Lighthouse 13.x (Chromium 141, mobile preset),
`structured-data-testing-tool`, `linkinator`, served locally with
`python3 -m http.server 8099`.

---

## 1. Headline result

The site already scored **Lighthouse SEO 100** at baseline (its scored audits
don't penalize a *missing* canonical or sitemap), so this pass closed the four
**structural** gaps that the score doesn't see — canonical URLs, JSON-LD,
`robots.txt`, `sitemap.xml` — while keeping SEO at 100 and adding zero
indexability blockers.

## 2. Per-page Lighthouse SEO (before → after)

| Page | SEO before | SEO after | canonical audit | structured-data |
|---|---:|---:|:--:|:--:|
| `/` (index) | 100 | **100** | pass | EducationalOrganization |
| `/pages/contacto.html` | 100 | **100** | pass | + BreadcrumbList |
| `/pages/sobre-achetiq.html` | 100 | **100** | pass | + BreadcrumbList |
| `/pages/gabinetes/eventos.html` (nested) | 100 | **100** | pass | + BreadcrumbList |
| `/pages/recursos/apuntes.html` (nested) | 100 | **100** | pass | + BreadcrumbList |
| `/pages/recursos/seguimiento.html` | 100 | **100** | pass | + BreadcrumbList |

Every page: `canonical`, `is-crawlable`, `document-title`, `meta-description`,
`http-status-code` audits all pass; zero failing SEO audits. `404.html` keeps
its intentional `noindex, follow` (correctly excluded from canonical, JSON-LD
and the sitemap).

> Baseline source: `prompts/optimization/baseline/raw/lighthouse/_scores-summary.md`
> and `prompts/optimization/baseline/raw/seo-before-snapshot.md`.

## 3. Artifacts added (checklist)

- [x] **`robots.txt`** — allow-all, absolute `Sitemap:` line from `BASE_URL`.
- [x] **`sitemap.xml`** — 11 indexable pages, absolute `<loc>`, git-date
      `<lastmod>`, XML well-formed, every loc returns 200; `404.html` and any
      `noindex` page excluded.
- [x] **`<link rel="canonical">`** on all 11 indexable pages (none on `404.html`).
- [x] **`EducationalOrganization` JSON-LD** site-wide (every page + template).
- [x] **`BreadcrumbList` JSON-LD** on all 10 content pages (parsed from the
      visible breadcrumb so structured data matches the page).
- [x] **`scripts/build-jsonld.mjs`** + npm `build:jsonld`.
- [x] **`scripts/build-seo.mjs`** + npm `build:seo`.
- [x] **`scripts/build-urls.mjs`** extended with canonical insert/sync.
- [x] All four wired into `npm run build` (`build:urls → build:jsonld →
      build:css → build:seo`); the full chain is **idempotent** (clean
      `git status` after a re-run).

## 4. Before / after structural state

| Tag / file | Before | After |
|---|---:|---:|
| `robots.txt` | ❌ absent | ✅ generated |
| `sitemap.xml` | ❌ absent | ✅ generated (11 URLs) |
| `rel="canonical"` | 0 / 16 | ✅ 11 indexable pages |
| JSON-LD (`application/ld+json`) | 0 / 16 | ✅ 11 pages (org) + 10 (breadcrumb) |
| Unique `<title>` / `<meta description>` | already present | ✅ verified unique, no placeholders |
| `<meta name="robots">` (404 only) | 1 / 16 | unchanged (intentional) |

## 5. Validation evidence

- **Structured data — zero errors / zero warnings.**
  `structured-data-testing-tool` on the served URLs:
  `EducationalOrganization` 100% (1/1) on the home page; on a nested page
  `EducationalOrganization` **and** `BreadcrumbList` 100% (2/2). Every
  `application/ld+json` block on all 11 pages parses as valid JSON (11/11, 0
  parse errors). One valid `EducationalOrganization` entity exists site-wide.
- **Sitemap.** XML well-formed (11 `<url>`/`<loc>` nodes); all 11 locs → 200
  locally; referenced by `robots.txt` via an absolute `Sitemap:` line.
- **Crawlability.** `linkinator --recurse` (external/sandbox-blocked domains
  skipped): 56 internal links, all 200, with one expected non-issue (below).
- **Headings.** Rendered-DOM dump (post-JS, incl. JSON-driven content) on
  `apuntes`, `sobre-achetiq`, `gabinetes`: exactly one `<h1>` each, first
  heading is the `<h1>`, no skipped levels (`h1→h2→h3`, never `h1→h3`).
- **Images.** 100% of `<img>` carry an `alt` (raw + every JS render path):
  meaningful images have descriptive Spanish `alt`; decorative covers/photos/
  logos use `alt=""` (+ `aria-hidden`). No code change was needed — the repo
  already followed this convention.

## 6. Structured-data sourcing (no fabricated fields)

`EducationalOrganization` is assembled only from data already in the repo:

| Field | Source |
|---|---|
| `name`, `alternateName` | institutional copy (footer / `sobre-achetiq`) |
| `foundingDate` `2009-04-30` | `index.html` ("fundada el 30 de abril de 2009") |
| `email` | `data/redes.json` |
| `address` (PostalAddress) | `data/redes.json` (`direccion_facultad`) |
| `parentOrganization` (ANEIQA) | `data/instituciones.json` |
| `sameAs` | `data/redes.json` (only non-null profiles → Instagram today; new profiles appear automatically) |
| `logo`, `image`, `url`, `@id` | `BASE_URL` + existing assets (`icon-512.png`, `og-image-achetiq.png`) |

Fields the repo lacks (telephone, additional social profiles) were **omitted**,
not invented — they light up on their own once `data/redes.json` is filled in.

## 7. Design notes & trade-offs

- **Single source of truth.** Canonical, og:url and the breadcrumb item URLs are
  all derived from `BASE_URL`. Switching to the official site, `https://achetiq.github.io`, stays a
  one-line edit in `site.config.mjs` followed by `npm run build`.
- **Idempotent, marker-based injection.** JSON-LD lives between
  `<!-- SEO:JSON-LD … -->` markers; canonical is insert-or-sync; robots/sitemap
  diff before writing. Re-running the build produces no diff.
- **`lastmod` = git commit date** (file mtime fallback). Stable and
  deterministic — it changes only when a page is actually committed, which keeps
  the sitemap honest and the build idempotent.
- **Org name correction.** `og:image:alt` / `twitter:image:alt` described the
  logo as the "Asociación **Chaco-Corrientes** de Estudiantes de Ingeniería
  Química", which is not the institution's name. Corrected to the real
  "Asociación **Chaqueña** de Estudiantes **Tecnológicos** de Ingeniería
  Química" (template + home). This is an `alt`/meta correction within scope; it
  also aligns the social card with the new JSON-LD `name`. No visible body copy
  changed; the formal tone (no exclamation marks) is preserved.

## 8. Known non-issues (not defects)

- **`linkinator` reports `[404] /partials/index.html`** when it crawls the
  fetch-only fragment `partials/navbar.html` standalone. That fragment's brand
  link (`href="./index.html"`, `data-navbar-brand`) is resolved at runtime by
  `navbar.js` against the *consuming* page, so it is never broken on a real
  page. The partial is not a page, not canonical and not in the sitemap → no
  indexability impact.
- **`robots.txt` on a github.io subpath.** Crawlers only honor `robots.txt` at
  the *host root* (`ingqcautnfrre-lab.github.io/robots.txt`), not under
  `/achetiq-lab/`. The generated file is correct and harmless today and becomes
  authoritative on the official site (`https://achetiq.github.io`, served at
  the host root). For the build site, submit `sitemap.xml` directly via Google
  Search Console.
- **Sandbox network.** `cdnjs`, Google Drive/Maps and social origins are blocked
  in the audit sandbox; this does not affect SEO scores or the structured data.

## 9. Crawlability statement

The site is **100% static HTML** — already crawl-ideal. Indexable content is
present in the delivered HTML; no client-only rendering was introduced for any
indexable content. (Decorative card cover images are hydrated from JSON, but the
meaningful text — names, headings, links — ships in static HTML.)

## 10. Commits in this pass (atomic)

1. `seo: correct organization name in social image alt`
2. `seo: add canonical link generation`
3. `seo: site-wide Organization + Breadcrumb JSON-LD`
4. `seo: generate robots.txt and sitemap.xml`
5. `seo: add SEO optimization pass report` (this file)
