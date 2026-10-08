# AChETIQ — Sitio Web Oficial

Repositorio del sitio web de la **Asociación Chaqueña de Estudiantes Tecnológicos de Ingeniería Química (AChETIQ)**.

## Estado del Proyecto

| Fase | Descripción | Estado |
|------|-------------|--------|
| Fase 0 | Planificación y arquitectura de información | ✅ Completada (2026-05-08) |
| Fase 1 | Diseño visual (identidad, paleta, tipografía, componentes, wireframes) | ✅ Completada (2026-05-08) |
| Fase 2 | Desarrollo front-end | 🔲 Listo para iniciar |
| Fase 3 | Contenido académico y recursos | 🔲 Pendiente |
| Fase 4 | Despliegue en GitHub Pages | 🔲 Pendiente |
| Fase 5 | SEO, accesibilidad y seguridad | 🔲 Pendiente |
| Fase 6 | Mantenimiento y actualizaciones colaborativas | 🔲 Pendiente |

### Avance de Fase 1

| Entregable | Estado |
|---|---|
| Paleta de colores (Océano & Areia) | ✅ Definida |
| Tipografía (Instrument Serif / Geist / Geist Mono) | ✅ Definida |
| Sistema de design tokens (`tokens.css`) | ✅ Implementado |
| Análisis del logo (`content/analisis_logo.md`) | ✅ Verificado contra SVG |
| Logo SVG (`assets/img/logo/achetiq-logo.svg`) | ✅ Recibido (2026-05-08) |
| Catálogo de componentes (`docs/FASE_1_Catalogo_Componentes.md`) | ✅ Definido |
| Wireframes (`docs/FASE_1_Wireframes.md`) — 5 páginas + 2 plantillas | ✅ Definidos |
| Favicon | 🔲 Pendiente menor (no bloqueante) |

## Estructura del Repositorio

Ver `docs/FASE_0_Arquitectura.md` para la documentación completa de la arquitectura de información.

## URL base y metadatos sociales

El dominio del sitio está centralizado en **`site.config.mjs`** (`BASE_URL`),
única fuente de verdad para los metadatos sociales (`og:url`, `og:image`,
`twitter:image`). El sitio es estático y se sirve tal cual desde GitHub Pages,
por lo que esas URLs viven resueltas en el HTML (los scrapers sociales no
ejecutan JavaScript).

Para regenerarlas tras cambiar el dominio:

```bash
npm run build:urls
```

El script `scripts/build-urls.mjs` (sin dependencias) reescribe esas etiquetas
en `index.html`, `404.html` y `pages/**`, derivando cada `og:url` de la ruta del
archivo. Es idempotente: ejecutarlo sin cambiar `BASE_URL` no modifica nada.

**Publicar en el sitio oficial:** este repositorio es el sitio de construcción
(`https://ingqcautnfrre-lab.github.io/achetiq-lab`). El sitio oficial se publica
en **`https://achetiq.github.io`** (GitHub Pages de la organización AChETIQ). Para
generar los archivos del sitio oficial, fijar
`BASE_URL = "https://achetiq.github.io"` en `site.config.mjs`, ejecutar
`npm run build` y cargar el HTML regenerado en el repositorio oficial.

## Contribuir

Consultar `CONTRIBUTING.md` para las guías de contribución al proyecto.
