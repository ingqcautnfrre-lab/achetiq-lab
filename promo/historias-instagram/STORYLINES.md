# Historias de Instagram — Recursos académicos AChETIQ

Plan de producción de dos videos verticales (historias de Instagram) realizados con HyperFrames:

1. **Apuntes Académicos** — cada materia abre su carpeta de Google Drive.
2. **Seguimiento de Carrera** — registrar el estado de cada materia y ver el avance y las correlativas.

Ambos videos comparten mundo, lenguaje de animación, tipografía y sonido: se publican como dos historias distintas, pero se leen como una serie.

---

## 1. Lo único que el espectador debe recordar

| Video | Qué es, en una línea | Lo que el espectador se lleva (en sus palabras) |
|---|---|---|
| Apuntes | Tocás una materia y se abre su carpeta de Drive con apuntes, guías y bibliografía. | «Los apuntes de cada materia están en un solo lugar, a un toque». |
| Seguimiento | Marcás el estado de cada materia y la planilla calcula tu avance y qué podés cursar. | «Cargo mis materias y me dice qué correlativas me faltan». |

## 2. Hechos verificados (fuente de todo lo que aparece en pantalla)

**Apuntes** (`pages/recursos/apuntes.html`, `data/recursos.json`):

- 39 materias del Plan 2023 publicadas; las 39 tienen carpeta de Drive (`drive_url`).
- Filtro por año: «Todos», «1º año» … «5º año». Rótulo de cada tarjeta: «Acceder al repositorio →».
- Texto de la página: «Cada materia del Plan 2023 enlaza a su carpeta de Google Drive, donde la comisión reúne apuntes, guías de ejercicios y bibliografía aportados por la comunidad estudiantil».
- Contenido real de la carpeta de **Ingeniería de las Reacciones Químicas** (leído con el conector de Drive el 23/11/2026): `03. Práctica`, `05. Presentaciones`; dentro de Práctica: `Guías de Estudio`, `2024 - GS - Resolución Serie 07.pdf`, `2024 - SMR - Resolución Series.pdf`.
- CTA de aporte: «¿Querés aportar material?» / «Quiero aportar».

**Seguimiento** (`pages/recursos/seguimiento.html`, `data/plan_academico.json`, lógica de `assets/js/seguimiento.js`):

- Estados por materia: No Cursada, Cursando, Regular, Aprobada. Disponibilidad: «Disponible ✓» / «No disponible ✕», con la lista de materias faltantes.
- Plan: 41 obligatorias + 13 electivas (54 en total).
- Valores calculados con la lógica real de la herramienta (estudiante de ejemplo, ilustrativo):

| Estado de ejemplo | Aprobadas | Avance | Hs. oblig. aprob. | Disponibles |
|---|---|---|---|---|
| Inicial | 0 | 0,0 % | 0 hs | 9 |
| Química aprobada | 1 | 2,4 % | 5 hs | 10 (se habilitan Química Inorgánica y Química Orgánica) |
| Nivel I aprobado | 8 | 19,5 % | 29 hs | 8 (todo el Nivel II) |
| Niveles I y II aprobados | 16 | 39,0 % | 58 hs | 13 (Balances, Termodinámica, Fisicoquímica…) |

- Privacidad (texto real): «Tus datos se guardan únicamente en este dispositivo».
- Descargas reales: Plan de estudios 2023 (PDF), planilla Excel, copia en Google Sheets.

**Restricciones de marca** (`docs/DESIGN.md`, `docs/PRODUCT.md`): porcelana fría `#F2F4F8`, tinta `#131720`, cobalto `#1344A5` estructural, mauveína `#922FA1` solo para la acción (≤ 10 % del cuadro); Fraunces (titulares), Hanken Grotesk (cuerpo), Geist Mono (etiquetas técnicas); sin signos de exclamación, sin emojis, voseo en los llamados a la acción.

---

## 3. Tres líneas argumentales

### A · «Domingo, 23:47» — recomendada

*Dispositivo:* un momento en el día de un estudiante. *Forma:* cadena objeto a objeto (cada plano termina en el objeto que abre el siguiente).

Ambos videos parten de una situación que cualquier estudiante de la carrera reconoce —la noche previa al parcial y la inscripción a cursado— y resuelven la tensión dentro de la interfaz real del sitio. El reloj en pantalla es el hilo: la búsqueda empieza a las 23:47 y termina a las 23:48.

**Video 1 — Apuntes (≈ 18 s)**

- *Primeros 2 s:* el cuadro 0 ya muestra la hora «23:47» en Fraunces a 300 px sobre porcelana y, debajo, «Parcial de Reacciones mañana». A los 0,6 s cae la primera burbuja de chat: «¿alguien tiene la Serie 7 resuelta?».
- *Beats:* gancho (hora + necesidad) → tensión (burbujas de chat se apilan sin respuesta útil: «creo que estaba en un drive viejo», «a mí me lo pasaron por mail») → revelación (las burbujas se barren; entra la cabecera real «Apuntes Académicos») → prueba (toque en «4º año» → la grilla se filtra → toque en la tarjeta «Ingeniería de las Reacciones Químicas» → la flecha «→» avanza) → resultado (la portada de la tarjeta crece hasta ocupar el cuadro y se convierte en la carpeta de Drive simulada: `03. Práctica` → `2024 - GS - Resolución Serie 07.pdf`) → afirmación («39 materias. Una carpeta cada una», el reloj marca 23:48) → cierre (logo, «achetiq.github.io», espacio para el sticker de enlace).
- *Momento de mayor impacto:* la tarjeta que se transforma en la carpeta de Drive (≈ 60–75 % del video).

**Video 2 — Seguimiento (≈ 18 s)**

- *Primeros 2 s:* «Lunes 08:10» y «Inscripción a cursado» ya en pantalla; a los 0,6 s aparece la pregunta «¿Qué puedo cursar?».
- *Beats:* gancho → tensión (fragmento de la tabla de correlativas: «Cursadas req. 6, 7, 8, 9, 13» / «Aprobadas req. 1, 3, 4»; los números se multiplican y se enredan) → revelación (cabecera real «Seguimiento de Carrera») → prueba (toque en el selector de «Química» → «Aprobada» → la fila se tiñe; «Química Inorgánica» y «Química Orgánica» pasan de «No disponible ✕» a «Disponible ✓») → resultado (cascada rápida sobre el Nivel I: el indicador «Avance» sube de 0,0 % a 19,5 % y el Nivel II se habilita en ola) → afirmación («Tus datos quedan en tu dispositivo») → cierre (logo, enlace, mención del Excel y Google Sheets).
- *Momento de mayor impacto:* la ola de habilitación del Nivel II mientras el porcentaje sube.

- *Look:* porcelana fría `#F2F4F8`, la interfaz real a 1,8–2× su tamaño en un teléfono, Fraunces para la hora y los titulares; el cobalto estructura, la mauveína aparece solo en el toque y en el botón final.
- *Sonido:* pista instrumental tenue de ≈ 100 BPM; tic de reloj en el gancho, «pop» suave en cada burbuja, clic seco en cada toque, barrido al abrir la carpeta.

### B · «Un toque abre la materia»

*Dispositivo:* la función como gancho. *Forma:* zoom continuo (la cámara se zambulle en un detalle que resulta ser el siguiente mundo).

Sin situación previa: desde el primer cuadro la grilla real de portadas de materias se desplaza y un dedo toca una; la cámara atraviesa la tarjeta, entra a la carpeta, atraviesa la carpeta y llega al PDF. En el video de seguimiento la cámara recorre el plan de arriba abajo, Nivel I a Nivel V, mientras los estados cambian y el porcentaje de avance viaja fijo en la parte superior.

- *Primeros 2 s (Apuntes):* la grilla de portadas reales ya en movimiento vertical; a los 0,5 s el toque sobre «Ingeniería de las Reacciones Químicas» y el inicio de la zambullida.
- *Primeros 2 s (Seguimiento):* la tabla real del Nivel I, con «Avance 0,0 %» fijo arriba; a los 0,5 s el primer selector pasa a «Aprobada».
- *Beats (Apuntes):* gancho (toque) → zambullida en la carpeta → zambullida en `03. Práctica` → PDF → salida hacia la grilla y segunda zambullida breve en otra materia → afirmación → cierre.
- *Beats (Seguimiento):* gancho → Nivel I aprobado (19,5 %) → la cámara baja: Nivel II se habilita → Niveles I y II aprobados (39,0 %) → la cámara llega a Proyecto Final, aún «No disponible» con sus faltantes → afirmación → cierre.
- *Look:* la interfaz real del sitio a escala 2×, sin marco de teléfono; los colores de nivel de la propia tabla (azul, violeta, verde azulado…) marcan el avance de la cámara.
- *Sonido:* un pad ascendente continuo que sube de tono con cada zambullida; clics suaves en cada toque.

### C · «La tabla periódica de la carrera» — la opción audaz

*Dispositivo:* el tipo carga el argumento, con una metáfora química. *Forma:* cortes match (una forma se mantiene mientras todo lo demás cambia).

El plan de estudios se presenta como una tabla periódica: cada materia es un elemento, su número del plan es el número atómico y cada nivel es un período. Una celda se transforma en carpeta (Apuntes) o la tabla se enciende celda por celda a medida que se aprueban materias, con las correlativas dibujadas como enlaces químicos (Seguimiento). Recién en el tramo de prueba entra la interfaz real.

- *Primeros 2 s (Apuntes):* la tabla completa ya en pantalla; la celda «30 · IRQ» se ilumina en mauveína y empieza a crecer.
- *Primeros 2 s (Seguimiento):* la tabla en gris; la celda «6 · Química» se enciende en cobalto y de ella salen dos enlaces hacia «11» y «14».
- *Beats (Apuntes):* gancho (la celda) → la celda se convierte en ícono de carpeta (corte match) → interfaz real: tarjeta y toque → carpeta de Drive simulada → la carpeta se reduce a celda y vuelve a la tabla, todas las celdas «con carpeta» → afirmación → cierre.
- *Beats (Seguimiento):* gancho → la tabla se enciende por niveles, con enlaces → interfaz real: selector y badges → el porcentaje se vuelve físico (llena la tabla) → afirmación → cierre.
- *Look:* porcelana fría con celdas en cobalto de dos intensidades; Geist Mono para los números atómicos, Fraunces para los nombres; mauveína solo en la celda activa.
- *Sonido:* percusión seca a ≈ 120 BPM; los cambios de layout caen en cada compás.

**Recomendación:** A, porque parte de una situación que el estudiante reconoce en el primer segundo y la resuelve con la interfaz real, que es exactamente lo que se quiere promocionar.

---

## 4. Supuestos de producción

- Formato 1080 × 1920 (9:16), 30 fps, 15–20 s por video (una sola historia cada uno, por debajo del límite de 60 s).
- Sin locución ni subtítulos; el texto en pantalla y la propia interfaz cargan el mensaje (muchas historias se miran sin sonido).
- Todo texto y toda pieza de interfaz dentro de la zona segura de historias (sin texto en los 250 px superiores ni en los 340 px inferiores).
- La vista de Google Drive es una **simulación** construida con los nombres reales de la carpeta; no se reproduce el logotipo de Google.
- Se excluye de los montajes la portada de `termodinamica.webp` (imagen de terceros con derechos de autor).
- Tipografías y logo: archivos propios del sitio (`assets/fonts/`, `assets/img/logo/achetiq-logo.svg`).
- Los valores del video de seguimiento corresponden a un estudiante de ejemplo, calculados con la lógica real de la herramienta.
