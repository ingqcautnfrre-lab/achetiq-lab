/* ============================================================
   AChETIQ — Componente: Cuenta regresiva de Recursos Académicos
   Archivo: assets/js/countdown-recursos.js
   ------------------------------------------------------------
   Comportamiento:
   - Lee la fecha objetivo del atributo [data-target-date] (ISO 8601)
     sobre el contenedor [data-countdown].
   - Actualiza días / horas / minutos / segundos cada 1 s.
   - Al expirar: oculta el bloque .countdown__pending y revela el
     contenido marcado con [data-countdown-revealed], emitiendo el
     evento personalizado "countdown:revealed".
   - Soporta múltiples instancias por página (cada [data-countdown]
     se inicializa de forma independiente).
   ------------------------------------------------------------
   Sin dependencias externas. JavaScript vanilla.
   ============================================================ */

(function () {
  "use strict";

  /* ── DEV PREVIEW (QA/UI) · TEMPORARY ────────────────────────
     El dev panel enlaza esta página con ?preview=true para poder
     auditar la UI de espera del contador. Cuando la fecha objetivo
     ya pasó, la lógica normal revela el contenido al instante y nos
     saca de la pantalla del temporizador. En modo preview empujamos
     la fecha objetivo un año al futuro (más abajo, al parsearla) y
     dejamos correr el script de forma nativa: el contador queda a la
     vista y tickea de verdad, sin tocar el DOM a mano.
     Eliminar junto con el dev panel cuando termine el testing. */
  const isPreview = new URLSearchParams(window.location.search).get("preview") === "true";

  var MS_SECOND = 1000;
  var MS_MINUTE = MS_SECOND * 60;
  var MS_HOUR = MS_MINUTE * 60;
  var MS_DAY = MS_HOUR * 24;

  /**
   * Devuelve el desglose de tiempo restante hasta la fecha objetivo.
   * @param {number} targetMs - epoch de la fecha objetivo en ms.
   * @returns {{total:number, days:number, hours:number, minutes:number, seconds:number}}
   */
  function getTimeLeft(targetMs) {
    var diff = targetMs - Date.now();

    if (diff <= 0) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      total: diff,
      days: Math.floor(diff / MS_DAY),
      hours: Math.floor((diff % MS_DAY) / MS_HOUR),
      minutes: Math.floor((diff % MS_HOUR) / MS_MINUTE),
      seconds: Math.floor((diff % MS_MINUTE) / MS_SECOND)
    };
  }

  /**
   * Escribe un valor en un dígito, con animación de cambio si difiere.
   * @param {HTMLElement} el - elemento [data-unit].
   * @param {number} value - valor numérico actual.
   */
  function setDigit(el, value) {
    if (!el) return;
    var text = String(value).padStart(2, "0");
    if (el.textContent === text) return;

    el.textContent = text;
    el.classList.remove("is-ticking");
    // Reinicia la animación de entrada.
    void el.offsetWidth; // reflow
    el.classList.add("is-ticking");
  }

  /**
   * Concuerda número y sustantivo en español.
   * @param {number} n
   * @param {string} sing - forma singular.
   * @param {string} plur - forma plural.
   */
  function pluralize(n, sing, plur) {
    return n + " " + (n === 1 ? sing : plur);
  }

  /**
   * Texto humano del tiempo restante para anuncio por lector de
   * pantalla. Deliberadamente OMITE los segundos: es el anuncio
   * throttleado (una vez por minuto), no el tic visual.
   * @param {{days:number,hours:number,minutes:number}} t
   * @returns {string}
   */
  function formatRemaining(t) {
    if (t.days === 0 && t.hours === 0 && t.minutes === 0) {
      return "Menos de un minuto para la apertura de Apuntes Académicos.";
    }
    var parts = [];
    if (t.days > 0) parts.push(pluralize(t.days, "día", "días"));
    if (t.hours > 0) parts.push(pluralize(t.hours, "hora", "horas"));
    if (t.minutes > 0 || parts.length === 0) {
      parts.push(pluralize(t.minutes, "minuto", "minutos"));
    }
    var joined = parts.length > 1
      ? parts.slice(0, -1).join(", ") + " y " + parts[parts.length - 1]
      : parts[0];
    return "Faltan " + joined + " para la apertura de Apuntes Académicos.";
  }

  /**
   * Inicializa una instancia del contador.
   * @param {HTMLElement} root - contenedor [data-countdown].
   */
  function initCountdown(root) {
    var rawDate = root.getAttribute("data-target-date");
    if (!rawDate) {
      console.warn("[countdown] Falta el atributo data-target-date.", root);
      return;
    }

    var targetDate = new Date(rawDate);

    // ── Modo preview (QA/UI) · TEMPORARY ──────────────────────
    // "Time travel": empujamos la fecha objetivo un año al futuro
    // para forzar la pantalla de espera y dejar que el script corra
    // su lógica natural (UI visible + tickeo real).
    if (isPreview) {
      targetDate = new Date();
      targetDate.setFullYear(targetDate.getFullYear() + 1);
      console.log("Dev Mode: Target date pushed +1 year to force timer UI.");
    }

    var targetMs = targetDate.getTime();
    if (isNaN(targetMs)) {
      console.warn("[countdown] data-target-date no es una fecha válida:", rawDate);
      return;
    }

    var pending = root.querySelector("[data-countdown-pending]");
    var revealed = root.querySelector("[data-countdown-revealed]");

    var units = {
      days: root.querySelector('[data-unit="days"]'),
      hours: root.querySelector('[data-unit="hours"]'),
      minutes: root.querySelector('[data-unit="minutes"]'),
      seconds: root.querySelector('[data-unit="seconds"]')
    };

    var intervalId = null;
    var revealedDone = false;

    /* Anuncio accesible THROTTLEADO. El reloj visual tickea cada
       segundo, pero ya NO es una región viva (se le quitó aria-live
       del markup): así no se spamea al lector de pantalla cada segundo
       (el reloj mantiene role="timer" + aria-label, legible a demanda).
       En su lugar, una región sr-only polite anuncia el tiempo restante
       en lenguaje natural y SÓLO cuando cambia el minuto. */
    var announcer = document.createElement("p");
    announcer.className = "sr-only";
    announcer.setAttribute("role", "status");
    announcer.setAttribute("aria-live", "polite");
    announcer.setAttribute("aria-atomic", "true");
    announcer.setAttribute("data-countdown-announce", "");
    root.appendChild(announcer);

    var lastAnnounceKey = null;
    function announceThrottled(t) {
      if (revealedDone || t.total <= 0) return;
      var key = t.days + ":" + t.hours + ":" + t.minutes;
      if (key === lastAnnounceKey) return;
      lastAnnounceKey = key;
      announcer.textContent = formatRemaining(t);
    }

    function reveal() {
      if (revealedDone) return;
      revealedDone = true;

      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }

      if (pending) pending.setAttribute("hidden", "");
      if (revealed) revealed.removeAttribute("hidden");

      root.setAttribute("data-countdown-state", "revealed");
      root.dispatchEvent(
        new CustomEvent("countdown:revealed", { bubbles: true })
      );
    }

    function render() {
      var t = getTimeLeft(targetMs);

      setDigit(units.days, t.days);
      setDigit(units.hours, t.hours);
      setDigit(units.minutes, t.minutes);
      setDigit(units.seconds, t.seconds);

      announceThrottled(t);

      if (t.total <= 0) reveal();
    }

    // Estado inicial: si ya expiró, revelar sin mostrar el contador.
    if (getTimeLeft(targetMs).total <= 0) {
      reveal();
      return;
    }

    root.setAttribute("data-countdown-state", "pending");
    if (revealed && !revealed.hasAttribute("hidden")) {
      revealed.setAttribute("hidden", "");
    }

    render();
    intervalId = setInterval(render, MS_SECOND);
  }

  function initAll() {
    var nodes = document.querySelectorAll("[data-countdown]");
    for (var i = 0; i < nodes.length; i++) {
      initCountdown(nodes[i]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();
