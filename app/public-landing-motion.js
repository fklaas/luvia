(() => {
  "use strict";

  const VERSION = "13.82.80";
  const DESTINATIONS = Object.freeze([
    "Scharbeutz · Ostsee", "Kopenhagen · Dänemark", "Pragser Wildsee · Südtirol", "Lissabon · Portugal",
    "Kyoto · Japan", "Utrecht · Niederlande", "Annecy · Frankreich", "Ljubljana · Slowenien",
    "San Sebastián · Spanien", "Skye · Schottland", "Lofoten · Norwegen", "Porto · Portugal",
    "Bled · Slowenien", "Tallinn · Estland", "Milos · Griechenland", "Gent · Belgien",
    "Valletta · Malta", "Freiburg · Schwarzwald", "Montreal · Kanada", "Hobart · Tasmanien"
  ]);
  const FEELINGS = Object.freeze([
    "Meer, Zeit füreinander und kein enger Takt.", "Kleine Gassen, lange Abende und viel Neugier.",
    "Berge im Blick und morgens noch keinen Plan.", "Gutes Essen, vertraute Menschen und Raum zum Bleiben.",
    "Leise Wege, neue Geschichten und ein bisschen Abenteuer."
  ]);
  const TONES = Object.freeze([
    { name: "Coral", coral: "#ec6555", deep: "#d94e43", sea: "#2789a4", green: "#288a70", soft: "#fff0ed" },
    { name: "Sea", coral: "#2f95a8", deep: "#20758a", sea: "#1f839d", green: "#4a9c8b", soft: "#eaf8fb" },
    { name: "Sand", coral: "#c99562", deep: "#aa7342", sea: "#5e91a0", green: "#738d72", soft: "#fbf2e7" },
    { name: "Sage", coral: "#799b7a", deep: "#577c61", sea: "#5a9298", green: "#527d64", soft: "#eef6ee" },
    { name: "Lavender", coral: "#9b82c5", deep: "#7960a7", sea: "#598fa8", green: "#6f947f", soft: "#f3effb" },
    { name: "Sunset", coral: "#ef7b62", deep: "#ce594b", sea: "#9278ae", green: "#4f8f7e", soft: "#fff0e9" },
    { name: "Fjord", coral: "#4c8792", deep: "#346a76", sea: "#3d7f99", green: "#527b6c", soft: "#eaf3f4" },
    { name: "Berry", coral: "#ae5e7a", deep: "#8f405f", sea: "#617f9b", green: "#6f876b", soft: "#faedf2" },
    { name: "Lagoon", coral: "#38a69b", deep: "#23877e", sea: "#2d8ea4", green: "#319077", soft: "#e8f8f5" },
    { name: "Ember", coral: "#d36d46", deep: "#ad4f34", sea: "#668a9d", green: "#72805c", soft: "#fff0e8" }
  ]);
  const PLACES = Object.freeze([
    { city: "Scharbeutz", country: "Deutschland", name: "Dünenküche", note: "Ruhig am Wasser, ideal nach der Fahrradtour.", fit: 94, point: [10.7549, 54.0265] },
    { city: "Kopenhagen", country: "Dänemark", name: "Havlys", note: "Nordisch leicht, am Kanal und gut für lange Gespräche.", fit: 93, point: [12.5683, 55.6761] },
    { city: "Lissabon", country: "Portugal", name: "Pátio da Luz", note: "Kleine Teller, warmer Innenhof und später Abend.", fit: 92, point: [-9.1393, 38.7223] },
    { city: "Kyoto", country: "Japan", name: "Mori no Table", note: "Leise, saisonal und in einer kleinen Seitengasse.", fit: 91, point: [135.7681, 35.0116] },
    { city: "Utrecht", country: "Niederlande", name: "Kade 17", note: "Direkt am Wasser und unkompliziert mit Kindern.", fit: 90, point: [5.1214, 52.0907] },
    { city: "Annecy", country: "Frankreich", name: "Le Rivage", note: "See, Berge und ein ruhiger Tisch draußen.", fit: 89, point: [6.1294, 45.8992] },
    { city: "Ljubljana", country: "Slowenien", name: "Zeleni Kot", note: "Regional, vegetarisch stark und mitten im Grünen.", fit: 95, point: [14.5058, 46.0569] },
    { city: "San Sebastián", country: "Spanien", name: "Marea Baja", note: "Pintxos ohne Hektik, nah an der Bucht.", fit: 92, point: [-1.9812, 43.3183] },
    { city: "Portree", country: "Schottland", name: "Harbour Hearth", note: "Warmes Feuer, lokale Küche und Blick auf den Hafen.", fit: 88, point: [-6.1942, 57.4125] },
    { city: "Reine", country: "Norwegen", name: "Nordlys Bord", note: "Kleine Karte, große Aussicht und ein sehr langsamer Abend.", fit: 96, point: [13.0896, 67.9324] },
    { city: "Porto", country: "Portugal", name: "Ribeira Clara", note: "Am Fluss, teilbare Gerichte und Sonnenuntergang.", fit: 93, point: [-8.6291, 41.1579] },
    { city: "Bled", country: "Slowenien", name: "Jezero Haus", note: "Frühes Abendessen am See, danach noch eine Runde zu Fuß.", fit: 90, point: [14.1138, 46.3692] },
    { city: "Tallinn", country: "Estland", name: "Vana Aed", note: "Historischer Garten, modern gekocht und angenehm still.", fit: 91, point: [24.7536, 59.437] },
    { city: "Milos", country: "Griechenland", name: "Ammos Table", note: "Fisch, Gemüse und Sand unter den Füßen.", fit: 94, point: [24.4283, 36.6914] },
    { city: "Gent", country: "Belgien", name: "Licht aan de Leie", note: "Pflanzenbetont, am Wasser und spät noch offen.", fit: 92, point: [3.7174, 51.0543] },
    { city: "Valletta", country: "Malta", name: "Saffron Steps", note: "Eine kleine Terrasse zwischen honigfarbenen Fassaden.", fit: 89, point: [14.5146, 35.8997] },
    { city: "Freiburg", country: "Deutschland", name: "Wald & Wein", note: "Regional, entspannt und gut nach einem langen Wandertag.", fit: 93, point: [7.8421, 47.999] },
    { city: "Montreal", country: "Kanada", name: "Rue des Amis", note: "Lebendig, inklusiv und perfekt zum Teilen.", fit: 90, point: [-73.5673, 45.5017] },
    { city: "Hobart", country: "Tasmanien", name: "Southern Table", note: "Hafenprodukte, offene Küche und viel Zeit.", fit: 91, point: [147.3272, -42.8821] },
    { city: "Tromsø", country: "Norwegen", name: "Stillhavn", note: "Warm, ruhig und mit Blick in die arktische Nacht.", fit: 95, point: [18.9553, 69.6492] }
  ]);

  function mount(root = document) {
    const lifecycle = new AbortController();
    const signal = lifecycle.signal;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gate = root.querySelector("[data-compass-gate]");
    const gateCore = root.querySelector("[data-compass-gate-toggle]");
    const stage = root.querySelector("[data-compass-stage]");
    const primaryPaths = root.querySelector(".compass-primary-paths");
    const worldPaths = root.querySelector(".compass-world-paths");
    const heading = root.querySelector(".landing-compass-heading h1");
    const instruction = root.querySelector("[data-compass-instruction]");
    const worldCanvases = [...root.querySelectorAll("[data-story-world]")];
    const gateIntents = [...root.querySelectorAll("[data-gate-intent]")];
    let currentAngle = -8;
    let seeking = false;
    let livingMap = null;
    let activeMarker = null;
    let activePlace = 0;
    let activeHorizon = 0;
    let destinationIndex = 0;
    let horizonTimer = 0;
    let destinationTimer = 0;
    let placeTimer = 0;

    const delay = ms => new Promise(resolve => window.setTimeout(resolve, reduced ? 0 : ms));
    const setHidden = (node, hidden) => {
      if (!node) return;
      node.setAttribute("aria-hidden", String(hidden));
    };

    function setGateLevel(level) {
      if (!gate) return;
      gate.dataset.compassLevel = level;
      const open = level !== "closed";
      gateCore?.setAttribute("aria-expanded", String(open));
      setHidden(primaryPaths, level !== "primary");
      setHidden(worldPaths, level !== "worlds");
      if (level === "closed") {
        heading.innerHTML = "Wohin darf Luvia<br><em>dich zuerst führen?</em>";
        instruction.textContent = "Manche Wege zeigen sich erst, wenn du den Kompass weckst.";
      } else if (level === "primary") {
        heading.innerHTML = "Drei Richtungen.<br><em>Dein erster Schritt.</em>";
        instruction.textContent = "Die Nadel hört dir zu. Wähle, wohin sie dich führen darf.";
      } else if (level === "worlds") {
        heading.innerHTML = "Welche Luvia-Welt<br><em>möchtest du öffnen?</em>";
        instruction.textContent = "Jede Richtung öffnet eine eigene Leinwand. Du kehrst jederzeit hierher zurück.";
      }
    }

    async function openCompass({ focus = false } = {}) {
      if (!gate || !gateCore || gate.dataset.compassLevel !== "closed") return;
      gate.dataset.compassLevel = "opening";
      gateCore.setAttribute("aria-expanded", "true");
      await delay(980);
      setGateLevel("primary");
      if (focus) primaryPaths?.querySelector("a")?.focus({ preventScroll: true });
    }

    async function seekNeedle(target) {
      if (!gate || seeking) return false;
      seeking = true;
      gate.style.setProperty("--needle-from", `${currentAngle}deg`);
      gate.style.setProperty("--needle-target", `${target}deg`);
      gate.classList.remove("is-seeking");
      void gate.offsetWidth;
      gate.classList.add("is-seeking");
      await delay(1180);
      currentAngle = target;
      gate.style.setProperty("--needle-rest", `${currentAngle}deg`);
      gate.classList.remove("is-seeking");
      seeking = false;
      return true;
    }

    async function showWorld(worldId, sourceButton) {
      if (!await seekNeedle(Number(sourceButton?.dataset.compassAngle || 0))) return;
      const canvas = worldCanvases.find(item => item.dataset.storyWorld === worldId);
      if (!canvas) return;
      gate.classList.add("is-departing");
      await delay(620);
      gate.hidden = true;
      canvas.hidden = false;
      root.dataset.activeStoryWorld = worldId;
      window.scrollTo({ top: 0, behavior: "auto" });
      requestAnimationFrame(() => canvas.classList.add("is-visible"));
      canvas.querySelector("[data-world-back]")?.focus({ preventScroll: true });
      if (worldId === "spatial") {
        livingMap?.resize?.();
        updatePlaceRondell();
      }
    }

    async function returnToCompass(canvas) {
      canvas.classList.remove("is-visible");
      await delay(430);
      canvas.hidden = true;
      delete root.dataset.activeStoryWorld;
      gate.hidden = false;
      window.scrollTo({ top: 0, behavior: "auto" });
      gate.classList.remove("is-departing");
      setGateLevel("worlds");
      requestAnimationFrame(() => gate.classList.add("is-returning"));
      await delay(620);
      gate.classList.remove("is-returning");
      worldPaths?.querySelector(`[data-world-target="${canvas.dataset.storyWorld}"]`)?.focus({ preventScroll: true });
    }

    function openAuth(mode) {
      window.LuviaGuidedJourneyEntry?.openAuth?.(mode);
    }

    gateCore?.addEventListener("click", event => {
      event.preventDefault();
      if (gate.dataset.compassLevel === "closed") openCompass({ focus: event.detail === 0 });
    }, { signal });
    gateCore?.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      if (gate.dataset.compassLevel === "closed") openCompass({ focus: true });
    }, { signal });

    root.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const target = event.target.closest?.("[data-compass-choice],[data-world-target],[data-world-back]");
      if (!target) return;
      event.preventDefault();
      target.click();
    }, { signal });

    stage?.addEventListener("pointermove", event => {
      if (reduced || !gate || event.pointerType === "touch") return;
      const rect = stage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      gate.style.setProperty("--compass-tilt-x", `${(-y * 7).toFixed(2)}deg`);
      gate.style.setProperty("--compass-tilt-y", `${(x * 9).toFixed(2)}deg`);
      gate.classList.add("is-awake");
    }, { passive: true, signal });
    stage?.addEventListener("pointerleave", () => {
      gate?.style.setProperty("--compass-tilt-x", "0deg");
      gate?.style.setProperty("--compass-tilt-y", "0deg");
      gate?.classList.remove("is-awake");
    }, { signal });

    root.querySelectorAll("[data-compass-choice]").forEach(choice => choice.addEventListener("click", async event => {
      event.preventDefault();
      event.stopPropagation();
      const action = choice.dataset.compassChoice;
      if (!await seekNeedle(Number(choice.dataset.compassAngle || 0))) return;
      if (action === "worlds") setGateLevel("worlds");
      else openAuth(action);
    }, { signal }));

    root.querySelectorAll("[data-world-target]").forEach(button => button.addEventListener("click", () => showWorld(button.dataset.worldTarget, button), { signal }));
    root.querySelectorAll("[data-world-back]").forEach(button => button.addEventListener("click", () => returnToCompass(button.closest("[data-story-world]")), { signal }));

    gateIntents.forEach(link => link.addEventListener("click", async event => {
      event.preventDefault();
      gate?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      const intent = link.dataset.gateIntent;
      if (gate?.hidden) {
        const canvas = worldCanvases.find(item => !item.hidden);
        if (canvas) await returnToCompass(canvas);
      }
      if (gate?.dataset.compassLevel === "closed") await openCompass();
      if (intent === "worlds") {
        const choice = root.querySelector('[data-compass-choice="worlds"]');
        await seekNeedle(Number(choice?.dataset.compassAngle || -28));
        setGateLevel("worlds");
      } else {
        const choice = root.querySelector(`[data-compass-choice="${intent}"]`);
        await seekNeedle(Number(choice?.dataset.compassAngle || 0));
        openAuth(intent);
      }
    }, { signal }));

    gate?.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      if (gate.dataset.compassLevel === "worlds") {
        event.preventDefault();
        setGateLevel("primary");
        primaryPaths?.querySelector("a")?.focus({ preventScroll: true });
      } else if (gate.dataset.compassLevel === "primary") {
        event.preventDefault();
        setGateLevel("closed");
        gateCore?.focus({ preventScroll: true });
      }
    }, { signal });

    function mountTones() {
      const palette = root.querySelector("[data-tone-palette]");
      const copy = root.querySelector("[data-tone-copy]");
      if (!palette) return;
      TONES.forEach((tone, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = index === 0 ? "is-selected" : "";
        button.style.setProperty("--tone", tone.coral);
        button.setAttribute("aria-label", `${tone.name} als Reisefarbe wählen`);
        button.setAttribute("aria-pressed", String(index === 0));
        button.innerHTML = `<i></i><span>${tone.name}</span>`;
        button.addEventListener("click", () => {
          palette.querySelectorAll("button").forEach(item => { item.classList.remove("is-selected"); item.setAttribute("aria-pressed", "false"); });
          button.classList.add("is-selected");
          button.setAttribute("aria-pressed", "true");
          root.style.setProperty("--coral", tone.coral);
          root.style.setProperty("--coral-deep", tone.deep);
          root.style.setProperty("--sea", tone.sea);
          root.style.setProperty("--green", tone.green);
          root.style.setProperty("--coral-soft", tone.soft);
          if (copy) copy.textContent = `${tone.name} begleitet eure Reise.`;
        }, { signal });
        palette.append(button);
      });
    }

    function cycleDestinations() {
      const destination = root.querySelector("[data-destination-copy]");
      const feeling = root.querySelector("[data-feeling-copy]");
      if (!destination) return;
      destinationIndex = (destinationIndex + 1) % DESTINATIONS.length;
      destination.classList.add("is-changing");
      feeling?.classList.add("is-changing");
      window.setTimeout(() => {
        destination.textContent = DESTINATIONS[destinationIndex];
        if (feeling) feeling.textContent = FEELINGS[destinationIndex % FEELINGS.length];
        destination.classList.remove("is-changing");
        feeling?.classList.remove("is-changing");
      }, reduced ? 0 : 260);
    }

    function mountHorizons() {
      const slides = [...root.querySelectorAll("[data-horizon-slide]")];
      const dots = root.querySelector("[data-horizon-dots]");
      if (!slides.length || !dots) return;
      const show = index => {
        activeHorizon = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle("is-active", i === activeHorizon));
        dots.querySelectorAll("button").forEach((dot, i) => { dot.classList.toggle("is-active", i === activeHorizon); dot.setAttribute("aria-pressed", String(i === activeHorizon)); });
      };
      slides.forEach((slide, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", slide.querySelector("figcaption strong")?.textContent || `Motiv ${index + 1}`);
        dot.addEventListener("click", () => show(index), { signal });
        dots.append(dot);
      });
      show(0);
      if (!reduced) horizonTimer = window.setInterval(() => show(activeHorizon + 1), 5600);
    }

    function createPlaceCards() {
      const stack = root.querySelector("[data-place-stack]");
      if (!stack) return;
      PLACES.forEach((place, index) => {
        const card = document.createElement("article");
        card.className = "rondell-place-card";
        card.dataset.placeIndex = String(index);
        card.innerHTML = `<span class="place-fit">${place.fit}% passend</span><small>${place.city} · ${place.country}</small><strong>${place.name}</strong><p>${place.note}</p><button type="button">Im Tagesbogen vormerken</button>`;
        card.addEventListener("click", () => { activePlace = index; updatePlaceRondell(); }, { signal });
        stack.append(card);
      });
    }

    function updatePlaceRondell() {
      const cards = [...root.querySelectorAll("[data-place-index]")];
      const counter = root.querySelector("[data-place-counter]");
      cards.forEach((card, index) => {
        let offset = (index - activePlace + cards.length) % cards.length;
        if (offset > cards.length / 2) offset -= cards.length;
        card.dataset.offset = String(Math.max(-3, Math.min(3, offset)));
        card.classList.toggle("is-active", offset === 0);
        card.setAttribute("aria-hidden", String(Math.abs(offset) > 2));
      });
      if (counter) counter.textContent = `${String(activePlace + 1).padStart(2, "0")} / ${PLACES.length}`;
      const place = PLACES[activePlace];
      if (livingMap?.loaded?.()) {
        livingMap.flyTo({ center: place.point, zoom: 12.4, bearing: activePlace % 2 ? 7 : -7, duration: reduced ? 0 : 1250, essential: true });
        activeMarker?.setLngLat?.(place.point);
        const markerLabel = activeMarker?.getElement?.().querySelector("span");
        if (markerLabel) markerLabel.textContent = place.name;
      }
    }

    function initLivingMap() {
      const container = root.querySelector("#landing-living-map");
      const shell = root.querySelector("[data-living-map-shell]");
      const status = root.querySelector("[data-map-status]");
      if (!container || !window.maplibregl) {
        if (status) status.textContent = "Kartografie-Fallback · MapLibre offline";
        return;
      }
      try {
        livingMap = new window.maplibregl.Map({ container, style: "https://tiles.openfreemap.org/styles/liberty", center: PLACES[0].point, zoom: 12.4, bearing: -7, pitch: 24, interactive: true, attributionControl: true, fadeDuration: reduced ? 0 : 450 });
        livingMap.addControl(new window.maplibregl.NavigationControl({ showCompass: false }), "top-right");
        livingMap.on("load", () => {
          const marker = document.createElement("div");
          marker.className = "luvia-map-marker";
          marker.innerHTML = `<span>${PLACES[0].name}</span>`;
          activeMarker = new window.maplibregl.Marker({ element: marker, anchor: "bottom" }).setLngLat(PLACES[0].point).addTo(livingMap);
          shell?.classList.add("is-map-ready");
          if (status) status.textContent = "Open Map · © OpenStreetMap-Mitwirkende · Beispieldaten";
        });
        livingMap.on("error", () => { if (status) status.textContent = "Kartografie-Fallback · Open-Map-Demo offline"; });
      } catch (_) {
        if (status) status.textContent = "Kartografie-Fallback · Open-Map-Demo offline";
      }
    }

    createPlaceCards();
    mountTones();
    mountHorizons();
    initLivingMap();
    setGateLevel("closed");
    gate?.style.setProperty("--needle-rest", `${currentAngle}deg`);
    if (!reduced) {
      destinationTimer = window.setInterval(cycleDestinations, 2900);
      placeTimer = window.setInterval(() => {
        if (root.dataset.activeStoryWorld === "spatial" && !root.querySelector("[data-place-rondell]:hover")) {
          activePlace = (activePlace + 1) % PLACES.length;
          updatePlaceRondell();
        }
      }, 4300);
    }
    root.querySelector("[data-place-prev]")?.addEventListener("click", () => { activePlace = (activePlace - 1 + PLACES.length) % PLACES.length; updatePlaceRondell(); }, { signal });
    root.querySelector("[data-place-next]")?.addEventListener("click", () => { activePlace = (activePlace + 1) % PLACES.length; updatePlaceRondell(); }, { signal });
    window.addEventListener("resize", () => livingMap?.resize?.(), { passive: true, signal });

    return () => {
      lifecycle.abort();
      window.clearInterval(horizonTimer);
      window.clearInterval(destinationTimer);
      window.clearInterval(placeTimer);
      livingMap?.remove?.();
    };
  }

  window.LuviaPublicLandingMotion = Object.freeze({ version: VERSION, mount });
})();
