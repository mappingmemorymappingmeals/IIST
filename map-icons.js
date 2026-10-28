// Line icons, 24x24, stroke based. Tribal / Warli-inspired icons come from the
// first version of the map; interface icons are drawn in the same style.
// Icons are built with createElementNS from a fixed internal table, never from
// archive text, so no markup from data ever reaches the page.

const P = {
  // tribal & food icons
  pot: [["path", "M8 4h8M9 4c0 2-2 3-2 5 0 4 2 7 5 7s5-3 5-7c0-2-2-3-2-5"], ["path", "M12 16v3"], ["path", "M9 21h6"], ["circle", { cx: 12, cy: 9, r: 1, fill: "currentColor", stroke: "none" }]],
  grain: [["path", "M12 21V8"], ["path", "M12 8c-3 0-4-2-4-4 2 0 4 1 4 4zM12 8c3 0 4-2 4-4-2 0-4 1-4 4z"], ["path", "M12 13c-3 0-4-2-4-4 2 0 4 1 4 4zM12 13c3 0 4-2 4-4-2 0-4 1-4 4z"], ["path", "M12 18c-3 0-4-2-4-4 2 0 4 1 4 4zM12 18c3 0 4-2 4-4-2 0-4 1-4 4z"]],
  root: [["path", "M12 3v5"], ["path", "M9 5c1 1 2 2 3 3 1-1 2-2 3-3"], ["path", "M12 8c-4 1-5 4-5 7 0 3 2 6 5 6s5-3 5-6c0-3-1-6-5-7z"], ["path", "M10 13l4 4M14 13l-4 4"]],
  mushroom: [["path", "M4 12c0-5 4-8 8-8s8 3 8 8H4z"], ["path", "M9 12l-1 6c0 2 1 3 4 3s4-1 4-3l-1-6"], ["circle", { cx: 9, cy: 8, r: 0.8, fill: "currentColor", stroke: "none" }], ["circle", { cx: 14, cy: 7, r: 0.8, fill: "currentColor", stroke: "none" }]],
  leaf: [["path", "M5 19C5 9 12 4 20 4c0 9-5 15-15 15z"], ["path", "M5 19c3-5 7-9 11-11"]],
  fish: [["path", "M3 12c3-4 7-6 11-6 3 0 6 2 7 6-1 4-4 6-7 6-4 0-8-2-11-6z"], ["path", "M14 6l3 6-3 6"], ["circle", { cx: 7, cy: 11, r: 1, fill: "currentColor", stroke: "none" }]],
  flame: [["path", "M12 3c1 3 5 5 5 10a5 5 0 01-10 0c0-3 1-4 2-6 1 2 2 3 3 3 0-3-1-5 0-7z"], ["path", "M7 21h10"]],
  ant: [["circle", { cx: 12, cy: 6, r: 2 }], ["circle", { cx: 12, cy: 12, r: 2.5 }], ["circle", { cx: 12, cy: 18, r: 2 }], ["path", "M9 5L6 3M15 5l3-2M9 12H4M20 12h-5M9 19l-3 2M15 19l3 2"]],
  fruit: [["circle", { cx: 12, cy: 14, r: 6 }], ["path", "M12 8c0-3 1-4 3-5"], ["path", "M12 8c2-2 4-2 5-1"]],
  herb: [["path", "M12 21v-9"], ["path", "M12 12c0-4 3-6 6-6 0 4-2 6-6 6zM12 12c0-4-3-6-6-6 0 4 2 6 6 6z"], ["path", "M9 18h6M12 15v6"]],
  altar: [["path", "M12 3c1 2 3 3 3 6a3 3 0 11-6 0c0-3 2-4 3-6z"], ["path", "M5 15h14M7 15l-1 6M17 15l1 6M12 15v6"]],
  bowl: [["path", "M4 11h16c0 5-3 8-8 8s-8-3-8-8z"], ["path", "M9 7c0-2 1-3 3-3s3 1 3 3"]],
  pitha: [["path", "M12 3l8 9-8 9-8-9z"], ["path", "M12 8l4 4-4 4-4-4z"], ["circle", { cx: 12, cy: 12, r: 1, fill: "currentColor", stroke: "none" }]],
  ecology: [["path", "M4 18c2-6 6-10 12-12-1 7-5 11-12 12z"], ["path", "M3 21c4-2 8-2 12 0M4 18c2-2 5-5 8-7"]],
  community: [["circle", { cx: 12, cy: 5, r: 2 }], ["path", "M12 7v4M8 21l4-10 4 10M9 16h6"], ["circle", { cx: 5, cy: 9, r: 1.5 }], ["path", "M5 10.5V13M3.5 17l1.5-4 1.5 4"], ["circle", { cx: 19, cy: 9, r: 1.5 }], ["path", "M19 10.5V13M17.5 17l1.5-4 1.5 4"]],
  sun: [["circle", { cx: 12, cy: 12, r: 4 }], ["path", "M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M19.5 4.5l-2 2M6.5 17.5l-2 2"]],
  drum: [["ellipse", { cx: 12, cy: 7, rx: 7, ry: 2.5 }], ["path", "M5 7v9c0 1.5 3 2.8 7 2.8s7-1.3 7-2.8V7"], ["path", "M5 11l14 3M19 11L5 14"]],
  scroll: [["path", "M6 4h10a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2z"], ["path", "M6 4a2 2 0 00-2 2v2h4"], ["path", "M10 9h5M10 12h5M10 15h3"]],
  broken: [["path", "M9 4a8 8 0 00-5 8 8 8 0 008 8M15 4a8 8 0 015 8"], ["path", "M15 20l2-3M19 17l-2-1M14 16l3 4"]],
  weave: [["path", "M4 8l8-5 8 5-8 5z"], ["path", "M4 8v8l8 5 8-5V8"], ["path", "M12 13v8"]],
  pin: [["path", "M12 21s-6-6-6-11a6 6 0 1112 0c0 5-6 11-6 11z"], ["circle", { cx: 12, cy: 10, r: 2 }]],
  eye: [["path", "M2 12c3-5 6.5-7 10-7s7 2 10 7c-3 5-6.5 7-10 7s-7-2-10-7z"], ["circle", { cx: 12, cy: 12, r: 3 }]],
  spiral: [["path", "M12 12a2 2 0 104 0 4 4 0 10-8 0 6 6 0 1012 0 8 8 0 10-16 0"]],
  music: [["path", "M9 18V5l10-2v13"], ["circle", { cx: 6.5, cy: 18, r: 2.5 }], ["circle", { cx: 16.5, cy: 16, r: 2.5 }]],
  camera: [["path", "M4 8h3l2-3h6l2 3h3a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z"], ["circle", { cx: 12, cy: 13, r: 3.5 }]],
  // interface icons
  x: [["path", "M6 6l12 12M18 6L6 18"]],
  search: [["circle", { cx: 11, cy: 11, r: 6.5 }], ["path", "M16 16l4.5 4.5"]],
  "chev-l": [["path", "M15 5l-7 7 7 7"]],
  "chev-r": [["path", "M9 5l7 7-7 7"]],
  "chev-d": [["path", "M5 9l7 7 7-7"]],
  "arrow-l": [["path", "M20 12H5M11 5l-7 7 7 7"]],
  play: [["path", "M7 4.5v15l12.5-7.5z", { fill: "currentColor" }]],
  pause: [["path", "M7 4.5h3.5v15H7zM13.5 4.5H17v15h-3.5z", { fill: "currentColor" }]],
  replay: [["path", "M4 12a8 8 0 1 0 2.5-5.8"], ["path", "M4 4v4.5h4.5"]],
  prev: [["path", "M18 5v14L8 12z", { fill: "currentColor" }], ["path", "M6 5v14"]],
  next: [["path", "M6 5v14l10-7z", { fill: "currentColor" }], ["path", "M18 5v14"]],
  home: [["path", "M4 11l8-7 8 7"], ["path", "M6 9.5V20h12V9.5"], ["path", "M10 20v-5h4v5"]],
  plus: [["path", "M12 5v14M5 12h14"]],
  minus: [["path", "M5 12h14"]],
  compass: [["circle", { cx: 12, cy: 12, r: 9 }], ["path", "M12 5l2.2 7H9.8z", { fill: "currentColor", stroke: "none" }], ["path", "M12 19l-2.2-7h4.4z"]],
  mountain: [["path", "M3 19l6-10 4 6 2.5-3.5L21 19z"], ["path", "M7.5 11.5l1.5 1 1.5-1"]],
  layers: [["path", "M12 3l9 5-9 5-9-5z"], ["path", "M3 13l9 5 9-5"]],
  list: [["path", "M9 6h11M9 12h11M9 18h11"], ["circle", { cx: 4.5, cy: 6, r: 1, fill: "currentColor", stroke: "none" }], ["circle", { cx: 4.5, cy: 12, r: 1, fill: "currentColor", stroke: "none" }], ["circle", { cx: 4.5, cy: 18, r: 1, fill: "currentColor", stroke: "none" }]],
  sliders: [["path", "M4 7h10M18 7h2M4 17h4M12 17h8"], ["circle", { cx: 16, cy: 7, r: 2 }], ["circle", { cx: 10, cy: 17, r: 2 }]],
  help: [["circle", { cx: 12, cy: 12, r: 9 }], ["path", "M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.6V14"], ["circle", { cx: 12, cy: 17.2, r: 0.9, fill: "currentColor", stroke: "none" }]],
  info: [["circle", { cx: 12, cy: 12, r: 9 }], ["path", "M12 11v6"], ["circle", { cx: 12, cy: 7.8, r: 0.9, fill: "currentColor", stroke: "none" }]],
  gear: [["circle", { cx: 12, cy: 12, r: 3 }], ["path", "M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"]],
  share: [["circle", { cx: 18, cy: 5.5, r: 2.5 }], ["circle", { cx: 6, cy: 12, r: 2.5 }], ["circle", { cx: 18, cy: 18.5, r: 2.5 }], ["path", "M8.2 10.8l7.6-4M8.2 13.2l7.6 4"]],
  quote: [["path", "M10 7H6.5A1.5 1.5 0 0 0 5 8.5V12h4v1c0 2-1 3-3 3.5M19 7h-3.5A1.5 1.5 0 0 0 14 8.5V12h4v1c0 2-1 3-3 3.5"]],
  target: [["circle", { cx: 12, cy: 12, r: 7 }], ["circle", { cx: 12, cy: 12, r: 2.5 }], ["path", "M12 2v3M12 19v3M2 12h3M19 12h3"]],
  external: [["path", "M14 4h6v6M20 4l-9 9"], ["path", "M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"]],
  volume: [["path", "M4 9.5h3.5L12 5.5v13l-4.5-4H4z"], ["path", "M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"]],
  mute: [["path", "M4 9.5h3.5L12 5.5v13l-4.5-4H4z"], ["path", "M16 9.5l5 5M21 9.5l-5 5"]],
  moon: [["path", "M19 14.5A7.5 7.5 0 0 1 9.5 5 7.5 7.5 0 1 0 19 14.5z"]],
  filter: [["path", "M4 5h16l-6 7.5V19l-4 1.5v-8z"]],
  type: [["path", "M5 7V5h14v2M12 5v14M9 19h6"]],
  check: [["path", "M5 12.5l4.5 4.5L19 7.5"]],
  expand: [["path", "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"]],
  book: [["path", "M3 5.5c2.6-1.1 5.6-.9 9 1.2v13c-3.4-2.1-6.4-2.3-9-1.2z"], ["path", "M21 5.5c-2.6-1.1-5.6-.9-9 1.2v13c3.4-2.1 6.4-2.3 9-1.2z"]],
  pen: [["path", "M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10z"], ["path", "M14 7l3 3"]],
  star: [["path", "M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"]],
};

const NS = "http://www.w3.org/2000/svg";

export function icon(name, size = 18, extraClass = "") {
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.6");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.setAttribute("class", ("ic " + extraClass).trim());
  for (const part of P[name] || P.bowl) {
    const [tag, a, b] = part;
    const el = document.createElementNS(NS, tag);
    if (typeof a === "string") {
      el.setAttribute("d", a);
      if (b) for (const [k, v] of Object.entries(b)) el.setAttribute(k, v);
    } else {
      for (const [k, v] of Object.entries(a)) el.setAttribute(k, v);
    }
    svg.appendChild(el);
  }
  return svg;
}

// Warli strip: dancing figures used as a section divider
export function warli(count = 6, size = 15) {
  const wrap = document.createElement("div");
  wrap.className = "warli";
  wrap.setAttribute("aria-hidden", "true");
  for (let i = 0; i < count; i++) {
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.4");
    svg.setAttribute("stroke-linecap", "round");
    if (i % 2) svg.style.transform = "scaleX(-1)";
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", 12); c.setAttribute("cy", 5); c.setAttribute("r", 2.4);
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", "M12 7.5L9 13h6zM9 13l-2 6M15 13l2 6M12 7.5 5 10M12 7.5l7 2.5");
    svg.append(c, p);
    wrap.appendChild(svg);
  }
  return wrap;
}
