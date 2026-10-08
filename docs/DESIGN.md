---
name: AChETIQ
description: Sistema visual «Cobalto & Mauveína» — identidad instrumental de doble linaje químico para una asociación universitaria.
# IDENTIDAD CONGELADA. Las familias tipográficas y la paleta de abajo son la marca
# comprometida del proyecto: bien valoradas y ratificadas. NO se reemplazan en las
# sesiones de elevación P01–P22. Ver «Do's and Don'ts» y design-system/MASTER.md.
# Valores canónicos en OKLCH (doctrina declarada en tokens.css: «redeclaración OKLCH
# autoritativa»). tokens.css ofrece además el fallback hex sRGB exacto entre paréntesis.
colors:
  cobalto-marca: "oklch(0.420 0.165 262)"        # #1344A5 — --color-accent (azul de marca)
  cobalto-medio: "oklch(0.515 0.150 262)"        # #3463BC — --color-accent-soft
  cobalto-profundo: "oklch(0.300 0.110 262)"     # #0B2964 — --color-surface-inverse (pie)
  mauveina-accion: "oklch(0.500 0.190 322)"      # #922FA1 — --color-cta (magenta de acción)
  mauveina-texto: "oklch(0.440 0.175 322)"       # #7C228A — --color-cta-text
  grafito-porcelana: "oklch(0.967 0.005 265)"    # #F2F4F8 — --color-surface (fondo)
  grafito-porcelana-alta: "oklch(0.985 0.003 265)" # #F9FAFC — --color-surface-raised
  grafito-papel-hundido: "oklch(0.945 0.006 265)" # #EAEDF2 — --color-surface-sunken (plancha tonal, E01)
  cobalto-lavado: "oklch(0.965 0.012 262)"       # #EFF4FC — --color-surface-accent (realce frío derivado, E01)
  grafito-tinta: "oklch(0.205 0.018 265)"        # #131720 — --color-text
  grafito-tinta-secundaria: "oklch(0.404 0.018 265)" # #444953 — --color-text-soft
  grafito-tinta-terciaria: "oklch(0.486 0.017 265)"  # #5B5F69 — --color-text-faint
  grafito-borde: "oklch(0.862 0.011 265)"        # #CED2D9 — --color-border
  grafito-borde-suave: "oklch(0.918 0.008 265)"  # #E1E4E9 — --color-border-soft
  estado-positivo: "oklch(0.427 0.105 150)"      # #165E2E — --color-positive
  estado-negativo: "oklch(0.445 0.165 25)"       # #9B171F — --color-negative
  estado-alerta: "oklch(0.515 0.115 70)"         # #915900 — --color-warning
typography:
  display:
    fontFamily: "Fraunces, 'Fraunces Fallback', Georgia, 'Times New Roman', serif"
    fontSize: "clamp(2.5rem, 2.2065rem + 1.3043vw, 3.25rem)"   # --text-display (h1)
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.015em"
  display-xl:
    fontFamily: "Fraunces, 'Fraunces Fallback', Georgia, serif"
    fontSize: "clamp(2.5rem, 1.8886rem + 2.7174vw, 4.0625rem)" # --text-display-xl (hero)
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Fraunces, 'Fraunces Fallback', Georgia, serif"
    fontSize: "clamp(2.0625rem, 1.8668rem + 0.8696vw, 2.5625rem)" # --text-h2
    fontWeight: 400
    lineHeight: 1.3
  title:
    fontFamily: "'Hanken Grotesk', 'Hanken Grotesk Fallback', -apple-system, sans-serif"
    fontSize: "clamp(1.1875rem, 1.1386rem + 0.2174vw, 1.3125rem)" # --text-h3
    fontWeight: 500
    lineHeight: 1.3
  body:
    fontFamily: "'Hanken Grotesk', 'Hanken Grotesk Fallback', -apple-system, sans-serif"
    fontSize: "clamp(1rem, 0.9755rem + 0.1087vw, 1.0625rem)"   # --text-body
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "'Geist Mono', 'Geist Mono Fallback', ui-monospace, monospace"
    fontSize: "0.6875rem"                                       # --text-eyebrow
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.12em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "10px"
  xl: "14px"
  pill: "999px"
spacing:
  space-1: "4px"
  space-2: "8px"
  space-3: "12px"
  space-4: "16px"
  space-5: "20px"
  space-6: "24px"
  space-8: "32px"
  space-12: "48px"
  space-16: "64px"
components:
  button-primary:
    backgroundColor: "{colors.mauveina-accion}"
    textColor: "{colors.grafito-porcelana-alta}"
    rounded: "{rounded.md}"
    padding: "8px 20px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.cobalto-marca}"
    rounded: "{rounded.md}"
    padding: "8px 20px"
  card:
    backgroundColor: "{colors.grafito-porcelana-alta}"
    textColor: "{colors.grafito-tinta}"
    rounded: "{rounded.lg}"
    padding: "20px"
  card-featured:
    backgroundColor: "{colors.grafito-porcelana-alta}"
    textColor: "{colors.grafito-tinta}"
    rounded: "{rounded.lg}"
    padding: "20px"
---

# Design System: AChETIQ

## 1. Overview

**Creative North Star: "El cuaderno de laboratorio"**

AChETIQ se ve como una libreta de laboratorio bien llevada: porcelana fría, tinta precisa, dos
reactivos de color que solo aparecen cuando significan algo. El sistema «Cobalto & Mauveína» nace de
una metáfora disciplinar —el cobalto como pigmento inorgánico estructural y la mauveína (Perkin,
1856) como el primer tinte sintético, partida de nacimiento de la química orgánica— y la lleva hasta
los tokens: dos protagonistas fríos sobre un grafito neutro, con cada par texto/fondo documentando
su ratio WCAG calculado. No es una paleta "elegida"; es una identidad argumentada.

La densidad es editorial y respirada: titulares en una serif de alto contraste (Fraunces), cuerpo en
una grotesca humanista templada (Hanken Grotesk) y etiquetas técnicas en monoespaciada (Geist Mono),
reservada a metadatos y labels técnicos —ya no a *eyebrows* de cabecera (doctrina cero-eyebrow). El
fondo es **porcelana fría** (grafito a hue 265), no el beige
cálido que delata la generación por IA de 2026: la "calidez" la aporta la mauveína y la voz, nunca un
neutro tibio. La elevación es plana por defecto —tarjetas con borde de 1 px y sin sombra en reposo—,
con sombras frías (mezcladas desde cobalto-950) que solo responden al estado.

Este sistema rechaza explícitamente: la estética de plantilla comercial (motivo de la migración desde
Wix), el reflejo "educación = infantil/lúdico" (clay, Baloo 2 / Comic Neue, azul-naranja saturado),
la landing de SaaS (métrica-héroe, grillas de tarjetas idénticas, *eyebrow* sobre cada sección) y el
fondo crema "por elegancia".

**Key Characteristics:**
- Porcelana fría + tinta grafito + dos acentos fríos comprometidos (cobalto / mauveína).
- Tipografía de tres voces: serif display, grotesca de cuerpo, mono de etiqueta.
- Color como argumento químico, no como decoración; el acento de acción es escaso por diseño.
- Elevación plana; sombras frías reactivas al estado, no ambientales.
- Accesibilidad documentada con ratios calculados; AA piso, AAA donde es posible.

## 2. Colors

Paleta fría y argumentada de tres familias: un grafito neutro estructural y dos acentos —cobalto y
mauveína— separados ~60° en matiz, que no se confunden entre sí ni con los colores de estado.

### Primary
- **Cobalto de marca** (oklch(0.420 0.165 262) / #1344A5): color estructural de la marca
  (`--color-accent`). Enlaces, bordes de foco, borde de tarjeta destacada, contorno del botón
  secundario. Como texto sobre porcelana alcanza 7.9:1 (AAA). Es el azul institucional; carga la
  identidad sin gritar.
- **Cobalto medio** (oklch(0.515 0.150 262) / #3463BC): variante de apoyo (`--color-accent-soft`)
  para estados *hover* de enlaces y acentos secundarios. 5.2:1 como texto (AA).

### Secondary
- **Mauveína de acción** (oklch(0.500 0.190 322) / #922FA1): magenta **exclusivo de acción**
  (`--color-cta`). Es el relleno del botón primario (con tinta porcelana encima, 6.0:1 AA). Su
  rareza es su fuerza: no se usa como color decorativo ni de fondo amplio.
- **Mauveína como texto** (oklch(0.440 0.175 322) / #7C228A): versión oscurecida (`--color-cta-text`)
  para cuando la mauveína necesita ser texto sobre porcelana (7.8:1 AAA).

### Neutral — Grafito (hue 265, frío)
- **Porcelana** (oklch(0.967 0.005 265) / #F2F4F8): fondo principal de página (`--color-surface`).
- **Porcelana elevada** (oklch(0.985 0.003 265) / #F9FAFC): superficies elevadas y tarjetas
  (`--color-surface-raised`).
- **Papel hundido** (oklch(0.945 0.006 265) / #EAEDF2): plancha tonal fría *un peldaño por debajo*
  de la porcelana (`--color-surface-sunken`, E01). Diferencia zonas por TONO —no por caja— en el
  ritmo editorial; texto 15.4:1, texto-soft 7.8:1 (AAA), texto-faint 5.5:1 (AA).
- **Lavado cobalto** (oklch(0.965 0.012 262) / #EFF4FC): realce de marca DERIVADO del cobalto
  (`--color-surface-accent`, E01), banda fría apenas teñida para la sección protagónica del cuerpo
  (índice de gabinetes en la portada). Texto 15.2:1, texto-soft 7.6:1, cobalto-texto 7.4:1 (AAA).
- **Tinta** (oklch(0.205 0.018 265) / #131720): texto principal (`--color-text`). 16.3:1 sobre
  superficie (AAA).
- **Tinta secundaria** (oklch(0.404 0.018 265) / #444953): texto de apoyo (`--color-text-soft`,
  8.2:1 AAA).
- **Tinta terciaria** (oklch(0.486 0.017 265) / #5B5F69): metadatos y *captions*
  (`--color-text-faint`, 5.8:1 AA).
- **Borde** (oklch(0.862 0.011 265) / #CED2D9) y **borde suave** (oklch(0.918 0.008 265) / #E1E4E9):
  divisores y contornos de tarjeta en reposo (`--color-border`, `--color-border-soft`).
- **Cobalto profundo** (oklch(0.300 0.110 262) / #0B2964): superficie inversa del pie de página
  (`--color-surface-inverse`).

### Tertiary — Estado (emparejados en L ≈ 0.43–0.52)
- **Positivo** (#165E2E), **Negativo** (#9B171F), **Alerta** (#915900): señales semánticas, siempre
  acompañadas de glifo o texto (nunca color solo). Matices separados del cobalto y la mauveína para
  no colisionar con la marca.

### Named Rules
**La Regla de la Mauveína Escasa.** La mauveína es el único color de acción y aparece en ≤ 10 % de
cualquier pantalla: el botón primario y poco más. Su escasez es el mensaje. Prohibido usarla como
fondo amplio o adorno.

**La Regla de la Porcelana Fría.** El fondo es grafito frío (hue 265), nunca crema/arena cálido. La
calidez del proyecto la cargan la mauveína, la tipografía y la imagen, jamás un neutro tibio.

## 3. Typography

**Display Font:** Fraunces (con fallback Georgia, Times New Roman, serif)
**Body Font:** Hanken Grotesk (con fallback -apple-system, Segoe UI, sans-serif)
**Label/Mono Font:** Geist Mono (con fallback ui-monospace, Courier New, monospace)

**Character:** par de contraste real —serif de alto contraste para los titulares, grotesca
humanista templada para el cuerpo— con una mono técnica de tercera voz para etiquetas y datos.
Fraunces aporta autoridad editorial sin caer en lo decorativo; Hanken Grotesk da un cuerpo cálido y
legible; Geist Mono firma los metadatos con precisión instrumental. **Esta tríada es identidad
congelada** (ver Do's and Don'ts).

### Hierarchy
- **Display / Display-xl** (Fraunces 400, clamp ~2.5→3.25rem / hero ~2.5→4.06rem, lh 1.08,
  tracking -0.015em): solo H1 y titular del héroe. El paso 6 converge con el 5 en móvil para no
  desbordar (defecto v1 corregido). **E01:** el titular del héroe cierra un punto más
  (`--tracking-display` -0.021em, dentro del piso -0.04em) para el color denso de portada.
- **Headline** (Fraunces 400, clamp ~2.06→2.56rem, lh 1.3): H2 de sección.
- **Title** (Hanken Grotesk 500, clamp ~1.19→1.31rem, lh 1.3): H3. Nota: H3/H4 usan la **grotesca de
  cuerpo**, no la serif; la serif se reserva a H1/H2 para que el contraste display siga siendo
  excepcional.
- **Body** (Hanken Grotesk 400, clamp ~1→1.06rem, lh 1.7): prosa. Medida de línea acotada a 65–75ch.
- **Label** (Geist Mono 400, 0.6875rem, tracking 0.12em, mayúsculas): metadatos y etiquetas técnicas
  (labels de misión/visión, countdown, datos tabulares). **NO** corona títulos: la mono ya no se usa
  como *eyebrow*/kicker de cabecera (ver «La Regla Cero-Eyebrow»). **Caption** (Geist Mono, 0.75rem,
  tracking 0.04em) para pies y datos tabulares.

### Named Rules
**La Regla de las Dos Voces Serif.** Fraunces vive solo en H1 y H2. Bajar la serif a H3/H4 aplana el
contraste editorial; ahí manda Hanken Grotesk.

**La Regla Cero-Eyebrow (doctrina vigente).** NINGÚN título —ni de página, ni de sección, ni el del
héroe— lleva *eyebrow*/kicker encima. La mesura anterior (un kicker deliberado por vista: el *dateline*
del héroe en la portada, el eyebrow del `.page-header` en las interiores) se llevó a su conclusión: la
jerarquía la cargan **el titular, el aire y el *standfirst* en Hanken**, nunca una etiqueta mono
tracked. Se retiró la utilidad `.eyebrow` de `tokens.css`, los diez `<p class="eyebrow">` de las
páginas interiores y el `.hero__dateline` de la portada (su información —lugar y año de fundación—
ya vive en el cuerpo de «Quiénes somos»). Las secciones se abren con titular display + *standfirst*
(`.section-title__standfirst`). El token `--text-eyebrow` se conserva porque lo siguen consumiendo
labels mono no-kicker (countdown, 404, tarjetas).

> **Histórico.** La regla previa, «Eyebrow con Mesura» (E01–E07: un único kicker por vista, cero
> eyebrows bajo el pliegue), quedó superada por esta doctrina cero-eyebrow.

## 4. Elevation

El sistema es **plano por defecto**. Las tarjetas descansan con un borde de 1 px (`--elevation-border`)
y **sin sombra**; la profundidad en reposo se comunica por borde y por el escalón tonal
porcelana → porcelana-elevada, no por sombra. La sombra es una **respuesta al estado** (hover de
tarjeta, popovers, modales), no una atmósfera permanente. Todas las sombras derivan de cobalto-950 vía
`color-mix`, de modo que son frías y azuladas: se integran con la porcelana y evitan el efecto
"mancha gris" del rgba negro improvisado.

### Shadow Vocabulary
- **xs** (`0 1px 2px` cobalto-950 6 %): cajas pequeñas en reposo (unidades del *countdown*).
- **sm** (`0 2px 8px` cobalto-950 9 %): elevación leve al *hover* de tarjetas (`--elevation-hover`).
- **md** (`0 4px 6px / 0 10px 24px` cobalto-950): *dropdowns*, *popovers* (`--elevation-overlay`).
- **lg** (`0 6px 16px / 0 16px 40px` cobalto-950): paneles protagónicos y modales (`--elevation-modal`).

### Reglas hairline — separación editorial (E01)
La separación entre secciones la hace **aire + un filete de 1 px**, no una caja con sombra. Tokens
compuestos (paralelos a `--elevation-border`), consumidos por los componentes —nunca un
`border-top: 1px solid …` literal:
- **`--rule`** (1 px `--color-rule`): filete editorial estándar que abre cada sección de contenido
  (`.section-ruled`). Repetible sin volverse andamiaje: es estructura silenciosa, no un rótulo.
- **`--rule-ink`** (1.5 px `--color-rule-ink` = tinta): filete enfático tipo *masthead*, **una sola
  vez por página** (transición héroe → cuerpo, `.section-ruled--mast`).

### Named Rules
**La Regla de la Sombra Fría.** Ninguna sombra usa negro: todas se mezclan desde cobalto-950. Si una
sombra se ve gris-neutra sobre la porcelana, está mal construida.

**La Regla del Reposo Plano.** Las superficies son planas en reposo. La sombra solo aparece como
respuesta a estado (hover, elevación, foco). Sombras ambientales permanentes están prohibidas.

## 5. Components

### Buttons
- **Shape:** esquinas levemente curvas, `--radius-md` (6px). Padding `8px 20px`
  (`--space-2 --space-5`), Hanken Grotesk 500, tracking 0.02em.
- **Primary:** relleno mauveína (`--color-cta`, #922FA1) con tinta porcelana (`--color-on-cta`); el
  único botón que porta el color de acción (6.0:1, AA).
- **Secondary:** fondo transparente, texto y borde de 1 px en cobalto (`--color-accent`).
- **Hover / Active:** `opacity 0.92` + `translateY(-1px)` + `--shadow-xs` en hover (medio lift, para
  quedar subordinado a las tarjetas); `translateY(0)` + `opacity 0.85` en active.
- **Disabled:** fondo `--color-border-soft`, texto `--color-text-disabled`, `cursor: not-allowed`,
  sin atenuación por opacity y sin lift; cubre también `[aria-disabled="true"]`.

### Cards
- **Corner Style:** `--radius-lg` (10px).
- **Background:** porcelana elevada (`--color-surface-raised`).
- **Shadow Strategy:** plana en reposo (ver Elevation); `--elevation-hover` (sombra fría sm) solo al
  hover cuando la tarjeta es interactiva.
- **Border:** 1 px `--color-border`. La variante `.card-featured` sube a 1.5 px en cobalto.
- **Internal Padding:** `--card-pad` (`--space-5`, 20px); `--card-pad-lg` (24px) en tarjetas grandes.

### Inputs / Fields
- **Style:** trazo `--color-border`, fondo porcelana, `--radius-md`. Etiqueta visible siempre (nunca
  *placeholder* como etiqueta).
- **Focus:** anillo de foco tokenizado en cobalto (`--focus-ring-color`), 7.9:1 sobre superficie.
- **Error:** señal **no cromática** — borde engrosado + glifo + mensaje por campo
  (`aria-describedby`), más resumen `role="alert"` con anclas a cada campo. `aria-invalid` solo en
  los campos con error.

### Navigation
- **Breadcrumbs** en **TODAS las páginas internas**: los cuatro hubs (Sobre AChETIQ, Gabinetes,
  Recursos, Contacto) y las páginas de detalle (gabinetes y recursos), con `aria-current="page"` en el
  nodo activo. **Estrictamente omitidas en la portada** (`index.html`), que abre con el hero a pantalla
  completa. **Prominencia:** la ruta se compone en escalón **cuerpo** (`--text-body`, ~16→17 px) —no en
  la utilidad diminuta `--text-small` anterior— para que sea plenamente legible; el separador respira a
  `--space-3` y el último nodo gana peso `--weight-medium`. El objetivo táctil de cada enlace se
  mantiene ≥ 24 px (WCAG 2.5.8). **Pill-nav** para filtros (botones con `aria-pressed`). Navbar fijo con
  *skip-link* previo y fallback `<noscript>`. El estado activo se marca por color + peso, no por color
  solo.

### Signature — Apertura de sección editorial (E01)
**Patrón de firma que nace en la portada y heredan E02–E07.** Una sección se abre con:
1. un **filete hairline** a todo el ancho (`.section-ruled`, o `--mast` una vez por página),
2. el **titular display** (Fraunces, con su itálica cobalto de énfasis),
3. un **standfirst** en Hanken (`.section-title__standfirst`) —no un eyebrow mono—, que en ≥1024 px
   se compone a dos columnas sobre una línea de base común con el titular (`:has()`).

Reemplaza el viejo `eyebrow + h2` por sección. La jerarquía la carga la **tipografía y el aire**,
no una etiqueta tracked ni una caja.

### Signature — Índice editorial de gabinetes (E01)
La home lista sus cuatro frentes de trabajo como un **sumario** (`.gabinetes-index`), no como una
grilla de tarjetas idénticas: entradas con el nombre en Fraunces, descripción en Hanken y flecha
cobalto, separadas por **filetes hairline** (filas + filete central en ≥768 px) sobre una **plancha
tonal** de lavado cobalto (`--color-surface-accent`) que sangra a los bordes de la columna, plana
(sin borde, radio ni sombra). La fila entera es el destino (`<a>` en bloque). Es la respuesta
canónica del sistema a «la grilla de tarjetas es el recurso perezoso».

### Signature — Tarjeta de materia (apuntes)
Cada materia del Plan 2023 se pinta como `.card-materia` con una cubierta coloreada por año
(`--color-materia-anio-1..5`, una rampa de arena → cobalto profundo). Es el componente más
distintivo del registro utilitario: convierte un índice de 41 materias en una grilla legible por año.

### Signature — Simuladores (`simuladores.css`)
Los simuladores de Recursos › Simulaciones se listan como desplegables nativos (`<details class="sim">`)
con la misma gramática del índice editorial: número y título en Fraunces, bajada en Hanken, filetes de
tinta y lavado cobalto al hover. El registro interior es **producto**: controles en Hanken, datos en
Geist Mono tabular, y la figura y el esquema del equipo estáticos junto a los parámetros. El diagrama
usa una **paleta categórica de datos** propia (`--dataviz-azul`, `--dataviz-violeta`,
`--dataviz-verde`, tokens.css «Series de los simuladores»), validada para visión cromática atípica.
Los colores de estado no se reutilizan como series. Detalle técnico en `docs/SIMULADORES.md`.

**Excepción registrada — Violeta de datos.** A pedido de la dirección del proyecto, la serie de
rectificación (y la recta de operación de absorción) usa #702FA0, un violeta vecino de la mauveína.
Se admite porque es **un trazo de datos**, nunca una superficie de acción: no rellena botones ni
fondos, aparece siempre acompañado de rótulo directo y leyenda, y su matiz (≈ 307°) queda separado
del de la mauveína de acción (≈ 322°). La Regla de la Mauveína Escasa sigue rigiendo para la acción.

**Excepción registrada — Tema papel.** A pedido de la dirección del proyecto, las páginas de
Simulaciones usan un fondo papel neutro (`--papel-50` #F8F7F4, C ≈ 0,004; `body.tema-papel`) con paneles
blancos, en lugar de la porcelana fría: el gris lavanda competía con los colores de los diagramas. Es
casi acromático —no crema— y se limita a esa sección; el resto del sitio conserva la Regla de la
Porcelana Fría.

### Cierre de página (`.cta-final`)
El módulo de cierre abre **directo con el titular display** (Fraunces, con su itálica cobalto de
énfasis) seguido del *lead* en Hanken y los botones; **no lleva eyebrow**. Bajo la doctrina
cero-eyebrow esto deja de ser una excepción y pasa a ser la norma de toda cabecera del sitio: ninguna
superficie —cierre, página o sección— corona su título con kicker. (Histórico: E07 ya había
reconciliado los once cierres retirando seis eyebrows residuales; la doctrina cero-eyebrow extiende
esa limpieza a los `.page-header` y al `.hero__dateline`.)

## 6. Do's and Don'ts

### Do:
- **Do** tratar la tríada **Fraunces + Hanken Grotesk + Geist Mono** y la paleta **Cobalto &
  Mauveína** como **identidad congelada**: bien valoradas y ratificadas; las sesiones P01–P22 las
  **preservan**, no las reemplazan.
- **Do** mantener Fraunces en H1/H2 únicamente; H3/H4 en Hanken Grotesk.
- **Do** reservar la mauveína al botón primario y a la acción (≤ 10 % de la pantalla).
- **Do** conservar la porcelana fría (grafito hue 265) como fondo; cargar la calidez en tipografía,
  imagen y la mauveína.
- **Do** mantener la elevación plana en reposo y las sombras frías mezcladas desde cobalto-950.
- **Do** documentar cada par texto/fondo nuevo con su ratio WCAG calculado; AA piso, AAA donde se
  pueda. Señales de estado siempre con glifo/texto, no color solo.
- **Do** preservar el camino sin JavaScript (`<noscript>` espejo de cada bloque dinámico).
- **Do**, cuando una grilla de tarjetas sería el reflejo, evaluar el **índice editorial** (sumario
  con filetes hairline, `.gabinetes-index`) como alternativa que «se gana la retícula».
- **Do** mantener **breadcrumbs en todas las páginas internas** (los cuatro hubs + las páginas de
  detalle) en escalón cuerpo (`--text-body`), y **omitirlos estrictamente en la portada**.

### Don't:
- **Don't** reemplazar las fuentes ni la paleta. La guía "nuevo proyecto / palette.mjs /
  color-strategy" de impeccable **no aplica**: gana la identidad comprometida. (Que Fraunces figure
  en la lista de reflejo de impeccable es irrelevante aquí: ya es marca enviada.)
- **Don't** caer en el reflejo "educación = infantil": clay/burbujas, Baloo 2 / Comic Neue,
  azul-naranja saturado, mascota. Vetado.
- **Don't** usar fondo crema/arena cálido "por elegancia". Es el tell de IA 2026.
- **Don't** coronar **ningún** título con *eyebrow*/kicker en mono (doctrina cero-eyebrow): ni
  `.page-header`, ni sección, ni héroe. La jerarquía la cargan el titular display + el *standfirst* en
  Hanken + el aire. La utilidad `.eyebrow` se retiró de `tokens.css`; no reintroducirla. (Histórico: la
  cadencia previa admitía un único kicker por vista; ya no.)
- **Don't** repetir grillas de tarjetas idénticas (ícono + título + texto) como recurso por defecto;
  variar densidad y composición.
- **Don't** usar `border-left`/`border-right` > 1 px como franja de acento, texto en gradiente
  (`background-clip: text`), glassmorfismo decorativo ni la plantilla de métrica-héroe.
- **Don't** introducir sombras negras (rgba(0,0,0,…)); siempre frías desde cobalto-950.
- **Don't** parecer una plantilla de Wix/constructor comercial: ese es el fracaso que motivó todo el
  proyecto.

## 7. Excepción de accesibilidad registrada — repliegue de WCAG 2.2.2

**Decisión deliberada (entrega de portada).** Se retiró por completo el control de pausa del slideshow
del héroe (botón `.hero__pause`, su lógica en `hero-carrousel.js` y sus reglas en `headers.css`) en
favor de una **entrega de imagen puramente visual** y una UI más limpia. El cross-fade sigue
rotando automáticamente cada 5 s en bucle.

**Implicancia, declarada sin eufemismos.** Esto es un **repliegue de la conformidad con WCAG 2.2.2
«Pausar, detener, ocultar» (Nivel A)**: el héroe presenta contenido en movimiento que arranca solo,
dura > 5 s y corre en paralelo a otro contenido, ahora **sin** mecanismo para pausarlo, detenerlo u
ocultarlo. Para usuarios que no fijan `prefers-reduced-motion`, el sitio **deja de cumplir** ese
criterio de Nivel A.

**Mitigación vigente (no sustituye al control).** Bajo `prefers-reduced-motion: reduce` el carrusel
nunca anima —`hero-carrousel.js` no arranca el temporizador y la imagen queda fija—, de modo que el
público con esa preferencia activada no recibe movimiento alguno. La pausa por visibilidad de pestaña
(`visibilitychange`) se conserva, pero es un ahorro de recursos, **no** un control de usuario.

> Este apartado existe porque el principio 3 del proyecto trata la accesibilidad como identidad y no
> como checklist: un repliegue de Nivel A se documenta de forma explícita, no se silencia. Reponer el
> control `.hero__pause` (o detener la auto-rotación) restituiría la conformidad 2.2.2.
