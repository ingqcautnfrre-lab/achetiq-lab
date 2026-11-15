# Series Resueltas — documentación técnica

Sección de **Recursos Académicos** que reúne series de ejercicios resueltas paso a paso, organizadas
por materia del Plan 2023. Primera entrega: **Ingeniería de las Reacciones Químicas**, con la Serie 4
(reactores no isotérmicos, 10 ejercicios), la Serie 5 (reactores reales, 3 ejercicios) y la Serie 6
(cinética de las reacciones catalíticas heterogéneas y reactores catalíticos, 14 ejercicios).

| Ruta | Contenido |
|---|---|
| `pages/recursos/series-resueltas` | Hub: una `.card-materia` por materia con series resueltas (CTA «Acceder a las series resueltas»). |
| `pages/recursos/series-resueltas/ingenieria-de-las-reacciones-quimicas` | Página de la materia: accesos «Abrir la guía» y «Descargar la guía» en la cabecera, un desplegable por serie (`#serie-4`, `#serie-5`, `#serie-6`) con la lista de ejercicios —cada fila abre el ejercicio en la guía y ofrece el menú «Descargar» con dos formatos: PDF y «Óptimo para IA»— y, al pie, accesos al índice por tema, la nomenclatura y el formulario de la guía. |
| `assets/docs/series-resueltas/ingenieria-de-las-reacciones-quimicas.html` | La guía de ejercicios resueltos: documento HTML autocontenido (estilos, scripts, fuentes y figuras embebidos). |
| `assets/docs/series-resueltas/ingenieria-de-las-reacciones-quimicas/Sxx-Eyy.pdf` | PDF de cada ejercicio (27 archivos): la versión completa, tal como la imprime la guía, con número de página al pie. |
| `assets/docs/series-resueltas/ingenieria-de-las-reacciones-quimicas/Sxx-Eyy.md` | «Óptimo para IA» de cada ejercicio (27 archivos): Markdown con todo el ejercicio, las ecuaciones en LaTeX y los valores de cada figura. |

Las páginas usan el tema general del sitio (Porcelana Fría); el tema papel queda reservado a
Simulaciones.

## 1. Arquitectura

```
data/series-resueltas.json        catálogo de materias con series resueltas (hub)
assets/js/series-resueltas.js     loader «series-resueltas» del hub
assets/js/materia-card.js         tarjeta de materia compartida (Apuntes, Simulaciones)
assets/js/series-descargas.js     cierre del menú «Descargar» de cada ejercicio (página de materia)
assets/css/series-resueltas.css   hoja de PÁGINA (no entra en main.bundle.css)
assets/docs/series-resueltas/     guías de ejercicios resueltos, una por materia,
  <materia>/Sxx-Eyy.pdf · .md     y el PDF y el Markdown de cada ejercicio
scripts/series-descargas.mjs      genera esos PDF y Markdown desde la guía publicada
```

Esquema de `data/series-resueltas.json`:

```
[{ id, nombre, anio, imagen, href, series: [{ numero, titulo, ejercicios }] }]
```

`series` alimenta el nombre accesible de la tarjeta («… (Series 4, 5 y 6)»); la página de la materia es
HTML estático y no requiere JavaScript (el menú de descarga es un `<details>` nativo;
`series-descargas.js` solo agrega su cierre al hacer clic fuera, con Esc o al elegir un formato).

**La guía vive fuera de `pages/`.** Los scripts de compilación (`build-csp`, `build-urls`,
`build-jsonld`, `build-seo`) recorren `pages/**` e inyectarían la CSP del sitio, que prohíbe estilos y
scripts en línea y recursos `data:`: la guía dejaría de funcionar. En `assets/docs/` se sirve tal
cual, como el resto de los documentos descargables. En GitHub Pages la CSP se aplica solo por
`<meta>`, de modo que la guía no queda alcanzada. Si algún día se adopta un host que aplique
`_headers`, habrá que exceptuar `/assets/docs/series-resueltas/*` de la CSP general (ver
`docs/security-headers.md`).

**Enlaces a la guía.** Todos los enlaces de la página de la materia apuntan a una misma pestaña con
nombre (`target="guia-irq"`): el primero abre la guía y los siguientes solo cambian el ancla, sin volver
a descargar el documento. Las anclas son los identificadores que asigna la rutina de guías
(`#S04-E01` … `#S06-E14`, `#temas`, `#nomenclatura`, `#formulario`). Los ejercicios 1 a 8 de la Serie 6 llevan
en la guía el sufijo del año de la serie (`#S06-E01-2024` … `#S06-E08-2024`); los 9 a 14 no lo llevan
(`#S06-E09` … `#S06-E14`). «Descargar la guía» entrega el
mismo archivo (`download="Series_Resueltas_IRQ.html"`) para leer sin conexión.

**Descarga por ejercicio** (decisión del usuario, 2026-11-15: los mismos dos formatos que el menú
«Descargar» de cada ejercicio dentro de la guía). Cada fila de la lista empieza con un menú nativo
`<details class="serie-ejercicios__descarga" name="descarga-ejercicio">` (abrir uno cierra el anterior)
con dos enlaces:

- **«Descargar PDF»** (`download="IRQ_Serie_N_Ej_MM.pdf"`): la versión completa del ejercicio, tal como
  la imprime la guía (solo ese ejercicio, desplegables abiertos, paleta clara, A4), con número de página
  al pie; entre 0,36 y 0,76 MB.
- **«Óptimo para IA»** (`download="IRQ_Serie_N_Ej_MM.md"`): Markdown con metadatos, enunciado, versión
  resumida (si la tiene), versión completa, ecuaciones en LaTeX y, por figura, sus textos y tablas con los
  valores con que se trazó; entre 35 y 99 KB.

Los rótulos de cada enlace indican el tamaño del archivo. En móvil el botón muestra el ícono y la flecha
(objetivo de 44 × 44 px) y desde 768 px suma el rótulo «Descargar»; el nombre accesible («Descargar el
ejercicio M de la Serie N») contiene el rótulo visible (WCAG 2.5.3). El panel flota bajo el botón sin
exceder el ancho de la pantalla. Los archivos se publican con el nombre corto (`S06-E01-2024` →
`S06-E01.pdf`). Reemplazan a los HTML parciales (3,3–4,9 MB cada uno), que dejaron de publicarse.

**Peso.** La guía de IRQ pesa 37,0 MB sin comprimir (≈ 2,7 MB con gzip, que GitHub Pages aplica a
HTML). Casi todo es marcado de KaTeX preprocesado; no ejecuta cálculos en el navegador.

## 2. Origen de la guía

La guía se genera en el repositorio **IRQui** con la rutina de guías de estudio (`.claude/guia`). Según
el estado de la rutina, los 27 ejercicios publicados cumplieron todas sus etapas de contenido: enunciado
verificado, análisis de las resoluciones docentes y de alumnos, adjudicación con cálculo reproducible
(`guia.calc`), lectura crítica, redacción, revisión, verificación y contraste final con una resolución
independiente («vía ciega»).

Estado de la QA visual al 2026-11-03: las series 4 y 5 la cumplieron (S05-E01, reabierto y rehecho desde el
análisis de fuentes, tiene pendiente su nueva revisión visual). En la Serie 6 se completó la primera ronda de QA
visual y se aplicaron sus correcciones —entre ellas, la de la plantilla común—; en la rutina queda pendiente la
segunda ronda sobre las capturas que cambiaron y el cierre formal de la etapa (`qa-cerrar`). La Serie 6 se
publicó a pedido del usuario, una vez resuelta; antes se verificó en Chromium (375 y 1280 px), sobre los 27
ejercicios con todos los desplegables abiertos, que no hay errores de consola, enlaces internos rotos, recursos
externos ni desplazamiento horizontal de la página, y que la barra de etapas queda completa en el teléfono. Si
la ronda pendiente introduce cambios, regenerar la guía (§2) y las descargas por ejercicio (§2.1).

La guía oficial de IRQui incluye además los ejercicios ya terminados de la serie en curso. Para el sitio
se publica una compilación **acotada a las series completas**, obtenida con el mismo motor:

1. Copiar el repositorio IRQui (sin `.git`) a un directorio temporal.
2. En la copia, dejar en `IRQui/materia.json` solo las etapas cumplidas en `alcance_por_etapas` y los
   mismos prefijos en `alcance_ejercicios`; ajustar `subtitulo` (p. ej. «Series 4 y 5 (versión
   parcial)»). No se toca el estado (`work/state/db.json`): el cumplimiento de cada etapa ya consta allí.
   En la publicación del 2026-11-03 se dejaron las etapas de las series 4, 5 y 6 (la de la Serie 6 sigue
   vigente en la rutina; ver el estado de la QA visual más arriba), con el subtítulo «Series 4, 5 y 6
   (versión parcial)». Desde que la rutina compila los modelos de examen en un HTML aparte, en la copia se
   quita además `salida_modelos`: el sitio publica solo la guía de series.
3. `.claude/guia -m IRQui build` (compilación completa: reejecuta todos los cálculos finales).
4. `.claude/guia -m IRQui validate-html` (validación estructural y con navegador).
5. Comparar el cuerpo de cada ejercicio con la guía oficial: debe ser idéntico (sin contar los envoltorios de
   etapas y del enunciado que agrega la plantilla, ni los metadatos de fecha de las figuras SVG que regenera
   matplotlib).
6. Copiar `IRQui/guia/guia_IRQui.html` de la copia a
   `assets/docs/series-resueltas/ingenieria-de-las-reacciones-quimicas.html`.
7. Generar las descargas por ejercicio (§2.1).

Compilación publicada el 2026-11-15: los mismos 27 ejercicios, 37 035 790 bytes, motor KaTeX, con la plantilla
del motor que agrega el menú «Descargar» de cada ejercicio con dos opciones —«Descargar PDF» (la versión a la
vista, por la impresión del navegador) y «Óptimo para IA» (Markdown con LaTeX y las tablas de valores de cada
figura)—, la versión resumida de S04-E02 y S04-E04 y los epígrafes de figuras con la notación como fórmula. La
impresión usa siempre la paleta clara. En el sitio oficial se conserva, además, el índice lateral con las series
plegadas (sin el atributo `open` en `details.lateral-grupo`), como en su publicación anterior.

Compilación publicada el 2026-11-03: 27 ejercicios (S04-E01 … S04-E10, S05-E01 … S05-E03,
S06-E01-2024 … S06-E08-2024, S06-E09 … S06-E14), 36 214 978 bytes, motor matemático KaTeX. Reemplaza la del
2026-10-29 (13 ejercicios) e incorpora, además de la Serie 6, las correcciones de la QA visual del 2026-11-03
(repositorio IRQui, PR #22), que alcanzan a todos los ejercicios:

- plantilla común: en el teléfono, la barra de etapas pasa a dos filas (Planteo · Resolución · Análisis y,
  debajo, «Intentarlo primero» y «Desplegar todo»), de modo que ningún control queda recortado;
- notación científica sin corte de línea entre la mantisa y la potencia de diez (`1,23 × 10⁴` con espacios
  no separables);
- ecuaciones anchas de S04, S05 y S06 partidas en renglones alineados para pantallas de 360–390 px; S05-E01,
  reabierto, se rehízo desde el análisis de fuentes.

Características de la plantilla (sin cambios respecto de la publicación anterior):

- un ejercicio por vez, con anterior y siguiente en la cabecera y al pie; el índice lateral lista
  «Ejercicio N» por serie;
- botón discreto «Descargar» al comienzo de la cabecera de cada ejercicio (desde la publicación del 2026-11-15,
  un menú con «Descargar PDF» y «Óptimo para IA»);
- cada ejercicio en tres etapas —Planteo, Resolución y Análisis— con el enunciado en recuadro propio;
- «Intentarlo primero» activo por defecto: se ve el planteo y la resolución se pide con «Mostrar la
  resolución» (la preferencia se recuerda en el navegador);
- carril «En este ejercicio» en pantallas anchas y barra de etapas fija en las demás;
- columna de lectura de ~65–70 caracteres con Source Serif 4 incrustada (OFL), igual en cualquier sistema.

Los enlaces del sitio a `#Sxx-Eyy` abren la guía directamente en ese ejercicio.

### 2.1 Descargas por ejercicio (PDF y «Óptimo para IA»)

Se generan desde la guía ya copiada en `assets/docs/series-resueltas/` (requiere Playwright, como
`scripts/shoot.mjs`):

```
node scripts/series-descargas.mjs ingenieria-de-las-reacciones-quimicas
```

El script usa las funciones de la propia guía —`guiaPrepararPdf` (vista de impresión del ejercicio) y
`guiaMarkdownEjercicio` (exportación «Óptimo para IA»)— y escribe `Sxx-Eyy.pdf` (versión completa, A4,
número de página al pie, título del documento «Serie N · Ejercicio M — título») y `Sxx-Eyy.md` en
`assets/docs/series-resueltas/<materia>/`; imprime un JSON con el tamaño de cada archivo para los rótulos
de la página. Falla si la guía no trae esas funciones (guía compilada con un motor anterior). Los PDF y los
Markdown deben regenerarse cada vez que se reemplaza la guía.

## 3. Sumar una serie o una materia

**Serie nueva de una materia existente** (p. ej. los modelos del segundo parcial o las series 1 a 3 de
IRQ, cuando su etapa esté cumplida):

1. Regenerar la guía acotada (§2) incluyendo la nueva etapa y reemplazar el archivo de
   `assets/docs/series-resueltas/`.
2. Regenerar las descargas por ejercicio (§2.1): el script recorre todos los ejercicios de la guía, de modo
   que los ya publicados quedan al día con la guía nueva; actualizar los tamaños de los rótulos.
3. En la página de la materia, agregar el desplegable `<details class="serie" id="serie-N">` con su
   bajada y la lista de ejercicios (títulos tomados del índice de la guía, cada fila con su menú de
   descarga, como las existentes), y actualizar los
   metadatos de «Abrir la guía» («Series …» · «N ejercicios»), el tamaño de «Descargar la guía» y la
   `<meta name="description">`.
4. Agregar la serie a `series` en `data/series-resueltas.json`.
5. `npm run build` y verificar en el navegador.

**Materia nueva:** agregar su entrada en `data/series-resueltas.json`, crear
`pages/recursos/series-resueltas/<id>.html` a partir de la de IRQ (cambiando el nombre de la pestaña
con nombre, p. ej. `target="guia-<materia>"`), publicar su guía en
`assets/docs/series-resueltas/<id>.html` y ejecutar `npm run build`.

## 4. Validación

- `npm run build` (URLs, JSON-LD, CSP, CSS y sitemap) sin cambios en `main.bundle.css`.
- Navegador (Chromium, 1280 px y 375 px): sin errores de consola ni recursos fallidos y sin
  desplazamiento horizontal en Recursos, el hub y la página de la materia.
- Enlaces: el primer clic abre la pestaña `guia-irq` en el ejercicio; los siguientes la reutilizan y
  solo cambian el ancla; «Descargar la guía» entrega `Series_Resueltas_IRQ.html` y el menú «Descargar»
  de cada fila, el PDF y el Markdown de su ejercicio (los 54 enlaces responden 200 con `application/pdf` y
  `text/markdown`); el menú se cierra al hacer clic fuera, con Esc (el foco vuelve al botón) y al elegir.
- `node scripts/verify-csp.mjs`: sin violaciones en las páginas servidas.
