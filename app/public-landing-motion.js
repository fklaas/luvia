(() => {
  "use strict";

  const VERSION = "13.82.83";
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
  const mixHex = (left, right, weight = .5) => {
    const parse = value => value.replace("#", "").match(/.{2}/g).map(part => Number.parseInt(part, 16));
    const a = parse(left);
    const b = parse(right);
    return `#${a.map((value, index) => Math.round(value * (1 - weight) + b[index] * weight).toString(16).padStart(2, "0")).join("")}`;
  };
  const makeTone = (name, coral) => ({ name, coral, deep: mixHex(coral, "#173247", .28), sea: mixHex(coral, "#2789a4", .44), green: mixHex(coral, "#288a70", .46), soft: mixHex(coral, "#ffffff", .88) });
  const EXTRA_TONES = Object.freeze([
    ["Aurora", "#db7fa6"], ["Tide", "#3e91a8"], ["Coast", "#69a8ad"], ["Harbor", "#426f82"], ["Reef", "#38a6a9"],
    ["Seagrass", "#6e9d87"], ["Pine", "#426f5b"], ["Fern", "#648b67"], ["Meadow", "#8da66f"], ["Olive", "#8b8b58"],
    ["Moss", "#66785a"], ["Alpine", "#71988c"], ["Glacier", "#80b9c7"], ["Sky", "#75a9cf"], ["Storm", "#68788e"],
    ["Slate", "#65717d"], ["Midnight", "#354b69"], ["Indigo", "#5f62a7"], ["Lilac", "#a88dc2"], ["Orchid", "#b272a5"],
    ["Plum", "#7e506f"], ["Rose", "#c66f85"], ["Blush", "#df96a0"], ["Poppy", "#dd5c50"], ["Peach", "#e99775"],
    ["Apricot", "#dda166"], ["Saffron", "#d5a044"], ["Honey", "#bd9550"], ["Dune", "#b69b78"], ["Clay", "#b87862"],
    ["Terracotta", "#b65f4c"], ["Copper", "#a76748"], ["Cocoa", "#7c5e52"], ["Chestnut", "#805449"], ["Stone", "#8b8982"],
    ["Pearl", "#b6aaa2"], ["Cloud", "#9ba9ad"], ["Chalk", "#c5bdb3"], ["Moon", "#9c9bb0"], ["Ink", "#334d5b"]
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
    { name: "Ember", coral: "#d36d46", deep: "#ad4f34", sea: "#668a9d", green: "#72805c", soft: "#fff0e8" },
    ...EXTRA_TONES.map(([name, color]) => makeTone(name, color))
  ]);
  const KIND_ICONS = Object.freeze({ Restaurant: "◒", Café: "☕", Fotospot: "◎", Sehenswürdigkeit: "◇", Aktivität: "↗", Natur: "⌁", Kultur: "✦", Nachtleben: "◐" });
  const PLACES = Object.freeze([
    { kind: "Restaurant", city: "Scharbeutz", country: "Deutschland", name: "Dünenküche", note: "Ruhig am Wasser, ideal nach der Fahrradtour.", fit: 94, point: [10.7549, 54.0265] },
    { kind: "Café", city: "Kopenhagen", country: "Dänemark", name: "Havlys", note: "Nordisch leicht, am Kanal und gut für lange Gespräche.", fit: 93, point: [12.5683, 55.6761] },
    { kind: "Restaurant", city: "Lissabon", country: "Portugal", name: "Pátio da Luz", note: "Kleine Teller, warmer Innenhof und später Abend.", fit: 92, point: [-9.1393, 38.7223] },
    { kind: "Kultur", city: "Kyoto", country: "Japan", name: "Mori no Michi", note: "Ein stiller Tempelweg für den frühen Morgen.", fit: 91, point: [135.7681, 35.0116] },
    { kind: "Aktivität", city: "Utrecht", country: "Niederlande", name: "Kade 17", note: "Eine familienfreundliche Kanaltour ohne Zeitdruck.", fit: 90, point: [5.1214, 52.0907] },
    { kind: "Fotospot", city: "Annecy", country: "Frankreich", name: "Le Rivage", note: "See, Berge und weiches Licht kurz vor Sonnenuntergang.", fit: 89, point: [6.1294, 45.8992] },
    { kind: "Restaurant", city: "Ljubljana", country: "Slowenien", name: "Zeleni Kot", note: "Regional, vegetarisch stark und mitten im Grünen.", fit: 95, point: [14.5058, 46.0569] },
    { kind: "Nachtleben", city: "San Sebastián", country: "Spanien", name: "Marea Baja", note: "Pintxos, Musik und eine ruhige Ecke nahe der Bucht.", fit: 92, point: [-1.9812, 43.3183] },
    { kind: "Café", city: "Portree", country: "Schottland", name: "Harbour Hearth", note: "Warmes Feuer, Gebäck und Blick auf den Hafen.", fit: 88, point: [-6.1942, 57.4125] },
    { kind: "Natur", city: "Reine", country: "Norwegen", name: "Nordlys Utsikt", note: "Große Aussicht und ein sehr langsamer Abend.", fit: 96, point: [13.0896, 67.9324] },
    { kind: "Fotospot", city: "Porto", country: "Portugal", name: "Ribeira Clara", note: "Goldenes Licht über dem Fluss und kleine Gassen.", fit: 93, point: [-8.6291, 41.1579] },
    { kind: "Aktivität", city: "Bled", country: "Slowenien", name: "Jezero Runde", note: "Eine leichte Runde am See mit vielen Pausenplätzen.", fit: 90, point: [14.1138, 46.3692] },
    { kind: "Sehenswürdigkeit", city: "Tallinn", country: "Estland", name: "Vana Linn", note: "Historische Höfe, kurze Wege und überraschend stille Ecken.", fit: 91, point: [24.7536, 59.437] },
    { kind: "Natur", city: "Milos", country: "Griechenland", name: "Ammos Bucht", note: "Heller Fels, ruhiges Wasser und Sand unter den Füßen.", fit: 94, point: [24.4283, 36.6914] },
    { kind: "Café", city: "Gent", country: "Belgien", name: "Licht aan de Leie", note: "Pflanzenbetont, am Wasser und spät noch offen.", fit: 92, point: [3.7174, 51.0543] },
    { kind: "Sehenswürdigkeit", city: "Valletta", country: "Malta", name: "Saffron Steps", note: "Honigfarbene Fassaden und eine kleine Aussichtsterrasse.", fit: 89, point: [14.5146, 35.8997] },
    { kind: "Aktivität", city: "Freiburg", country: "Deutschland", name: "Waldpfad Schauinsland", note: "Entspannt wandern mit Blick über den Schwarzwald.", fit: 93, point: [7.8421, 47.999] },
    { kind: "Kultur", city: "Montreal", country: "Kanada", name: "Rue des Arts", note: "Offene Ateliers, inklusive Räume und viel Straßenkultur.", fit: 90, point: [-73.5673, 45.5017] },
    { kind: "Restaurant", city: "Hobart", country: "Tasmanien", name: "Southern Table", note: "Hafenprodukte, offene Küche und viel Zeit.", fit: 91, point: [147.3272, -42.8821] },
    { kind: "Natur", city: "Tromsø", country: "Norwegen", name: "Stillhavn", note: "Ein geschützter Platz für die arktische Nacht.", fit: 95, point: [18.9553, 69.6492] },
    { kind: "Fotospot", city: "Pragser Wildsee", country: "Italien", name: "Morgensteg", note: "Spiegelndes Wasser, bevor die Wege voller werden.", fit: 97, point: [12.0859, 46.6947] },
    { kind: "Café", city: "Paris", country: "Frankreich", name: "Cour Calme", note: "Ein begrünter Innenhof zwei Straßen abseits des Trubels.", fit: 88, point: [2.3522, 48.8566] },
    { kind: "Nachtleben", city: "Berlin", country: "Deutschland", name: "Lichtbogen", note: "Kleine Bühne, früher Beginn und Platz zum Ankommen.", fit: 89, point: [13.405, 52.52] },
    { kind: "Aktivität", city: "Interlaken", country: "Schweiz", name: "Seeufer Kajak", note: "Geführte Morgenrunde mit ruhigem Einstieg.", fit: 92, point: [7.8632, 46.6863] },
    { kind: "Sehenswürdigkeit", city: "Sevilla", country: "Spanien", name: "Patios del Sur", note: "Kühle Höfe, Keramik und Schatten am Nachmittag.", fit: 93, point: [-5.9845, 37.3891] },
    { kind: "Kultur", city: "Wien", country: "Österreich", name: "Klangraum 7", note: "Ein kleines Konzertformat zwischen Klassik und Gegenwart.", fit: 87, point: [16.3738, 48.2082] },
    { kind: "Natur", city: "Madeira", country: "Portugal", name: "Levada do Sol", note: "Grüne Wege mit vielen kurzen Ausstiegsmöglichkeiten.", fit: 94, point: [-16.9595, 32.7607] },
    { kind: "Restaurant", city: "Marrakesch", country: "Marokko", name: "Jardin Serein", note: "Gemüse, Gewürze und ein ruhiger Garten am Abend.", fit: 91, point: [-7.9811, 31.6295] },
    { kind: "Fotospot", city: "Edinburgh", country: "Schottland", name: "Calton Blue Hour", note: "Weite Stadtsicht bei sanftem Licht und kurzem Aufstieg.", fit: 90, point: [-3.1883, 55.9533] },
    { kind: "Café", city: "Melbourne", country: "Australien", name: "Laneway Bloom", note: "Kaffee, Pflanzen und eine entspannte Seitenstraße.", fit: 89, point: [144.9631, -37.8136] },
    { kind: "Sehenswürdigkeit", city: "Dubrovnik", country: "Kroatien", name: "Mauerweg Süd", note: "Meerblick mit einer ruhigeren Zeitroute am späten Nachmittag.", fit: 92, point: [18.0944, 42.6507] },
    { kind: "Nachtleben", city: "Amsterdam", country: "Niederlande", name: "Noordlicht Club", note: "Tanzbar, offen und mit Rückzugsbereich am Wasser.", fit: 86, point: [4.9041, 52.3676] },
    { kind: "Aktivität", city: "Salzburg", country: "Österreich", name: "Almrad Runde", note: "E-Bike, weite Blicke und ein Gasthaus als Zwischenstopp.", fit: 93, point: [13.055, 47.8095] },
    { kind: "Kultur", city: "Florenz", country: "Italien", name: "Atelier Arno", note: "Ein kleiner Druckworkshop statt nur Museumsschlange.", fit: 90, point: [11.2558, 43.7696] },
    { kind: "Natur", city: "Vancouver", country: "Kanada", name: "Cedar Shore", note: "Wald und Wasser auf einem barrierearmen Uferweg.", fit: 95, point: [-123.1207, 49.2827] },
    { kind: "Restaurant", city: "Osaka", country: "Japan", name: "Nami Counter", note: "Acht Plätze, offene Küche und vegetarische Auswahl.", fit: 92, point: [135.5023, 34.6937] }
  ]);

  let activeController = null;

  function mount(root = document) {
    const lifecycle = new AbortController();
    const signal = lifecycle.signal;
    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const systemReduced = motionMedia.matches;
    let motionDisabled = (() => { try { return localStorage.getItem("luvia-public-motion") === "reduced"; } catch (_) { return false; } })();
    const gate = root.querySelector("[data-compass-gate]");
    const gateCore = root.querySelector("[data-compass-gate-toggle]");
    const stage = root.querySelector("[data-compass-stage]");
    const rotor = root.querySelector("[data-compass-rotor]");
    const puzzleConsole = root.querySelector("[data-compass-puzzle-console]");
    const puzzleHint = root.querySelector("[data-puzzle-hint]");
    const puzzleCount = root.querySelector("[data-puzzle-count]");
    const puzzleProgress = [...root.querySelectorAll(".compass-puzzle-progress i")];
    const crown = root.querySelector("[data-compass-crown]");
    const latch = root.querySelector("[data-compass-latch]");
    const latchInput = latch?.querySelector("input");
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
    let puzzleStep = "turn-forward";
    let puzzleTurn = 0;
    let puzzleDrag = null;
    let latchDragPointer = null;
    let horizonTimer = 0;
    let destinationTimer = 0;
    let restartHorizonCycle = () => {};

    const noMotion = () => systemReduced || motionDisabled;
    const delay = ms => new Promise(resolve => window.setTimeout(resolve, noMotion() ? 0 : ms));
    const setHidden = (node, hidden) => {
      if (!node) return;
      node.setAttribute("aria-hidden", String(hidden));
    };

    const PUZZLE_COPY = Object.freeze({
      "turn-forward": ["Eine feine Spur", "Der äußere Ring folgt einer ruhigen Drehung."],
      crown: ["Etwas ist eingerastet", "An der rechten Kante wartet ein kleines Gegengewicht."],
      "turn-back": ["Die Mechanik antwortet", "Der Ring sucht nun die gegenüberliegende Markierung."],
      latch: ["Fast geöffnet", "Unter der linken Kante hält noch eine kleine Sicherung."],
      unlocked: ["Der Weg ist frei", "Das Gehäuse gibt den Living Compass langsam frei."],
      open: ["Living Compass", "Wähle die Richtung, in die Luvia dich zuerst führen darf."]
    });

    function setPuzzleStep(step, { focus = false } = {}) {
      puzzleStep = step;
      if (gate) gate.dataset.puzzleStep = step;
      if (puzzleConsole) puzzleConsole.dataset.puzzleStep = step;
      const copy = PUZZLE_COPY[step] || PUZZLE_COPY["turn-forward"];
      if (puzzleCount) puzzleCount.textContent = copy[0];
      if (puzzleHint) puzzleHint.textContent = copy[1];
      const activeIndex = { "turn-forward": 0, crown: 1, "turn-back": 2, latch: 3, unlocked: 4, open: 4 }[step] ?? 0;
      puzzleProgress.forEach((item, index) => {
        item.classList.toggle("is-complete", index < activeIndex);
        item.classList.toggle("is-active", index === Math.min(activeIndex, 3));
      });
      if (crown) crown.disabled = step !== "crown";
      if (latchInput) latchInput.disabled = step !== "latch";
      if (focus && step === "crown") crown?.focus({ preventScroll: true });
      if (focus && step === "latch") latchInput?.focus({ preventScroll: true });
    }

    function setPuzzleTurn(value) {
      puzzleTurn = value;
      gate?.style.setProperty("--puzzle-turn", `${value.toFixed(2)}deg`);
      rotor?.style.setProperty("--puzzle-turn", `${value.toFixed(2)}deg`);
    }

    function normalizeAngle(value) {
      let angle = value;
      while (angle > 180) angle -= 360;
      while (angle < -180) angle += 360;
      return angle;
    }

    function pointerAngle(event) {
      const rect = gateCore.getBoundingClientRect();
      return Math.atan2(event.clientY - (rect.top + rect.height / 2), event.clientX - (rect.left + rect.width / 2)) * 180 / Math.PI;
    }

    function applyPuzzleDelta(delta, { keyboard = false } = {}) {
      if (puzzleStep === "turn-forward") {
        setPuzzleTurn(Math.max(-4, Math.min(68, puzzleTurn + delta)));
        if (puzzleTurn >= 58) {
          setPuzzleTurn(64);
          setPuzzleStep("crown", { focus: keyboard });
          window.LuviaPublicLandingExperience?.haptic?.("confirm");
        }
      } else if (puzzleStep === "turn-back") {
        setPuzzleTurn(Math.max(-42, Math.min(68, puzzleTurn + delta)));
        if (puzzleTurn <= -30) {
          setPuzzleTurn(-34);
          setPuzzleStep("latch", { focus: keyboard });
          window.LuviaPublicLandingExperience?.haptic?.("confirm");
        }
      }
    }

    function resetPuzzle() {
      latchInput && (latchInput.value = "0");
      latch?.style.setProperty("--latch-progress", "0%");
      latch?.style.setProperty("--latch-x", "9px");
      latch?.style.setProperty("--latch-y", "18px");
      setPuzzleTurn(0);
      setPuzzleStep("turn-forward");
    }

    function setGateLevel(level) {
      if (!gate) return;
      gate.dataset.compassLevel = level;
      const open = level !== "closed";
      gateCore?.setAttribute("aria-expanded", String(open));
      setHidden(primaryPaths, level !== "primary");
      setHidden(worldPaths, level !== "worlds");
      if (level === "closed") {
        heading.innerHTML = "Wohin darf Luvia<br><em>dich zuerst führen?</em>";
        instruction.textContent = "Manche Wege zeigen sich erst, wenn du den Kompass aufmerksam berührst.";
      } else if (level === "primary") {
        heading.innerHTML = "Drei Richtungen.<br><em>Dein erster Schritt.</em>";
        instruction.textContent = "Die Nadel hört dir zu. Wähle, wohin sie dich führen darf.";
      } else if (level === "worlds") {
        heading.innerHTML = "Welche Luvia-Welt<br><em>möchtest du öffnen?</em>";
        instruction.textContent = "Jede Richtung öffnet eine eigene Leinwand. Du kehrst jederzeit hierher zurück.";
      }
    }

    async function openCompass({ focus = false } = {}) {
      if (!gate || !gateCore || gate.dataset.compassLevel !== "closed" || puzzleStep !== "unlocked") return false;
      gate.dataset.compassLevel = "opening";
      gateCore.setAttribute("aria-expanded", "true");
      puzzleConsole?.setAttribute("aria-hidden", "true");
      await delay(1760);
      setGateLevel("primary");
      setPuzzleStep("open");
      if (focus) primaryPaths?.querySelector("a")?.focus({ preventScroll: true });
      return true;
    }

    function restartDestinationCycle() {
      window.clearInterval(destinationTimer);
      destinationTimer = 0;
      if (!noMotion()) destinationTimer = window.setInterval(cycleDestinations, 2900);
    }

    function openCompassWithoutPuzzle({ focus = false } = {}) {
      if (!gate || gate.hidden) return;
      puzzleConsole?.setAttribute("aria-hidden", "true");
      setPuzzleStep("open");
      setGateLevel("primary");
      if (focus) primaryPaths?.querySelector("a")?.focus({ preventScroll: true });
    }

    function applyMotionPreference({ persist = false, focus = false } = {}) {
      const disabled = noMotion();
      root.classList.toggle("is-motion-reduced", disabled);
      document.documentElement.classList.toggle("lv-public-motion-reduced", disabled);
      document.body.classList.toggle("lv-public-motion-reduced", disabled);
      root.querySelectorAll("[data-motion-toggle]").forEach(toggle => {
        toggle.setAttribute("aria-pressed", String(disabled));
        toggle.disabled = systemReduced;
        const label = toggle.querySelector("[data-motion-toggle-label]");
        const compact = toggle.classList.contains("motion-toggle");
        if (label) label.textContent = systemReduced ? (compact ? "System reduziert" : "Bewegung vom System reduziert") : disabled ? (compact ? "Animationen an" : "Animationen wieder einschalten") : (compact ? "Animationen aus" : "Ohne Rätsel & Animationen");
        toggle.setAttribute("aria-label", systemReduced ? "Systemeinstellung reduziert Bewegung; Kompass ist direkt geöffnet" : disabled ? "Animationen wieder aktivieren" : "Animationen deaktivieren und Kompassrätsel überspringen");
      });
      if (persist) {
        try { localStorage.setItem("luvia-public-motion", motionDisabled ? "reduced" : "full"); } catch (_) {}
      }
      if (disabled) {
        window.clearInterval(horizonTimer);
        horizonTimer = 0;
        window.clearInterval(destinationTimer);
        destinationTimer = 0;
        openCompassWithoutPuzzle({ focus });
      } else {
        restartHorizonCycle();
        restartDestinationCycle();
      }
    }

    function mountMotionPreference() {
      root.querySelectorAll("[data-motion-toggle]").forEach(toggle => toggle.addEventListener("click", () => {
        if (systemReduced) return;
        motionDisabled = !motionDisabled;
        applyMotionPreference({ persist: true, focus: motionDisabled });
      }, { signal }));
      applyMotionPreference({ persist: false });
    }

    async function seekNeedle(target) {
      if (!gate || seeking) return false;
      seeking = true;
      gate.style.setProperty("--needle-from", `${currentAngle}deg`);
      gate.style.setProperty("--needle-target", `${target}deg`);
      gate.classList.remove("is-seeking");
      void gate.offsetWidth;
      gate.classList.add("is-seeking");
      await delay(920);
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
      await delay(720);
      gate.hidden = true;
      canvas.hidden = false;
      root.dataset.activeStoryWorld = worldId;
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        canvas.classList.add("is-visible");
        canvas.querySelector("[data-world-back]")?.focus({ preventScroll: true });
      });
      if (worldId === "spatial") {
        requestAnimationFrame(() => requestAnimationFrame(() => {
          livingMap?.resize?.();
          updatePlaceRondell();
        }));
      }
    }

    async function returnToCompass(canvas) {
      canvas.classList.remove("is-visible");
      await delay(430);
      canvas.hidden = true;
      delete root.dataset.activeStoryWorld;
      gate.hidden = false;
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
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

    gateCore?.addEventListener("pointerdown", event => {
      if (gate?.dataset.compassLevel !== "closed" || !["turn-forward", "turn-back"].includes(puzzleStep)) return;
      gateCore.setPointerCapture?.(event.pointerId);
      puzzleDrag = { pointerId: event.pointerId, lastAngle: pointerAngle(event), moved: false };
      gate.classList.add("is-puzzle-dragging", "is-awake");
    }, { signal });
    gateCore?.addEventListener("pointermove", event => {
      if (!puzzleDrag || puzzleDrag.pointerId !== event.pointerId) return;
      event.preventDefault();
      const angle = pointerAngle(event);
      const delta = normalizeAngle(angle - puzzleDrag.lastAngle);
      puzzleDrag.lastAngle = angle;
      puzzleDrag.moved = puzzleDrag.moved || Math.abs(delta) > .4;
      applyPuzzleDelta(delta);
    }, { signal });
    const releasePuzzlePointer = event => {
      if (!puzzleDrag || (event?.pointerId != null && puzzleDrag.pointerId !== event.pointerId)) return;
      gateCore?.releasePointerCapture?.(puzzleDrag.pointerId);
      puzzleDrag = null;
      gate?.classList.remove("is-puzzle-dragging");
    };
    gateCore?.addEventListener("pointerup", releasePuzzlePointer, { signal });
    gateCore?.addEventListener("pointercancel", releasePuzzlePointer, { signal });
    gateCore?.addEventListener("click", event => {
      event.preventDefault();
      if (gate?.dataset.compassLevel !== "closed") return;
      gate.classList.add("is-awake");
      puzzleConsole?.classList.add("is-emphasized");
      window.setTimeout(() => puzzleConsole?.classList.remove("is-emphasized"), noMotion() ? 0 : 650);
    }, { signal });
    gateCore?.addEventListener("keydown", event => {
      if (gate?.dataset.compassLevel !== "closed") return;
      if (["ArrowRight", "ArrowDown"].includes(event.key) && puzzleStep === "turn-forward") {
        event.preventDefault();
        applyPuzzleDelta(12, { keyboard: true });
      } else if (["ArrowLeft", "ArrowUp"].includes(event.key) && puzzleStep === "turn-back") {
        event.preventDefault();
        applyPuzzleDelta(-12, { keyboard: true });
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        puzzleConsole?.classList.add("is-emphasized");
      }
    }, { signal });

    crown?.addEventListener("click", event => {
      event.preventDefault();
      if (puzzleStep !== "crown") return;
      crown.classList.add("is-pressed");
      window.LuviaPublicLandingExperience?.haptic?.("confirm");
      window.setTimeout(() => crown.classList.remove("is-pressed"), noMotion() ? 0 : 360);
      setPuzzleStep("turn-back");
      gateCore?.focus({ preventScroll: true });
    }, { signal });
    crown?.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      crown.click();
    }, { signal });

    const updateLatch = value => {
      const bounded = Math.max(0, Math.min(100, Number(value) || 0));
      if (latchInput) latchInput.value = String(Math.round(bounded));
      latch?.style.setProperty("--latch-progress", `${bounded}%`);
      const arcProgress = bounded / 100;
      const latchTravel = Math.max(54, (latch?.getBoundingClientRect().width || 96) - 18);
      latch?.style.setProperty("--latch-x", `${9 + arcProgress * latchTravel}px`);
      latch?.style.setProperty("--latch-y", `${18 + Math.sin(arcProgress * Math.PI) * 9}px`);
      if (puzzleStep !== "latch" || bounded < 92) return;
      if (latchInput) latchInput.value = "100";
      latch.style.setProperty("--latch-progress", "100%");
      latch.style.setProperty("--latch-x", `${9 + Math.max(54, latch.getBoundingClientRect().width - 18)}px`);
      latch.style.setProperty("--latch-y", "18px");
      setPuzzleStep("unlocked");
      window.LuviaPublicLandingExperience?.haptic?.("success");
      window.setTimeout(() => openCompass({ focus: true }), noMotion() ? 0 : 320);
    };
    latchInput?.addEventListener("input", () => updateLatch(latchInput.value), { signal });
    latchInput?.addEventListener("keydown", event => {
      if (puzzleStep !== "latch") return;
      const direction = ["ArrowRight", "ArrowUp"].includes(event.key) ? 1 : ["ArrowLeft", "ArrowDown"].includes(event.key) ? -1 : 0;
      if (!direction && event.key !== "Home" && event.key !== "End") return;
      event.preventDefault();
      if (event.key === "Home") updateLatch(0);
      else if (event.key === "End") updateLatch(100);
      else updateLatch(Number(latchInput.value) + direction * 12);
    }, { signal });
    const updateLatchFromPointer = event => {
      const rect = latch.getBoundingClientRect();
      updateLatch(((event.clientX - rect.left - 9) / Math.max(1, rect.width - 18)) * 100);
    };
    latch?.addEventListener("pointerdown", event => {
      if (puzzleStep !== "latch") return;
      event.preventDefault();
      latchDragPointer = event.pointerId;
      latch.setPointerCapture?.(event.pointerId);
      updateLatchFromPointer(event);
    }, { signal });
    latch?.addEventListener("pointermove", event => {
      if (latchDragPointer !== event.pointerId) return;
      event.preventDefault();
      updateLatchFromPointer(event);
    }, { signal });
    const releaseLatch = event => {
      if (latchDragPointer !== event.pointerId) return;
      latch.releasePointerCapture?.(event.pointerId);
      latchDragPointer = null;
    };
    latch?.addEventListener("pointerup", releaseLatch, { signal });
    latch?.addEventListener("pointercancel", releaseLatch, { signal });

    root.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const target = event.target.closest?.("[data-compass-choice],[data-world-target],[data-world-back]");
      if (!target) return;
      event.preventDefault();
      target.click();
    }, { signal });

    stage?.addEventListener("pointermove", event => {
      if (noMotion() || !gate || puzzleDrag || event.pointerType === "touch") return;
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
      gate?.scrollIntoView({ behavior: noMotion() ? "auto" : "smooth", block: "start" });
      const intent = link.dataset.gateIntent;
      if (gate?.hidden) {
        const canvas = worldCanvases.find(item => !item.hidden);
        if (canvas) await returnToCompass(canvas);
      }
      if (gate?.dataset.compassLevel === "closed") {
        gateCore?.focus({ preventScroll: true });
        puzzleConsole?.classList.add("is-emphasized");
        window.setTimeout(() => puzzleConsole?.classList.remove("is-emphasized"), noMotion() ? 0 : 650);
        return;
      }
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
        if (noMotion()) return;
        event.preventDefault();
        setGateLevel("closed");
        puzzleConsole?.setAttribute("aria-hidden", "false");
        resetPuzzle();
        gateCore?.focus({ preventScroll: true });
      }
    }, { signal });

    function mountTones() {
      const palette = root.querySelector("[data-tone-palette]");
      const copy = root.querySelector("[data-tone-copy]");
      if (!palette) return;
      let more = null;
      let dialog = null;
      let dialogCloseTimer = 0;
      let selectedToneIndex = 0;
      const closedCopy = `<svg class="tone-more-swatchrail" viewBox="0 0 66 18" aria-hidden="true" focusable="false"><circle cx="7" cy="9" r="6" fill="#ec6555"/><circle cx="20" cy="9" r="6" fill="#d39a5b"/><circle cx="33" cy="9" r="6" fill="#76a07d"/><circle cx="46" cy="9" r="6" fill="#2f95a8"/><circle cx="59" cy="9" r="6" fill="#9b82c5"/></svg><span class="tone-more-label"><b>${Math.max(0, TONES.length - 10)} weitere Reisefarben</b><small>Farbenfächer öffnen</small></span><span class="tone-more-chevron" aria-hidden="true">›</span>`;
      const closePalette = ({ restoreFocus = false } = {}) => {
        window.clearTimeout(dialogCloseTimer);
        if (!dialog || dialog.hidden) return;
        dialog.classList.remove("is-open");
        document.body.classList.remove("has-journey-tone-dialog");
        more?.setAttribute("aria-expanded", "false");
        dialogCloseTimer = window.setTimeout(() => {
          dialog.hidden = true;
          if (restoreFocus) more?.focus({ preventScroll: true });
        }, noMotion() ? 0 : 300);
      };
      const applyTone = index => {
        const tone = TONES[index];
        if (!tone) return;
        selectedToneIndex = index;
        root.querySelectorAll("[data-tone-index]").forEach(item => {
          const selected = Number(item.dataset.toneIndex) === index;
          item.classList.toggle("is-selected", selected);
          item.setAttribute("aria-pressed", String(selected));
        });
        root.style.setProperty("--coral", tone.coral);
        root.style.setProperty("--coral-deep", tone.deep);
        root.style.setProperty("--sea", tone.sea);
        root.style.setProperty("--green", tone.green);
        root.style.setProperty("--coral-soft", tone.soft);
        if (copy) copy.textContent = `${tone.name} begleitet eure Reise.`;
      };
      const buildToneButton = (tone, index, className = "") => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `${index === selectedToneIndex ? "is-selected" : ""} ${className}`.trim();
        button.dataset.toneIndex = String(index);
        button.style.setProperty("--tone", tone.coral);
        button.style.setProperty("--tone-delay", `${Math.min(index, 49) * 9}ms`);
        button.style.setProperty("--tone-tilt", `${((index % 7) - 3) * 1.2}deg`);
        button.setAttribute("aria-label", `${tone.name} als Reisefarbe wählen`);
        button.setAttribute("aria-pressed", String(index === selectedToneIndex));
        button.innerHTML = `<i aria-hidden="true"></i><span>${tone.name}</span>`;
        button.addEventListener("click", () => {
          applyTone(index);
          if (dialog && !dialog.hidden) closePalette({ restoreFocus: true });
        }, { signal });
        return button;
      };
      signal.addEventListener("abort", () => {
        window.clearTimeout(dialogCloseTimer);
        document.body.classList.remove("has-journey-tone-dialog");
      }, { once: true });
      palette.dataset.toneCount = String(TONES.length);
      TONES.slice(0, 10).forEach((tone, index) => palette.append(buildToneButton(tone, index)));
      more = document.createElement("button");
      more.type = "button";
      more.className = "journey-tone-more";
      more.setAttribute("aria-expanded", "false");
      more.setAttribute("aria-haspopup", "dialog");
      more.innerHTML = closedCopy;
      more.addEventListener("click", () => {
        window.clearTimeout(dialogCloseTimer);
        dialog.hidden = false;
        document.body.classList.add("has-journey-tone-dialog");
        more.setAttribute("aria-expanded", "true");
        window.requestAnimationFrame(() => {
          dialog.classList.add("is-open");
          dialog.querySelector(`[data-tone-index="${selectedToneIndex}"]`)?.focus({ preventScroll: true });
        });
      }, { signal });
      palette.append(more);

      dialog = document.createElement("div");
      dialog.className = "journey-tone-dialog";
      dialog.hidden = true;
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.setAttribute("aria-labelledby", "journey-tone-dialog-title");
      dialog.innerHTML = `<button class="journey-tone-dialog-backdrop" type="button" aria-label="Farbenfächer schließen"></button><section class="journey-tone-dialog-panel"><header><span><small>Farben begleiten eure Reise</small><strong id="journey-tone-dialog-title">Welcher Ton fühlt sich nach euch an?</strong></span><button class="journey-tone-dialog-close" type="button" aria-label="Farbenfächer schließen">×</button></header><div class="journey-tone-dialog-grid" role="group" aria-label="50 Reisefarben"></div><p>Eine Auswahl genügt. Luvia übernimmt den Ton ruhig in eure Reise.</p></section>`;
      const dialogGrid = dialog.querySelector(".journey-tone-dialog-grid");
      TONES.forEach((tone, index) => dialogGrid.append(buildToneButton(tone, index, "journey-tone-dialog-choice")));
      dialog.querySelector(".journey-tone-dialog-backdrop").addEventListener("click", () => closePalette({ restoreFocus: true }), { signal });
      dialog.querySelector(".journey-tone-dialog-close").addEventListener("click", () => closePalette({ restoreFocus: true }), { signal });
      dialog.addEventListener("keydown", event => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        closePalette({ restoreFocus: true });
      }, { signal });
      root.append(dialog);
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
      }, noMotion() ? 0 : 260);
    }

    function bindKeyboardActivation(node, activate) {
      node?.addEventListener("click", activate, { signal });
      node?.addEventListener("keydown", event => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        activate(event);
      }, { signal });
    }

    function mountBeginCards() {
      root.querySelectorAll("[data-begin-cycle]").forEach(card => bindKeyboardActivation(card, () => {
        window.clearInterval(destinationTimer);
        cycleDestinations();
        restartDestinationCycle();
      }));
    }

    function mountPhotoEditor(workbench) {
      const photo = workbench.querySelector("[data-photo-editor]");
      const controls = workbench.querySelector("[data-photo-controls]");
      if (!photo || !controls) return;
      const inputs = Object.fromEntries([...controls.querySelectorAll("[data-photo-control]")].map(input => [input.dataset.photoControl, input]));
      const compare = photo.querySelector("[data-photo-compare]");
      const summary = controls.querySelector("[data-photo-summary]");
      const signed = value => `${Number(value) > 0 ? "+" : ""}${Number(value)}`;
      const paintTrack = input => {
        const span = Number(input.max) - Number(input.min) || 1;
        input.style.setProperty("--range-position", `${(Number(input.value) - Number(input.min)) / span * 100}%`);
      };
      const update = () => {
        const light = Number(inputs.light?.value || 0);
        const warmth = Number(inputs.warmth?.value || 0);
        const horizon = Number(inputs.horizon?.value || 0);
        photo.style.setProperty("--editor-brightness", String(1 + light * .004));
        photo.style.setProperty("--editor-sepia", String(Math.max(0, warmth) * .005));
        photo.style.setProperty("--editor-saturation", String(1 + Math.abs(warmth) * .008));
        photo.style.setProperty("--editor-hue", `${warmth * -.22}deg`);
        photo.style.setProperty("--editor-rotate", `${horizon}deg`);
        if (compare) photo.style.setProperty("--compare", `${compare.value}%`);
        for (const [name, input] of Object.entries(inputs)) {
          paintTrack(input);
          const output = controls.querySelector(`[data-photo-output="${name}"]`);
          if (output) output.textContent = name === "horizon" ? `${signed(input.value)}°` : signed(input.value);
        }
        if (summary) summary.textContent = `Licht ${signed(light)} · Wärme ${signed(warmth)} · Horizont ${signed(horizon)}°`;
      };
      Object.values(inputs).forEach(input => input.addEventListener("input", update, { signal }));
      compare?.addEventListener("input", update, { signal });
      controls.querySelector("[data-photo-reset]")?.addEventListener("click", () => {
        if (inputs.light) inputs.light.value = "0";
        if (inputs.warmth) inputs.warmth.value = "0";
        if (inputs.horizon) inputs.horizon.value = "0";
        if (compare) compare.value = "50";
        update();
      }, { signal });
      update();
    }

    function mountMemoryInteractions(workbench) {
      const sound = workbench.querySelector("[data-memory-sound]");
      const soundButton = sound?.querySelector("button");
      const soundState = sound?.querySelector("[data-memory-sound-state]");
      soundButton?.addEventListener("click", () => {
        const playing = !sound.classList.contains("is-playing");
        sound.classList.toggle("is-playing", playing);
        soundButton.textContent = playing ? "Ⅱ" : "▶";
        soundButton.setAttribute("aria-pressed", String(playing));
        soundButton.setAttribute("aria-label", playing ? "Atmosphäre-Vorschau pausieren" : "Atmosphäre-Vorschau starten");
        if (soundState) soundState.textContent = playing ? "Vorschau läuft" : "pausiert";
      }, { signal });

      const reelScenes = Object.freeze([
        ["assets/public-landing/prototype-coast-bike.png", "Unser Weg ans Meer", "00:06", "Fahrradtour als Reel-Szene"],
        ["assets/public-landing/prototype-harbor-lunch.png", "Mittag am Hafen", "00:11", "Hafenmoment als Reel-Szene"],
        ["assets/public-landing/prototype-memory-sunset.png", "Das Licht bleibt", "00:18", "Sonnenuntergang als Reel-Szene"],
        ["assets/public-landing/prototype-coast-morning.png", "Morgen an der Küste", "00:24", "Küstenmorgen als Reel-Szene"]
      ]);
      const reel = workbench.querySelector("[data-reel-phone]");
      workbench.querySelectorAll("[data-reel-scene]").forEach(button => button.addEventListener("click", () => {
        const scene = reelScenes[Number(button.dataset.reelScene)] || reelScenes[0];
        workbench.querySelectorAll("[data-reel-scene]").forEach(item => {
          item.classList.toggle("is-active", item === button);
          item.setAttribute("aria-pressed", String(item === button));
        });
        const image = reel?.querySelector("img");
        if (image) { image.src = scene[0]; image.alt = scene[3]; }
        const title = reel?.querySelector("[data-reel-title]");
        const time = reel?.querySelector("[data-reel-time]");
        if (title) title.textContent = scene[1];
        if (time) time.textContent = scene[2];
        reel?.classList.remove("is-changing");
        void reel?.offsetWidth;
        reel?.classList.add("is-changing");
      }, { signal }));

      const bookPages = Object.freeze([
        ["assets/public-landing/prototype-harbor-lunch.png", "assets/public-landing/prototype-memory-sunset.png", "Aus der Memory World gesetzt.<br>Von euch freigegeben."],
        ["assets/public-landing/prototype-coast-bike.png", "assets/public-landing/prototype-coast-morning.png", "Unterwegs gesammelt.<br>Als Geschichte weitergetragen."]
      ]);
      let bookPage = 0;
      workbench.querySelector("[data-book-turn]")?.addEventListener("click", () => {
        bookPage = (bookPage + 1) % bookPages.length;
        const spread = workbench.querySelector("[data-book-spread]");
        const page = bookPages[bookPage];
        const left = spread?.querySelector('[data-book-image="left"]');
        const right = spread?.querySelector('[data-book-image="right"]');
        if (left) left.src = page[0];
        if (right) right.src = page[1];
        const copy = spread?.querySelector("[data-book-copy]");
        if (copy) copy.innerHTML = page[2];
        spread?.classList.remove("is-turning");
        void spread?.offsetWidth;
        spread?.classList.add("is-turning");
      }, { signal });

      mountPhotoEditor(workbench);
    }

    function mountJourneySteps() {
      const orbit = root.querySelector(".journey-orbit");
      const output = root.querySelector("[data-journey-selected]");
      const steps = [...root.querySelectorAll("[data-journey-step]")];
      const details = [
        "Luvia nimmt zuerst Stimmung, Tempo und Bedürfnisse auf.",
        "Der Place Compass verbindet passende Orte mit verständlicher Evidenz.",
        "Gemeinsame Entscheidungen bleiben sichtbar und nachvollziehbar.",
        "Fotos, Wege und Stimmen wachsen zu einer verbundenen Memory World."
      ];
      const activate = step => {
        const index = Number(step.dataset.journeyStep) || 0;
        steps.forEach(item => item.classList.toggle("is-active", item === step));
        orbit?.style.setProperty("--journey-step", String(index));
        orbit?.style.setProperty("--journey-turn", `${index * 88}deg`);
        if (output) output.textContent = details[index];
      };
      steps.forEach(step => bindKeyboardActivation(step, () => activate(step)));
    }

    function mountMemoryTools() {
      const workbench = root.querySelector("[data-memory-workbench]");
      if (!workbench) return;
      const modes = Object.freeze({
        gallery: ["Produktiv in der aktuellen App", "Eine Galerie, die Reihenfolge und Zusammenhang bewahrt.", "Fotos, Orte, Zeiten, Mitwirkende und Audio bleiben als eine gemeinsame Erinnerung verbunden."],
        editor: ["Ausblick · klar als Vorschau markiert", "Bearbeiten, ohne das Original oder seine Herkunft zu verlieren.", "Licht, Farbe, Ausschnitt und Horizont werden nicht-destruktiv verändert; die Ursprungsdatei bleibt erhalten."],
        reel: ["Ausblick · klar als Vorschau markiert", "Aus Momenten wird ein Reel – nicht aus einer fremden Vorlage.", "Freigegebene Fotos, Clips, Route, Text und Musik lassen sich später für Instagram und andere Social-Media-Formate komponieren."],
        book: ["Ausblick · klar als Vorschau markiert", "Die gemeinsame Reise kommt als gestaltetes Fotobuch in eure Hände.", "Seiten entstehen aus der Memory World, bleiben bearbeitbar und werden erst nach eurer bewussten Freigabe für den Druck vorbereitet."]
      });
      const label = workbench.querySelector("[data-memory-status-label]");
      const title = workbench.querySelector("[data-memory-status-title]");
      const text = workbench.querySelector("[data-memory-status-text]");
      workbench.querySelectorAll("[data-memory-mode]").forEach(button => button.addEventListener("click", () => {
        const mode = button.dataset.memoryMode;
        workbench.dataset.memoryMode = mode;
        workbench.querySelectorAll("[data-memory-mode]").forEach(item => {
          item.classList.toggle("is-active", item === button);
          item.setAttribute("aria-pressed", String(item === button));
        });
        workbench.querySelectorAll("[data-memory-preview]").forEach(preview => {
          const active = preview.dataset.memoryPreview === mode;
          preview.hidden = !active;
          preview.classList.toggle("is-active", active);
        });
        const copy = modes[mode] || modes.gallery;
        if (label) label.textContent = copy[0];
        if (title) title.textContent = copy[1];
        if (text) text.textContent = copy[2];
      }, { signal }));
      mountMemoryInteractions(workbench);
    }

    function mountPhoneTeaser() {
      const phone = root.querySelector("[data-landing-phone-screen]");
      if (!phone) return;
      phone.querySelectorAll("[data-phone-tab]").forEach(button => button.addEventListener("click", () => {
        const target = button.dataset.phoneTab;
        phone.querySelectorAll("[data-phone-tab]").forEach(item => {
          item.classList.toggle("is-active", item === button);
          item.setAttribute("aria-pressed", String(item === button));
        });
        phone.querySelectorAll("[data-phone-panel]").forEach(panel => {
          const active = panel.dataset.phonePanel === target;
          panel.hidden = !active;
          panel.classList.toggle("is-active", active);
        });
      }, { signal }));
    }

    function mountHorizons() {
      const slides = [...root.querySelectorAll("[data-horizon-slide]")];
      const dots = root.querySelector("[data-horizon-dots]");
      if (!slides.length || !dots) return;
      const show = index => {
        activeHorizon = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => {
          slide.classList.toggle("is-active", i === activeHorizon);
          slide.classList.toggle("is-previous", i === (activeHorizon - 1 + slides.length) % slides.length);
          slide.classList.toggle("is-next", i === (activeHorizon + 1) % slides.length);
        });
        dots.querySelectorAll("button").forEach((dot, i) => { dot.classList.toggle("is-active", i === activeHorizon); dot.setAttribute("aria-pressed", String(i === activeHorizon)); });
      };
      slides.forEach((slide, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", slide.querySelector("figcaption strong")?.textContent || `Motiv ${index + 1}`);
        dot.style.setProperty("--horizon-thumb", `url(\"${slide.querySelector("img")?.getAttribute("src") || ""}\")`);
        dot.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span>`;
        dot.addEventListener("click", () => show(index), { signal });
        dots.append(dot);
      });
      show(0);
      restartHorizonCycle = () => {
        window.clearInterval(horizonTimer);
        horizonTimer = 0;
        if (!noMotion()) horizonTimer = window.setInterval(() => show(activeHorizon + 1), 5600);
      };
      restartHorizonCycle();
    }

    function createPlaceCards() {
      const stack = root.querySelector("[data-place-stack]");
      if (!stack) return;
      PLACES.forEach((place, index) => {
        const card = document.createElement("article");
        card.className = "rondell-place-card";
        card.dataset.placeIndex = String(index);
        card.innerHTML = `<span class="place-kind"><i>${KIND_ICONS[place.kind] || "⌖"}</i>${place.kind}</span><span class="place-fit">${place.fit}% passend</span><small>${place.city} · ${place.country}</small><strong>${place.name}</strong><p>${place.note}</p><button type="button" aria-pressed="false">Im Tagesbogen vormerken</button>`;
        card.addEventListener("click", () => { activePlace = index; updatePlaceRondell(); }, { signal });
        const save = card.querySelector("button");
        save?.addEventListener("click", event => {
          event.stopPropagation();
          const saved = save.getAttribute("aria-pressed") !== "true";
          save.setAttribute("aria-pressed", String(saved));
          save.textContent = saved ? "Vorgemerkt ✓" : "Im Tagesbogen vormerken";
          card.classList.toggle("is-saved", saved);
        }, { signal });
        stack.append(card);
      });
    }

    function mountPlaceTypes() {
      const rail = root.querySelector("[data-place-types]");
      if (!rail) return;
      const kinds = ["Alle", ...new Set(PLACES.map(place => place.kind))];
      kinds.forEach((kind, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = index === 0 ? "is-active" : "";
        button.setAttribute("aria-pressed", String(index === 0));
        button.innerHTML = kind === "Alle" ? `<i>✦</i>Alle Orte` : `<i>${KIND_ICONS[kind] || "⌖"}</i>${kind}`;
        button.addEventListener("click", () => {
          rail.querySelectorAll("button").forEach(item => {
            item.classList.toggle("is-active", item === button);
            item.setAttribute("aria-pressed", String(item === button));
          });
          if (kind !== "Alle") {
            const next = PLACES.findIndex((place, placeIndex) => place.kind === kind && placeIndex >= activePlace);
            activePlace = next >= 0 ? next : PLACES.findIndex(place => place.kind === kind);
            updatePlaceRondell();
          }
        }, { signal });
        rail.append(button);
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
        const shell = root.querySelector("[data-living-map-shell]");
        const status = root.querySelector("[data-map-status]");
        shell?.classList.add("is-map-moving");
        if (status) status.textContent = `Karte folgt ${place.name} · ${place.city}`;
        livingMap.flyTo({ center: place.point, zoom: 12.4, bearing: activePlace % 2 ? 7 : -7, duration: noMotion() ? 0 : 980, essential: !noMotion() });
        livingMap.once("idle", () => {
          shell?.classList.remove("is-map-moving");
          if (status) status.textContent = "Open Map · © OpenStreetMap-Mitwirkende · Beispieldaten";
        });
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
        livingMap = new window.maplibregl.Map({ container, style: "https://tiles.openfreemap.org/styles/liberty", center: PLACES[0].point, zoom: 12.4, bearing: -7, pitch: 24, interactive: true, attributionControl: true, fadeDuration: noMotion() ? 0 : 450 });
        livingMap.addControl(new window.maplibregl.NavigationControl({ showCompass: false }), "top-right");
        livingMap.on("load", () => {
          const marker = document.createElement("div");
          marker.className = "luvia-map-marker";
          marker.innerHTML = `<span>${PLACES[0].name}</span>`;
          activeMarker = new window.maplibregl.Marker({ element: marker, anchor: "bottom" }).setLngLat(PLACES[0].point).addTo(livingMap);
          shell?.classList.add("is-map-ready");
          if (status) status.textContent = "Open Map · © OpenStreetMap-Mitwirkende · Beispieldaten";
          updatePlaceRondell();
        });
        livingMap.on("error", () => { if (status) status.textContent = "Kartografie-Fallback · Open-Map-Demo offline"; });
      } catch (_) {
        if (status) status.textContent = "Kartografie-Fallback · Open-Map-Demo offline";
      }
    }

    createPlaceCards();
    mountPlaceTypes();
    mountTones();
    mountBeginCards();
    mountHorizons();
    mountMemoryTools();
    mountJourneySteps();
    mountPhoneTeaser();
    initLivingMap();
    setGateLevel("closed");
    resetPuzzle();
    mountMotionPreference();
    gate?.style.setProperty("--needle-rest", `${currentAngle}deg`);
    restartDestinationCycle();
    root.querySelector("[data-place-prev]")?.addEventListener("click", () => { activePlace = (activePlace - 1 + PLACES.length) % PLACES.length; updatePlaceRondell(); }, { signal });
    root.querySelector("[data-place-next]")?.addEventListener("click", () => { activePlace = (activePlace + 1) % PLACES.length; updatePlaceRondell(); }, { signal });
    window.addEventListener("resize", () => livingMap?.resize?.(), { passive: true, signal });

    activeController = {
      captureState: () => ({
        gateLevel: gate?.dataset.compassLevel || "closed",
        puzzleStep,
        gateHidden: Boolean(gate?.hidden),
        activeWorld: root.dataset.activeStoryWorld || null,
        scrollX: window.scrollX,
        scrollY: window.scrollY
      }),
      restoreAfterAuth: snapshot => {
        if (!snapshot) return;
        gate?.classList.remove("is-departing", "is-returning");
        if (!snapshot.gateHidden && gate) {
          gate.hidden = false;
          if (["primary", "worlds"].includes(snapshot.gateLevel)) setGateLevel(snapshot.gateLevel);
        }
        const returnY = snapshot.gateHidden ? (snapshot.scrollY || 0) : (gate?.offsetTop || 0);
        requestAnimationFrame(() => window.scrollTo(snapshot.scrollX || 0, returnY));
      }
    };

    return () => {
      lifecycle.abort();
      window.clearInterval(horizonTimer);
      window.clearInterval(destinationTimer);
      livingMap?.remove?.();
      activeController = null;
    };
  }

  window.LuviaPublicLandingMotion = Object.freeze({
    version: VERSION,
    mount,
    captureState: () => activeController?.captureState?.() || null,
    restoreAfterAuth: snapshot => activeController?.restoreAfterAuth?.(snapshot)
  });
})();
