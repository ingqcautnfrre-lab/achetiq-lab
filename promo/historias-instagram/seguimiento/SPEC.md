# SPEC — Historia 2: Seguimiento de Carrera (versión 3)

Devolución del 23/11/2026 aplicada: gancho con jerarquía clara (una pregunta y un solo racimo por
vez), habilitación de correlativas con más materias y conexiones visibles, promedios que se
completan al cargar notas, pestaña de exámenes finales fiel al sitio, cierre lleno de funciones,
final centrado con el logo más grande.

```text
GOAL:    el estudiante entiende qué hace la planilla: marcar materias habilita correlativas, cargar
         finales calcula los promedios y el tablero muestra el avance.
OUTPUT:  HyperFrames, 1080 x 1920, 30 fps, MP4. Duración: 33,7 s.
LOOK:    fondo crema #FCF7F0; la página real (iframe de 510 px CSS, zoom 2,118) con su CSS. La tabla
         muestra las columnas del diseño móvil de la especificación (N°, Asignatura, Estado,
         Disponible) y un subconjunto real de filas; la tabla de finales muestra N°, Asignatura,
         Nota final y los intentos 1 a 3. Títulos de paso en Fraunces 84 px.
MOTION:  el gancho cambia de pregunta con rodillo vertical; la página se recorre sin cortes; las
         correlativas se dibujan como arcos cobalto desde la materia marcada a las que habilita.
SOUND:   efectos suaves (toques, tic de tecla al escribir, pop al cambiar un valor).
SHOTS:   0,0-4,7    Gancho: «¿Qué puedo cursar?» (Balances de Masa y Energía y sus correlativas
                    reales 6·7·8·9·13 / 1·3·4) -> «¿Cuánto me falta?» (41 obligatorias, barra de
                    41 segmentos, avance 12,2 %) -> «¿Cuál es mi promedio?» (notas sueltas que
                    convergen en un signo de pregunta).
         4,4-7,7    «Tu carrera, en una planilla» y «Sin cuentas. Tus datos quedan en tu
                    dispositivo» con la nota de privacidad real resaltada.
         7,7-14,5   «Marcá tus materias» / «Se habilitan sus correlativas»: Química aprobada ->
                    Química Inorgánica y Química Orgánica; Análisis Matemático I aprobada y Física
                    I regular -> Física II; Álgebra regular -> Probabilidad y Estadística y
                    Análisis Matemático II. Cada cambio sale de la lógica real de la herramienta.
         14,9-24,2  «Cargá tus finales»: pestaña real «Exámenes finales»; se tipean las fechas y
                    notas de Álgebra (4, 7) y Física I (2, 5, 8) con el desplazamiento horizontal
                    real de la tabla; los promedios se actualizan en cada nota (4,00 -> 5,50 ->
                    4,33 -> 4,50 -> 5,20; sin aplazos 7,00 -> 7,50) y aparece la nota final.
         24,4-26,8  «Todo tu avance, al día»: pestaña Seguimiento y tablero real con los diez
                    indicadores del estado mostrado (5 aprobadas, 12,2 %, promedios 7,50 y 5,20…).
         26,8-30,3  «Marcá tus materias. La planilla hace el resto.»: la pantalla se aleja y aparecen
                    sus funciones: Correlativas, Avance de carrera, Promedios, Exámenes finales,
                    Exportá a Excel, Google Sheets, Respaldo en JSON.
         30,3-33,7  Cierre centrado: logo de 460 px, AChETIQ, achetiq.github.io, Recursos
                    académicos › Seguimiento de Carrera, También en Excel y Google Sheets.
BANNED:  horarios y relojes; valores que no salgan de la herramienta; grillas de KPI inventadas.
```

## Fuentes de lo que se ve

- Página: `pages/recursos/seguimiento.html` capturada vacía (sin datos) a 510 px; los estados,
  insignias, notas y promedios de cada paso se leyeron de la herramienta real cargada con ese
  estado (`valores.json`, generado por `herramientas/preparar_sitio.cjs`).
- Las fechas se muestran en formato dd/mm/aaaa, como en un navegador configurado en es-AR.
