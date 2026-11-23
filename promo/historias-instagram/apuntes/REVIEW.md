# REVIEW — Historia 1: Apuntes Académicos (versión 4 y 5)

## Decisiones

- Vista web: la página real se muestra a 1200 px CSS (escritorio) dentro de una ventana de
  navegador; una cámara acerca la cabecera, el filtro y la tarjeta de la materia. La ventana nunca
  sube por encima del título del paso, de modo que el título y la interfaz no se superponen.
- Entrada a la materia: la tarjeta completa crece y se desvanece (detalle en «Ajustes
  posteriores»); la ventana de Drive aparece en su lugar.
- Drive: la ventana empieza debajo del título, mide lo que su contenido (470 px con las dos
  carpetas, 850 px con la carpeta abierta) y crece al entrar a «03. Práctica».
- Muro: las 38 portadas reales; la de Termodinámica ya se carga correctamente.
- Cierre: el logo se arma por capas con los parámetros de la intro de Series Resueltas (cuadros
  escalonados, cuadrado azul, escritura de «achetiq» con máscara, punto de la i y trazos), con
  tweens de GSAP buscables; tamaño 660 px, centrado.

## Medido y observado

- `hyperframes check`: sin errores. Se revisaron cuadros del render final en todo el recorrido.
- Se corrigió que las portadas de la segunda fila aparecieran vacías al aplicar el filtro: el
  iframe ahora tiene la altura completa del documento y todas las imágenes se decodifican al
  arrancar.
- Audio (ffmpeg, EBU R128): −38,1 LUFS integrados, pico −16,6 dBFS; medido, no escuchado. Queda
  por debajo de la música que se agregue en Instagram, como se pidió.

## Advertencias que se mantienen

- `outside_safe_zone`: corresponde a los rieles de TikTok/Shorts; las historias no los tienen.
- `text_below_floor` / `line_unread`: textos de la interfaz real (tarjetas, filas de Drive) que se
  ven de pasada; los títulos de cada paso cumplen el tamaño mínimo.
- `content_overlap` breve (0,2 s) mientras el visor del PDF cubre la carpeta.

## Ajustes posteriores (versión 5)

- El chat empieza vacío y los mensajes entran en orden desde el primero, el propio.
- Entrada a la materia: las demás tarjetas se retiran y la tarjeta completa (portada y recuadro
  con el nombre) crece hasta 3,3 veces mientras se desenfoca y se desvanece, sin recortarse.
- Audio: −38,4 LUFS integrados, pico −16,6 dBFS.

## Ajuste de la versión 6

- Ritmo del chat: los mensajes entran desde el propio con 0,65 s entre uno y otro (el intervalo de
  la versión 4), para que se puedan leer; el gancho dura 0,75 s más y la historia, 24,8 s.
- Audio: −38,5 LUFS integrados, pico −16,5 dBFS.

## Uso en Instagram

- Sticker de enlace debajo del bloque final (aprox. y = 1400-1600 px), hacia
  `achetiq.github.io/pages/recursos/apuntes`.
