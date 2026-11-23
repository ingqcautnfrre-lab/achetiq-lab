# REVIEW — Historia 1: Apuntes Académicos (versión 3)

## Decisiones

- Fidelidad: la interfaz del sitio ya no se redibuja; se incrusta la página real (DOM, CSS,
  tipografías e imágenes) en un iframe de ancho de teléfono. El filtro por año, las tarjetas y las
  portadas son los del sitio. Drive se simula porque su interfaz no es accesible desde aquí.
- Gancho con emoción: un chat de cursada en el que nadie encuentra la Serie 7; la respuesta es el
  enlace a la página, y esa vista previa se convierte en la pantalla (continuidad).
- Afirmación: el muro de las 38 portadas reales con contador, y «Toda la carrera, a un toque».
- Sonido: efectos nuevos, más graves y apagados, a volumen bajo.

## Medido y observado

- `hyperframes check`: sin errores. Cuadros revisados en todo el recorrido; la geometría de las
  superposiciones (toques, portada, zoom) se mide dentro del iframe al arrancar, para que coincida
  exactamente con la página real.
- Audio: medido con `hyperframes audio`, no escuchado.

## Plano más débil

- 4,0-4,4 s: el rectángulo que crece desde la vista previa del enlace es liso durante 0,4 s antes de
  mostrar la página; con más tiempo, se usaría una captura de la página dentro de ese rectángulo.

## Advertencias que se mantienen

- `outside_safe_zone`: corresponde al riel lateral de TikTok/Shorts; las historias no lo tienen.
- `line_unread`: nombres de tarjetas durante el desplazamiento y el nombre del archivo en el visor
  son vistazos.

## Uso en Instagram

- Sticker de enlace debajo del bloque final (aprox. y = 1350-1550 px), hacia
  `achetiq.github.io/pages/recursos/apuntes`.
