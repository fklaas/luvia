(() => {
  "use strict";

  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = () => window.matchMedia("(pointer: coarse)").matches;
  const patterns = Object.freeze({
    select: 5,
    confirm: [7, 24, 11],
    success: [6, 28, 7, 30, 14],
    warning: [14, 34, 14],
    navigate: 7
  });

  function haptic(intent = "select") {
    const detail = { intent, pattern: patterns[intent] || patterns.select, source: "experience-preview-web-adapter" };
    window.dispatchEvent(new CustomEvent("luvia:experience-haptic", { detail }));
    if (reduceMotion()) return false;
    try { return Boolean(navigator.vibrate?.(detail.pattern)); } catch (_) { return false; }
  }

  function ripple(event) {
    if (reduceMotion() || !Number.isFinite(event?.clientX)) return;
    const node = document.createElement("i");
    node.className = "motion-ripple";
    node.style.left = `${event.clientX}px`;
    node.style.top = `${event.clientY}px`;
    const host = event?.target?.closest?.('[data-public-landing]') || document.getElementById('app');
    host?.append(node);
    node.addEventListener("animationend", () => node.remove(), { once: true });
  }

  function bindMagnetic(root = document) {
    if (coarsePointer() || reduceMotion()) return;
    root.querySelectorAll("[data-magnetic]").forEach(element => {
      if (element.dataset.magneticReady) return;
      element.dataset.magneticReady = "true";
      const strength = Math.max(2, Math.min(10, Number(element.dataset.magneticStrength || 6)));
      element.addEventListener("pointermove", event => {
        const rect = element.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - .5) * strength * 2;
        const y = ((event.clientY - rect.top) / rect.height - .5) * strength * 2;
        element.style.setProperty("--magnetic-x", `${x.toFixed(2)}px`);
        element.style.setProperty("--magnetic-y", `${y.toFixed(2)}px`);
        element.classList.add("is-magnetic");
      });
      element.addEventListener("pointerleave", () => {
        element.style.setProperty("--magnetic-x", "0px");
        element.style.setProperty("--magnetic-y", "0px");
        element.classList.remove("is-magnetic");
      });
    });
  }

  function navigate(url, intent = "navigate") {
    if (!url || document.body.classList.contains("is-cinematic-leaving")) return;
    haptic(intent);
    document.body.classList.add("is-cinematic-leaving");
    window.setTimeout(() => { window.location.assign(url); }, reduceMotion() ? 1 : 330);
  }

  function bindCinematicLinks(root = document) {
    root.querySelectorAll("a[data-cinematic-link]").forEach(link => {
      if (link.dataset.cinematicReady) return;
      link.dataset.cinematicReady = "true";
      /* Document links stay native. Intercepting a primary click here made the
         transition depend on a delayed script navigation and could leave the
         page inert in embedded or focus-changing browser surfaces. Cross-
         document View Transitions provide the visual continuity instead. */
      link.addEventListener("click", event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
        haptic(link.dataset.haptic || "navigate");
      });
    });
  }

  function init(root = document) {
    document.body.classList.add("is-cinematic-enter");
    const releasePageEnter = () => document.body.classList.remove("is-cinematic-enter");
    document.body.addEventListener("animationend", event => {
      if (event.target === document.body && event.animationName === "cinematic-page-enter") releasePageEnter();
    }, { once: true });
    window.setTimeout(releasePageEnter, reduceMotion() ? 20 : 900);
    bindMagnetic(root);
    bindCinematicLinks(root);
    root.addEventListener("click", event => {
      const tactile = event.target.closest("[data-haptic]");
      if (!tactile) return;
      haptic(tactile.dataset.haptic || "select");
      ripple(event);
    });
    return () => {
      document.body.classList.remove("is-cinematic-enter", "is-cinematic-leaving");
      root.querySelectorAll("[data-magnetic].is-magnetic").forEach(element => {
        element.classList.remove("is-magnetic");
        element.style.removeProperty("--magnetic-x");
        element.style.removeProperty("--magnetic-y");
      });
    };
  }

  const api = Object.freeze({ version: "13.82.128", mount: init, init, haptic, navigate, bindMagnetic, bindCinematicLinks });
  window.LuviaPublicLandingExperience = api;
  window.LuviaExperiencePreview = api;
})();
