# SPEC — Historia 1: Apuntes Académicos (versión 3)

Devolución del 23/11/2026 aplicada: sonido y efecto más suaves, recorrido continuo, introducción
con emoción, página sin espacio vacío arriba, desplazamiento continuo con una pausa breve, zoom de
la portada de IRQ, carpeta más completa, PDF con líneas grises, afirmación más emocionante, sin
«bibliografía», cierre centrado con el logo más grande.

```text
GOAL:    el estudiante se reconoce en la búsqueda desesperada de apuntes y ve que en la página de
         AChETIQ cada materia lo lleva a su carpeta de Drive.
OUTPUT:  HyperFrames, 1080 x 1920 (historia de Instagram), 30 fps, MP4. Duración: 23,6 s.
LOOK:    fondo crema #FCF7F0; la página real del sitio (DOM, CSS, tipografías e imágenes) dentro de
         un iframe de 450 px CSS, zoom 2,4, en una «pantalla» con esquinas superiores de 44 px.
         Títulos de paso en Fraunces 84 px con una palabra en cobalto #1344A5; mauveína solo en el
         archivo encontrado. Drive simulado (no existe interfaz real accesible).
MOTION:  una sola toma continua: chat -> vista previa del enlace que crece hasta ser la página ->
         desplazamiento -> filtro -> desplazamiento -> zoom de portada -> hoja de Drive -> carpeta ->
         PDF -> la hoja vuelve a ser una portada en el muro de 38 materias -> el muro se reúne en el
         logo. Toques: punto de 70 px al 20 % de opacidad.
SOUND:   efectos sintetizados sin tono, picos a −6 dBFS y volúmenes 0,12-0,32 (más suaves que v2).
SHOTS:   0,0-4,4    Gancho: «¿Otra vez buscando apuntes?»; chat «IQ · 4º año» (dramatización):
                    «¿Alguien tiene la Serie 7 de Reacciones resuelta?», «creo que estaba en un drive
                    viejo», «a mí me la pasaron por mail y no la encuentro», «rindo esta semana y no
                    tengo nada»; Agus responde con el enlace de la página (vista previa real: título
                    y og-image del sitio). «Está todo acá.» Toque en la vista previa.
         4,4-6,6    Página real: «Apuntes de cada materia»; desplazamiento lento hasta el filtro.
         6,0-6,9    «Filtrá por año»: toque en «4º año»; el filtro real oculta las demás tarjetas.
         6,8-8,8    «Elegí tu materia»: desplazamiento continuo hasta Ingeniería de las Reacciones
                    Químicas; toque.
         9,0-10,7   La portada real de la materia se acerca hasta llenar el cuadro; rótulo «4º año».
         10,7-12,4  La carpeta de Drive sube como una hoja: «03. Práctica», «05. Presentaciones».
         12,0-13,6  «Guías y series resueltas»: los 4 elementos reales de 03. Práctica (la carpeta más
                    completa de la materia): Guías de Estudio, Serie 07 (GS), Serie 06 (NCMQ),
                    Resolución Series (SMR), con fecha y tamaño reales.
         13,6-15,7  Toque en la Serie 07; la fila crece hasta el visor; hoja con líneas grises.
                    «La Serie 7, encontrada.»
         15,7-18,0  La hoja se convierte en la portada de IRQ en un muro de 38 portadas reales que
                    aparecen en ondas; el contador sube de 1 a 38: «38 materias, cada una con su
                    carpeta de Drive».
         18,0-20,0  «Toda la carrera, a un toque.» + «Apuntes y guías aportados por estudiantes.»
         20,3-23,6  El muro se reúne en el centro; cierre centrado: logo de 460 px, AChETIQ,
                    achetiq.github.io, Recursos académicos › Apuntes; zona libre para el sticker.
BANNED:  horarios; «bibliografía»; logotipo de Google; vacío oscuro; brillos; títulos que se
         mueven tras aterrizar; itálicas de acento.
```

## Fuentes de lo que se ve

- Página: `pages/recursos/apuntes.html` capturada por `herramientas/preparar_sitio.cjs` a 450 px.
  La bajada se editó solo en la captura para quitar «bibliografía» (pedido del 23/11/2026).
- Drive: nombres, fechas y tamaños leídos con el conector de Google Drive el 23/11/2026.
- 38 materias con carpeta: `data/recursos.json`. Termodinámica usa el color del año porque su
  imagen del sitio es de terceros.
- El chat es una dramatización: nombres y mensajes son ilustrativos.
