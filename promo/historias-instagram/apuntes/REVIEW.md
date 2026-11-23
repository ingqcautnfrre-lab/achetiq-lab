# REVIEW — Historia 1: Apuntes Académicos (versión 4)

## Decisiones

- Vista web: la página real se muestra a 1200 px CSS (escritorio) dentro de una ventana de
  navegador; una cámara acerca la cabecera, el filtro y la tarjeta de la materia. La ventana nunca
  sube por encima del título del paso, de modo que el título y la interfaz no se superponen.
- Entrada a la materia: el texto de la tarjeta se retira y solo la portada crece (×7,5) mientras se
  desenfoca y se desvanece; la ventana de Drive aparece en su lugar.
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

## Uso en Instagram

- Sticker de enlace debajo del bloque final (aprox. y = 1400-1600 px), hacia
  `achetiq.github.io/pages/recursos/apuntes`.
