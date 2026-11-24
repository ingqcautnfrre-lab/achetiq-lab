# SPEC — Historia 1: Apuntes Académicos (versión 4)

Devolución del 23/11/2026 (segunda ronda) aplicada: títulos íntegramente en negro, sin palabras en
color; nombres del chat «Paraguayo», «Ele P» y «Vicki G»; la página se muestra en su vista web de
escritorio dentro de una ventana de navegador, no en la vista móvil; al entrar a Ingeniería de las
Reacciones Químicas la portada crece y se desvanece, sin rótulo cortado; la ventana de Drive empieza
debajo del título y se ajusta a su contenido; la portada real de Termodinámica en el muro; cierre
con el logo de AChETIQ animado por capas (los cuadros se rellenan y se escribe «achetiq»), como la
intro de los videos de Series Resueltas.

```text
GOAL:    el estudiante se reconoce en la búsqueda de apuntes y ve que en la página de AChETIQ cada
         materia lo lleva a su carpeta de Drive.
OUTPUT:  HyperFrames, 1080 x 1920 (historia de Instagram), 30 fps, MP4. Duración: 24,8 s.
LOOK:    fondo crema #FCF7F0; la página real del sitio (DOM, CSS, tipografías e imágenes) en un
         iframe de 1200 px CSS (vista de escritorio), escala 0,85, dentro de una ventana de
         navegador de 1020 x 1100 px (barra con la dirección). Una cámara acerca cada zona; la
         ventana nunca sube por encima del título. Títulos de paso en Fraunces 84 px, negro.
         Drive simulado en vista web (no existe interfaz real accesible), con nombres reales.
MOTION:  toma continua: chat -> la vista previa del enlace crece hasta ser la ventana -> cabecera
         -> filtro -> desplazamiento -> acercamiento a IRQ -> la portada crece y se desvanece ->
         Drive -> carpeta -> PDF -> la ventana vuelve a ser una portada del muro de 38 materias ->
         el muro se reúne -> logo por capas.
SOUND:   efectos sintetizados sin tono, picos a −6 dBFS y volúmenes 0,08-0,30.
SHOTS:   (desde la versión 6, los planos posteriores al gancho van 0,75 s más tarde)
         0,0-5,2    Gancho: «¿Otra vez buscando apuntes?»; chat «IQ · 4º año» (dramatización):
                    Paraguayo y Ele P no la encuentran; Vicki G responde con el enlace (vista previa
                    real: título y og-image). «Está todo acá.» Toque en la vista previa.
         4,2-5,9    «Apuntes de cada materia»: la ventana con la página real; acercamiento a la
                    cabecera.
         5,9-7,2    «Filtrá por año»: toque en «4º año»; el filtro real deja las 7 materias.
         7,2-9,6    «Elegí tu materia»: desplazamiento continuo y acercamiento a Ingeniería de las
                    Reacciones Químicas; toque.
         9,7-10,4   Entrada a la materia: el texto de la tarjeta se retira y la portada crece hasta
                    desvanecerse.
         10,4-11,9  «Su carpeta en Drive»: ventana de Drive con «03. Práctica» y
                    «05. Presentaciones».
         11,7-13,4  «Guías y series resueltas»: la carpeta 03. Práctica (la más completa) con la
                    carpeta Guías de Estudio y tres resoluciones reales.
         13,4-15,4  «La Serie 7, encontrada.»: la tarjeta crece hasta el visor; PDF con líneas grises.
         15,4-19,6  La ventana se encoge hasta su lugar en el muro; las 38 portadas reales se
                    encienden; contador 1 -> 38 «materias, cada una con su carpeta de Drive»;
                    «Toda la carrera, a un toque.» «Apuntes y guías aportados por estudiantes.»
         19,6-20,3  Las portadas convergen al centro.
         20,2-24,1  Cierre: logo por capas, «AChETIQ», achetiq.github.io, «Recursos académicos ›
                    Apuntes». Espacio libre debajo para el sticker de enlace.
```

## Fuentes de los datos

- Página: `pages/recursos/apuntes.html` capturada con `herramientas/preparar_sitio.cjs` (vista de
  1200 px).
- Materias y portadas: `data/recursos.json` y `assets/img/materias/*.webp`. La portada de
  Termodinámica es una imagen de terceros que ya usa el sitio.
- Nombres de la carpeta de Drive: listados reales de la carpeta compartida de la materia.
- Logo: `assets/img/logo/achetiq-logo.svg`; capas, cajas y tiempos de
  `.claude/motor/guia/templates/intro/parametros.json` del repositorio Series Resueltas.
