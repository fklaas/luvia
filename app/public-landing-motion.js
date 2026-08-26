(() => {
  "use strict";

  function mount(root = document) {
  const lifecycle = new AbortController();
  let revealObserver = null;
  let livingMap = null;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveal = [...root.querySelectorAll("[data-reveal]")];
  const nav = root.querySelector("[data-public-nav]");
  const hero = root.querySelector(".public-hero");
  const heroImage = root.querySelector(".public-hero-image");
  const heroCopy = root.querySelector(".public-hero-copy");
  const storyBands = [...root.querySelectorAll("[data-story-band]")];
  const floats = [...root.querySelectorAll("[data-float]")];
  const motionItems = [...root.querySelectorAll("[data-motion]")];
  const threadButtons = [...root.querySelectorAll("[data-thread-target]")];
  const livingCompass = root.querySelector("[data-living-compass]");
  const productDemo = root.querySelector("#product-demo");
  const productDemoSteps = [...root.querySelectorAll(".product-demo-steps li")];
  const compassCore = root.querySelector("[data-compass-next]");
  const compassCurrent = root.querySelector("[data-compass-current]");
  const compassGate = root.querySelector("[data-compass-gate]");
  const compassGateCore = root.querySelector("[data-compass-gate-toggle]");
  const compassGatePaths = root.querySelector(".compass-gate-paths");
  const gateIntents = [...root.querySelectorAll("[data-gate-intent]")];
  const compassStageNames = Object.freeze({ top: "Vorfreude", story: "Planen", live: "Erleben", memory: "Erinnern" });
  const compassTurns = Object.freeze({ top: -18, story: 42, live: 132, memory: 222 });
  const sections = threadButtons.map(button => ({
    button,
    key: button.dataset.threadTarget,
    section: button.dataset.threadTarget === "top" ? hero : root.querySelector(`#${button.dataset.threadTarget}`)
  })).filter(item => item.section);
  let frame = 0;

  if (!reduced) document.documentElement.classList.add("motion-linked");

  if (reduced || !("IntersectionObserver" in window)) {
    reveal.forEach(element => element.classList.add("is-visible"));
  } else {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle("is-visible", entry.isIntersecting));
    }, { rootMargin: "-4% 0px -8%", threshold: [.08, .2, .42] });
    reveal.forEach(element => revealObserver.observe(element));
  }

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  function smooth(value) {
    const bounded = clamp(value);
    return bounded * bounded * (3 - 2 * bounded);
  }

  function updateSceneMotion(viewportHeight, viewportWidth) {
    if (reduced) return;
    motionItems.forEach(element => {
      const scene = element.closest("[data-motion-scene]") || element;
      const rect = scene.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const reach = viewportHeight * .72 + Math.min(rect.height * .32, viewportHeight * .46);
      const rawFocus = clamp(1 - Math.abs(center - viewportHeight * .5) / Math.max(reach, 1));
      const delay = Number(element.dataset.motionDelay || 0) * .075;
      const focus = smooth(clamp((rawFocus - delay) / Math.max(1 - delay, .01)));
      const hidden = 1 - focus;
      const travelX = Math.min(viewportWidth * .11, 132);
      const kind = element.dataset.motion;
      let x = 0;
      let y = 0;
      let scale = 1;

      if (kind === "from-left") x = -travelX * hidden;
      if (kind === "from-right") x = travelX * hidden;
      if (kind === "fade-zoom") { y = 18 * hidden; scale = .94 + .06 * focus; }
      if (kind === "map-rise") { y = 30 * hidden; scale = .965 + .035 * focus; }
      if (kind === "horizontal-stage") { x = -travelX * .48 * hidden; y = 10 * hidden; scale = .985 + .015 * focus; }
      if (kind === "stagger-card") { y = 32 * hidden; scale = .96 + .04 * focus; }

      element.style.setProperty("--motion-x", `${x.toFixed(2)}px`);
      element.style.setProperty("--motion-y", `${y.toFixed(2)}px`);
      element.style.setProperty("--motion-scale", scale.toFixed(4));
      element.style.setProperty("--motion-opacity", (.28 + clamp(focus) * .72).toFixed(4));
      element.style.setProperty("--motion-blur", `${(hidden * 3).toFixed(2)}px`);
    });
  }

  function updateProductTheater(viewportHeight) {
    if (!productDemo || !productDemoSteps.length) return;
    const rect = productDemo.getBoundingClientRect();
    const travel = clamp((viewportHeight * .68 - rect.top) / Math.max(rect.height - viewportHeight * .46, 1));
    const activeIndex = Math.min(productDemoSteps.length - 1, Math.floor(travel * productDemoSteps.length));
    productDemo.style.setProperty("--product-demo-progress", travel.toFixed(4));
    productDemoSteps.forEach((step, index) => {
      const active = index === activeIndex;
      step.classList.toggle("is-active", active);
      if (active) step.setAttribute("aria-current", "step");
      else step.removeAttribute("aria-current");
    });
  }

  function createMapMarker(label, kind) {
    const marker = document.createElement("div");
    marker.className = "luvia-map-marker";
    marker.dataset.kind = kind;
    marker.innerHTML = `<span>${label}</span>`;
    return marker;
  }

  function initLivingMap() {
    const container = root.querySelector("#landing-living-map");
    const shell = root.querySelector("[data-living-map-shell]");
    const status = root.querySelector("[data-map-status]");
    if (!container || !shell || !window.maplibregl) {
      if (status) status.textContent = "Kartografie-Fallback · MapLibre offline";
      return;
    }

    let ready = false;
    try {
      const map = new window.maplibregl.Map({
        container,
        style: "https://tiles.openfreemap.org/styles/liberty",
        center: [10.7549, 54.0265],
        zoom: 13.45,
        bearing: -7,
        pitch: 20,
        interactive: false,
        attributionControl: true,
        fadeDuration: reduced ? 0 : 450
      });
      livingMap = map;

      map.on("load", () => {
        ready = true;
        const style = map.getStyle();
        (style.layers || []).forEach(layer => {
          const key = `${layer.id} ${layer["source-layer"] || ""}`.toLowerCase();
          try {
            if (layer.type === "background") map.setPaintProperty(layer.id, "background-color", "#f4f1eb");
            if (layer.type === "fill") {
              if (/water/.test(key)) map.setPaintProperty(layer.id, "fill-color", "#9bcbd8");
              else if (/park|wood|grass/.test(key)) map.setPaintProperty(layer.id, "fill-color", "#dce8dc");
              else if (/building/.test(key)) map.setPaintProperty(layer.id, "fill-color", "#ddd8cf");
              else if (/landuse|landcover|residential|commercial/.test(key)) map.setPaintProperty(layer.id, "fill-color", "#f0ede7");
            }
            if (layer.type === "line" && /road|street|transport/.test(key)) map.setPaintProperty(layer.id, "line-color", /motorway|trunk/.test(key) ? "#d9c4b8" : "#fffefd");
            if (layer.type === "symbol") {
              map.setPaintProperty(layer.id, "text-color", "#344b5c");
              map.setPaintProperty(layer.id, "text-halo-color", "rgba(255,255,255,.94)");
              map.setPaintProperty(layer.id, "text-halo-width", 1.25);
            }
          } catch (_) { /* External style layers do not all expose every paint property. */ }
        });

        map.addSource("luvia-route", {
          type: "geojson",
          lineMetrics: true,
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [[10.7508776,54.0232362],[10.7575622,54.0269110],[10.7563139,54.0279115],[10.7559148,54.0281034],[10.7572474,54.0278897]]
            }
          }
        });
        map.addLayer({ id: "luvia-route-halo", type: "line", source: "luvia-route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "rgba(255,255,255,.94)", "line-width": 10, "line-opacity": .94 } });
        map.addLayer({ id: "luvia-route-line", type: "line", source: "luvia-route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-width": 4, "line-gradient": ["interpolate",["linear"],["line-progress"],0,"#ec6555",.55,"#f19b55",1,"#2d8f83"] } });

        [
          { label: "Landhaus", kind: "coast", point: [10.7508776,54.0232362] },
          { label: "Diercksen", kind: "moment", point: [10.7563139,54.0279115] },
          { label: "Grande · 94%", kind: "place", point: [10.7575622,54.0269110] }
        ].forEach(item => new window.maplibregl.Marker({ element: createMapMarker(item.label, item.kind), anchor: "bottom" }).setLngLat(item.point).addTo(map));

        shell.classList.add("is-map-ready");
        if (status) status.textContent = "Open Map · Luvia Vector Style · © OpenStreetMap-Mitwirkende";
      });
      map.on("error", () => {
        if (!ready && status) status.textContent = "Kartografie-Fallback · Open-Map-Demo offline";
      });
    } catch (_) {
      if (status) status.textContent = "Kartografie-Fallback · Open-Map-Demo offline";
    }
  }

  function activeThread(viewportCenter) {
    const closest = sections
      .map(item => {
        const rect = item.section.getBoundingClientRect();
        const sectionCenter = rect.top + Math.min(rect.height * .42, window.innerHeight * .5);
        return { ...item, distance: Math.abs(sectionCenter - viewportCenter) };
      })
      .sort((a, b) => a.distance - b.distance)[0];
    threadButtons.forEach(button => {
      const active = button === closest?.button;
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
    if (!closest) return;
    livingCompass.dataset.compassStage = closest.key;
    livingCompass.style.setProperty("--compass-turn", `${compassTurns[closest.key]}deg`);
    if (compassCurrent) compassCurrent.textContent = compassStageNames[closest.key];
    const nextIndex = (sections.findIndex(item => item.key === closest.key) + 1) % sections.length;
    compassCore?.setAttribute("href", `#${sections[nextIndex]?.key === "top" ? "top" : sections[nextIndex]?.key || "story"}`);
  }

  function update() {
    frame = 0;
    const viewportHeight = window.innerHeight || 800;
    const viewportWidth = window.innerWidth || 1280;
    const viewportCenter = viewportHeight * .42;
    nav?.classList.toggle("is-scrolled", window.scrollY > 30);
    activeThread(viewportCenter);
    if (livingCompass && productDemo) {
      const productRect = productDemo.getBoundingClientRect();
      const productOwnsViewport = productRect.top < viewportHeight * .64 && productRect.bottom > viewportHeight * .34;
      const gateRect = compassGate?.getBoundingClientRect();
      const gateOwnsViewport = Boolean(gateRect && gateRect.top < viewportHeight * .72 && gateRect.bottom > viewportHeight * .28);
      livingCompass.classList.toggle("is-product-preview", productOwnsViewport || gateOwnsViewport);
    }
    updateSceneMotion(viewportHeight, viewportWidth);
    updateProductTheater(viewportHeight);

    const heroProgress = clamp(window.scrollY / Math.max(viewportHeight * .82, 1));
    document.documentElement.style.setProperty("--hero-progress", heroProgress.toFixed(4));
    if (livingCompass) {
      const compactViewport = viewportWidth < 760;
      const expandedSize = compactViewport ? 112 : Math.min(260, Math.max(205, viewportWidth * .17));
      const dockedSize = compactViewport ? 60 : 78;
      const compassSize = reduced ? dockedSize : expandedSize - (expandedSize - dockedSize) * heroProgress;
      const edge = compactViewport ? 12 : 18;
      const expandedRight = compactViewport ? 14 : Math.max(40, viewportWidth * .065);
      const compassRight = reduced ? edge : expandedRight - (expandedRight - edge) * heroProgress;
      livingCompass.style.setProperty("--compass-size", `${compassSize.toFixed(2)}px`);
      livingCompass.style.setProperty("--compass-right", `${compassRight.toFixed(2)}px`);
      livingCompass.style.setProperty("--compass-progress", heroProgress.toFixed(4));
      livingCompass.classList.toggle("is-docked", heroProgress > .72 || reduced);
    }
    if (reduced) return;

    if (heroImage) heroImage.style.setProperty("--hero-y", `${(heroProgress * 64).toFixed(2)}px`);
    if (heroCopy) heroCopy.style.setProperty("--hero-copy-y", `${(heroProgress * -72).toFixed(2)}px`);

    storyBands.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      const travel = clamp((viewportHeight - rect.top) / Math.max(viewportHeight + rect.height, 1));
      const focus = 1 - clamp(Math.abs((rect.top + rect.height / 2) - viewportCenter) / (viewportHeight * .9));
      section.style.setProperty("--story-progress", travel.toFixed(4));
      section.style.setProperty("--story-focus", focus.toFixed(4));
      section.style.setProperty("--story-drift", `${((travel - .5) * (index % 2 ? -52 : 52)).toFixed(2)}px`);
    });

    floats.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const distance = (rect.top + rect.height / 2 - viewportCenter) / viewportHeight;
      const shift = Math.max(-28, Math.min(28, distance * (index % 2 ? -24 : 24)));
      const tilt = Math.max(-2.2, Math.min(2.2, distance * (index % 2 ? 1.8 : -1.8)));
      element.style.setProperty("--float-shift", `${shift.toFixed(2)}px`);
      element.style.setProperty("--float-tilt", `${tilt.toFixed(2)}deg`);
    });
  }

  function queue() {
    if (frame) return;
    frame = requestAnimationFrame(update);
  }

  function setCompassGateOpen(open, { focusPath = false } = {}) {
    if (!compassGate || !compassGateCore || !compassGatePaths) return;
    compassGate.classList.toggle("is-open", open);
    compassGateCore.setAttribute("aria-expanded", String(open));
    compassGatePaths.setAttribute("aria-hidden", String(!open));
    if (open && focusPath) {
      window.setTimeout(() => compassGatePaths.querySelector("a")?.focus({ preventScroll: true }), reduced ? 0 : 640);
    }
  }

  threadButtons.forEach(button => button.addEventListener("click", () => {
    const target = button.dataset.threadTarget === "top" ? hero : root.querySelector(`#${button.dataset.threadTarget}`);
    target?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }));

  compassCore?.addEventListener("click", event => {
    event.preventDefault();
    const currentKey = livingCompass?.dataset.compassStage || "top";
    const currentIndex = sections.findIndex(item => item.key === currentKey);
    const next = sections[(currentIndex + 1) % sections.length] || sections[1];
    next?.section?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  });

  gateIntents.forEach(link => link.addEventListener("click", event => {
    event.preventDefault();
    setCompassGateOpen(false);
    compassGate?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    if (event.detail === 0) window.setTimeout(() => compassGateCore?.focus({ preventScroll: true }), reduced ? 0 : 720);
  }, { signal: lifecycle.signal }));

  compassGateCore?.addEventListener("click", event => {
    const open = !compassGate?.classList.contains("is-open");
    setCompassGateOpen(open, { focusPath: event.detail === 0 });
  }, { signal: lifecycle.signal });

  compassGate?.addEventListener("keydown", event => {
    if (event.key !== "Escape" || !compassGate.classList.contains("is-open")) return;
    event.preventDefault();
    setCompassGateOpen(false);
    compassGateCore?.focus({ preventScroll: true });
  }, { signal: lifecycle.signal });

  window.addEventListener("scroll", queue, { passive: true, signal: lifecycle.signal });
  window.addEventListener("resize", queue, { passive: true, signal: lifecycle.signal });
  initLivingMap();
  update();
  return () => {
    lifecycle.abort();
    revealObserver?.disconnect?.();
    livingMap?.remove?.();
    setCompassGateOpen(false);
    if (frame) cancelAnimationFrame(frame);
    document.documentElement.classList.remove('motion-linked');
  };
  }

  window.LuviaPublicLandingMotion = Object.freeze({ version: '13.82.72', mount });
})();
