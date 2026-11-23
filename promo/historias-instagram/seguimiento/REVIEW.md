# REVIEW — Historia 2: Seguimiento de Carrera

## Decisiones creativas

- Base: boceto A sin horarios ni relojes. El gancho conserva los números sueltos y los organiza
  en tres preguntas que ruedan («¿Qué puedo cursar?», «¿Cuánto me falta?», «¿Cuál es mi
  promedio?»), cada una con fragmentos reales: correlativas, avance y finales.
- La herramienta se muestra en tres tramos sin salir del cuadro: el cambio de estado con sus
  correlativas, el tablero completo con los diez indicadores y la pestaña «Exámenes finales».
- Los valores corresponden a un estudiante de ejemplo cargado en la herramienta real; el video lo
  indica con la nota «Ejemplo · valores calculados por la planilla».
- La tabla de finales se rediseñó en fichas verticales (fecha y nota por intento) para que se lea
  en un teléfono. La tabla real tiene 6 pares de columnas fecha/nota y no cabe en 9:16.
- Fondo crema #FCF7F0 por pedido explícito (ver la nota equivalente en `apuntes/REVIEW.md`).

## Medido y observado

- `hyperframes check`: sin errores.
- Cuadros revisados a 0; 0,9; 2,0; 3,2; 3,6; 4,4; 5,1; 5,8; 6,6; 7,5; 8,6; 9,6; 11,4; 12,6;
  13,4; 14,6; 15,6; 17,6; 19,2; 20,6; 23,4 y 25,7 s. Se corrigió la superposición de la nota final
  con la tercera ficha de Física I.
- Sonido: los mismos efectos sintetizados que en Apuntes; medidos, no escuchados. Sin música.
- Render medido (`hyperframes audio`): −23,1 LUFS integrados, pico real −4,9 dBTP, sin recortes;
  los pops del gancho caen en 0,17 / 0,43 / 1,33 / 1,59 / 2,48 / 2,74 s, junto a cada fragmento.

## Plano más débil

- 4,3-5,0 s: el avance rápido de 2,4 % a 39,0 % ocurre en un segundo y solo tres filas cambian a
  la vista; se entiende como «ejemplo», pero un recorrido por la tabla completa lo haría tangible.

## Advertencias que se mantienen

- `outside_safe_zone`: riel lateral de TikTok y Shorts, inexistente en historias de Instagram.
- `line_unread` en el gancho («Se aprueba con 6», «Máximo 4 instancias»): los fragmentos
  funcionan como acumulación visual; la información se vuelve a mostrar en la pestaña de finales.

## Uso en Instagram

- Ubicar el sticker de enlace en la zona libre del cierre (aproximadamente entre y = 1220 y
  y = 1420 px), apuntando a `achetiq.github.io/pages/recursos/seguimiento`.
