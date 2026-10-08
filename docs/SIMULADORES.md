# Simulaciones — documentación técnica

Sección de **Recursos Académicos** que reúne simuladores interactivos organizados por materia del
Plan 2023. Primera entrega: **Operaciones Unitarias II**, con dos simuladores del método gráfico de
McCabe-Thiele.

| Ruta | Contenido |
|---|---|
| `pages/recursos/simulaciones` | Hub: una `.card-materia` por materia con simuladores (CTA «Acceder a los simuladores»). |
| `pages/recursos/simulaciones/operaciones-unitarias-ii` | Página de la materia: desplegables «1. McCabe-Thiele para Absorción de Gases» (`#absorcion-gases`) y «2. McCabe-Thiele para Destilación Binaria» (`#destilacion-binaria`). Cada simulador cierra con tres subdesplegables: «Hipótesis del modelo», «Nomenclatura» y «Formulario». |

Ambas páginas usan `body.tema-papel`: fondo papel neutro (#F8F7F4) con paneles blancos, en lugar
de la porcelana fría del resto del sitio. Es una excepción acotada, pedida por la dirección del
proyecto (tokens.css «Tema papel», recursos.css §5).

## 1. Arquitectura

```
data/simulaciones.json          catálogo de materias con simuladores (hub)
assets/js/simulaciones.js       loader «simulaciones» del hub
assets/js/materia-card.js       tarjeta de materia compartida con apuntes.js
assets/js/sim/
  acordeon.js                   entrada de la página de materia: <details>, #hash,
                                import() dinámico del simulador al abrirlo
  numerico.js                   bisección, máximo 1-D, interpolación lineal y
                                cúbica monótona (Fritsch–Carlson), parser, formato es-AR
  equilibrio.js                 modelos de equilibrio (α constante, tabla x–y,
                                Y* = M·X, y* = m·x en relaciones molares, tabla X–Y)
  modelo-destilacion.js         modelo PURO (sin DOM) de destilación binaria
  modelo-absorcion.js           modelo PURO (sin DOM) de absorción
  notacion.js                   subíndices «x_D», «Y_{N+1}» → <sub>/<tspan>
  grafico.js                    renderizador SVG propio + exportación SVG
  exportar.js                   exportación PNG: recorre el SVG y lo repinta en un
                                <canvas> (sin <img src="blob:…">, compatible con la CSP)
  ui.js                         controles, pestañas ARIA, ficha, avisos, CSV
  armazon.js                    composición común de los simuladores
  destilacion.js · absorcion.js cableado modelo ↔ interfaz
assets/css/simuladores.css      hoja de PÁGINA (no entra en main.bundle.css)
scripts/test-simuladores.mjs    pruebas de los modelos (npm run test:sim)
```

**Restricciones que condicionan el diseño.** La CSP del sitio (`scripts/build-csp.mjs`) impide
bibliotecas de CDN (`script-src 'self'`), estilos en línea (`style-src 'self'`) e imágenes `data:`
o `blob:` (`img-src 'self'`). Por eso:

- el diagrama es un SVG propio;
- los valores dinámicos se escriben por CSSOM (`el.style.setProperty`) o como atributos SVG;
- las ecuaciones estáticas se escriben en MathML nativo;
- la exportación PNG no pasa por `<img src="blob:…">` (bloqueado por `img-src 'self'`):
  `exportar.js` vuelve a dibujar el diagrama a 800 px de ancho y lo pinta en un `<canvas>` nodo a
  nodo, leyendo los estilos computados (Path2D acepta los `d` del SVG). La imagen se ofrece en 2×,
  3× o 4×, con fondo blanco y, a elección, título, línea de parámetros y leyenda. También se
  exportan el SVG vectorial y la tabla de etapas en CSV.

**Presupuesto de bytes.** Los simuladores se cargan con `import()` dinámico al abrir su
desplegable. La página de materia entrega 11,5 KB gzip de JS inicial (umbral: 50 KB) y su hoja
propia suma unos 7 KB gzip al CSS crítico.

## 2. Modelos

### 2.1 Absorción de gases (notación Treybal / Geankoplis)

Se usan relaciones molares libres de soluto y las etapas se numeran desde el tope. El solvente
entra con X₀ y el gas tratado sale con Y₁; el gas entra por el fondo con Y_{N+1} y el líquido sale
con X_N.

**Hipótesis**
- Hay un único soluto. El gas portador es insoluble y el solvente no es volátil, de modo que V′_s y
  L′_s son constantes.
- La operación es isotérmica, isobárica y en estado estacionario.
- La eficiencia de Murphree de fase gas es uniforme.

**Ecuaciones**
- Relaciones molares: X = x/(1 − x), Y = y/(1 − y).
- Recta de operación: Y_{n+1} = (L′_s/V′_s)(X_n − X₀) + Y₁.
- Solvente mínimo: (L′_s/V′_s)_mín = máx [Y*(X) − Y₁]/(X − X₀) para X ∈ (X₀, X*(Y_{N+1})]. Así se
  detectan tanto el pinch en el fondo como el pinch tangente (curvas cóncavas).
- Pseudoequilibrio: Y_ps = Y_op − E_MV (Y_op − Y*).
- El escalonamiento parte del tope (X₀, Y₁). La última etapa es fraccional:
  (X_N − X_{n−1})/(X_n − X_{n−1}).
- Verificación analítica, solo para Y* = M·X:
  - Kremser: N = ln{[(Y_{N+1} − M X₀)/(Y₁ − M X₀)](1 − 1/A) + 1/A}/ln A, con A = L′_s/(M V′_s).
  - Relación de Lewis: E_o = ln[1 + E_MV(1/A − 1)]/ln(1/A).
- La ley de Henry en fracciones (y* = m·x) se transforma en Y* = mX/[1 + (1 − m)X]. Es una curva:
  cóncava si m < 1 y convexa si m > 1.

### 2.2 Destilación binaria

**Hipótesis**
- Flujo molar constante y presión constante.
- Condensador total (y₁ = x_D) y calderín parcial contado como etapa de equilibrio.
- Una alimentación, ubicada en la etapa óptima.
- E_MV uniforme, aplicada también al calderín (simplificación declarada en la página).

**Ecuaciones**
- Equilibrio con α constante: y* = αx/[1 + (α − 1)x]. Alternativamente, datos x–y interpolados; se
  fuerzan los extremos (0, 0) y (1, 1) y se detectan azeótropos (cruces con y = x).
- Recta de rectificación: y = R/(R + 1)·x + x_D/(R + 1).
- Recta q: y = q/(q − 1)·x − x_F/(q − 1). Los casos q = 1 (vertical) y q = 0 (horizontal) se
  tratan aparte.
- Recta de agotamiento: pasa por (x_B, x_B) y por la intersección de las dos rectas anteriores.
  Su pendiente es L̄/V̄, con L̄ = L + qF y V̄ = V − (1 − q)F.
- R_mín general: el menor R con el que ambas rectas quedan por debajo de la curva en [x_B, x_D].
  Se obtiene por bisección sobre R, evaluando la holgura mínima con barrido y sección áurea. Cubre
  el pinch en la recta q y el pinch tangente.
- Underwood (binario, α constante): Σ αᵢ x_F,i/(αᵢ − θ) = 1 − q; R_mín + 1 = Σ αᵢ x_D,i/(αᵢ − θ).
- N_mín: escalonamiento a reflujo total, contrastado con Fenske:
  N_mín = ln[(x_D/(1 − x_D))((1 − x_B)/x_B)]/ln α.
- Escalonamiento desde (x_D, x_D) sobre y_ps = y_op + E_MV(y* − y_op). El cambio de sección se hace
  en la etapa óptima, la primera con x_n por debajo de la intersección de las rectas. Si E_MV < 1,
  se calculan en paralelo las etapas teóricas y las reales.

### 2.3 Datos de equilibrio precargados

Los pares x–y (destilación) y X–Y (absorción) que trae el modo tabulado son **ilustrativos** y no
corresponden a ningún sistema real. La interfaz lo advierte junto al área de datos. Se eligieron
porque sus formas producen un pinch tangente, que tiene valor didáctico. Para trabajar con un
sistema concreto deben reemplazarse por datos de bibliografía o de laboratorio.

## 3. Validación

Los casos se ejecutan con `npm run test:sim`: 16 pruebas, sin dependencias, con el runner nativo de
Node.

| Caso | Resultado del simulador | Referencia / control |
|---|---|---|
| Destilación, valores de TLK Energy (α = 2,5; R = 2; q = 0,8; x_F = 0,45; x_D = 0,98; x_B = 0,02) | 17 etapas (16,91 fraccionales); alimentación en la etapa 9 | TLK informa 17 etapas |
| Ídem: reflujo mínimo | R_mín = 1,5570 (pinch en la recta q) | Underwood: 1,5570 (coincidencia de 1e-6). TLK informa 1,529; véase la nota |
| Ídem: reflujo total | N_mín = 8,60 (gráfico) | Fenske: 8,49 (9 etapas enteras en ambos) |
| q = 1,3; 1; 0,5; 0; −0,5 con R = 1,5 R_mín | R_mín gráfico = Underwood en todos los casos | R_mín crece al disminuir q |
| Absorción, valores de Almajose (V′ = 100; y_{N+1} = 0,10; y₁ = 0,015; x₀ = 0; Y* = 1,5 X; L′ = 195; E_MV = 0,70) | L′_mín = 129,44; X_N = 0,049171; recuperación = 86,29 %; 6 etapas | Almajose: 129,441624; 0,0491706; 86,294 %; 6 etapas |
| Ídem: etapas fraccionales | 5,09 (construcción desde el tope) | Almajose: 5,1005, construyendo desde el fondo; la diferencia proviene solo de la etapa parcial |
| Ídem: pseudoequilibrio en X_N | Y = 0,0849625 | Almajose: Y₁ = 0,0849625 (su etapa 1, en el fondo) |
| Ídem con E = 1 | 3,39 etapas | Kremser: 3,42; Lewis + Kremser: N_real ≈ 5,09 |
| y* = m·x con m = 0,8 | Pinch tangente; la pendiente de la curva en el pinch es igual a (L′/V′)_mín | Condición de tangencia |

**Nota de rigor sobre el R_mín de la referencia TLK.** Para los valores por defecto de TLK, la
intersección de la recta q con la curva de equilibrio está en (0,40503; 0,62989). La recta desde
(x_D, x_D) hasta ese punto tiene pendiente 0,60892, lo que da R_mín = 1,5570. Underwood lleva al
mismo valor. La referencia muestra 1,529; esa discrepancia no pudo explicarse con sus parámetros
publicados. El simulador adopta el valor analítico.

## 4. Diseño

- **Composición.** Tres paneles blancos sobre el fondo papel:
  - **Parámetros**, a la izquierda en escritorio, con «Restablecer» en su cabecera.
  - **Gráfico**, fijo (sticky) a la derecha. Arriba muestra cuatro indicadores clave (etapas,
    alimentación o solvente mínimo, reflujo o recuperación, etc.) y el botón «Paso a paso»; al
    costado del diagrama, el panel **Elementos del gráfico**, que es a la vez leyenda,
    interruptor de capas y selector de lo que entra en la imagen, con el bloque **Descargar
    gráfico** (resolución, PNG, SVG). El diagrama se dimensiona para que el panel completo quepa
    en la altura visible (`armazon.js`, `ajustarPlot`).
  - **Resultados**, con las pestañas «Ficha técnica», «Etapas» (con descarga CSV) y «Cómo leer el
    diagrama».

  En móvil el orden es gráfico, parámetros y resultados.
- **Desplegables.** Triángulo cobalto que gira al abrir, título Fraunces semibold y filete
  hairline, sin caja ni lavado. Los subdesplegables de fundamentos usan el mismo estilo un
  escalón tipográfico por debajo.
- **Valores por defecto.** E_MV = 1 en ambos simuladores. La prueba de absorción fija E_MV = 0,70
  para reproducir el caso de referencia.
- **Paleta del diagrama.** Tokens `--dataviz-*` en `tokens.css`: cobalto-500 para el equilibrio,
  naranja para la rectificación y la operación, turquesa para el agotamiento. Se validó con la skill
  `dataviz` (`validate_palette.js`, modo claro, todos los pares):
  - ΔE CVD de 9,7 (objetivo ≥ 8);
  - ΔE de visión normal de 23,3 (piso 15);
  - contraste ≥ 3:1 sobre la superficie del trazado.

  La mauveína no aparece en el diagrama (Regla de la Mauveína Escasa). Los rótulos van siempre en
  tinta, y la identidad de cada serie se transmite por trazo, rótulo directo y leyenda.
- **Didáctica.**
  - Leyenda que funciona como interruptor de capas, incluidas las de reflujo mínimo y reflujo total.
  - Modo paso a paso con narración numérica de cada etapa.
  - Bandas alternas bajo los escalones y resaltado cruzado entre la etapa y su fila de la tabla.
  - Pestaña «Cómo leer el diagrama», con interpretación del estado actual.
  - Fundamentos estáticos (hipótesis y ecuaciones en MathML), legibles sin JavaScript.

## 5. Cómo agregar una materia o un simulador

1. Crear la página `pages/recursos/simulaciones/<id-materia>.html`, tomando como plantilla
   `operaciones-unitarias-ii.html`, con un `<details class="sim" id="…" name="simuladores"
   data-simulador="<clave>">` por simulador.
2. Registrar la clave en `CARGADORES` de `assets/js/sim/acordeon.js` y escribir su módulo con
   `export function montar(raiz)`. Conviene separar el modelo puro, que debe poder probarse en Node,
   del cableado de interfaz, y reutilizar `armazon.js`, `grafico.js` y `ui.js`.
3. Sumar la entrada de la materia en `data/simulaciones.json`.
4. Agregar los casos de validación a `scripts/test-simuladores.mjs`.
5. Ejecutar `npm run build` (CSP, JSON-LD, URLs canónicas y sitemap), `npm run test:sim`,
   `node scripts/perf-budget.mjs` y `node scripts/verify-csp.mjs`.
