# REVIEW — Historia 2: Seguimiento de Carrera (versión 3)

## Decisiones

- Fidelidad: la herramienta real (DOM y CSS del sitio) se incrusta en un iframe; selectores,
  insignias, pestañas, campos de la tabla de finales y tarjetas del tablero son los del sitio. Se
  muestran las columnas que la especificación define para móvil y un subconjunto real de filas.
- Correlativas: tres acciones habilitan cinco materias; cada habilitación se dibuja como un arco
  desde la materia marcada y se resalta la fila, con el texto «Se habilitan sus correlativas».
- Enlace con la planilla: al tipear cada nota se actualizan las tarjetas de promedios (valores
  leídos de la herramienta real para cada paso) y aparece la nota final en la tabla.
- Cierre: la pantalla se aleja y la rodean las funciones reales de la página.

## Medido y observado

- `hyperframes check`: sin errores. Se corrigió que las insignias y valores aparecieran agrandados
  antes de animarse (renderizado inmediato de GSAP) y que las superposiciones cayeran una fila más
  arriba (ahora se miden dentro del iframe).
- Audio: medido, no escuchado.

## Plano más débil

- 14,9-24,2 s: la carga de finales dura 9 s; es el tramo más largo. Si la historia se siente
  extensa, se puede dejar solo Física I (3 intentos), con lo que el video baja a unos 30 s.

## Advertencias que se mantienen

- `outside_safe_zone` (riel de TikTok/Shorts) y una superposición breve de dos toques consecutivos
  (`gsap_tween_tail`, 0,04 s, sin efecto visible).

## Uso en Instagram

- Sticker de enlace debajo del bloque final (aprox. y = 1350-1550 px), hacia
  `achetiq.github.io/pages/recursos/seguimiento`.
