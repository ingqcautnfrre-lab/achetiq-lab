/* ============================================================
   AChETIQ — Navbar (navbar.js)
   Fase 2. Especificación normativa: prompt canónico de la navbar
   (memoria del proyecto, cerrado 2026-05-16) + FASE_1 §1.2 / §10.

   Responsabilidades:
     - fetch del partial y del config; sustitución del placeholder
       <div data-loader="navbar">.
     - Render declarativo de brand, enlaces y submenús a partir
       del JSON (DOM API; sin innerHTML sobre strings del config).
     - Toggle hamburguesa con scroll-lock, acordeón mobile,
       teclado (ArrowDown/Up/Home/End/Esc) en submenús desktop.
     - Fallback estático si cualquier fetch o parseo falla.

   Sin dependencias externas. Auto-inicia en DOMContentLoaded.
   ============================================================ */

(function () {
  'use strict';

  var SEL_PLACEHOLDER = '[data-loader="navbar"]';
  var BASE = window.AChETIQBase || { root: '/', resolve: function (p) { return '/' + String(p).replace(/^(\.?\/)+/, ''); }, rewriteTree: function () {} };
  var URL_PARTIAL = BASE.resolve('partials/navbar.html');
  var URL_CONFIG  = BASE.resolve('data/navbar.json');
  var LOCK_CLASS  = 'navbar-scroll-lock';
  /* Umbral del patrón desktop. DEBE coincidir con el @media de
     navbar.css §4/§8/§9 (1024 px = --bp-lg, corrección S3): si
     divergen, el cierre por resize se dispara antes de tiempo o el
     aria-expanded queda desincronizado cuando CSS oculta el panel. */
  var BP_DESKTOP  = 1024;

  /* Chevron Lucide; hard-coded (no proviene del JSON). */
  var CHEVRON_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"' +
    ' viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
    ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' +
    ' aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>';

  function el(tag, cls, text, attrs) {
    var n = document.createElement(tag);
    if (cls)  n.className = cls;
    if (text != null) n.textContent = String(text);
    if (attrs) for (var k in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, k)) {
        n.setAttribute(k, String(attrs[k]));
      }
    }
    return n;
  }

  function chevron() {
    var s = el('span', 'navbar__chevron', null, { 'aria-hidden': 'true' });
    // XSS-sink OK: CHEVRON_SVG es una constante estática en código (no datos).
    s.innerHTML = CHEVRON_SVG;
    return s;
  }

  function hasSub(link) {
    return Array.isArray(link.submenu) && link.submenu.length > 0;
  }

  function safeVariant(v) {
    return (typeof v === 'string' && /^[a-z-]+$/.test(v)) ? v : 'ghost';
  }


  /* ─── Render ─────────────────────────────────────────────── */

  function renderBrand(root, brand) {
    if (!brand) return;
    var a = root.querySelector('[data-navbar-brand]');
    var logo = root.querySelector('[data-navbar-logo]');
    var word = root.querySelector('[data-navbar-wordmark]');
    if (a && brand.href) a.setAttribute('href', BASE.resolve(brand.href));
    if (word && brand.label) {
      word.textContent = brand.label;
      if (a) a.setAttribute('aria-label', brand.label);
    }
    if (logo && brand.logo) logo.setAttribute('src', BASE.resolve(brand.logo));

    /* Cabecera del panel mobile: mismo asset y wordmark que el brand,
       desde la única fuente data/navbar.json. */
    var panelLogo = root.querySelector('[data-navbar-panel-logo]');
    var panelWord = root.querySelector('[data-navbar-panel-wordmark]');
    if (panelWord && brand.label) panelWord.textContent = brand.label;
    if (panelLogo && brand.logo) panelLogo.setAttribute('src', BASE.resolve(brand.logo));
  }

  function renderLists(root, links) {
    var deskList   = root.querySelector('[data-navbar-list]');
    var mobileList = root.querySelector('[data-navbar-panel-list]');
    if (!deskList || !mobileList) return;

    deskList.replaceChildren();
    mobileList.replaceChildren();

    links.forEach(function (link, idx) {
      deskList.appendChild(buildDesktopItem(link, idx));
      mobileList.appendChild(buildMobileItem(link, idx));
    });
  }

  function buildDesktopItem(link, idx) {
    var v = safeVariant(link.variant);
    var li = el('li', 'navbar__item');
    var a  = el('a', 'nav-link nav-link--' + v + ' navbar__label',
                link.label, { href: BASE.resolve(link.href) });

    if (!hasSub(link)) { li.appendChild(a); return li; }

    li.classList.add('navbar__item--has-submenu');
    var subId = 'navbar-submenu-' + idx;
    a.setAttribute('aria-haspopup', 'menu');
    a.setAttribute('aria-expanded', 'false');
    a.setAttribute('aria-controls', subId);
    a.appendChild(chevron());

    var ul = el('ul', 'navbar__submenu', null,
                { role: 'menu', id: subId, 'aria-label': link.label });
    link.submenu.forEach(function (sub) {
      var sli = el('li', null, null, { role: 'none' });
      sli.appendChild(el('a', 'navbar__sublink', sub.label,
                         { href: BASE.resolve(sub.href), role: 'menuitem' }));
      ul.appendChild(sli);
    });

    li.appendChild(a);
    li.appendChild(ul);
    bindDesktopKeys(a, ul);
    bindDesktopExpansion(li, a);
    return li;
  }

  function buildMobileItem(link, idx) {
    var v = safeVariant(link.variant);
    var li = el('li', 'navbar__panel-item');
    var row = el('div', 'navbar__panel-row');
    var a = el('a',
               'navbar__panel-link' + (v === 'primary' ? ' navbar__panel-link--primary' : ''),
               link.label, { href: BASE.resolve(link.href) });
    row.appendChild(a);

    if (!hasSub(link)) { li.appendChild(row); return li; }

    li.classList.add('navbar__panel-item--has-submenu');
    var subId = 'navbar-panel-submenu-' + idx;
    var btn = el('button', 'navbar__panel-toggle', null, {
      type: 'button',
      'aria-expanded': 'false',
      'aria-controls': subId,
      'aria-label': 'Mostrar opciones de ' + link.label
    });
    btn.appendChild(chevron());
    row.appendChild(btn);

    var ul = el('ul', 'navbar__panel-submenu', null,
                { role: 'menu', id: subId, 'aria-label': link.label });
    link.submenu.forEach(function (sub) {
      var sli = el('li', null, null, { role: 'none' });
      sli.appendChild(el('a', 'navbar__panel-sublink', sub.label,
                         { href: BASE.resolve(sub.href), role: 'menuitem' }));
      ul.appendChild(sli);
    });

    li.appendChild(row);
    li.appendChild(ul);

    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      ul.classList.toggle('is-open', !open);
    });
    return li;
  }


  /* ─── Sincronía de aria-expanded en submenús desktop ─────── */

  /* El submenú desktop lo abre el CSS con :hover y :focus-within
     (navbar.css §7); el JS no lo monta/desmonta. Pero aria-expanded
     se sembró en "false" al construir y NUNCA se actualizaba: con el
     panel a la vista el atributo mentía y un lector de pantalla seguía
     anunciando «contraído» (WCAG 4.1.2 Nombre, Rol, Valor). Reflejamos
     el estado REAL —abierto = hover OR foco-dentro— en el disparador,
     espejando exactamente las dos condiciones del CSS. */
  function bindDesktopExpansion(li, trigger) {
    var hovered = false;
    var focused = false;
    function sync() {
      trigger.setAttribute('aria-expanded', (hovered || focused) ? 'true' : 'false');
    }
    li.addEventListener('mouseenter', function () { hovered = true;  sync(); });
    li.addEventListener('mouseleave', function () { hovered = false; sync(); });
    li.addEventListener('focusin',    function () { focused = true;  sync(); });
    /* focusout sólo cierra si el foco abandona el <li> por completo
       (relatedTarget fuera del subárbol); moverse entre disparador y
       ítems del submenú lo mantiene abierto, como el :focus-within. */
    li.addEventListener('focusout', function (ev) {
      if (!li.contains(ev.relatedTarget)) { focused = false; sync(); }
    });
  }


  /* ─── Teclado en submenús desktop ────────────────────────── */

  function bindDesktopKeys(trigger, submenu) {
    var items = function () {
      return Array.prototype.slice.call(submenu.querySelectorAll('[role="menuitem"]'));
    };

    trigger.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        var first = items()[0];
        if (first) first.focus();
      }
    });

    submenu.addEventListener('keydown', function (ev) {
      var list = items();
      var i = list.indexOf(document.activeElement);
      var n = list.length;
      if (ev.key === 'Escape')         { ev.preventDefault(); trigger.focus(); }
      else if (ev.key === 'ArrowDown') { ev.preventDefault(); list[(i + 1) % n].focus(); }
      else if (ev.key === 'ArrowUp')   { ev.preventDefault(); list[(i - 1 + n) % n].focus(); }
      else if (ev.key === 'Home')      { ev.preventDefault(); list[0].focus(); }
      else if (ev.key === 'End')       { ev.preventDefault(); list[n - 1].focus(); }
    });
  }


  /* ─── Panel mobile: open/close ───────────────────────────── */

  function setupMobilePanel(root) {
    var toggle  = root.querySelector('[data-navbar-toggle]');
    var overlay = root.querySelector('[data-navbar-overlay]');
    var panel   = root.querySelector('[data-navbar-panel]');
    if (!toggle || !overlay || !panel) return;

    /* Candidatos de foco visibles dentro del panel. Excluye los
       enlaces de submenús colapsados (offsetParent null cuando un
       ancestro tiene display:none). */
    function focusables() {
      var nodes = panel.querySelectorAll('a[href], button:not([disabled])');
      return Array.prototype.filter.call(nodes, function (n) {
        return n.offsetParent !== null;
      });
    }

    /* Trampa de foco (WCAG 2.4.3): el panel es un overlay modal en
       mobile; Tab y Shift+Tab ciclan dentro mientras está abierto.
       Se registra solo al abrir y se retira al cerrar. */
    function trapFocus(ev) {
      if (ev.key !== 'Tab') return;
      var list = focusables();
      if (!list.length) return;
      var first = list[0];
      var last  = list[list.length - 1];
      var active = document.activeElement;
      if (ev.shiftKey && (active === first || !panel.contains(active))) {
        ev.preventDefault(); last.focus();
      } else if (!ev.shiftKey && active === last) {
        ev.preventDefault(); first.focus();
      }
    }

    function open() {
      overlay.hidden = false; panel.hidden = false;
      void panel.offsetWidth;
      overlay.classList.add('is-open');
      panel.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Cerrar menú principal');
      document.body.classList.add(LOCK_CLASS);
      document.addEventListener('keydown', trapFocus, true);
      var first = focusables()[0];
      if (first) first.focus();
    }

    /* restoreFocus: true devuelve el foco al botón hamburguesa
       (cierre intencional: Esc, overlay, toggle). El cierre por
       resize a desktop no roba el foco. */
    function close(restoreFocus) {
      overlay.classList.remove('is-open');
      panel.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú principal');
      document.body.classList.remove(LOCK_CLASS);
      document.removeEventListener('keydown', trapFocus, true);
      var done = function () {
        if (toggle.getAttribute('aria-expanded') !== 'true') {
          panel.hidden = true; overlay.hidden = true;
        }
        panel.removeEventListener('transitionend', done);
      };
      panel.addEventListener('transitionend', done);
      if (restoreFocus) toggle.focus();
    }

    toggle.addEventListener('click', function () {
      if (toggle.getAttribute('aria-expanded') === 'true') { close(true); }
      else { open(); }
    });
    overlay.addEventListener('click', function () { close(true); });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        ev.preventDefault(); close(true);
      }
    });

    var mq = window.matchMedia('(min-width: ' + BP_DESKTOP + 'px)');
    var onMq = function (e) {
      if (e.matches && toggle.getAttribute('aria-expanded') === 'true') close(false);
    };
    if (mq.addEventListener) mq.addEventListener('change', onMq);
    else if (mq.addListener) mq.addListener(onMq);
  }


  /* ─── Fallback + inserción del partial ───────────────────── */

  function renderFallback(placeholder) {
    placeholder.replaceChildren();
    var header = el('header', 'navbar-fallback');
    var inner  = el('div', 'navbar-fallback__inner');
    inner.appendChild(el('a', 'navbar-fallback__brand', 'AChETIQ',
                         { href: BASE.resolve('/') }));
    header.appendChild(inner);
    placeholder.appendChild(header);
  }

  function insertPartial(placeholder, html) {
    var tpl = document.createElement('template');
    // XSS-sink OK: `html` es partials/navbar.html, un fragmento estático de
    // MISMO ORIGEN (no datos de usuario/red). Se parsea en <template> inerte.
    tpl.innerHTML = html.trim();
    var root = tpl.content.firstElementChild;
    if (!root || !root.matches('[data-navbar-root]')) {
      throw new Error('navbar: partial inválido');
    }
    /* Las URLs relativas del partial se resolverían contra la
       URL de la página anfitriona (que puede estar en cualquier
       subcarpeta). Las reescribimos ANTES de inyectar para que
       queden ancladas a la raíz del sitio. */
    BASE.rewriteTree(root);
    placeholder.replaceWith(root);
    return root;
  }


  /* ─── Init ──────────────────────────────────────────────── */

  function init() {
    var ph = document.querySelector(SEL_PLACEHOLDER);
    if (!ph) return;

    Promise.all([
      fetch(URL_PARTIAL, { credentials: 'same-origin' }),
      fetch(URL_CONFIG,  { credentials: 'same-origin' })
    ])
    .then(function (res) {
      if (!res[0].ok) throw new Error('navbar: partial ' + res[0].status);
      if (!res[1].ok) throw new Error('navbar: config '  + res[1].status);
      return Promise.all([res[0].text(), res[1].json()]);
    })
    .then(function (parts) {
      var root = insertPartial(ph, parts[0]);
      var cfg  = parts[1] || {};
      renderBrand(root, cfg.brand);
      renderLists(root, Array.isArray(cfg.links) ? cfg.links : []);
      setupMobilePanel(root);
    })
    .catch(function (err) {
      if (window.console && console.error) console.error('[AChETIQ navbar]', err);
      renderFallback(ph);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
