// Mapping Memory, Mapping Meals · Deep Map v2
// A static, self-contained rebuild of the archive map for the project website.
// No server, no build step: MapLibre GL (bundled in /vendor) + plain modules.

import { L as LABELS, LANGS, HELP, SHORTCUTS } from "./map-i18n.js";
import { icon, warli } from "./map-icons.js";
import * as N from "./map-narrate.js";

/* ============================================================== helpers */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const PARAMS = new URLSearchParams(location.search);
const EMBED = PARAMS.has("embed");
const mqMobile = matchMedia("(max-width: 760px)");
const isMobile = () => mqMobile.matches;

function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "text") el.textContent = v;
    else if (k === "style" && typeof v === "object") for (const [sk, sv] of Object.entries(v)) el.style.setProperty(sk, sv);
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else if (k === "dataset") Object.assign(el.dataset, v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid === null || kid === undefined || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return el;
}
const store = {
  get(k, d = null) { try { const v = localStorage.getItem("mmm-" + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem("mmm-" + k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};
const t = (k) => (LABELS[S.lang] && LABELS[S.lang][k]) || LABELS.en[k] || k;
const tl = (k, tag = "span") => h(tag, { class: "notranslate", translate: "no", "data-l": k }, t(k));
const reduceMotion = () => S.reduce || matchMedia("(prefers-reduced-motion: reduce)").matches;
const debounce = (fn, ms) => { let id; return (...a) => { clearTimeout(id); id = setTimeout(() => fn(...a), ms); }; };

let toastTimer;
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 2600);
}
async function copy(text, msg) {
  try { await navigator.clipboard.writeText(text); toast(msg || t("copied")); }
  catch {
    const ta = h("textarea", { style: { position: "fixed", opacity: "0" } }, text);
    document.body.append(ta); ta.select();
    try { document.execCommand("copy"); toast(msg || t("copied")); } catch { toast(text); }
    ta.remove();
  }
}

/* ============================================================== constants */
const VIEW_INDIA = { center: [84.6, 22.8], zoom: 3.4, pitch: 0, bearing: 0 };
const VIEW_WB = { center: [88.05, 24.55], zoom: 6.35, pitch: 48, bearing: 6 };

const TRIBE_COLORS = {
  Toto: "#E07A3C", Santal: "#D2502E", Oraon: "#4E9A62", Rajbanshi: "#2F98A6", Lodha: "#B5853F",
  "Kheria Sabar": "#A8553A", Mech: "#B0558A", Garo: "#4A8DB3", Rabha: "#8AA83E", Limbu: "#C27D3E",
  Lepcha: "#4F9A7F", Dukpa: "#6878BA", Bhutia: "#7B8ED6", Sherpa: "#8A7AD0", Tamang: "#5FA0C6",
  "Gorkha / Nepali": "#C49A2E", Munda: "#A0683D", Bhumij: "#7E9B3A", Birhor: "#D06A45",
  "Adivasi (multi-tribe)": "#B09A66", "Pan-West Bengal": "#9C8A70",
};
const tribeColor = (t) => TRIBE_COLORS[t] || "#C9A26A";
const entryColor = (e) => tribeColor(e.tribes[0]);

const TRACKS = [
  { id: "sohrai", name: "Sohrai · Santali harvest song", src: "map-audio-sohrai.mp3", credit: "Traditional Santali Sohrai festival song, via archive.org" },
  { id: "resham_firiri", name: "Resham Firiri · Nepali folk", src: "map-audio-resham_firiri.mp3", credit: "Traditional Nepali folk song, via archive.org" },
  { id: "baha", name: "Baha · Santali spring song", src: "map-audio-baha.mp3", credit: "Traditional Santali Baha festival song, via archive.org" },
  { id: "tamang_selo", name: "Tamang Selo · damphu rhythm", src: "map-audio-tamang_selo.mp3", credit: "Traditional Tamang Selo with damphu, via archive.org" },
  { id: "lagre", name: "Lagre · Santali dance song", src: "map-audio-lagre.mp3", credit: "Traditional Santali Lagre dance song, via archive.org" },
  { id: "malsiri", name: "Malsiri · Himalayan melody", src: "map-audio-malsiri.mp3", credit: "Traditional Malshree (Malsiri) melody, via archive.org" },
  { id: "wb_folk_1", name: "Junglemahal folk", src: "map-audio-wb_folk_1.mp3", credit: "IGRMS West Bengal tour, CC BY-NC 4.0" },
  { id: "mausam", name: "Mausam · Himalayan folk", src: "map-audio-mausam.mp3", credit: "Kontraa, Nepalese folk, Jamendo, CC BY-ND" },
  { id: "tribal_drums_1", name: "Himalayan drums", src: "map-audio-tribal_drums_1.mp3", credit: "Tribal Trance, CC0 public domain" },
  { id: "suruwat", name: "Suruwat · Nepali folk", src: "map-audio-suruwat.mp3", credit: "Kontraa, Nepalese folk, Jamendo, CC BY-SA" },
];
function trackFor(tribe = "") {
  if (/santal|munda|bhumij|lodha|kheria|birhor|adivasi/i.test(tribe)) return 0;
  if (/toto|lepcha|bhutia|sherpa|tamang|limbu|dukpa|gorkha|nepali/i.test(tribe)) return 1;
  if (/rajbanshi|mech|rabha|garo|oraon/i.test(tribe)) return 6;
  return 4;
}

const LENSES = [
  { id: "pvtg", key: "pvtgOnly", test: (e) => e.pvtg, icon: "star" },
  { id: "origin", key: "hasOrigin", test: (e) => !!e.origin, icon: "spiral" },
  { id: "sacred", key: "hasSacred", test: (e) => N.has(e.sacred_foods), icon: "altar" },
  { id: "medicine", key: "hasMedicine", test: (e) => N.has(e.medicinal_value), icon: "herb" },
  { id: "risk", key: "atRisk", test: (e) => N.has(e.lost_traditions), icon: "broken" },
];
const GROUP_ICON = {
  "Ferments & Beverages": "pot", "Pithas, Breads & Sweets": "pitha", "Grains & Rice": "grain", "Wild Tubers & Roots": "root",
  "Wild Fungi": "mushroom", "Forest Produce (NTFP)": "ecology", "Forest Greens & Flowers": "leaf", "Fish & Waterfoods": "fish",
  "Insects & Rare Proteins": "ant", "Meat & Forest Protein": "flame", "Wild Fruits": "fruit", "Food as Medicine": "herb",
  "Techniques & Knowledge": "weave", "Ritual & Festive": "altar", "Food Systems & Memory": "scroll", "Traditional Dishes": "bowl",
};
const LAYER_ICONS = ["ecology", "community", "grain", "pot", "sun", "drum", "scroll", "broken", "altar", "herb", "weave", "pin", "eye", "spiral"];

/* ============================================================== state */
const S = {
  data: null, entries: [], byId: {}, trails: [], layers: [],
  f: { tribes: new Set(), districts: new Set(), groups: new Set(), lenses: new Set(), trail: null },
  filtered: [], places: [], placeByKey: new Map(),
  lang: "en", theme: store.get("theme", "dusk"), basemap: store.get("basemap", null),
  terrain: store.get("terrain", true), boundaries: store.get("boundaries", true),
  scale: Math.max(1, store.get("scale", 1)), reduce: store.get("reduce", false),
  view: null, list: [], indexSort: "az", openSecs: new Set(store.get("secs", ["communities", "categories"])),
  markersOn: false, exploreOpen: false, districtGeo: null,
};
S.basemap = S.basemap || (S.theme === "daylight" ? "daylight" : "dusk");

/* ============================================================== language */
function getCookie(name) {
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}
function clearGT() {
  const exp = "expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  document.cookie = `googtrans=; ${exp}`;
  document.cookie = `googtrans=; ${exp}; domain=${location.hostname}`;
  document.cookie = `googtrans=; ${exp}; domain=.${location.hostname}`;
}
function loadGT(lang) {
  if (window.google && window.google.translate && window.google.translate.TranslateElement) {
    const combo = $(".goog-te-combo");
    if (combo) { combo.value = lang; combo.dispatchEvent(new Event("change")); }
    return;
  }
  if ($("#gtScript")) return;
  window.mmmGTInit = () => {
    try {
      new window.google.translate.TranslateElement({ pageLanguage: "en", includedLanguages: "bn,hi", autoDisplay: false }, "google_translate_element");
    } catch (err) { console.warn("Translation widget unavailable", err); }
  };
  document.head.append(h("script", { id: "gtScript", src: "https://translate.google.com/translate_a/element.js?cb=mmmGTInit", async: true }));
}
function initialLang() {
  const saved = store.get("lang", null);
  const ck = getCookie("googtrans") || "";
  const fromCookie = /\/(bn|hi)$/.exec(ck)?.[1];
  return saved || fromCookie || "en";
}
function setLang(lang, { initial = false } = {}) {
  const prev = S.lang;
  S.lang = lang;
  store.set("lang", lang);
  document.documentElement.lang = lang;
  applyLabels();
  if (!initial) { renderExplore(); renderSheet(); }
  if (lang === "en") {
    if (getCookie("googtrans") && !initial && prev !== "en") { clearGT(); location.reload(); }
    else clearGT();
    return;
  }
  document.cookie = `googtrans=/en/${lang}; path=/`;
  loadGT(lang);
}
function applyLabels() {
  $$("[data-l]").forEach((el) => { el.textContent = t(el.dataset.l); });
  $("#search").placeholder = t("searchPh");
  for (const seg of [$("#langSeg"), $("#introLang")]) {
    seg.replaceChildren(...LANGS.map((l) => h("button", { "aria-pressed": String(S.lang === l.id), lang: l.id, onclick: () => setLang(l.id), title: l.name }, seg.id === "introLang" ? l.name : l.short)));
  }
  const titles = { btnExplore: "explore", btnSnapshot: "snapshot", btnGuestbook: "guestbook", btnIndex: "index", btnGuide: "guide", btnAbout: "about", btnSettings: "settings", ctlIn: "zoomIn", ctlOut: "zoomOut", ctlNorth: "north", ctlLayers: "basemap", ctlHome: "home", tourClose: "close" };
  for (const [id, k] of Object.entries(titles)) { const el = $("#" + id); if (el) { el.title = t(k); el.setAttribute("aria-label", t(k)); } }
  $("#ctl3d").title = S.terrain ? t("view2d") : t("view3d");
}

/* ============================================================== data */
function placeKey(e) { return `${(+e.lat).toFixed(4)},${(+e.lng).toFixed(4)}`; }
function majority(arr) {
  const m = new Map(); let best = null, bn = 0;
  for (const x of arr) { const n = (m.get(x) || 0) + 1; m.set(x, n); if (n > bn) { bn = n; best = x; } }
  return best;
}
function buildPlaces(entries) {
  const groups = new Map();
  for (const e of entries) {
    if (e.lat == null || e.lng == null) continue;
    const k = placeKey(e);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(e);
  }
  const out = [];
  for (const [key, list] of groups) {
    const first = list[0];
    const hq = list.every((e) => /hq/i.test(e.geo_note));
    const seg = majority(list.map((e) => (e.block_village || "").split(/[,;(—]/)[0].trim()));
    const dist = majority(list.map((e) => e.district)).replace(/\s*\/\s*/g, " · ").replace(/\s*\(.*?\)/, "");
    const title = hq && seg && seg.length <= 28 ? seg : dist;
    const tribe = majority(list.flatMap((e) => e.tribes));
    out.push({
      key, lat: +first.lat, lng: +first.lng, entries: list, title, district: dist,
      note: hq ? "hq" : "approx", tribe, color: tribeColor(tribe),
      icon: majority(list.map((e) => e.icon)) || "bowl",
    });
  }
  return out.sort((a, b) => b.entries.length - a.entries.length);
}

function matches(e, skip = "") {
  const f = S.f;
  if (skip !== "trail" && f.trail && !f.trail.ids.includes(e.entry_id)) return false;
  if (skip !== "tribes" && f.tribes.size && !e.tribes.some((x) => f.tribes.has(x))) return false;
  if (skip !== "districts" && f.districts.size) {
    const ok = e.districts.some((d) => f.districts.has(d)) || (f.districts.has("__region") && !e.districts.length);
    if (!ok) return false;
  }
  if (skip !== "groups" && f.groups.size && !f.groups.has(e.group)) return false;
  if (skip !== "lenses") for (const id of f.lenses) { const L = LENSES.find((x) => x.id === id); if (L && !L.test(e)) return false; }
  return true;
}
function filterCount() {
  const f = S.f;
  return f.tribes.size + f.districts.size + f.groups.size + f.lenses.size + (f.trail ? 1 : 0);
}

function applyFilters({ fit = false } = {}) {
  S.filtered = S.entries.filter((e) => matches(e));
  S.places = buildPlaces(S.filtered);
  S.placeByKey = new Map(S.places.map((p) => [p.key, p]));
  for (const m of markers.values()) m.marker.remove();
  markers.clear();
  updateMapData();
  renderExplore();
  renderActiveFilters();
  renderTrailBanner();
  const n = filterCount();
  $("#filterBadge").hidden = !n;
  $("#filterBadge").textContent = n;
  if (S.view && (S.view.type === "index" || S.view.type === "place")) {
    if (S.view.type === "place" && !S.placeByKey.has(S.view.key)) closeSheet();
    else renderSheet();
  }
  if (fit) fitToFiltered();
}

/* ============================================================== map */
let map;
const TILE = {
  dusk: ["a", "b", "c", "d"].map((s) => `https://${s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png`),
  daylight: ["a", "b", "c", "d"].map((s) => `https://${s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png`),
  satLabels: ["a", "b", "c", "d"].map((s) => `https://${s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png`),
  sat: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
  dem: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
};
const LOOK = {
  dusk: { bg: "#120b07", tint: "#3a1a06", tintOp: 0.26, mask: "#0b0604", maskOp: 0.5, line: "#FFB877", glow: "#E8923A", dline: "#D9B48A", fill: "#E8923A", india: "#efe3d0", hsShadow: "#0b0703", hsHigh: "#5a4128", hsAccent: "#241a0e", sky: "#1a0f0a", horizon: "#6b2e10", fog: "#2a170c" },
  daylight: { bg: "#efe6d4", tint: "#f3dfb6", tintOp: 0.16, mask: "#f4ecdc", maskOp: 0.55, line: "#C1440E", glow: "#E8923A", dline: "#8a5a34", fill: "#C1440E", india: "#6B5E52", hsShadow: "#6b5235", hsHigh: "#fffaf0", hsAccent: "#8a6a45", sky: "#cfe0ea", horizon: "#f4dcc0", fog: "#efe2cc" },
  satellite: { bg: "#0b0906", tint: "#1a0f0a", tintOp: 0.12, mask: "#0b0604", maskOp: 0.42, line: "#FFD08A", glow: "#E8923A", dline: "#F0D9B5", fill: "#E8923A", india: "#f6eedf", hsShadow: "#000", hsHigh: "#fff", hsAccent: "#000", sky: "#0e1622", horizon: "#3b4a5c", fog: "#1b2430" },
};
const look = () => LOOK[S.basemap] || LOOK.dusk;
const WORLD = { type: "FeatureCollection", features: [{ type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]]] } }] };

function skyFor(lk) {
  return {
    "sky-color": lk.sky, "sky-horizon-blend": 0.55, "horizon-color": lk.horizon, "horizon-fog-blend": 0.7,
    "fog-color": lk.fog, "fog-ground-blend": 0.9,
    "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 5, 1, 7, 0],
  };
}

function buildStyle() {
  const lk = look();
  const vis = (b) => ({ visibility: S.basemap === b ? "visible" : "none" });
  return {
    version: 8,
    projection: { type: ["interpolate", ["linear"], ["zoom"], 4.6, "vertical-perspective", 5.8, "mercator"] },
    sky: skyFor(lk),
    sources: {
      dusk: { type: "raster", tiles: TILE.dusk, tileSize: 256, maxzoom: 19, attribution: "© OpenStreetMap contributors © CARTO" },
      daylight: { type: "raster", tiles: TILE.daylight, tileSize: 256, maxzoom: 19, attribution: "© OpenStreetMap contributors © CARTO" },
      sat: { type: "raster", tiles: TILE.sat, tileSize: 256, maxzoom: 18, attribution: "Imagery © Esri, Maxar, Earthstar Geographics" },
      satLabels: { type: "raster", tiles: TILE.satLabels, tileSize: 256, maxzoom: 19 },
      dem: { type: "raster-dem", tiles: TILE.dem, tileSize: 256, maxzoom: 12, encoding: "terrarium", attribution: "Terrain: Mapzen / AWS Open Data" },
      demHs: { type: "raster-dem", tiles: TILE.dem, tileSize: 256, maxzoom: 12, encoding: "terrarium" },
      world: { type: "geojson", data: WORLD },
      india: { type: "geojson", data: "map-india-states.geojson" },
      wb: { type: "geojson", data: "map-wb-outline.geojson" },
      mask: { type: "geojson", data: "map-wb-mask.geojson" },
      districts: { type: "geojson", data: "map-wb-districts.geojson", promoteId: "district" },
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": lk.bg } },
      { id: "base-dusk", type: "raster", source: "dusk", layout: vis("dusk"), paint: { "raster-brightness-max": 0.92, "raster-contrast": 0.08, "raster-fade-duration": 200 } },
      { id: "base-daylight", type: "raster", source: "daylight", layout: vis("daylight"), paint: { "raster-saturation": -0.28, "raster-contrast": -0.04, "raster-fade-duration": 200 } },
      { id: "base-sat", type: "raster", source: "sat", layout: vis("satellite"), paint: { "raster-saturation": -0.1, "raster-brightness-max": 0.86, "raster-fade-duration": 200 } },
      { id: "hillshade", type: "hillshade", source: "demHs", paint: { "hillshade-exaggeration": S.basemap === "satellite" ? 0.08 : 0.32, "hillshade-shadow-color": lk.hsShadow, "hillshade-highlight-color": lk.hsHigh, "hillshade-accent-color": lk.hsAccent } },
      { id: "tint", type: "fill", source: "world", paint: { "fill-color": lk.tint, "fill-opacity": lk.tintOp, "fill-antialias": false } },
      { id: "base-sat-labels", type: "raster", source: "satLabels", layout: vis("satellite"), paint: { "raster-opacity": 0.85 } },
      { id: "mask", type: "fill", source: "mask", paint: { "fill-color": lk.mask, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 4, 0, 5.5, lk.maskOp, 9, lk.maskOp * 0.6, 11, 0.12], "fill-antialias": false } },
      { id: "india-line", type: "line", source: "india", paint: { "line-color": lk.india, "line-width": 0.7, "line-opacity": ["interpolate", ["linear"], ["zoom"], 3, 0.35, 7, 0.2] } },
      { id: "district-fill", type: "fill", source: "districts", layout: { visibility: S.boundaries ? "visible" : "none" }, paint: {
        "fill-color": lk.fill,
        "fill-opacity": ["case", ["boolean", ["feature-state", "sel"], false], 0.22, ["interpolate", ["linear"], ["coalesce", ["feature-state", "n"], 0], 0, 0, 1, 0.05, 30, 0.14]],
      } },
      { id: "district-line", type: "line", source: "districts", minzoom: 5.4, layout: { visibility: S.boundaries ? "visible" : "none" }, paint: { "line-color": lk.dline, "line-width": 0.8, "line-opacity": 0.42, "line-dasharray": [3, 2] } },
      { id: "district-sel", type: "line", source: "districts", layout: { visibility: S.boundaries ? "visible" : "none" }, paint: { "line-color": lk.line, "line-width": 2.2, "line-opacity": ["case", ["boolean", ["feature-state", "sel"], false], 0.95, 0] } },
      { id: "wb-glow", type: "line", source: "wb", paint: { "line-color": lk.glow, "line-width": 9, "line-blur": 7, "line-opacity": 0.42 } },
      { id: "wb-line", type: "line", source: "wb", paint: { "line-color": lk.line, "line-width": 1.7, "line-opacity": 0.95 } },
    ],
    terrain: S.terrain ? { source: "dem", exaggeration: 1.55 } : undefined,
  };
}

let tileErrors = 0;
function initMap() {
  const start = EMBED || !showIntroNow() ? VIEW_WB : VIEW_INDIA;
  map = new maplibregl.Map({
    container: "map",
    style: buildStyle(),
    center: start.center, zoom: start.zoom, pitch: S.terrain ? start.pitch : 0, bearing: start.bearing,
    maxPitch: 78, minZoom: 2.2, attributionControl: false, cooperativeGestures: EMBED,
    fadeDuration: 200, dragRotate: true, touchPitch: true,
  });
  map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
  map.on("error", (e) => {
    const msg = String(e?.error?.message || e?.error || "");
    if (PARAMS.has("debug")) console.warn("[map error]", msg);
    if (/tile|Failed to fetch|NetworkError|load|AJAXError|terrarium|basemaps|arcgis/i.test(msg) || e?.tile || e?.sourceId) {
      tileErrors++; // tile hiccups are retried by MapLibre; no pop-up for visitors
      return;
    }
    console.warn("Map:", msg);
  });
  // Boot as soon as the style is parsed; tiles keep streaming in behind the UI.
  map.once("style.load", () => {
    updateMapData();
    addDistrictLabels();
    ready("map");
  });
  map.on("sourcedata", (ev) => { if (ev.sourceId === "districts" && ev.isSourceLoaded) updateMapData(); });
  let pending = false;
  map.on("zoom", () => {
    if (pending) return;
    pending = true;
    setTimeout(() => { pending = false; regroup(); }, 120);
  });
  map.on("moveend", () => regroup(true));
  map.on("zoom", () => {
    const z = map.getZoom();
    document.body.classList.toggle("show-labels", z >= 10.2);
    document.body.classList.toggle("z7", z >= 6.9);
    document.body.classList.toggle("z85", z >= 8.4);
  });
  map.on("rotate", () => { $("#compass").style.transform = `rotate(${-map.getBearing()}deg)`; });
}

function setLayerVis(id, on) { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", on ? "visible" : "none"); }
function setBasemap(b) {
  S.basemap = b;
  store.set("basemap", b);
  if (!map || !map.getLayer("bg")) return;
  const lk = look();
  setLayerVis("base-dusk", b === "dusk");
  setLayerVis("base-daylight", b === "daylight");
  setLayerVis("base-sat", b === "satellite");
  setLayerVis("base-sat-labels", b === "satellite");
  map.setPaintProperty("bg", "background-color", lk.bg);
  map.setPaintProperty("tint", "fill-color", lk.tint);
  map.setPaintProperty("tint", "fill-opacity", lk.tintOp);
  map.setPaintProperty("mask", "fill-color", lk.mask);
  map.setPaintProperty("mask", "fill-opacity", ["interpolate", ["linear"], ["zoom"], 4, 0, 5.5, lk.maskOp, 9, lk.maskOp * 0.6, 11, 0.12]);
  map.setPaintProperty("india-line", "line-color", lk.india);
  map.setPaintProperty("district-fill", "fill-color", lk.fill);
  map.setPaintProperty("district-line", "line-color", lk.dline);
  map.setPaintProperty("district-sel", "line-color", lk.line);
  map.setPaintProperty("wb-line", "line-color", lk.line);
  map.setPaintProperty("hillshade", "hillshade-shadow-color", lk.hsShadow);
  map.setPaintProperty("hillshade", "hillshade-highlight-color", lk.hsHigh);
  map.setPaintProperty("hillshade", "hillshade-accent-color", lk.hsAccent);
  map.setPaintProperty("hillshade", "hillshade-exaggeration", b === "satellite" ? 0.08 : 0.32);
  try { map.setSky(skyFor(lk)); } catch { /* sky unsupported */ }
  renderLayerPop();
}
function setTheme(theme) {
  S.theme = theme;
  store.set("theme", theme);
  document.body.dataset.theme = theme;
  $('meta[name="theme-color"]').content = theme === "daylight" ? "#faf6ef" : "#1a0f0a";
  if (S.basemap !== "satellite") setBasemap(theme === "daylight" ? "daylight" : "dusk");
}
function setTerrain(on) {
  S.terrain = on;
  store.set("terrain", on);
  $("#ctl3d").setAttribute("aria-pressed", String(on));
  $("#ctl3d").title = on ? t("view2d") : t("view3d");
  if (!map) return;
  try { map.setTerrain(on ? { source: "dem", exaggeration: 1.55 } : null); } catch (err) { console.warn(err); }
  map.easeTo({ pitch: on ? Math.max(map.getPitch(), 48) : 0, duration: reduceMotion() ? 0 : 800 });
}
function setBoundaries(on) {
  S.boundaries = on;
  store.set("boundaries", on);
  ["district-fill", "district-line", "district-sel"].forEach((id) => setLayerVis(id, on));
  document.body.classList.toggle("no-bounds", !on);
  renderLayerPop();
}

function updateMapData() {
  if (!map || !map.getSource("districts")) return;
  regroup(true);
  // district density + selection
  const counts = {};
  for (const e of S.filtered) for (const d of e.districts) counts[d] = (counts[d] || 0) + 1;
  for (const f of S.districtGeo?.features || []) {
    const id = f.properties.district;
    try { map.setFeatureState({ source: "districts", id }, { n: counts[id] || 0, sel: S.f.districts.has(id) }); } catch { /* source not ready */ }
  }
  $$(".dist-label").forEach((el) => el.classList.toggle("has", !!counts[el.dataset.d]));
}

function addDistrictLabels() {
  fetch("map-wb-district-points.geojson").then((r) => r.json()).then((g) => {
    for (const f of g.features) {
      const name = f.properties.district;
      const el = h("div", { class: "dist-wrap", "aria-hidden": "true" }, h("span", { class: "dist-label", "data-d": name }, name));
      new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat(f.geometry.coordinates).addTo(map);
    }
    updateMapData();
  }).catch(() => {});
}

/* ---------- HTML markers with screen-space grouping
   Places that sit close together on screen are gathered into one medallion.
   Grouping is computed from projected pixel positions, so it behaves the same
   on the flat map, the tilted 3D terrain and the globe. */
const markers = new Map();
let lastGroupZoom = null;
function selectedKeys() {
  const v = S.view;
  if (!v) return new Set();
  if (v.type === "place") return new Set([v.key]);
  if (v.type === "entry") { const e = S.byId[v.id]; return e && e.lat != null ? new Set([placeKey(e)]) : new Set(); }
  return new Set();
}
function syncMarkers() { regroup(true); }

function regroup(force = false) {
  if (!map) return;
  const want = new Map();
  if (S.markersOn && S.places.length) {
    const z = map.getZoom();
    if (!force && lastGroupZoom !== null && Math.abs(z - lastGroupZoom) < 0.1) { markSelection(); return; }
    lastGroupZoom = z;
    const R = z >= 11 ? 38 : z >= 9.2 ? 50 : z >= 8 ? 58 : 70;
    // agglomerative: keep merging the closest pair of groups until all are R apart
    // the selected place always keeps its own medallion
    const sel = selectedKeys();
    // an entry opened from search may sit outside the current filters: still show it
    const places = S.places.slice();
    for (const k of sel) if (!S.placeByKey.has(k)) {
      const v = S.view;
      const src = v && v.type === "entry" ? [S.byId[v.id]] : S.entries.filter((e) => e.lat != null && placeKey(e) === k);
      const extra = buildPlaces(src)[0];
      if (extra) places.push(extra);
    }
    const groups = places.map((p) => { const xy = map.project([p.lng, p.lat]); return { x: xy.x, y: xy.y, w: p.entries.length, members: [p], fixed: sel.has(p.key) }; });
    while (R && groups.length > 1) {
      let best = null, bd = R;
      for (let a = 0; a < groups.length; a++) for (let b = a + 1; b < groups.length; b++) {
        if (groups[a].fixed || groups[b].fixed) continue;
        const d = Math.hypot(groups[a].x - groups[b].x, groups[a].y - groups[b].y);
        if (d < bd) { bd = d; best = [a, b]; }
      }
      if (!best) break;
      const [a, b] = best, A = groups[a], B = groups[b], w = A.w + B.w;
      groups[a] = { x: (A.x * A.w + B.x * B.w) / w, y: (A.y * A.w + B.y * B.w) / w, w, members: A.members.concat(B.members) };
      groups.splice(b, 1);
    }
    for (const g of groups) {
      const id = g.members.length === 1 ? "p" + g.members[0].key : "g" + g.members.map((m) => m.key).sort().join("|");
      want.set(id, g);
    }
  }
  let i = 0;
  for (const [id, g] of want) {
    if (markers.has(id)) continue;
    const single = g.members.length === 1;
    let lng = 0, lat = 0, n = 0;
    for (const m of g.members) { const w = m.entries.length; lng += m.lng * w; lat += m.lat * w; n += w; }
    const el = single ? placeEl(g.members[0], i++) : groupEl(g.members, n);
    const marker = new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat(single ? [g.members[0].lng, g.members[0].lat] : [lng / n, lat / n]).addTo(map);
    markers.set(id, { el, marker, keys: g.members.map((m) => m.key) });
  }
  for (const [id, m] of markers) if (!want.has(id)) { m.marker.remove(); markers.delete(id); }
  markSelection();
}
function markSelection() {
  const sel = selectedKeys();
  for (const m of markers.values()) m.el.classList.toggle("sel", m.keys.length === 1 && sel.has(m.keys[0]));
}
function placeEl(p, i) {
  const n = p.entries.length;
  const s = Math.round(40 + Math.min(n, 12) * 1.7);
  return h("button", {
    class: "mk", type: "button", style: { "--c": p.color, "--s": s + "px", "--d": Math.min(i * 40, 700) + "ms" },
    "aria-label": `${p.title}: ${n} ${t("placeCount")}`,
    onclick: (ev) => { ev.stopPropagation(); openPlace(p.key); },
  },
  h("span", { class: "mk-ring" }, icon(p.icon, 22)),
  h("span", { class: "mk-count" }, String(n)),
  h("span", { class: "mk-label" }, p.title));
}
function groupEl(members, n) {
  const s = Math.round(50 + Math.min(n, 40) * 0.55);
  return h("button", {
    class: "mk mk-cluster", type: "button", style: { "--s": s + "px", "--c": "#D4A843" },
    "aria-label": `${n} food traditions in ${members.length} places. Zoom in`,
    onclick: (ev) => { ev.stopPropagation(); fitBoundsOf(members.map((m) => [m.lng, m.lat]), Math.max(11.5, map.getZoom() + 1.2)); },
  },
  h("span", { class: "mk-ring" }, h("span", { class: "mk-num" }, String(n))),
  h("span", { class: "mk-label" }, `${members.length} ${t("places")}`));
}

function padding() {
  const desk = !isMobile();
  const sheet = !$("#sheet").hidden;
  const left = (desk && S.exploreOpen ? parseInt(getComputedStyle(document.documentElement).getPropertyValue("--explore-w")) + 24 : 0) + 30;
  const right = (desk && sheet ? $("#sheet").offsetWidth + 24 : 0) + 30;
  const bottom = !desk && (sheet || S.exploreOpen) ? window.innerHeight * 0.55 : 40;
  return { top: isMobile() ? 130 : 90, bottom, left, right };
}
function flyTo(lng, lat, opts = {}) {
  map.flyTo({
    center: [lng, lat], zoom: opts.zoom ?? Math.max(map.getZoom(), 9.2), pitch: S.terrain ? opts.pitch ?? 58 : 0,
    bearing: opts.bearing ?? -10, padding: opts.padding || padding(), duration: reduceMotion() ? 0 : opts.duration ?? 2000, essential: true, curve: 1.3,
  });
}
// West Bengal framed for the current screen (phones need a wider view)
const WB_BOUNDS = [[85.82, 21.5], [89.9, 27.25]];
function homeCamera() {
  if (!map) return { ...VIEW_WB, pitch: S.terrain ? VIEW_WB.pitch : 0 };
  if (isMobile()) {
    const cam = map.cameraForBounds(WB_BOUNDS, { padding: { top: 120, bottom: 70, left: 16, right: 16 } });
    return cam ? { center: cam.center, zoom: cam.zoom, bearing: 0, pitch: S.terrain ? 30 : 0 } : { ...VIEW_WB, zoom: 5.4 };
  }
  // desktop: the tuned view, pulled back on short or narrow windows
  const pad = { top: 70, bottom: 30, left: 30, right: 30 };
  const cam = map.cameraForBounds(WB_BOUNDS, { padding: pad });
  if (!cam || cam.zoom + 0.3 >= VIEW_WB.zoom) return { ...VIEW_WB, pitch: S.terrain ? VIEW_WB.pitch : 0 };
  return { center: [cam.center.lng + 0.15, cam.center.lat + 0.1], zoom: cam.zoom + 0.12, bearing: 4, pitch: S.terrain ? 38 : 0 };
}
function goHome() {
  map.flyTo({ ...homeCamera(), padding: isMobile() ? { top: 0, bottom: 0, left: 0, right: 0 } : padding(), duration: reduceMotion() ? 0 : 1800, essential: true });
}
function fitBoundsOf(points, maxZoom = 9.2) {
  if (!points.length || !map) return;
  const b = new maplibregl.LngLatBounds();
  points.forEach((p) => b.extend(p));
  const cam = map.cameraForBounds(b, { padding: padding(), maxZoom });
  if (!cam) return;
  map.flyTo({ ...cam, pitch: S.terrain ? 45 : 0, bearing: 0, duration: reduceMotion() ? 0 : 1500, essential: true });
}
function fitToFiltered() {
  const pts = S.places.map((p) => [p.lng, p.lat]);
  if (pts.length === 1) flyTo(pts[0][0], pts[0][1], { zoom: 9 });
  else fitBoundsOf(pts);
}
function fitDistrict(name) {
  const f = S.districtGeo?.features.find((x) => x.properties.district === name);
  if (!f) return;
  const pts = (f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates).flat(2);
  fitBoundsOf(pts, 9);
}

/* ---------- slow orbit used during talking tours
   One long linear easeTo: MapLibre cancels it by itself as soon as the
   visitor drags, scrolls or pinches, and it fires a single moveend. */
const orbit = { timer: 0, on: false, userTouched: false };
function startOrbit(delay = 3400) {
  stopOrbit();
  if (reduceMotion() || !S.terrain) return;
  orbit.on = true;
  orbit.timer = setTimeout(() => {
    if (!orbit.on) return;
    map.easeTo({ bearing: map.getBearing() + 360, duration: 360000, easing: (x) => x, essential: true });
  }, delay);
}
function stopOrbit() {
  if (orbit.on && map && map.isMoving()) map.stop();
  orbit.on = false;
  clearTimeout(orbit.timer);
}

/* ============================================================== explore panel */
function facetCounts(key, valuesOf) {
  const m = new Map();
  for (const e of S.entries) if (matches(e, key)) for (const v of valuesOf(e)) m.set(v, (m.get(v) || 0) + 1);
  return m;
}
function section(id, iconName, labelKey, count, body) {
  const d = h("details", { class: "sec", "data-sec": id },
    h("summary", {}, icon(iconName, 18), tl(labelKey), count != null ? h("span", { class: "sec-count" }, count) : null, icon("chev-d", 16, "chev")),
    h("div", { class: "sec-body" }, body));
  if (S.openSecs.has(id)) d.open = true;
  d.addEventListener("toggle", () => { d.open ? S.openSecs.add(id) : S.openSecs.delete(id); store.set("secs", [...S.openSecs]); });
  return d;
}
function toggleSet(set, v) { set.has(v) ? set.delete(v) : set.add(v); }

function renderExplore() {
  if (!S.data) return;
  const body = $("#exploreBody");
  const scroll = body.scrollTop;
  const total = S.entries.length;
  $("#countShown").textContent = S.filtered.length;
  $("#countTotal").textContent = total;
  $("#countMeter").style.width = (100 * S.filtered.length) / total + "%";

  // communities
  const tc = facetCounts("tribes", (e) => e.tribes);
  const tribes = Object.keys(TRIBE_COLORS).filter((x) => S.entries.some((e) => e.tribes.includes(x)));
  const pvtgTribes = new Set(["Toto", "Lodha", "Birhor", "Kheria Sabar"]);
  const commChips = h("div", { class: "chips notranslate", translate: "no" }, tribes.map((tr) => {
    const n = tc.get(tr) || 0;
    const on = S.f.tribes.has(tr);
    return h("button", { class: "chip", style: { "--c": tribeColor(tr) }, "aria-pressed": String(on), disabled: !n && !on, onclick: () => { toggleSet(S.f.tribes, tr); applyFilters(); } },
      h("span", { class: "dot" }), tr, pvtgTribes.has(tr) ? h("span", { class: "pv", title: "PVTG" }, "✦") : null, h("span", { class: "n" }, n));
  }));

  // districts
  const dc = facetCounts("districts", (e) => (e.districts.length ? e.districts : ["__region"]));
  const dists = [...new Set(S.entries.flatMap((e) => e.districts))].sort();
  const distChips = h("div", { class: "chips notranslate", translate: "no" }, [...dists, "__region"].map((d) => {
    const n = dc.get(d) || 0;
    const on = S.f.districts.has(d);
    return h("button", { class: "chip", style: { "--c": "#2F98A6" }, "aria-pressed": String(on), disabled: !n && !on, onclick: () => {
      toggleSet(S.f.districts, d); applyFilters();
      if (S.f.districts.has(d) && d !== "__region") fitDistrict(d);
    } }, d === "__region" ? t("regionWide") : d, h("span", { class: "n" }, n));
  }));

  // categories
  const gc = facetCounts("groups", (e) => [e.group]);
  const groups = Object.keys(GROUP_ICON).filter((g) => S.entries.some((e) => e.group === g));
  const catRows = h("div", { class: "rows notranslate", translate: "no" }, groups.map((g) => {
    const n = gc.get(g) || 0; const on = S.f.groups.has(g);
    return h("button", { class: "row", "aria-pressed": String(on), disabled: !n && !on, onclick: () => { toggleSet(S.f.groups, g); applyFilters(); } }, icon(GROUP_ICON[g], 18), g, h("span", { class: "n" }, n));
  }));

  // lenses
  const lensRows = h("div", { class: "rows" }, LENSES.map((L) => {
    const n = S.entries.filter((e) => matches(e, "lenses") && L.test(e)).length;
    const on = S.f.lenses.has(L.id);
    return h("button", { class: "row", "aria-pressed": String(on), onclick: () => { toggleSet(S.f.lenses, L.id); applyFilters(); } }, icon(L.icon, 18), tl(L.key), h("span", { class: "n" }, n), h("span", { class: "switch", "aria-hidden": "true" }));
  }));

  // trails
  const trailList = h("div", {}, S.trails.filter((x) => x.ids.length).map((x, i) => {
    const on = S.f.trail && S.f.trail.i === i;
    return h("button", { class: "trail", "aria-pressed": String(!!on), onclick: () => setTrail(on ? null : i) },
      h("b", {}, x.theme), h("span", {}, `${x.ids.length} ${t("linked")} · ${x.communities}`));
  }));

  // layer guide
  const layerList = h("div", { class: "layer-list" }, S.layers.map((l, i) => h("div", { class: "layer-item" },
    h("span", { class: "lnum" }, icon(LAYER_ICONS[i] || "spiral", 17)),
    h("div", {}, h("b", {}, h("code", {}, l.id), l.name), h("span", {}, l.function)))));

  body.replaceChildren(
    section("communities", "community", "communities", tribes.length, [commChips, h("p", { class: "note notranslate", translate: "no" }, t("pvtgNote"))]),
    section("districts", "pin", "districts", dists.length, distChips),
    section("categories", "bowl", "categories", groups.length, catRows),
    section("lenses", "eye", "lenses", null, lensRows),
    section("trails", "spiral", "trails", S.trails.length, trailList),
    section("layers", "weave", "layerGuide", 14, layerList),
    h("div", { style: { padding: "18px 0 4px" } }, warli(9, 15)),
  );
  body.scrollTop = scroll;
}

function renderActiveFilters() {
  const box = $("#activeFilters");
  const pills = [];
  const pill = (label, remove, color) => h("span", { class: "pill", style: color ? { "--c": color } : null },
    color ? h("span", { class: "dot", style: { width: "8px", height: "8px", "border-radius": "50%", background: color, flex: "none" } }) : null, h("span", { class: "pill-txt", title: label }, label),
    h("button", { "aria-label": "Remove " + label, onclick: remove }, icon("x", 12)));
  S.f.tribes.forEach((x) => pills.push(pill(x, () => { S.f.tribes.delete(x); applyFilters(); }, tribeColor(x))));
  S.f.districts.forEach((x) => pills.push(pill(x === "__region" ? t("regionWide") : x, () => { S.f.districts.delete(x); applyFilters(); })));
  S.f.groups.forEach((x) => pills.push(pill(x, () => { S.f.groups.delete(x); applyFilters(); })));
  S.f.lenses.forEach((x) => pills.push(pill(t(LENSES.find((l) => l.id === x).key), () => { S.f.lenses.delete(x); applyFilters(); })));
  if (S.f.trail) pills.push(pill("◈ " + S.trails[S.f.trail.i].theme, () => setTrail(null)));
  if (pills.length) {
    pills.push(h("button", { class: "pill clear", onclick: clearFilters }, t("clearAll")));
    pills.push(h("button", { class: "pill clear", onclick: fitToFiltered }, icon("target", 13), " ", t("flyTo")));
  }
  box.replaceChildren(...pills);
}
function clearFilters() {
  S.f.tribes.clear(); S.f.districts.clear(); S.f.groups.clear(); S.f.lenses.clear(); S.f.trail = null;
  applyFilters();
}
function setTrail(i) {
  S.f.trail = i === null ? null : { i, ids: S.trails[i].ids };
  applyFilters({ fit: i !== null });
}
function renderTrailBanner() {
  const b = $("#trailBanner");
  if (!S.f.trail) { b.hidden = true; return; }
  const tr = S.trails[S.f.trail.i];
  b.replaceChildren(h("span", { class: "notranslate", translate: "no" }, "◈ " + t("trailActive") + ":"), h("b", {}, tr.theme),
    h("button", { class: "iconbtn sm ghost", "aria-label": "Clear trail", onclick: () => setTrail(null) }, icon("x", 14)));
  b.hidden = false;
}

function setExplore(open) {
  S.exploreOpen = open;
  $("#explore").hidden = !open;
  $("#btnExplore").setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("explore-open", open);
  if (open && isMobile()) closeSheet({ keepHash: false });
}

/* ============================================================== right sheet */
function setSheetOpen(open) {
  $("#sheet").hidden = !open;
  document.body.classList.toggle("sheet-open", open);
  if (open && isMobile() && S.exploreOpen) setExplore(false);
}
function closeSheet({ keepHash = false } = {}) {
  S.view = null;
  setSheetOpen(false);
  if (!keepHash) setHash("");
  syncMarkers();
}
function setHash(v) {
  const want = v ? "#" + v : "";
  if (location.hash !== want) {
    if (want) history.pushState(null, "", want);
    else history.pushState(null, "", location.pathname + location.search);
  }
}

function itemRow(e, onclick) {
  const c = entryColor(e);
  return h("button", { class: "item", style: { "--c": c }, onclick },
    h("span", { class: "medal", style: { "--c": c } }, icon(e.icon, 20)),
    h("span", {}, h("b", {}, e.food_name),
      h("small", {}, h("span", { class: "cm" }, e.tribes.join(" · ")), e.pvtg ? h("span", { class: "notranslate", translate: "no", style: { color: "var(--accent-2)" } }, " ✦ " + t("pvtg")) : null, " · ", e.category)),
    icon("chev-r", 16, "chev"));
}

function openPlace(key, { fly = true, hash = true } = {}) {
  const p = S.placeByKey.get(key) || buildPlaces(S.entries).find((x) => x.key === key);
  if (!p) return;
  S.view = { type: "place", key };
  S.list = p.entries.map((e) => e.entry_id);
  renderSheet();
  setSheetOpen(true);
  if (hash) setHash("place=" + key);
  if (fly) flyTo(p.lng, p.lat);
  music.forTribe(p.tribe);
  syncMarkers();
}
function openEntry(id, { fly = true, tab = "overview", hash = true, list = null } = {}) {
  const e = S.byId[id];
  if (!e) return;
  if (list) S.list = list;
  else if (!S.list.includes(id)) S.list = S.filtered.map((x) => x.entry_id);
  S.view = { type: "entry", id, tab };
  renderSheet();
  setSheetOpen(true);
  $("#sheet .sheet-scroll")?.scrollTo(0, 0);
  if (hash) setHash("entry=" + id);
  if (fly) {
    if (e.lat != null) flyTo(+e.lng, +e.lat, { zoom: Math.max(map.getZoom(), 9.4) });
    else if (e.districts[0]) fitDistrict(e.districts[0]);
  }
  music.forTribe(e.tribes[0]);
  syncMarkers();
}
function openIndex() {
  S.view = { type: "index" };
  renderSheet();
  setSheetOpen(true);
  setHash("index");
  syncMarkers();
}
function stepEntry(dir) {
  if (!S.view || S.view.type !== "entry" || S.list.length < 2) return;
  const i = S.list.indexOf(S.view.id);
  const next = S.list[(i + dir + S.list.length) % S.list.length];
  openEntry(next, { tab: S.view.tab, list: S.list });
}

function renderSheet() {
  const sheet = $("#sheet");
  sheet.classList.remove("short");
  if (!S.view) return;
  if (S.view.type === "place") return renderPlaceSheet(sheet);
  if (S.view.type === "entry") return renderEntrySheet(sheet);
  if (S.view.type === "index") return renderIndexSheet(sheet);
}

function sheetHead(crumb, onBack) {
  return h("div", { class: "hero-top notranslate", translate: "no" },
    onBack ? h("button", { class: "iconbtn sm", "aria-label": t("back"), title: t("back"), onclick: onBack }, icon("arrow-l", 16)) : null,
    h("span", { class: "crumb" }, crumb),
    h("button", { class: "iconbtn sm", "aria-label": t("close"), title: t("close") + " (Esc)", onclick: () => closeSheet() }, icon("x", 16)));
}

function renderPlaceSheet(sheet) {
  const p = S.placeByKey.get(S.view.key) || buildPlaces(S.entries).find((x) => x.key === S.view.key);
  if (!p) return closeSheet();
  if (isMobile()) sheet.classList.add("short");
  sheet.replaceChildren(
    h("div", { class: "hero", style: { "--c": p.color } },
      h("div", { class: "hero-band" }),
      sheetHead(p.note === "hq" ? t("hq") : t("approx")),
      h("div", { class: "hero-main" },
        h("span", { class: "medal", style: { "--c": p.color } }, icon("pin", 26)),
        h("div", {},
          h("h2", {}, p.title),
          h("p", { class: "muted", style: { margin: "4px 0 0", "font-size": "1rem" } }, p.district, " · ", h("span", { class: "mono" }, `${p.lat.toFixed(3)}°N ${p.lng.toFixed(3)}°E`)))),
      h("p", { class: "eyebrow notranslate", translate: "no", style: { "margin-top": "14px", color: "var(--accent-2)" } }, `${p.entries.length} ${t("placeCount")}`)),
    h("div", { class: "sheet-scroll" }, h("div", { class: "list" }, p.entries.map((e) => itemRow(e, () => openEntry(e.entry_id, { fly: false, list: p.entries.map((x) => x.entry_id) }))))),
  );
}

function renderIndexSheet(sheet) {
  const sort = S.indexSort;
  const list = S.filtered.slice();
  const groups = new Map();
  const keyOf = (e) => (sort === "community" ? e.tribes[0] : sort === "district" ? e.districts[0] || t("regionWide") : (e.food_name[0] || "#").toUpperCase());
  list.sort((a, b) => keyOf(a).localeCompare(keyOf(b)) || a.food_name.localeCompare(b.food_name));
  for (const e of list) { const k = keyOf(e); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(e); }
  S.list = list.map((e) => e.entry_id);
  const seg = h("div", { class: "seg notranslate", translate: "no" }, [["az", "sortAZ"], ["community", "sortCommunity"], ["district", "sortDistrict"]].map(([id, k]) =>
    h("button", { "aria-pressed": String(sort === id), onclick: () => { S.indexSort = id; renderSheet(); } }, t(k))));
  const body = h("div", { class: "list" });
  for (const [k, es] of groups) {
    body.append(h("div", { class: "group-h", style: sort === "community" ? { "--c": tribeColor(k) } : null }, sort === "community" ? h("span", { class: "dot" }) : null, `${k} · ${es.length}`));
    es.forEach((e) => body.append(itemRow(e, () => openEntry(e.entry_id, { list: S.list }))));
  }
  if (!list.length) body.append(h("p", { class: "empty" }, t("snapshotEmpty")));
  sheet.replaceChildren(
    h("div", { class: "hero" }, sheetHead(`${S.filtered.length} ${t("of")} ${S.entries.length}`),
      h("div", { class: "hero-main" }, h("span", { class: "medal", style: { "--c": "#D4A843" } }, icon("list", 26)),
        h("div", {}, h("h2", { class: "notranslate", translate: "no" }, t("index")), h("p", { class: "muted notranslate", translate: "no", style: { margin: "4px 0 0", "font-size": "1rem" } }, t("indexSub"))))),
    h("div", { class: "sheet-tools" }, seg),
    h("div", { class: "sheet-scroll" }, body),
  );
}

function field(labelKey, text, { iconName, pre = true } = {}) {
  if (!N.has(text)) return null;
  return h("div", { class: "field" }, h("h4", { class: "notranslate", translate: "no" }, iconName ? icon(iconName, 14) : null, t(labelKey)), h("p", {}, text));
}
function rawField(label, text) {
  if (!N.has(text)) return null;
  return h("div", { class: "field" }, h("h4", {}, label), h("p", {}, text));
}

function renderEntrySheet(sheet) {
  const e = S.byId[S.view.id];
  const c = entryColor(e);
  const tab = S.view.tab;
  const idx = S.list.indexOf(e.entry_id);
  const tabs = [["overview", "overview"], ["layers", "layers"], ["origins", "origins"], ["learn", "learn"]];
  const tabBar = h("div", { class: "tabs notranslate", translate: "no", role: "tablist" }, tabs.map(([id, k]) =>
    h("button", { role: "tab", "aria-selected": String(tab === id), disabled: id === "origins" && !e.origin, onclick: () => { S.view.tab = id; renderSheet(); } }, t(k))));

  let panel;
  if (tab === "overview") panel = overviewTab(e, c);
  else if (tab === "layers") panel = layersTab(e);
  else if (tab === "origins") panel = originsTab(e);
  else panel = learnTab(e);

  const crumb = [e.district, e.entry_id].join(" · ");
  sheet.replaceChildren(
    h("div", { class: "sheet-scroll" },
      h("div", { class: "hero", style: { "--c": c } },
        h("div", { class: "hero-band" }),
        sheetHead(crumb, S.list.length > 1 && e.lat != null ? () => openPlace(placeKey(e), { fly: false }) : null),
        h("div", { class: "hero-main" },
          h("span", { class: "medal", style: { "--c": c } }, icon(e.icon, 28)),
          h("div", { style: { "min-width": "0" } },
            h("p", { class: "eyebrow" }, e.category),
            h("h2", {}, e.food_name),
            N.has(e.local_name) && e.local_name !== e.food_name ? h("p", { class: "local" }, "“" + e.local_name + "”") : null)),
        h("div", { class: "tags" },
          e.tribes.map((tr) => h("span", { class: "tag c", style: { "--c": tribeColor(tr) } }, tr)),
          e.pvtg ? h("span", { class: "tag pv notranslate", translate: "no" }, "✦ " + t("pvtg")) : null,
          h("span", { class: "tag" }, icon("pin", 13), e.district),
          h("span", { class: "tag id notranslate", translate: "no" }, e.entry_id)),
        h("div", { class: "actions notranslate", translate: "no" },
          h("button", { class: "btn btn-accent", onclick: () => startTour(e) }, icon("drum", 18), t("startTour")),
          e.lat != null ? h("button", { class: "iconbtn", title: t("flyTo"), "aria-label": t("flyTo"), onclick: () => flyTo(+e.lng, +e.lat, { zoom: 10.4, pitch: 66, bearing: -20 }) }, icon("target", 18)) : null,
          h("button", { class: "iconbtn", title: t("share"), "aria-label": t("share"), onclick: () => shareEntry(e) }, icon("share", 18)),
          h("button", { class: "iconbtn", title: t("cite"), "aria-label": t("cite"), onclick: () => citeEntry(e) }, icon("quote", 18)))),
      tabBar,
      h("div", { class: "tabpanel", role: "tabpanel" }, panel)),
    S.list.length > 1 ? h("div", { class: "sheet-foot notranslate", translate: "no" },
      h("button", { class: "btn", style: { height: "38px", "box-shadow": "none" }, onclick: () => stepEntry(-1) }, icon("chev-l", 16), t("prev")),
      h("span", { class: "grow" }, `${idx + 1} / ${S.list.length}`),
      h("button", { class: "btn", style: { height: "38px", "box-shadow": "none" }, onclick: () => stepEntry(1) }, t("next"), icon("chev-r", 16))) : null,
  );
}

function overviewTab(e, c) {
  const related = new Set();
  for (const tr of S.trails) if (tr.ids.includes(e.entry_id)) tr.ids.forEach((id) => id !== e.entry_id && S.byId[id] && related.add(id));
  for (const x of S.entries) if (related.size < 8 && x.entry_id !== e.entry_id && x.tribes[0] === e.tribes[0] && x.group === e.group) related.add(x.entry_id);
  return h("div", {},
    N.has(e.ecology) ? h("div", { class: "card" }, h("h4", {}, icon("ecology", 14), e.block_village || e.district), h("p", {}, e.ecology)) : null,
    field("ingredients", e.ingredients, { iconName: "grain" }),
    field("howMade", e.culinary_technology, { iconName: "pot" }),
    field("vessels", e.vessel_tool, { iconName: "weave" }),
    field("season", e.season, { iconName: "sun" }),
    N.has(e.cultural_memory) ? h("blockquote", { class: "memory", style: { "--c": c } }, e.cultural_memory) : null,
    field("whyMatters", e.cultural_significance, { iconName: "star" }),
    related.size ? h("div", { class: "field", style: { "margin-top": "20px" } }, h("h4", { class: "notranslate", translate: "no" }, icon("spiral", 14), t("related")),
      h("div", { class: "related" }, [...related].slice(0, 8).map((id) => {
        const r = S.byId[id];
        return h("button", { class: "chip", style: { "--c": entryColor(r) }, onclick: () => openEntry(id, { list: S.list.includes(id) ? S.list : null }) }, h("span", { class: "dot" }), N.shortName(r.food_name), h("span", { class: "n" }, r.tribes[0]));
      }))) : null,
    gbForEntry(e),
    h("div", { style: { "margin-top": "22px" } }, warli(7, 14)),
  );
}

function layersTab(e) {
  const layer = (i, title, ...fields) => {
    const kids = fields.flat().filter(Boolean);
    return h("details", { class: "acc", open: i < 2 ? true : null },
      h("summary", {}, h("span", { class: "lnum" }, icon(LAYER_ICONS[i], 18)), h("span", { class: "lt" }, h("code", {}, `L${i + 1}`), h("b", {}, title)), icon("chev-d", 16, "chev")),
      h("div", { class: "acc-body" }, kids.length ? kids : h("p", { class: "muted" }, "—")));
  };
  const Lg = S.layers;
  const wrap = h("div", {},
    h("div", { style: { display: "flex", "justify-content": "flex-end", gap: "14px" }, class: "notranslate", translate: "no" },
      h("button", { class: "linkbtn", onclick: () => $$(".acc", wrap).forEach((d) => (d.open = true)) }, t("expandAll")),
      h("button", { class: "linkbtn", onclick: () => $$(".acc", wrap).forEach((d) => (d.open = false)) }, t("collapseAll"))),
    layer(0, Lg[0].name, rawField("District", `${e.district}, ${e.state}`), rawField("Block / village", e.block_village), rawField("Ecology & landscape", e.ecology)),
    layer(1, Lg[1].name, rawField("Community", `${e.community} · PVTG: ${e.pvtg_status}`), rawField("Food", `${e.food_name}${N.has(e.local_name) ? ` (${e.local_name})` : ""}`), rawField("Scientific name", e.scientific_name), rawField("Category", e.category)),
    layer(2, Lg[2].name, rawField("", e.ingredients)),
    layer(3, Lg[3].name, rawField("Method", e.culinary_technology), rawField("Vessels & tools", e.vessel_tool)),
    layer(4, Lg[4].name, rawField("Season", e.season), rawField("Scarcity context", e.scarcity)),
    layer(5, Lg[5].name, rawField("Memory & folklore", e.cultural_memory), rawField("Ritual use", e.ritual_use)),
    layer(6, Lg[6].name, rawField("", e.notes)),
    layer(7, Lg[7].name, rawField("", e.lost_traditions)),
    layer(8, Lg[8].name, rawField("", e.sacred_foods)),
    layer(9, Lg[9].name, rawField("", e.medicinal_value)),
    layer(10, Lg[10].name, rawField("", e.cultural_significance)),
    layer(11, Lg[11].name, rawField("", e.lat != null ? `${e.lat}°N, ${e.lng}°E · ${e.geo_note}` : t("coordsPending"))),
    layer(12, Lg[12].name, rawField("", e.image_reference || "Visual documentation will be added in a future update.")),
  );
  return wrap;
}

function originsTab(e) {
  const o = e.origin;
  if (!o) return h("p", { class: "empty" }, t("noOrigin"));
  const blocks = N.originBlocks(o.origin_narrative).map((b) => h("div", { class: "oblock" },
    b.head ? h("h5", {}, b.head) : null, b.text ? h("p", {}, b.text) : null,
    b.chain.length ? h("ol", { class: "chain" }, b.chain.map((x) => h("li", {}, x))) : null));
  const tl = N.timelineItems(o.timeline);
  return h("div", {},
    N.has(o.geographic_origin) ? h("div", { class: "card origin-geo" }, h("h4", {}, icon("pin", 14), "L14a · Geographic origin"), h("p", {}, o.geographic_origin)) : null,
    h("div", { class: "field", style: { "margin-top": "16px" } }, h("h4", {}, "L14b · Deep historical narrative"), blocks),
    rawField("L14c · Adoption pathway", o.adoption_pathway),
    rawField("L14d · Migration & cultural contact", o.migration_contact),
    N.has(o.timeline) ? h("div", { class: "field" }, h("h4", {}, "L14e · Chronological timeline"),
      tl ? h("ul", { class: "timeline" }, tl.map((x) => h("li", {}, x.when ? h("b", {}, x.when) : null, h("span", {}, x.what)))) : h("p", {}, o.timeline)) : null,
    rawField("L14f · Global parallels", o.global_parallels),
  );
}

function qaList(qs, showSource = false) {
  return h("div", { class: "qa" }, qs.map((q, i) => {
    const a = h("div", { class: "qa-a", hidden: true }, q.a, showSource ? h("button", { class: "linkbtn src", onclick: () => { closeDialogs(); openEntry(q.id); } }, " → ", N.shortName(S.byId[q.id].food_name), ` (${q.id})`) : null);
    const lbl = h("span", { class: "lbl notranslate", translate: "no" }, t("reveal"));
    const btn = h("button", { class: "qa-q", "aria-expanded": "false", onclick: () => {
      a.hidden = !a.hidden; btn.setAttribute("aria-expanded", String(!a.hidden)); lbl.textContent = a.hidden ? t("reveal") : t("hide");
    } }, h("span", { class: "num" }, String(i + 1)), h("span", {}, q.q), lbl);
    return h("div", { class: "qa-item" }, btn, a);
  }));
}
function learnTab(e) {
  return h("div", {}, h("p", { class: "muted notranslate", translate: "no", style: { "margin-top": "0" } }, t("learnIntro")), qaList(N.composeQuestions(e)));
}

function entryURL(e) { return `${location.origin}${location.pathname}#entry=${e.entry_id}`; }
async function shareEntry(e) {
  const url = entryURL(e);
  if (navigator.share && isMobile()) {
    try { await navigator.share({ title: `${e.food_name} · Mapping Memory, Mapping Meals`, url }); return; } catch { /* cancelled */ }
  }
  copy(url, t("linkCopied"));
}
function citeEntry(e) {
  const url = entryURL(e);
  const year = 2026;
  const mla = `Nandi, Simanta. "${e.food_name}." Mapping Memory, Mapping Meals: A Deep Map of West Bengal's Indigenous Food Heritage, entry ${e.entry_id}, Indian Institute of Space Science and Technology, ${year}, ${url}.`;
  const apa = `Nandi, S. (${year}). ${e.food_name} [Archive entry ${e.entry_id}]. In Mapping memory, mapping meals: A deep map of West Bengal's indigenous food heritage. Indian Institute of Space Science and Technology. ${url}`;
  const chicago = `Nandi, Simanta. "${e.food_name}." Entry ${e.entry_id} in Mapping Memory, Mapping Meals: A Deep Map of West Bengal's Indigenous Food Heritage. Indian Institute of Space Science and Technology, ${year}. ${url}.`;
  const box = (label, text) => h("div", { class: "copybox" }, h("h4", {}, label), h("button", { class: "linkbtn notranslate", translate: "no", onclick: () => copy(text) }, "Copy"), h("div", { class: "notranslate", translate: "no" }, text));
  openDialog("dlgSettings", "quote", t("cite"), [box("MLA 9", mla), box("APA 7", apa), box("Chicago", chicago)], "wide");
}

/* ============================================================== dialogs */
function openDialog(id, iconName, title, body, size) {
  const d = $("#" + id);
  d.className = "dialog " + (size || (id === "dlgSettings" ? "narrow" : id === "dlgGuide" ? "" : "wide"));
  d.replaceChildren(
    h("div", { class: "dlg-head" }, h("span", { class: "medal" }, icon(iconName, 22)), h("h2", { id: id + "T", tabindex: "-1", autofocus: true, style: { outline: "none" } }, title),
      h("button", { class: "iconbtn sm", "aria-label": t("close"), onclick: () => d.close() }, icon("x", 16))),
    h("div", { class: "dlg-body" }, body));
  d.setAttribute("aria-labelledby", id + "T");
  if (!d.open) d.showModal();
  return d;
}
function closeDialogs() { $$("dialog[open]").forEach((d) => d.close()); }

function openGuide() {
  const items = HELP[S.lang] || HELP.en;
  openDialog("dlgGuide", "help", t("guide"), [
    h("div", { class: "help-grid notranslate", translate: "no" }, items.map(([ic, ttl, txt]) => h("div", { class: "help-item" }, h("span", { class: "lnum" }, icon(ic, 20)), h("div", {}, h("b", {}, ttl), h("p", {}, txt))))),
    h("h3", { class: "notranslate", translate: "no" }, t("keyboard")),
    h("div", { class: "keys notranslate", translate: "no" }, SHORTCUTS.map(([k, a]) => h("div", {}, h("kbd", {}, k), a))),
    h("p", { class: "muted", style: { "font-size": "1rem" } }, "Mouse and touch: drag to pan, scroll or pinch to zoom, right-click drag or two-finger drag to tilt and rotate the 3D terrain."),
  ]);
}

function openAbout() {
  const tabsDef = [["about", "The deep map"], ["how", "How it works"], ["credits", "Credits & licensing"]];
  let cur = "about";
  const bodyEl = h("div", {});
  const tabBar = h("div", { class: "tabs dlg-tabs", role: "tablist" });
  const draw = () => {
    tabBar.replaceChildren(...tabsDef.map(([id, label]) => h("button", { role: "tab", "aria-selected": String(cur === id), onclick: () => { cur = id; draw(); } }, label)));
    bodyEl.replaceChildren(...aboutContent(cur));
  };
  draw();
  const d = openDialog("dlgAbout", "spiral", "About · Mapping Memory, Mapping Meals", bodyEl, "wide");
  d.insertBefore(tabBar, d.querySelector(".dlg-body"));
}
function aboutContent(tab) {
  const P = (...k) => h("p", {}, ...k);
  if (tab === "about") return [
    h("h3", {}, "West Bengal's indigenous food heritage, mapped in depth"),
    P("This deep map documents ", h("b", {}, "100 living food traditions"), " of ", h("b", {}, "7+ tribal communities"), " across ", h("b", {}, "10 districts"), " of West Bengal. Each tradition is recorded through ", h("b", {}, "14 layers of knowledge"), ": ecology, community, ethnobotany, culinary technology, season and scarcity, memory and folklore, archival sources, lost traditions, sacred foods, medicine, cultural significance, location, visual record and deep historical origins."),
    P("97 entries carry field coordinates. Three entries from the Junglemahal region of Jhargram are listed in the archive index while their coordinates await field verification. Places that hold many entries mark the headquarters of a district or block, or the approximate centre of a multi-district region."),
    P("The map is a pedagogical and preservation tool for researchers, students and communities, and part of the Indian Knowledge System (IKS) effort to keep indigenous food knowledge alive. More communities and places will be added as the archive grows."),
    h("div", { class: "credit" }, h("b", {}, "© Simanta Nandi · Dr. Gigy J Alex"), h("p", { style: { margin: "4px 0 0" } }, "Department of Humanities and Social Sciences, Indian Institute of Space Science and Technology, Thiruvananthapuram · 2026")),
  ];
  if (tab === "how") return [
    h("h3", {}, "A map that lives on the project website"),
    P("Version 2 of the map runs entirely inside the project website. The archive is a static data file, the map engine is the open-source MapLibre GL JS, and there is no server to sleep or wake up, so the map opens immediately."),
    h("h3", {}, "Talking Tours and Snapshots"),
    P("A Talking Tour assembles a narration from the entry's own fields: place and ecology, community, ingredients, method, season, memory, healing value, what is at risk, and origins. A Snapshot does the same for everything visible on the map. Your browser's speech engine reads the narration aloud, highlighting each passage. Because nothing is generated by a language model, every sentence can be traced back to the archive entry it came from."),
    h("h3", {}, "Languages"),
    P("The interface is written in English, Bengali and Hindi. When you choose Bengali or Hindi, the research text is translated by Google Translate, the same service the project website uses, and the tour is read in that language where your device has a matching voice. Machine translation can miss nuance; the English record remains the reference."),
    h("h3", {}, "The Guestbook"),
    P("The Guestbook is a community reflection space. Any visitor can leave a short food memory from their own family or community, with no account needed. Reflections are sent to the project's Google Form and read back from its response sheet, so the project team can moderate them. Reflections linked to an archive food also appear on that entry, under Visitor memories."),
    h("h3", {}, "Five questions"),
    P("Each entry offers five questions drawn from its layers, with answers quoted from the record, for classroom and self-study use."),
  ];
  return [
    h("h3", {}, "Map data and licences"),
    h("ul", {},
      h("li", {}, "Map engine: MapLibre GL JS (BSD-3-Clause), bundled with this site."),
      h("li", {}, "Basemaps: © OpenStreetMap contributors (ODbL) · © CARTO."),
      h("li", {}, "Satellite imagery: © Esri, Maxar, Earthstar Geographics."),
      h("li", {}, "Terrain: Mapzen terrain tiles via AWS Open Data."),
      h("li", {}, "State and district boundaries: open community GeoJSON (datameet), simplified for the web."),
      h("li", {}, "Research data: the Mapping Memory, Mapping Meals 14-layer deep-mapping database, compiled from academic literature and field documentation.")),
    h("h3", {}, "Music"),
    h("ul", {}, TRACKS.map((tr) => h("li", {}, h("b", {}, tr.name), " · ", tr.credit))),
    P("Field recordings courtesy of the Indira Gandhi Rashtriya Manav Sangrahalaya (IGRMS), National Museum of Mankind, via archive.org (CC BY-NC 4.0). CC0 tracks via archive.org public domain collections."),
    h("div", { class: "credit" }, h("b", {}, "© Simanta Nandi · Dr. Gigy J Alex"), h("p", { style: { margin: "4px 0 0" } }, "Department of Humanities and Social Sciences, Indian Institute of Space Science and Technology, Thiruvananthapuram · 2026. Research database, deep-mapping design and curation. Map and media components remain under their own open licences.")),
  ];
}

function openSettings() {
  const seg = (items, cur, on) => h("div", { class: "seg" }, items.map(([v, label]) => h("button", { "aria-pressed": String(cur === v), onclick: () => { on(v); openSettings(); } }, label)));
  openDialog("dlgSettings", "gear", t("settings"), h("div", { class: "notranslate", translate: "no" },
    h("div", { class: "set-row" }, h("span", {}, t("appearance")), seg([["dusk", t("dusk")], ["daylight", t("daylight")]], S.theme, setTheme)),
    h("div", { class: "set-row" }, h("span", {}, t("basemap")), seg([["dusk", t("dusk")], ["daylight", t("daylight")], ["satellite", t("satellite")]], S.basemap, setBasemap)),
    h("div", { class: "set-row" }, h("span", {}, t("textSize")), seg([[1, "14pt"], [1.15, "16pt"], [1.3, "18pt"]], S.scale, setScale)),
    h("div", { class: "set-row" }, h("span", {}, t("view3d")), seg([[true, "3D"], [false, "2D"]], S.terrain, setTerrain)),
    h("div", { class: "set-row" }, h("span", {}, t("motion")), seg([[false, "Off"], [true, "On"]], S.reduce, (v) => { S.reduce = v; store.set("reduce", v); document.body.classList.toggle("reduce-motion", v); })),
    h("div", { class: "set-row" }, h("span", {}, t("boundaries")), seg([[true, "On"], [false, "Off"]], S.boundaries, setBoundaries)),
    !EMBED ? h("div", { class: "set-row" }, h("span", {}, "Intro"), h("button", { class: "btn", style: { height: "38px", "box-shadow": "none" }, onclick: () => { closeDialogs(); showIntro(); } }, t("begin"))) : null,
  ));
}
function setScale(v) { S.scale = v; store.set("scale", v); document.documentElement.style.setProperty("--scale", v); }

/* ---------- basemap popover */
function renderLayerPop() {
  const pop = $("#layerPop");
  pop.replaceChildren(
    h("h4", {}, t("basemap")),
    h("div", { class: "basemaps" }, [["dusk", "dusk"], ["daylight", "daylight"], ["satellite", "satellite"]].map(([b, k]) =>
      h("button", { "aria-pressed": String(S.basemap === b), onclick: () => setBasemap(b) }, h("i", { class: "bm-" + b }), t(k)))),
    h("button", { class: "row", "aria-pressed": String(S.boundaries), onclick: () => setBoundaries(!S.boundaries) }, icon("pin", 16), t("boundaries"), h("span", { class: "switch", style: { "margin-left": "auto" } })),
    h("button", { class: "row", "aria-pressed": String(S.terrain), onclick: () => { setTerrain(!S.terrain); renderLayerPop(); } }, icon("mountain", 16), t("view3d"), h("span", { class: "switch", style: { "margin-left": "auto" } })),
  );
}

/* ============================================================== search */
const searchState = { items: [], active: -1 };
function norm(s) { return (s || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, ""); }
function highlight(text, q) {
  const i = norm(text).indexOf(q);
  if (i < 0 || !q) return [text];
  return [text.slice(0, i), h("mark", {}, text.slice(i, i + q.length)), text.slice(i + q.length)];
}
function runSearch() {
  const raw = $("#search").value.trim();
  const q = norm(raw);
  const box = $("#searchResults");
  if (!q) { box.hidden = true; $("#search").setAttribute("aria-expanded", "false"); return; }
  const score = (s) => { const n = norm(s); return n.startsWith(q) ? 3 : n.includes(" " + q) ? 2 : n.includes(q) ? 1 : 0; };
  const foods = S.entries.map((e) => ({ e, s: Math.max(score(e.food_name) * 2, score(e.local_name) * 2, score(e.scientific_name), score(e.category), score(e.ingredients) * 0.5) }))
    .filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 8);
  const tribes = Object.keys(TRIBE_COLORS).filter((x) => score(x) && S.entries.some((e) => e.tribes.includes(x))).slice(0, 4);
  const dists = [...new Set(S.entries.flatMap((e) => e.districts))].filter((d) => score(d)).slice(0, 4);
  const trails = S.trails.map((x, i) => ({ x, i })).filter(({ x }) => score(x.theme)).slice(0, 3);
  const items = [];
  const groups = [];
  if (foods.length) {
    groups.push(h("div", { class: "sr-group notranslate", translate: "no" }, t("statEntries")));
    foods.forEach(({ e }) => {
      const it = h("button", { class: "sr-item", role: "option", onclick: () => pickSearch(() => openEntry(e.entry_id, { list: foods.map((f) => f.e.entry_id) })) },
        h("span", { class: "medal", style: { "--c": entryColor(e), width: "36px", height: "36px", "border-radius": "50%", "border-width": "2px", "box-shadow": "none" } }, icon(e.icon, 17)),
        h("span", {}, highlight(e.food_name, q), h("small", {}, `${e.tribes.join(" · ")} · ${e.district}`)));
      items.push(it); groups.push(it);
    });
  }
  if (tribes.length) {
    groups.push(h("div", { class: "sr-group notranslate", translate: "no" }, t("communities")));
    tribes.forEach((tr) => {
      const n = S.entries.filter((e) => e.tribes.includes(tr)).length;
      const it = h("button", { class: "sr-item", role: "option", onclick: () => pickSearch(() => { S.f.tribes = new Set([tr]); applyFilters({ fit: true }); setExplore(!isMobile()); }) },
        h("span", { class: "dot", style: { width: "14px", height: "14px", "border-radius": "50%", background: tribeColor(tr), margin: "0 11px" } }),
        h("span", {}, highlight(tr, q), h("small", {}, `${n} ${t("statEntries")}`)));
      items.push(it); groups.push(it);
    });
  }
  if (dists.length) {
    groups.push(h("div", { class: "sr-group notranslate", translate: "no" }, t("districts")));
    dists.forEach((d) => {
      const n = S.entries.filter((e) => e.districts.includes(d)).length;
      const it = h("button", { class: "sr-item", role: "option", onclick: () => pickSearch(() => { S.f.districts = new Set([d]); applyFilters(); fitDistrict(d); }) },
        icon("pin", 18), h("span", {}, highlight(d, q), h("small", {}, `${n} ${t("statEntries")}`)));
      items.push(it); groups.push(it);
    });
  }
  if (trails.length) {
    groups.push(h("div", { class: "sr-group notranslate", translate: "no" }, t("trails")));
    trails.forEach(({ x, i }) => {
      const it = h("button", { class: "sr-item", role: "option", onclick: () => pickSearch(() => setTrail(i)) }, icon("spiral", 18), h("span", {}, highlight(x.theme, q), h("small", {}, `${x.ids.length} ${t("linked")}`)));
      items.push(it); groups.push(it);
    });
  }
  if (!items.length) groups.push(h("div", { class: "sr-empty notranslate", translate: "no" }, t("searchEmpty")));
  searchState.items = items; searchState.active = items.length ? 0 : -1;
  items.forEach((it, i) => it.setAttribute("aria-selected", String(i === 0)));
  box.replaceChildren(...groups);
  box.hidden = false;
  $("#search").setAttribute("aria-expanded", "true");
}
function pickSearch(fn) {
  $("#search").value = "";
  $("#searchResults").hidden = true;
  $("#search").blur();
  fn();
}
function searchKeys(ev) {
  const { items } = searchState;
  if (ev.key === "Escape") { $("#search").value = ""; $("#searchResults").hidden = true; $("#search").blur(); return; }
  if (!items.length) return;
  if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
    ev.preventDefault();
    searchState.active = (searchState.active + (ev.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    items.forEach((it, i) => it.setAttribute("aria-selected", String(i === searchState.active)));
    items[searchState.active].scrollIntoView({ block: "nearest" });
  } else if (ev.key === "Enter") { ev.preventDefault(); items[Math.max(0, searchState.active)].click(); }
}

/* ============================================================== speech */
const speech = {
  supported: "speechSynthesis" in window,
  voices: [],
  session: 0,
  load() { if (this.supported) this.voices = speechSynthesis.getVoices() || []; },
  prefs: { en: ["en-IN", "en-GB", "en-US", "en"], bn: ["bn-IN", "bn-BD", "bn"], hi: ["hi-IN", "hi"] },
  list(lang) {
    this.load();
    const prefs = this.prefs[lang] || ["en"];
    const rank = (v) => {
      const vl = (v.lang || "").toLowerCase().replace("_", "-");
      const i = prefs.findIndex((p) => vl.startsWith(p.toLowerCase()));
      if (i < 0) return -1;
      const n = (v.name || "").toLowerCase();
      return (prefs.length - i) * 10 + (/natural|neural|online/.test(n) ? 8 : 0) + (/google/.test(n) ? 6 : 0) + (/microsoft/.test(n) ? 3 : 0);
    };
    return this.voices.map((v) => ({ v, r: rank(v) })).filter((x) => x.r >= 0).sort((a, b) => b.r - a.r).map((x) => x.v);
  },
  voiceFor(lang) {
    const l = this.list(lang);
    const pref = store.get("voice-" + lang, null);
    return l.find((v) => v.voiceURI === pref) || l[0] || null;
  },
  stop() { this.session++; if (this.supported) speechSynthesis.cancel(); },
  // Speaks spans[i..] one by one; calls onIndex(i) when each starts, onEnd() at the end.
  play(spans, from, { lang, rate = 0.95, onIndex, onEnd }) {
    if (!this.supported) return false;
    this.stop();
    const my = ++this.session;
    const voice = this.voiceFor(lang);
    const say = (i) => {
      if (my !== this.session) return;
      if (i >= spans.length) { onEnd && onEnd(); return; }
      const text = spans[i].textContent.trim();
      if (!text) { say(i + 1); return; }
      const u = new SpeechSynthesisUtterance(text);
      if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = lang === "bn" ? "bn-IN" : lang === "hi" ? "hi-IN" : "en-IN";
      u.rate = rate * (/[!?]$/.test(text) ? 1.03 : 1) * (/sacred|deity|ritual|ancestor|offer/i.test(text) ? 0.95 : 1);
      u.pitch = i === 0 ? 1.05 : 1 + 0.03 * Math.sin(i * 1.3);
      u.onstart = () => { if (my === this.session) onIndex && onIndex(i); };
      u.onend = () => { if (my === this.session) setTimeout(() => say(i + 1), 200); };
      u.onerror = (ev) => { if (my === this.session && ev.error !== "interrupted" && ev.error !== "canceled") setTimeout(() => say(i + 1), 80); };
      speechSynthesis.speak(u);
      // Some engines never fire onstart; mark the passage anyway.
      setTimeout(() => { if (my === this.session) onIndex && onIndex(i, true); }, 400);
    };
    say(from);
    return true;
  },
};
if (speech.supported) { speech.load(); speechSynthesis.addEventListener?.("voiceschanged", () => speech.load()); }

// Bengali / Hindi voices are used only when the page has really been translated;
// otherwise the English text is read with an English voice.
function speechLang() {
  if (S.lang === "en") return "en";
  return document.documentElement.classList.contains("translated-ltr") ? S.lang : "en";
}

// Reusable reader that binds a block of sentence spans to controls.
function makeReader(container, { onState } = {}) {
  const R = { idx: 0, playing: false, spans: [], rate: 0.95 };
  R.refresh = () => { R.spans = $$(".snt", container); R.spans.forEach((s, i) => (s.onclick = () => { R.idx = i; R.play(); })); };
  R.mark = (i, scroll = true) => {
    R.idx = i;
    R.spans.forEach((s, j) => { s.classList.toggle("on", j === i); s.classList.toggle("done", j < i); });
    const s = R.spans[i];
    if (s && scroll) {
      const box = container.closest(".tour-text, .dlg-body") || container;
      const top = s.offsetTop - box.clientHeight * 0.35;
      box.scrollTo({ top: Math.max(0, top), behavior: reduceMotion() ? "auto" : "smooth" });
    }
    onState && onState(R);
  };
  R.play = () => {
    R.refresh();
    const ok = speech.play(R.spans, R.idx, {
      lang: speechLang(), rate: R.rate,
      onIndex: (i) => R.mark(i),
      onEnd: () => { R.playing = false; R.idx = 0; R.spans.forEach((s) => s.classList.remove("on")); music.duck(false); onState && onState(R); },
    });
    R.playing = ok;
    if (ok) music.duck(true);
    onState && onState(R);
  };
  R.pause = () => { speech.stop(); R.playing = false; music.duck(false); onState && onState(R); };
  R.toggle = () => (R.playing ? R.pause() : R.play());
  R.step = (d) => { R.refresh(); R.idx = Math.max(0, Math.min(R.spans.length - 1, R.idx + d)); if (R.playing) R.play(); else R.mark(R.idx); };
  R.restart = () => { R.idx = 0; R.play(); };
  R.destroy = () => { speech.stop(); R.playing = false; music.duck(false); };
  R.refresh();
  return R;
}
function sentenceParagraphs(paragraphs) {
  let i = 0;
  return paragraphs.map((p) => h("p", {}, p.flatMap((s, j) => [h("span", { class: "snt", "data-i": i++ }, s), j < p.length - 1 ? " " : null])));
}

/* ============================================================== talking tour */
let tourReader = null;
function startTour(e) {
  closeDialogs();
  const tour = $("#tour");
  const c = entryColor(e);
  $("#tourMedal").style.setProperty("--c", c);
  $("#tourMedal").replaceChildren(icon(e.icon, 26));
  $("#tourTitle").textContent = e.food_name;
  $("#tourSub").replaceChildren(h("span", { style: { color: c, "font-weight": "650" } }, e.tribes.join(" · ")), " · ", e.district);
  $("#tourText").replaceChildren(...sentenceParagraphs(N.composeTour(e)));
  tour.hidden = false;
  tour.style.setProperty("--c", c);
  document.body.classList.add("touring");
  const voices = speech.list(speechLang());
  const sel = $("#tourVoice");
  sel.replaceChildren(...voices.map((v) => h("option", { value: v.voiceURI }, `${v.name.replace(/^(Microsoft|Google)\s*/i, "").slice(0, 26)} (${v.lang})`)));
  const cur = speech.voiceFor(speechLang());
  if (cur) sel.value = cur.voiceURI;
  $("#voiceWrap").hidden = voices.length < 2;
  const warn = $("#tourWarn");
  warn.hidden = speech.supported && voices.length > 0;
  warn.textContent = !speech.supported ? t("noSpeech") : t("noVoice");

  if (tourReader) tourReader.destroy();
  tourReader = makeReader($("#tourText"), {
    onState: (R) => {
      const total = R.spans.length || 1;
      $("#tourBar").style.width = `${(100 * (R.playing ? R.idx + 1 : R.idx)) / total}%`;
      $("#tourCount").textContent = `${t("sentence")} ${Math.min(R.idx + 1, total)}/${total}`;
      $("#tourPlay").replaceChildren(icon(R.playing ? "pause" : "play", 18), h("span", {}, R.playing ? t("pause") : R.idx > 0 ? t("resume") : t("listen")));
      tour.classList.toggle("speaking", R.playing);
    },
  });
  tourReader.rate = +$("#tourRate").value;
  tourReader.mark(0, false);
  $$(".snt", $("#tourText")).forEach((s) => s.classList.remove("on"));

  // cinematic camera: fly to the place and circle it slowly
  const tourPad = isMobile() ? { top: 40, bottom: window.innerHeight * 0.62, left: 20, right: 20 } : { top: 40, bottom: 80, left: Math.min(680, window.innerWidth * 0.5), right: 60 };
  if (e.lat != null) flyTo(+e.lng, +e.lat, { zoom: 10.8, pitch: 68, bearing: -25, padding: tourPad, duration: 3200 });
  startOrbit();
  setTimeout(() => $("#tourPlay").focus(), 50);
  if (speech.supported && voices.length) setTimeout(() => { if (!tour.hidden && !tourReader.playing) tourReader.play(); }, 900);
}
function endTour() {
  if (tourReader) tourReader.destroy();
  stopOrbit();
  $("#tour").hidden = true;
  document.body.classList.remove("touring");
  if (S.view && S.view.type === "entry") {
    const e = S.byId[S.view.id];
    if (e.lat != null) map.easeTo({ center: [+e.lng, +e.lat], pitch: S.terrain ? 55 : 0, zoom: 9.4, padding: padding(), duration: reduceMotion() ? 0 : 1200 });
  }
}

/* ============================================================== snapshot */
let snapReader = null;
function openSnapshot(seed = Date.now()) {
  const b = map.getBounds();
  const visPlaces = S.places.filter((p) => b.contains([p.lng, p.lat]));
  const visible = visPlaces.flatMap((p) => p.entries);
  const snap = N.composeSnapshot(visible, visPlaces.length, seed);
  if (snapReader) snapReader.destroy();
  if (!snap) {
    openDialog("dlgSnapshot", "camera", t("snapshotTitle"), [h("p", { class: "empty notranslate", translate: "no" }, t("snapshotEmpty"))], "");
    return;
  }
  const textBox = h("div", { class: "snap-text" }, sentenceParagraphs(snap.paragraphs));
  const playBtn = h("button", { class: "btn btn-accent lg notranslate", translate: "no" });
  const body = [
    h("div", { class: "snap-stats notranslate", translate: "no" },
      h("div", {}, h("b", {}, visible.length), h("span", {}, t("statEntries"))),
      h("div", {}, h("b", {}, visPlaces.length), h("span", {}, t("places"))),
      h("div", {}, h("b", {}, snap.tribes.length), h("span", {}, t("statCommunities")))),
    h("div", { class: "snap-bar notranslate", translate: "no" }, playBtn,
      h("button", { class: "btn", style: { "box-shadow": "none" }, onclick: () => openSnapshot(Date.now()) }, icon("replay", 16), t("regenerate"))),
    textBox,
    h("div", { class: "related", style: { margin: "6px 0 20px" } }, visible.slice(0, 14).map((e) => h("button", { class: "chip", style: { "--c": entryColor(e) }, onclick: () => { closeDialogs(); openEntry(e.entry_id, { list: visible.map((x) => x.entry_id) }); } }, h("span", { class: "dot" }), N.shortName(e.food_name)))),
    h("h3", { class: "notranslate", translate: "no" }, t("questions")),
    qaList(snap.questions, true),
  ];
  const d = openDialog("dlgSnapshot", "camera", t("snapshotTitle"), body, "wide");
  snapReader = makeReader(textBox, {
    onState: (R) => playBtn.replaceChildren(icon(R.playing ? "pause" : "play", 18), h("span", {}, R.playing ? t("pause") : t("listen"))),
  });
  playBtn.onclick = () => snapReader.toggle();
  snapReader.mark(0, false);
  $$(".snt", textBox).forEach((s) => s.classList.remove("on"));
  d.addEventListener("close", () => snapReader && snapReader.destroy(), { once: true });
}

/* ============================================================== music */
const music = {
  el: null, idx: store.get("track", 0) % TRACKS.length, playing: false, vol: store.get("vol", 0.35), ducked: false, started: false,
  init() {
    this.el = $("#audio");
    this.el.addEventListener("ended", () => this.load(this.idx + 1, true));
    this.el.addEventListener("error", () => { if (this.playing) this.load(this.idx + 1, true); });
    $("#mPlay").onclick = () => (this.playing ? this.pause() : this.play());
    $("#mPrev").onclick = () => this.load(this.idx - 1, this.playing);
    $("#mNext").onclick = () => this.load(this.idx + 1, this.playing);
    $("#mVol").value = Math.round(this.vol * 100);
    $("#mVol").oninput = (e) => { this.vol = e.target.value / 100; store.set("vol", this.vol); this.apply(); };
    this.render();
  },
  apply() { if (this.el) this.el.volume = this.ducked ? Math.min(0.06, this.vol) : this.vol; },
  load(i, autoplay) {
    this.idx = (i + TRACKS.length) % TRACKS.length;
    store.set("track", this.idx);
    this.el.src = TRACKS[this.idx].src;
    this.render();
    if (autoplay) this.play();
  },
  play() {
    if (!this.el.src) this.el.src = TRACKS[this.idx].src;
    this.apply();
    this.el.play().then(() => { this.playing = true; this.started = true; this.render(); }).catch(() => { this.playing = false; this.render(); });
  },
  pause() { this.el.pause(); this.playing = false; this.render(); },
  duck(on) { this.ducked = on; this.apply(); },
  forTribe(tr) { const i = trackFor(tr || ""); if (this.started && i !== this.idx) this.load(i, this.playing); },
  render() {
    $("#music").classList.toggle("playing", this.playing);
    $("#mPlay").replaceChildren(icon(this.playing ? "pause" : "play", 16));
    $("#mPlay").setAttribute("aria-label", this.playing ? "Pause tribal music" : "Play tribal music");
    $("#mTitle").textContent = TRACKS[this.idx].name;
    $("#mIdx").textContent = `${this.idx + 1}/${TRACKS.length}`;
  },
};

/* ============================================================== guestbook
   A community reflection space. GitHub Pages cannot store anything, so the
   shared guestbook uses the project's own Google tools:
     · visitors' reflections are posted to a Google Form (no account needed)
     · the form's response Sheet is read back to show recent reflections
   Both links live in map-guestbook.json. Until they are filled in, the
   guestbook still works but keeps reflections on the visitor's own device. */
const WB_DISTRICTS = ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"];
const GB = {
  config: null, form: null, sheet: null, entries: [], loaded: false, loading: null, error: false,
  q: "", community: "", shown: 10, tab: "write", lastLoad: 0,
};
const MEMORY_MAX = 600;

async function gbConfig() {
  if (GB.config) return GB.config;
  try { GB.config = await (await fetch("map-guestbook.json", { cache: "no-cache" })).json(); }
  catch { GB.config = {}; }
  GB.form = parseFormUrl(GB.config.formUrl || "");
  GB.sheet = parseSheetUrl(GB.config.sheetUrl || "");
  return GB.config;
}
// The pre-filled form link carries the entry ids; placeholder answers name the fields.
function parseFormUrl(u) {
  try {
    const url = new URL(u);
    if (!/docs\.google\.com$/.test(url.hostname) || !/\/forms\//.test(url.pathname)) return null;
    const fields = {};
    for (const [k, v] of url.searchParams) if (k.startsWith("entry.")) fields[v.trim().toUpperCase()] = k;
    if (!fields.NAME || !fields.MEMORY) return null;
    return { action: url.origin + url.pathname.replace(/\/(viewform|formResponse)$/, "") + "/formResponse", fields };
  } catch { return null; }
}
function parseSheetUrl(u) {
  const m = /\/spreadsheets\/d\/([a-zA-Z0-9_-]{20,})/.exec(u || "");
  if (!m) return null;
  const gid = /[#&?]gid=(\d+)/.exec(u)?.[1];
  return { id: m[1], gid };
}
const gbShared = () => !!(GB.form && GB.sheet);
const gbLocal = () => store.get("gb-local", []);
const gbMine = () => store.get("gb-mine", []);

function gvizParse(text) {
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  return JSON.parse(text.slice(start, end + 1));
}
function gvizDate(cell) {
  const v = cell && cell.v;
  const m = typeof v === "string" && /Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)/.exec(v);
  if (m) return new Date(+m[1], +m[2], +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)).getTime();
  const d = Date.parse(cell?.f || v || "");
  return isNaN(d) ? 0 : d;
}
function rowsFromTable(table) {
  const cols = table.cols.map((c) => (c.label || c.id || "").toLowerCase());
  const find = (re) => cols.findIndex((c) => re.test(c));
  const ix = { ts: find(/timestamp|time|date/), name: find(/name/), community: find(/community/), district: find(/district|where|place/), food: find(/food|dish/), memory: find(/memory|reflection|message/), hidden: find(/hidden|hide|remove/), approved: find(/approved|approve|publish/) };
  const val = (r, i) => (i < 0 || !r.c[i] ? "" : String(r.c[i].f ?? r.c[i].v ?? "").trim());
  const yes = (s) => /^(y|yes|true|x|✓|1|hide|hidden|approved|ok)$/i.test(s);
  const out = [];
  for (const r of table.rows || []) {
    if (!r || !r.c) continue;
    const memory = val(r, ix.memory);
    if (memory.length < 3) continue;
    if (ix.hidden >= 0 && yes(val(r, ix.hidden))) continue;
    if (GB.config.requireApproval && !(ix.approved >= 0 && yes(val(r, ix.approved)))) continue;
    out.push({ ts: ix.ts >= 0 ? gvizDate(r.c[ix.ts]) : 0, name: val(r, ix.name), community: val(r, ix.community), district: val(r, ix.district), food: val(r, ix.food), memory: memory.slice(0, MEMORY_MAX) });
  }
  return out;
}
function gvizJsonp(url) {
  return new Promise((resolve, reject) => {
    const cb = "mmmGb" + Date.now();
    const s = document.createElement("script");
    const timer = setTimeout(() => { cleanup(); reject(new Error("timeout")); }, 12000);
    function cleanup() { clearTimeout(timer); delete window[cb]; s.remove(); }
    window[cb] = (res) => { cleanup(); resolve(res); };
    s.src = url.replace("tqx=out:json", `tqx=out:json;responseHandler:${cb}`);
    s.onerror = () => { cleanup(); reject(new Error("load")); };
    document.head.append(s);
  });
}
async function gbLoad(force = false) {
  await gbConfig();
  if (!gbShared()) { GB.loaded = true; GB.entries = []; return; }
  if (GB.loading) return GB.loading;
  if (!force && GB.loaded && Date.now() - GB.lastLoad < 60000) return;
  const { id, gid } = GB.sheet;
  const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&headers=1${gid ? "&gid=" + gid : ""}&_=${Date.now()}`;
  GB.loading = (async () => {
    try {
      let res;
      try { res = gvizParse(await (await fetch(url)).text()); }
      catch { res = await gvizJsonp(url); }
      if (res.status === "error") throw new Error("sheet");
      GB.entries = rowsFromTable(res.table);
      GB.error = false;
      store.set("gb-cache", GB.entries.slice(0, 200));
      // drop my pending items once they show up in the shared list
      const keyOf = (x) => (x.name + "|" + x.memory).toLowerCase();
      const have = new Set(GB.entries.map(keyOf));
      store.set("gb-mine", gbMine().filter((m) => !have.has(keyOf(m)) && Date.now() - m.ts < 3 * 864e5));
    } catch (err) {
      console.warn("Guestbook: could not read the sheet", err);
      GB.error = true;
      GB.entries = store.get("gb-cache", []);
    } finally {
      GB.loaded = true; GB.lastLoad = Date.now(); GB.loading = null;
    }
  })();
  return GB.loading;
}
function gbAll() {
  const mine = (gbShared() ? gbMine() : gbLocal()).map((m) => ({ ...m, mine: true }));
  return [...mine, ...GB.entries].sort((a, b) => b.ts - a.ts);
}
function foodIdOf(text) { return /\b([A-Z]{1,3}-\d{3})\b/.exec(text || "")?.[1] || null; }

async function gbSubmit(data) {
  if (!gbShared()) {
    store.set("gb-local", [{ ...data, ts: Date.now() }, ...gbLocal()].slice(0, 50));
    return "local";
  }
  const body = new URLSearchParams();
  const f = GB.form.fields;
  const put = (key, v) => { if (f[key] && v) body.set(f[key], v); };
  put("NAME", data.name); put("COMMUNITY", data.community); put("DISTRICT", data.district); put("FOOD", data.food); put("MEMORY", data.memory);
  await fetch(GB.form.action, { method: "POST", mode: "no-cors", body });
  store.set("gb-mine", [{ ...data, ts: Date.now() }, ...gbMine()].slice(0, 20));
  return "shared";
}

function gbCard(x) {
  const tribe = Object.keys(TRIBE_COLORS).find((tr) => x.community && new RegExp(tr.split(" ")[0], "i").test(x.community));
  const c = tribe ? tribeColor(tribe) : "#C9A26A";
  const id = foodIdOf(x.food);
  const date = x.ts ? new Date(x.ts).toLocaleDateString(S.lang === "en" ? "en-GB" : S.lang === "bn" ? "bn-IN" : "hi-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
  const name = x.name || t("gbAnonymous");
  return h("article", { class: "gb-card", style: { "--c": c } },
    h("div", { class: "gb-card-head" },
      h("span", { class: "gb-avatar", "aria-hidden": "true" }, (name.trim()[0] || "?").toUpperCase()),
      h("div", { class: "gb-who" },
        h("b", {}, name),
        h("span", { class: "gb-meta" }, [x.district, date].filter(Boolean).join(" · "))),
      x.mine ? h("span", { class: "gb-flag notranslate", translate: "no" }, gbShared() ? t("gbPending") : t("gbLocalBadge")) : null),
    x.community ? h("span", { class: "gb-pill" }, x.community) : null,
    h("p", { class: "gb-text" }, x.memory),
    id && S.byId[id] ? h("button", { class: "chip gb-food", style: { "--c": entryColor(S.byId[id]) }, onclick: () => { closeDialogs(); openEntry(id); } }, h("span", { class: "dot" }), N.shortName(S.byId[id].food_name), h("span", { class: "n" }, id)) :
      x.food ? h("span", { class: "gb-meta" }, "🍲 ", x.food) : null);
}

function gbListBody() {
  const all = gbAll();
  const q = norm(GB.q);
  const list = all.filter((x) => (!GB.community || (x.community || "").toLowerCase().includes(GB.community.toLowerCase())) &&
    (!q || norm(`${x.name} ${x.community} ${x.district} ${x.food} ${x.memory}`).includes(q)));
  const wrap = h("div", { class: "gb-list" });
  if (!all.length) wrap.append(h("p", { class: "empty notranslate", translate: "no" }, GB.loaded ? t("gbEmpty") : t("loading")));
  else if (!list.length) wrap.append(h("p", { class: "empty notranslate", translate: "no" }, t("gbNoMatch")));
  list.slice(0, GB.shown).forEach((x) => wrap.append(gbCard(x)));
  if (list.length > GB.shown) wrap.append(h("button", { class: "btn gb-more notranslate", translate: "no", onclick: () => { GB.shown += 10; gbRenderList(); } }, t("gbMore"), ` (${list.length - GB.shown})`));
  return { wrap, total: all.length, count: list.length };
}
function gbRenderList() {
  const host = $("#gbList");
  if (!host) return;
  const { wrap, total } = gbListBody();
  host.replaceChildren(wrap);
  const n = $("#gbCount"); if (n) n.textContent = total;
  const err = $("#gbErr"); if (err) err.hidden = !GB.error;
}

function gbForm() {
  const tribes = Object.keys(TRIBE_COLORS).filter((x) => !/pan-west/i.test(x));
  const field = (labelKey, control, hint) => h("label", { class: "gb-field" }, h("span", { class: "gb-label notranslate", translate: "no" }, t(labelKey), hint ? h("em", {}, hint) : null), control);
  const name = h("input", { type: "text", maxlength: "60", autocomplete: "name", placeholder: t("gbNamePh"), required: true, value: store.get("gb-name", "") });
  const community = h("input", { type: "text", maxlength: "60", list: "gbTribes", placeholder: t("gbCommunityPh") });
  const district = h("select", {}, h("option", { value: "" }, t("gbDistrictAny")), WB_DISTRICTS.map((d) => h("option", { value: d }, d)), h("option", { value: t("gbOutside") }, t("gbOutside")));
  const food = h("input", { type: "text", maxlength: "120", list: "gbFoods", placeholder: t("gbFoodPh") });
  const memory = h("textarea", { rows: "6", maxlength: String(MEMORY_MAX), placeholder: t("gbMemoryPh"), required: true });
  const counter = h("span", { class: "gb-counter notranslate", translate: "no" });
  const trap = h("input", { type: "text", name: "website", tabindex: "-1", autocomplete: "off", class: "gb-trap", "aria-hidden": "true" });
  const consent = h("input", { type: "checkbox" });
  const status = h("p", { class: "gb-status notranslate", translate: "no", role: "status", "aria-live": "polite" });
  const submit = h("button", { type: "submit", class: "btn btn-accent lg" }, icon("share", 18), h("span", {}, t("gbShare")));
  const opened = Date.now();
  const count = () => {
    const left = MEMORY_MAX - memory.value.length;
    counter.textContent = `${left} ${t("gbLeft")}`;
    counter.classList.toggle("low", left < 60);
  };
  memory.addEventListener("input", count); count();
  const say = (msg, ok = false) => { status.textContent = msg; status.classList.toggle("ok", ok); };
  const form = h("form", { class: "gb-form", novalidate: true, onsubmit: async (ev) => {
    ev.preventDefault();
    const data = { name: name.value.trim().replace(/\s+/g, " "), community: community.value.trim(), district: district.value, food: food.value.trim(), memory: memory.value.trim().replace(/\n{3,}/g, "\n\n") };
    if (trap.value || Date.now() - opened < 2500) return say(t("gbErrSend"));
    if (!data.name) { name.focus(); return say(t("gbErrName")); }
    if (data.memory.length < 3) { memory.focus(); return say(t("gbErrMemory")); }
    if (!consent.checked) { consent.focus(); return say(t("gbErrConsent")); }
    if (Date.now() - store.get("gb-last", 0) < 60000) return say(t("gbWait"));
    submit.disabled = true; submit.replaceChildren(h("span", {}, t("gbSending")));
    try {
      const mode = await gbSubmit(data);
      store.set("gb-last", Date.now()); store.set("gb-name", data.name);
      memory.value = ""; food.value = ""; consent.checked = false; count();
      say(mode === "local" ? t("gbThanksLocal") : t("gbThanks"), true);
      GB.shown = 10; GB.q = ""; GB.community = "";
      gbRenderList();
      if (isMobile()) setTimeout(() => gbSetTab("read"), 900);
    } catch (err) {
      console.warn("Guestbook submit failed", err);
      say(t("gbErrSend"));
    } finally {
      submit.disabled = false; submit.replaceChildren(icon("share", 18), h("span", {}, t("gbShare")));
    }
  } },
  h("datalist", { id: "gbTribes" }, tribes.map((x) => h("option", { value: x }))),
  h("datalist", { id: "gbFoods" }, S.entries.map((e) => h("option", { value: `${N.shortName(e.food_name)} (${e.entry_id})` }))),
  field("gbName", name, " *"),
  h("div", { class: "gb-two" }, field("gbCommunity", community), field("gbDistrict", district)),
  field("gbFood", food),
  field("gbMemory", memory, " *"),
  counter,
  trap,
  h("label", { class: "gb-consent notranslate", translate: "no" }, consent, h("span", {}, t("gbConsent"))),
  h("div", { class: "gb-actions" }, submit),
  status);
  return form;
}
function gbSetTab(tab) {
  GB.tab = tab;
  const d = $("#dlgGuestbook");
  d.dataset.tab = tab;
  $$(".gb-tabs button", d).forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === tab)));
}
async function openGuestbook(tab = "write") {
  await gbConfig();
  GB.shown = 10;
  const communities = [...new Set(gbAll().map((x) => x.community).filter(Boolean))].sort();
  const search = h("input", { type: "search", placeholder: t("gbSearchPh"), value: GB.q, oninput: debounce((e) => { GB.q = e.target.value; GB.shown = 10; gbRenderList(); }, 120) });
  const filter = h("select", { onchange: (e) => { GB.community = e.target.value; GB.shown = 10; gbRenderList(); } },
    h("option", { value: "" }, t("gbAllCommunities")),
    Object.keys(TRIBE_COLORS).filter((x) => !/pan-west/i.test(x)).map((x) => h("option", { value: x.split(" ")[0] }, x)),
    communities.filter((c) => !Object.keys(TRIBE_COLORS).some((x) => new RegExp(x.split(" ")[0], "i").test(c))).map((c) => h("option", { value: c }, c)));
  filter.value = GB.community;
  const body = [
    h("div", { class: "gb-tabs seg notranslate", translate: "no", role: "tablist" },
      h("button", { role: "tab", "data-tab": "write", onclick: () => gbSetTab("write") }, icon("pen", 16), t("gbWriteTab")),
      h("button", { role: "tab", "data-tab": "read", onclick: () => gbSetTab("read") }, icon("book", 16), t("gbReadTab"))),
    h("div", { class: "gb-grid" },
      h("section", { class: "gb-write" },
        h("h3", { class: "notranslate", translate: "no" }, t("gbWriteTitle")),
        h("p", { class: "muted notranslate", translate: "no", style: { "margin-top": "0" } }, t("gbWriteLead")),
        gbShared() ? null : h("p", { class: "gb-note notranslate", translate: "no" }, icon("info", 16), t("gbLocalNote")),
        gbForm(),
        h("p", { class: "fineprint notranslate", translate: "no" }, t("gbModeration"))),
      h("section", { class: "gb-read" },
        h("div", { class: "gb-read-head" },
          h("h3", { class: "notranslate", translate: "no" }, t("gbRecent"), " ", h("span", { class: "gb-count", id: "gbCount" }, "0")),
          gbShared() ? h("button", { class: "linkbtn notranslate", translate: "no", onclick: async () => { await gbLoad(true); gbRenderList(); } }, icon("replay", 14), " ", t("gbRefresh")) : null),
        h("div", { class: "gb-tools" }, search, filter),
        h("p", { id: "gbErr", class: "gb-note notranslate", translate: "no", hidden: true }, t("gbLoadErr")),
        h("div", { id: "gbList", class: "gb-scroll" }))),
  ];
  openDialog("dlgGuestbook", "book", t("guestbook"), body, "xwide");
  $("#dlgGuestbook .dlg-head h2").after(h("span", { class: "dlg-sub notranslate", translate: "no" }, t("gbSub")));
  gbSetTab(tab);
  gbRenderList();
  gbLoad().then(() => gbRenderList());
}
// "Visitor memories" block on an entry's overview
function gbForEntry(e) {
  const mem = gbAll().filter((x) => foodIdOf(x.food) === e.entry_id).slice(0, 3);
  const box = h("div", { class: "field gb-entry", style: { "margin-top": "22px" } },
    h("h4", { class: "notranslate", translate: "no" }, icon("book", 14), t("gbVisitor"), mem.length ? ` · ${mem.length}` : ""),
    mem.map((x) => gbCard(x)),
    h("button", { class: "btn notranslate", translate: "no", style: { "box-shadow": "none", height: "42px", "margin-top": "10px" }, onclick: () => openGuestbook("write").then(() => {
      const f = $("#dlgGuestbook input[list=gbFoods]"); if (f) f.value = `${N.shortName(e.food_name)} (${e.entry_id})`;
      const c = $("#dlgGuestbook input[list=gbTribes]"); if (c && !c.value) c.value = e.tribes[0] || "";
    }) }, icon("pen", 16), t("gbWriteTitle")));
  return box;
}

/* ============================================================== intro */
function showIntroNow() {
  if (EMBED) return false;
  if (location.hash.length > 1) return false;
  return !store.get("intro-seen", false);
}
let introSpin = 0;
function showIntro() {
  const intro = $("#intro");
  intro.hidden = false;
  intro.classList.remove("leaving");
  document.body.classList.add("intro-on");
  S.markersOn = false; syncMarkers();
  setExplore(false); closeSheet({ keepHash: true });
  if (map) map.jumpTo({ ...VIEW_INDIA, pitch: 0 });
  // slow drift of the globe behind the intro
  const spin = () => {
    if (intro.hidden || intro.classList.contains("leaving")) return;
    if (!reduceMotion() && map && !map.isMoving()) map.setCenter([map.getCenter().lng + 0.012, map.getCenter().lat]);
    introSpin = requestAnimationFrame(spin);
  };
  cancelAnimationFrame(introSpin);
  introSpin = requestAnimationFrame(spin);
  setTimeout(() => $("#introBegin").focus(), 100);
}
function leaveIntro(cinematic) {
  const intro = $("#intro");
  cancelAnimationFrame(introSpin);
  store.set("intro-seen", true);
  intro.classList.add("leaving");
  document.body.classList.remove("intro-on");
  setTimeout(() => (intro.hidden = true), 900);
  if ($("#introSound").checked) music.play();
  if (cinematic && !reduceMotion()) {
    map.easeTo({ center: [86.2, 23.6], zoom: 4.6, pitch: 20, duration: 1500 });
    setTimeout(() => map.flyTo({ ...homeCamera(), duration: 4400, curve: 1.42, essential: true, padding: isMobile() ? undefined : padding() }), 1550);
    setTimeout(revealMarkers, 5600);
  } else {
    map.jumpTo(homeCamera());
    revealMarkers();
  }
}
function revealMarkers() {
  S.markersOn = true;
  syncMarkers();
  if (!isMobile() && !EMBED) setExplore(true);
}

/* ============================================================== hash routing */
function routeFromHash({ fly = true } = {}) {
  const hsh = decodeURIComponent(location.hash.slice(1));
  const [k, v] = hsh.split("=");
  if (k === "entry" && S.byId[v]) openEntry(v, { hash: false, fly });
  else if (k === "place" && v) openPlace(v, { hash: false, fly });
  else if (k === "index") { S.view = { type: "index" }; renderSheet(); setSheetOpen(true); }
  else if (!hsh && S.view) { S.view = null; setSheetOpen(false); syncMarkers(); }
}
window.addEventListener("popstate", () => routeFromHash());

/* ============================================================== keyboard */
function onKey(ev) {
  const tag = (ev.target.tagName || "").toLowerCase();
  const typing = ["input", "textarea", "select"].includes(tag) || ev.target.isContentEditable;
  if (ev.key === "Escape") {
    if ($("dialog[open]")) return;
    if (!$("#tour").hidden) return endTour();
    if (!$("#layerPop").hidden) return toggleLayerPop(false);
    if (!$("#sheet").hidden) return closeSheet();
    if (S.exploreOpen) return setExplore(false);
    return;
  }
  if (typing || ev.metaKey || ev.ctrlKey || ev.altKey || !$("#intro").hidden || $("dialog[open]")) return;
  if (!$("#tour").hidden) {
    if (ev.key === " ") { ev.preventDefault(); tourReader?.toggle(); }
    else if (ev.key === "ArrowRight") tourReader?.step(1);
    else if (ev.key === "ArrowLeft") tourReader?.step(-1);
    return;
  }
  const pan = 140;
  switch (ev.key) {
    case "/": ev.preventDefault(); $("#search").focus(); break;
    case "e": case "E": setExplore(!S.exploreOpen); break;
    case "i": case "I": openIndex(); break;
    case "s": case "S": openSnapshot(); break;
    case "h": case "H": goHome(); break;
    case "?": openGuide(); break;
    case "g": case "G": openGuestbook(); break;
    case "[": stepEntry(-1); break;
    case "]": stepEntry(1); break;
    case "ArrowLeft": map.panBy([-pan, 0], { duration: 300 }); break;
    case "ArrowRight": map.panBy([pan, 0], { duration: 300 }); break;
    case "ArrowUp": map.panBy([0, -pan], { duration: 300 }); break;
    case "ArrowDown": map.panBy([0, pan], { duration: 300 }); break;
    case "+": case "=": map.zoomIn({ duration: 300 }); break;
    case "-": case "_": map.zoomOut({ duration: 300 }); break;
    default: return;
  }
}

function toggleLayerPop(open) {
  const pop = $("#layerPop");
  const want = open ?? pop.hidden;
  if (want) renderLayerPop();
  pop.hidden = !want;
  $("#ctlLayers").setAttribute("aria-expanded", String(want));
}

/* ============================================================== boot */
const readyFlags = new Set();
function ready(what) {
  readyFlags.add(what);
  if (readyFlags.has("data") && readyFlags.has("map") && !readyFlags.has("booted")) boot();
}
function boot() {
  readyFlags.add("booted");
  $("#loader").classList.add("done");
  setTimeout(() => $("#loader").remove(), 700);
  applyFilters();
  $(".maplibregl-ctrl-attrib")?.classList.remove("maplibregl-compact-show");
  if (!showIntroNow() && location.hash.length < 2) map.jumpTo(homeCamera());
  if (EMBED) { revealMarkers(); setExplore(false); }
  else if (showIntroNow()) showIntro();
  else revealMarkers();
  if (location.hash.length > 1) routeFromHash({ fly: true });
  // guestbook reflections feed the "Visitor memories" block on each entry
  gbLoad().then(() => { if (S.view && S.view.type === "entry" && S.view.tab === "overview") renderSheet(); }).catch(() => {});
}

function wire() {
  $$("[data-ic]").forEach((el) => el.replaceChildren(icon(el.dataset.ic, +(el.dataset.size || 18))));
  $$("[data-warli]").forEach((el) => el.replaceChildren(warli(+el.dataset.warli, 16)));
  $("#btnExplore").onclick = () => setExplore(!S.exploreOpen);
  $$("[data-close='explore']").forEach((b) => (b.onclick = () => setExplore(false)));
  $("#btnSnapshot").onclick = () => openSnapshot();
  $("#btnGuestbook").onclick = () => openGuestbook();
  $("#btnIndex").onclick = () => (S.view && S.view.type === "index" ? closeSheet() : openIndex());
  $("#btnGuide").onclick = openGuide;
  $("#btnAbout").onclick = openAbout;
  $("#btnSettings").onclick = openSettings;
  $("#ctlIn").onclick = () => map.zoomIn();
  $("#ctlOut").onclick = () => map.zoomOut();
  $("#ctlNorth").onclick = () => map.easeTo({ bearing: 0, pitch: S.terrain ? map.getPitch() : 0, duration: 600 });
  $("#ctl3d").onclick = () => setTerrain(!S.terrain);
  $("#ctl3d").setAttribute("aria-pressed", String(S.terrain));
  $("#ctlLayers").onclick = (ev) => { ev.stopPropagation(); toggleLayerPop(); };
  $("#ctlHome").onclick = goHome;
  document.addEventListener("click", (ev) => {
    if (!$("#layerPop").hidden && !ev.target.closest("#layerPop, #ctlLayers")) toggleLayerPop(false);
    if (!$("#searchResults").hidden && !ev.target.closest(".tb-search")) $("#searchResults").hidden = true;
  });
  $("#search").addEventListener("input", debounce(runSearch, 90));
  $("#search").addEventListener("focus", () => { if ($("#search").value) runSearch(); });
  $("#search").addEventListener("keydown", searchKeys);
  $("#tourClose").onclick = endTour;
  $("#tourPlay").onclick = () => tourReader?.toggle();
  $("#tourReplay").onclick = () => tourReader?.restart();
  $("#tourPrev").onclick = () => tourReader?.step(-1);
  $("#tourNext").onclick = () => tourReader?.step(1);
  $("#tourRate").onchange = (e) => { if (tourReader) { tourReader.rate = +e.target.value; if (tourReader.playing) tourReader.play(); } };
  $("#tourVoice").onchange = (e) => { store.set("voice-" + speechLang(), e.target.value); if (tourReader?.playing) tourReader.play(); };
  $("#introBegin").onclick = () => leaveIntro(true);
  $("#introSkip").onclick = () => leaveIntro(false);
  document.addEventListener("keydown", onKey);
  mqMobile.addEventListener?.("change", () => { if (isMobile() && S.exploreOpen && !$("#sheet").hidden) setExplore(false); });
  if (EMBED) {
    document.body.classList.add("embed");
    $("#btnFull").hidden = false;
    $("#btnFull").href = "map.html" + location.hash;
    $("#brand").target = "_top";
  }
}

async function loadData() {
  const res = await fetch("map-archive.json", { cache: "no-cache" });
  if (!res.ok) throw new Error("archive " + res.status);
  const data = await res.json();
  S.data = data;
  S.entries = data.entries;
  S.byId = Object.fromEntries(data.entries.map((e) => [e.entry_id, e]));
  S.trails = data.trails;
  S.layers = data.layers;
  try { S.districtGeo = await (await fetch("map-wb-districts.geojson")).json(); } catch { S.districtGeo = null; }
  S.filtered = S.entries.slice();
  S.places = buildPlaces(S.entries);
  S.placeByKey = new Map(S.places.map((p) => [p.key, p]));
  ready("data");
}

function start() {
  document.body.dataset.theme = S.theme;
  document.documentElement.style.setProperty("--scale", S.scale);
  document.body.classList.toggle("reduce-motion", !!S.reduce);
  document.body.classList.toggle("no-bounds", !S.boundaries);
  wire();
  setLang(initialLang(), { initial: true });
  music.init();
  if (!window.maplibregl) {
    $("#loader p").textContent = "The map engine could not load. Please refresh the page.";
    return;
  }
  initMap();
  loadData().catch((err) => {
    console.error(err);
    $("#loader p").textContent = "The archive could not load. Please refresh the page.";
  });
  // never leave people staring at the veil if the basemap is slow
  setTimeout(() => { if (!readyFlags.has("booted") && readyFlags.has("data")) { readyFlags.add("map"); boot(); } }, 9000);
}

window.__mmm = { S, GB, gbLoad, get map() { return map; }, readyFlags }; // console debugging aid
window.__mmm = { S, GB, gbLoad, get map() { return map; }, readyFlags }; // console debugging aid
start();
