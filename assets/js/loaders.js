/* ============================================================
   AChETIQ — Motor de carga dinámica: registro (loaders.js)
   ------------------------------------------------------------
   Versión: 1.0 · Fase 3 — P3.6

   Registro extensible de renderizadores para el patrón
   <elemento data-loader="<nombre>">. El motor que recorre el DOM
   y dispara los fetch vive en assets/js/main.js; este módulo
   expone:

     - registerLoader(nombre, renderFn)   API pública / extensible
     - getLoader(nombre) · hasLoader      lookup
     - isSpecialLoader(nombre)            navbar / footer
     - createElement(tag, opts)           helper DOM seguro
     - safeHref(url)                      sanitiza enlaces
     - renderInlineLoader / renderEmpty / renderError
                                          estados visuales del fetch
     - renderizadores por defecto para los JSON ya presentes:
       gabinetes, recursos, directiva, historia, documentos,
       instituciones. Producen markup BEM conforme al catálogo
       de Fase 1 (§4, §5, §8).

   CASOS ESPECIALES (no atendidos por el motor)
     - data-loader="navbar"  →  assets/js/navbar.js carga el
       partial y la configuración del header; reemplaza el
       placeholder antes de que el motor pueda procesarlo.
     - data-loader="footer"  →  assets/js/footer.js, idem.
   Ambos scripts se cargan en el boilerplate como <script>
   clásicos ANTES del módulo main.js y se auto-inician en
   DOMContentLoaded. El motor reconoce esos dos nombres como
   SPECIAL y no los toca.

   CÓMO REGISTRAR UN LOADER NUEVO DESDE UNA PÁGINA
     Insertá un módulo propio ANTES del main.js del boilerplate;
     los módulos diferidos se evalúan en orden de aparición y el
     motor recién escanea en DOMContentLoaded. Las rutas del
     ejemplo usan «./» (página en la raíz del sitio); desde
     subcarpetas reemplazar por «../» o «../../» según
     corresponda:

       <script type="module">
         import { registerLoader, createElement, safeHref }
           from './assets/js/loaders.js';

         registerLoader('miseccion', (container, data) => {
           // container = el nodo <… data-loader="miseccion">.
           // data      = JSON parseado de data/miseccion.json.
           // El motor ya limpió container; sólo populá su contenido.
           const ul = createElement('ul', { class: 'mi-lista' });
           data.forEach((item) => {
             ul.appendChild(createElement('li', { text: item.nombre }));
           });
           container.appendChild(ul);
         });
       </script>
       <script type="module" src="./assets/js/main.js"></script>

     Para sobrescribir un renderer por defecto (p. ej. agrupar
     `recursos` por año conectado a `.pill-nav`), basta con volver
     a registrar el mismo nombre: la última registración gana.

   REGLAS DE SEGURIDAD (FASE_1 §7.2 · auditadas en el pase 04-security)
     CONVENCIÓN XSS (no romper — la CSP `script-src 'self'` no salva de
     DOM-based XSS; el escape lo hace el código):
     - PROHIBIDO innerHTML / outerHTML / insertAdjacentHTML / document.write
       con strings derivados de data/*.json o de cualquier dato de red/usuario.
       Construí el DOM con createElement + textContent + setAttribute: la DOM
       API escapa por nosotros los caracteres especiales (<, >, ", &…).
     - innerHTML SÓLO se permite con CONSTANTES de SVG/markup escritas en el
       propio código (íconos) o con fragmentos de <template> de un partial de
       MISMO ORIGEN. Los pocos usos que existen están marcados «XSS-sink» en
       navbar.js, footer.js y easter-egg.js; ninguno recibe datos.
     - Todo href construido a partir de datos DEBE pasar por safeHref() antes
       de aplicarse: bloquea javascript:, data:, file: y otros schemes
       peligrosos (sólo http/https, mailto/tel y rutas relativas).

   Sin dependencias externas. ES module nativo, sin transpilación.
   ============================================================ */

'use strict';


/* ─────────────────────────────────────────────────────────────
   1. Registro
   ───────────────────────────────────────────────────────────── */

const registry = new Map();

/* Nombres reservados: ya tienen scripts dedicados que cargan
   partial + JSON y reemplazan el placeholder. El motor los omite
   para no pisarse con ellos. */
const SPECIAL = new Set(['navbar', 'footer']);

export function registerLoader(name, renderFn) {
  if (typeof name !== 'string' || !name.trim()) {
    throw new TypeError('registerLoader: el nombre debe ser un string no vacío');
  }
  if (typeof renderFn !== 'function') {
    throw new TypeError('registerLoader: renderFn debe ser una función');
  }
  registry.set(name.trim(), renderFn);
}

export function getLoader(name) {
  return registry.get(name) || null;
}

export function hasLoader(name) {
  return registry.has(name);
}

export function isSpecialLoader(name) {
  return SPECIAL.has(name);
}


/* Registro paralelo de ESQUELETOS de carga. Una región puede
   declarar, además de su renderizador de datos, una maqueta gris
   que el motor (main.js) pinta mientras está el fetch en vuelo,
   en lugar del loader genérico de puntos. La clave es el mismo
   nombre de data-loader. Si una región no registra esqueleto, el
   motor cae al loader inline «Bouncing Dots». */
const skeletonRegistry = new Map();

export function registerSkeleton(name, renderFn) {
  if (typeof name !== 'string' || !name.trim()) {
    throw new TypeError('registerSkeleton: el nombre debe ser un string no vacío');
  }
  if (typeof renderFn !== 'function') {
    throw new TypeError('registerSkeleton: renderFn debe ser una función');
  }
  skeletonRegistry.set(name.trim(), renderFn);
}

export function getSkeleton(name) {
  return skeletonRegistry.get(name) || null;
}

export function hasSkeleton(name) {
  return skeletonRegistry.has(name);
}


/* ─────────────────────────────────────────────────────────────
   2. Helpers DOM
   ───────────────────────────────────────────────────────────── */

/* Crea un elemento. Todo string proveniente del JSON pasa por
   textContent o setAttribute: el DOM API escapa caracteres
   especiales automáticamente, sin manipulación manual ni regex. */
export function createElement(tag, opts) {
  const o = opts || {};
  const node = document.createElement(tag);
  if (o.class) node.className = String(o.class);
  if (o.text != null) node.textContent = String(o.text);
  if (o.attrs) {
    for (const key of Object.keys(o.attrs)) {
      const v = o.attrs[key];
      if (v != null) node.setAttribute(key, String(v));
    }
  }
  if (o.children) {
    for (const child of o.children) {
      if (child) node.appendChild(child);
    }
  }
  return node;
}

/* Marca un ítem de grilla para la animación de ENTRADA escalonada
   tras el swap del data-loader (motion.css §1 .anim-enter). Fija la
   custom property --index (posición del ítem) que el CSS traduce a
   un animation-delay = --index × --stagger-step. El valor se satura
   en STAGGER_CAP: listas largas (p. ej. 41 materias) no deben
   encadenar un escalonado interminable. El movimiento reducido lo
   neutraliza el propio CSS (la regla vive en no-preference). */
const STAGGER_CAP = 8;
export function markEnter(el, i) {
  el.classList.add('anim-enter');
  el.style.setProperty('--index', String(Math.min(i | 0, STAGGER_CAP)));
  return el;
}

/* Schemes admitidos para href: HTTP/HTTPS y mail/tel para
   contactos; cualquier ruta relativa al sitio (/, ./, ../, #).
   Todo lo demás (javascript:, data:, file:…) se rechaza. */
const SAFE_URL_RE = /^(?:https?:|mailto:|tel:|\/|\.\/|\.\.\/|#)/i;

export function safeHref(url) {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  return SAFE_URL_RE.test(trimmed) ? trimmed : null;
}

/* Atributos canónicos para enlaces externos. */
function setExternal(a) {
  a.setAttribute('target', '_blank');
  a.setAttribute('rel', 'noopener noreferrer');
}

/* Devuelve host+path sin protocolo ni barra final, para mostrar
   un texto compacto en el enlace. Cae al string original si la
   entrada no es un URL parseable. */
function prettyUrl(href) {
  try {
    const u = new URL(href);
    return (u.host + u.pathname).replace(/\/+$/, '');
  } catch (_) {
    return String(href);
  }
}


/* ─────────────────────────────────────────────────────────────
   3. Estados visuales del fetch
   ───────────────────────────────────────────────────────────── */

/* Escribe el texto de una región viva en dos fases (S4): el nodo
   con role/aria-live entra al DOM vacío y el texto se asigna en el
   siguiente frame. Los lectores de pantalla solo anuncian con
   fiabilidad los CAMBIOS dentro de una región viva ya registrada
   en el árbol de accesibilidad; una región insertada ya con texto
   puede pasar en silencio (sobre todo con aria-live="polite").
   Esto vale tanto para role="status" como para role="alert". */
function setLiveText(node, text) {
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => { node.textContent = text; });
  } else {
    setTimeout(() => { node.textContent = text; }, 0);
  }
}

/* Loader inline «Bouncing Dots» (P3.3, variante sin overlay).
   Reutiliza las clases definidas en assets/css/loader.css. El
   atributo .safe-motion conserva la animación bajo
   prefers-reduced-motion (pulso de opacidad). */
export function renderInlineLoader(container, message) {
  container.replaceChildren();
  container.setAttribute('data-loader-state', 'loading');

  const wrap = createElement('div', {
    class: 'loader loader--msg-right',
    attrs: { role: 'status', 'aria-live': 'polite' }
  });
  const dots = createElement('div', { class: 'loader__dots' });
  for (let i = 0; i < 3; i++) {
    dots.appendChild(createElement('span', { class: 'loader__dot safe-motion' }));
  }
  wrap.appendChild(dots);

  const text = (typeof message === 'string' && message) ? message : 'Cargando…';
  const msg = createElement('p', { class: 'loader__message' });
  wrap.appendChild(msg);

  container.appendChild(wrap);
  setLiveText(msg, text);
}

/* ─────────────────────────────────────────────────────────────
   Esqueletos de carga (skeleton screens)
   ─────────────────────────────────────────────────────────────
   Para regiones cuya forma final se conoce de antemano (la grilla
   de materias), pintamos la silueta de las tarjetas reales en vez
   de los tres puntos: la estructura aparece de inmediato y la
   espera se siente más corta. El estilo (tinte + barrido) vive en
   assets/css/loader.css; aquí sólo se arma el markup. Cada pieza
   gris lleva .safe-motion para conservar una alternativa accesible
   bajo prefers-reduced-motion.
   ───────────────────────────────────────────────────────────── */

/* Cuántas siluetas pintar en la grilla de materias: suficientes
   para cubrir el primer viewport en anchos típicos sin armar las
   41 reales. El grid fluido reparte estas piezas en 1–4 columnas. */
const SKELETON_MATERIAS = 9;

/* Pieza gris animada. `shape` añade clases de forma/tamaño. */
function skeletonBox(shape) {
  const cls = 'skeleton safe-motion' + (shape ? ' ' + shape : '');
  return createElement('span', { class: cls, attrs: { 'aria-hidden': 'true' } });
}

/* Silueta de una .card-materia: cover 16:9 + tres líneas de texto
   (año, nombre, estado) de anchos desiguales, como la tarjeta real
   que la reemplazará. */
function buildSkeletonMateria() {
  const card = createElement('div', { class: 'skeleton-card' });
  card.appendChild(skeletonBox('skeleton-card__cover'));

  const body = createElement('div', { class: 'skeleton-card__body' });
  body.appendChild(skeletonBox('skeleton-line skeleton-line--year'));
  body.appendChild(skeletonBox('skeleton-line skeleton-line--title'));
  body.appendChild(skeletonBox('skeleton-line skeleton-line--status'));
  card.appendChild(body);

  return card;
}

/* Esqueleto de la región «recursos» (grilla de materias de
   Apuntes). Reusa la misma grilla fluida que el render real para
   que las siluetas caigan en idénticas pistas; toda la maqueta es
   aria-hidden y un único role="status" anuncia la carga una vez,
   igual que el loader de puntos. */
export function renderRecursosSkeleton(container) {
  container.replaceChildren();
  container.setAttribute('data-loader-state', 'loading');

  const grid = createElement('div', {
    class: 'grid-cards grid-cards--fluid apuntes__grid',
    attrs: { 'aria-hidden': 'true' }
  });
  for (let i = 0; i < SKELETON_MATERIAS; i++) {
    grid.appendChild(buildSkeletonMateria());
  }
  container.appendChild(grid);

  const status = createElement('p', {
    class: 'sr-only',
    attrs: { role: 'status', 'aria-live': 'polite' }
  });
  container.appendChild(status);
  setLiveText(status, 'Cargando materias…');
}

/* Coloca un esqueleto de carga sobre el cover de una tarjeta y lo
   retira cuando su imagen `img` resuelve (load) o falla (error). Así
   la caja del cover no queda en blanco mientras la imagen (lazy)
   baja, sino con el mismo barrido gris del resto de la carga. Tolera
   imágenes ya cacheadas (complete + naturalWidth): limpia al instante.
   El estilo del overlay vive en cards.css (.card-materia__cover-skeleton). */
export function coverSkeleton(cover, img) {
  let sk = createElement('span', {
    class: 'skeleton safe-motion card-materia__cover-skeleton',
    attrs: { 'aria-hidden': 'true' }
  });
  cover.appendChild(sk);

  const clear = () => {
    if (sk && sk.parentNode) sk.parentNode.removeChild(sk);
    sk = null;
  };

  img.addEventListener('load', clear);
  img.addEventListener('error', clear);
  if (img.complete && img.naturalWidth > 0) clear();
}

/* Empty-state (FASE_1 §8.1). Markup conforme al catálogo, el
   estilo de .empty-state vive en assets/css/states.css.
   role="status" + aria-live="polite" anuncia la transición
   loading → empty a los lectores de pantalla; los empty-states
   estáticos del sitio (que NO suceden a un loader) usan el mismo
   markup sin estas ARIA, ya que no representan un cambio dinámico. */
export function renderEmpty(container, opts) {
  const o = opts || {};
  container.replaceChildren();
  container.setAttribute('data-loader-state', 'empty');

  const block = createElement('div', {
    class: 'empty-state',
    attrs: { role: 'status', 'aria-live': 'polite' }
  });
  block.appendChild(createElement('h3', {
    class: 'empty-state__title',
    text: o.title || 'Aún no hay contenido publicado'
  }));
  const desc = createElement('p', { class: 'empty-state__desc' });
  block.appendChild(desc);
  container.appendChild(block);
  /* Texto en dos fases (ver setLiveText): garantiza el anuncio de
     la transición loading → empty. El título queda estático (no
     anunciar dos veces el mismo estado). */
  setLiveText(desc, o.desc || 'Estamos trabajando en esta sección. Pronto encontrarás aquí novedades de la asociación.');
}

/* Mensaje de error accesible. role="alert" (live assertive
   implícito) lo anuncia a lectores de pantalla. El texto se asigna
   en dos fases (setLiveText) DESPUÉS de insertar el bloque: la
   inserción de un alert ya poblado no se anuncia en todas las
   combinaciones navegador/lector, el cambio dentro de uno vacío
   sí. El detalle técnico se loguea en consola desde el motor
   (main.js); el usuario sólo ve el aviso. */
export function renderError(container, opts) {
  const o = opts || {};
  container.replaceChildren();
  container.setAttribute('data-loader-state', 'error');

  const block = createElement('div', {
    class: 'loader-error',
    attrs: { role: 'alert' }
  });
  const msg = createElement('p', { class: 'loader-error__message' });
  block.appendChild(msg);
  container.appendChild(block);
  setLiveText(msg, o.message || 'No se pudo cargar este bloque. Probá recargar la página.');
}


/* ============================================================
   4. Renderizadores por defecto
   ------------------------------------------------------------
   Producen markup BEM conforme al catálogo (FASE_1 §4-§5). Una
   página puede sobrescribirlos llamando registerLoader('nombre',
   suFn) antes de DOMContentLoaded; la última registración gana.
   ============================================================ */

/* ─── 4.1 gabinetes (FASE_1 §4.2) ──────────────────────────── */

function renderGabinetes(container, data) {
  const list = (Array.isArray(data) ? data.slice() : [])
    .sort((a, b) => (a.orden || 0) - (b.orden || 0));

  const grid = createElement('div', { class: 'grid-cards grid-cards--2' });
  list.forEach((g, i) => grid.appendChild(markEnter(buildGabineteCard(g), i)));
  container.appendChild(grid);
}

function buildGabineteCard(g) {
  const card = createElement('article', { class: 'card card-gabinete' });

  card.appendChild(createElement('h3', {
    class: 'card-gabinete__title',
    text: g.nombre || ''
  }));

  if (g.descripcion_corta) {
    card.appendChild(createElement('p', {
      class: 'card-gabinete__desc',
      text: g.descripcion_corta
    }));
  }

  const href = g.id
    ? safeHref(window.AChETIQBase.resolve('pages/gabinetes/' + String(g.id)))
    : null;
  if (href) {
    const footer = createElement('footer', { class: 'card-footer' });
    footer.appendChild(createElement('a', {
      class: 'card-gabinete__link',
      text: 'Conocer más →',
      attrs: { href }
    }));
    card.appendChild(footer);
  }

  return card;
}


/* ─── 4.2 recursos / materias (FASE_1 §4.9) ────────────────── */

const YEAR_LABEL = {
  1: '1.º año', 2: '2.º año', 3: '3.º año', 4: '4.º año', 5: '5.º año'
};

function renderRecursos(container, data) {
  const list = Array.isArray(data) ? data : [];
  const grid = createElement('div', { class: 'grid-cards grid-cards--3' });
  list.forEach((m, i) => grid.appendChild(markEnter(buildMateriaCard(m), i)));
  container.appendChild(grid);
}

function buildMateriaCard(m) {
  const anio = (Number.isInteger(m.anio) && m.anio >= 1 && m.anio <= 5)
    ? m.anio : null;
  const href = m.id
    ? safeHref(window.AChETIQBase.resolve('pages/recursos/apuntes#' + String(m.id)))
    : null;

  const attrs = {};
  if (href) attrs.href = href;
  if (anio) attrs['data-anio'] = anio;

  const card = createElement('a', { class: 'card card-materia', attrs });

  /* La cubierta reserva su alto con aspect-ratio 16/9 (cards.css
     §4.9), de modo que no aporta CLS. Si la materia trae imagen
     (campo `imagen` en data/recursos.json) se inyecta un <img> con
     width/height explícitos (1280×720) y la imagen llena la caja
     vía object-fit:cover; si no, queda el color plano por año. */
  const cover = createElement('div', {
    class: 'card-materia__cover',
    attrs: { 'aria-hidden': 'true' }
  });
  const rawImg = (typeof m.imagen === 'string') ? m.imagen.trim() : '';
  const imgSrc = rawImg ? safeHref(window.AChETIQBase.resolve(rawImg)) : null;
  if (imgSrc) {
    const img = createElement('img', {
      attrs: {
        src: imgSrc, alt: '', width: '1280', height: '720',
        loading: 'lazy', decoding: 'async'
      }
    });
    /* Esqueleto de carga sobre el cover hasta que la imagen (lazy)
       resuelva; se retira en load/error. Misma silueta que la
       pantalla de carga (.card-materia__cover-skeleton, cards.css). */
    coverSkeleton(cover, img);
    cover.appendChild(img);
  }
  card.appendChild(cover);

  const body = createElement('div', { class: 'card-materia__body' });
  if (anio) {
    body.appendChild(createElement('p', {
      class: 'card-materia__year caption',
      text: YEAR_LABEL[anio]
    }));
  }
  body.appendChild(createElement('h3', {
    class: 'card-materia__name',
    text: m.nombre || ''
  }));
  card.appendChild(body);

  return card;
}


/* ─── 4.3 directiva (FASE_1 §4.3) ──────────────────────────── */

const SUBGROUP_RANK = { presidencia: 1, titulares: 2, suplentes: 3 };

function renderDirectiva(container, data) {
  const list = (Array.isArray(data) ? data.slice() : []).sort((a, b) => {
    const sa = SUBGROUP_RANK[a.subgrupo] || 99;
    const sb = SUBGROUP_RANK[b.subgrupo] || 99;
    if (sa !== sb) return sa - sb;
    return (a.orden || 0) - (b.orden || 0);
  });

  const grid = createElement('div', { class: 'grid-cards grid-cards--4' });
  list.forEach((p, i) => grid.appendChild(markEnter(buildIntegranteCard(p), i)));
  container.appendChild(grid);
}

function buildIntegranteCard(person) {
  const card = createElement('article', { class: 'card-integrante' });

  const photoBox = createElement('div', { class: 'card-integrante__photo' });
  const fotoUrl = typeof person.foto === 'string' ? safeHref(person.foto) : null;
  if (fotoUrl) {
    /* Contrato de aspecto 1:1 (retrato cuadrado, FASE_1 §4.3).
       width/height explícitos reservan el espacio ANTES de cargar
       la imagen (CLS < 0,1 — RENDIMIENTO_Presupuesto.md); el valor
       exacto no importa: la caja .card-integrante__photo fija
       aspect-ratio 1/1 y el img se estira con object-fit: cover. */
    photoBox.appendChild(createElement('img', {
      attrs: {
        src: fotoUrl, alt: '', width: '800', height: '800',
        loading: 'lazy', decoding: 'async'
      }
    }));
  } else {
    /* Placeholder con iniciales — spec §4.3, estado sin foto. */
    photoBox.appendChild(createElement('span', {
      class: 'card-integrante__placeholder',
      text: initials(person.nombre || ''),
      attrs: { 'aria-hidden': 'true' }
    }));
  }
  card.appendChild(photoBox);

  card.appendChild(createElement('h3', {
    class: 'card-integrante__name',
    text: person.nombre || ''
  }));
  card.appendChild(createElement('p', {
    class: 'card-integrante__role',
    text: person.cargo || ''
  }));

  return card;
}

function initials(name) {
  return String(name).trim().split(/\s+/).filter(Boolean)
    .slice(0, 2).map((p) => p.charAt(0)).join('').toUpperCase();
}


/* ─── 4.4 historia / timeline ramificado (FASE_1 §5.5 · rediseño) ─
   Árbol de tubos en --color-accent: un tronco central del que
   brotan ramas tubulares alternadas izq/der, cada una rematada en
   un nodo-aro con el año. El tronco se «dibuja» con el scroll y
   cada rama crece al entrar en viewport. Estado base = visible: sin
   JS o con prefers-reduced-motion el árbol se ve completo y quieto.
   El estilo vive en assets/css/sobre-asociacion.css §C. */

const SVG_NS_TL = 'http://www.w3.org/2000/svg';

/* viewBox y trazo del brazo, calibrados para la geometría de
   escritorio (--tl-arm/--tl-band = 210, --tl-node = 116). El SVG
   usa preserveAspectRatio="none" + non-scaling-stroke, de modo que
   el mismo path se reescala con la banda en cada breakpoint. */
const TL_ARM_VIEWBOX = '0 0 210 210';
const TL_ARM_PATH = 'M0 188 C 36 169, 60 150, 90 150';

function renderHistoria(container, data) {
  const list = (Array.isArray(data) ? data.slice() : [])
    .sort((a, b) => yearKey(a.anio) - yearKey(b.anio));

  /* Tronco central (pista atenuada + relleno que crece con scroll).
     Va PRIMERO en el DOM para que quede en la capa de fondo: las
     ramas y, sobre todo, los nodos-aro (con interior papel) pintan
     por encima sin pelear por z-index. */
  const axis = createElement('div', {
    class: 'timeline__axis',
    attrs: { 'aria-hidden': 'true' }
  });
  axis.appendChild(createElement('div', { class: 'timeline__axis-track' }));
  axis.appendChild(createElement('div', { class: 'timeline__axis-fill' }));
  container.appendChild(axis);

  /* El contenedor ES el <ol class="timeline">: poblamos sus
     entradas directamente y alternamos el lado por índice. */
  list.forEach((h, i) => {
    container.appendChild(buildTimelineEntry(h, i % 2 === 0 ? 'right' : 'left', false));
  });

  /* Entrada ghost final — proyecta hacia el futuro sin cerrar
     contenido (FASE_1 §5.5). El lado continúa la alternancia. */
  container.appendChild(buildTimelineEntry({
    titulo: 'Próximamente',
    descripcion: 'La historia de AChETIQ continúa. Los próximos capítulos se escriben hoy.'
  }, list.length % 2 === 0 ? 'right' : 'left', true));

  setupTimelineMotion(container);
}

function yearKey(y) {
  const n = typeof y === 'number' ? y : Number.parseInt(String(y), 10);
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
}

function buildTimelineEntry(h, side, ghost) {
  const li = createElement('li', {
    class: 'timeline__entry timeline__entry--' + side +
      (ghost ? ' timeline__entry--ghost' : '')
  });

  /* ── Rama: soldadura + brazo SVG + nodo-aro ── */
  const branch = createElement('div', {
    class: 'timeline__branch',
    attrs: { 'aria-hidden': 'true' }
  });

  /* Orden en el DOM = orden de pintado: brazo (abajo) → soldadura
     → nodo (arriba). El nodo lleva además z-index para asegurar su
     interior papel por encima del tronco. */
  const svg = document.createElementNS(SVG_NS_TL, 'svg');
  svg.setAttribute('class', 'timeline__arm');
  svg.setAttribute('viewBox', TL_ARM_VIEWBOX);
  svg.setAttribute('preserveAspectRatio', 'none');
  const path = document.createElementNS(SVG_NS_TL, 'path');
  path.setAttribute('d', TL_ARM_PATH);
  svg.appendChild(path);
  branch.appendChild(svg);

  branch.appendChild(createElement('span', { class: 'timeline__junction' }));

  const marker = createElement('div', { class: 'timeline__marker' });
  if (ghost) {
    const glyph = createElement('div', { class: 'timeline__ghost-glyph' });
    glyph.appendChild(createElement('span'));
    glyph.appendChild(createElement('span'));
    glyph.appendChild(createElement('span'));
    marker.appendChild(glyph);
  } else {
    marker.appendChild(createElement('span', {
      class: 'timeline__year',
      text: h.anio == null ? '' : String(h.anio)
    }));
  }
  branch.appendChild(marker);

  /* ── Contenido (afuera del aro): título + descripción ── */
  const content = createElement('div', { class: 'timeline__content' });
  if (h.titulo) {
    content.appendChild(createElement('h3', {
      class: 'timeline__title',
      text: h.titulo
    }));
  }
  if (h.descripcion) {
    content.appendChild(createElement('p', {
      class: 'timeline__desc',
      text: h.descripcion
    }));
  }

  li.appendChild(branch);
  li.appendChild(content);
  return li;
}

/* MOVIMIENTO — IntersectionObserver (brota cada rama) + scroll
   (rellena el tronco y marca el nodo activo). Con
   prefers-reduced-motion → estado final, sin animación. */
function setupTimelineMotion(ol) {
  const entries = Array.prototype.slice.call(
    ol.querySelectorAll('.timeline__entry')
  );
  const fill = ol.querySelector('.timeline__axis-fill');
  const reduce = typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* El tronco (pista + relleno) debe MORIR en el empalme de la entrada
     ghost «Próximamente» — no continuar hasta el pie del <ol>, donde la
     banda de la última rama deja un sobrante de eje vacío. Recortamos la
     altura del eje al CENTRO de esa soldadura (no a su borde inferior):
     así el remate redondeado de la pista y el relleno (border-radius pill)
     cierra justo bajo el disco de la soldadura, sin que asome ningún
     extremo recto del tronco. El relleno —cuya altura escribe el scroll—
     se topa en ese mismo punto (ver update()). Se usa la cadena offsetTop
     (inmune a los transforms de animación, y correcta en cada breakpoint)
     en lugar de getBoundingClientRect. */
  const axis = ol.querySelector('.timeline__axis');
  const ghostJunction = ol.querySelector(
    '.timeline__entry--ghost .timeline__junction'
  );
  let trunkEndPx = 0;
  function offsetWithin(el, ancestor) {
    let y = 0;
    let node = el;
    while (node && node !== ancestor) {
      y += node.offsetTop;
      node = node.offsetParent;
    }
    return node === ancestor ? y : null;
  }
  function capTrunkAtGhost() {
    if (!axis || !ghostJunction) return;
    const end = offsetWithin(ghostJunction, ol);
    if (end == null || !Number.isFinite(end) || end <= 0) return;
    trunkEndPx = end;
    axis.style.height = end + 'px';
    axis.style.bottom = 'auto';
  }
  capTrunkAtGhost();
  window.addEventListener('resize', capTrunkAtGhost);

  /* Prepara el «dibujo» de cada brazo: dasharray = longitud total;
     offset = longitud (oculto) salvo en reduce-motion (visible). La
     longitud se memoriza por entrada para poder REPLEGAR el trazo al
     salir de viewport (animación bidireccional). */
  const armLen = new Map();
  entries.forEach((li) => {
    if (li.classList.contains('timeline__entry--ghost')) return;
    const p = li.querySelector('.timeline__arm path');
    if (!p || typeof p.getTotalLength !== 'function') return;
    const len = p.getTotalLength();
    armLen.set(li, len);
    p.style.strokeDasharray = String(len);
    p.style.strokeDashoffset = reduce ? '0' : String(len);
  });

  if (reduce || !('IntersectionObserver' in window)) {
    entries.forEach((li) => li.classList.add('is-visible'));
    if (fill) fill.style.height = '100%';
    return;
  }

  ol.classList.add('timeline--anim');

  /* Bidireccional: NO se hace unobserve. Al entrar en viewport la
     entrada se revela (rama dibujada, nodo crecido); al salir —tanto
     bajando como subiendo— se oculta de nuevo (rama replegada al valor
     de longitud memorizado). Las transiciones en ambos sentidos las
     aporta el CSS (estado base + .is-visible). */
  const io = new IntersectionObserver((records) => {
    records.forEach((r) => {
      const li = r.target;
      const isGhost = li.classList.contains('timeline__entry--ghost');
      const p = li.querySelector('.timeline__arm path');
      if (r.isIntersecting) {
        li.classList.add('is-visible');
        if (p && !isGhost) p.style.strokeDashoffset = '0';
      } else {
        li.classList.remove('is-visible');
        if (p && !isGhost) p.style.strokeDashoffset = String(armLen.get(li) || 0);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
  entries.forEach((li) => io.observe(li));

  let ticking = false;
  function update() {
    ticking = false;
    const rect = ol.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const anchor = vh * 0.5;
    /* El relleno se topa en el fin del tronco (centro de la soldadura
       ghost), no en el pie del <ol>: así cierra con su remate redondeado
       en el mismo punto que la pista. */
    const cap = trunkEndPx || rect.height;
    const filled = Math.max(0, Math.min(cap, anchor - rect.top));
    if (fill) fill.style.height = filled + 'px';

    let best = null;
    let bestDist = Infinity;
    entries.forEach((li) => {
      if (li.classList.contains('timeline__entry--ghost')) return;
      const m = li.querySelector('.timeline__marker');
      if (!m) return;
      const box = m.getBoundingClientRect();
      const d = Math.abs((box.top + box.height / 2) - anchor);
      if (d < bestDist) { bestDist = d; best = li; }
    });
    entries.forEach((li) => {
      li.classList.toggle('is-active', li === best && bestDist < vh * 0.42);
    });
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}


/* ─── 4.5 documentos (FASE_1 §5.4) ─────────────────────────── */

function renderDocumentos(container, data) {
  const list = (Array.isArray(data) ? data.slice() : [])
    .sort((a, b) => (a.orden || 0) - (b.orden || 0));

  const grid = createElement('div', { class: 'grid-cards grid-cards--2' });
  list.forEach((d, i) => grid.appendChild(markEnter(buildDocumentoCard(d), i)));
  container.appendChild(grid);
}

function buildDocumentoCard(d) {
  const card = createElement('article', { class: 'card card-documento' });

  const body = createElement('div', { class: 'card-documento__body' });
  body.appendChild(createElement('h3', {
    class: 'card-documento__title',
    text: d.titulo || ''
  }));
  if (d.descripcion) {
    body.appendChild(createElement('p', {
      class: 'card-documento__desc',
      text: d.descripcion
    }));
  }
  const meta = formatDocMeta(d);
  if (meta) {
    body.appendChild(createElement('p', {
      class: 'card-documento__meta caption',
      text: meta
    }));
  }
  card.appendChild(body);

  if (d.archivo) {
    /* `archivo` se guarda como ruta relativa al sitio (ej.
       "docs/Estatuto.pdf"); la anclamos a la raíz real del sitio
       (window.AChETIQBase) y sanitizamos. */
    const href = safeHref(window.AChETIQBase.resolve(String(d.archivo)));
    if (href) {
      card.appendChild(createElement('a', {
        class: 'card-documento__action btn btn-secondary',
        text: 'Descargar',
        attrs: { href, download: '' }
      }));
    }
  }
  return card;
}

function formatDocMeta(d) {
  const parts = [];
  if (d.tipo) parts.push(String(d.tipo));
  if (typeof d.tamano_kb === 'number') {
    const mb = d.tamano_kb / 1024;
    parts.push(mb >= 1 ? mb.toFixed(2) + ' MB' : d.tamano_kb + ' KB');
  }
  return parts.join(' · ');
}


/* ─── 4.6 instituciones (FASE_1 §4.8) ──────────────────────── */

function renderInstituciones(container, data) {
  const list = (Array.isArray(data) ? data : []).filter(Boolean);
  const grid = createElement('div', { class: 'grid-cards grid-cards--2' });
  list.forEach((inst, i) => grid.appendChild(markEnter(buildInstitucionCard(inst), i)));
  container.appendChild(grid);
}

function buildInstitucionCard(inst) {
  const card = createElement('article', { class: 'card card-institucion' });

  if (inst.logo) {
    const src = safeHref(window.AChETIQBase.resolve(String(inst.logo)));
    if (src) {
      const alt = 'Logo ' + (inst.nombre_corto || inst.nombre || '');
      /* Aspecto genuinamente desconocido (cada logo tiene proporción
         propia), por lo que no se fijan width/height. Sin riesgo de
         CLS: el CSS fija height (--logo-md, 64 px) y la tarjeta es
         una pila vertical centrada, así que el width:auto del logo
         no desplaza a sus hermanos al cargar. */
      card.appendChild(createElement('img', {
        class: 'card-institucion__logo',
        attrs: { src, alt, loading: 'lazy', decoding: 'async' }
      }));
    }
  }

  card.appendChild(createElement('h3', {
    class: 'card-institucion__name',
    text: inst.nombre || ''
  }));

  const href = safeHref(inst.web);
  if (href) {
    const a = createElement('a', {
      class: 'card-institucion__link',
      text: prettyUrl(inst.web) + ' →',
      attrs: { href }
    });
    setExternal(a);
    card.appendChild(a);
  }

  return card;
}


/* ─── 4.7 Registro de defaults ─────────────────────────────── */

/* Los nombres registrados aquí coinciden con los archivos de
   data/*.json existentes y con la tabla «Mapeo loader → JSON →
   componente» del catálogo (FASE_1 §10.1).

   No se registra `redes` porque assets/js/footer.js gestiona ya
   internamente data/redes.json al inyectar el footer; tampoco se
   registran `apuntes`, `noticias`, `actividades` ni `galeria`,
   cuyos JSON no existen en v1.0 (los pondrá la página que los
   incorpore vía registerLoader). */

registerLoader('gabinetes',     renderGabinetes);
registerLoader('recursos',      renderRecursos);
registerLoader('directiva',     renderDirectiva);
registerLoader('historia',      renderHistoria);
registerLoader('documentos',    renderDocumentos);
registerLoader('instituciones', renderInstituciones);

/* Esqueletos de carga. La grilla de materias de Recursos
   Académicos muestra siluetas de tarjeta en lugar de los puntos
   genéricos mientras carga; el resto de las regiones conserva el
   loader inline por defecto. La página de Apuntes sobreescribe el
   RENDER de «recursos» (apuntes.js) pero hereda este esqueleto:
   ambas variantes comparten la silueta .card-materia. */
registerSkeleton('recursos', renderRecursosSkeleton);
