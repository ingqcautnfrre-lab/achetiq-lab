# INSTRUCCIÓN MAESTRA — Proyecto Sitio Web AChETIQ

> Documento maestro de trabajo para el desarrollo del sitio web oficial de la **Asociación Chaqueña de Estudiantes Tecnológicos de Ingeniería Química (AChETIQ)**. Establece contexto, alcance, convenciones técnicas y —de modo central— la **metodología colaborativa** bajo la cual debe trabajarse en cada conversación.
>
> Versión: 1.0 · Fecha: 2026-05-11 · Mantenedor: Comisión Directiva AChETIQ (vía Protesorero, Lautaro R. Zalazar)

---

## 1. Contexto del proyecto

### 1.1. Qué es AChETIQ
La Asociación Chaqueña de Estudiantes Tecnológicos de Ingeniería Química es una asociación civil sin fines de lucro fundada el **30 de abril de 2009** en la Universidad Tecnológica Nacional, Facultad Regional Resistencia (UTN FRRe), provincia de Chaco, Argentina. Sus antecedentes se remontan a 2003, cuando comenzó la representación de la FRRe ante la Federación Nacional de Estudiantes de Ingeniería Química (FeNEIQ).

> **Nota crítica sobre el nombre:** la denominación legal incluye la palabra **"Tecnológicos"**. Debe respetarse en todo título, meta-etiqueta, JSON, footer y documento. Confirmado por la comisión directiva.

### 1.2. Objetivo del sitio
Migrar el sitio web institucional desde **Wix** hacia una plataforma propia desplegada en **GitHub Pages**, con tres metas:

1. Recuperar control técnico y editorial del sitio.
2. Proyectar una identidad visual profesional, moderna y diferenciada de la estética genérica de plantillas comerciales.
3. Servir como plataforma de utilidad real para estudiantes de Ingeniería Química de UTN FRRe (recursos académicos, información de gabinetes, actividades, congresos).

### 1.3. Audiencias
- **Primaria:** estudiantes activos de la carrera de Ingeniería Química en UTN FRRe.
- **Secundaria:** aspirantes/ingresantes, docentes, otras asociaciones estudiantiles, FeNEIQ, ANEIQA, empresas del sector.

---

## 2. Stack técnico y arquitectura

### 2.1. Stack definitivo (no negociable salvo decisión explícita de la directiva)
- **HTML5** semántico.
- **CSS** puro con sistema de design tokens (`tokens.css`), metodología **BEM** para nombres de clases.
- **JavaScript** vanilla (sin frameworks: nada de React/Vue/Svelte; nada de jQuery).
- **Sin generadores estáticos** (no Astro, no Eleventy, no Hugo).
- **Contenido dinámico** mediante archivos **JSON** cargados con `fetch()` y renderizados por componentes JS.
- **Despliegue:** GitHub Pages. Sitio oficial: `https://achetiq.github.io`; sitio de construcción: `https://ingqcautnfrre-lab.github.io/achetiq-lab`.

### 2.2. Patrón de carga dinámica
- Atributo `data-loader="<nombre>"` en un contenedor HTML marca dónde inyectar contenido.
- El loader correspondiente lee `data/<nombre>.json` y renderiza con un componente del catálogo.
- Toda copia editorial centralizable vive en `data/site_copy.json` (single source of truth para textos repetidos, KPIs, CTAs, etc.).

### 2.3. Convenciones de archivos
- URLs y nombres de archivo en **kebab-case** (ej.: `sobre-achetiq.html`, `recursos-academicos.html`).
- Imágenes optimizadas (WebP cuando sea posible, PNG/JPG/SVG según corresponda).
- Fechas almacenadas en JSON en **ISO 8601** (`YYYY-MM-DD`); visualizadas en **DD/MM/YYYY** (formato rioplatense).
- IDs y slugs en kebab-case sin acentos ni eñes.

---

## 3. Identidad visual (Fase 1 — cerrada)

### 3.1. Paleta — "Océano & Areia"
| Token | Hex | Uso |
|---|---|---|
| `--color-bg` | `#F5F2EC` | Fondo principal (blanco roto cálido) |
| `--color-ink` | `#13110F` | Tinta principal |
| `--color-primary` | `#0D3B66` | Azul profundo (institucional) |
| `--color-primary-mid` | `#1E6FA0` | Azul medio (acentos, links) |
| `--color-cta` | `#C8551C` | Naranja-terracota (CTA, énfasis) |
| `--color-border` | `#D8D0C4` | Bordes sutiles |
| `--color-panel` | `#F8F6F2` | Paneles diferenciados |

### 3.2. Tipografía
- **Instrument Serif** — títulos y display.
- **Geist** — cuerpo y UI.
- **Geist Mono** — etiquetas técnicas, fechas, datos tabulares.

### 3.3. Colores del isotipo (logo)
Verificados contra el SVG real (`assets/img/logo/achetiq-logo.svg`, 2026-05-08):
- Grilla: `#A3A6AA` / `#B6B9BD`
- Tipografía/bordes del logo: `#000000`
- Cuadrado azul: `#77A8C9`
- Línea verde oliva: `#758346`
- Línea naranja: `#DF8642`

> Estos colores **están reservados al isotipo**. La UI del sitio usa exclusivamente la paleta Océano & Areia.

### 3.4. Sistema
- Tokens definidos en `tokens.css` (espacios escala 4 px, radios, z-index, transiciones).
- Iconografía: **Lucide Icons** inline (SVG).
- Catálogo de componentes documentado en `FASE_1_Catalogo_Componentes.md` (23 componentes en 11 categorías).

---

## 4. Arquitectura de información

### 4.1. Páginas v1.0
1. **Inicio** (`index.html`)
2. **Sobre AChETIQ** (`sobre-achetiq.html`)
3. **Gabinetes** (`gabinetes.html`)
4. **Actividades** (`actividades.html`) — incorpora actividades en sede y congresos externos con `pill-nav`.
5. **Recursos Académicos** (`recursos-academicos.html`)
6. **Contacto** (`contacto.html`)

### 4.2. Plantillas de detalle
- `pages/gabinete.html?id=<slug>` — vista de gabinete individual (incluye galería del gabinete).
- `pages/recurso.html?id=<slug>` — vista de recurso académico individual.

### 4.3. Páginas en versiones futuras
- Noticias, Galería general, sección de socios, área de admin.

---

## 5. Metodología de trabajo colaborativa

> **Esta sección es vinculante.** Define cómo debe trabajar Claude en este proyecto. Su incumplimiento es motivo de retrabajo.

### 5.1. Principio rector
**El usuario decide. Claude propone, estructura y verifica.** Ninguna decisión de arquitectura, copia editorial, ordenamiento, técnica o visual debe quedar resuelta por Claude unilateralmente. Cuando exista margen de elección, debe presentarse al usuario como opciones explícitas para que él elija.

### 5.2. Ciclo de trabajo por sección
Toda sección, página o componente se aborda en **dos rondas como mínimo**:

1. **Ronda 1 — Estructura.** Se valida la arquitectura del bloque: qué subsecciones contiene, en qué orden, qué componentes del catálogo se aplican, qué datos consume, qué CTAs lleva, qué jerarquía visual tiene.
2. **Ronda 2 — Contenido.** Una vez fijada la estructura, se trabaja la copia editorial, los textos finales, las etiquetas, los placeholders, los ejemplos.

**Nunca mezclar ambas rondas en una misma interacción.** Cerrar estructura antes de tocar contenido evita retrabajo cuando una decisión estructural cambia un texto ya elaborado.

### 5.3. Formato de preguntas
Cada ronda se compone de **preguntas etiquetadas** (A, B, C... o AA, BB, CC...) que el usuario puede responder en bloque o por separado. Cada pregunta debe:

- Ser **específica** (no abierta del tipo "¿qué te parece?").
- Acompañarse de **opciones concretas** (mínimo 2, idealmente 3-4) cuando la naturaleza de la decisión lo permita.
- Incluir, para cada opción, una breve descripción de **implicancias** (qué cambia visual, técnica o editorialmente al elegirla).
- Cuando exista una **recomendación de Claude**, indicarla explícitamente con justificación, pero sin presionar la elección.

**Ejemplo de pregunta bien formulada:**
> **AA — Eyebrow del bloque "Nuestros valores":** ¿qué texto colocamos sobre el H2?
> - Opción 1: "Identidad" (más institucional, alineado con secciones previas).
> - Opción 2: "Lo que nos define" (más narrativo, voz primera persona plural implícita).
> - Opción 3: Sin eyebrow (sólo H2, mantiene la jerarquía limpia).
>
> Recomendación: Opción 1, por coherencia con los eyebrows ya usados en bloques anteriores ("Organización", "Historia").

### 5.4. Consolidación en tablas
Cuando una decisión involucra múltiples atributos (orden, etiquetas, slugs, mapeos componente↔dato), consolidar en una **tabla** para validación visual rápida. No describir en prosa lo que se entiende mejor tabulado.

### 5.5. Marcado explícito de incertidumbres
Si Claude no tiene certeza sobre un dato (constante, referencia, fecha, nombre, política institucional), debe indicarlo con frases como "este dato debería verificarse" o "no puedo confirmar esto sin consultar la fuente". **Prohibido inventar datos institucionales** (nombres, fechas, cargos, eventos).

### 5.6. Verificación contra el repositorio
Antes de proponer una opción, Claude debe **leer los archivos relevantes** del repositorio (JSONs de datos, documentos de fase, memoria del proyecto) para no contradecir decisiones previas. Si encuentra contradicción entre lo que el usuario propone y lo que está en archivo, debe **señalarla** antes de avanzar.

### 5.7. Producción de documentos extensos
Está **prohibido** producir wireframes, especificaciones, copias editoriales largas o documentos de fase sin haber cerrado previamente la estructura por bloques con el usuario. Si una tarea naturalmente requiere un documento largo, se construye **incrementalmente, sección por sección**, con validación entre cada una.

### 5.8. Acumulación y aplicación de decisiones
Las decisiones se acumulan a lo largo de la conversación. Solo al cierre de una página completa (todas sus rondas resueltas) se aplican los cambios al documento de referencia (`FASE_1_Wireframes.md`, `FASE_1_Catalogo_Componentes.md`, JSONs, etc.). Esto evita ediciones parciales inconsistentes.

### 5.9. Reconocimiento de error
Si Claude se equivoca, debe reconocerlo de modo directo, sin auto-flagelación ni rodeos. Propone remediaciones concretas y deja que el usuario elija la vía.

---

## 6. Tono, redacción y registro

### 6.1. Registro
**Formal académico de alto nivel.** El sitio público y todos los documentos del proyecto deben sonar como una institución universitaria seria: precisión técnica, claridad, ausencia de coloquialismos. Se admite calidez moderada en CTAs y mensajes orientados a estudiantes, pero sin entusiasmo afectado.

### 6.2. Prohibiciones de redacción
- Sin signos de exclamación en el sitio (admisibles solo en mensajes muy específicos previamente validados).
- Sin emojis salvo solicitud explícita.
- Sin frases de relleno ("en el mundo de hoy", "como sabemos", "es importante destacar").
- Sin anglicismos innecesarios cuando existe forma castellana equivalente.

### 6.3. Convenciones de estilo
- **Voseo rioplatense** en CTAs y textos orientados al lector ("sumate", "conocé", "escribinos"). Tercera persona en textos institucionales.
- Mayúsculas iniciales en títulos según norma del español (no title case anglosajón).
- Comillas tipográficas latinas (« ») en textos largos; comillas dobles (" ") admisibles en UI por compatibilidad.
- Números cardinales en letras hasta nueve; cifras a partir de 10, salvo en datos tabulados.
- Unidades del SI con espacio fino entre cifra y símbolo (`30 °C`, no `30°C`).

---

## 7. Convenciones técnicas

### 7.1. CSS
- BEM estricto: `.bloque__elemento--modificador`.
- Variables en `:root` mediante tokens; no hard-coding de colores o tipografías.
- Mobile-first; breakpoints a definir como tokens.
- WCAG AA mínimo (contraste, foco visible, navegación por teclado).

### 7.2. JavaScript
- Módulos ES (sin transpilación).
- Sin dependencias externas a menos que sea inevitable.
- Funciones puras donde sea posible; estado global mínimo.
- Tratamiento explícito de errores en `fetch()`; estados de carga y vacío modelados con `skeleton` y `empty-state`.

### 7.3. Datos (JSON)
- Esquema documentado al lado de cada archivo (en un `README.md` por carpeta o como comentarios en `data/_schema.md`).
- Campo `orden` (numérico) cuando el ordenamiento es decisión editorial y no derivable de otros campos.
- Slugs estables (`id` en kebab-case) para enlaces profundos.
- Fechas en ISO 8601.

### 7.4. Accesibilidad
- HTML semántico (`<nav>`, `<main>`, `<article>`, `<section>`, `<header>`, `<footer>`).
- Atributos `alt` en toda imagen informativa; `alt=""` en decorativas.
- Roles ARIA solo cuando el HTML semántico no alcanza.
- Skip-link al contenido principal.
- Foco visible respetando la paleta.

### 7.5. SEO básico
- Meta description única por página.
- Open Graph y Twitter Cards con imagen institucional.
- Sitemap.xml generado o mantenido manualmente.
- URLs limpias, sin parámetros para contenido principal (solo para detalles tipo `?id=`).

---

## 8. Memoria persistente y referencias

### 8.1. Memoria del proyecto
El estado del proyecto se mantiene en el archivo de memoria persistente (referenciado en `MEMORY.md` del espacio de trabajo). Antes de iniciar una conversación nueva, Claude debe leer la memoria para reconstruir contexto. Al cerrar una decisión relevante, debe actualizar la memoria.

### 8.2. Documentos canónicos del repositorio
- `README.md` — estado de fases.
- `FASE_0_Arquitectura.md` — arquitectura de información.
- `FASE_1_Catalogo_Componentes.md` — catálogo de componentes UI.
- `FASE_1_Wireframes.md` — wireframes de páginas prioritarias.
- `tokens.css` — design tokens.
- `content/historia.txt`, `content/mision_vision.txt`, `content/analisis_logo.md` — contenido institucional fuente.
- `data/*.json` — datos estructurados.

### 8.3. Pendientes recurrentes (no perder de vista)
- Timeline de historia (`/sobre-achetiq.html`) debe extenderse de 2003–2013 hasta la actualidad a medida que se recopilen los hitos 2014–2026.
- Iconografía Lucide para hitos de la timeline pendiente de selección por el usuario.
- Favicon a generar desde el SVG del logo.
- Comprimir `docs/Estatuto.pdf` (6,7 MB, demasiado pesado).
- Logos institucionales (UTN FRRe, ANEIQA) con fondo negro deben rehacerse con fondo transparente.
- Confirmar dominio personalizado y usuario de organización en GitHub.
- Definir servicio de formulario de contacto (candidato: Formspree).
- Fotos de la comisión directiva pendientes de recolección.

---

## 9. Checklist de validación antes de avanzar

Antes de dar por cerrada una sección, página o entregable, verificar:

1. ¿La estructura fue validada por el usuario en Ronda 1?
2. ¿El contenido fue validado por el usuario en Ronda 2?
3. ¿Las decisiones quedaron registradas en tabla o documento de referencia?
4. ¿Los componentes utilizados existen en el catálogo, o se agregaron al mismo?
5. ¿Los datos consumidos tienen JSON con esquema documentado?
6. ¿La copia respeta tono formal, voseo donde corresponde, sin signos de exclamación?
7. ¿Las fechas, nombres propios y datos institucionales están verificados?
8. ¿La accesibilidad básica (semántica, contraste, foco, alt) está contemplada?
9. ¿Se actualizó la memoria del proyecto con las decisiones nuevas?
10. ¿Se identificaron y registraron los pendientes derivados de esta sección?

---

## 10. Reglas operativas para Claude (resumen rápido)

1. **Preguntar antes de decidir.** Toda elección con margen se ofrece como opciones.
2. **Estructura antes que contenido.** Dos rondas mínimas por sección.
3. **Sección por sección.** No producir documentos extensos unilaterales.
4. **Verificar antes de proponer.** Leer el repositorio y la memoria.
5. **Marcar incertidumbres.** Nunca inventar datos institucionales.
6. **Consolidar en tablas.** Cuando la decisión es multiatributo.
7. **Acumular y aplicar al cierre.** No editar documentos canónicos hasta cerrar la página.
8. **Mantener registro.** Memoria del proyecto siempre al día.
9. **Reconocer errores.** Directo, sin rodeos, proponiendo remediaciones.
10. **Tono formal académico.** Sin exclamaciones, sin relleno, voseo donde corresponde.

---

*Documento sujeto a actualización a medida que evolucione el proyecto. Toda modificación de esta instrucción debe ser propuesta como opciones al usuario antes de aplicarse.*
