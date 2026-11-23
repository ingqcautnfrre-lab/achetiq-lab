# REVIEW — Historia 2: Seguimiento de Carrera (versiones 4 a 6)

## Decisiones

- Introducción: las tres preguntas forman una lista compacta en la mitad superior, cada una con su
  indicio (correlativas de Balances, barra de 41 obligatorias, notas sueltas); luego se atenúan y
  queda la respuesta, «Una planilla lo calcula por vos.», en negro.
- Vista web: la herramienta real a 1200 px CSS (escritorio) dentro de una ventana de navegador que
  sube desde abajo; la cámara acerca la cabecera, la nota de privacidad, la tabla (de N° a
  Disponible), la tabla de finales y el tablero, sin que la ventana suba por encima del título.
- Correlativas: tres acciones habilitan cinco materias; cada habilitación se dibuja como un arco
  desde la materia marcada y se resalta la fila.
- Finales: al tipear cada nota cambian las tarjetas de promedios (valores leídos de la herramienta
  real en cada paso) y aparece la nota final en verde.
- Coherencia: los estados de los finales parten de las cuatro materias marcadas en el video; al
  volver a Seguimiento, Álgebra y Física I figuran aprobadas con 7 y 8, y el tablero muestra
  4 aprobadas, 9,8 % de avance y promedios de 7,50 y 5,20, con anillos sobre los promedios.
- Cierre: logo animado por capas, igual que la historia 1.

## Medido y observado

- `hyperframes check`: sin errores. Cuadros del render final revisados en todo el recorrido.
- Se corrigió un acercamiento inválido al tablero (las tarjetas de promedios están en filas
  distintas de la grilla de tres columnas) y se reemplazó por anillos sobre ambas tarjetas.
- Audio (ffmpeg, EBU R128): −40,4 LUFS integrados, pico −16,5 dBFS; medido, no escuchado.

## Plano más débil

- 16,8-22,5 s: la carga de finales sigue siendo el tramo más largo (5,7 s). Si la historia se
  siente extensa, puede dejarse solo Física I (tres intentos), con lo que baja a unos 30 s.

## Advertencias que se mantienen

- `outside_safe_zone` (rieles de TikTok/Shorts) y `container_overflow` del desplazador interno de
  la ventana, que es intencional.
- `line_unread` en las preguntas de la introducción: se atenúan pero siguen visibles hasta la
  salida.

## Ajustes posteriores (versión 5)

- Los recuadros de las materias habilitadas se miden con el diseño de la tabla de cada paso: al
  cambiar el texto de «materias faltantes» cambia la altura de las filas de Nivel II, y antes los
  recuadros quedaban desplazados. Los conectores se actualizan en el mismo instante.
- Las tarjetas de promedios de la carga de finales bajan 85 px y quedan separadas de la planilla.

## Ajuste de la versión 6

- Carga de finales: la ventana entra completa en el cuadro (sin acercamiento) y las tarjetas de
  promedios se ubican dentro de ella, alineadas con los bordes de la tabla de finales y 44 px por
  debajo. Aparecen cuando la cámara ya se detuvo y se retiran cuando vuelve a moverse, de modo que
  nunca quedan fuera de la ventana.
- Audio: −40,4 LUFS integrados, pico −16,5 dBFS.

## Uso en Instagram

- Sticker de enlace debajo del bloque final (aprox. y = 1400-1600 px), hacia
  `achetiq.github.io/pages/recursos/seguimiento`.
