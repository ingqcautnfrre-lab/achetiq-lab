# PLAN MAESTRO DE DESARROLLO — Sitio Web AChETIQ
## Fases 3 a 7 · Batería completa de prompts optimizados

> **Asociación Chaqueña de Estudiantes Tecnológicos de Ingeniería Química (AChETIQ)**
> Documento de orquestación operativa para la ejecución del sitio web oficial.
> Versión 1.0 · Fecha de emisión: 2026-05-21 · Mantenedor: Comisión Directiva (vía Protesorero)
> Alcance: Fases 3 (desarrollo front-end), 4 (contenido académico), 5 (despliegue), 6 (SEO/accesibilidad/seguridad), 7 (mantenimiento).
> Las Fases 0 (arquitectura), 1 (diseño visual) y 2 (preparación de componentes anticipados) se consideran cerradas; este plan parte de ese estado.

---

## 0. Cómo usar este documento

Este plan descompone la totalidad del desarrollo pendiente del sitio en **prompts discretos, autocontenidos y secuenciados**. Cada prompt es una unidad de trabajo que se copia y se ejecuta en el entorno indicado. La numeración (`P3.1`, `P3.2`, …) refleja el orden recomendado de ejecución; las dependencias explícitas se señalan en el campo *Prerrequisitos*.

Cada prompt se presenta con la siguiente ficha normalizada:

1. **Herramienta** — el entorno exacto donde debe ejecutarse el prompt (ver Sección 1).
2. **Objetivo** — qué produce el prompt y cuál es el resultado esperado y verificable.
3. **Prerrequisitos** — qué activos, datos, decisiones o archivos deben existir o recopilarse antes de ejecutarlo.
4. **Prompt** — el texto a copiar, redactado de forma autocontenida y con todas las especificaciones técnicas embebidas.

> **Principio metodológico vinculante (heredado de `INSTRUCCION_PROYECTO.md`, Secciones 5 y 10).** Aunque cada prompt está redactado para ser ejecutado de forma directa, el ciclo de trabajo del proyecto exige validación humana. Para tareas con margen de decisión editorial o visual, el agente debe operar en dos rondas (estructura → contenido) y consultar al usuario antes de fijar decisiones. Los prompts de este plan ya incorporan esa instrucción donde corresponde.

---

## 1. Definición operativa de los tres entornos

El usuario distingue tres entornos de ejecución. Dado que sus capacidades se solapan parcialmente, este plan fija una asignación funcional precisa para evitar ambigüedad.

### 1.1. Claude Code

Entorno de **construcción técnica del repositorio**. Es el agente de línea de comandos que opera directamente sobre los archivos del proyecto: escribe y edita HTML, CSS y JavaScript, crea la estructura de carpetas, ejecuta validaciones, corre servidores locales de previsualización y gestiona el versionado con Git. Es el entorno donde se materializa todo el código del sitio.

**Se asigna a:** creación y edición de archivos de código (`.html`, `.css`, `.js`), manipulación de la estructura del repositorio, ejecución de linters y validadores, configuración de despliegue, generación de `sitemap.xml`/`robots.txt`, y cualquier tarea cuyo producto sea código fuente versionado.

### 1.2. Claude Design

Entorno de **exploración y validación visual previa al código**. Se utiliza para generar maquetas, previsualizaciones de disposición (layout), comparativas de variantes de diseño y prototipos visuales de componentes y páginas, **antes** de comprometerlos en código definitivo. Su salida es material visual de decisión, no código de producción.

**Se asigna a:** maquetado de la composición de una página a partir de su wireframe, exploración de variantes de hero o de jerarquía visual, previsualización del aspecto de un componente con la paleta Océano & Areia aplicada, y revisión visual comparativa para que la directiva elija entre alternativas. El material aprobado en este entorno se traduce luego a código en Claude Code.

> **Nota de coherencia de stack.** Todo prototipo visual generado en Claude Design es referencial. La implementación final es siempre HTML/CSS/JS vanilla con `tokens.css` (ver `feedback_stack_vanilla.md`). Ningún artefacto de diseño que dependa de React, Tailwind o frameworks se traslada literalmente: se reescribe a vanilla en Claude Code.

### 1.3. Claude Cowork

Entorno de **orquestación, contenido, datos y gestión de activos**. Es este entorno. Se utiliza para producir y estructurar contenido editorial, generar y validar los archivos de datos JSON, redactar documentación, preparar y optimizar activos (imágenes, PDF), realizar investigación con fuentes verificadas, planificar, y coordinar el flujo entre fases. Tiene acceso a la carpeta del proyecto y a un entorno Linux para procesamiento de archivos.

**Se asigna a:** redacción de copy institucional, definición de esquemas y poblado de archivos `data/*.json`, optimización de imágenes y compresión de PDF, especificaciones funcionales (calendario, planilla de seguimiento), documentación para colaboradores no técnicos, investigación de servicios externos, y la elaboración y mantenimiento de este propio plan.

### 1.4. Tabla de asignación rápida

| Tipo de tarea | Entorno |
|---|---|
| Escribir o editar HTML/CSS/JS | Claude Code |
| Estructura de carpetas y Git | Claude Code |
| Configurar GitHub Pages, dominio, sitemap | Claude Code |
| Auditoría de accesibilidad/SEO sobre código | Claude Code |
| Maqueta visual previa de una página o componente | Claude Design |
| Comparar variantes visuales para decisión de la directiva | Claude Design |
| Redactar copy editorial e institucional | Claude Cowork |
| Definir y poblar archivos JSON de datos | Claude Cowork |
| Optimizar imágenes / comprimir PDF | Claude Cowork |
| Especificaciones funcionales y documentación | Claude Cowork |
| Investigación con fuentes verificadas | Claude Cowork |

---

## 2. Estado de partida (resumen verificado contra el repositorio, 2026-05-21)

- **Stack definitivo:** HTML5 semántico + CSS con design tokens (`tokens.css`) y metodología BEM + JavaScript vanilla (módulos ES). Sin frameworks, sin generadores estáticos. Contenido dinámico vía JSON cargado con `fetch()`. Despliegue en GitHub Pages.
- **Identidad visual cerrada:** paleta Océano & Areia (`--color-bg #F5F2EC`, `--color-ink #13110F`, `--color-primary #0D3B66`, `--color-primary-mid #1E6FA0`, `--color-cta #C8551C`, `--color-border #D8D0C4`, `--color-panel #F8F6F2`). Tipografías: Instrument Serif (títulos), Geist (cuerpo/UI), Geist Mono (etiquetas y datos). Iconografía Lucide inline.
- **Documentos canónicos presentes:** `INSTRUCCION_PROYECTO.md`, `FASE_0_Arquitectura.md`, `FASE_1_Catalogo_Componentes.md` (23 componentes en 11 categorías), `FASE_1_Wireframes.md` (5 páginas prioritarias cerradas), `tokens.css`, `PROMPT_CONTINUACION.md`.
- **Datos existentes:** `data/directiva.json`, `data/gabinetes.json`, `data/recursos.json` (41 materias Plan 2023), `data/historia.json` (14 hitos 2003–2026), `data/instituciones.json`, `data/documentos.json`, `data/redes.json`.
- **Activos resueltos:** favicon completo (5 archivos en raíz), logos UTN FRRe y ANEIQA en SVG transparente, `docs/Estatuto.pdf` comprimido a 3.12 MB.
- **Componentes anticipados de Fase 2 (en carpeta local, sin commitear):** cuenta regresiva de Recursos (`_includes/countdown-recursos.html` + CSS/JS), página de error `404.html` + CSS. El spinner "Bouncing Dots" tiene especificación canónica pero aún no está en código.

### 2.1. Inconsistencia estructural a resolver al inicio de Fase 3

El repositorio contiene simultáneamente carpetas de estilo Jekyll (`_includes/`, `_layouts/`, `_collections/`, `_data/`, `_posts/`) y la estructura vanilla canónica (`pages/`, `data/`, `assets/`, `tokens.css`). Dado que `INSTRUCCION_PROYECTO.md` §2.1 prohíbe explícitamente los generadores estáticos, las carpetas Jekyll son andamiaje residual. El primer prompt de Fase 3 (`P3.0`) resuelve esta inconsistencia antes de cualquier otra construcción.

---

# FASE 3 — DESARROLLO FRONT-END

> **Meta de la fase.** Convertir los wireframes y el catálogo de componentes en un sitio funcional, navegable y responsivo, construido íntegramente en HTML/CSS/JS vanilla. Al cierre de la fase, las cinco páginas prioritarias y sus páginas hijas deben renderizar correctamente en local, con datos cargados desde JSON, navegación operativa y comportamiento responsivo verificado.
>
> **Secuencia recomendada:** P3.0 → P3.1 → P3.2 → P3.3 → P3.4 → P3.5 → P3.6 → P3.7 → (P3.8 … P3.13 en cualquier orden) → P3.14 → P3.15. Los prompts de fundación (P3.0 a P3.7) son estrictamente secuenciales; las páginas (P3.8 en adelante) dependen de toda la fundación.

---

### P3.0 — Reconciliación de la estructura de directorios

- **Herramienta:** Claude Code
- **Objetivo:** Eliminar la ambigüedad arquitectónica entre el andamiaje Jekyll residual y la estructura vanilla canónica, dejando un árbol de repositorio único, coherente y documentado, sin pérdida de los componentes anticipados de Fase 2.
- **Prerrequisitos:** Acceso al repositorio. Ninguna recopilación de activos. Decisión previa confirmada: el stack es vanilla puro (ya fijado en `INSTRUCCION_PROYECTO.md` §2.1). Antes de borrar nada, confirmar con el usuario que las carpetas Jekyll no se usarán.

> **Prompt:**
> Vas a trabajar sobre el repositorio del sitio AChETIQ. Antes de tocar archivos, leé `INSTRUCCION_PROYECTO.md` (Secciones 2 y 5), `FASE_0_Arquitectura.md` (Sección 5, estructura de repositorio) y `PROMPT_CONTINUACION.md`. El stack es HTML/CSS/JS vanilla sin generadores estáticos; no se usa Jekyll.
>
> Tarea: reconciliar la estructura de directorios. El repositorio contiene carpetas de estilo Jekyll (`_includes/`, `_layouts/`, `_collections/`, `_data/`, `_posts/`) que son andamiaje residual y contradicen el stack definido. También contiene componentes anticipados de Fase 2 ubicados dentro de `_includes/` (la cuenta regresiva de Recursos) que deben preservarse.
>
> Pasos:
> 1. Inventariá el contenido real de cada carpeta Jekyll y reportámelo en una tabla (carpeta, archivos, ¿tiene contenido útil?). No borres nada todavía.
> 2. Proponé un árbol de directorios objetivo vanilla coherente con `FASE_0_Arquitectura.md` §5, usando `assets/css/`, `assets/js/`, `assets/img/`, `partials/` (para fragmentos HTML inyectados por fetch, p. ej. `partials/navbar.html` y `partials/footer.html`), `data/`, `pages/`, `pages/gabinetes/`, `pages/recursos/`, `docs/`, `img/`.
> 3. Migrá la cuenta regresiva de Recursos desde `_includes/` a la ubicación vanilla equivalente (`partials/` para el HTML, `assets/css/` y `assets/js/` ya correctos), ajustando cualquier ruta interna.
> 4. Tras mi confirmación explícita, eliminá las carpetas Jekyll vacías o sin contenido útil.
> 5. Actualizá `FASE_0_Arquitectura.md` §5 si el árbol final difiere del documentado, y registrá el cambio en `PROMPT_CONTINUACION.md`.
>
> Presentame el inventario y el árbol objetivo como propuesta y esperá mi aprobación antes de ejecutar borrados. No instales dependencias.

---

### P3.1 — Esqueleto base HTML (boilerplate reutilizable)

- **Herramienta:** Claude Code
- **Objetivo:** Crear un archivo HTML base que sirva de plantilla para todas las páginas del sitio, con `<head>` completo (meta, favicon, fuentes, hojas de estilo), placeholders de navbar y footer inyectables por fetch, y la estructura semántica de documento. Resultado: un boilerplate del que se derivan todas las páginas.
- **Prerrequisitos:** P3.0 completado (estructura de carpetas estable). Favicon ya presente en raíz (resuelto). Definir el `lang`, el patrón de `<title>` y la descripción por defecto. Confirmar las URLs de las fuentes (Instrument Serif, Geist, Geist Mono) — verificar disponibilidad y método de carga (self-hosted vs CDN de fuentes).

> **Prompt:**
> Trabajás sobre el sitio AChETIQ (stack vanilla, ver `INSTRUCCION_PROYECTO.md`). Leé `tokens.css` y `FASE_1_Catalogo_Componentes.md` antes de empezar.
>
> Creá un esqueleto base HTML reutilizable (`partials/_boilerplate.html` o un comentario-plantilla documentado) que será la base de todas las páginas del sitio. Requisitos del `<head>`:
> - `<!DOCTYPE html>`, `<html lang="es-AR">`.
> - `<meta charset="UTF-8">` y `<meta name="viewport" content="width=device-width, initial-scale=1">`.
> - `<title>` con patrón "{Título de la página} · AChETIQ" y un `<meta name="description">` placeholder por página.
> - Registro completo del favicon ya existente en la raíz: `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` (180×180), `icon-192.png`, `icon-512.png`. Incluí los `<link rel="icon">`, `<link rel="apple-touch-icon">` y un `<link rel="manifest">` si corresponde.
> - Carga de las fuentes Instrument Serif, Geist y Geist Mono. Proponeme dos opciones —self-hosted en `assets/fonts/` (mejor privacidad y rendimiento, sin dependencia de terceros) vs Google Fonts/CDN (más simple)— con su implicancia, y esperá mi elección antes de fijar el método. Incluí `font-display: swap`.
> - Enlace a la hoja de estilos principal (`assets/css/main.css`).
> - Etiquetas Open Graph y Twitter Card como placeholders (se completan en Fase 6).
>
> Estructura del `<body>`:
> - Un skip-link al contenido principal ("Saltar al contenido").
> - Placeholder de navbar: `<div data-loader="navbar"></div>`.
> - `<main id="contenido">` vacío con un comentario indicando dónde va el contenido de cada página.
> - Placeholder de footer: `<div data-loader="footer"></div>`.
> - Carga de los scripts al final del `<body>` como módulos ES (`<script type="module" src="assets/js/main.js"></script>`).
>
> Respetá el nombre legal completo "Asociación Chaqueña de Estudiantes Tecnológicos de Ingeniería Química" donde aparezca. No uses signos de exclamación. Documentá el boilerplate con comentarios que expliquen qué reemplazar en cada página. No instales dependencias.

---

### P3.2 — Sistema CSS global (`main.css`)

- **Herramienta:** Claude Code
- **Objetivo:** Construir la hoja de estilos raíz que importa los tokens, aplica un reset moderno, fija la tipografía base, define el contenedor de layout, los breakpoints responsivos y las utilidades transversales. Resultado: base CSS sobre la que se apoyan todos los componentes y páginas.
- **Prerrequisitos:** P3.0. `tokens.css` presente y verificado. Confirmar los breakpoints (mobile-first) si no están ya tokenizados, y el ancho máximo del contenedor (el catálogo sugiere 1120–1200 px).

> **Prompt:**
> Sitio AChETIQ, stack vanilla. Leé `tokens.css` completo y `FASE_1_Catalogo_Componentes.md` (especialmente layout, tipografía y espaciado) antes de escribir.
>
> Creá `assets/css/main.css`, la hoja de estilos raíz. Debe contener, en este orden:
> 1. `@import` o `<link>` previo de `tokens.css` (verificá cómo está cargado; si conviene, importalo desde `main.css` con `@import url('tokens.css');` al tope).
> 2. Un reset CSS moderno y mínimo (box-sizing border-box global, reset de márgenes, `img`/`picture` responsivas con `max-width:100%`, `:focus-visible` con `outline` usando `--color-primary`, respeto de `prefers-reduced-motion`).
> 3. Estilos base de documento: `body` con `font-family: var(--font-body)` (Geist), color `var(--color-ink)`, fondo `var(--color-bg)`, `line-height` legible. Títulos `h1`–`h6` con `var(--font-display)` (Instrument Serif) y escala tipográfica tomada de los tokens. Etiquetas y datos monoespaciados con `var(--font-mono)` (Geist Mono).
> 4. Contenedor de layout `.container` centrado, con ancho máximo coherente con el catálogo (verificá el valor; típicamente 1120–1200 px) y padding lateral responsivo.
> 5. Breakpoints mobile-first definidos como referencia documentada (móvil base, ≥768 px tablet, ≥1024 px desktop). Si los tokens ya definen breakpoints, usalos; si no, proponémelos como tokens nuevos antes de hard-codear.
> 6. Clases utilitarias transversales mínimas (visualmente ocultas para lectores de pantalla `.sr-only`, separadores de sección, `.skip-link`).
> 7. Estructura de `@import` para las hojas de componentes y de páginas que se crearán después (dejá comentarios indicando dónde se sumarán `navbar.css`, `footer.css`, `loader.css`, etc.).
>
> Todo color y tipografía debe venir de variables `var(--token)`; prohibido hard-codear hex o nombres de fuente. Cumplí WCAG AA en contraste. No instales dependencias. Al terminar, indicame qué tokens nuevos (si alguno) tuviste que proponer.

---

### P3.3 — Loader global "Bouncing Dots"

- **Herramienta:** Claude Code
- **Objetivo:** Implementar en código la especificación canónica del spinner de carga global del sitio (variante inline + variante overlay de pantalla completa), 100% CSS, adaptada a tokens. Resultado: `assets/css/loader.css` y el markup reutilizable, listos para usarse en estados de carga de `fetch()`.
- **Prerrequisitos:** P3.2. Especificación canónica ya definida (memoria `achetiq_spinner_loader.md`). Confirmar dos puntos menores pendientes: si el mensaje usa `--text-small` o `--text-caption`, y si el overlay bloquea el scroll del body.

> **Prompt:**
> Sitio AChETIQ, stack vanilla. Implementá el loader global "Bouncing Dots" según la especificación canónica ya aprobada. El CSS canónico y el markup están definidos; reproducilos fielmente.
>
> Creá `assets/css/loader.css` (depende de `tokens.css`) con:
> - Bloque base `.loader` (flex, centrado, gap `var(--space-2)`) y modificadores de posición del mensaje (`.loader--msg-bottom` columna, `.loader--msg-right` fila, `.loader--msg-left` fila inversa).
> - `.loader__dots` contenedor de puntos.
> - `.loader__dot`: diámetro `var(--space-3)` (12 px), fondo `var(--color-primary)`, `border-radius: var(--radius-pill)`, animación `loader-bounce 0.6s infinite ease-in-out`.
> - Stagger por `nth-child` (1=0s, 2=0.2s, 3=0.4s, 4=0.6s, 5=0.8s); para N>5 usar `style="animation-delay:"` inline.
> - Keyframes `loader-bounce`: `0%,100%{transform:translateY(0)}` y `50%{transform:translateY(calc(-1 * var(--space-5)))}` (rebote de 20 px).
> - `.loader__message` con `var(--font-body)` y `color: var(--color-ink-soft)`. **Decisión a confirmar conmigo:** ¿tamaño `--text-small` o `--text-caption`?
> - Variante `.loader--overlay`: `position:fixed; inset:0; z-index:250`, fondo `color-mix(in oklab, var(--color-bg) 80%, transparent)`, `backdrop-filter: blur(2px)`. **Decisión a confirmar conmigo:** ¿el overlay debe bloquear el scroll del body mientras está visible?
> - Accesibilidad: bajo `@media (prefers-reduced-motion: reduce)`, reemplazá el rebote por un pulso de opacidad (`loader-fade`).
>
> Entregá también los tres markups canónicos (inline sin mensaje, inline con mensaje, overlay) con `role="status"` y `aria-live="polite"`. Importá `loader.css` desde `main.css`. Si algún token referenciado (`--color-ink-soft`, `--radius-pill`, `--space-5`) no existe en `tokens.css`, avisame antes de inventarlo. No uses JS para la animación; sí exponé un helper JS mínimo (mostrar/ocultar) para el overlay global, que se conectará a la lógica de carga real. Sin dependencias.

---

### P3.4 — Barra de navegación (navbar)

- **Herramienta:** Claude Code
- **Objetivo:** Construir la barra de navegación oficial del sitio según el prompt canónico ya cerrado (header sticky, submenús declarativos para Gabinetes y Recursos, responsive con panel lateral y acordeón, accesibilidad WCAG AA). Resultado: `partials/navbar.html`, `assets/css/navbar.css`, `assets/js/navbar.js`, `data/navbar.json`.
- **Prerrequisitos:** P3.1, P3.2. El prompt canónico completo está registrado en la memoria del proyecto (`achetiq_navbar_prompts.md`, Sección "PROMPT CANÓNICO") y el JSON definitivo de `data/navbar.json` en su Sección 7. Logo `assets/img/logo/achetiq-logo.svg` presente.

> **Prompt:**
> Ejecutá el **Prompt Canónico de la barra de navegación de AChETIQ** registrado en la memoria del proyecto (`achetiq_navbar_prompts.md`, Sección "PROMPT CANÓNICO (a copiar y ejecutar en Fase 2)"). Ese prompt es la especificación vinculante completa: leelo íntegro y seguilo al pie de la letra, incluyendo la configuración definitiva de `data/navbar.json` de su Sección 7.
>
> Resumen de lo que debés producir: `partials/navbar.html` (markup del `<header>`), `assets/css/navbar.css` (importado desde `main.css`), `assets/js/navbar.js` (inyección por fetch, toggle hamburguesa, acordeón mobile, manejo de teclado) y `data/navbar.json` (configuración declarativa de marca, enlaces y submenús de Gabinetes y Recursos Académicos).
>
> Puntos no negociables: header sticky con `backdrop-filter` y fallback; submenús desktop por hover/focus con el label siempre clickeable a la página general; panel lateral con acordeón en móvil; accesibilidad (`aria-haspopup`, `aria-expanded`, `role="menu"`, navegación por teclado con ArrowDown/Esc, foco visible); fallback si JS falla; cero dependencias externas; sanitización al inyectar strings de JSON. Verificá contra `tokens.css` el ancho máximo del contenedor para que coincida con `.container` de `main.css` (P3.2).
>
> Al terminar, confirmame que se cumplen los seis criterios de aceptación de la Sección 11 del prompt canónico.

---

### P3.5 — Pie de página (footer)

- **Herramienta:** Claude Code
- **Objetivo:** Construir el pie de página institucional, inyectado por fetch igual que la navbar, con identidad, navegación secundaria, datos de contacto, redes sociales (desde `data/redes.json`) y nota legal con el nombre completo de la asociación. Resultado: `partials/footer.html`, `assets/css/footer.css`, `assets/js` correspondiente y, si aplica, `data/footer.json`.
- **Prerrequisitos:** P3.1, P3.2, P3.4 (para reutilizar el patrón de inyección por fetch y el motor de carga). `data/redes.json` presente (email, Instagram; LinkedIn null → "Próximamente"). Definir qué enlaces de navegación secundaria incluye el footer.

> **Prompt:**
> Sitio AChETIQ, stack vanilla. Construí el pie de página institucional siguiendo el mismo patrón de inyección por fetch que la navbar (ver `assets/js/navbar.js` como referencia de patrón). Leé `tokens.css`, `FASE_1_Catalogo_Componentes.md` y `data/redes.json`.
>
> Creá `partials/footer.html`, `assets/css/footer.css` (importado desde `main.css`) y la lógica de inyección. El footer debe contener:
> - Columna de identidad: logo o wordmark AChETIQ y el nombre legal completo "Asociación Chaqueña de Estudiantes Tecnológicos de Ingeniería Química".
> - Navegación secundaria: enlaces a las páginas principales (Inicio, Sobre AChETIQ, Gabinetes, Recursos Académicos, Contacto). Proponémela como tabla y confirmá conmigo el set exacto antes de fijarla.
> - Datos de contacto y redes sociales poblados desde `data/redes.json`: renderizá solo los canales con valor no-null; los null (p. ej. LinkedIn en v1.0) se omiten o muestran como "Próximamente" según ya se decidió para Contacto. Todos los enlaces externos con `target="_blank" rel="noopener noreferrer"`.
> - Línea legal inferior: nombre completo, año dinámico, y mención de la facultad (UTN FRRe). Sin signos de exclamación.
>
> Estilos con tokens; fondo diferenciado (`var(--color-panel)` o `var(--color-primary)`, proponémelo con una maqueta conceptual y dejame elegir). Semántica `<footer>`, responsivo mobile-first, accesible. Manejo de error de fetch sin romper la página. Sin dependencias.

---

### P3.6 — Motor de carga dinámica (patrón `data-loader`)

- **Herramienta:** Claude Code
- **Objetivo:** Implementar el motor JavaScript central que materializa el patrón `data-loader="<nombre>"`: localiza placeholders, hace fetch del JSON correspondiente, lo renderiza con el componente adecuado, y gestiona estados de carga (loader), vacío (empty-state) y error. Resultado: `assets/js/main.js` y `assets/js/loaders.js` con el motor y los renderizadores registrados.
- **Prerrequisitos:** P3.1, P3.2, P3.3 (loader para estado de carga), P3.4 y P3.5 (navbar y footer son los primeros consumidores del patrón). Esquema de los JSON existentes verificado.

> **Prompt:**
> Sitio AChETIQ, stack vanilla, módulos ES sin transpilación. Leé `INSTRUCCION_PROYECTO.md` §2.2 (patrón de carga dinámica) y §7.2 (convenciones JS), y revisá los `data/*.json` existentes para conocer sus esquemas.
>
> Implementá el motor de carga dinámica que materializa el patrón `data-loader`. Creá `assets/js/loaders.js` (registro de renderizadores) y `assets/js/main.js` (arranque global). Comportamiento:
> 1. Al `DOMContentLoaded`, recorré todos los elementos con atributo `data-loader`.
> 2. Para cada uno, derivá el nombre del recurso (`data-loader="recursos"` → `data/recursos.json`) y el renderizador registrado para ese nombre.
> 3. Mostrá el loader inline (P3.3) mientras el fetch está pendiente.
> 4. Al resolver: renderizá con el componente correspondiente del catálogo. Si el array está vacío, mostrá un `empty-state`. Si el fetch falla, mostrá un mensaje de error accesible y logueá el detalle en consola, sin romper el resto de la página.
> 5. Sanitizá todo string proveniente de JSON antes de insertarlo en el DOM (escape de caracteres especiales); evitá `innerHTML` con datos no escapados.
>
> Diseñá el módulo como un **registro extensible**: una función `registerLoader(nombre, renderFn)` que las páginas usan para asociar un nombre a su función de render. Navbar y footer ya inyectados por fetch deben integrarse a este patrón o documentarse como casos especiales. Funciones puras donde sea posible, estado global mínimo. Sin dependencias. Documentá con comentarios cómo una página nueva registra su loader.

---

### P3.7 — Componentes del catálogo en CSS

- **Herramienta:** Claude Code
- **Objetivo:** Implementar en CSS los 23 componentes del catálogo de Fase 1, incluidas las variantes acumuladas pendientes de aplicación (`.card--valor`, `.card--institucion`, `.card-documento`, `.card-integrante`, `.card-materia`, `.contact-card`, `.kpi-strip`, `.gallery-events`, `.timeline`, `.mission-vision`, `.pill-nav`). Resultado: una o varias hojas de componentes importadas desde `main.css`, con todas las clases BEM listas para usarse en las páginas.
- **Prerrequisitos:** P3.2. `FASE_1_Catalogo_Componentes.md` como fuente de verdad. Confirmar la disponibilidad de los íconos Lucide referenciados (`telescope`/fallback, `heart-handshake`/fallback). Definir los colores placeholder por año para `.card-materia` (paleta Océano & Areia, no colores del isotipo).
- **Nota:** componente extenso; conviene abordarlo por categorías del catálogo en interacciones sucesivas, no en un único volcado.

> **Prompt:**
> Sitio AChETIQ, stack vanilla, BEM estricto. La fuente de verdad es `FASE_1_Catalogo_Componentes.md` (23 componentes en 11 categorías); leelo íntegro junto con `tokens.css`.
>
> Implementá los componentes del catálogo en CSS, importados desde `main.css`. Por la extensión, trabajemos **por categoría del catálogo, una por interacción**: en cada turno proponeme qué categoría vamos a implementar, mostrame el CSS de esos componentes, y esperá mi visto bueno antes de pasar a la siguiente. No vuelques las 11 categorías de una sola vez.
>
> Incluí obligatoriamente, además de los componentes base, estas variantes acumuladas pendientes de aplicación (registradas en la memoria del proyecto y en `PROMPT_CONTINUACION.md`):
> - `.mission-vision` — dos columnas con borde lateral 3 px `--color-primary`, labels Geist Mono uppercase con ícono Lucide inline, sin H2 global.
> - `.card--valor` — variante de `.card` base con `min-height` para uniformidad; ícono + H3 + descripción; borde 1 px `--color-border`, radio pequeño, sin fondo.
> - `.card--institucion` — variante de `.card`; borde 1 px `--color-border`, fondo `--color-panel`, padding generoso; logo + nombre + link.
> - `.card-documento` — variante para documentos descargables.
> - `.card-integrante` — variante para integrantes de la comisión directiva (foto + nombre + cargo).
> - `.card-materia` — variante para el grid de materias; imagen/placeholder de color por año + nombre, clickeable. **Decisión a confirmar conmigo:** los colores placeholder por año (1°–5°) deben salir de la paleta Océano & Areia; nunca de los colores del isotipo. Proponémelos como tabla.
> - `.contact-card` — canal de contacto con ícono Lucide, eyebrow, valor y estado "Próximamente".
> - `.kpi-strip` — strip de 4 indicadores institucionales estáticos.
> - `.gallery-events` — galería por evento (título + descripción + grid de fotos).
> - `.timeline` — línea de tiempo extensible con soporte de entrada ghost.
> - `.pill-nav` — navegación por píldoras (filtros) usada en Recursos y Actividades.
>
> Para los íconos Lucide referenciados verificá disponibilidad: `telescope` (Visión; fallback `compass` o `eye`) y `heart-handshake` (Solidaridad; fallback `hand-helping` o `heart`). Avisame si alguno no existe. Todo con tokens, WCAG AA, mobile-first, foco visible. Sin dependencias.

---

### P3.8 — Página de Inicio (`index.html`)

- **Herramienta:** Claude Code
- **Objetivo:** Construir la página de inicio a partir de su wireframe, ensamblando los componentes ya creados (navbar, footer, loader, tarjetas, KPI strip) y conectando los bloques dinámicos a sus archivos JSON mediante el patrón `data-loader`. Resultado: `index.html` funcional en la raíz, navegable y responsivo, con hero, presentación institucional, accesos a gabinetes y recursos, y llamados a la acción.
- **Prerrequisitos:** P3.1 a P3.7 completos (fundación y componentes). Wireframe de Inicio cerrado en `FASE_1_Wireframes.md` (Sección 1). Imagen del hero pendiente de recopilación (`INVENTARIO_Solicitud_de_Contenido.md`, Bloque 7.1): si no está disponible, usar un fondo de color o patrón con la paleta como placeholder, sin imagen ráster. Verificar el copy del hero y de la sección de presentación (puede provenir de `content/` o requerir validación de la directiva).

> **Prompt:**
> Sitio AChETIQ, stack vanilla. Construí la página de inicio `index.html` en la raíz del repositorio. Antes de escribir, leé `FASE_1_Wireframes.md` Sección 1 (wireframe de Inicio), `FASE_1_Catalogo_Componentes.md`, `tokens.css` y `assets/css/main.css`. Reutilizá los componentes ya implementados; no redefinas estilos que ya existen en las hojas de componentes.
>
> La página debe partir del esqueleto base (P3.1): `<head>` completo, skip-link, `<div data-loader="navbar"></div>`, `<main id="contenido">` y `<div data-loader="footer"></div>`. Dentro de `<main>`, construí los bloques del wireframe de Inicio respetando su orden y jerarquía. Bloques esperados (verificá contra el wireframe y ajustá si difiere):
> 1. Hero principal: título en Instrument Serif con el propósito de la asociación, subtítulo y dos llamados a la acción (primario "Sumate" → contacto; secundario → gabinetes o recursos). Si no hay imagen de hero aprobada, usá un fondo sólido o un degradado sutil de la paleta Océano & Areia; no insertes imágenes placeholder ráster.
> 2. Presentación breve de AChETIQ (qué es, a quién sirve), con enlace a "Sobre AChETIQ".
> 3. KPI strip (`.kpi-strip`) con indicadores institucionales estáticos (confirmá conmigo los cuatro valores antes de fijarlos; no inventes cifras).
> 4. Accesos a los cuatro gabinetes: grid de tarjetas pobladas desde `data/gabinetes.json` vía `data-loader`.
> 5. Bloque de Recursos Académicos destacados con enlace al hub.
> 6. CTA final hacia Contacto, coherente con el de "Sobre AChETIQ".
>
> Conectá los bloques dinámicos al motor de carga (P3.6) usando `data-loader`. Para datos aún no disponibles, mostrá el `empty-state` correspondiente, no contenido inventado. Respetá el nombre legal completo donde corresponda y la prohibición de signos de exclamación. Verificá el comportamiento responsivo (móvil, tablet, desktop). Al terminar, listame qué textos o activos quedaron como placeholder pendientes de validación.

---

### P3.9 — Página "Sobre AChETIQ" (`pages/sobre-achetiq.html`)

- **Herramienta:** Claude Code
- **Objetivo:** Construir la página institucional a partir de su wireframe cerrado, con los siete bloques definidos (page-header, historia con timeline, misión y visión, valores, instituciones vinculadas, documentos institucionales y CTA final), conectando los bloques dinámicos a sus JSON. Resultado: `pages/sobre-achetiq.html` completa y navegable.
- **Prerrequisitos:** P3.1 a P3.7. Wireframe cerrado en `FASE_1_Wireframes.md` (Sección 2). Datos presentes: `data/historia.json` (14 hitos 2003–2026), `data/instituciones.json`, `data/documentos.json`. Pendientes que condicionan el contenido final, no la estructura: descripciones de valores aún en estado de borrador no autoritativo (requieren aprobación de la directiva antes de fijarse en `data/site_copy.json`); patrón de entrada ghost de la timeline; íconos Lucide de cada hito; logos institucionales transparentes (ya resueltos: UTN FRRe y ANEIQA en SVG).

> **Prompt:**
> Sitio AChETIQ, stack vanilla. Construí `pages/sobre-achetiq.html` siguiendo el wireframe cerrado de `FASE_1_Wireframes.md` Sección 2. Leé además `FASE_1_Catalogo_Componentes.md` para los componentes `.timeline`, `.mission-vision`, `.card--valor`, `.card--institucion` y `.card-documento`, ya implementados en CSS (P3.7).
>
> Partí del esqueleto base. Construí los siete bloques en este orden cerrado:
> 1. Page-header (encabezado de página; skeleton válido, baja prioridad de pulido).
> 2. Nuestra historia: timeline (`.timeline`) poblada desde `data/historia.json` vía `data-loader`. La timeline debe soportar la entrada ghost final; si el patrón de ghost aún no está definido, dejá el hook estructural y avisámelo, no lo inventes.
> 3. Misión y Visión: `.mission-vision`, dos columnas con borde lateral `--color-primary`, labels Geist Mono con ícono Lucide inline.
> 4. Valores institucionales: grid de `.card--valor`. **Importante:** las descripciones de valores son borradores no autoritativos pendientes de aprobación de la directiva. Cargá las que existan marcándolas claramente como provisionales en un comentario HTML, y no las presentes como definitivas.
> 5. Instituciones vinculadas: grid de `.card--institucion` poblado desde `data/instituciones.json`, con los logos `assets/img/institucional/utn-frre-logo.svg` y `assets/img/institucional/aneiqa-logo.svg`.
> 6. Documentos institucionales: `.card-documento` poblado desde `data/documentos.json` (Estatuto y Reglamento de Sanciones), con enlace de descarga al PDF.
> 7. CTA final: fondo `--color-primary`, con "Sumate" → contacto y "Conocé los gabinetes" → gabinetes.
>
> Recordá que los bloques "Objetivos", "Comisión directiva" y "Galería" fueron eliminados de esta página por decisión cerrada (la comisión directiva se trasladó a Gabinetes). Verificá íconos Lucide `telescope` y `heart-handshake` con sus fallbacks. Responsivo y accesible. Al terminar, listame los pendientes de contenido que bloquean la publicación de la página.

---

### P3.10 — Gabinetes: hub y cuatro páginas hijas

- **Herramienta:** Claude Code
- **Objetivo:** Construir el hub `pages/gabinetes.html` y las cuatro páginas hijas dedicadas (`pages/gabinetes/cursos-y-conferencias.html`, `eventos.html`, `prensa-y-difusion.html`, `solidario.html`), cada una con URL propia, derivadas de un esqueleto común y pobladas desde `data/gabinetes.json`. Resultado: subárbol completo de Gabinetes navegable desde el submenú de la navbar, incluyendo el bloque de comisión directiva trasladado aquí.
- **Prerrequisitos:** P3.1 a P3.7. Decisión de páginas dedicadas cerrada (2026-05-16). `data/gabinetes.json` presente con los cuatro gabinetes en orden definitivo y descripciones corta y completa. `data/directiva.json` presente (comisión directiva). Contenido detallado por gabinete (actividades regulares e historia) pendiente de insumos de la directiva: condiciona el contenido, no la estructura. Fotos de la directiva pendientes (`foto: null` en el JSON).

> **Prompt:**
> Sitio AChETIQ, stack vanilla. Construí el subárbol completo de Gabinetes. Leé `FASE_1_Wireframes.md` Sección 3 (wireframe de Gabinetes), `FASE_0_Arquitectura.md` Sección 5 (estructura) y `data/gabinetes.json`. Recordá la decisión cerrada: cada sub-opción del submenú es una página dedicada con URL propia y archivo HTML independiente; no se usa plantilla parametrizada por hash.
>
> Producí:
> 1. **Hub `pages/gabinetes.html`:** introducción a los gabinetes como estructura de trabajo de la asociación, grid de cuatro tarjetas (una por gabinete, desde `data/gabinetes.json`) que enlazan a cada página hija, y el bloque de **comisión directiva** trasladado desde "Sobre AChETIQ", poblado desde `data/directiva.json` con `.card-integrante` (foto + nombre + cargo; cuando `foto` sea null, usar un placeholder neutro de la paleta, no una imagen externa).
> 2. **Cuatro páginas hijas** en `pages/gabinetes/`, con los slugs cerrados `cursos-y-conferencias.html`, `eventos.html`, `prensa-y-difusion.html`, `solidario.html`. Derivá las cuatro de un mismo esqueleto (header con nombre del gabinete, descripción completa, sección de actividades regulares, sección de historia). Poblá lo disponible desde `data/gabinetes.json`; donde el contenido detallado aún no exista (actividades, historia por gabinete), mostrá un `empty-state` o el texto provisional marcado como tal, nunca contenido inventado.
>
> Mantené header/footer inyectados por fetch idénticos al resto del sitio. Las rutas relativas deben funcionar correctamente desde el subdirectorio `pages/gabinetes/` (verificá los enlaces a `assets/`, `data/` y `partials/`; considerá rutas absolutas desde la raíz del sitio para evitar fragilidad). Responsivo y accesible. Al terminar, entregame la lista de contenidos por gabinete que la directiva debe proveer para que las cuatro páginas sean publicables.

---

### P3.11 — Recursos Académicos: hub, apuntes y andamiaje de herramientas

- **Herramienta:** Claude Code
- **Objetivo:** Construir el hub `pages/recursos.html` y la página de apuntes por materia `pages/recursos/apuntes.html` (grid de las materias del plan de estudios desde `data/recursos.json`), y dejar el andamiaje de las dos herramientas interactivas (`calendario.html` y `seguimiento.html`) con su estructura y un estado "En preparación", a la espera de sus especificaciones funcionales (Fase 4). Resultado: subárbol de Recursos navegable, con la sección de apuntes operativa y las herramientas reservadas.
- **Prerrequisitos:** P3.1 a P3.7. `data/recursos.json` presente (41 materias del Plan 2023 con `id`, `nombre`, `anio`). Wireframe de Recursos cerrado en `FASE_1_Wireframes.md` (Sección 4). Colores placeholder por año para `.card-materia` definidos en P3.7 (paleta Océano & Areia). Las especificaciones funcionales de calendario y seguimiento NO existen aún (se elaboran en Fase 4): por eso aquí solo se deja el andamiaje.

> **Prompt:**
> Sitio AChETIQ, stack vanilla. Construí el subárbol de Recursos Académicos. Leé `FASE_1_Wireframes.md` Sección 4, `data/recursos.json` y `FASE_1_Catalogo_Componentes.md` (`.card-materia`, `.pill-nav`).
>
> Producí:
> 1. **Hub `pages/recursos.html`:** presentación de la sección y accesos a sus tres servicios — Apuntes por materia, Calendario académico y Seguimiento de carrera — mediante tarjetas que enlazan a cada página hija. Integrá aquí la cuenta regresiva ya preparada (componente `partials/countdown-recursos.html`, migrado en P3.0) si corresponde según el wireframe; verificá su ubicación.
> 2. **`pages/recursos/apuntes.html`:** grid de materias (`.card-materia`) poblado desde `data/recursos.json`, con `.pill-nav` para filtrar por año (1° a 5°). Cada tarjeta usa el color placeholder por año definido en P3.7 y enlaza a la vista de la materia (o muestra estado "Sin apuntes aún" si no hay material, según el modelo que se cierre en Fase 4 P4.6). Incluí el mecanismo de aporte de material: nota visible con el correo `achetiq.resistencia+apuntes@aneiqa.org` y asunto "Envío de material académico".
> 3. **Andamiaje de `pages/recursos/calendario.html` y `pages/recursos/seguimiento.html`:** ambas con esqueleto base, header propio y un bloque "En preparación" (no un 404). No implementes su lógica todavía; su especificación funcional se define en Fase 4. Dejá comentarios indicando que el contenido interactivo se incorporará en P4.2 y P4.5 respectivamente.
>
> Verificá rutas relativas desde `pages/recursos/`. Responsivo y accesible. Al terminar, confirmame qué materias quedan sin apuntes para dimensionar el flujo de aporte.

---

### P3.12 — Página de Contacto (`pages/contacto.html`)

- **Herramienta:** Claude Code
- **Objetivo:** Construir la página de contacto con los canales institucionales poblados desde `data/redes.json`, el formulario de contacto (o el mecanismo de contacto elegido), la ubicación de la facultad y la tarjeta "Próximamente" de LinkedIn. Resultado: `pages/contacto.html` funcional, con un método de envío de mensajes coherente con un sitio estático.
- **Prerrequisitos:** P3.1 a P3.7. Wireframe de Contacto cerrado en `FASE_1_Wireframes.md` (Sección 5). `data/redes.json` presente (email `achetiq.resistencia@aneiqa.org`, Instagram activo, LinkedIn null → "Próximamente", dirección de la facultad). **Decisión a tomar antes de implementar:** un sitio estático en GitHub Pages no procesa formularios por sí mismo; hay que elegir el mecanismo (servicio externo de formularios tipo Formspree/Getform, enlace `mailto:`, o redirección a email). Esta decisión se confirma con el usuario dentro del prompt.

> **Prompt:**
> Sitio AChETIQ, stack vanilla. Construí `pages/contacto.html` según `FASE_1_Wireframes.md` Sección 5. Leé `data/redes.json` y `FASE_1_Catalogo_Componentes.md` (`.contact-card`).
>
> Antes de implementar el formulario, planteame el dilema y esperá mi decisión: GitHub Pages sirve archivos estáticos y no procesa envíos de formulario del lado del servidor. Las opciones son (a) integrar un servicio externo de formularios que recibe el envío y lo reenvía por correo —implica crear una cuenta y depender de un tercero—; (b) un enlace de correo directo que abre el cliente de email del visitante con destinatario y asunto precargados —sin dependencias, pero menos cómodo—; (c) mostrar solo los canales de contacto sin formulario. Explicame las tres en términos de cómo las vive el visitante y qué requiere cada una, y dejame elegir.
>
> Independientemente del formulario, construí: bloque de canales de contacto con `.contact-card` poblado desde `data/redes.json` (renderizá solo los canales con valor no-null; LinkedIn, al ser null, se muestra como tarjeta "Próximamente"); email institucional, Instagram y dirección de la facultad (Calle French 414, Resistencia, Chaco) con enlace a su web. Enlaces externos con `target="_blank" rel="noopener noreferrer"`. Si incluís mapa, que sea un enlace o un embed liviano, no un script pesado. Responsivo, accesible (labels asociados a cada campo si hay formulario), sin signos de exclamación. Al terminar, documentame la decisión de formulario tomada para registrarla en `PROMPT_CONTINUACION.md`.

---

### P3.13 — Página 404, integración de la cuenta regresiva y estados globales

- **Herramienta:** Claude Code
- **Objetivo:** Verificar y alinear la página `404.html` ya existente con el sistema de estilos definitivo, integrar formalmente la cuenta regresiva de Recursos al motor del sitio, y unificar los estados globales transversales (carga, vacío y error) para que todas las páginas los presenten de forma consistente. Resultado: experiencia coherente en bordes y casos límite en todo el sitio.
- **Prerrequisitos:** P3.1 a P3.12. `404.html` y `_includes/countdown-recursos.html` presentes (componentes anticipados; el countdown migrado a `partials/` en P3.0). Loader global implementado (P3.3) y motor de carga (P3.6).

> **Prompt:**
> Sitio AChETIQ, stack vanilla. Esta tarea unifica bordes y casos límite. Leé `404.html`, el componente de cuenta regresiva de Recursos y `assets/js/loaders.js` (P3.6).
>
> Hacé tres cosas:
> 1. **`404.html`:** revisá que use el esqueleto base, los tokens y los componentes definitivos (navbar, footer, tipografía). Debe ofrecer un mensaje claro de "página no encontrada", sin signos de exclamación, y enlaces de retorno al inicio y a las secciones principales. Verificá que GitHub Pages la sirva como página de error (basta con que esté en la raíz del sitio publicado).
> 2. **Cuenta regresiva de Recursos:** confirmá su integración al sitio (CSS importado desde `main.css`, lógica como módulo, datos de la fecha objetivo desde un JSON o configuración explícita, no hard-codeada de forma frágil). Respetá la decisión de marca: los dígitos nunca usan terracota (`--color-cta` se reserva a botones de acción); usá `--color-primary` o `--color-ink`.
> 3. **Estados globales:** revisá que los tres estados del patrón `data-loader` —carga (loader Bouncing Dots), vacío (`empty-state`) y error— estén estilados de forma consistente y accesible (`role="status"`, `aria-live`) y se vean igual en todas las páginas. Si encontrás divergencias entre páginas, unificalas.
>
> Sin dependencias. Al terminar, reportame cualquier inconsistencia de estilo que hayas tenido que corregir entre páginas.

---

### P3.14 — Control de calidad: responsivo, cross-browser y rendimiento

- **Herramienta:** Claude Code
- **Objetivo:** Auditar el sitio completo en local antes del despliegue: comportamiento responsivo en los tres breakpoints, consistencia visual entre navegadores, ausencia de desplazamiento horizontal, correcto funcionamiento de navbar/submenús/acordeón, carga de todos los JSON, y una primera medición de Lighthouse. Resultado: informe de hallazgos con correcciones aplicadas y lista de pendientes residuales.
- **Prerrequisitos:** P3.8 a P3.13 completos (todas las páginas construidas). Entorno de previsualización local (servidor estático). Las auditorías profundas de accesibilidad, SEO y performance se realizan en la Fase 6; esta es una verificación funcional de cierre de la construcción.

> **Prompt:**
> Sitio AChETIQ, stack vanilla. Realizá una auditoría funcional de calidad de todo el sitio en local, previa al despliegue. Levantá un servidor estático local para previsualizar (por ejemplo, un servidor HTTP simple sobre la raíz del repo) y recorré las cinco páginas prioritarias y sus páginas hijas.
>
> Verificá y, donde corresponda, corregí:
> 1. **Responsivo:** comportamiento correcto en móvil (≈375 px), tablet (≈768 px) y desktop (≈1280 px). Ausencia total de desplazamiento horizontal. Tipografía y espaciados legibles en cada tamaño.
> 2. **Navegación:** navbar sticky funcional; submenús de Gabinetes y Recursos abriéndose por hover/focus en desktop; panel lateral y acordeón en móvil; lock de scroll del body solo con el panel abierto; el label general de cada ítem con submenú navega directo.
> 3. **Carga de datos:** todos los `data-loader` resuelven su JSON; los estados de carga, vacío y error se muestran correctamente; ningún error de fetch rompe una página.
> 4. **Enlaces:** ningún enlace interno roto; rutas correctas desde los subdirectorios; enlaces externos con `rel` adecuado.
> 5. **Consola:** sin errores de JavaScript en consola en ninguna página.
> 6. **Lighthouse (medición inicial):** corré Lighthouse sobre Inicio y una página hija; reportame las cuatro puntuaciones (Performance, Accessibility, Best Practices, SEO) como línea de base, sin optimizar todavía (eso es Fase 6).
>
> Entregame un informe estructurado: hallazgos por categoría, correcciones aplicadas, y pendientes que conviene resolver en Fase 6. No instales dependencias de build; el servidor local es solo para previsualizar.

---

### P3.15 — Cierre de Fase 3: control de calidad de código, versionado y continuidad

- **Herramienta:** Claude Code
- **Objetivo:** Dejar la Fase 3 cerrada y trazable: revisión de calidad del código (consistencia BEM, uso exclusivo de tokens, ausencia de hard-coding, comentarios útiles), confirmación de la estructura final de directorios, commit ordenado del trabajo, y actualización de los documentos de continuidad (`PROMPT_CONTINUACION.md` y `FASE_0_Arquitectura.md` §5 si cambió el árbol). Resultado: repositorio limpio, versionado y documentado, listo para iniciar la Fase 4.
- **Prerrequisitos:** P3.14 completo (auditoría funcional cerrada). Acceso al repositorio con Git configurado.

> **Prompt:**
> Sitio AChETIQ, stack vanilla. Cerrá formalmente la Fase 3. Leé `INSTRUCCION_PROYECTO.md` §7 (convenciones) y §9 (checklist de validación) y `PROMPT_CONTINUACION.md`.
>
> Tareas:
> 1. **Revisión de código:** recorré las hojas CSS y los módulos JS verificando metodología BEM consistente, uso exclusivo de variables `var(--token)` (sin hex ni nombres de fuente hard-codeados), ausencia de `innerHTML` con datos sin sanitizar, y comentarios que expliquen lo no obvio. Corregí desviaciones menores; reportame las que impliquen una decisión.
> 2. **Estructura final:** confirmá que el árbol de directorios coincide con `FASE_0_Arquitectura.md` §5; si difiere, actualizá ese documento.
> 3. **Versionado:** preparame un commit (o una serie de commits temáticos) con mensajes claros en español describiendo el trabajo de Fase 3. Mostrame el `git status` y el plan de commits antes de ejecutarlos, y esperá mi confirmación.
> 4. **Continuidad:** actualizá `PROMPT_CONTINUACION.md` con el estado exacto al cierre de Fase 3 (qué quedó construido, qué pendientes de contenido bloquean la publicación, decisiones tomadas como la del formulario de contacto) y registrá los pendientes que pasan a Fase 4.
>
> No despliegues todavía (eso es Fase 5). Al terminar, dame un resumen del estado de cierre de la fase.

---

# FASE 4 — CONTENIDO ACADÉMICO Y HERRAMIENTAS INTERACTIVAS

> **Meta de la fase.** Dotar al sitio de su contenido sustantivo y de sus dos herramientas interactivas. Comprende la definición funcional y la implementación del calendario académico y de la planilla de seguimiento de carrera, la construcción del sistema de apuntes por materia, y la redacción, validación y carga del contenido institucional (historia, misión y visión, valores, gabinetes). Al cierre, el sitio deja de mostrar placeholders y exhibe contenido real validado por la comisión directiva.
>
> **Secuencia recomendada:** P4.1 → P4.2 (calendario); P4.3 → P4.4 → P4.5 (seguimiento); P4.6 (apuntes); P4.7 y P4.8 (contenido institucional y gabinetes, en paralelo con lo anterior); P4.9 (revisión editorial de cierre). Las herramientas dependen de su especificación previa; el contenido depende de insumos de la directiva.
>
> **Nota metodológica.** Esta fase concentra trabajo de decisión editorial y de diseño funcional. Aplicar estrictamente el ciclo de dos rondas (estructura → contenido) de `INSTRUCCION_PROYECTO.md` §5.2 y el marcado explícito de incertidumbres (§5.5). Ningún dato, fecha o cifra se publica sin validación de la fuente o de la directiva.

---

### P4.1 — Especificación funcional del calendario académico

- **Herramienta:** Claude Cowork
- **Objetivo:** Producir el documento de especificación funcional del calendario académico antes de escribir una sola línea de código: modelo de datos, tipos de evento, interacción del usuario, fuente de actualización y persistencia. Resultado: un documento de especificación (`content/spec_calendario.md`) cerrado y validado, que sirve de insumo único para la implementación P4.2.
- **Prerrequisitos:** Andamiaje de `pages/recursos/calendario.html` ya creado (P3.11). Recopilar la información de base del calendario: fechas de inicio y fin de cuatrimestre, semanas de exámenes finales, feriados académicos y eventos especiales de la UTN FRRe. Verificar si existe un calendario académico oficial publicado por la facultad y si es accesible; si no, el calendario se actualizará manualmente.

> **Prompt:**
> Sitio AChETIQ. Vamos a especificar funcionalmente el calendario académico de Recursos antes de programarlo. No escribas código en esta tarea: el producto es un documento de especificación. Leé `project_achetiq.md` (memoria, pendiente "Especificación funcional del calendario académico") y el andamiaje `pages/recursos/calendario.html`.
>
> Trabajemos en dos rondas. **Ronda 1 (estructura):** proponeme, con preguntas etiquetadas y opciones, las decisiones de diseño: (a) qué tipos de evento debe mostrar (inicio/fin de cuatrimestre, semanas de finales, feriados académicos, inscripciones, eventos de AChETIQ); (b) qué vistas ofrece al visitante (mensual, listado cronológico, o ambas) y qué filtros por tipo de evento; (c) de dónde salen los datos (un archivo JSON estático actualizado a mano por la comisión, o una fuente oficial si existe feed accesible de la facultad); (d) si guarda algo del lado del visitante (por ejemplo, marcadores personales) o es puramente informativo. Para cada decisión, describí las opciones en términos de cómo las vive el visitante, no en términos técnicos.
>
> **Ronda 2 (contenido):** una vez cerradas las decisiones, redactá `content/spec_calendario.md` con: modelo de datos propuesto (qué campos tiene cada evento), estructura del archivo `data/calendario.json`, descripción de cada vista e interacción, regla de actualización, y los criterios de aceptación. Marcá explícitamente cualquier dato que no puedas confirmar (por ejemplo, fechas oficiales que deban verificarse contra la facultad). No inventes fechas: si no las tengo, dejá el modelo con datos de ejemplo claramente rotulados como provisionales.

---

### P4.2 — Implementación del calendario académico interactivo

- **Herramienta:** Claude Code
- **Objetivo:** Implementar el calendario académico en `pages/recursos/calendario.html` según la especificación cerrada en P4.1, con su archivo de datos, sus vistas e interacción, en HTML/CSS/JS vanilla. Resultado: herramienta de calendario funcional, integrada al sitio y poblada con datos validados.
- **Prerrequisitos:** P4.1 completo (`content/spec_calendario.md` cerrado y validado). Datos del calendario verificados o marcados como provisionales. Fundación de Fase 3 disponible.

> **Prompt:**
> Sitio AChETIQ, stack vanilla. Implementá el calendario académico de Recursos según la especificación cerrada en `content/spec_calendario.md` (P4.1). Leé esa especificación íntegra antes de escribir; es la fuente de verdad de esta tarea.
>
> Producí: el archivo de datos `data/calendario.json` con la estructura especificada (poblado con los datos validados, o con datos de ejemplo rotulados como provisionales si los reales aún no están confirmados); el código de `pages/recursos/calendario.html` reemplazando el bloque "En preparación" por la herramienta real; el CSS del componente (importado desde `main.css`); y el módulo JS que renderiza las vistas, los filtros y, si se especificó, la persistencia de marcadores en el almacenamiento local del navegador.
>
> Cumplí: tokens y BEM; carga de datos vía el patrón `data-loader`/motor de carga (P3.6) con estados de carga, vacío y error; accesibilidad (navegación por teclado en la vista de calendario, roles ARIA, foco visible); responsivo mobile-first; sin dependencias externas (nada de librerías de calendario; construir la grilla con CSS). Respetá la decisión de marca de color. Al terminar, verificá los criterios de aceptación de la especificación y reportámelos uno por uno.

---

### P4.3 — Extracción estructural de la planilla de seguimiento de carrera

- **Herramienta:** Claude Cowork (con asistencia de Claude in Excel si está disponible)
- **Objetivo:** Extraer y documentar la estructura de la planilla Excel de seguimiento de carrera que usa actualmente el usuario, como insumo para diseñar su versión web. Resultado: un documento que describe columnas, fórmulas, lógica de correlatividades y cálculos (promedios, materias aprobadas, avance porcentual), sin réplica visual todavía.
- **Prerrequisitos:** El usuario debe subir su planilla Excel actual de seguimiento de carrera. Si no la sube, esta tarea no puede ejecutarse. La estructura del Plan 2023 ya está parcialmente en `data/recursos.json` (41 materias con año), que servirá de referencia cruzada.

> **Prompt:**
> Sitio AChETIQ. Adjunto mi planilla Excel de seguimiento de carrera. Necesito que extraigas y documentes su estructura para luego diseñar una versión web. No construyas todavía la versión web: el producto de esta tarea es una descripción estructural.
>
> Analizá la planilla y entregame un documento (`content/spec_seguimiento_extraccion.md`) que describa: las columnas y su significado; las fórmulas y cálculos presentes (promedio general, promedio con y sin aplazos, cantidad de materias aprobadas/regularizadas/pendientes, porcentaje de avance de la carrera); la lógica de correlatividades si la planilla la modela; los estados posibles de una materia (cursada, regular, aprobada, pendiente, etc.); y cualquier codificación por color o convención visual que uses. Cruzá las materias con `data/recursos.json` (41 materias del Plan 2023) e indicame discrepancias. Marcá explícitamente lo que no puedas inferir con certeza de la planilla. Este documento será el insumo de la especificación funcional (P4.4).

---

### P4.4 — Especificación funcional de la planilla de seguimiento de carrera

- **Herramienta:** Claude Cowork
- **Objetivo:** Definir funcionalmente la herramienta web de seguimiento de carrera a partir de la extracción de P4.3: qué calcula, cómo interactúa el estudiante, qué guarda y cómo. Resultado: documento de especificación (`content/spec_seguimiento.md`) cerrado y validado, insumo único de la implementación P4.5.
- **Prerrequisitos:** P4.3 completo (`content/spec_seguimiento_extraccion.md`). Decisión clave a tomar en el prompt: dado que es una herramienta personal por estudiante en un sitio estático, la persistencia natural es el almacenamiento local del navegador (los datos quedan en el dispositivo del estudiante, sin cuentas ni servidor). Confirmar esto y sus implicancias (los datos no se sincronizan entre dispositivos; conviene ofrecer exportar/importar).

> **Prompt:**
> Sitio AChETIQ. Vamos a especificar la herramienta web de seguimiento de carrera, basándonos en la extracción `content/spec_seguimiento_extraccion.md` (P4.3). No escribas código: el producto es la especificación funcional.
>
> Ronda 1 (estructura): planteame con preguntas etiquetadas y opciones las decisiones de diseño, descritas en términos de experiencia del estudiante: (a) qué métricas muestra (promedio, avance porcentual, materias por estado); (b) cómo carga el estudiante su información (marca el estado de cada materia del plan precargado desde `data/recursos.json`); (c) dónde se guardan sus datos —explicame que, al ser un sitio sin cuentas, lo natural es guardar en el propio navegador del estudiante, lo que significa que sus datos quedan en ese dispositivo y no viajan a ningún servidor; describime las implicancias (no se comparten entre la compu y el teléfono) y proponé ofrecer una función de exportar e importar los datos para respaldo; (d) si visualiza correlatividades.
>
> Ronda 2 (contenido): redactá `content/spec_seguimiento.md` con el modelo de datos del estado del estudiante, la lógica de cálculo de cada métrica (con las fórmulas exactas), las interacciones, la estrategia de guardado local y de exportar/importar, y los criterios de aceptación. Aclará explícitamente las limitaciones de privacidad y de portabilidad del enfoque elegido.

---

### P4.5 — Implementación de la planilla de seguimiento de carrera

- **Herramienta:** Claude Code
- **Objetivo:** Implementar la herramienta de seguimiento en `pages/recursos/seguimiento.html` según la especificación P4.4, con el plan de estudios precargado, los cálculos, el guardado en el navegador y la función de exportar/importar, en HTML/CSS/JS vanilla. Resultado: herramienta funcional y privada (datos en el dispositivo del estudiante).
- **Prerrequisitos:** P4.4 completo (`content/spec_seguimiento.md` cerrado). `data/recursos.json` como fuente del plan de estudios. Fundación de Fase 3.

> **Prompt:**
> Sitio AChETIQ, stack vanilla. Implementá la herramienta de seguimiento de carrera según `content/spec_seguimiento.md` (P4.4), que es la fuente de verdad. Reemplazá el bloque "En preparación" de `pages/recursos/seguimiento.html` por la herramienta real.
>
> Producí: el código de la página; el CSS del componente (importado desde `main.css`); y el módulo JS que precarga el plan de estudios desde `data/recursos.json`, permite marcar el estado de cada materia, calcula las métricas según las fórmulas de la especificación, guarda el estado en el almacenamiento local del navegador, y ofrece exportar e importar los datos como archivo. Mostrá de forma visible una nota que explique al estudiante que sus datos se guardan únicamente en su dispositivo.
>
> Cumplí: tokens y BEM; accesibilidad (formularios con labels, navegación por teclado, foco visible, anuncios de cambios con `aria-live`); responsivo; manejo robusto de datos corruptos o ausentes en el almacenamiento local (sin romper la página); sin dependencias externas. Respetá la decisión de marca de color (los datos numéricos nunca en terracota). Al terminar, verificá los criterios de aceptación de la especificación uno por uno y reportámelos.

---

### P4.6 — Sistema de apuntes por materia: modelo de datos y flujo de aporte

- **Herramienta:** Claude Cowork (modelo y flujo) + Claude Code (implementación)
- **Objetivo:** Definir e implementar cómo se asocian los apuntes a cada materia y cómo los estudiantes aportan material, sin infraestructura de servidor. Resultado: un modelo de datos para los apuntes por materia, la vista de detalle de materia conectada a ese modelo, y un flujo de aporte documentado (por correo, con curaduría de la comisión).
- **Prerrequisitos:** `pages/recursos/apuntes.html` construida (P3.11). `data/recursos.json` (materias). Decisión sobre dónde se alojan los archivos de apuntes (en el propio repositorio bajo `docs/apuntes/`, o enlazados desde un servicio externo de almacenamiento como una carpeta de Drive institucional). Correo de aporte ya definido: `achetiq.resistencia+apuntes@aneiqa.org`.

> **Prompt:**
> Sitio AChETIQ. Diseñemos el sistema de apuntes por materia. Primero la decisión de fondo (respondémela como diálogo, en términos no técnicos): los archivos de apuntes —¿conviene guardarlos dentro del propio sitio (lo que da control total pero hace crecer el repositorio y exige curaduría de cada archivo) o enlazarlos desde una carpeta de almacenamiento externa institucional (más liviano para el sitio, pero dependiente de ese servicio)? Explicame las dos con sus ventajas y riesgos y dejame elegir.
>
> Una vez decidido, definí el modelo de datos: cómo se asocia a cada materia de `data/recursos.json` su lista de apuntes (título, tipo, autor/aportante, fecha, enlace o ruta al archivo). Proponé la estructura de `data/apuntes.json` (o un campo dentro de `recursos.json`, lo que sea más mantenible) y mostrámela antes de implementar.
>
> Implementación (Claude Code, en una segunda etapa tras cerrar el modelo): la vista de detalle de cada materia que liste sus apuntes desde el modelo, con `empty-state` "Sin apuntes aún" para las materias sin material; y la sección de aporte que explique el flujo (enviar material al correo `achetiq.resistencia+apuntes@aneiqa.org` con asunto "Envío de material académico", curaduría por la comisión, publicación). Tokens, BEM, accesibilidad, responsivo, sin dependencias. Documentá el flujo de aporte también para la guía de colaboradores (Fase 7).

---

### P4.7 — Redacción, validación y carga del contenido institucional

- **Herramienta:** Claude Cowork
- **Objetivo:** Consolidar, elevar al registro institucional adecuado y cargar el contenido textual de identidad: historia, misión y visión, y valores. Resultado: los textos definitivos en `data/site_copy.json` (claves `mision_vision` y `valores`) y `data/historia.json` afinado, con las descripciones de valores validadas por la comisión directiva.
- **Prerrequisitos:** Borradores existentes en `content/historia.txt` y `content/mision_vision.txt`. Las seis descripciones de valores son borradores no autoritativos que requieren aprobación de la comisión directiva antes de fijarse. La timeline de historia (`data/historia.json`) cubre 2003–2026 con 14 hitos; pendiente el patrón de entrada ghost.

> **Prompt:**
> Sitio AChETIQ. Vamos a dejar listo el contenido institucional de identidad. Leé `content/historia.txt`, `content/mision_vision.txt`, `data/historia.json` y la memoria del proyecto (pendientes de validación de valores).
>
> Trabajemos por bloque, con validación. (1) **Misión y Visión:** revisá el texto actual, proponé una versión de registro institucional formal (sin signos de exclamación, sin coloquialismos) y, tras mi visto bueno, cargala en `data/site_copy.json` bajo la clave `mision_vision`. (2) **Valores:** las seis descripciones son borradores no autoritativos; presentámelas en una tabla (valor + descripción propuesta) para que las eleve a la comisión directiva. No las fijes en `data/site_copy.json` (clave `valores`) hasta que te confirme la aprobación de la directiva; marcalas como provisionales mientras tanto. (3) **Historia:** revisá la coherencia de los 14 hitos de `data/historia.json`, señalá cualquier dato dudoso para que lo verifique, y ayudame a definir el patrón de la entrada ghost final de la timeline.
>
> No inventes hechos históricos ni cifras: si un dato no está respaldado por el material que te di, marcámelo como pendiente de verificación. Respetá el nombre legal completo de la asociación.

---

### P4.8 — Recopilación y carga del contenido de los cuatro gabinetes

- **Herramienta:** Claude Cowork
- **Objetivo:** Completar el contenido detallado de los cuatro gabinetes (descripción, actividades regulares e historia) que la comisión directiva debe proveer, estructurarlo y cargarlo en `data/gabinetes.json` para que las páginas hijas construidas en P3.10 sean publicables. Resultado: las cuatro páginas de gabinete con contenido real, no placeholders.
- **Prerrequisitos:** Páginas hijas de Gabinetes construidas (P3.10). `data/gabinetes.json` con descripciones corta y completa ya presentes; faltan actividades e historia por gabinete. Insumos de la comisión directiva: imprescindibles. Fotos representativas de cada gabinete pendientes.

> **Prompt:**
> Sitio AChETIQ. Vamos a completar el contenido de los cuatro gabinetes (Cursos y Conferencias, Eventos, Prensa y Difusión, Solidario) para que sus páginas sean publicables. Leé `data/gabinetes.json` y el wireframe de Gabinetes.
>
> Primero, generame un formulario de solicitud de contenido claro y no técnico (uno por gabinete) que yo pueda pasarle a cada responsable: qué hace el gabinete, qué actividades regulares realiza, y un breve relato de su historia. Estructuralo según los campos que necesita `data/gabinetes.json`.
>
> A medida que yo te traiga las respuestas, ayudame a redactarlas en registro institucional formal y cargalas en `data/gabinetes.json` con la estructura correcta, validando conmigo cada gabinete antes de fijarlo. Para las fotos representativas de cada gabinete, dejá el campo preparado y un placeholder neutro hasta que estén disponibles. No inventes actividades ni fechas: cargá únicamente lo que la comisión provea. Respetá el nombre completo de cada gabinete según los slugs cerrados.

---

### P4.9 — Revisión editorial integral del contenido

- **Herramienta:** Claude Cowork
- **Objetivo:** Auditar la totalidad del contenido publicado del sitio buscando consistencia terminológica, registro uniforme, ausencia de placeholders olvidados, corrección del nombre legal, y cumplimiento de las prohibiciones de estilo. Resultado: informe de hallazgos editoriales con correcciones aplicadas y lista de contenidos aún pendientes de la directiva.
- **Prerrequisitos:** P4.1 a P4.8 en estado avanzado. Acceso a todos los `data/*.json` y a las páginas. `INSTRUCCION_PROYECTO.md` §6 (tono y redacción) como criterio.

> **Prompt:**
> Sitio AChETIQ. Realizá una revisión editorial integral de todo el contenido del sitio. Leé `INSTRUCCION_PROYECTO.md` §6 (tono, redacción y registro) como criterio normativo, y recorré todos los `data/*.json` con texto y todas las páginas.
>
> Verificá y corregí (consultándome ante cualquier cambio de fondo): consistencia del nombre legal completo "Asociación Chaqueña de Estudiantes Tecnológicos de Ingeniería Química" y de la sigla AChETIQ; registro institucional uniforme en todas las secciones; ausencia de signos de exclamación y de coloquialismos; ausencia de placeholders, "lorem ipsum" o textos provisionales olvidados que hayan quedado publicados; consistencia terminológica (nombres de gabinetes, de materias, de instituciones). Entregame un informe con los hallazgos por categoría, las correcciones aplicadas, y la lista de contenidos que siguen pendientes de la comisión directiva y bloquean una publicación completa.

---

# FASE 5 — DESPLIEGUE EN GITHUB PAGES Y DOMINIO

> **Meta de la fase.** Publicar el sitio en producción sobre GitHub Pages, configurar el dominio personalizado, verificar el funcionamiento en el entorno real, y dar de baja de forma ordenada el sitio anterior en Wix. Al cierre, el sitio oficial de AChETIQ está en línea, accesible desde su dominio, y el visitante encuentra la nueva plataforma en lugar de la antigua.
>
> **Secuencia recomendada:** P5.1 → P5.2 → P5.3 → P5.4 → P5.5. Estrictamente secuencial.
>
> **Nota sobre el alcance de publicación.** Conviene aplicar la estrategia de lanzamiento progresivo ya recomendada: publicar v1.0 con las páginas cuyo contenido esté validado (Inicio, Sobre AChETIQ, Gabinetes, Contacto), incorporando Recursos y el resto en versiones sucesivas a medida que la directiva complete los insumos. Confirmar el alcance exacto de v1.0 con la directiva antes de P5.2.

---

### P5.1 — Preparación del repositorio para publicación

- **Herramienta:** Claude Code
- **Objetivo:** Dejar el repositorio en condiciones de ser publicado por GitHub Pages: confirmar que se sirve como sitio estático sin procesamiento de Jekyll no deseado, definir la rama y carpeta de publicación, revisar rutas y `.gitignore`, y preparar el archivo de dominio. Resultado: repositorio listo para activar Pages sin sorpresas de rutas ni de build.
- **Prerrequisitos:** Fase 3 cerrada (P3.15) y contenido de v1.0 validado (Fase 4, alcance acordado). Cuenta y organización de GitHub de AChETIQ definidas (pendiente: nombre de usuario/organización de GitHub).

> **Prompt:**
> Sitio AChETIQ, stack vanilla. Preparemos el repositorio para publicarlo en GitHub Pages. Recordá que el stack es estático puro: GitHub Pages no debe intentar procesarlo con Jekyll de forma indebida. Leé `FASE_0_Arquitectura.md` §5 y `.gitignore`.
>
> Tareas: (1) Como el sitio no usa Jekyll, agregá un archivo `.nojekyll` en la raíz para que GitHub Pages sirva el contenido tal cual, sin pasarlo por el motor de Jekyll (esto evita que carpetas o archivos que empiezan con guion bajo sean ignorados). (2) Verificá que todas las rutas a `assets/`, `data/`, `partials/` y `docs/` funcionen tanto desde la raíz como desde los subdirectorios `pages/`, `pages/gabinetes/` y `pages/recursos/` una vez publicado en el dominio; si hay rutas relativas frágiles, normalizalas a rutas absolutas desde la raíz del sitio. (3) Revisá `.gitignore` para no publicar archivos de trabajo internos ni los documentos de gestión que no correspondan al sitio público (decidí conmigo cuáles de los `.md` de gestión se publican y cuáles no). (4) Explicame en términos simples qué rama y qué carpeta conviene usar como origen de publicación. No actives Pages todavía; dejá el repositorio listo y reportame el estado.

---

### P5.2 — Publicación en GitHub y activación de GitHub Pages

- **Herramienta:** Claude Cowork (guía de pasos en la interfaz de GitHub) + Claude Code (operaciones Git)
- **Objetivo:** Subir el repositorio a GitHub bajo la cuenta/organización de AChETIQ y activar GitHub Pages, dejando el sitio accesible en la URL provista por GitHub (`usuario.github.io/repositorio` o equivalente). Resultado: sitio en línea en la URL por defecto de Pages, previo al dominio personalizado.
- **Prerrequisitos:** P5.1 completo. Nombre de usuario u organización de GitHub de AChETIQ definido (pendiente registrado). Acceso del usuario a esa cuenta. Dado que el usuario no tiene experiencia técnica, los pasos en la interfaz web de GitHub deben explicarse de forma guiada.

> **Prompt:**
> Sitio AChETIQ. Necesito publicar el repositorio en GitHub y activar GitHub Pages. No tengo experiencia técnica, así que guiame paso a paso y, donde se pueda, ejecutá vos las operaciones de Git por mí.
>
> Primero, confirmá conmigo el nombre de usuario u organización de GitHub de AChETIQ y el nombre del repositorio. Luego: (1) preparame los comandos de Git para subir el repositorio (o ejecutalos si tengo el acceso configurado), explicándome qué hace cada paso en lenguaje sencillo; (2) dame las instrucciones exactas, en la interfaz web de GitHub, para activar GitHub Pages indicando la rama y carpeta de origen definidas en P5.1, descritas como una secuencia de clics ("entrá en Settings, sección Pages, elegí…"); (3) decime qué URL pública me va a quedar y cómo verificar que el sitio está en línea. No configures todavía el dominio personalizado; eso es el paso siguiente.

---

### P5.3 — Configuración del dominio personalizado

> **Resuelto (2026-10-08):** el sitio oficial se publica en `https://achetiq.github.io` (GitHub Pages de la organización AChETIQ), sin dominio personalizado. Esta tarea queda sin efecto; se conserva como referencia por si en el futuro se adoptara un dominio propio.

- **Herramienta:** Claude Cowork (investigación y guía DNS) + Claude Code (archivo CNAME)
- **Objetivo:** Conectar un eventual dominio personalizado de AChETIQ al sitio de GitHub Pages, configurando el registro DNS en el proveedor del dominio y el archivo `CNAME` en el repositorio, con HTTPS activado. Resultado: el sitio accesible desde el dominio propio con certificado seguro.
- **Prerrequisitos:** P5.2 completo (sitio en línea en la URL de Pages). Dominio adquirido o por adquirir. Acceso al panel de gestión DNS del proveedor del dominio. Para dominios `.ar`, verificar el procedimiento de registro ante NIC Argentina.

> **Prompt:**
> Sitio AChETIQ. Quiero conectar el dominio personalizado de la asociación al sitio publicado en GitHub Pages. No tengo experiencia técnica; guiame.
>
> Primero, confirmá conmigo cuál es el dominio y aclarame si ya está adquirido o si hay que registrarlo. Si hay que registrarlo, explicame el procedimiento para un dominio argentino ante el organismo correspondiente, sin dar por ciertos datos que no puedas verificar: si no estás seguro de un paso o de un costo, decímelo y proponé verificarlo en la fuente oficial. Luego: (1) explicame qué registros DNS debo crear en el panel de mi proveedor de dominio para apuntar a GitHub Pages, descritos como pasos concretos; (2) creá el archivo `CNAME` en la raíz del repositorio con el dominio elegido y explicame para qué sirve; (3) indicame cómo activar HTTPS en la configuración de Pages y cómo verificar que el candado de seguridad funciona; (4) advertime de los tiempos de propagación de DNS para que no me preocupe si no funciona de inmediato. No publicites el dominio hasta verificar que resuelve correctamente.

---

### P5.4 — Verificación post-despliegue

- **Herramienta:** Claude Code (verificación técnica) + Claude Cowork (revisión funcional)
- **Objetivo:** Confirmar que el sitio en producción funciona correctamente en el entorno real: todas las páginas cargan, los JSON resuelven, los assets y PDF se sirven, los enlaces funcionan, el sitio se ve bien en móvil real, y HTTPS está activo. Resultado: checklist de verificación de producción cerrado, con incidencias corregidas.
- **Prerrequisitos:** P5.3 completo (dominio resolviendo con HTTPS). Acceso al sitio publicado.

> **Prompt:**
> Sitio AChETIQ. El sitio ya está publicado en su dominio. Verificá exhaustivamente que todo funcione en producción, no solo en local. Recorré el sitio en vivo y comprobá: (1) que todas las páginas de v1.0 cargan sin error; (2) que todos los `data/*.json` se sirven y los bloques dinámicos se pueblan; (3) que los assets (CSS, JS, fuentes, imágenes, SVG) y los PDF de `docs/` se descargan correctamente; (4) que no hay enlaces internos rotos ni rutas que funcionaban en local pero fallan en producción; (5) que el favicon aparece en la pestaña; (6) que HTTPS está activo y sin advertencias de contenido mixto; (7) que el sitio se ve y funciona bien en un teléfono real. Entregame un checklist con el estado de cada punto y corregí lo que dependa del código. Para lo que dependa de configuración externa (DNS, Pages), dame las instrucciones. Reportame cualquier diferencia entre el comportamiento en local y en producción.

---

### P5.5 — Baja ordenada del sitio Wix y redirección

- **Herramienta:** Claude Cowork
- **Objetivo:** Planificar y ejecutar la transición desde el sitio anterior en Wix hacia el nuevo, evitando que queden dos sitios oficiales activos y procurando que quien llegue al viejo encuentre el nuevo. Resultado: plan de migración de tráfico y baja del sitio Wix, con preservación de cualquier contenido que aún no se haya migrado.
- **Prerrequisitos:** P5.4 completo (nuevo sitio verificado en producción). Acceso a la cuenta de Wix. Inventario de contenido del sitio Wix que aún no se haya trasladado (verificar el estado activo del sitio anterior, registrado como pendiente). Verificar si el dominio estaba apuntando a Wix.

> **Prompt:**
> Sitio AChETIQ. El nuevo sitio ya está en producción y verificado. Planifiquemos la baja ordenada del sitio anterior en Wix para que no queden dos sitios oficiales activos. Antes de dar de baja nada, ayudame a inventariar qué contenido del sitio Wix todavía no migré al nuevo (noticias, fotos, textos) para no perder nada; lo que falte, registralo como pendiente de migración en versiones futuras. Después, explicame las opciones de transición en términos simples: si el dominio apuntaba a Wix, cómo redirigirlo al nuevo sitio; si Wix tenía su propia dirección, qué conviene hacer para que quien la visite encuentre el sitio nuevo o un aviso de mudanza. Advertime de cualquier riesgo (por ejemplo, perder el dominio o cortar el acceso antes de tiempo) y proponé un orden seguro de pasos. No ejecutes la baja hasta que yo confirme que el contenido está respaldado.

---

# FASE 6 — SEO, ACCESIBILIDAD Y SEGURIDAD

> **Meta de la fase.** Optimizar el sitio ya publicado para que sea encontrable en buscadores, accesible para todas las personas, rápido, y razonablemente seguro dentro de las posibilidades de un sitio estático. Al cierre, el sitio cumple WCAG 2.1 AA, expone metadatos y datos estructurados correctos, alcanza buenas puntuaciones de Lighthouse y aplica las medidas de seguridad viables en GitHub Pages.
>
> **Secuencia recomendada:** P6.1 → P6.2 → P6.3 → P6.4 → P6.5 → P6.6 → P6.7. Las auditorías (P6.5, P6.6) conviene repetirlas tras cada corrección.

---

### P6.1 — Metadatos SEO y tarjetas sociales por página

- **Herramienta:** Claude Code
- **Objetivo:** Completar, en cada página, los metadatos de SEO (título, descripción, canonical, idioma) y las etiquetas Open Graph y Twitter Card que controlan cómo se ve el sitio al compartirlo en redes y mensajería. Resultado: cada página con su `<title>`, `meta description`, canonical y tarjetas sociales propias, completando los placeholders dejados en el esqueleto base (P3.1).
- **Prerrequisitos:** Fase 5 (sitio publicado con dominio definitivo, necesario para las URL canónicas y de Open Graph). `INSTRUCCION_PROYECTO.md` §7.5 (SEO básico). Imagen social (OG image) — se produce en P6.2; coordinar.

> **Prompt:**
> Sitio AChETIQ, stack vanilla. Completá los metadatos de SEO y de tarjetas sociales en todas las páginas. Leé `INSTRUCCION_PROYECTO.md` §7.5 y el esqueleto base (P3.1), donde quedaron placeholders de Open Graph y Twitter Card.
>
> Para cada página (Inicio, Sobre AChETIQ, hub y páginas hijas de Gabinetes, hub y páginas de Recursos, Contacto), definí y aplicá: un `<title>` único con el patrón "{Título} · AChETIQ"; una `meta description` específica y descriptiva (sin relleno, sin signos de exclamación, en registro institucional); el `<link rel="canonical">` con la URL definitiva del dominio; y las etiquetas Open Graph (`og:title`, `og:description`, `og:type`, `og:url`, `og:image`, `og:locale` es_AR) y Twitter Card (`summary_large_image`). Usá la imagen social que se define en P6.2 (si aún no existe, dejá el `og:image` apuntando a la ruta prevista y avisame). Verificá que no haya descripciones duplicadas entre páginas. Al terminar, entregame una tabla con título y descripción de cada página para que la revise.

---

### P6.2 — Imagen social compartible (Open Graph image)

- **Herramienta:** Claude Design (exploración visual) + Claude Cowork (generación del archivo final)
- **Objetivo:** Diseñar y producir la imagen que se muestra cuando se comparte un enlace del sitio en redes y mensajería (formato Open Graph, típicamente 1200×630 px), coherente con la identidad visual Océano & Areia y el isotipo de AChETIQ. Resultado: el archivo de imagen optimizado en el repositorio, referenciado por las etiquetas `og:image`.
- **Prerrequisitos:** Identidad visual cerrada (paleta, tipografías, logo). Logo de AChETIQ en SVG disponible. Definir el mensaje o claim que acompaña al logo en la imagen, si lo hubiera.

> **Prompt:**
> Sitio AChETIQ. Necesito la imagen que aparece cuando alguien comparte un enlace del sitio en redes o WhatsApp (imagen de previsualización, formato 1200×630 píxeles). Primero, exploremos visualmente: proponéme dos o tres composiciones que usen la paleta Océano & Areia (fondo `#F5F2EC`, azul `#0D3B66`, terracota `#C8551C` solo como acento), el isotipo de AChETIQ y la tipografía institucional, con el nombre de la asociación y, si corresponde, una bajada breve. Describímelas o mostrámelas para que elija. Una vez que elija, generá el archivo de imagen final optimizado (peso reducido, sin perder nitidez), guardalo en `assets/img/` con un nombre claro (por ejemplo `og-image.png`), y decime la ruta exacta para enlazarla en las etiquetas `og:image` (P6.1). Mantené coherencia estricta con la identidad visual; nada de estilos ajenos a la marca.

---

### P6.3 — `sitemap.xml` y `robots.txt`

- **Herramienta:** Claude Code
- **Objetivo:** Generar el mapa del sitio (`sitemap.xml`) que ayuda a los buscadores a indexar todas las páginas, y el archivo `robots.txt` que indica qué pueden rastrear, ambos coherentes con el dominio definitivo. Resultado: ambos archivos en la raíz del sitio, válidos y enlazados.
- **Prerrequisitos:** Fase 5 (dominio definitivo). Lista cerrada de páginas públicas de v1.0.

> **Prompt:**
> Sitio AChETIQ, stack vanilla. Generá el `sitemap.xml` y el `robots.txt` del sitio. Para el `sitemap.xml`: incluí todas las páginas públicas de v1.0 con su URL absoluta en el dominio definitivo, su fecha de última modificación y una prioridad relativa razonable; no incluyas páginas en preparación ni archivos internos. Para el `robots.txt`: permití el rastreo del contenido público, excluí lo que no deba indexarse (por ejemplo, documentos de gestión si quedaron publicados), y referenciá la URL del `sitemap.xml`. Colocá ambos en la raíz del sitio. Validá que el XML esté bien formado. Al terminar, recordame que conviene enviar el `sitemap.xml` a la consola de búsqueda de Google una vez que el sitio esté estable, y explicame en términos simples para qué sirve.

---

### P6.4 — Datos estructurados (schema.org)

- **Herramienta:** Claude Code
- **Objetivo:** Añadir datos estructurados en formato JSON-LD que describen a AChETIQ como organización (y, donde aplique, las páginas como artículos o eventos), de modo que los buscadores comprendan mejor el contenido y puedan mostrar resultados enriquecidos. Resultado: bloques JSON-LD válidos insertados en las páginas correspondientes.
- **Prerrequisitos:** P6.1 (metadatos base). Datos institucionales confirmados: nombre legal, logo, redes sociales, dirección. `data/redes.json` e `data/instituciones.json`.

> **Prompt:**
> Sitio AChETIQ, stack vanilla. Añadí datos estructurados schema.org en formato JSON-LD. En todas las páginas (o en un fragmento común), incluí un bloque de tipo `Organization` (o el más específico `EducationalOrganization` si aplica) con: nombre legal completo "Asociación Chaqueña de Estudiantes Tecnológicos de Ingeniería Química", nombre alternativo "AChETIQ", logo, URL del sitio, perfiles de redes sociales tomados de `data/redes.json` (solo los no-null), y la dirección/afiliación con la UTN FRRe. Donde tenga sentido (por ejemplo páginas con información de contacto), agregá los campos pertinentes. No inventes datos: usá solo información confirmada en los JSON del proyecto. Validá mentalmente la sintaxis JSON-LD y decime cómo verificarla con la herramienta oficial de pruebas de resultados enriquecidos. Mantené los bloques JSON-LD separados del contenido visible (no afectan el render).

---

### P6.5 — Auditoría de accesibilidad WCAG 2.1 AA

- **Herramienta:** Claude Code
- **Objetivo:** Auditar el sitio completo contra WCAG 2.1 nivel AA y corregir las deficiencias: contraste de color, textos alternativos, jerarquía de encabezados, navegación por teclado, foco visible, roles ARIA, etiquetas de formulario, e idioma del documento. Resultado: informe de accesibilidad con correcciones aplicadas y puntuación de accesibilidad de Lighthouse ≥ 95 en todas las páginas.
- **Prerrequisitos:** Todas las páginas y herramientas construidas (Fases 3 y 4). `INSTRUCCION_PROYECTO.md` §7.4 (accesibilidad). Los componentes ya se construyeron con criterios AA; esta es la auditoría sistemática de cierre.

> **Prompt:**
> Sitio AChETIQ, stack vanilla. Realizá una auditoría de accesibilidad WCAG 2.1 nivel AA de todo el sitio y corregí las deficiencias. Leé `INSTRUCCION_PROYECTO.md` §7.4. Revisá página por página: (1) contraste de color de todo texto y elemento de interfaz contra su fondo, cumpliendo los umbrales AA; (2) texto alternativo significativo en imágenes informativas y `alt` vacío en las decorativas; los SVG con `role` y `aria-label` o `aria-hidden` según corresponda; (3) jerarquía correcta de encabezados (un solo `h1` por página, sin saltos de nivel); (4) navegación completa por teclado, incluidos navbar, submenús, acordeón móvil, calendario y formulario de seguimiento; foco siempre visible; sin trampas de foco; (5) roles y atributos ARIA correctos (`aria-expanded`, `aria-haspopup`, `role="menu"`, `aria-live` en estados dinámicos); (6) formularios con `label` asociado a cada control; (7) `lang` del documento y de fragmentos en otro idioma. Corregí lo que encuentres y entregame un informe por criterio. Corré Lighthouse Accessibility en cada página y reportame las puntuaciones; el objetivo es ≥ 95 en todas. Repetí la medición tras las correcciones.

---

### P6.6 — Auditoría de rendimiento (Lighthouse / Core Web Vitals)

- **Herramienta:** Claude Code
- **Objetivo:** Optimizar el rendimiento de carga del sitio: peso y formato de imágenes, carga de fuentes, minimización de CSS/JS, ausencia de desplazamiento de diseño (CLS), y tiempos de carga. Resultado: puntuaciones de Performance de Lighthouse altas y Core Web Vitals en verde, sin sacrificar la identidad visual.
- **Prerrequisitos:** Fase 5 (sitio en producción, donde se mide el rendimiento real). Imágenes y assets definitivos. SVG institucionales pendientes de optimización (vectorizados desde bitmap, ~30 KB cada uno) — registrado como pendiente menor.

> **Prompt:**
> Sitio AChETIQ, stack vanilla. Optimizá el rendimiento de carga del sitio sin alterar la identidad visual. Corré Lighthouse (Performance) sobre las páginas clave en producción y trabajá sobre los hallazgos. Revisá y mejorá: (1) imágenes —formato moderno (por ejemplo WebP donde convenga), dimensiones correctas, `loading="lazy"` en las que estén bajo el pliegue, y `width`/`height` explícitos para evitar saltos de diseño; (2) los dos SVG institucionales vectorizados desde bitmap (~30 KB c/u): optimizalos reduciendo su peso sin perder calidad; (3) carga de fuentes con `font-display: swap` y, si están self-hosted, `preload` de las críticas; (4) CSS y JS: eliminá reglas y código muertos, considerá minimización; (5) CLS: confirmá que la inyección de navbar y footer y la carga de datos no provoquen desplazamientos perceptibles. Reportame las puntuaciones antes y después y el estado de las tres métricas de Core Web Vitals. No introduzcas dependencias ni herramientas de build pesadas; mantené el enfoque estático y simple.

---

### P6.7 — Endurecimiento de seguridad

- **Herramienta:** Claude Code (configuración) + Claude Cowork (servicios externos)
- **Objetivo:** Aplicar las medidas de seguridad viables en un sitio estático sobre GitHub Pages: cabeceras de seguridad donde sea posible, atributos seguros en enlaces externos, protección contra spam del formulario de contacto, y revisión de que no haya datos sensibles expuestos en el repositorio público. Resultado: sitio endurecido dentro de las limitaciones de la plataforma, con sus restricciones documentadas.
- **Prerrequisitos:** Fase 5 (sitio publicado). Mecanismo de formulario de contacto decidido (P3.12). Conciencia de que GitHub Pages no permite configurar cabeceras HTTP arbitrarias del lado del servidor: algunas medidas se aplican vía meta-etiquetas y otras no son posibles; documentarlo con honestidad.

> **Prompt:**
> Sitio AChETIQ, stack vanilla sobre GitHub Pages. Apliquemos el endurecimiento de seguridad viable en esta plataforma, siendo honestos sobre sus límites. Aclará primero qué es y qué no es posible: GitHub Pages sirve archivos estáticos y no permite configurar libremente cabeceras HTTP de seguridad del lado del servidor; por lo tanto, algunas protecciones se aplican parcialmente mediante meta-etiquetas en el HTML y otras directamente no están disponibles. Sobre esa base: (1) aplicá una Content-Security-Policy razonable vía `<meta http-equiv>` acorde a un sitio sin dependencias externas (o documentá por qué no, si rompe funcionalidad); (2) confirmá que todos los enlaces externos usan `rel="noopener noreferrer"`; (3) si el formulario de contacto usa un servicio externo, configurá su protección anti-spam (por ejemplo, un campo trampa o el mecanismo que ofrezca el servicio) y revisá su política de privacidad; (4) auditá el repositorio público para confirmar que no contiene datos personales sensibles, credenciales, ni información que no deba ser pública (los correos institucionales son públicos a propósito; las cosas personales no). Entregame un informe de lo aplicado, lo no posible en la plataforma y las recomendaciones residuales.

---

# FASE 7 — MANTENIMIENTO Y ACTUALIZACIÓN COLABORATIVA

> **Meta de la fase.** Asegurar que el sitio pueda mantenerse y crecer en el tiempo por una comisión que rota y que, en su mayoría, no tiene formación técnica. Comprende la documentación para colaboradores no técnicos, los flujos de actualización de contenido, los controles periódicos de salud del sitio, y el roadmap de las versiones futuras. Al cierre, AChETIQ cuenta con un sitio sostenible, no dependiente de una sola persona.
>
> **Secuencia recomendada:** P7.1 → P7.2 → P7.3 → P7.4 → P7.5. P7.4 puede automatizarse como tarea programada.

---

### P7.1 — Guía de contribución para colaboradores no técnicos

- **Herramienta:** Claude Cowork
- **Objetivo:** Redactar una guía clara y sin jerga técnica que permita a cualquier miembro de la comisión directiva —presente o futuro— entender cómo está organizado el sitio y cómo realizar las actualizaciones habituales sin romper nada. Resultado: documento `GUIA_COLABORADORES.md` en el repositorio, escrito para personas sin experiencia en programación.
- **Prerrequisitos:** Sitio en producción y estructura estable (Fases 5 y 6). Conocimiento de cuáles son las tareas de mantenimiento recurrentes (actualizar redes, agregar apuntes, sumar integrantes a la comisión directiva, publicar una novedad).

> **Prompt:**
> Sitio AChETIQ. Redactá una guía de colaboradores (`GUIA_COLABORADORES.md`) pensada para miembros de la comisión directiva que no tienen experiencia en programación, presentes y futuros. Escribila en lenguaje claro, sin jerga técnica, explicando cada concepto la primera vez que aparezca. Cubrí: (1) una explicación simple de cómo está hecho el sitio (que el contenido vive en archivos de datos y que cambiar esos archivos cambia el sitio, sin necesidad de tocar el diseño); (2) cómo hacer las actualizaciones más frecuentes, paso a paso y con ejemplos: cambiar un dato de contacto o una red social, agregar apuntes a una materia, sumar o cambiar integrantes de la comisión, agregar un documento institucional; (3) qué cosas NO conviene tocar sin ayuda técnica; (4) cómo previsualizar un cambio antes de publicarlo y cómo pedir ayuda. Usá capturas conceptuales o ejemplos concretos de los archivos reales del proyecto (`data/redes.json`, `data/gabinetes.json`, etc.). Registro formal pero accesible, sin signos de exclamación.

---

### P7.2 — Flujo de actualización de contenido vía archivos de datos

- **Herramienta:** Claude Cowork
- **Objetivo:** Documentar de forma operativa, archivo por archivo, la estructura de cada `data/*.json` y las reglas para editarlo sin introducir errores, de modo que la actualización de contenido sea segura y repetible. Resultado: una referencia (`data/README.md` o sección de la guía) que describe cada archivo de datos, sus campos, sus valores válidos y ejemplos.
- **Prerrequisitos:** P7.1. Todos los `data/*.json` en su forma definitiva (Fase 4). Conocer las validaciones implícitas (por ejemplo, que un campo nulo se traduce en "Próximamente").

> **Prompt:**
> Sitio AChETIQ. Documentá la estructura de los archivos de datos para que actualizarlos sea seguro. Creá una referencia (`data/README.md`) que, para cada archivo de `data/` (`navbar.json`, `redes.json`, `gabinetes.json`, `directiva.json`, `recursos.json`, `historia.json`, `instituciones.json`, `documentos.json`, `calendario.json`, `apuntes.json` y los que existan), describa: para qué sirve, qué campos tiene cada elemento, qué valores son válidos en cada campo, qué pasa si un campo queda vacío o nulo (por ejemplo, un canal de red social nulo se muestra como "Próximamente"), y un ejemplo correcto. Incluí las reglas de oro para no romper el formato (respetar comillas, comas, no dejar comas finales, mantener la estructura). Explicá cómo verificar que un archivo quedó bien formado antes de publicar. Lenguaje claro para personas no técnicas, coherente con la guía de colaboradores (P7.1).

---

### P7.3 — Checklist de publicación de nuevas versiones

- **Herramienta:** Claude Cowork
- **Objetivo:** Establecer un procedimiento de control de calidad reproducible que la comisión deba seguir antes de publicar cualquier cambio o nueva versión, para evitar que un error llegue al sitio en vivo. Resultado: un checklist (`CHECKLIST_PUBLICACION.md`) accionable, derivado del checklist de validación de `INSTRUCCION_PROYECTO.md` §9.
- **Prerrequisitos:** Fases 5 y 6 cerradas (existe un sitio en producción y criterios de calidad establecidos). `INSTRUCCION_PROYECTO.md` §9.

> **Prompt:**
> Sitio AChETIQ. Redactá un checklist de publicación (`CHECKLIST_PUBLICACION.md`) que la comisión deba completar antes de publicar cualquier cambio en el sitio en vivo. Basate en el checklist de validación de `INSTRUCCION_PROYECTO.md` §9 y adaptalo a un uso operativo y no técnico. Incluí, como ítems verificables con casilla: que el cambio se previsualizó antes de publicar; que los archivos de datos modificados quedaron bien formados; que no quedaron textos provisionales ni placeholders; que los enlaces nuevos funcionan; que las imágenes nuevas están optimizadas y tienen texto alternativo; que se respetó el nombre legal y el registro de redacción; que el sitio sigue viéndose bien en el teléfono; y que el cambio se registró en el documento de continuidad. Ordenalo como una secuencia que se pueda seguir de principio a fin en pocos minutos. Lenguaje claro, sin jerga.

---

### P7.4 — Verificación periódica de salud del sitio

- **Herramienta:** Claude Cowork (puede configurarse como tarea programada)
- **Objetivo:** Establecer un control periódico automatizado o semiautomatizado que detecte problemas que aparecen con el tiempo: enlaces rotos (internos y externos), contenido vencido (por ejemplo, una cuenta regresiva pasada o actividades caducadas), documentos inaccesibles, y certificado de seguridad próximo a vencer. Resultado: un procedimiento de verificación recurrente, idealmente agendado, con un informe de hallazgos.
- **Prerrequisitos:** Sitio en producción estable. Definir la cadencia (por ejemplo, mensual). Para automatizarlo, decidir si se agenda como tarea recurrente.

> **Prompt:**
> Sitio AChETIQ. Quiero un control periódico de salud del sitio para detectar problemas que aparecen con el tiempo. Definí y, si lo agendamos, dejá programada una verificación recurrente (proponéme una cadencia razonable, por ejemplo mensual) que revise: enlaces internos y externos rotos; contenido vencido o desactualizado (por ejemplo, una cuenta regresiva ya pasada en Recursos, o actividades caducadas); que los documentos de `docs/` sigan descargándose; que el dominio y el certificado de seguridad sigan vigentes; y que las redes sociales enlazadas sigan activas. El resultado de cada control debe ser un informe breve con lo que está bien y lo que requiere acción. Para los problemas que dependan del código, indicame la corrección; para los de contenido, avisame qué actualizar. Si conviene, ofrecéme programarlo como tarea recurrente para que se ejecute solo y me avise.

---

### P7.5 — Roadmap de versiones futuras

- **Herramienta:** Claude Cowork
- **Objetivo:** Planificar la incorporación progresiva de las secciones que quedaron fuera de v1.0 (Actividades, Noticias, Galería) y de las mejoras diferidas, con criterios de priorización y dependencias, para guiar la evolución del sitio más allá del lanzamiento. Resultado: un documento de roadmap (`ROADMAP.md`) con versiones, alcance de cada una y requisitos de contenido.
- **Prerrequisitos:** v1.0 publicada y estable. Decisiones de arquitectura de Fase 0 (las secciones futuras ya están previstas: Actividades, Noticias, Galería). Estrategia de lanzamiento progresivo confirmada.

> **Prompt:**
> Sitio AChETIQ. Con v1.0 ya publicada, planifiquemos la evolución del sitio. Redactá un roadmap (`ROADMAP.md`) que organice en versiones sucesivas las secciones diferidas y las mejoras pendientes. Considerá que Actividades, Noticias y Galería ya estaban previstas en la arquitectura de Fase 0 y quedaron fuera de v1.0 por la estrategia de lanzamiento progresivo. Para cada versión futura (v1.1, v1.2, …), definí: qué secciones o funcionalidades incorpora; qué contenido y activos requiere de la comisión directiva antes de poder construirse; sus dependencias respecto de fases anteriores; y un criterio de priorización (por ejemplo, primero lo que más sirve a un estudiante activo). Incluí también las mejoras menores diferidas que figuren como pendientes en el proyecto (por ejemplo, optimización de los SVG institucionales, fotos de la directiva y de los gabinetes, alta de LinkedIn cuando exista). No te comprometas con fechas que no pueda sostener: ordená por prioridad y dependencia, no por calendario, salvo que yo te dé plazos.

---

## Apéndice A — Matriz de activos e insumos a recopilar

Consolidación de todo lo que la comisión directiva debe reunir, definir o subir para desbloquear los prompts. Es la lista de prerrequisitos de contenido del proyecto. Verificar y actualizar contra `INVENTARIO_Solicitud_de_Contenido.md`.

| Insumo / Activo | Necesario para | Estado |
|---|---|---|
| Imagen del hero (banner principal) | P3.8 (Inicio) | Pendiente (Bloque 7.1 del inventario) |
| Cuatro valores institucionales aprobados por la directiva | P3.9, P4.7 | Borradores no autoritativos |
| Patrón de entrada ghost de la timeline | P3.9, P4.7 | Pendiente de definición |
| Íconos Lucide por hito de la historia | P3.9 | Pendiente de selección |
| Contenido por gabinete (actividades, historia) | P3.10, P4.8 | Pendiente de la directiva |
| Fotos de la comisión directiva y de los gabinetes | P3.10, P4.8 | Pendientes |
| Decisión del mecanismo de formulario de contacto | P3.12 | A decidir |
| Datos del calendario académico (fechas oficiales UTN FRRe) | P4.1, P4.2 | A verificar en fuente oficial |
| Planilla Excel de seguimiento de carrera (subir) | P4.3 | A subir por el usuario |
| Decisión de alojamiento de los apuntes (repo vs externo) | P4.6 | A decidir |
| Nombre de usuario u organización de GitHub de AChETIQ | P5.2 | Pendiente |
| Dominio del sitio oficial | P5.3 | Resuelto: `https://achetiq.github.io` |
| Acceso a la cuenta de Wix e inventario de su contenido | P5.5 | Pendiente |
| Claim/mensaje para la imagen social | P6.2 | A definir |
| Cadencia de verificación periódica | P7.4 | A definir |

---

## Apéndice B — Matriz de dependencias entre fases

| Fase | Depende de | Entrega para |
|---|---|---|
| Fase 3 (front-end) | Fases 0, 1 y componentes anticipados (cerradas) | Estructura y páginas para todas las fases siguientes |
| Fase 4 (contenido y herramientas) | Fase 3 (páginas y andamiajes) + insumos de la directiva | Sitio con contenido real, sin placeholders |
| Fase 5 (despliegue) | Fase 3 cerrada + contenido de v1.0 validado (Fase 4, alcance acordado) | Sitio en producción con dominio |
| Fase 6 (SEO/a11y/seguridad) | Fase 5 (dominio definitivo para URL canónicas y métricas reales) | Sitio optimizado, accesible y endurecido |
| Fase 7 (mantenimiento) | Fases 5 y 6 (sitio estable y con criterios de calidad) | Sostenibilidad y evolución |

---

## Apéndice C — Registro de decisiones tomadas durante la ejecución

A completar a medida que se ejecutan los prompts. Cada decisión con margen editorial o técnico debe registrarse aquí y en `PROMPT_CONTINUACION.md` para mantener la trazabilidad exigida por `INSTRUCCION_PROYECTO.md` §5.8.

| Fecha | Prompt | Decisión tomada | Registrada en |
|---|---|---|---|
| | | | |

---

> **Cierre del documento.** Este plan cubre la totalidad del desarrollo pendiente del sitio AChETIQ, de la Fase 3 a la Fase 7, en prompts discretos, secuenciados y autocontenidos. Cada prompt indica su herramienta, su objetivo verificable y sus prerrequisitos. El documento debe leerse junto con `INSTRUCCION_PROYECTO.md` (metodología vinculante) y mantenerse actualizado en su Apéndice C conforme avanza la ejecución.
