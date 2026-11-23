# SPEC — Historia 2: Seguimiento de Carrera

Base: boceto A, sin horarios, con los números sueltos como introducción, sumando finales y
correlativas, los diez indicadores que calcula la planilla y la tabla de exámenes finales
(devolución del 23/11/2026).

```text
GOAL:    que el estudiante sepa que la planilla le dice qué puede cursar, cuánto avanzó y
         cuál es su promedio, a partir de cargar el estado de sus materias y sus finales.
OUTPUT:  HyperFrames, 1080 x 1920 (9:16, historia de Instagram), 30 fps, MP4.
TIME:    24,6 s x 30 = 738 cuadros. Sin música (se agrega en Instagram); solo efectos.
LOOK:    el mismo sistema que la historia de Apuntes: crema #FCF7F0, superficies #FFFFFF con
         filete #E7DFD3, tinta #131720 / #4A4F59, cobalto #1344A5, mauveína #922FA1 solo en el
         foco del selector y de la opción elegida. Colores de nivel y de estado de tokens.css
         (Nivel I #507ED3, Nivel II #8E6AC7; positivo #165E2E, negativo #9B171F).
         Fraunces para preguntas, titulares y valores; Hanken Grotesk para nombres; Geist Mono
         para rótulos de indicadores, fechas y correlativas (como en la herramienta real).
OBJECTS: selector de estado con desplegable real (No Cursada, Cursando, Regular, Aprobada);
         insignias «✓ Disponible» / «✕ No disponible»; tarjetas de indicador con rótulo,
         valor y aclaración reales; pestañas reales (Seguimiento, Exámenes finales, Nota al
         estudiante); fichas de intento con fecha DD/MM/AAAA y nota.
MOTION:  como Apuntes; la pregunta cambia con rodillo vertical de 0,25 s; los números sueltos
         entran con resorte (back.out 1,6) y salen dispersos con desenfoque 12 px en 0,35 s;
         los valores suben por pasos de 2 cuadros; el tablero se rearma sin salir del cuadro.
SHOTS:   0,0-3,3   Gancho. «¿Qué puedo cursar?» en el cuadro 0, rueda a «¿Cuánto me falta?» y
                   a «¿Cuál es mi promedio?». En cada pregunta caen fragmentos reales:
                   correlativas («Cursadas req. 6, 7, 8, 9, 13», «Aprobadas req. 1, 3, 4»,
                   «✕ No disponible»), avance («41 obligatorias», «24 hs electivas»,
                   «Regular») y finales («1° nota 4», «2° nota 7», «Se aprueba con 6»,
                   «Máximo 4 instancias»). Sonido: pops alternados; barrido al salir.
         3,3-8,0   La herramienta: «Seguimiento de Carrera», Avance y Aprobadas, filas del
                   Nivel I y II. Toque en el selector de Química -> «Aprobada»; Química
                   Inorgánica y Orgánica pasan a «✓ Disponible»; Avance 0,0 % -> 2,4 %.
                   Avance rápido al estudiante de ejemplo: 39,0 %, 17 aprobadas.
         8,0-12,6  El tablero se rearma con los diez indicadores reales del ejemplo:
                   Aprobadas 17 · Avance 39,0 % · No cursadas / cursando 22 · Disponibles 9 ·
                   Regulares 3 · Prom. sin aplazos 7,76 · Prom. con aplazos 6,95 ·
                   Hs. obligatorias aprob. 58 hs · Hs. electivas aprob. 5 hs ·
                   % electivas completadas 20,8 %. Se resalta «Prom. con aplazos».
         12,6-18,6 La tarjeta abre la pestaña «Exámenes finales»: «Se aprueba con 6. Máximo 4
                   instancias en condición regular.» Tres materias con sus intentos:
                   Álgebra y Geometría Analítica (20/02/2024 · 4; 05/03/2024 · 7 -> 7),
                   Física I (24/07/2024 · 2; 11/12/2024 · 5; 19/02/2025 · 8 -> 8),
                   Análisis Matemático II (16/07/2025 · 3; 03/12/2025 · 7 -> 7).
                   Los aplazos se marcan; la nota final se calcula; cierran los dos promedios.
         18,6-21,4 Afirmación: «Marcá tus materias. La planilla calcula el resto.» +
                   «Tus datos quedan en tu dispositivo.»
         21,4-24,6 Cierre: logo, achetiq.github.io, «Recursos académicos › Seguimiento de
                   Carrera», «También en Excel y Google Sheets»; zona libre para el sticker.
BANNED:  lo mismo que Apuntes, más: horarios, relojes y fechas de calendario en el gancho
         (pedido explícito); grilla de KPI genérica sin rótulos reales; números inventados.
QA:      cuadro 0 con la pregunta; 2,9 s gancho completo; 5,3 s desplegable abierto;
         6,2 s insignias en verde; 11,0 s tablero completo legible; 16,5 s tabla de finales
         con notas finales; 20,0 s afirmación; 23,5 s cierre con zona del sticker despejada.
```

## Datos que aparecen en pantalla (fuente)

- Estudiante de ejemplo (ilustrativo): Niveles I y II aprobados (16 obligatorias), Prácticas
  de Laboratorio aprobada (electiva, 5 hs), Balances, Termodinámica y Matemática Superior
  Aplicada regulares, Fisicoquímica y Fenómenos de Transporte cursando; intentos de final en
  seis materias. Los diez indicadores se leyeron de la herramienta real
  (`pages/recursos/seguimiento.html`) cargada con ese estado.
- Correlativas: `data/plan_academico.json` (Balances: cursadas 6, 7, 8, 9, 13; aprobadas 1, 3, 4).
- Regla de finales: texto real de la pestaña «Exámenes finales».
