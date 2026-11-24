# SPEC — Historia 2: Seguimiento de Carrera (versión 4)

Devolución del 23/11/2026 (segunda ronda) aplicada: introducción compacta y legible (tres preguntas
en una lista, cada una con su indicio, y la respuesta en una línea); vista web de escritorio dentro
de una ventana de navegador, en lugar de la vista móvil a todo el ancho; títulos íntegramente en
negro; cierre con el logo animado por capas, como en la historia 1. Se conserva la carga de finales
con los promedios que se actualizan.

```text
GOAL:    el estudiante entiende qué hace la planilla: marcar materias habilita correlativas, cargar
         finales calcula los promedios y el tablero muestra el avance.
OUTPUT:  HyperFrames, 1080 x 1920, 30 fps, MP4. Duración: 33,2 s.
LOOK:    fondo crema #FCF7F0; la página real (iframe de 1200 px CSS, escala 0,85) en una ventana de
         navegador de 1020 x 1100 px; la cámara acerca la tabla (columnas N° a Disponible, filas 1
         a 15 y 40), la tabla de finales y el tablero. Títulos de paso en Fraunces 84 px, negro.
MOTION:  el gancho arma una lista de tres preguntas y la respuesta; la ventana sube desde abajo; la
         página se recorre sin cortes; las correlativas se dibujan como arcos cobalto desde la
         materia marcada a las que habilita.
SOUND:   efectos suaves (toques, tic de tecla al escribir, pop al cambiar un valor).
SHOTS:   0,0-4,7    Gancho: «¿Qué puedo cursar?» (Balances de Masa y Energía pide 6·7·8·9·13),
                    «¿Cuánto me falta?» (barra de 41 segmentos, «de 41 obligatorias»), «¿Cuál es mi
                    promedio?» (notas 4·7·2·5·8 -> ?). Las preguntas se atenúan y queda «Una
                    planilla lo calcula por vos.»
         4,7-6,5    La ventana sube con la página real: «Tu carrera, en una planilla»; acercamiento
                    a la cabecera.
         6,5-8,0    «Sin cuentas. Tus datos quedan en tu dispositivo.» con la nota de privacidad real
                    resaltada.
         8,0-15,3   «Marcá tus materias» / «Se habilitan sus correlativas»: Química aprobada ->
                    Química Inorgánica y Química Orgánica; Análisis Matemático I aprobada y Física I
                    regular -> Física II; Álgebra y Geometría Analítica regular -> Probabilidad y
                    Estadística y Análisis Matemático II. Insignias, materias faltantes y tablero
                    salen de la lógica real de la herramienta.
         15,3-22,5  «Cargá tus finales. Los promedios se calculan solos.»: pestaña real «Exámenes
                    finales»; se tipean fechas y notas de Álgebra (4, 7) y Física I (2, 5, 8) con
                    desplazamiento horizontal; las tarjetas de promedios cambian en cada nota
                    (sin aplazos 7,00 -> 7,50; con aplazos 4,00 -> 5,20) y aparece la nota final.
         22,5-25,7  «Todo tu avance, al día»: vuelta a Seguimiento; Álgebra y Física I figuran
                    aprobadas con 7 y 8; el tablero se actualiza (4 aprobadas, 9,8 %, promedios
                    7,50 y 5,20 resaltados).
         25,7-28,9  La ventana se aleja; «Marcá tus materias. La planilla hace el resto.» y siete
                    funciones reales: Correlativas, Avance de carrera, Promedios, Exámenes finales,
                    Exportá a Excel, Google Sheets, Respaldo en JSON.
         28,9-33,2  Cierre: logo por capas, «AChETIQ», achetiq.github.io, «Recursos académicos ›
                    Seguimiento de Carrera», «También en Excel y Google Sheets».
```

## Fuentes de los datos

- Página y valores: `pages/recursos/seguimiento.html` cargada en el navegador con el estado de cada
  paso en `localStorage` (`herramientas/preparar_sitio.cjs` -> `valores.json`). Los estados de los
  finales parten de las cuatro materias marcadas en el video, de modo que el tablero final coincide
  con lo mostrado.
- Logo: el mismo tratamiento por capas que la historia 1.
