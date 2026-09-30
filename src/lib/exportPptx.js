// Native, editable PowerPoint export (pptxgenjs). Layouts mirror slides/Slides.jsx on the same
// 1280×720 px grid (1 in = 96 px), so what you see in the tool is what lands in PowerPoint.
import PptxGenJS from "pptxgenjs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { C, LOGO_SVG, LOGO_WHITE_SVG, XMARK_WHITE_SVG, PHOTOS, PHOTO_SIZE, CUTOUTS, LOGO_ASPECT } from "../brand/brand.js";
import { USMap } from "../components/USMap.jsx";
import { SLIDE_TYPES, resolveSlide, slideAvailable } from "../slides/defs.js";
import { ZONES, rateGrid, bandLabel } from "./pricing.js";
import { fmtMoney, fmtPct, fmtInt, slug } from "./format.js";

const SW = 1280, SH = 720, M = 64;
const I = (px) => px / 96;              // px → inches
const PT = (px) => Math.round(px * 0.75 * 10) / 10; // px → points
const HEAD = "Arial", BODY = "Arial";
const hex = (c) => c.replace("#", "").toUpperCase();

// ── asset helpers ──────────────────────────────────────────────────────────
async function toDataUrl(src) {
  if (src.startsWith("data:")) return src;
  const b = await (await fetch(src)).blob();
  return await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(b); });
}
async function svgToPng(svg, w, h) {
  const img = new Image();
  const src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = src; });
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  cv.getContext("2d").drawImage(img, 0, 0, w, h);
  return cv.toDataURL("image/png");
}

// ── drawing primitives ─────────────────────────────────────────────────────
function text(s, str, x, y, w, h, o = {}) {
  s.addText(str ?? "", {
    x: I(x), y: I(y), w: I(w), h: I(h), margin: 0, valign: "top",
    fontFace: o.head ? HEAD : BODY, fontSize: PT(o.size || 16), color: hex(o.color || C.ink),
    bold: !!o.bold, charSpacing: o.spacing, align: o.align || "left", lineSpacingMultiple: o.lh || 1.15,
    fit: o.fit || "shrink", ...(o.extra || {}),
  });
}
function rect(s, x, y, w, h, fill, o = {}) {
  s.addShape(o.shape || "rect", {
    x: I(x), y: I(y), w: I(w), h: I(h),
    fill: { color: hex(fill), transparency: o.transparency || 0 },
    line: o.line ? { color: hex(o.line), width: o.lineW || 0.75 } : { type: "none" },
    rectRadius: o.radius, flipH: o.flipH, flipV: o.flipV,
  });
}
const rrect = (s, x, y, w, h, fill, r = 14, o = {}) => rect(s, x, y, w, h, fill, { ...o, shape: "roundRect", radius: Math.min(I(r), Math.min(I(w), I(h)) / 2) });
const para = (s, x, y, w, h, fill) => rect(s, x, y, w, h, fill, { shape: "parallelogram" });

function numTile(s, n, x, y, color = C.blue, w = 64, h = 34) {
  para(s, x - 8, y, w + 16, h, color);
  text(s, String(n).padStart(2, "0"), x, y, w, h, { head: true, bold: true, size: 17, color: "#fff", align: "center", extra: { valign: "middle" } });
}

function header(s, f, dark, w = SW - 2 * M, size = 40) {
  let y = 56;
  if (f.eyebrow) { text(s, String(f.eyebrow).toUpperCase(), M, y, w, 20, { size: 13, bold: true, color: dark ? C.mint : C.orange, spacing: 4 }); y += 32; }
  const lines = Math.ceil((String(f.title || "").length * size * 0.5) / w) || 1;
  const th = Math.min(3, lines) * size * 1.18;
  text(s, f.title, M, y, w, th, { head: true, bold: true, size, color: dark ? "#fff" : C.deep, lh: 1.0 });
  y += th + 12;
  if (f.lede) text(s, f.lede, M, y, Math.min(w, 900), 60, { size: 17, color: dark ? "#D6E4E3" : C.ink, lh: 1.25 });
}

function footer(s, A, ctx, n, dark) {
  s.addImage({ data: dark ? A.logoWhite : A.logo, x: I(M), y: I(SH - 44 + 3), w: I(14 * LOGO_ASPECT), h: I(14) });
  const t = [ctx.deal.client ? `Prepared for ${ctx.deal.client}` : null, "Confidential"].filter(Boolean).join("  ·  ");
  text(s, t, M + 200, SH - 44, SW - 2 * M - 400, 20, { size: 11, color: dark ? "#9FB5B4" : C.muted, align: "center", fit: "none" });
  text(s, String(n).padStart(2, "0"), SW - M - 60, SH - 44, 60, 20, { size: 11, bold: true, color: dark ? "#9FB5B4" : C.muted, align: "right", fit: "none" });
}

// Photo that fills (cover) or fits (contain, for cut-outs) a box.
function photo(s, A, k, x, y, w, h) {
  if (!k || !A.photos[k]) return;
  const [nw, nh] = PHOTO_SIZE[k];
  if (CUTOUTS.has(k)) {
    const sc = Math.min(w / nw, h / nh), dw = nw * sc, dh = nh * sc;
    s.addImage({ data: A.photos[k], x: I(x + (w - dw) / 2), y: I(y + (h - dh) / 2), w: I(dw), h: I(dh) });
  } else {
    const sc = Math.max(w / nw, h / nh), dw = nw * sc, dh = nh * sc;
    s.addImage({ data: A.photos[k], x: I(x), y: I(y), w: I(dw), h: I(dh), sizing: { type: "crop", x: I((dw - w) / 2), y: I((dh - h) / 2), w: I(w), h: I(h) } });
  }
}

// ── slide builders ─────────────────────────────────────────────────────────
const B = {};

B.cover = (s, f, ctx, A) => {
  const cut = CUTOUTS.has(f.photo);
  if (f.photo && !cut) {
    photo(s, A, f.photo, 600, 0, 680, SH);
    // Diagonal edge: white triangle over the photo's left side, then a teal stripe.
    rect(s, 596, -1, 184, SH + 2, "#FFFFFF", { shape: "rtTriangle", flipV: true });
    s.addShape("line", { x: I(780), y: I(0), w: I(180), h: I(SH), flipH: true, line: { color: hex(C.teal), width: 12 } });
  } else if (cut) {
    para(s, 700, 120, 520, 480, C.teal);
    photo(s, A, f.photo, 780, 70, 400, 560);
  }
  s.addImage({ data: A.logo, x: I(M), y: I(72), w: I(300), h: I(300 / LOGO_ASPECT) });
  text(s, String(f.eyebrow || "").toUpperCase(), M, 230, 560, 20, { size: 13, bold: true, color: C.orange, spacing: 4 });
  text(s, f.title, M, 262, 540, 190, { head: true, bold: true, size: 48, color: C.deep, lh: 1.0 });
  text(s, f.subtitle, M, 462, 540, 60, { size: 19, color: C.ink });
  let x = M;
  [["Prepared for", f.preparedFor], ["Prepared by", f.preparedBy], ["Date", f.date]].filter((v) => v[1]).forEach(([k, v]) => {
    text(s, k.toUpperCase(), x, 560, 200, 16, { size: 11, color: C.muted, spacing: 2.5 });
    text(s, v, x, 580, 190, 48, { size: 15, bold: true, color: C.deep });
    x += 210;
  });
};

B.about = (s, f, ctx, A) => {
  para(s, 60, 190, 540, 380, C.teal);
  para(s, 300, 150, 250, 92, C.deep);
  s.addImage({ data: A.xmarkWhite, x: I(370), y: I(166), w: I(120), h: I(58) });
  photo(s, A, f.photo, 70, 110, 420, 460);
  text(s, String(f.eyebrow || "").toUpperCase(), 640, 110, 576, 20, { size: 13, bold: true, color: C.orange, spacing: 4 });
  text(s, f.title, 640, 142, 576, 52, { head: true, bold: true, size: 40, color: C.deep });
  text(s, f.body, 640, 204, 576, 230, { size: 16, lh: 1.3 });
  (f.stats || []).slice(0, 4).forEach(([v, l], i) => {
    const x = 640 + (i % 2) * 302, y = 452 + Math.floor(i / 2) * 96;
    rect(s, x, y, 274, 2, C.line);
    text(s, v, x, y + 12, 274, 38, { head: true, bold: true, size: 34, color: C.orange });
    text(s, String(l).toUpperCase(), x, y + 54, 274, 34, { size: 12, spacing: 0.8 });
  });
};

B.problem = (s, f) => {
  header(s, f);
  const cards = (f.cards || []).slice(0, 4), n = Math.max(1, cards.length);
  const cw = (SW - 2 * M - (n - 1) * 20) / n;
  cards.forEach(([h, b], i) => {
    const x = M + i * (cw + 20);
    rrect(s, x, 300, cw, 250, C.gray, 14);
    rect(s, x, 300, cw, 4, C.orange);
    text(s, h, x + 22, 324, cw - 44, 56, { head: true, bold: true, size: 21, color: C.deep, lh: 1.0 });
    text(s, b, x + 22, 386, cw - 44, 150, { size: 14, lh: 1.25 });
  });
  if (f.callout) { rrect(s, M, 572, SW - 2 * M, 72, C.deep, 14); text(s, f.callout, M + 28, 572, SW - 2 * M - 56, 72, { head: true, size: 21, color: "#fff", extra: { valign: "middle" } }); }
};

B.solution = (s, f, ctx, A) => {
  photo(s, A, "boxes", 900, -30, 400, 250);
  header(s, f, true, 820);
  const p = (f.pillars || []).slice(0, 3), n = Math.max(1, p.length);
  const cw = (SW - 2 * M - (n - 1) * 22) / n;
  p.forEach(([tag, h, b], i) => {
    const x = M + i * (cw + 22);
    rrect(s, x, 330, cw, 300, "#1A4449", 16, { line: "#2F5A5E" });
    numTile(s, i + 1, x + 34, 356, C.teal);
    text(s, String(tag).toUpperCase(), x + 26, 412, cw - 52, 18, { size: 12, color: C.orange, spacing: 2.5, bold: true });
    text(s, h, x + 26, 436, cw - 52, 60, { head: true, bold: true, size: 24, color: "#fff", lh: 1.0 });
    text(s, b, x + 26, 500, cw - 52, 120, { size: 15, color: "#C9D8D7", lh: 1.25 });
  });
};

B.journey = (s, f) => {
  header(s, f);
  const cw = (SW - 2 * M - 72) / 3;
  (f.steps || []).slice(0, 9).forEach(([h, b], i) => {
    const x = M + (i % 3) * (cw + 36), y = 290 + Math.floor(i / 3) * 118;
    numTile(s, i + 1, x + 8, y, /accept/i.test(h) ? C.orange : C.blue);
    text(s, String(h).toUpperCase(), x + 92, y, cw - 92, 24, { head: true, bold: true, size: 18, color: C.deep });
    text(s, b, x + 92, y + 26, cw - 92, 70, { size: 13.5, lh: 1.2 });
  });
};

B.integration = (s, f) => {
  header(s, f);
  const p = (f.paths || []).slice(0, 3), n = Math.max(1, p.length);
  const cw = (SW - 2 * M - (n - 1) * 22) / n;
  p.forEach(([tag, h, b], i) => {
    const x = M + i * (cw + 22);
    rrect(s, x, 300, cw, 260, "#FFFFFF", 16, { line: C.line });
    text(s, String(tag).toUpperCase(), x + 26, 326, cw - 52, 18, { size: 12, color: C.orange, spacing: 2.5, bold: true });
    text(s, h, x + 26, 352, cw - 52, 60, { head: true, bold: true, size: 24, color: C.deep, lh: 1.0 });
    text(s, b, x + 26, 418, cw - 52, 130, { size: 15, lh: 1.25 });
  });
  if (f.footnote) { rect(s, M, 590, 4, 50, C.teal); text(s, f.footnote, M + 20, 590, SW - 2 * M - 20, 50, { size: 15, color: C.teal, bold: true, extra: { valign: "middle" } }); }
};

B.network = (s, f, ctx, A) => {
  text(s, String(f.eyebrow || "").toUpperCase(), M, 56, 400, 20, { size: 13, bold: true, color: C.orange, spacing: 4 });
  text(s, f.title, M, 88, 400, 130, { head: true, bold: true, size: 34, color: C.deep, lh: 1.0 });
  text(s, f.lede, M, 228, 400, 170, { size: 15, lh: 1.25 });
  (f.stats || []).slice(0, 4).forEach(([v, l], i) => {
    const x = M + (i % 2) * 210, y = 420 + Math.floor(i / 2) * 112;
    rect(s, x, y, 190, 2, C.line);
    text(s, v, x, y + 10, 190, 34, { head: true, bold: true, size: 30, color: i === 3 ? C.orange : C.teal });
    text(s, l, x, y + 48, 190, 54, { size: 12, lh: 1.15 });
  });
  s.addImage({ data: A.map, x: I(500), y: I(70), w: I(740), h: I(462.5) });
  let x = 520;
  const items = [[C.deep, "DropX hub market"]];
  if (ctx.analysis?.zip3Count && !ctx.analysis.estimate) items.push([C.orange, `${ctx.deal.client || "Client"} parcel origins`]);
  if (ctx.locations?.length) items.push([C.teal, "DropX drop-off location"]);
  items.forEach(([c, l]) => {
    s.addShape("ellipse", { x: I(x), y: I(566), w: I(12), h: I(12), fill: { color: hex(c), transparency: c === C.orange ? 40 : 0 }, line: { type: "none" } });
    text(s, l, x + 20, 562, 240, 20, { size: 13, fit: "none" });
    x += 40 + l.length * 7.2;
  });
};

B.growth = (s, f) => {
  header(s, f);
  const ms = (f.milestones || []).slice(0, 6), n = Math.max(1, ms.length);
  const cw = (SW - 2 * M) / n;
  rect(s, M, 330, SW - 2 * M, 3, C.line);
  ms.forEach(([when, loc, phase, det], i) => {
    const x = M + i * cw, last = i === n - 1, col = last ? C.teal : C.deep;
    text(s, String(when).toUpperCase(), x, 300, cw - 18, 18, { size: 12, bold: true, color: C.orange, spacing: 2 });
    s.addShape("ellipse", { x: I(x), y: I(323), w: I(17), h: I(17), fill: { color: hex(col) }, line: { color: "FFFFFF", width: 2 } });
    text(s, loc, x, 356, cw - 18, 42, { head: true, bold: true, size: 36, color: col });
    text(s, phase, x, 404, cw - 18, 24, { head: true, bold: true, size: 16, color: C.deep });
    text(s, det, x, 432, cw - 18, 130, { size: 13, lh: 1.2 });
  });
};

// Single-series horizontal bar chart (native, editable). Value label on every bar.
function barChart(s, x, y, w, h, labels, values, color, fmtCode) {
  s.addChart("bar", [{ name: "Share", labels, values }], {
    x: I(x), y: I(y), w: I(w), h: I(h), barDir: "bar", barGapWidthPct: 60,
    chartColors: [hex(color)], catAxisOrientation: "maxMin", valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    catAxisLabelFontFace: BODY, catAxisLabelFontSize: 10, catAxisLabelColor: hex(C.ink), catAxisLineShow: false,
    showValue: true, dataLabelFormatCode: fmtCode, dataLabelFontSize: 10, dataLabelFontFace: BODY, dataLabelColor: hex(C.deep), dataLabelPosition: "outEnd",
    showLegend: false,
  });
}

B.profile = (s, f, ctx) => {
  const a = ctx.analysis;
  header(s, f);
  if (!a) return;
  (f.kpis || []).slice(0, 4).forEach(([v, l], i) => {
    const cw = (SW - 2 * M - 54) / 4, x = M + i * (cw + 18);
    rrect(s, x, 250, cw, 110, i === 0 ? C.deep : C.gray, 14);
    text(s, v, x + 20, 268, cw - 40, 38, { head: true, bold: true, size: 32, color: i === 0 ? "#fff" : C.deep });
    text(s, l, x + 20, 314, cw - 40, 36, { size: 13, color: i === 0 ? "#C9D8D7" : C.ink });
  });
  const bands = a.bands.filter((b) => b.share > 0);
  const right = a.states?.length ? { title: "Top origin states", items: a.states.slice(0, 8).map(([k, c]) => [k, c / a.n]) }
    : a.carriers?.length > 1 ? { title: "Current carrier mix", items: a.carriers.slice(0, 8).map(([k, c]) => [k, c / a.carrierTotal]) } : null;
  const lw = right ? 560 : SW - 2 * M;
  text(s, "Share of parcels by weight", M, 390, lw, 24, { head: true, bold: true, size: 17, color: C.deep });
  barChart(s, M, 418, lw, 240, bands.map((b) => b.label), bands.map((b) => b.share), C.teal, "0%");
  if (right) {
    text(s, right.title, 700, 390, 516, 24, { head: true, bold: true, size: 17, color: C.deep });
    barChart(s, 700, 418, 516, 240, right.items.map((x) => x[0]), right.items.map((x) => x[1]), C.blue, "0%");
  }
};

B.savings = (s, f, ctx) => {
  const a = ctx.analysis, sv = a?.savings;
  header(s, f, false, SW - 2 * M, 38);
  if (!sv) return;
  text(s, "ESTIMATED ANNUAL SAVINGS", M, 262, 470, 18, { size: 12, color: C.muted, spacing: 2.5 });
  text(s, fmtMoney(sv.annual, 0), M, 282, 480, 84, { head: true, bold: true, size: 72, color: sv.annual >= 0 ? C.teal : C.orange });
  text(s, `${fmtMoney(sv.annualCur, 0)} today → ${fmtMoney(sv.annualDx, 0)} with DropX · ${fmtInt(a.annualVolume)} parcels / yr`, M, 368, 480, 22, { size: 14 });
  [["Current avg / parcel", fmtMoney(sv.avgCur), C.gray, C.deep, M, 406, 229], ["DropX avg / parcel", fmtMoney(sv.avgDx), C.gray, C.teal, M + 241, 406, 229],
   ["Saving / parcel", fmtMoney(sv.perParcel) + (sv.pct != null ? `  (${fmtPct(sv.pct)})` : ""), C.deep, "#fff", M, 488, 470]].forEach(([l, v, bg, fg, x, y, w]) => {
    rrect(s, x, y, w, 70, bg, 12);
    text(s, l, x + 16, y + 12, w - 32, 16, { size: 12, color: bg === C.deep ? "#C9D8D7" : C.muted });
    text(s, v, x + 16, y + 30, w - 32, 32, { head: true, bold: true, size: 26, color: fg });
  });
  const rows = a.bands.filter((b) => b.count > 0 && b.avgCur != null && b.avgDx != null).slice(0, 8);
  if (!rows.length) {
    const est = a.bands.filter((b) => b.share > 0 && b.avgDx != null).slice(0, 8);
    text(s, "DropX all-in rate by weight", 580, 262, 636, 24, { head: true, bold: true, size: 17, color: C.deep });
    text(s, `Your current average: ${fmtMoney(sv.avgCur)} per parcel`, 580, 288, 636, 20, { size: 13, color: C.muted });
    barChart(s, 580, 316, 636, 310, est.map((b) => b.label), est.map((b) => +b.avgDx.toFixed(2)), C.teal, "$0.00");
  } else {
  text(s, "Average cost per parcel by weight", 580, 262, 636, 24, { head: true, bold: true, size: 17, color: C.deep });
  s.addChart("bar", [
    { name: "Current", labels: rows.map((b) => b.label), values: rows.map((b) => +b.avgCur.toFixed(2)) },
    { name: "DropX", labels: rows.map((b) => b.label), values: rows.map((b) => +b.avgDx.toFixed(2)) },
  ], {
    x: I(580), y: I(290), w: I(636), h: I(340), barDir: "bar", barGapWidthPct: 50, barGrouping: "clustered",
    chartColors: ["A9B4B5", hex(C.teal)], catAxisOrientation: "maxMin", valAxisHidden: true, valGridLine: { style: "none" },
    catAxisLabelFontFace: BODY, catAxisLabelFontSize: 10, catAxisLabelColor: hex(C.ink), catAxisLineShow: false,
    showValue: true, dataLabelFormatCode: "$0.00", dataLabelFontSize: 9, dataLabelColor: hex(C.deep), dataLabelPosition: "outEnd",
    showLegend: true, legendPos: "t", legendFontSize: 10, legendFontFace: BODY,
  });
  }
  if (f.footnote) text(s, f.footnote, M, 640, SW - 2 * M, 30, { size: 11.5, color: C.muted });
};

function rateTable(s, p, x, y, w, compact) {
  const zoned = p.structure === "zoned";
  const grid = rateGrid(p);
  const cols = zoned ? ZONES.map((z) => "Zone " + z) : ["Rate per parcel"];
  const fs = compact ? 10 : 11.5;
  const head = [{ text: "Weight", options: { bold: true, color: "FFFFFF", fill: { color: hex(C.deep) }, align: "left" } },
    ...cols.map((c) => ({ text: c, options: { bold: true, color: "FFFFFF", fill: { color: hex(C.deep) }, align: "right" } }))];
  const body = grid.map((row, i) => [
    { text: bandLabel(p.bands, i), options: { bold: true, align: "left", fill: { color: i % 2 ? hex(C.gray) : "FFFFFF" } } },
    ...row.map((v) => ({ text: fmtMoney(v), options: { align: "right", fill: { color: i % 2 ? hex(C.gray) : "FFFFFF" } } })),
  ]);
  const firstW = zoned ? 150 : 240;
  s.addTable([head, ...body], {
    x: I(x), y: I(y), w: I(w), colW: [I(firstW), ...cols.map(() => I((w - firstW) / cols.length))],
    fontFace: BODY, fontSize: fs, color: hex(C.deep), border: { type: "solid", pt: 0.5, color: hex(C.line) },
    rowH: I(compact ? 28 : 36), margin: [0, 6, 0, 6], valign: "middle",
  });
}

function extras(s, p, x, y, w) {
  text(s, "Accessorials", x, y, w, 24, { head: true, bold: true, size: 17, color: C.deep });
  let yy = y + 30;
  p.accessorials.filter((a) => a.name).forEach((a) => {
    text(s, a.name, x, yy, w - 160, 22, { size: 13 });
    text(s, `${fmtMoney(a.amount)} ${a.unit || ""}`, x + w - 160, yy, 160, 22, { size: 13, bold: true, color: C.deep, align: "right" });
    rect(s, x, yy + 26, w, 1, C.line); yy += 32;
  });
  const lines = [];
  if (p.fuelPct > 0) lines.push(`Fuel surcharge: ${p.fuelPct}% ${p.fuelMode === "included" ? "(included in rates shown)" : "(applied to rates shown)"}`);
  if (p.terms.minimum) lines.push(`Minimum: ${p.terms.minimum}`);
  if (p.terms.billing) lines.push(`Billing: ${p.terms.billing}`);
  if (lines.length) { text(s, lines.join("\n"), x, yy + 6, w, 22 * lines.length, { size: 13, lh: 1.3 }); yy += 22 * lines.length + 10; }
  return yy;
}

B.ratecard = (s, f, ctx) => {
  const p = ctx.pricing;
  header(s, f, false, 880, 34);
  if (!p.approved) {
    s.addText("ILLUSTRATIVE PRICING", { x: I(SW - M - 220), y: I(62), w: I(220), h: I(30), fontFace: BODY, fontSize: 9, bold: true, color: hex(C.orange), charSpacing: 2, align: "center", valign: "middle", shape: "roundRect", rectRadius: 0.5, line: { color: hex(C.orange), width: 1.25 }, margin: 0 });
  }
  if (p.structure === "zoned") {
    rateTable(s, p, M, 220, SW - 2 * M, true);
    const y = 220 + 28 * (p.bands.length + 1) + 18;
    text(s, "Accessorials", M, y, 760, 20, { head: true, bold: true, size: 15, color: C.deep });
    p.accessorials.filter((a) => a.name).forEach((a, i) => {
      const x = M + (i % 2) * 394, yy = y + 26 + Math.floor(i / 2) * 24;
      text(s, a.name, x, yy, 290, 20, { size: 12 });
      text(s, fmtMoney(a.amount), x + 290, yy, 76, 20, { size: 12, bold: true, color: C.deep, align: "right" });
      rect(s, x, yy + 22, 366, 1, C.line);
    });
    const terms = [p.fuelPct > 0 && `Fuel surcharge: ${p.fuelPct}% ${p.fuelMode === "included" ? "(included in rates shown)" : "(applied to rates shown)"}`, p.terms.minimum && `Minimum: ${p.terms.minimum}`, p.terms.billing && `Billing: ${p.terms.billing}`].filter(Boolean);
    text(s, [...terms, f.notes].filter(Boolean).join("\n"), 860, y, SW - M - 860, SH - 60 - y, { size: 11.5, color: C.muted, lh: 1.25 });
  } else {
    rateTable(s, p, M, 220, 520, false);
    const yy = extras(s, p, 640, 220, 576);
    text(s, f.notes, 640, yy + 10, 576, 120, { size: 12, color: C.muted, lh: 1.3 });
  }
};

B.whynow = (s, f) => {
  text(s, String(f.eyebrow || "").toUpperCase(), M, 90, 440, 20, { size: 13, bold: true, color: C.orange, spacing: 4 });
  text(s, f.title, M, 122, 440, 140, { head: true, bold: true, size: 38, color: C.deep, lh: 1.0 });
  text(s, f.lede, M, 272, 440, 200, { size: 16, lh: 1.3 });
  (f.cards || []).slice(0, 4).forEach(([tag, h, b], i) => {
    const x = 560 + (i % 2) * 337, y = 90 + Math.floor(i / 2) * 279;
    rrect(s, x, y, 319, 261, "#FFFFFF", 16);
    text(s, String(tag).toUpperCase(), x + 24, y + 24, 271, 18, { size: 12, color: C.orange, spacing: 2.5, bold: true });
    text(s, h, x + 24, y + 48, 271, 54, { head: true, bold: true, size: 22, color: C.deep, lh: 1.0 });
    text(s, b, x + 24, y + 108, 271, 140, { size: 14, lh: 1.25 });
  });
};

B.nextsteps = (s, f, ctx, A) => {
  header(s, f);
  const st = (f.steps || []).slice(0, 4), n = Math.max(1, st.length);
  const cw = (SW - 2 * M - (n - 1) * 20) / n;
  st.forEach(([when, h, b], i) => {
    const x = M + i * (cw + 20);
    numTile(s, i + 1, x + 8, 210);
    text(s, String(when).toUpperCase(), x, 260, cw, 18, { size: 12, bold: true, color: C.orange, spacing: 2 });
    text(s, h, x, 282, cw, 28, { head: true, bold: true, size: 20, color: C.deep });
    text(s, b, x, 314, cw, 120, { size: 14, lh: 1.25 });
  });
  rect(s, 0, 470, SW, 250, C.deep);
  photo(s, A, "boxes", 930, 440, 330, 210);
  text(s, "LET'S TALK", M, 510, 600, 20, { size: 13, bold: true, color: C.mint, spacing: 4 });
  text(s, [f.contactName, f.contactTitle].filter(Boolean).join("  ·  "), M, 540, 820, 40, { head: true, bold: true, size: 30, color: "#fff" });
  text(s, [f.contactEmail, f.contactPhone].filter(Boolean).join("   ·   "), M, 588, 820, 26, { size: 17, color: "#D6E4E3" });
  if (f.cta) s.addText(String(f.cta).toUpperCase(), { x: I(M), y: I(626), w: I(Math.min(640, 90 + f.cta.length * 10)), h: I(38), fontFace: BODY, fontSize: 10.5, bold: true, color: "FFFFFF", charSpacing: 1.5, fill: { color: hex(C.orange) }, align: "center", valign: "middle", margin: 0 });
};

B.custom = (s, f, ctx, A) => {
  const hasPhoto = !!f.photo;
  header(s, { eyebrow: f.eyebrow, title: f.title }, false, hasPhoto ? 640 : SW - 2 * M);
  const bullets = String(f.body || "").split("\n").filter((x) => x.trim());
  s.addText(bullets.map((b) => ({ text: b, options: { bullet: { code: "25B0" }, paraSpaceAfter: 10 } })), {
    x: I(M), y: I(250), w: I(hasPhoto ? 620 : SW - 2 * M), h: I(400), valign: "top", fontFace: BODY, fontSize: 15, color: hex(C.ink), margin: 0,
  });
  if (hasPhoto) {
    if (CUTOUTS.has(f.photo)) { para(s, 780, 170, 440, 420, C.teal); photo(s, A, f.photo, 800, 110, 420, 520); }
    else photo(s, A, f.photo, 760, 120, 456, 520);
  }
};

// ── main ──────────────────────────────────────────────────────────────────
export async function exportPptx(deck, ctx) {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; // 13.333 × 7.5 in
  pptx.author = ctx.deal.repName || "DropX";
  pptx.company = "DropX";
  pptx.title = `DropX proposal — ${ctx.deal.client || "Client"}`;

  const A = {
    logo: await svgToPng(LOGO_SVG, 1118, 122),
    logoWhite: await svgToPng(LOGO_WHITE_SVG, 1118, 122),
    xmarkWhite: await svgToPng(XMARK_WHITE_SVG, 512, 244),
    photos: {},
  };
  for (const k of Object.keys(PHOTOS)) A.photos[k] = await toDataUrl(PHOTOS[k]);
  const slides = deck.filter((sl) => sl.enabled && slideAvailable(sl, ctx));
  if (slides.some((sl) => sl.type === "network")) {
    const svg = renderToStaticMarkup(React.createElement(USMap, { zip3s: ctx.analysis?.estimate ? null : ctx.analysis?.zip3s, hubs: ctx.hubs, locations: ctx.locations, width: 960, height: 600 }));
    A.map = await svgToPng(svg, 1920, 1200);
  }

  slides.forEach((sl, i) => {
    const s = pptx.addSlide();
    const dark = sl.type === "solution";
    s.background = { color: hex(dark ? C.deep : sl.type === "whynow" ? C.gray : "#FFFFFF") };
    const f = resolveSlide(sl, ctx);
    B[sl.type](s, f, ctx, A);
    if (sl.type !== "cover") footer(s, A, ctx, i + 1, dark || sl.type === "nextsteps");
  });
  await pptx.writeFile({ fileName: `DropX_Proposal_${slug(ctx.deal.client)}.pptx` });
}

export const SLIDE_BUILDERS = B;
export { SLIDE_TYPES };
