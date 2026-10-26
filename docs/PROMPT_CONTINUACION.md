# PROMPT DE CONTINUACIÓN — Nuevo chat AChETIQ Web

> Generado: 2026-05-28 · **Fase 3 (desarrollo front-end) CERRADA.** Repositorio versionado y limpio. Próximo: Fase 4 (contenido académico y herramientas interactivas) según `PLAN_MAESTRO_FASES_3-7.md`.

---

# CONTEXTO DEL PROYECTO — Sitio Web AChETIQ

Soy Lautaro R. Zalazar, estudiante de Ingeniería Química en UTN FRRe y Protesorero de AChETIQ. Estamos desarrollando el sitio web oficial de la asociación migrándolo desde Wix a GitHub Pages.

## INSTRUCCIÓN MAESTRA — Lectura obligatoria antes de responder

1. `INSTRUCCION_PROYECTO.md` — contexto, stack, identidad visual, convenciones y metodología (Secciones 5 y 10 vinculantes).
2. Memoria del proyecto (referenciada en `MEMORY.md` del espacio de trabajo).
3. `FASE_1_Wireframes.md` — estado actualizado (Secciones 2–5 reescritas y cerradas).
4. `FASE_1_Catalogo_Componentes.md` — catálogo de componentes UI.

## ESTADO EXACTO DEL TRABAJO (al cierre de sesión 2026-05-14)

- **Fase 2 (desarrollo front-end):** aún no iniciada.
- **Páginas cerradas:** Inicio ✅ · Sobre AChETIQ ✅ · Gabinetes ✅ · Recursos Académicos ✅ · Contacto ✅
- **Revisión de wireframes de v1.0: COMPLETA.** Las 5 páginas prioritarias tienen wireframe cerrado en `FASE_1_Wireframes.md`.
- **Pendientes separados:** plantillas `pages/gabinete.html` y `pages/recurso.html` (sesión separada)
- **Siguiente etapa:** Fase 2 — desarrollo front-end (o cierre de plantillas de detalle, si se priorizan)

## COMPOSICIÓN FINAL DE CONTACTO (referencia rápida)

| # | Bloque | Estado |
|---|---|---|
| 1 | page-header | 🔲 ATB — skeleton válido para Fase 2 |
| 2 | Información de contacto directa (.contact-grid, 4 tarjetas) | ✅ email + instagram + LinkedIn (próx) + dirección |
| 3 | Mapa (iframe Google Maps, lazy-load) | ✅ incluido |

**Decisiones clave de Contacto:**
- Sin formulario de envío. Solo canales directos.
- Solo se renderizan tarjetas con valor no-null en `data/redes.json`. En v1.0: email e Instagram.
- LinkedIn: `null` en JSON → tarjeta visible, atenuada, badge "Próximamente", sin link activo.
- `direccion_facultad` se toma del campo ya existente en `data/redes.json`.
- Todos los links externos: `target="_blank" rel="noopener noreferrer"`.
- Referencia eliminada: `contacto.html?asunto=...` (no aplica sin formulario).

## COMPOSICIÓN FINAL DE RECURSOS ACADÉMICOS (referencia rápida)

| # | Bloque | Estado |
|---|---|---|
| 1 | page-header | 🔲 ATB — skeleton válido para Fase 2 |
| 2 | Recursos de referencia (2 col) | ✅ Diseño Curricular + Planilla de Seguimiento |
| 3 | Filtros por año | ✅ .pill-nav, Todos + 1°–5° año, oculta/muestra por año |
| 4 | Grid de materias | ✅ 41 materias Plan 2023, imagen + nombre, card clickeable |
| 5 | CTA aportar material | ✅ fondo --color-primary, mailto: con asunto prefijado |

## ARCHIVOS ACTUALIZADOS EN ESTA SESIÓN (2026-05-14)

- `FASE_1_Wireframes.md` — Sección 1 (Inicio) reescrita. Sección 5 (Contacto) reescrita. Referencias a formulario y D7 eliminadas.

## ARCHIVOS ACTUALIZADOS EN SESIÓN ANTERIOR (2026-05-13)

- `FASE_1_Wireframes.md` — Secciones 2, 3 y 4 reescritas.
- `data/documentos.json` — creado.
- `data/directiva.json` — campo subgrupo y orden actualizados.
- `data/gabinetes.json` — orden editorial actualizado.
- `data/recursos.json` — creado con 41 materias del Plan 2023 (campos: id, nombre, anio).

## DATOS CLAVE DE RECURSOS ACADÉMICOS

- Diseño Curricular: `docs/Disenio_Curricular_IQ.pdf` · 2.1 MB · Plan 2023 ✓
- Planilla de Seguimiento: https://drive.google.com/drive/folders/1p5m6S9I8v44XcMj8MtCTO8DoxY3ezz_J · nueva pestaña
- Email aporte material: achetiq.resistencia+apuntes@aneiqa.org · asunto: "Envío de material académico"
- Colores placeholder por año para `.card-materia`: pendiente de definir en Fase 2

## PENDIENTES DE CATÁLOGO (Fase 1 menor)

- `.card--valor`, `.card-documento`, `.card-integrante`, `.card-materia` — variantes de `.card-base`.
- `.contact-card` — tarjeta de canal de contacto con ícono Lucide, eyebrow, valor y estado "Próximamente".
- `.kpi-strip` — strip de 4 indicadores institucionales estáticos.
- `.gallery-events` — sección de galería por evento (título + descripción + grid de fotos).
- `.timeline` — componente de línea de tiempo con entrada ghost.
- `data/site_copy.json` — alta de claves `mision_vision`, `valores` y `hero_lead`.
- `data/galeria.json` — a crear cuando estén disponibles fotos y descripciones de los 4 eventos.

## PENDIENTES RECURRENTES DEL SITIO

- ~~Comprimir `docs/Estatuto.pdf` (6.7 MB)~~ — **RESUELTO 2026-05-20** (nuevo peso 3.12 MB; reducción del 55.1%; 19 páginas conservadas; `data/documentos.json` actualizado con `tamano_kb: 3045`).
- ~~Logos UTN FRRe y ANEIQA con fondo transparente~~ — **RESUELTO 2026-05-20** (`assets/img/institucional/utn-frre-logo.svg` y `assets/img/institucional/aneiqa-logo.svg`). Bloqueo del Bloque 5 de Sobre AChETIQ levantado. Pendiente menor (no bloqueante): optimización post-despliegue de los SVG vectorizados.
- ⚠ Valores institucionales pendientes de aprobación por comisión directiva.
- ⚠ Selección de íconos Lucide para cada hito de la timeline (data ya completa 2003–2026 en `data/historia.json`) y verificar disponibilidad de `telescope` / `heart-handshake`.
- ⚠ Fotos y descripciones de los 4 eventos de la galería (2 congresos IQ 2024/2025 + 2 actividades a definir).
- ⚠ Texto `hero_lead` y prose de Misión institucional — pendientes de redacción por directiva.
- Fotos de integrantes de la comisión directiva.
- Imágenes representativas por materia (directiva); placeholder por color de año en v1.0.
- ~~Favicon~~ — **RESUELTO 2026-05-20** (`favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` en raíz). Pendientes: dominio, usuario GitHub de organización.
- LinkedIn de AChETIQ (pendiente — tarjeta "Próximamente" en Contacto hasta que esté disponible).
- ~~Extender timeline histórica 2003–2013 hasta 2026~~ — **RESUELTO 2026-05-19** (`data/historia.json` con 14 hitos 2003–2026).

## METODOLOGÍA (10 reglas — resumen)

1. Preguntar antes de decidir — opciones etiquetadas con implicancias y recomendación.
2. Estructura antes que contenido — Ronda 1 luego Ronda 2; nunca mezclar.
3. Sección por sección — prohibido producir documentos extensos unilateralmente.
4. Verificar el repositorio antes de proponer.
5. Marcar incertidumbres — nunca inventar datos institucionales.
6. Consolidar decisiones en tablas.
7. Acumular cambios y aplicar al cierre de cada página.
8. Mantener la memoria del proyecto actualizada.
9. Reconocer errores de forma directa con remediaciones concretas.
10. Tono formal académico. Voseo en CTAs. Sin exclamaciones ni emojis.

---

## SESIÓN 2026-05-20 — Componentes front-end anticipados (integraciones externas)

> Se integraron tres componentes provistos por el usuario (originalmente en React/shadcn/TS). Por coherencia de stack se reescribieron a **HTML/CSS/JS vanilla con `tokens.css`** (ver memoria `feedback_stack_vanilla.md`). Son adelantos de Fase 2; el resto de Fase 2 sigue sin iniciarse formalmente.

**Importante:** los archivos están guardados en la carpeta local del proyecto, pero **no fueron commiteados ni publicados en GitHub**. La publicación queda a cargo del usuario.

### 1. Cuenta regresiva — Recursos Académicos
- **Propósito:** habilitar la sección de Recursos 20 días después del lanzamiento; hasta entonces muestra un contador.
- **Archivos:** `partials/countdown-recursos.html`, `assets/css/countdown-recursos.css`, `assets/js/countdown-recursos.js`.
- **Decisiones:** fecha objetivo por atributo `data-target-date` (ISO 8601, se fija el día del lanzamiento); al expirar oculta el contador y **revela automáticamente** el contenido de `[data-countdown-revealed]` (evento `countdown:revealed`); **sin botones**; unidades Días/Horas/Minutos/Segundos; dígitos en `--color-primary`.
- **Pendiente:** fijar fecha real de apertura (placeholder `2026-06-09`) y nombre del include de contenido a revelar (placeholder `recursos-grid.html`).

### 2. Spinner loader global — "Bouncing Dots"
- **Estado:** especificación canónica guardada en memoria (`achetiq_spinner_loader.md`); **no implementada en código** aún (a ejecutar en Fase 2).
- **Decisiones:** puntos en `--color-primary`; documentadas **ambas variantes** (inline reutilizable + overlay de pantalla completa); 3 puntos por defecto, rebote 0.6 s, desfase 0.2 s; animación 100% CSS, sin dependencias.

### 3. Página de error 404
- **Archivos:** `404.html` (raíz, `permalink: /404.html`; GitHub Pages la sirve automáticamente) y `assets/css/error-404.css`.
- **Decisiones:** **un solo botón** primario "Volver al inicio" (`/`); ilustración de fantasma con imagen externa original + **fallback** automático a SVG Lucide en `--color-primary` si el host de terceros no responde; copy amistoso sin exclamaciones; dígitos en Instrument Serif sobre `--color-primary`; rutas con filtro `relative_url`.
- **Encabezado/pie:** se decidió (2026-05-20) **mantener el 404 como pantalla limpia por ahora**; navbar y footer se agregarán en Fase 2, una vez construidos esos `_includes`.

### Pendientes abiertos de la sesión
- 404 con navbar + footer: pospuesto a Fase 2 (cuando existan esos includes).
- Definir fecha de apertura de Recursos y el include de contenido a revelar.
- Implementar el spinner en código cuando arranque Fase 2.

---

## SESIÓN 2026-05-27 — Implementación de `pages/contacto.html`

> Construcción front-end de la página de Contacto siguiendo el wireframe §5 y el componente `.contact-card` (§4.10).

### Decisión sobre el formulario de envío

Antes de implementar se reabrió la discusión, dado que GitHub Pages no procesa envíos del lado del servidor. Se evaluaron tres caminos:

| Opción | Experiencia del visitante | Costos / dependencias |
|---|---|---|
| (a) Servicio externo (Formspree, FormSubmit, Web3Forms y similares) | Formulario embebido; envía y recibe confirmación sin abandonar la página; funciona aunque no haya cliente de correo configurado. | Crear cuenta y verificar dominio; dependencia operativa de un tercero; cuotas y branding en planes gratuitos; el sitio deja de ser 100 % independiente. |
| (b) `mailto:` con asunto prefijado | Bot­ón que abre el cliente de correo del visitante con `Para`/`Asunto` ya cargados. | Cero dependencias. Riesgo: en mobile y entornos sin cliente de correo configurado el clic puede no hacer nada visible. |
| (c) Solo canales de contacto (sin formulario) | Tarjetas de Email, Instagram, LinkedIn (Próximamente) y Dirección; el visitante elige el canal preferido. | Cero. Coincide con la decisión ya cerrada en wireframe §5 y catálogo §6.1 ("form diferido a v1.1+"). |

**Decisión ratificada (2026-05-27): opción (c) — solo canales, sin formulario.**

- Mantiene la coherencia con la decisión del 2026-05-14 registrada en `FASE_1_Wireframes.md §5` y `FASE_1_Catalogo_Componentes.md §6.1`.
- Cero dependencias de terceros y cero cuentas que mantener; consistente con el resto del stack vanilla.
- El componente `.form` queda diferido a v1.1+; se reactivará el día que se decida sumar captura, evaluando nuevamente las opciones (a)/(b) con datos de uso reales.

### Bloques implementados

| # | Bloque | Estado |
|---|---|---|
| 3 | `page-header` (eyebrow "Comunicación", h1 "Escribinos a *AChETIQ*", lead) | ✅ |
| 4 | Canales directos: grid `.grid-cards--4` + `.contact-grid` con `.contact-card` renderizadas desde `data/redes.json` vía `data-loader="redes"` (renderer local registrado en la página) | ✅ |
| 5 | Mapa: `<figure>` con iframe liviano de Google Maps (`?q=…&output=embed`, `loading="lazy"`, sin API key) + figcaption con dirección textual y link "Abrir en Google Maps" en nueva pestaña | ✅ |

### Reglas de renderizado de `data-loader="redes"`

- `email`, `instagram`, `facebook`, `whatsapp`, `youtube`, `twitter`: tarjeta activa solo si el valor en `data/redes.json` es no nulo (en v1.0 se renderizan email e Instagram).
- `linkedin`: caso especial — tarjeta "Próximamente" mientras sea `null`; pasa automáticamente a activa cuando deje de serlo.
- Dirección: tarjeta estática alimentada por `direccion_facultad` y `web_facultad` (link a la web de la FRRe en nueva pestaña). Si `web_facultad` faltara, la tarjeta degrada a placeholder no interactivo en lugar de romper la grilla.
- Todos los enlaces externos llevan `target="_blank" rel="noopener noreferrer"`. Los `href` pasan por `safeHref()` (rechaza `javascript:`, `data:`, etc.).

### Nota técnica

`loaders.js` no registra renderer por defecto para `redes` (lo usa `footer.js` internamente). La página define el renderer en un módulo inline propio, importando `registerLoader`, `createElement` y `safeHref` desde `assets/js/loaders.js` y registrándolo antes de la carga de `main.js`, según el patrón documentado en el encabezado de `loaders.js`. Los íconos (Lucide `mail`, `instagram`, `linkedin`, `map-pin`) se construyen como SVG inline con `aria-hidden="true"`.

### Archivo actualizado

- `pages/contacto.html` — creado.

---

## SESIÓN 2026-05-22 — Reconciliación de la estructura de directorios

> El repositorio conservaba andamiaje residual de tipo Jekyll que contradecía el
> stack vanilla definitivo (`INSTRUCCION_PROYECTO.md §2`). Se reconcilió la
> estructura a un árbol vanilla puro, preservando los componentes de Fase 2 ya
> anticipados.

### Inventario de carpetas Jekyll
- De las cinco carpetas Jekyll posibles (`_includes/`, `_layouts/`, `_collections/`, `_data/`, `_posts/`), **solo existía `_includes/`**; las otras cuatro nunca se crearon.
- `_includes/` contenía un único archivo útil: `countdown-recursos.html` (cuenta regresiva de Recursos), escrito con sintaxis Liquid.

### Cambios aplicados
- **Migración del countdown:** `_includes/countdown-recursos.html` → `partials/countdown-recursos.html`. Se convirtió la sintaxis Liquid a HTML vanilla: `{%- comment -%}` → comentarios HTML; `data-target-date` fijado al placeholder `2026-06-09T00:00:00-03:00`; se eliminó el bloque `{% include %}` (el slot `[data-countdown-revealed]` queda vacío, a poblar en Fase 2); encabezado de uso reescrito para inyección vía `fetch()`. El CSS y el JS ya eran vanilla y no se movieron.
- **Consolidación de imágenes:** `img/logo/` e `img/institucional/` → `assets/img/`. La carpeta `img/` de la raíz se eliminó. Se actualizó la ruta funcional en `data/instituciones.json` y se barrieron las referencias `img/` en la documentación (FASE_0, FASE_1_Wireframes, FASE_1_Catalogo_Componentes, README, INVENTARIO, INSTRUCCION_PROYECTO, `content/analisis_logo.md`, PROMPT_CONTINUACION, PLAN_MAESTRO L192/L308). No se tocó el prompt citado en PLAN_MAESTRO L105 (registro literal de esta consigna).
- **Carpetas de detalle:** se crearon `pages/gabinetes/` y `pages/recursos/` (con `.gitkeep`); las plantillas se desarrollarán en sesión separada.
- **Eliminación de Jekyll:** se borró `_includes/` (vacío tras la migración).
- **Documentación:** `FASE_0_Arquitectura.md §5` reescrito con el árbol vanilla reconciliado, con nota de reconciliación fechada.

### Pendiente abierto / a confirmar por la directiva
- ⚠ Contradicción a resolver: `INSTRUCCION_PROYECTO.md §4.2` define las plantillas de detalle como archivos únicos con query param (`pages/gabinete.html?id=<slug>`), mientras que la estructura adoptada usa carpetas `pages/gabinetes/` y `pages/recursos/`. Conviene alinear ambos documentos al cerrar las plantillas de detalle.

---

## SESIÓN 2026-05-28 — Cierre formal de Fase 3 (P3.15)

> Fase 3 (desarrollo front-end) cerrada. El sitio está construido íntegro en HTML/CSS/JS vanilla; lo que resta para publicación es contenido sustantivo (Fase 4) y despliegue (Fase 5). Se ejecutó la revisión de calidad del código, se reconcilió la estructura documental y se versionó el cierre.

### Estado del repositorio al cierre

**Páginas construidas (10 archivos HTML):**

| Ruta | Estado |
|---|---|
| `index.html` | ✅ Inicio (hero, presentación, KPI strip, gabinetes vía loader, CTA) |
| `404.html` | ✅ Página de error con fantasma Lucide + atajos |
| `pages/sobre-achetiq.html` | ✅ Page-header · timeline (`data/historia.json`) · misión/visión · valores (provisional) · instituciones · documentos · CTA |
| `pages/gabinetes.html` | ✅ Hub con grid de 4 gabinetes y bloque de comisión directiva |
| `pages/gabinetes/cursos-y-conferencias.html` · `eventos.html` · `prensa-y-difusion.html` · `solidario.html` | ✅ Cuatro páginas hijas con CTA estándar y emails de gabinete |
| `pages/recursos.html` | ✅ Hub con cuenta regresiva + accesos a apuntes/seguimiento |
| `pages/recursos/apuntes.html` | ✅ Pill-nav por año + grid de 41 materias en estado «Sin apuntes aún» |
| `pages/recursos/seguimiento.html` | ✅ Andamiaje con estado «En preparación» (lógica diferida a Fase 4) |
| `pages/contacto.html` | ✅ Canales directos + mapa de Google Maps embebido |

**Partials inyectables (`partials/`):** `_boilerplate.html` (referencia), `navbar.html`, `footer.html`, `countdown-recursos.html`.

**Hojas de estilo (`assets/css/`):** `main.css` (entry point, importa el resto), `navbar.css`, `footer.css`, `loader.css`, `headers.css`, `text.css`, `cards.css`, `lists.css`, `forms.css`, `nav-secondary.css`, `states.css`, `figure.css`, `cta.css`, `countdown-recursos.css`, `error-404.css`. 15 hojas, todas en BEM y sin hex ni nombres de fuente literales.

**Módulos JS (`assets/js/`, módulos ES nativos sin transpilación):** `loader.js` (define `window.AChETIQBase` + overlay global), `main.js` (motor del patrón `data-loader`), `loaders.js` (registro de renderers + 6 renderers por defecto: `gabinetes`, `recursos`, `directiva`, `historia`, `documentos`, `instituciones`), `navbar.js`, `footer.js`, `countdown-recursos.js`, `apuntes.js` (override de `recursos` con filtro por año), `gabinete-detalle.js` (override de `gabinetes` para páginas hijas).

**Datos (`data/`):** 8 JSON — `directiva.json`, `gabinetes.json`, `recursos.json` (41 materias), `documentos.json`, `historia.json` (14 hitos 2003–2026), `instituciones.json`, `redes.json`, `navbar.json`.

### Decisiones técnicas y editoriales tomadas durante Fase 3

1. **Formulario de contacto: NO se implementa (Decisión 2026-05-27).** La página de Contacto cierra v1.0 sin `<form>`; ofrece solo canales directos (email, Instagram, LinkedIn «Próximamente», dirección con mapa embebido). Se evaluaron servicio externo (Formspree/etc.), `mailto:` y «solo canales»; se eligió la tercera para mantener el sitio sin dependencias de terceros. El componente `.form` queda diferido a v1.1+ y se reabrirá con datos de uso reales.
2. **Subpáginas en lugar de plantilla con `?id=` (Decisión 2026-05-16, ratificada por estructura).** Gabinetes y subsecciones de Recursos se resolvieron con un archivo HTML por hijo (`pages/gabinetes/<slug>.html`, `pages/recursos/<sub-seccion>.html`). Contradice la prescripción original de `INSTRUCCION_PROYECTO.md §4.2`; convendría alinear ambos documentos al cerrar la vista individual de materia en Fase 4 (P4.6).
3. **CTA final como componente compartido (`assets/css/cta.css`).** El cierre con fondo `--color-primary` y botones invertidos se formalizó como `.cta-final` reutilizable; las páginas no redefinen este bloque.
4. **`color-mix()` para tintas con alfa.** Toda mezcla de color con transparencia (sombras, overlays, badges, glows decorativos) se expresa con `color-mix(in srgb|oklab, var(--token) N%, transparent)`. Las únicas instancias `rgba()` hardcodeadas que quedaban (navbar.css overlay/sombra, countdown shadow fallback) se migraron a `color-mix` durante P3.15.
5. **Rutas relativas + `AChETIQBase` runtime.** Toda URL interna se calcula a partir del `src` real del propio `loader.js`. Esto hace que el sitio sirva por igual desde la raíz del dominio (sitio oficial `https://achetiq.github.io/`), un subpath de GitHub Pages (`https://<org>.github.io/<repo>/`) o file://.
6. **`.nojekyll` en raíz.** GitHub Pages servirá el sitio sin pasarlo por Jekyll, de modo que los nombres con prefijo `_` (si los hubiera) no se filtren.

### Revisión de calidad de código aplicada en P3.15

- **BEM consistente:** todas las hojas exponen bloques `.bloque`, elementos `.bloque__elemento` y modificadores `.bloque--modificador` o `.bloque__elemento--modificador`. No hay anidamientos `.bloque__a__b` ni colisión de nombres entre componentes.
- **Tokens exclusivos:** búsqueda exhaustiva de hex (`#…`) en `assets/css/*.css` → 0 resultados. Todas las familias tipográficas referencian `var(--font-display|body|mono)`. El único hex literal del repositorio es el `<meta name="theme-color" content="#0D3B66">` requerido por el spec HTML (no admite `var()`), documentado con un comentario en el boilerplate como espejo de `--color-primary`.
- **`color-mix` en lugar de `rgba()` hardcodeada:** se migraron las 5 instancias residuales (`navbar.css` x3, `countdown-recursos.css` x2) que referenciaban el ink en RGB literal.
- **Sanitización en renders:** `loaders.js` impone `textContent` + `setAttribute` para todo dato proveniente de JSON; `safeHref()` rechaza esquemas `javascript:`, `data:` y similares. Los usos de `innerHTML` que quedan están restringidos a strings constantes de SVG (icon paths) y a la inserción de partials fetcheados desde same-origin (navbar/footer), nunca a datos.
- **Comentarios:** cada archivo CSS y JS abre con un bloque de cabecera (versión, fase, fundamento, decisiones); los bloques internos comentan invariantes no obvios (contrastes WCAG verificados, fallbacks de `backdrop-filter`, excepción `.safe-motion` al reset de reduced-motion, etc.).

**Pendiente menor reportado (no bloqueante, requiere decisión):** `tokens.css` no expone tokens `--shadow-*` ni un token de overlay. Actualmente las sombras del navbar y del countdown viven como custom properties locales (`--navbar-shadow-md`) o como fallback dentro de `var(--shadow-lg, …)`. Cuando se quieran unificar, conviene introducir `--shadow-xs|sm|md|lg` y `--color-overlay` en `tokens.css` (decisión del sistema de tokens, propia de Fase 1 — se difiere hasta tener más usos del patrón).

### Pendientes que bloquean la publicación (pasan a Fase 4 / Fase 5)

**Pendientes de contenido (Fase 4 — `PLAN_MAESTRO_FASES_3-7.md` §P4.*)**

- **P4.3 + P4.4 + P4.5** — Extracción, especificación e implementación de la planilla de seguimiento de carrera (`pages/recursos/seguimiento.html`). Requiere que la directiva entregue la planilla Excel actual.
- **P4.6** — Definir el modelo de la vista individual de materia (la decisión de query param vs subpágina debe alinearse con `INSTRUCCION_PROYECTO.md §4.2`).
- **P4.7** — Redacción y aprobación de contenido institucional pendiente:
  - Texto `hero_lead` y prosa de Misión institucional.
  - Descripciones definitivas de Valores institucionales (las actuales están marcadas como provisionales).
  - Íconos Lucide por hito de la timeline (incluida verificación de disponibilidad de `telescope` y `heart-handshake`).
  - 4 KPI institucionales del strip de Inicio (cifras a confirmar por la directiva).
- **P4.9** — Revisión editorial final.

**Pendientes de activos (a recopilar)**

- Fotos de la comisión directiva (los registros en `data/directiva.json` traen `foto: null`; el render usa el placeholder de iniciales).
- Fotos y descripciones de los 4 eventos para la galería (`data/galeria.json` por crear).
- Imágenes representativas por materia (la v1.0 usa color placeholder por año).

**Pendientes de Fase 5 (despliegue)**

- ~~Dominio personalizado~~ → resuelto: el sitio oficial es `https://achetiq.github.io` (GitHub Pages de la organización).
- Nombre de usuario / organización de GitHub para AChETIQ.
- LinkedIn institucional (mientras tanto la tarjeta queda como «Próximamente»).

**Pendientes de Fase 6 (SEO, accesibilidad y seguridad)**

- Auditoría Lighthouse de cierre con métricas objetivo.
- Sitemap.xml y robots.txt.
- `og:image` y `twitter:image` definitivos (hoy usan `icon-512.png` como espejo).
- Optimización post-despliegue de los SVG vectorizados de instituciones.

### Archivos actualizados en esta sesión (2026-05-28)

- `assets/css/navbar.css` — `rgba(19, 17, 15, …)` → `color-mix(in srgb, var(--color-ink) X%, transparent)` en sombra del dropdown y backdrop del overlay mobile.
- `assets/css/countdown-recursos.css` — misma migración para los fallback de `box-shadow`.
- `FASE_0_Arquitectura.md` — §5 reescrita reflejando el árbol real al cierre de Fase 3 (subpáginas en `pages/`, `assets/fonts/`, `data/navbar.json`, PWA icons en raíz, etc.).
- `PROMPT_CONTINUACION.md` — este archivo.

### Inconsistencia documental conocida (a decidir con el usuario)

`README.md` mantiene la tabla original de fases (Fase 2 = «Desarrollo front-end», Fase 3 = «Contenido académico», …) heredada de Fase 0. `PLAN_MAESTRO_FASES_3-7.md` introdujo una numeración revisada (Fase 3 = front-end ya cerrada, Fase 4 = contenido académico, Fase 5 = despliegue, Fase 6 = SEO/A11Y, Fase 7 = mantenimiento). Convendría alinear ambos al inicio de la próxima sesión: el README no se tocó en este cierre para no incrustar la decisión sin consulta.

---

## SESIÓN 2026-05-28 — Inicialización de Fase 4: baja editorial del Calendario Académico

> Decisión editorial al abrir Fase 4: el módulo de Calendario Académico queda **fuera del alcance del sitio**. El Instagram de la facultad ya cubre la comunicación de fechas clave (inicio/fin de cuatrimestre, semanas de finales, feriados académicos y eventos), por lo que duplicar ese flujo en la web no aporta valor y suma carga de mantenimiento.

### Alcance del recorte

- **Página eliminada:** `pages/recursos/calendario.html` (andamiaje «En preparación», sin lógica).
- **Hub `pages/recursos.html`:** se removió la tarjeta de Calendario académico; el grid pasa de `.grid-cards--3` a `.grid-cards--2` (Apuntes + Seguimiento); se ajustaron el lead del page-header y el título de la sección de acceso («Dos herramientas para tu *cursada*»); se actualizaron las meta-descriptions (`<meta name="description">`, `og:description`, `twitter:description`) para reflejar el alcance reducido.
- **Navbar (`data/navbar.json`):** se eliminó el ítem «Calendario académico» del submenú «Recursos Académicos».
- **Documentación:** `FASE_0_Arquitectura.md §5` (árbol de `pages/recursos/`) y este archivo se actualizaron en consecuencia.

### Impacto sobre Fase 4

- Se eliminan **P4.1 (especificación funcional del calendario)** y **P4.2 (implementación)** del backlog de Fase 4.
- El resto del backlog de Fase 4 (`P4.3`–`P4.9`) se mantiene sin cambios. La planilla de Seguimiento de carrera sigue siendo la única herramienta interactiva pendiente en Recursos Académicos.

### QA aplicado

- Búsqueda exhaustiva (`grep -rn`) sobre `*.html`, `*.json`, `*.js`, `*.css` para asegurar que ningún enlace interno apunte ya al archivo eliminado. La única referencia residual al texto «calendario» en el código vive en el comentario funcional del countdown (no es un link).
- `.grid-cards--2` ya existe en `assets/css/lists.css` (línea 41), por lo que el cambio de modificador no requiere CSS nuevo.

### Archivos actualizados en esta sesión

- `pages/recursos/calendario.html` — **eliminado**.
- `pages/recursos.html` — tarjeta de calendario removida; `grid-cards--3` → `grid-cards--2`; copys de lead, sección y meta-descriptions actualizados.
- `data/navbar.json` — ítem «Calendario académico» eliminado del submenú de Recursos.
- `FASE_0_Arquitectura.md` — árbol de `pages/recursos/` sin `calendario.html`.
- `PROMPT_CONTINUACION.md` — este registro.
