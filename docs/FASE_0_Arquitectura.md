# Fase 0 — Planificación y Arquitectura de Información
## Sitio Web Oficial de AChETIQ
**Asociación Chaqueña de Estudiantes Tecnológicos de Ingeniería Química**

*Documento elaborado: 2026-05-08*
*Estado: Borrador de referencia para desarrollo*

---

## 1. Objetivos del Sitio

El sitio web de AChETIQ tiene como propósito central consolidar la presencia digital institucional de la asociación y servir como plataforma de valor académico y comunitario para los estudiantes de Ingeniería Química. Los objetivos específicos son:

1. **Institucional:** Dar visibilidad formal a la asociación, su estructura y sus actividades.
2. **Académico:** Centralizar recursos de estudio (apuntes, guías, bibliografía) organizados por materia.
3. **Comunitario:** Mantener informados a los estudiantes sobre eventos, actividades y novedades.
4. **Operativo:** Facilitar el contacto con la comisión directiva y los gabinetes de trabajo.

**Audiencia principal:** Estudiantes activos de la carrera de Ingeniería Química.
**Audiencias secundarias:** Ingresantes, egresados, docentes de la facultad.

---

## 2. Evaluación y Selección de Stack Tecnológico

Se evaluaron tres alternativas:

### Opción A — HTML/CSS/JS puro
- **Ventajas:** Control total, sin dependencias externas, carga extremadamente rápida, mantenimiento sencillo para colaboradores con conocimientos básicos.
- **Desventajas:** Contenido dinámico (noticias, galería) requiere actualización manual de HTML o uso de datos en JSON.
- **Adecuación:** Alta para un sitio mayormente estático con actualizaciones periódicas.

### Opción B — Jekyll + GitHub Pages
- **Ventajas:** Soporte nativo en GitHub Pages (build automático), sistema de blog integrado con Markdown, plantillas Liquid para reutilización de componentes.
- **Desventajas:** Requiere Ruby y conocimiento de Jekyll para colaboradores; pipeline de build añade complejidad.
- **Adecuación:** Alta si se prioriza la gestión de noticias/eventos en Markdown.

### Opción C — Astro
- **Ventajas:** Framework moderno, excelente rendimiento (zero JS por defecto), componentes reutilizables, soporte TypeScript.
- **Desventajas:** Curva de aprendizaje mayor; requiere Node.js y pipeline de CI/CD en GitHub Actions.
- **Adecuación:** Media-alta para el largo plazo; puede ser excesivo para la etapa inicial.

### ✦ Decisión adoptada: HTML/CSS/JS puro

*Confirmado el 2026-05-08.*

Se adoptó HTML/CSS/JS estático sin frameworks ni generadores. El contenido estructurado que requiera actualización frecuente (noticias, recursos, gabinetes, directiva) se gestionará mediante archivos **JSON** almacenados en el repositorio, cargados dinámicamente vía `fetch()`. Esta estrategia elimina toda dependencia de runtime y mantiene el control total del código, al tiempo que desacopla los datos de la presentación para facilitar actualizaciones por parte de colaboradores no especializados en HTML.

---

## 3. Mapa del Sitio (Site Map)

```
achetiq.github.io/
│
├── / (Inicio)
│   ├── Hero / Banner institucional
│   ├── Misión y presentación breve
│   ├── Accesos rápidos (Recursos, Eventos, Contacto)
│   └── Noticias recientes (preview, últimas 3)
│
├── /sobre-achetiq/ (Sobre AChETIQ)
│   ├── Historia de la asociación
│   ├── Misión y visión
│   ├── Comisión directiva (cargos + fotos)
│   └── Estatuto (descarga PDF)
│
├── /gabinetes/ (Gabinetes)
│   ├── Listado de gabinetes activos
│   └── /gabinetes/[nombre]/ (página individual por gabinete)
│       ├── Descripción y objetivos
│       └── Proyectos / iniciativas en curso
│
├── /recursos/ (Recursos Académicos)
│   ├── Índice por año de la carrera
│   ├── Índice por materia
│   └── /recursos/[materia]/ (página por materia)
│       ├── Apuntes y guías (descarga)
│       ├── Bibliografía recomendada
│       └── Links externos de interés
│
├── /actividades/ (Actividades)
│   ├── Próximas actividades (calendario)
│   └── Actividades pasadas (archivo)
│
├── /noticias/ (Noticias)
│   ├── Feed de noticias / artículos
│   └── /noticias/[slug]/ (artículo individual)
│
├── /galeria/ (Galería)
│   ├── Álbumes por evento o año
│   └── /galeria/[album]/ (fotos del álbum)
│
└── /contacto/ (Contacto)
    ├── Formulario de contacto
    ├── Redes sociales
    └── Información institucional (facultad, dirección)
```

---

## 4. Inventario de Contenido por Sección

### 4.1 Inicio
| Elemento | Tipo | Estado |
|---|---|---|
| Logo oficial AChETIQ | Imagen (SVG/PNG) | A obtener |
| Texto de misión (≤100 palabras) | Texto | A redactar |
| Foto/imagen institucional para hero | Imagen | A obtener |
| Últimas 3 noticias (preview) | Dinámico (colección) | Automático |

### 4.2 Sobre AChETIQ
| Elemento | Tipo | Estado |
|---|---|---|
| Historia de la asociación | Texto (500-800 palabras) | A redactar |
| Misión y visión | Texto (100-150 palabras c/u) | A redactar |
| Fotos + nombres + cargos de directiva | Imagen + texto | A obtener |
| Estatuto vigente | PDF | A obtener |

### 4.3 Gabinetes
| Elemento | Tipo | Estado |
|---|---|---|
| Lista de gabinetes activos | Texto estructurado | A definir |
| Descripción de cada gabinete | Texto (200-300 palabras) | A redactar |

### 4.4 Recursos Académicos
| Elemento | Tipo | Estado |
|---|---|---|
| Plan de estudios (para organización) | Referencia | A obtener |
| Archivos de apuntes/guías | PDF/DOCX | A recopilar |
| Bibliografía por materia | Texto estructurado | A redactar |

### 4.5 Actividades y Noticias
| Elemento | Tipo | Estado |
|---|---|---|
| Artículos de noticias pasadas | Markdown | A migrar/redactar |
| Próximas actividades | Datos estructurados | A cargar |
| Imágenes para notas | Imágenes | A obtener |

### 4.6 Galería
| Elemento | Tipo | Estado |
|---|---|---|
| Fotos de eventos pasados | Imágenes (optimizadas) | A recopilar |
| Metadatos de álbumes (nombre, fecha) | Texto | A definir |

### 4.7 Contacto
| Elemento | Tipo | Estado |
|---|---|---|
| Email institucional | Texto | A confirmar |
| Redes sociales (URLs) | Links | A confirmar |
| Dirección de la facultad | Texto | A confirmar |

---

## 5. Estructura de Repositorio

```
achetiq-lab/                      ← raíz del repositorio
│
├── index.html                    ← Inicio (única página HTML en la raíz)
├── 404.html                      ← página de error (servida por GitHub Pages)
│
├── pages/                        ← páginas internas del sitio
│   ├── sobre-achetiq.html
│   ├── gabinetes.html            ← hub de gabinetes
│   ├── recursos.html             ← hub de Recursos Académicos
│   ├── contacto.html
│   │
│   ├── gabinetes/                ← páginas hijas (una por gabinete)
│   │   ├── cursos-y-conferencias.html
│   │   ├── eventos.html
│   │   ├── prensa-y-difusion.html
│   │   └── solidario.html
│   │
│   └── recursos/                 ← sub-secciones de Recursos
│       ├── apuntes.html
│       └── seguimiento.html
│
├── partials/                     ← fragmentos HTML inyectados vía fetch()
│   ├── _boilerplate.html         ← esqueleto de referencia (no inyectado)
│   ├── navbar.html               ← barra de navegación global
│   ├── footer.html               ← pie de página institucional
│   └── countdown-recursos.html   ← cuenta regresiva de Recursos
│
├── data/                         ← datos en JSON (actualizables sin tocar HTML)
│   ├── directiva.json
│   ├── gabinetes.json
│   ├── recursos.json
│   ├── documentos.json
│   ├── historia.json
│   ├── instituciones.json
│   ├── redes.json
│   └── navbar.json               ← configuración de marca y enlaces de la navbar
│
├── assets/                       ← recursos estáticos del sitio
│   ├── css/                      ← hojas de estilo (una por componente)
│   │   ├── main.css              ← punto de entrada (importa el resto)
│   │   ├── navbar.css · footer.css · loader.css
│   │   ├── headers.css · text.css · figure.css · cta.css
│   │   ├── cards.css · lists.css · forms.css · nav-secondary.css
│   │   ├── states.css · error-404.css
│   │   └── countdown-recursos.css
│   ├── js/                       ← scripts vanilla (módulos ES nativos)
│   │   ├── loader.js             ← AChETIQBase (cálculo de raíz, rewriteTree)
│   │   ├── main.js               ← motor del patrón data-loader
│   │   ├── loaders.js            ← registro de renderers + defaults
│   │   ├── navbar.js · footer.js
│   │   ├── countdown-recursos.js
│   │   ├── apuntes.js            ← override del loader «recursos» (pills + estado)
│   │   └── gabinete-detalle.js   ← override de «gabinetes» para subpáginas
│   ├── fonts/                    ← tipografías autoalojadas (.woff2)
│   │   ├── geist-400-600.woff2
│   │   ├── geist-mono-400-500.woff2
│   │   ├── instrument-serif-400.woff2
│   │   └── instrument-serif-400-italic.woff2
│   └── img/
│       ├── logo/                 ← logo en variantes (SVG)
│       └── institucional/        ← logos de instituciones vinculadas
│
├── docs/                         ← archivos descargables (PDF)
│   ├── Estatuto.pdf
│   ├── Reglamento_Sanciones.pdf
│   └── Disenio_Curricular_IQ.pdf
│
├── content/                      ← contenido institucional fuente (texto)
│   ├── historia.txt
│   ├── mision_vision.txt
│   └── analisis_logo.md
│
├── tokens.css                    ← design tokens (paleta, escalas, z-index)
├── site.webmanifest              ← manifiesto PWA (mínimo)
├── favicon.ico · favicon.svg · apple-touch-icon.png · icon-192.png · icon-512.png
├── .nojekyll                     ← inhibe el procesamiento Jekyll en GitHub Pages
├── README.md
└── .gitignore
```

> **Nota de cierre de Fase 3 (2026-05-28).** El árbol anterior refleja el estado
> al cierre de la Fase 3 (desarrollo front-end completo). Diferencias respecto a
> versiones previas del documento:
>
> - **Páginas internas en `pages/`.** Salvo `index.html` y `404.html`, todas las
>   páginas (`sobre-achetiq`, `gabinetes`, `recursos`, `contacto`) viven en
>   `pages/`. La página de Actividades quedó fuera del alcance v1.0.
> - **Subpáginas en lugar de plantillas con `?id=`.** El subárbol de Gabinetes
>   y Recursos Académicos se resolvió con una página estática por hijo
>   (`pages/gabinetes/<slug>.html`, `pages/recursos/<sub-seccion>.html`) en
>   lugar de la plantilla única con query param prevista originalmente en
>   `INSTRUCCION_PROYECTO.md §4.2`. La alineación de ambos documentos queda
>   asentada como decisión pendiente al inicio de Fase 4 (P4.6 para la vista
>   individual de materia).
> - **Imágenes.** Se mantienen `assets/img/logo/` y `assets/img/institucional/`;
>   las carpetas `directiva/`, `gabinetes/` y `eventos/` se crearán recién
>   cuando lleguen los assets correspondientes (todavía pendientes según
>   `PROMPT_CONTINUACION.md`).
> - **Adiciones a `data/`.** Se sumó `navbar.json` para alimentar la
>   configuración del header sin tocar markup.
> - **PWA y favicons.** `site.webmanifest`, `favicon.{ico,svg}`,
>   `apple-touch-icon.png`, `icon-{192,512}.png` viven en la raíz para que
>   las rutas del manifiesto y de la navegación se resuelvan sin prefijo.
> - **`.nojekyll`.** Archivo vacío en la raíz para que GitHub Pages sirva el
>   sitio tal cual, sin pasarlo por Jekyll (los nombres de carpetas que
>   empiezan con `_` no se filtran).
>
> **Nota de reconciliación (2026-05-22).** Se eliminó el andamiaje residual de
> tipo Jekyll (`_includes/`): su único contenido útil —la cuenta regresiva de
> Recursos Académicos— se migró a `partials/countdown-recursos.html`. Los recursos
> estáticos se consolidaron bajo `assets/` (`assets/css/`, `assets/js/`,
> `assets/img/`); las carpetas `css/`, `js/` e `img/` de la raíz dejan de usarse.
> Los fragmentos HTML reutilizables (navbar, footer, includes) viven en `partials/`
> y se inyectan vía `fetch()`, no por un motor de plantillas.

---

## 6. Convenciones de Nomenclatura

- **URLs:** kebab-case en minúsculas, sin tildes ni caracteres especiales. Ejemplo: `/sobre-achetiq/`, `/recursos/fisicoquimica-i/`
- **Archivos de imagen:** `[contexto]-[descripcion]-[año].[ext]`. Ejemplo: `evento-charla-ingreso-2025.jpg`
- **Archivos de datos JSON:** snake_case. Ejemplo: `nombre_completo`, `cargo_actual`
- **Clases CSS:** BEM (Block-Element-Modifier). Ejemplo: `.card-noticia__titulo`, `.btn--primario`
- **Commits de Git:** mensajes en español, imperativo, máximo 72 caracteres. Ejemplo: `Agrega sección de recursos de Termodinámica`

---

## 7. Flujos de Usuario Principales

### Flujo 1: Estudiante busca apuntes de una materia
`Inicio` → `Recursos` → `Selecciona materia` → `Descarga archivo`

### Flujo 2: Estudiante se informa sobre la asociación
`Inicio` → `Sobre AChETIQ` → `Gabinetes` (opcional) → `Contacto`

### Flujo 3: Estudiante consulta próximas actividades
`Inicio` (preview de noticias) → `Actividades` o `Noticias` → `Artículo específico`

### Flujo 4: Ingresante conoce AChETIQ
`Inicio` → `Sobre AChETIQ` → `Contacto`

---

## 8. Decisiones Pendientes y Dependencias

| # | Decisión | Responsable | Impacto |
|---|---|---|---|
| D1 | ~~Aprobación del stack~~ → **HTML/CSS/JS puro. RESUELTO.** | — | — |
| D2 | Nombre de usuario de GitHub para la organización | Comisión directiva | URL base del sitio |
| D3 | ~~Dominio personalizado~~ → **Sitio oficial en https://achetiq.github.io. RESUELTO.** | — | — |
| D4 | Listado oficial de gabinetes activos | Comisión directiva | Sección Gabinetes |
| D5 | Logo e identidad visual oficial | Diseño (Fase 1) | Todo el sitio |
| D6 | Paleta de colores institucional | Diseño (Fase 1) | Todo el sitio |

---

## 9. Próximos Pasos (Fase 1)

1. Resolver las decisiones pendientes D1–D4 de la tabla anterior.
2. Iniciar **Fase 1 — Diseño Visual:** definición de identidad, paleta de colores, tipografía y wireframes de páginas clave.
3. Crear el repositorio en GitHub bajo la organización AChETIQ.
4. Configurar el repositorio base con la estructura definida en §5.

---

*Documento de referencia interna — AChETIQ / Proyecto Web 2026*
