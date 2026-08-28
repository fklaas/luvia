(() => {
  "use strict";

  const VERSION = "13.82.104";
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
    let syncReelMotion = () => {};

    const noMotion = () => systemReduced || motionDisabled;
    const delay = ms => new Promise(resolve => window.setTimeout(resolve, noMotion() ? 0 : ms));
    const directionSettle = () => delay(620);
    const applyCompassDirectionTone = (container, target, angle) => {
      const tone = window.LuviaExperienceContractCoreV1?.resolveCompassDirectionTone?.(angle);
      if (!container || !tone) return tone || null;
      Object.entries(tone.cssVariables || {}).forEach(([name, value]) => container.style.setProperty(name, value));
      container.dataset.compassDirectionTone = tone.color;
      container.classList.add("has-direction-selection");
      container.querySelectorAll(".is-direction-selected").forEach(node => node.classList.remove("is-direction-selected"));
      target?.classList.add("is-direction-selected");
      return tone;
    };
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
        if (label) label.textContent = systemReduced ? (compact ? "System reduziert" : "Bewegung vom System reduziert") : disabled ? (compact ? "Animationen: aus" : "Animationen wieder einschalten") : (compact ? "Animationen: an" : "Ohne Rätsel & Animationen");
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
      syncReelMotion();
    }

    function mountMotionPreference() {
      root.querySelectorAll("[data-motion-toggle]").forEach(toggle => toggle.addEventListener("click", () => {
        if (systemReduced) return;
        motionDisabled = !motionDisabled;
        applyMotionPreference({ persist: true, focus: motionDisabled });
      }, { signal }));
      applyMotionPreference({ persist: false });
    }

    async function seekNeedle(target, sourceButton) {
      if (!gate || seeking) return false;
      seeking = true;
      applyCompassDirectionTone(gate, sourceButton, target);
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
      if (!await seekNeedle(Number(sourceButton?.dataset.compassAngle || 0), sourceButton)) return;
      await directionSettle();
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
      event.preventDefault();
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
      if (!await seekNeedle(Number(choice.dataset.compassAngle || 0), choice)) return;
      await directionSettle();
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
        await seekNeedle(Number(choice?.dataset.compassAngle || -28), choice);
        await directionSettle();
        setGateLevel("worlds");
      } else {
        const choice = root.querySelector(`[data-compass-choice="${intent}"]`);
        await seekNeedle(Number(choice?.dataset.compassAngle || 0), choice);
        await directionSettle();
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
      const summary = controls.querySelector("[data-photo-summary]");
      const liveState = controls.querySelector("[data-photo-live-state]");
      const defaults = Object.freeze({ light: 22, contrast: 8, warmth: 6, saturation: 8, highlights: -8, shadows: 12, vignette: 8, horizon: 0 });
      const presets = Object.freeze({
        natural: defaults,
        clear: Object.freeze({ light: 15, contrast: 22, warmth: -4, saturation: 14, highlights: -16, shadows: 8, vignette: 4, horizon: 0 }),
        warm: Object.freeze({ light: 18, contrast: 9, warmth: 28, saturation: 16, highlights: -10, shadows: 18, vignette: 10, horizon: 0 }),
        film: Object.freeze({ light: 8, contrast: 18, warmth: 14, saturation: -12, highlights: -22, shadows: 24, vignette: 24, horizon: 0 })
      });
      let cropRatio = "original";
      const signed = value => `${Number(value) > 0 ? "+" : ""}${Number(value)}`;
      const setView = state => {
        const nextState = state === "original" ? "original" : "edited";
        photo.dataset.photoViewState = nextState;
        photo.querySelectorAll("[data-photo-view]").forEach(button => {
          const active = button.dataset.photoView === nextState;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-pressed", String(active));
        });
        const label = photo.querySelector("[data-photo-view-label]");
        if (label) label.textContent = nextState === "original" ? "Unverändertes Original" : "Bearbeitung aktiv";
      };
      const paintTrack = input => {
        const span = Number(input.max) - Number(input.min) || 1;
        input.style.setProperty("--range-position", `${(Number(input.value) - Number(input.min)) / span * 100}%`);
      };
      const selectPreset = name => {
        controls.querySelectorAll("[data-photo-preset]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.photoPreset === name)));
        if (liveState) liveState.textContent = name ? `${controls.querySelector(`[data-photo-preset="${name}"]`)?.textContent || name} · aktiv` : "Eigene Anpassung";
      };
      const setRatio = ratio => {
        cropRatio = ratio;
        photo.dataset.photoRatio = ratio;
        controls.querySelectorAll("[data-photo-ratio]").forEach(button => {
          const active = button.dataset.photoRatio === ratio;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-pressed", String(active));
        });
      };
      const update = () => {
        const light = Number(inputs.light?.value || 0);
        const contrast = Number(inputs.contrast?.value || 0);
        const warmth = Number(inputs.warmth?.value || 0);
        const saturation = Number(inputs.saturation?.value || 0);
        const highlights = Number(inputs.highlights?.value || 0);
        const shadows = Number(inputs.shadows?.value || 0);
        const vignette = Number(inputs.vignette?.value || 0);
        const horizon = Number(inputs.horizon?.value || 0);
        photo.style.setProperty("--editor-brightness", String(1 + light * .004));
        photo.style.setProperty("--editor-contrast", String(Math.max(.7, 1 + contrast * .006 + highlights * .001 - shadows * .001)));
        photo.style.setProperty("--editor-sepia", String(Math.max(0, warmth) * .005));
        photo.style.setProperty("--editor-saturation", String(Math.max(.55, 1 + Math.abs(warmth) * .005 + saturation * .007)));
        photo.style.setProperty("--editor-hue", `${warmth * -.22}deg`);
        photo.style.setProperty("--editor-rotate", `${horizon}deg`);
        photo.style.setProperty("--editor-crop-scale", cropRatio === "4:5" ? "1.2" : cropRatio === "16:9" ? "1.11" : "1.055");
        photo.style.setProperty("--editor-highlights", String(Math.max(0, highlights) * .009));
        photo.style.setProperty("--editor-shadows", String(Math.max(0, shadows) * .008));
        photo.style.setProperty("--editor-vignette", String(Math.max(0, vignette) * .012));
        for (const [name, input] of Object.entries(inputs)) {
          paintTrack(input);
          const output = controls.querySelector(`[data-photo-output="${name}"]`);
          if (output) output.textContent = name === "horizon" ? `${signed(input.value)}°` : signed(input.value);
        }
        const activeCount = Object.values(inputs).filter(input => Number(input.value) !== 0).length;
        if (summary) summary.textContent = activeCount ? `${activeCount} Korrekturen · Original bleibt erhalten` : "Originalansicht · jederzeit wiederherstellbar";
      };
      Object.values(inputs).forEach(input => input.addEventListener("input", () => { selectPreset(""); update(); }, { signal }));
      photo.querySelectorAll("[data-photo-view]").forEach(button => button.addEventListener("click", () => setView(button.dataset.photoView), { signal }));
      controls.querySelectorAll("[data-photo-preset]").forEach(button => button.addEventListener("click", () => {
        const preset = presets[button.dataset.photoPreset];
        if (!preset) return;
        Object.entries(preset).forEach(([name, value]) => { if (inputs[name]) inputs[name].value = String(value); });
        selectPreset(button.dataset.photoPreset);
        update();
      }, { signal }));
      controls.querySelectorAll("[data-photo-ratio]").forEach(button => button.addEventListener("click", () => { setRatio(button.dataset.photoRatio); update(); }, { signal }));
      controls.querySelector("[data-photo-rotate]")?.addEventListener("click", () => {
        if (!inputs.horizon) return;
        inputs.horizon.value = String(Number(inputs.horizon.value) <= -3.5 ? 0 : Number(inputs.horizon.value) - .5);
        selectPreset("");
        update();
      }, { signal });
      controls.querySelector("[data-photo-reset]")?.addEventListener("click", () => {
        Object.values(inputs).forEach(input => { input.value = "0"; });
        setRatio("original");
        selectPreset("");
        setView("edited");
        update();
      }, { signal });
      setRatio("original");
      setView("edited");
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
        { video: "assets/public-landing/reel-couple-market.mp4", poster: "assets/public-landing/reel-poster-couple-market.webp", title: "Einfach treiben lassen", time: "00:06", alt: "Paar entdeckt gemeinsam einen lebendigen Stadtmarkt", place: "City Market · zu zweit", copy: "Keine Liste. Nur wir, eine Kamera und die nächste Gasse. 📍", credit: "Clip · George Pak / Pexels ↗", source: "https://www.pexels.com/video/couple-on-travel-tour-7824469/" },
        { video: "assets/public-landing/reel-family-planning.mp4", poster: "assets/public-landing/reel-poster-family-planning.webp", title: "Der Aufbruch gehört uns", time: "00:11", alt: "Junge Familie plant mit Karte und Koffer ihre gemeinsame Reise", place: "Zuhause · gleich geht es los", copy: "Die erste Route entsteht zwischen Koffer, Karte und ganz viel Vorfreude. 🧳", credit: "Clip · Gustavo Fring / Pexels ↗", source: "https://www.pexels.com/video/a-couple-looking-at-a-map-with-their-baby-girl-8779705/" },
        { video: "assets/public-landing/reel-friends-beach.mp4", poster: "assets/public-landing/reel-poster-friends-beach.webp", title: "Dieser Nachmittag bleibt", time: "00:18", alt: "Freundinnen genießen gemeinsam einen sonnigen Strandtag", place: "Küste · mit Freunden", copy: "Salz auf der Haut, Musik im Sand und niemand schaut auf die Uhr. ☀️", credit: "Clip · RDNE Stock project / Pexels ↗", source: "https://www.pexels.com/video/friends-bonding-at-the-beach-8760164/" },
        { video: "assets/public-landing/reel-beach-sunrise.mp4", poster: "assets/public-landing/reel-poster-beach-sunrise.webp", title: "Nur noch wir und das Meer", time: "00:24", alt: "Zwei Menschen gehen bei Sonnenaufgang gemeinsam am Strand", place: "Strand · erster Morgen", copy: "Früh aufstehen war plötzlich gar nicht mehr wichtig. Nur dieser Horizont. 🌅", credit: "Clip · Bùi Hoàng Long / Pexels ↗", source: "https://www.pexels.com/video/silhouettes-of-two-people-walking-on-the-beach-at-sunrise-15757393/" }
      ]);
      const reel = workbench.querySelector("[data-reel-phone]");
      const reelVideo = reel?.querySelector("video");
      const playReel = () => {
        if (!reelVideo || noMotion()) return;
        reelVideo.play().catch(() => {});
        reel?.classList.add("is-playing");
      };
      syncReelMotion = () => {
        if (!reelVideo) return;
        if (noMotion() || workbench.dataset.memoryMode !== "reel") {
          reelVideo.pause();
          reel?.classList.remove("is-playing");
        } else if (workbench.dataset.memoryMode === "reel") playReel();
      };
      const reelSceneButtons = [...workbench.querySelectorAll("[data-reel-scene]")];
      const reelStorySegments = [...workbench.querySelectorAll("[data-reel-story-segment]")];
      const selectReelScene = index => {
        const sceneIndex = Math.max(0, Math.min(reelScenes.length - 1, Number(index) || 0));
        const scene = reelScenes[sceneIndex];
        reelSceneButtons.forEach(item => {
          const active = Number(item.dataset.reelScene) === sceneIndex;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        reelStorySegments.forEach(item => item.classList.toggle("is-active", Number(item.dataset.reelStorySegment) === sceneIndex));
        const title = reel?.querySelector("[data-reel-title]");
        const time = reel?.querySelector("[data-reel-time]");
        const place = reel?.querySelector("[data-reel-place]");
        const copy = reel?.querySelector("[data-reel-copy]");
        const credit = reel?.querySelector("[data-reel-credit]");
        if (reelVideo) {
          reelVideo.pause();
          reelVideo.src = scene.video;
          reelVideo.poster = scene.poster;
          reelVideo.setAttribute("aria-label", scene.alt);
          reelVideo.load();
        }
        if (title) title.textContent = scene.title;
        if (time) time.textContent = scene.time;
        if (place) place.textContent = scene.place;
        if (copy) copy.textContent = scene.copy;
        if (credit) { credit.textContent = scene.credit; credit.href = scene.source; }
        reel?.classList.remove("is-changing");
        void reel?.offsetWidth;
        reel?.classList.add("is-changing");
        playReel();
      };
      reelSceneButtons.forEach(button => button.addEventListener("click", () => selectReelScene(button.dataset.reelScene), { signal }));
      reelStorySegments.forEach(button => button.addEventListener("click", () => selectReelScene(button.dataset.reelStorySegment), { signal }));

      const updateReelTags = () => {
        const tags = [...workbench.querySelectorAll("[data-reel-tag][aria-pressed=\"true\"]")].map(button => button.dataset.reelTag);
        const output = reel?.querySelector("[data-reel-tags]");
        if (output) output.textContent = tags.join(" ") || "#eueremoment";
      };
      workbench.querySelectorAll("[data-reel-tag]").forEach(button => button.addEventListener("click", () => {
        const active = button.getAttribute("aria-pressed") !== "true";
        button.setAttribute("aria-pressed", String(active));
        button.classList.toggle("is-active", active);
        updateReelTags();
      }, { signal }));
      const formatCopy = Object.freeze({
        "9:16": { state: "9:16 · sauberer Export ohne Plattform-UI", badge: "9:16" },
        story: { state: "Story · Antwortleiste und sichere Kopf-/Fußräume", badge: "STORY" },
        reel: { state: "Reel · Caption, Reaktionen und sichere Textränder", badge: "REEL" }
      });
      workbench.querySelectorAll("[data-reel-format]").forEach(button => button.addEventListener("click", () => {
        workbench.querySelectorAll("[data-reel-format]").forEach(item => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        const format = button.dataset.reelFormat;
        reel?.setAttribute("data-reel-format", format);
        const detail = formatCopy[format] || formatCopy.reel;
        const state = workbench.querySelector("[data-reel-format-state]");
        const badge = reel?.querySelector("[data-reel-format-badge]");
        if (state) state.textContent = detail.state;
        if (badge) badge.textContent = detail.badge;
      }, { signal }));
      workbench.querySelector("[data-reel-react]")?.addEventListener("click", event => {
        const button = event.currentTarget;
        const active = button.getAttribute("aria-pressed") !== "true";
        button.setAttribute("aria-pressed", String(active));
        button.classList.toggle("is-active", active);
        const icon = button.querySelector("span");
        const likes = button.querySelector("[data-reel-likes]");
        if (icon) icon.textContent = active ? "♥" : "♡";
        if (likes) likes.textContent = active ? "2,5k" : "2,4k";
      }, { signal });
      workbench.querySelector("[data-reel-comment]")?.addEventListener("click", event => {
        event.currentTarget.classList.toggle("is-active");
        const count = event.currentTarget.querySelector("b");
        if (count) count.textContent = count.textContent === "87" ? "88" : "87";
      }, { signal });
      workbench.querySelector("[data-reel-share]")?.addEventListener("click", event => {
        event.currentTarget.classList.toggle("is-active");
        const label = event.currentTarget.querySelector("b");
        if (label) label.textContent = label.textContent === "Teilen" ? "Bereit ✓" : "Teilen";
      }, { signal });
      workbench.querySelectorAll("[data-reel-music]").forEach(button => button.addEventListener("click", () => {
        workbench.querySelectorAll("[data-reel-music]").forEach(item => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-checked", String(active));
        });
        const audio = reel?.querySelector("[data-reel-audio]");
        if (audio) audio.textContent = button.dataset.reelMusicLabel || button.textContent.trim();
        const state = workbench.querySelector("[data-reel-music-state]");
        if (state) state.textContent = `${button.querySelector("b")?.textContent || "1 Soundtrack"} ausgewählt · Vorschau ohne Autoplay-Ton`;
      }, { signal }));
      workbench.querySelector("[data-reel-preview-action]")?.addEventListener("click", event => {
        const playing = Boolean(reelVideo?.paused);
        if (playing && !noMotion()) reelVideo?.play().catch(() => {});
        else reelVideo?.pause();
        reel?.classList.toggle("is-playing", playing);
        event.currentTarget.textContent = playing ? "Vorschau pausieren Ⅱ" : "Vorschau abspielen ▶";
      }, { signal });

      const bookPages = Object.freeze([
        { left: "assets/public-landing/prototype-harbor-lunch.png", right: "assets/public-landing/prototype-memory-sunset.png", detail: "assets/public-landing/prototype-coast-bike.png", kicker: "TAG 03 · HAFENLUFT", title: "Ein Tag,\nganz bei uns.", leftCaption: "13:34 · Das Essen kam später. Das Gespräch durfte bleiben.", rightCaption: "21:18 · Noch einmal barfuß ans Wasser.", note: "Genau so fühlt sich Zeit füreinander an.", copy: "Ein Abend, den wir nicht geplant hatten – und gerade deshalb behalten.", location: "OSTSEE · 21:18", leftPage: "06", rightPage: "07" },
        { left: "assets/public-landing/prototype-coast-bike.png", right: "assets/public-landing/prototype-coast-morning.png", detail: "assets/public-landing/prototype-harbor-lunch.png", kicker: "TAG 04 · EINFACH LOS", title: "Rückenwind\nfür uns zwei.", leftCaption: "09:12 · Fahrräder, Rückenwind und die längere Abzweigung.", rightCaption: "11:46 · Der Horizont war unser einziger Termin.", note: "Bitte genau diesen Umweg noch einmal.", copy: "Aus einem freien Morgen wurde die Geschichte, die wir am häufigsten erzählen.", location: "KÜSTENWEG · 11:46", leftPage: "08", rightPage: "09" },
        { left: "assets/public-landing/prototype-memory-sunset.png", right: "assets/public-landing/prototype-harbor-lunch.png", detail: "assets/public-landing/prototype-coast-morning.png", kicker: "TAG 05 · NOCH NICHT HEIM", title: "Das letzte Licht\nbleibt bei uns.", leftCaption: "20:51 · Das letzte Licht lag noch auf dem Wasser.", rightCaption: "22:07 · Einer bestellt Nachtisch. Alle bleiben.", note: "Kein großer Plan. Ein ziemlich großes Gefühl.", copy: "Fotos, Orte und eure kleinen Sätze bleiben als eine gemeinsame Erinnerung verbunden.", location: "HAFENABEND · 22:07", leftPage: "10", rightPage: "11" }
      ]);
      let bookPage = 0;
      const renderBookPage = nextPage => {
        bookPage = (nextPage + bookPages.length) % bookPages.length;
        const spread = workbench.querySelector("[data-book-spread]");
        const page = bookPages[bookPage];
        const left = spread?.querySelector('[data-book-image="left"]');
        const right = spread?.querySelector('[data-book-image="right"]');
        const detail = spread?.querySelector('[data-book-image="detail"]');
        if (left) left.src = page.left;
        if (right) right.src = page.right;
        if (detail) detail.src = page.detail;
        const fields = {
          "[data-book-left-kicker]": page.kicker,
          "[data-book-title]": page.title,
          "[data-book-left-caption]": page.leftCaption,
          "[data-book-right-caption]": page.rightCaption,
          "[data-book-note]": page.note,
          "[data-book-location]": page.location,
          "[data-book-page-left]": page.leftPage,
          "[data-book-page-right]": page.rightPage
        };
        Object.entries(fields).forEach(([selector, value]) => {
          const node = spread?.querySelector(selector);
          if (node) node.textContent = value;
        });
        const copy = spread?.querySelector("[data-book-copy]");
        if (copy) copy.textContent = page.copy;
        const progress = workbench.querySelector("[data-book-progress]");
        if (progress) progress.textContent = `Doppelseite ${bookPage + 1} von ${bookPages.length}`;
        spread?.classList.remove("is-turning");
        void spread?.offsetWidth;
        spread?.classList.add("is-turning");
      };
      workbench.querySelector("[data-book-turn]")?.addEventListener("click", () => renderBookPage(bookPage + 1), { signal });
      workbench.querySelector("[data-book-prev]")?.addEventListener("click", () => renderBookPage(bookPage - 1), { signal });
      const bookLayoutNames = Object.freeze({ journal: "Editorial", postcards: "Postkarten", mosaic: "Collage" });
      workbench.querySelectorAll("[data-book-layout-choice]").forEach(button => button.addEventListener("click", () => {
        const layout = button.dataset.bookLayoutChoice || "journal";
        const spread = workbench.querySelector("[data-book-spread]");
        if (spread) spread.dataset.bookLayout = layout;
        workbench.querySelectorAll("[data-book-layout-choice]").forEach(item => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        const label = workbench.querySelector("[data-book-layout-label]");
        if (label) label.textContent = bookLayoutNames[layout] || bookLayoutNames.journal;
      }, { signal }));

      const bookSpread = workbench.querySelector("[data-book-spread]");
      const bookPreview = workbench.querySelector('[data-memory-preview="book"]');
      const bookToolNames = Object.freeze({ text: "Text", photos: "Fotobibliothek", style: "Seitenstil", decor: "Dekoration", travel: "Reisethema" });
      const bookSelectionState = workbench.querySelector("[data-book-selection-state]");
      const bookDeleteButton = workbench.querySelector("[data-book-delete-element]");
      const bookObjectTools = workbench.querySelector("[data-book-object-tools]");
      const bookTransformTools = workbench.querySelector("[data-book-transform-tools]");
      const bookScaleControl = workbench.querySelector("[data-book-scale-control]");
      const bookScaleOutput = workbench.querySelector("[data-book-scale-output]");
      const bookRotationControl = workbench.querySelector("[data-book-rotation-control]");
      const bookRotationOutput = workbench.querySelector("[data-book-rotation-output]");
      const bookPhotoStyleTools = workbench.querySelector("[data-book-photo-style-tools]");
      const bookPhotoMaskTools = workbench.querySelector("[data-book-photo-mask-tools]");
      let selectedBookElement = null;
      const ensureBookObjectChrome = element => {
        if (!element || element.querySelector(":scope > [data-book-object-chrome]")) return;
        const chrome = document.createElement("span");
        chrome.className = "book-object-chrome";
        chrome.dataset.bookObjectChrome = "";
        chrome.setAttribute("aria-hidden", "true");
        chrome.innerHTML = '<i class="book-object-metric" data-book-object-metric>100 %</i><i class="book-object-handle book-object-rotate-handle" data-book-rotate-handle></i><i class="book-object-handle book-object-resize-handle" data-book-resize-handle></i>';
        element.append(chrome);
      };
      const syncBookTransformTools = () => {
        const hasSelection = Boolean(selectedBookElement);
        if (bookTransformTools) bookTransformTools.hidden = !hasSelection;
        const scale = hasSelection ? Number(selectedBookElement.dataset.bookScale || 1) : 1;
        const rotation = hasSelection ? Number(selectedBookElement.dataset.bookRotation || 0) : 0;
        if (bookScaleControl) bookScaleControl.value = String(Math.round(scale * 100));
        if (bookScaleOutput) bookScaleOutput.textContent = `${Math.round(scale * 100)} %`;
        if (bookRotationControl) bookRotationControl.value = String(Math.round(rotation));
        if (bookRotationOutput) bookRotationOutput.textContent = `${Math.round(rotation)}°`;
      };
      const syncBookPhotoStyleTools = () => {
        const isPhoto = selectedBookElement?.dataset.bookElementType === "Foto";
        [bookPhotoStyleTools, bookPhotoMaskTools].forEach(group => {
          group?.classList.toggle("is-unavailable", !isPhoto);
          group?.querySelectorAll("button").forEach(button => { button.disabled = !isPhoto; });
        });
        if (!isPhoto) return;
        const frame = selectedBookElement.dataset.bookObjectFrame || "soft";
        const mask = selectedBookElement.dataset.bookObjectMask || "organic";
        workbench.querySelectorAll("[data-book-object-frame]").forEach(button => {
          const active = button.dataset.bookObjectFrame === frame;
          button.classList.toggle("is-active", active); button.setAttribute("aria-pressed", String(active));
        });
        workbench.querySelectorAll("[data-book-object-mask]").forEach(button => {
          const active = button.dataset.bookObjectMask === mask;
          button.classList.toggle("is-active", active); button.setAttribute("aria-pressed", String(active));
        });
      };
      const selectBookElement = element => {
        bookSpread?.querySelectorAll("[data-book-draggable].is-selected").forEach(item => item.classList.remove("is-selected"));
        selectedBookElement = element?.isConnected ? element : null;
        ensureBookObjectChrome(selectedBookElement);
        selectedBookElement?.classList.add("is-selected");
        if (bookSelectionState) bookSelectionState.textContent = selectedBookElement ? `${selectedBookElement.dataset.bookElementType || "Element"} · frei bewegen · Ecke skalieren · oben drehen` : "Nichts ausgewählt";
        if (bookDeleteButton) bookDeleteButton.disabled = !selectedBookElement?.matches("[data-book-removable]");
        if (bookObjectTools) bookObjectTools.hidden = !selectedBookElement;
        syncBookTransformTools();
        syncBookPhotoStyleTools();
      };
      const removeBookElement = element => {
        if (!element?.matches("[data-book-removable]")) return;
        if (element.matches("[data-book-dynamic]")) element.remove();
        else element.hidden = true;
        selectBookElement(null);
      };
      bookDeleteButton?.addEventListener("click", () => removeBookElement(selectedBookElement), { signal });
      workbench.querySelector("[data-book-layer-forward]")?.addEventListener("click", () => {
        if (!selectedBookElement) return;
        selectedBookElement.style.zIndex = String(Math.min(40, Number(getComputedStyle(selectedBookElement).zIndex) || 7) + 1);
      }, { signal });
      workbench.querySelector("[data-book-layer-back]")?.addEventListener("click", () => {
        if (!selectedBookElement) return;
        selectedBookElement.style.zIndex = String(Math.max(2, (Number(getComputedStyle(selectedBookElement).zIndex) || 7) - 1));
      }, { signal });
      workbench.querySelector("[data-book-duplicate-element]")?.addEventListener("click", () => {
        if (!selectedBookElement) return;
        const clone = selectedBookElement.cloneNode(true);
        clone.removeAttribute("data-book-drag-ready");
        clone.dataset.bookDynamic = "";
        clone.dataset.bookX = String(Number(selectedBookElement.dataset.bookX || 0) + 18);
        clone.dataset.bookY = String(Number(selectedBookElement.dataset.bookY || 0) + 18);
        clone.hidden = false;
        selectedBookElement.parentElement?.append(clone);
        makeBookElementDraggable(clone);
        moveBookElement(clone, Number(clone.dataset.bookX), Number(clone.dataset.bookY));
        selectBookElement(clone);
      }, { signal });
      const moveBookElement = (element, nextX, nextY) => {
        const x = Math.round(nextX * 10) / 10;
        const y = Math.round(nextY * 10) / 10;
        element.dataset.bookX = String(x);
        element.dataset.bookY = String(y);
        element.style.setProperty("--book-drag-x", `${x}px`);
        element.style.setProperty("--book-drag-y", `${y}px`);
      };
      const transformBookElement = (element, nextScale, nextRotation, cause = "control") => {
        if (!element) return;
        const scale = Math.max(.38, Math.min(2.45, Number(nextScale) || 1));
        const rotation = Math.max(-18, Math.min(18, Number(nextRotation) || 0));
        element.dataset.bookScale = String(Math.round(scale * 1000) / 1000);
        element.dataset.bookRotation = String(Math.round(rotation * 10) / 10);
        element.dataset.bookTransformCause = cause;
        element.style.setProperty("--book-object-scale", String(scale));
        element.style.setProperty("--book-object-ui-scale", String(1 / scale));
        element.style.setProperty("--book-object-rotation", `${rotation}deg`);
        const metric = element.querySelector(":scope > [data-book-object-chrome] [data-book-object-metric]");
        if (metric) metric.textContent = `${Math.round(scale * 100)} % · ${Math.round(rotation)}°`;
        syncBookTransformTools();
      };
      bookScaleControl?.addEventListener("input", event => transformBookElement(selectedBookElement, Number(event.currentTarget.value) / 100, Number(selectedBookElement?.dataset.bookRotation || 0)), { signal });
      bookRotationControl?.addEventListener("input", event => transformBookElement(selectedBookElement, Number(selectedBookElement?.dataset.bookScale || 1), Number(event.currentTarget.value)), { signal });
      workbench.querySelector("[data-book-transform-reset]")?.addEventListener("click", () => {
        if (!selectedBookElement) return;
        moveBookElement(selectedBookElement, 0, 0);
        transformBookElement(selectedBookElement, 1, 0);
      }, { signal });
      const nudgeBookElement = (element, deltaX, deltaY) => {
        const parentRect = element.parentElement?.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        if (!parentRect) return;
        const allowedX = Math.max(parentRect.left - elementRect.left, Math.min(deltaX, parentRect.right - elementRect.right));
        const allowedY = Math.max(parentRect.top - elementRect.top, Math.min(deltaY, parentRect.bottom - elementRect.bottom));
        moveBookElement(element, Number(element.dataset.bookX || 0) + allowedX, Number(element.dataset.bookY || 0) + allowedY);
      };
      const syncBookGuides = (element, rect, parentRect) => {
        const page = element.parentElement;
        if (!page?.classList.contains("book-page")) return { x: 0, y: 0 };
        const deltaCenterX = (parentRect.left + parentRect.width / 2) - (rect.left + rect.width / 2);
        const deltaCenterY = (parentRect.top + parentRect.height / 2) - (rect.top + rect.height / 2);
        const snapX = Math.abs(deltaCenterX) <= 7 ? deltaCenterX : 0;
        const snapY = Math.abs(deltaCenterY) <= 7 ? deltaCenterY : 0;
        page.classList.toggle("has-book-guide-x", Boolean(snapX));
        page.classList.toggle("has-book-guide-y", Boolean(snapY));
        return { x: snapX, y: snapY };
      };
      const clearBookGuides = () => bookSpread?.querySelectorAll(".book-page").forEach(page => page.classList.remove("has-book-guide-x", "has-book-guide-y"));
      const makeBookElementDraggable = element => {
        if (!element || element.dataset.bookDragReady === "true") return;
        element.dataset.bookDragReady = "true";
        ensureBookObjectChrome(element);
        const activePointers = new Map();
        let dragState = null, moveFrame = 0, pendingMove = null;
        const pointerDistance = pointers => Math.hypot(pointers[1].clientX - pointers[0].clientX, pointers[1].clientY - pointers[0].clientY);
        const pointerAngle = pointers => Math.atan2(pointers[1].clientY - pointers[0].clientY, pointers[1].clientX - pointers[0].clientX) * 180 / Math.PI;
        const flushMove = () => {
          moveFrame = 0;
          if (!pendingMove || !dragState) return;
          if (dragState.mode === "pinch") {
            const pointers = [...activePointers.values()];
            if (pointers.length < 2) return;
            const scale = dragState.originScale * pointerDistance(pointers) / dragState.startDistance;
            const rotation = dragState.originRotation + pointerAngle(pointers) - dragState.startAngle;
            transformBookElement(element, scale, rotation, "pinch");
            return;
          }
          if (dragState.mode === "resize" || dragState.mode === "rotate") {
            const centerX = dragState.elementRect.left + dragState.elementRect.width / 2;
            const centerY = dragState.elementRect.top + dragState.elementRect.height / 2;
            if (dragState.mode === "resize") {
              const vectorX = dragState.startX - centerX;
              const vectorY = dragState.startY - centerY;
              const vectorLength = Math.max(1, Math.hypot(vectorX, vectorY));
              const projectedDelta = ((pendingMove.clientX - dragState.startX) * vectorX + (pendingMove.clientY - dragState.startY) * vectorY) / vectorLength;
              const scaleDistance = Math.max(64, Math.min(dragState.elementRect.width, dragState.elementRect.height) * .55);
              transformBookElement(element, dragState.originScale + projectedDelta / scaleDistance, dragState.originRotation, "resize");
            } else {
              const angle = Math.atan2(pendingMove.clientY - centerY, pendingMove.clientX - centerX) * 180 / Math.PI;
              transformBookElement(element, dragState.originScale, dragState.originRotation + angle - dragState.startAngle, "rotate");
            }
            return;
          }
          const rawX = pendingMove.clientX - dragState.startX;
          const rawY = pendingMove.clientY - dragState.startY;
          const minX = dragState.originX + dragState.parentRect.left - dragState.elementRect.left;
          const maxX = dragState.originX + dragState.parentRect.right - dragState.elementRect.right;
          const minY = dragState.originY + dragState.parentRect.top - dragState.elementRect.top;
          const maxY = dragState.originY + dragState.parentRect.bottom - dragState.elementRect.bottom;
          let nextX = Math.max(minX, Math.min(dragState.originX + rawX, maxX));
          let nextY = Math.max(minY, Math.min(dragState.originY + rawY, maxY));
          const projectedRect = { left: dragState.elementRect.left + nextX - dragState.originX, top: dragState.elementRect.top + nextY - dragState.originY, width: dragState.elementRect.width, height: dragState.elementRect.height };
          const guides = syncBookGuides(element, projectedRect, dragState.parentRect);
          nextX += guides.x;
          nextY += guides.y;
          moveBookElement(element, nextX, nextY);
          /* A move never changes zoom or rotation. Re-assert the gesture origin so
             a delayed final frame from the preceding handle gesture cannot leak
             into the next pointer sequence on high-refresh touch/mouse devices. */
          transformBookElement(element, dragState.originScale, dragState.originRotation, "move-preserve");
        };
        element.addEventListener("pointerdown", event => {
          if (event.button !== undefined && event.button !== 0) return;
          const originScale = Number(element.dataset.bookScale || getComputedStyle(element).getPropertyValue("--book-object-scale") || 1);
          const originRotation = Number(element.dataset.bookRotation || 0);
          selectBookElement(element);
          activePointers.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
          const elementRect = element.getBoundingClientRect();
          const parentRect = element.parentElement?.getBoundingClientRect();
          if (!parentRect) return;
          const pointers = [...activePointers.values()];
          element.dataset.bookGestureOriginScale = String(originScale);
          if (pointers.length === 2) {
            dragState = { mode: "pinch", originScale, originRotation, startDistance: Math.max(20, pointerDistance(pointers)), startAngle: pointerAngle(pointers), elementRect, parentRect };
          } else {
            const centerX = elementRect.left + elementRect.width / 2;
            const centerY = elementRect.top + elementRect.height / 2;
            /* Hit-test from the transformed geometry.  A scaled object can move its
               visual handle away from the untransformed child hit box, especially on
               touch browsers.  Geometry keeps the centre draggable and the two real
               handles dependable at every zoom level. */
            const hitHandle = (handle, padding = 12) => {
              const rect = handle?.getBoundingClientRect();
              return Boolean(rect && event.clientX >= rect.left - padding && event.clientX <= rect.right + padding && event.clientY >= rect.top - padding && event.clientY <= rect.bottom + padding);
            };
            const isResize = hitHandle(element.querySelector("[data-book-resize-handle]")) || Math.hypot(event.clientX - elementRect.right, event.clientY - elementRect.bottom) <= Math.max(34, Math.min(elementRect.width, elementRect.height) * .12);
            const isRotate = !isResize && (hitHandle(element.querySelector("[data-book-rotate-handle]")) || Math.hypot(event.clientX - centerX, event.clientY - elementRect.top) <= 32);
            dragState = { mode: isResize ? "resize" : isRotate ? "rotate" : "move", startX: event.clientX, startY: event.clientY, originX: Number(element.dataset.bookX || 0), originY: Number(element.dataset.bookY || 0), originScale, originRotation, startDistance: Math.max(20, Math.hypot(event.clientX - centerX, event.clientY - centerY)), startAngle: Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180 / Math.PI, elementRect, parentRect };
            element.dataset.bookGestureMode = dragState.mode;
          }
          element.setPointerCapture?.(event.pointerId);
          element.classList.add("is-manipulating");
          event.preventDefault();
        }, { signal });
        element.addEventListener("pointermove", event => {
          if (!activePointers.has(event.pointerId) || !dragState) return;
          activePointers.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
          if (activePointers.size >= 2 && dragState.mode !== "pinch") {
            const pointers = [...activePointers.values()];
            dragState = { ...dragState, mode: "pinch", originScale: Number(element.dataset.bookScale || 1), originRotation: Number(element.dataset.bookRotation || 0), startDistance: Math.max(20, pointerDistance(pointers)), startAngle: pointerAngle(pointers) };
          }
          pendingMove = { clientX: event.clientX, clientY: event.clientY };
          if (!moveFrame) moveFrame = requestAnimationFrame(flushMove);
          event.preventDefault();
        }, { signal });
        const finishDrag = event => {
          if (!activePointers.has(event.pointerId) || !dragState) return;
          pendingMove = { clientX: event.clientX, clientY: event.clientY };
          if (moveFrame) cancelAnimationFrame(moveFrame);
          flushMove();
          element.releasePointerCapture?.(event.pointerId);
          activePointers.delete(event.pointerId);
          if (activePointers.size === 1) {
            const remaining = [...activePointers.values()][0];
            const elementRect = element.getBoundingClientRect();
            dragState = { mode: "move", startX: remaining.clientX, startY: remaining.clientY, originX: Number(element.dataset.bookX || 0), originY: Number(element.dataset.bookY || 0), originScale: Number(element.dataset.bookScale || 1), originRotation: Number(element.dataset.bookRotation || 0), elementRect, parentRect: element.parentElement?.getBoundingClientRect() };
          } else {
            dragState = null;
            pendingMove = null;
            element.classList.remove("is-manipulating");
            clearBookGuides();
          }
        };
        element.addEventListener("pointerup", finishDrag, { signal });
        element.addEventListener("pointercancel", finishDrag, { signal });
        element.addEventListener("click", () => selectBookElement(element), { signal });
        element.addEventListener("keydown", event => {
          const step = event.shiftKey ? 10 : 1;
          const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
          if (moves[event.key]) {
            event.preventDefault();
            selectBookElement(element);
            nudgeBookElement(element, ...moves[event.key]);
          } else if (event.key === "Delete" || event.key === "Backspace") {
            event.preventDefault();
            removeBookElement(element);
          }
        }, { signal });
      };
      workbench.querySelectorAll("[data-book-editor-tab]").forEach(button => button.addEventListener("click", () => {
        const tool = button.dataset.bookEditorTab || "text";
        workbench.querySelectorAll("[data-book-editor-tab]").forEach(item => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-selected", String(active));
        });
        workbench.querySelectorAll("[data-book-editor-panel]").forEach(panel => {
          const active = panel.dataset.bookEditorPanel === tool;
          panel.hidden = !active;
          panel.classList.toggle("is-active", active);
        });
        const state = workbench.querySelector("[data-book-tool-state]");
        if (state) state.textContent = bookToolNames[tool] || bookToolNames.text;
      }, { signal }));

      const bookTextInput = workbench.querySelector("[data-book-text-input]");
      const bookAddedText = bookSpread?.querySelector("[data-book-added-text]");
      const selectedBookText = () => selectedBookElement?.matches('[data-book-element-type="Titel"],[data-book-element-type="Text"],[data-book-element-type="Ort"]') ? selectedBookElement : null;
      const applyBookText = () => {
        if (!bookTextInput) return;
        const target = selectedBookText() || bookAddedText;
        if (!target) return;
        target.textContent = bookTextInput.value.trim() || "Unser Lieblingsmoment";
        target.hidden = false;
        makeBookElementDraggable(target);
        selectBookElement(target);
      };
      workbench.querySelector("[data-book-add-text]")?.addEventListener("click", applyBookText, { signal });
      bookTextInput?.addEventListener("input", () => {
        if (bookAddedText && !bookAddedText.hidden) applyBookText();
      }, { signal });
      workbench.querySelector("select[data-book-font]")?.addEventListener("change", event => {
        const value = event.currentTarget.value || "modern";
        if (bookSpread) bookSpread.dataset.bookFont = value;
        const target = selectedBookText();
        if (target) target.dataset.bookOwnFont = value;
      }, { signal });
      workbench.querySelector("[data-book-size]")?.addEventListener("input", event => {
        const size = Number(event.currentTarget.value) || 18;
        bookSpread?.style.setProperty("--book-custom-size", `${size}px`);
        const target = selectedBookText();
        if (target) target.style.fontSize = `${size}px`;
        const output = workbench.querySelector("[data-book-size-output]");
        if (output) output.textContent = String(size);
      }, { signal });
      workbench.querySelectorAll("[data-book-text-color]").forEach(button => button.addEventListener("click", () => {
        workbench.querySelectorAll("[data-book-text-color]").forEach(item => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        const color = button.dataset.bookTextColor || "#163247";
        bookSpread?.style.setProperty("--book-custom-color", color);
        const target = selectedBookText();
        if (target) target.style.color = color;
      }, { signal }));
      workbench.querySelector("[data-book-bold]")?.addEventListener("click", event => {
        const active = event.currentTarget.getAttribute("aria-pressed") !== "true";
        event.currentTarget.setAttribute("aria-pressed", String(active));
        if (bookSpread) bookSpread.dataset.bookTextWeight = active ? "bold" : "regular";
        const target = selectedBookText();
        if (target) target.style.fontWeight = active ? "800" : "500";
      }, { signal });
      workbench.querySelectorAll("[data-book-align]").forEach(button => button.addEventListener("click", () => {
        workbench.querySelectorAll("[data-book-align]").forEach(item => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        if (bookSpread) bookSpread.dataset.bookAlign = button.dataset.bookAlign || "left";
        const target = selectedBookText();
        if (target) target.style.textAlign = button.dataset.bookAlign || "left";
      }, { signal }));

      const bindBookChoice = (selector, datasetKey, fallback) => {
        workbench.querySelectorAll(selector).forEach(button => button.addEventListener("click", () => {
          workbench.querySelectorAll(selector).forEach(item => {
            const active = item === button;
            item.classList.toggle("is-active", active);
            item.setAttribute("aria-pressed", String(active));
          });
          if (bookSpread) bookSpread.dataset[datasetKey] = button.dataset[datasetKey] || fallback;
        }, { signal }));
      };
      bindBookChoice("button[data-book-theme]", "bookTheme", "magazine");
      bindBookChoice("button[data-book-focus]", "bookFocus", "center");
      const bookThemeDescriptions = Object.freeze({ magazine: "Großzügiger Weißraum, klare Kapiteltypografie und ruhige Bildbühnen.", coast: "Sanfte Wellenformen, Meeresfarben und ein warmer Sonnenakzent.", golden: "Lichtvolle Verläufe, warme Apricot-Töne und ein ruhiger Abendglanz.", postcard: "Papierlinien, Reisestempel und persönliche Postkartendetails.", atlas: "Kartenraster, Wegmarken und eine sichtbare Route durch die Doppelseite.", family: "Weiche Farbinseln, runde Formen und freundliche, lebendige Akzente.", adventure: "Topografische Linien, Naturtöne und ein robuster Expeditionscharakter.", city: "Architektonische Raster, klare Kontraste und urbane Farbsignale.", desert: "Geschichtete Dünenformen, Sandtöne und warme Terrakotta-Akzente.", alpine: "Luftige Bergsilhouetten, kühle Naturtöne und viel ruhige Fläche." });
      workbench.querySelectorAll("button[data-book-theme]").forEach(button => button.addEventListener("click", () => {
        const description = workbench.querySelector("[data-book-theme-description]");
        if (description) description.textContent = bookThemeDescriptions[button.dataset.bookTheme] || bookThemeDescriptions.magazine;
      }, { signal }));
      workbench.querySelectorAll("button[data-book-object-frame]").forEach(button => button.addEventListener("click", () => {
        if (selectedBookElement?.dataset.bookElementType !== "Foto") return;
        selectedBookElement.dataset.bookObjectFrame = button.dataset.bookObjectFrame || "soft";
        syncBookPhotoStyleTools();
      }, { signal }));
      workbench.querySelectorAll("button[data-book-object-mask]").forEach(button => button.addEventListener("click", () => {
        if (selectedBookElement?.dataset.bookElementType !== "Foto") return;
        selectedBookElement.dataset.bookObjectMask = button.dataset.bookObjectMask || "organic";
        syncBookPhotoStyleTools();
      }, { signal }));
      workbench.querySelector("[data-book-corners]")?.addEventListener("click", event => {
        const organic = event.currentTarget.getAttribute("aria-pressed") !== "true";
        event.currentTarget.setAttribute("aria-pressed", String(organic));
        const label = event.currentTarget.querySelector("strong");
        if (label) label.textContent = organic ? "Organisch" : "Grafisch";
        if (bookSpread) bookSpread.dataset.bookCorners = organic ? "organic" : "graphic";
      }, { signal });
      const stickerSymbols = Object.freeze({ spark: "✦", heart: "♡", pin: "⌖", compass: "✥", sun: "☀", wave: "≈", route: "⌁", ticket: "▱", tape: "▰", stamp: "◎", leaf: "❧", quote: "“ ”", none: "" });
      workbench.querySelectorAll("[data-book-sticker]").forEach(button => button.addEventListener("click", () => {
        const sticker = button.dataset.bookSticker || "none";
        workbench.querySelectorAll("[data-book-sticker]").forEach(item => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        const node = bookSpread?.querySelector("[data-book-custom-sticker]");
        if (node) {
          node.textContent = stickerSymbols[sticker] || "";
          node.hidden = sticker === "none";
          makeBookElementDraggable(node);
          if (sticker === "none") selectBookElement(null);
          else selectBookElement(node);
        }
        if (bookSpread) bookSpread.dataset.bookSticker = sticker;
      }, { signal }));
      workbench.querySelector("[data-book-shape-toggle]")?.addEventListener("click", event => {
        const visible = event.currentTarget.getAttribute("aria-pressed") !== "true";
        event.currentTarget.setAttribute("aria-pressed", String(visible));
        event.currentTarget.querySelector("strong").textContent = visible ? "Sichtbar" : "Ausgeblendet";
        bookSpread?.classList.toggle("is-shape-hidden", !visible);
      }, { signal });
      workbench.querySelector("[data-book-caption-toggle]")?.addEventListener("click", event => {
        const visible = event.currentTarget.getAttribute("aria-pressed") !== "true";
        event.currentTarget.setAttribute("aria-pressed", String(visible));
        event.currentTarget.querySelector("strong").textContent = visible ? "Sichtbar" : "Ausgeblendet";
        bookSpread?.classList.toggle("is-captions-hidden", !visible);
      }, { signal });

      const bookThemeSymbols = Object.freeze({ sea: "≈", beach: "☀", romance: "♡", family: "⌂", adventure: "△", action: "ϟ", jungle: "♧", sahara: "◒", city: "▥", mountains: "⌃", roadtrip: "→", winter: "❄", wellness: "○", food: "✣", friends: "✦", festival: "♫" });
      const bookTravelPresets = Object.freeze({
        sea: { theme: "coast", layout: "journal", title: "Unsere Zeit am Meer.", note: "Salz in der Luft. Zeit füreinander.", copy: "Zwischen Horizont und Hafen blieb plötzlich wieder Platz für uns." },
        beach: { theme: "golden", layout: "postcards", title: "Barfuß durch den Sommer.", note: "Sonne auf der Haut, Sand überall.", copy: "Die Tage waren lang – und genau deshalb viel zu schnell vorbei." },
        romance: { theme: "golden", layout: "journal", title: "Nur wir zwei.", note: "Kleine Umwege. Große Nähe.", copy: "Kein Programmpunkt – nur ein Abend, den wir behalten wollten." },
        family: { theme: "family", layout: "mosaic", title: "Unser großes kleines Abenteuer.", note: "Laut, liebevoll und ganz bei uns.", copy: "Aus hundert kleinen Szenen wurde unsere gemeinsame Geschichte." },
        adventure: { theme: "adventure", layout: "mosaic", title: "Weiter als geplant.", note: "Rausgehen. Staunen. Wieder los.", copy: "Der Weg war nicht gerade – aber genau richtig für uns." },
        action: { theme: "city", layout: "mosaic", title: "Voller Energie.", note: "Schnell im Moment, klar in Erinnerung.", copy: "Zwischen Bewegung und Mut blieb dieser eine Augenblick stehen." },
        jungle: { theme: "adventure", layout: "journal", title: "Tief im Grünen.", note: "Feuchte Luft, wilde Wege, offene Augen.", copy: "Jede Kurve klang anders und hinter jedem Blatt begann etwas Neues." },
        sahara: { theme: "desert", layout: "postcards", title: "Weite ohne Ende.", note: "Sand, Stille und ein Himmel nur für uns.", copy: "Als alles leiser wurde, hörten wir unsere Reise plötzlich ganz klar." },
        city: { theme: "city", layout: "postcards", title: "Nächte voller Straßen.", note: "Lichter, Stimmen, Lieblingsorte.", copy: "Wir kannten den Weg nicht – nur das Gefühl, noch weiterzugehen." },
        mountains: { theme: "alpine", layout: "journal", title: "Oben wird alles still.", note: "Höhenluft und ein Blick, der bleibt.", copy: "Schritt für Schritt wurde aus Anstrengung ein gemeinsamer Gipfel." },
        roadtrip: { theme: "atlas", layout: "mosaic", title: "Kilometer voller Geschichten.", note: "Fenster offen. Playlist an. Los.", copy: "Nicht das Ziel, sondern jeder ungeplante Halt wurde Teil von uns." },
        winter: { theme: "alpine", layout: "postcards", title: "Leise Wintertage.", note: "Kalte Luft, warme Hände.", copy: "Draußen wurde alles weiß und zwischen uns besonders warm." },
        wellness: { theme: "magazine", layout: "journal", title: "Zeit, die langsamer wird.", note: "Atmen. Ankommen. Nichts müssen.", copy: "Wir ließen die Uhr draußen und nahmen nur das gute Gefühl mit." },
        food: { theme: "postcard", layout: "mosaic", title: "Eine Reise in Geschmack.", note: "Teilen, probieren, lange sitzen bleiben.", copy: "Die besten Orte standen in keinem Plan – aber später in jedem Gespräch." },
        friends: { theme: "family", layout: "mosaic", title: "Zusammen unterwegs.", note: "Zu viele Insider für eine Seite.", copy: "Wir sammelten keine Sehenswürdigkeiten, sondern neue gemeinsame Geschichten." },
        festival: { theme: "city", layout: "postcards", title: "Diese Nacht bleibt laut.", note: "Licht, Bass und unsere Lieblingsmenschen.", copy: "Ein Refrain später war aus einem Abend eine Erinnerung geworden." }
      });
      workbench.querySelectorAll("button[data-book-travel-theme]").forEach(button => button.addEventListener("click", () => {
        const theme = button.dataset.bookTravelTheme || "sea";
        const label = button.dataset.bookTravelLabel || "Meer";
        workbench.querySelectorAll("button[data-book-travel-theme]").forEach(item => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-checked", String(active));
        });
        if (bookPreview) bookPreview.dataset.bookTravelTheme = theme;
        if (bookSpread) bookSpread.dataset.bookTravelTheme = theme;
        const coverLabel = workbench.querySelector("[data-book-cover-theme]");
        if (coverLabel) coverLabel.textContent = `${label.toLocaleUpperCase("de-DE")} · 2027`;
        const preset = bookTravelPresets[theme] || bookTravelPresets.sea;
        const title = bookSpread?.querySelector("[data-book-title]");
        const note = bookSpread?.querySelector("[data-book-note]");
        const copy = bookSpread?.querySelector("[data-book-copy]");
        if (title) title.textContent = preset.title;
        if (note) note.textContent = preset.note;
        if (copy) copy.textContent = preset.copy;
      }, { signal }));

      let bookPhotoLayerIndex = 0, bookDecorLayerIndex = 0;
      const addBookPhoto = (source, label, targetPage = bookSpread?.querySelector(".book-page-right"), point = null) => {
        if (!targetPage || !source) return null;
        bookPhotoLayerIndex += 1;
        const layer = document.createElement("button");
        layer.type = "button";
        layer.className = "book-placed-photo";
        layer.dataset.bookDraggable = "";
        layer.dataset.bookRemovable = "";
        layer.dataset.bookDynamic = "";
        layer.dataset.bookElementType = "Foto";
        layer.dataset.bookObjectFrame = "soft";
        layer.dataset.bookObjectMask = "organic";
        const pageRect = targetPage.getBoundingClientRect();
        layer.style.left = `${point ? Math.max(8, Math.min(pageRect.width - 128, point.x)) : 20 + (bookPhotoLayerIndex % 3) * 22}px`;
        layer.style.top = `${point ? Math.max(8, Math.min(pageRect.height - 106, point.y)) : 86 + (bookPhotoLayerIndex % 3) * 18}px`;
        layer.style.setProperty("--book-photo-tilt", `${bookPhotoLayerIndex % 2 ? -3 : 3}deg`);
        layer.setAttribute("aria-label", `${label || "Reisefoto"} auswählen, verschieben oder skalieren`);
        const image = document.createElement("img");
        image.src = source;
        image.alt = label || "Hinzugefügtes Reisefoto";
        layer.append(image);
        targetPage.append(layer);
        makeBookElementDraggable(layer);
        selectBookElement(layer);
        const dynamicLayers = [...bookSpread.querySelectorAll("[data-book-dynamic]")];
        if (dynamicLayers.length > 12) dynamicLayers[0].remove();
        return layer;
      };
      const replaceOrAddBookPhoto = (source, label, targetPage = null, point = null) => {
        const selectedImage = selectedBookElement?.querySelector?.("img");
        if (selectedBookElement?.dataset.bookElementType === "Foto" && selectedImage) {
          selectedImage.src = source;
          selectedImage.alt = label || "Ausgetauschtes Reisefoto";
          selectedBookElement.hidden = false;
          selectBookElement(selectedBookElement);
          return selectedBookElement;
        }
        return addBookPhoto(source, label, targetPage || bookSpread?.querySelector(".book-page-right"), point);
      };
      const addBookDecor = (kind, label, targetPage = bookSpread?.querySelector(".book-page-left"), point = null) => {
        if (!targetPage) return null;
        bookDecorLayerIndex += 1;
        const layer = document.createElement("button");
        layer.type = "button";
        layer.className = "book-decor-layer";
        layer.dataset.bookDraggable = "";
        layer.dataset.bookRemovable = "";
        layer.dataset.bookDynamic = "";
        layer.dataset.bookElementType = "Deko";
        layer.dataset.bookDecorKind = kind;
        layer.dataset.bookScale = "1";
        const pageRect = targetPage.getBoundingClientRect();
        layer.style.left = `${point ? Math.max(8, Math.min(pageRect.width - 58, point.x)) : 28 + (bookDecorLayerIndex % 4) * 36}px`;
        layer.style.top = `${point ? Math.max(8, Math.min(pageRect.height - 58, point.y)) : 66 + (bookDecorLayerIndex % 3) * 34}px`;
        layer.textContent = stickerSymbols[kind] || "✦";
        layer.setAttribute("aria-label", `${label || "Dekoration"} auswählen, verschieben oder skalieren`);
        targetPage.append(layer);
        makeBookElementDraggable(layer);
        selectBookElement(layer);
        return layer;
      };
      let paletteDrag = null;
      const finishPaletteDrag = (event, button) => {
        if (!paletteDrag || paletteDrag.pointerId !== event.pointerId) return;
        const moved = paletteDrag.moved;
        const payload = paletteDrag.payload;
        const target = document.elementFromPoint(event.clientX, event.clientY);
        const page = target?.closest?.(".book-page");
        if (moved && page) {
          const rect = page.getBoundingClientRect();
          const point = { x: event.clientX - rect.left - 56, y: event.clientY - rect.top - 44 };
          const photoTarget = target.closest?.('[data-book-element-type="Foto"]');
          if (payload.type === "photo" && photoTarget?.querySelector("img")) {
            selectBookElement(photoTarget);
            replaceOrAddBookPhoto(payload.source, payload.label);
          } else if (payload.type === "photo") addBookPhoto(payload.source, payload.label, page, point);
          else addBookDecor(payload.kind, payload.label, page, point);
          button.dataset.bookSuppressClick = "true";
        }
        paletteDrag.ghost?.remove();
        bookSpread?.querySelectorAll(".book-page.is-drop-ready").forEach(item => item.classList.remove("is-drop-ready"));
        button.releasePointerCapture?.(event.pointerId);
        paletteDrag = null;
      };
      const bindPaletteDrag = (button, payloadFactory, tapAction) => {
        button.draggable = false;
        button.addEventListener("click", event => {
          if (button.dataset.bookSuppressClick === "true") { delete button.dataset.bookSuppressClick; event.preventDefault(); return; }
          tapAction();
        }, { signal });
        button.addEventListener("pointerdown", event => {
          if (event.button !== undefined && event.button !== 0) return;
          const payload = payloadFactory();
          paletteDrag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, payload, moved: false, ghost: null };
          button.setPointerCapture?.(event.pointerId);
        }, { signal });
        button.addEventListener("pointermove", event => {
          if (!paletteDrag || paletteDrag.pointerId !== event.pointerId) return;
          const distance = Math.hypot(event.clientX - paletteDrag.startX, event.clientY - paletteDrag.startY);
          if (!paletteDrag.moved && distance < 7) return;
          if (!paletteDrag.ghost) {
            const ghost = button.cloneNode(true);
            ghost.className = "book-palette-drag-ghost";
            ghost.removeAttribute("data-book-photo-add"); ghost.removeAttribute("data-book-decor-add");
            root.append(ghost);
            paletteDrag.ghost = ghost;
          }
          paletteDrag.moved = true;
          paletteDrag.ghost.style.translate = `${event.clientX - 48}px ${event.clientY - 38}px`;
          const targetPage = document.elementFromPoint(event.clientX, event.clientY)?.closest?.(".book-page");
          bookSpread?.querySelectorAll(".book-page").forEach(page => page.classList.toggle("is-drop-ready", page === targetPage));
          event.preventDefault();
        }, { signal });
        button.addEventListener("pointerup", event => finishPaletteDrag(event, button), { signal });
        button.addEventListener("pointercancel", event => finishPaletteDrag(event, button), { signal });
      };
      workbench.querySelectorAll("button[data-book-photo-add]").forEach(button => bindPaletteDrag(button, () => ({ type: "photo", source: button.dataset.bookPhotoAdd, label: button.dataset.bookPhotoLabel }), () => replaceOrAddBookPhoto(button.dataset.bookPhotoAdd, button.dataset.bookPhotoLabel)));
      workbench.querySelectorAll("button[data-book-decor-add]").forEach(button => bindPaletteDrag(button, () => ({ type: "decor", kind: button.dataset.bookDecorAdd, label: button.dataset.bookDecorLabel }), () => addBookDecor(button.dataset.bookDecorAdd, button.dataset.bookDecorLabel)));
      workbench.querySelector("[data-book-print]")?.addEventListener("click", event => {
        const open = event.currentTarget.getAttribute("aria-pressed") !== "true";
        event.currentTarget.setAttribute("aria-pressed", String(open));
        event.currentTarget.classList.toggle("is-open", open);
        event.currentTarget.innerHTML = open ? '<span>Druckkonfiguration</span><strong>28 × 28 cm · Layflat · matt · 48 Seiten&nbsp; ✓</strong>' : '<span>Als echtes Fotobuch</span><strong>Format, Papier &amp; Druck entdecken&nbsp; ↗</strong>';
      }, { signal });
      bookSpread?.querySelectorAll("[data-book-draggable]").forEach(makeBookElementDraggable);

      mountPhotoEditor(workbench);
    }

    function mountJourneySteps() {
      const orbit = root.querySelector(".journey-orbit");
      const output = root.querySelector("[data-journey-selected]");
      const summary = root.querySelector("[data-journey-summary]");
      const input = root.querySelector("[data-journey-input]");
      const action = root.querySelector("[data-journey-action]");
      const result = root.querySelector("[data-journey-result]");
      const count = root.querySelector("[data-journey-count]");
      const progress = root.querySelector("[data-journey-progress]");
      const steps = [...root.querySelectorAll("[data-journey-step]")];
      const details = Object.freeze([
        { angle: -42, beam: -135, title: "Der Wunsch gibt die Richtung vor.", summary: "Luvia beginnt mit Stimmung, Tempo und Bedürfnissen – noch bevor ein Reiseziel feststeht.", input: "ruhig · Wasser · Zeit", action: "Bedürfnisse & Reisestil", result: "eine gemeinsame Richtung" },
        { angle: 48, beam: -45, title: "Orte bekommen einen nachvollziehbaren Sinn.", summary: "Der Place Compass verbindet passende Orte mit Evidenz und erklärt, warum ein Vorschlag gerade zu euch passt.", input: "Richtung · Zeit · Gruppe", action: "Places & Evidenz", result: "passende echte Möglichkeiten" },
        { angle: 136, beam: 45, title: "Entscheidungen werden gemeinsam tragfähig.", summary: "Rollen, Wünsche und Zustimmung bleiben sichtbar; niemand verschwindet hinter einem schnellen Mehrheitsklick.", input: "Stimmen · Rollen · Grenzen", action: "gemeinsame Entscheidungen", result: "ein Tag, den alle mittragen" },
        { angle: 226, beam: 135, title: "Der Moment bleibt in seinem Zusammenhang.", summary: "Fotos, Wege, Stimmen und Mitwirkende wachsen zu einer Memory World, deren Herkunft erhalten bleibt.", input: "Bilder · Wege · Stimmen", action: "Momente & Herkunft", result: "eine lebendige Erinnerung" }
      ]);
      let needleAngle = details[0].angle;
      const activate = step => {
        const index = Number(step.dataset.journeyStep) || 0;
        const detail = details[index] || details[0];
        steps.forEach(item => {
          const active = item === step;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        const delta = ((detail.angle - needleAngle + 540) % 360) - 180;
        needleAngle += delta;
        orbit?.style.setProperty("--journey-step", String(index));
        orbit?.style.setProperty("--journey-needle-angle", `${needleAngle}deg`);
        orbit?.style.setProperty("--journey-focus-angle", `${detail.beam}deg`);
        applyCompassDirectionTone(orbit, step, detail.angle);
        if (orbit) orbit.dataset.journeyActive = String(index);
        if (output) output.textContent = detail.title;
        if (summary) summary.textContent = detail.summary;
        if (input) input.textContent = detail.input;
        if (action) action.textContent = detail.action;
        if (result) result.textContent = detail.result;
        if (count) count.textContent = `${String(index + 1).padStart(2, "0")} / ${String(details.length).padStart(2, "0")}`;
        if (progress) progress.style.width = `${((index + 1) / details.length) * 100}%`;
      };
      steps.forEach(step => bindKeyboardActivation(step, () => activate(step)));
      if (steps[0]) activate(steps[0]);
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
        syncReelMotion();
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
      const indexOutput = root.querySelector("[data-horizon-index]");
      const progress = root.querySelector("[data-horizon-progress]");
      const place = root.querySelector("[data-horizon-eyebrow]");
      const feeling = root.querySelector("[data-horizon-feeling]");
      const pace = root.querySelector("[data-horizon-pace]");
      const moment = root.querySelector("[data-horizon-moment]");
      const sequence = root.querySelector(".horizon-sequence");
      const save = root.querySelector("[data-horizon-save]");
      const saved = new Set();
      if (!slides.length || !dots) return;
      const show = index => {
        activeHorizon = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => {
          slide.classList.toggle("is-active", i === activeHorizon);
          slide.classList.toggle("is-previous", i === (activeHorizon - 1 + slides.length) % slides.length);
          slide.classList.toggle("is-next", i === (activeHorizon + 1) % slides.length);
        });
        dots.querySelectorAll("button").forEach((dot, i) => { dot.classList.toggle("is-active", i === activeHorizon); dot.setAttribute("aria-pressed", String(i === activeHorizon)); });
        const active = slides[activeHorizon];
        if (indexOutput) indexOutput.textContent = String(activeHorizon + 1).padStart(2, "0");
        if (progress) progress.style.width = `${((activeHorizon + 1) / slides.length) * 100}%`;
        if (place) place.textContent = active.dataset.horizonPlace || "Reisehorizont";
        if (feeling) feeling.textContent = active.dataset.horizonFeeling || "Ein neuer Horizont";
        if (pace) pace.textContent = active.dataset.horizonPace || "euer Rhythmus";
        if (moment) moment.textContent = active.dataset.horizonMoment || "euer Moment";
        if (sequence) sequence.setAttribute("aria-label", `Horizont ${activeHorizon + 1} von ${slides.length}`);
        if (save) {
          const isSaved = saved.has(activeHorizon);
          save.classList.toggle("is-saved", isSaved);
          save.setAttribute("aria-pressed", String(isSaved));
          save.innerHTML = isSaved ? "Horizont gemerkt <span>✓</span>" : "Diesen Horizont merken <span>＋</span>";
        }
      };
      slides.forEach((slide, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", slide.querySelector("figcaption strong")?.textContent || `Motiv ${index + 1}`);
        dot.style.setProperty("--horizon-thumb", `url(\"${slide.querySelector("img")?.getAttribute("src") || ""}\")`);
        dot.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span>`;
        dot.addEventListener("click", () => { show(index); restartHorizonCycle(); }, { signal });
        dots.append(dot);
      });
      root.querySelector("[data-horizon-prev]")?.addEventListener("click", () => { show(activeHorizon - 1); restartHorizonCycle(); }, { signal });
      root.querySelector("[data-horizon-next]")?.addEventListener("click", () => { show(activeHorizon + 1); restartHorizonCycle(); }, { signal });
      save?.addEventListener("click", () => {
        if (saved.has(activeHorizon)) saved.delete(activeHorizon);
        else saved.add(activeHorizon);
        show(activeHorizon);
      }, { signal });
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
        const compactMap = window.matchMedia?.("(max-width: 760px)")?.matches;
        livingMap = new window.maplibregl.Map({ container, style: "https://tiles.openfreemap.org/styles/liberty", center: PLACES[0].point, zoom: compactMap ? 11.8 : 12.4, bearing: compactMap ? 0 : -7, pitch: compactMap ? 0 : 24, interactive: true, attributionControl: true, fadeDuration: noMotion() || compactMap ? 0 : 450 });
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
