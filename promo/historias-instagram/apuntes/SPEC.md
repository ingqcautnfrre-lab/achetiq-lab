# SPEC — Historia 1: Apuntes Académicos

Base: boceto B («Un toque abre la materia») con una introducción breve, según la devolución del 23/11/2026.

```text
GOAL:    que el estudiante entienda en un vistazo que cada materia abre su carpeta de Drive
         y que el archivo que busca está ahí, a tres toques.
OUTPUT:  HyperFrames, 1080 x 1920 (9:16, historia de Instagram), 30 fps, MP4.
TIME:    18,0 s x 30 = 540 cuadros. Sin música (se agrega en Instagram); solo efectos.
LOOK:    fondo crema #FCF7F0 (pedido explícito; reemplaza la porcelana del sitio en estos videos);
         superficies #FFFFFF con filete #E7DFD3 de 2 px y radio 16-20 px; tinta #131720,
         tinta secundaria #4A4F59; cobalto #1344A5 estructural (enlaces, píldora activa);
         mauveína #922FA1 solo en el resaltado del archivo encontrado (una vez).
         Titulares Fraunces 400, 104-116 px, tracking -1,5 %; cuerpo Hanken Grotesk 400-500,
         36-46 px; etiquetas técnicas Geist Mono 26-34 px.
         Medio: la interfaz real del sitio a ~2,4x su tamaño móvil y una vista de Drive
         simulada con los nombres reales de la carpeta. Sin sombras salvo el papel del PDF
         (0 18 40, 14 % cobalto profundo). Sin grano ni viñeta.
OBJECTS: portadas reales de 16 materias (assets/img/materias del sitio); tarjeta de materia
         con «Acceder al repositorio →»; fila de Drive con ícono de carpeta gris y de PDF rojo;
         hoja de PDF con el encabezado real de la Serie 7 y trazos de resolución manuscrita.
MOTION:  llegadas expo.out 0,35-0,5 s; inmersiones power3.in 0,6-0,7 s (escala 1 -> 7-8);
         el nivel siguiente nace en escala 0,2 -> 1 con expo.out 0,5 s, superpuesto los
         últimos 0,25 s de la inmersión; paneo de cámara power2.inOut 1,7 s; títulos con
         desenfoque 10 -> 0 px en 0,22-0,28 s; filas en cascada de 70 ms; toques: punto de
         88 px que aparece en 0,12 s, se hunde a 0,78 y sale en 0,24 s.
SHOTS:   0,0-2,3   Gancho. «¿Dónde quedaron los apuntes?» ya en pantalla en el cuadro 0;
                   ocho fragmentos reales (carpetas y archivos de Drive, «Apuntes»,
                   «Guías de ejercicios», «Bibliografía») caen dispersos y rotados.
                   Sonido: tres pops alternados. Pasa a: paneo hacia abajo.
         2,3-4,7   Paneo continuo: el gancho sale hacia arriba con desenfoque y sube la página
                   real (migas, «Apuntes Académicos», bajada real abreviada); la cámara
                   recorre la grilla de portadas y frena en Ingeniería de las Reacciones
                   Químicas. Sonido: barrido. Pasa a: toque.
         4,7-5,7   Toque en la portada y primera inmersión. Sonido: toque + barrido.
         5,6-7,0   Carpeta de la materia: «03. Práctica», «05. Presentaciones». Toque.
         7,0-8,7   Segunda inmersión: «Guías de Estudio», «2024 - GS - Resolución Serie 07.pdf»,
                   «2024 - SMR - Resolución Series.pdf». Toque en Serie 07, resalte mauveína.
         8,7-10,9  Tercera inmersión: visor del PDF; la hoja muestra el encabezado real
                   («Serie 7: Reacciones heterogéneas fluido-fluido») y los trazos se dibujan.
         10,9-12,4 Alejamiento continuo hasta la grilla completa. Sonido: barrido inverso.
         12,4-15,6 Afirmación: «38 materias. Una carpeta cada una.» + «Apuntes, guías y
                   bibliografía aportados por la comunidad estudiantil.»
         15,6-18,0 Cierre: logo, AChETIQ, achetiq.github.io, «Recursos académicos › Apuntes»;
                   zona libre para el sticker de enlace (y = 1180-1400). Sonido: impacto suave.
BANNED:  vacío oscuro; brillos, partículas, degradados violeta; tarjetas de vidrio; tres
         tarjetas en fila; títulos que siguen moviéndose tras aterrizar; logo en una esquina;
         palabras en itálica de acento; etiquetas numeradas «01 / 02»; marcos y corchetes
         decorativos; horarios o relojes (pedido explícito); logotipo de Google.
QA:      cuadro 0 con la pregunta legible; 4,7 s la portada de IRQ centrada; 6,4 s carpeta
         legible; 8,2 s el archivo Serie 07 resaltado; 10,2 s hoja del PDF legible;
         13,5 s afirmación; 17,0 s cierre con la zona del sticker despejada.
```

## Datos que aparecen en pantalla (fuente)

- 38 materias con carpeta: `data/recursos.json` (38 entradas con año, más «Respaldo»).
- Nombres de la carpeta de IRQ y de la Serie 07: conector de Google Drive, 23/11/2026.
- Encabezado del PDF: fragmento de contenido devuelto por Drive para el archivo de la Serie 7.
- Bajada: `pages/recursos/apuntes.html` («Cada materia del Plan 2023 enlaza a su carpeta de
  Google Drive…», «aportados por la comunidad estudiantil»).
