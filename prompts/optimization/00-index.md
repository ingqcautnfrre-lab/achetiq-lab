# Optimization Prompt Battery — AChETIQ

A reusable battery of expert-grade, copy-paste-ready prompts. Each one, when pasted
into Claude Code against **this** repository, drives a focused optimization pass on a
single resource pillar. **This index is the map; the pillar files are the work.**

> Authored as documentation only. Running these prompts is a separate, later step.

---

## ⚠️ Read this first — the stack is NOT what a generic brief assumes

A Phase-0 reconnaissance of this repo found that it is **a static, hand-authored
HTML site served from GitHub Pages** — *not* a Next.js / React / TypeScript /
Tailwind / shadcn / framer-motion application. Every prompt in this battery has been
**rewritten to match the real stack**. If you arrived expecting Next.js guidance,
that guidance was intentionally removed as inapplicable (see "Pillar guidance dropped"
below).

Two authoring decisions were locked in because the interactive confirmation step was
unavailable at authoring time. **If either is wrong, redirect before executing:**

1. **Adapt-to-real-stack.** All prompts target static HTML + vanilla JS ES modules +
   the custom CSS design-token system + the `npx`/Node build scripts. No framework
   APIs are assumed.
2. **Security headers = document-the-limit + portable-config.** GitHub Pages cannot
   set custom HTTP response headers, so `04-security.md` uses the `<meta http-equiv>`
   CSP subset that *does* work on Pages, honestly documents what Pages cannot enforce,
   and ships a portable header file to apply if a CDN/proxy or new host is ever added.

---

## Phase 0 — Reconnaissance summary

| Dimension | Finding |
|---|---|
| **Framework** | None. Static HTML pages, hand-authored. **No** Next.js/React/Vue. |
| **Language** | Vanilla **JS ES modules** (`assets/js/*.js`, 14 files). **No** TypeScript, no transpile/bundler. |
| **Styling** | Vanilla CSS **design tokens** (`tokens.css`, OKLCH "Cobalto & Mauveína") + 25 component sheets in `assets/css/`. **No** Tailwind/Sass/shadcn. |
| **Build** | Custom Node scripts (`scripts/*.mjs`) run via **`npx`**. `package.json` has **zero deps/devDeps**. |
| **Hosting** | **GitHub Pages** (static; `.nojekyll` present). No server runtime, **no custom HTTP headers**. |
| **Rendering** | 100% static HTML — already crawl-ideal. No SSR/SSG/ISR/RSC concepts apply. |
| **Locale** | **es-AR**, monolingual (`<html lang="es-AR">`, `og:locale=es_AR`). **hreflang N/A.** |
| **Animation** | CSS (`motion.css`) + JS `matchMedia` guards. **No framer-motion.** `prefers-reduced-motion` already honored in 30+ places. |
| **Config** | `site.config.mjs` (`BASE_URL`), `site.webmanifest`. No `next.config`/`tsconfig`/`tailwind.config`/`middleware`. |
| **CI** | **None.** No `.github/workflows/`. |

### Routes / pages
`index.html`, `404.html` (`noindex,follow`), `pages/{contacto,sobre-achetiq,gabinetes,recursos}.html`,
`pages/gabinetes/{cursos-y-conferencias,eventos,prensa-y-difusion,solidario}.html`,
`pages/recursos/{apuntes,seguimiento}.html`. Template: `partials/_boilerplate.html`.
Content is injected client-side from `data/*.json` by `assets/js/loaders.js`.

### Build & measurement scripts already in the repo (reuse these)
- `scripts/build-urls.mjs` — injects `BASE_URL` into og/twitter meta across all pages. **Pattern to extend for canonical, robots, sitemap.**
- `scripts/build-css.mjs` — bundles the `@import` chain into `assets/css/main.bundle.css` (~110 KB, render-blocking).
- `scripts/perf-matrix.mjs` — **Lighthouse via npx** (mobile + desktop) on 4 reference pages; emits a Markdown LCP/CLS/TBT/FCP/transfer table. Needs `CHROME_PATH`.
- `scripts/shoot.mjs` — **Playwright chromium** screenshots + region heights (CLS verification). Reuse its Playwright setup for `@axe-core/playwright`.
- Existing budget doc: `RENDIMIENTO_Presupuesto.md`.

### Verified gaps (the real optimization targets)
- **SEO:** no canonical tags, no JSON-LD, **no `robots.txt`, no `sitemap.xml`** anywhere.
- **Perf:** single ~110 KB render-blocking CSS bundle; large JS modules (`seguimiento.js` ~60 KB); no enforced byte budget.
- **Security:** Pages cannot set HTTP headers; only `<meta http-equiv>` CSP works (and not for HSTS/frame-ancestors). `innerHTML` is used **only** with static SVG/`<template>` (safe); `safeHref()` blocks `javascript:`/`data:`; one Google Maps `<iframe>` on `contacto.html`; no `.env`, no auth, no analytics.
- **A11y:** already strong (skip links, `focus.css` `:focus-visible`, ARIA on custom widgets). Work = *verify and close residual gaps*, not rebuild.
- **CI:** none — regressions are currently undetectable.

### Pillar guidance dropped as inapplicable (and its stack-true replacement)
| Brief assumed (Next.js) | Replaced with (this repo) |
|---|---|
| Metadata API per route | `<meta>`/`<title>` audit + `build-urls.mjs`-style injection |
| `next/image`, `sizes`/`priority` | Audit existing raw `<img>` WebP/srcset/`fetchpriority` |
| `next/font` | Existing self-hosted WOFF2 + `font-display:swap` + fallback metrics |
| `next/dynamic`, RSC boundary | Conditional/lazy ES-module loading; CSS critical-path split |
| `@next/bundle-analyzer` | Measure CSS bundle + per-module JS byte weights |
| framer-motion `prefers-reduced-motion` | `motion.css` + JS `matchMedia` audit |
| shadcn/ui a11y | Custom widgets: `navbar.js`, `sobre-achetiq.js`, `countdown-recursos.js`, `easter-egg.js`, `seguimiento.js` |
| `next.config`/middleware headers | `<meta http-equiv>` CSP + portable `_headers` config |
| hreflang/i18n | N/A — monolingual es-AR (stated explicitly) |

---

## Execution order

1. **`05-baseline-audit.md`** — capture pre-change metrics for all four pillars. **Run first; nothing else proceeds without a baseline.**
2. **`01-seo.md`** — highest impact / lowest effort (pure additions: robots, sitemap, canonical, JSON-LD).
3. **`04-security.md`** — CSP meta + portable headers + audits; mostly additive, low regression risk.
4. **`02-accessibility.md`** — verify + close gaps on real widgets.
5. **`03-performance.md`** — highest effort (critical-CSS, JS trimming); do after a11y so DOM/markup is stable.
6. **`06-ci-integration.md`** — wire LHCI + axe + audits into GitHub Actions to lock in the gains. **Run last.**

## Prioritization matrix (impact × effort)

| Item | Impact | Effort | Priority |
|---|---|---|---|
| `robots.txt` + `sitemap.xml` generation | High | Low | **P0** |
| Canonical link tags (per page) | High | Low | **P0** |
| JSON-LD `EducationalOrganization`/`Organization` | High | Low | **P0** |
| `<meta http-equiv>` CSP + portable header config | High | Low–Med | **P0** |
| CI workflow (LHCI + axe + audit) | High | Med | **P1** |
| Heading hierarchy + `alt` audit | Med | Low | **P1** |
| Keyboard/focus pass on custom widgets | Med | Med | **P1** |
| Critical-CSS extraction / unused-rule pruning | High | High | **P2** |
| JS module trimming / lazy-loading (`seguimiento.js`) | Med | High | **P2** |
| Contrast re-verification vs OKLCH tokens | Med | Low | **P2** |
| SRI + iframe hardening | Low–Med | Low | **P2** |

---

## Shared glossary of targets

- **LCP** (Largest Contentful Paint) — target **< 2.5 s** (mobile, lab).
- **INP** (Interaction to Next Paint) — target **< 200 ms**.
- **CLS** (Cumulative Layout Shift) — target **< 0.1**.
- **Lighthouse category scores** — **≥ 95** for Performance (mobile), SEO, Accessibility, Best Practices.
- **WCAG 2.2 Level AA** — the binding accessibility standard; cite specific Success Criteria (e.g. 1.4.3 Contrast, 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured, 2.5.8 Target Size).
- **axe** — zero **critical** and zero **serious** violations.
- **Contrast** — **≥ 4.5:1** body text, **≥ 3:1** large text (≥ 24px or ≥ 18.66px bold) and UI components.
- **OWASP Top 10 (2021)** — A01 Broken Access Control … A05 Security Misconfiguration … A06 Vulnerable Components … used as the security lens.
- **JS/CSS byte budget** — defined in `03-performance.md`, enforced in `06-ci-integration.md`; reconcile with `RENDIMIENTO_Presupuesto.md`.
- **`BASE_URL`** — single source of truth in `site.config.mjs` (build site `https://ingqcautnfrre-lab.github.io/achetiq-lab`; official site `https://achetiq.github.io`). Never hard-code an origin; read this.

## The files

- [`00-index.md`](./00-index.md) — this file.
- [`01-seo.md`](./01-seo.md) — SEO & structured data.
- [`02-accessibility.md`](./02-accessibility.md) — WCAG 2.2 AA.
- [`03-performance.md`](./03-performance.md) — Core Web Vitals & budgets.
- [`04-security.md`](./04-security.md) — OWASP & headers (Pages-aware).
- [`05-baseline-audit.md`](./05-baseline-audit.md) — pre-change metrics.
- [`06-ci-integration.md`](./06-ci-integration.md) — GitHub Actions regression gates.

## How to run a prompt

1. Ensure the baseline (`05`) exists for the pillar you're touching.
2. Open the pillar file, copy its body into Claude Code at the repo root.
3. Let it run the **Measure → Diagnose → Implement → Verify → Document** loop.
4. Review the small, atomic commits and the before/after metric delta it reports.
