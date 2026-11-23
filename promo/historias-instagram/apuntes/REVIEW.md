# REVIEW — Historia 1: Apuntes Académicos

## Decisiones creativas

- Base: boceto B (zoom continuo) con una introducción breve, según la devolución del 23/11/2026.
- Introducción: «¿Dónde quedaron los apuntes?» con ocho fragmentos reales de la carpeta (carpetas,
  archivos y tipos de material). Uno de ellos, «2024 - GS - Resolución Serie 07.pdf», es el archivo
  que se encuentra al final: el gancho anticipa el desenlace.
- La introducción y la página forman un solo «mundo» vertical: la cámara baja de la pregunta a la
  página real y recorre la grilla sin cortes.
- Fondo crema #FCF7F0 por pedido explícito. Contradice la «Regla de la Porcelana Fría» de
  `docs/DESIGN.md`, que rige el sitio web; aquí se aplica solo a estas piezas de Instagram.
- La hoja del PDF muestra el encabezado y el enunciado reales (fragmento de contenido devuelto por
  Drive); los trazos manuscritos son una representación, porque no se pudo descargar la imagen de
  la página sin cargar el archivo completo en la sesión.

## Medido y observado

- `hyperframes check`: sin errores.
- Cuadros revisados a 0; 0,6; 1,6; 2,6; 3,6; 4,8; 5,6; 6,0; 6,6; 7,2; 7,6; 8,4; 9,2; 9,5; 9,9;
  10,6; 11,6; 12,1; 12,6; 13,3; 14,6; 17,0 y 19,6 s.
- Sonido: efectos sintetizados a partir de ruido filtrado (sin tonos), con picos normalizados a
  −3 dBFS. Se midió la señal; no se escuchó. No hay música: se agrega en Instagram.
- Render medido (`hyperframes audio`): −20,9 LUFS integrados, pico real −4,8 dBTP, sin recortes;
  los golpes caen en 0,16 / 0,42 / 0,68 / 0,94 s (fragmentos) y 5,73 / 7,68 s (toques). El nivel
  integrado queda por debajo del rango social (−16 a −14 LUFS) porque solo hay efectos: la música
  de Instagram aporta el cuerpo.

## Plano más débil

- 12,6-13,4 s: la grilla completa queda en pantalla menos de un segundo antes de la afirmación.
  Con más tiempo, se sostendría 0,5 s más o se marcarían las 16 portadas con un destello en cascada.

## Advertencias que se mantienen

- `outside_safe_zone`: el control mide el riel lateral de TikTok y YouTube Shorts; las historias
  de Instagram no lo tienen. El contenido respeta la franja superior (250 px) e inferior (340 px).
- `line_unread`: los nombres de materias que pasan durante el paneo y el texto del PDF son
  vistazos intencionales, no líneas para leer completas.
- `text_below_floor` a 12,0 s: nombres de la grilla al alejarse (escala 0,6), usados como textura.

## Uso en Instagram

- Ubicar el sticker de enlace en la zona libre del cierre (aproximadamente entre y = 1180 y
  y = 1400 px), apuntando a `achetiq.github.io/pages/recursos/apuntes`.
