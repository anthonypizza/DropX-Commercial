// HTML renderers for every slide type. Canvas is 1280×720 px; the PPTX exporter mirrors these layouts.
import React from "react";
import { C, FONT_DISPLAY, FONT_BODY, LOGO, LOGO_WHITE, XMARK_WHITE, PHOTOS, CUTOUTS } from "../brand/brand.js";
import { USMap } from "../components/USMap.jsx";
import { ZONES, rateGrid, bandLabel } from "../lib/pricing.js";
import { fmtMoney, fmtPct, fmtInt } from "../lib/format.js";

export const SW = 1280, SH = 720, M = 64;

const eyebrowSt = (dark) => ({ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, letterSpacing: "0.32em", textTransform: "uppercase", color: dark ? C.mint : C.orange, marginBottom: 14 });
const titleSt = (dark, size = 40) => ({ fontFamily: FONT_DISPLAY, fontSize: size, fontWeight: 600, lineHeight: 1.12, color: dark ? "#fff" : C.deep, letterSpacing: "-0.01em", whiteSpace: "pre-line" });
const ledeSt = (dark) => ({ fontFamily: FONT_BODY, fontSize: 17, lineHeight: 1.5, color: dark ? "rgba(255,255,255,.78)" : C.ink, marginTop: 14, whiteSpace: "pre-line" });
const abs = (x, y, w, h, extra = {}) => ({ position: "absolute", left: x, top: y, width: w, height: h, ...extra });

function Header({ f, dark, w = SW - 2 * M, size }) {
  return (
    <div style={abs(M, 56, w)}>
      {f.eyebrow ? <div style={eyebrowSt(dark)}>{f.eyebrow}</div> : null}
      <div style={titleSt(dark, size)}>{f.title}</div>
      {f.lede ? <div style={{ ...ledeSt(dark), maxWidth: 900 }}>{f.lede}</div> : null}
    </div>
  );
}

function Footer({ ctx, n, dark }) {
  const t = [ctx.deal.client ? `Prepared for ${ctx.deal.client}` : null, "Confidential"].filter(Boolean).join("  ·  ");
  return (
    <div style={abs(M, SH - 44, SW - 2 * M, 20, { display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: FONT_BODY, fontSize: 11, color: dark ? "rgba(255,255,255,.55)" : C.muted })}>
      <img src={dark ? LOGO_WHITE : LOGO} alt="DropX" style={{ height: 14 }} />
      <span style={{ letterSpacing: ".04em" }}>{t}</span>
      <span style={{ fontWeight: 600, minWidth: 40, textAlign: "right" }}>{String(n).padStart(2, "0")}</span>
    </div>
  );
}

// Blue (or orange) parallelogram number tile, as on the website.
function NumTile({ n, color = C.blue, w = 64, h = 34, size = 17 }) {
  return (
    <div style={{ width: w, height: h, position: "relative", flexShrink: 0 }}>
      <div style={{ position: "absolute", inset: 0, background: color, transform: "skewX(-24deg)", borderRadius: 5 }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: size }}>{String(n).padStart(2, "0")}</div>
    </div>
  );
}

const Photo = ({ k, style }) => (k && PHOTOS[k] ? <img src={PHOTOS[k]} alt="" style={{ objectFit: CUTOUTS.has(k) ? "contain" : "cover", ...style }} /> : null);

// ─────────────────────────────────────────────────────────────────────────────
const R = {};

R.cover = ({ f }) => {
  const cut = CUTOUTS.has(f.photo);
  return (
    <>
      {f.photo && !cut && <div style={abs(600, 0, 680, SH, { clipPath: "polygon(180px 0, 100% 0, 100% 100%, 0 100%)", overflow: "hidden" })}><Photo k={f.photo} style={{ width: "100%", height: "100%" }} /></div>}
      {f.photo && !cut && <div style={abs(600, 0, 680, SH, { clipPath: "polygon(180px 0, 196px 0, 16px 100%, 0 100%)", background: C.teal })} />}
      {cut && <><div style={abs(760, 120, 420, 480, { background: C.teal, transform: "skewX(-24deg)", borderRadius: 28 })} /><Photo k={f.photo} style={abs(780, 70, 400, 560)} /></>}
      <img src={LOGO} alt="DropX" style={abs(M, 72, 300, 300 / 9.16)} />
      <div style={abs(M, 230, 600)}>
        <div style={eyebrowSt(false)}>{f.eyebrow}</div>
        <div style={titleSt(false, 50)}>{f.title}</div>
        <div style={{ ...ledeSt(false), fontSize: 19 }}>{f.subtitle}</div>
      </div>
      <div style={abs(M, 560, 560, 100, { display: "flex", gap: 40, fontFamily: FONT_BODY })}>
        {[["Prepared for", f.preparedFor], ["Prepared by", f.preparedBy], ["Date", f.date]].filter((x) => x[1]).map(([k, v]) => (
          <div key={k} style={{ maxWidth: 220 }}>
            <div style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: C.muted, marginBottom: 6 }}>{k}</div>
            <div style={{ fontSize: 15, color: C.deep, fontWeight: 600, lineHeight: 1.35 }}>{v}</div>
          </div>
        ))}
      </div>
    </>
  );
};

R.about = ({ f }) => (
  <>
    <div style={abs(110, 190, 440, 380, { background: C.teal, transform: "skewX(-24deg)", borderRadius: 30 })} />
    <div style={abs(330, 150, 190, 92, { background: C.deep, transform: "skewX(-24deg)", borderRadius: 14 })} />
    <img src={XMARK_WHITE} alt="" style={abs(370, 166, 120, 58)} />
    <Photo k={f.photo} style={abs(70, 110, 420, 460)} />
    <div style={abs(640, 110, 576)}>
      <div style={eyebrowSt(false)}>{f.eyebrow}</div>
      <div style={titleSt(false, 40)}>{f.title}</div>
      <div style={{ ...ledeSt(false), fontSize: 16 }}>{f.body}</div>
    </div>
    <div style={abs(640, 452, 576, 190, { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px 28px" })}>
      {(f.stats || []).slice(0, 4).map(([v, l], i) => (
        <div key={i} style={{ borderTop: `2px solid ${C.line}`, paddingTop: 10 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 34, fontWeight: 600, color: C.orange, lineHeight: 1 }}>{v}</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.ink, marginTop: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>{l}</div>
        </div>
      ))}
    </div>
  </>
);

R.problem = ({ f }) => {
  const cards = (f.cards || []).slice(0, 4);
  const cw = (SW - 2 * M - (cards.length - 1) * 20) / Math.max(1, cards.length);
  return (
    <>
      <Header f={f} />
      <div style={abs(M, 300, SW - 2 * M, 250, { display: "flex", gap: 20 })}>
        {cards.map(([h, b], i) => (
          <div key={i} style={{ width: cw, background: C.gray, borderRadius: 14, padding: "22px 22px", borderTop: `4px solid ${C.orange}` }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 21, fontWeight: 600, color: C.deep, lineHeight: 1.2 }}>{h}</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: C.ink, lineHeight: 1.5, marginTop: 10 }}>{b}</div>
          </div>
        ))}
      </div>
      {f.callout && <div style={abs(M, 572, SW - 2 * M, 72, { background: C.deep, borderRadius: 14, color: "#fff", display: "flex", alignItems: "center", padding: "0 28px", fontFamily: FONT_DISPLAY, fontSize: 21, fontWeight: 500 })}>{f.callout}</div>}
    </>
  );
};

R.solution = ({ f }) => {
  const p = (f.pillars || []).slice(0, 3);
  const cw = (SW - 2 * M - (p.length - 1) * 22) / Math.max(1, p.length);
  return (
    <>
      <img src={PHOTOS.boxes} alt="" style={abs(900, -30, 400, 250, { objectFit: "contain", opacity: 0.95 })} />
      <Header f={f} dark w={820} />
      <div style={abs(M, 330, SW - 2 * M, 300, { display: "flex", gap: 22 })}>
        {p.map(([tag, h, b], i) => (
          <div key={i} style={{ width: cw, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 16, padding: "26px 26px" }}>
            <NumTile n={i + 1} color={C.teal} />
            <div style={{ fontFamily: FONT_BODY, fontSize: 12, letterSpacing: ".24em", textTransform: "uppercase", color: C.orange, marginTop: 20 }}>{tag}</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 600, color: "#fff", marginTop: 8, lineHeight: 1.2 }}>{h}</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 15, color: "rgba(255,255,255,.76)", marginTop: 10, lineHeight: 1.5 }}>{b}</div>
          </div>
        ))}
      </div>
    </>
  );
};

R.journey = ({ f }) => {
  const steps = (f.steps || []).slice(0, 9);
  return (
    <>
      <Header f={f} />
      <div style={abs(M, 290, SW - 2 * M, 360, { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "26px 36px" })}>
        {steps.map(([h, b], i) => (
          <div key={i} style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
            <NumTile n={i + 1} color={/accept/i.test(h) ? C.orange : C.blue} />
            <div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600, color: C.deep, textTransform: "uppercase", letterSpacing: ".02em" }}>{h}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 13.5, color: C.ink, lineHeight: 1.45, marginTop: 4 }}>{b}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

R.integration = ({ f }) => {
  const p = (f.paths || []).slice(0, 3);
  const cw = (SW - 2 * M - (p.length - 1) * 22) / Math.max(1, p.length);
  return (
    <>
      <Header f={f} />
      <div style={abs(M, 300, SW - 2 * M, 260, { display: "flex", gap: 22 })}>
        {p.map(([tag, h, b], i) => (
          <div key={i} style={{ width: cw, border: `1px solid ${C.line}`, borderRadius: 16, padding: 26, background: "#fff", boxShadow: "0 6px 24px rgba(7,49,54,.06)" }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 12, letterSpacing: ".24em", textTransform: "uppercase", color: C.orange }}>{tag}</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 600, color: C.deep, marginTop: 10, lineHeight: 1.2 }}>{h}</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 15, color: C.ink, marginTop: 12, lineHeight: 1.5 }}>{b}</div>
          </div>
        ))}
      </div>
      {f.footnote && <div style={abs(M, 590, SW - 2 * M, 50, { fontFamily: FONT_BODY, fontSize: 15, color: C.teal, fontWeight: 500, borderLeft: `4px solid ${C.teal}`, paddingLeft: 16, display: "flex", alignItems: "center" })}>{f.footnote}</div>}
    </>
  );
};

R.network = ({ f, ctx }) => (
  <>
    <div style={abs(M, 56, 400)}>
      <div style={eyebrowSt(false)}>{f.eyebrow}</div>
      <div style={titleSt(false, 34)}>{f.title}</div>
      <div style={{ ...ledeSt(false), fontSize: 15 }}>{f.lede}</div>
    </div>
    <div style={abs(M, 420, 400, 240, { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 20px" })}>
      {(f.stats || []).slice(0, 4).map(([v, l], i) => (
        <div key={i} style={{ borderTop: `2px solid ${C.line}`, paddingTop: 8 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 600, color: i === 3 ? C.orange : C.teal, lineHeight: 1 }}>{v}</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.ink, marginTop: 6, lineHeight: 1.35 }}>{l}</div>
        </div>
      ))}
    </div>
    <div style={abs(500, 70, 740, 462.5)}>
      <USMap zip3s={ctx.analysis?.estimate ? null : ctx.analysis?.zip3s} hubs={ctx.hubs} locations={ctx.locations} />
    </div>
    <MapLegend ctx={ctx} style={abs(520, 560, 700, 30)} />
  </>
);

export function MapLegend({ ctx, style }) {
  const items = [[C.deep, "DropX hub market", "pin"]];
  if (ctx.analysis?.zip3s && !ctx.analysis.estimate && ctx.analysis.zip3Count) items.push([C.orange, `${ctx.deal.client || "Client"} parcel origins`, "dot"]);
  if (ctx.locations?.length) items.push([C.teal, "DropX drop-off location", "small"]);
  return (
    <div style={{ ...style, display: "flex", gap: 26, alignItems: "center", fontFamily: FONT_BODY, fontSize: 13, color: C.ink }}>
      {items.map(([c, l, k]) => (
        <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: k === "small" ? 7 : 12, height: k === "small" ? 7 : 12, borderRadius: 99, background: c, opacity: k === "dot" ? 0.55 : 1, border: k === "pin" ? "2px solid #fff" : "none", boxShadow: k === "pin" ? `0 0 0 1px ${C.deep}` : "none" }} />
          {l}
        </span>
      ))}
    </div>
  );
}

R.growth = ({ f }) => {
  const ms = (f.milestones || []).slice(0, 6);
  const cw = (SW - 2 * M) / Math.max(1, ms.length);
  return (
    <>
      <Header f={f} />
      <div style={abs(M, 330, SW - 2 * M, 3, { background: C.line })} />
      {ms.map(([when, loc, phase, det], i) => {
        const last = i === ms.length - 1;
        return (
          <div key={i} style={abs(M + i * cw, 300, cw - 18, 330)}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: C.orange, fontWeight: 600, height: 20 }}>{when}</div>
            <div style={{ width: 16, height: 16, borderRadius: 99, background: last ? C.teal : C.deep, border: "3px solid #fff", boxShadow: `0 0 0 1px ${last ? C.teal : C.deep}`, marginTop: 2 }} />
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 36, fontWeight: 600, color: last ? C.teal : C.deep, marginTop: 18, lineHeight: 1 }}>{loc}</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 600, color: C.deep, marginTop: 10 }}>{phase}</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.ink, lineHeight: 1.45, marginTop: 6 }}>{det}</div>
          </div>
        );
      })}
    </>
  );
};

// Horizontal bar list (single series). Value label on every bar; recessive track.
function BarList({ items, color = C.teal, fmt = fmtPct, labelW = 150, rowH = 30 }) {
  const max = Math.max(1e-9, ...items.map((x) => x[1]));
  return (
    <div>
      {items.map(([l, v], i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", height: rowH, fontFamily: FONT_BODY, fontSize: 13, color: C.ink }}>
          <div style={{ width: labelW, flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 10 }}>{l}</div>
          <div style={{ flex: 1, position: "relative", height: 14 }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(v / max) * 86}%`, minWidth: v > 0 ? 3 : 0, background: color, borderRadius: "0 4px 4px 0" }} />
            <div style={{ position: "absolute", left: `calc(${(v / max) * 86}% + 8px)`, top: -2, fontWeight: 600, color: C.deep }}>{fmt(v)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

R.profile = ({ f, ctx }) => {
  const a = ctx.analysis;
  if (!a) return <Header f={{ title: "Add data or a quick estimate to populate this slide." }} />;
  const bands = a.bands.filter((b) => b.share > 0);
  const right = a.states?.length ? { title: "Top origin states", items: a.states.slice(0, 8).map(([s, c]) => [s, c / a.n]) }
    : a.carriers?.length > 1 ? { title: "Current carrier mix", items: a.carriers.slice(0, 8).map(([s, c]) => [s, c / a.carrierTotal]) } : null;
  return (
    <>
      <Header f={f} />
      <div style={abs(M, 250, SW - 2 * M, 110, { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 })}>
        {(f.kpis || []).slice(0, 4).map(([v, l], i) => (
          <div key={i} style={{ background: i === 0 ? C.deep : C.gray, borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 600, color: i === 0 ? "#fff" : C.deep, lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v}</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: i === 0 ? "rgba(255,255,255,.75)" : C.ink, marginTop: 8 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={abs(M, 390, right ? 560 : SW - 2 * M, 270)}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 600, color: C.deep, marginBottom: 10 }}>Share of parcels by weight</div>
        <BarList items={bands.map((b) => [b.label, b.share])} rowH={bands.length > 7 ? 26 : 30} />
      </div>
      {right && (
        <div style={abs(700, 390, 516, 270)}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 600, color: C.deep, marginBottom: 10 }}>{right.title}</div>
          <BarList items={right.items.map(([s, v]) => [s, v])} color={C.blue} labelW={right.title.includes("carrier") ? 180 : 60} rowH={right.items.length > 7 ? 26 : 30} />
        </div>
      )}
    </>
  );
};

export const CUR_COLOR = "#A9B4B5";

R.savings = ({ f, ctx }) => {
  const a = ctx.analysis, s = a?.savings;
  if (!s) return <Header f={{ title: "Add current cost data to populate the savings analysis." }} />;
  const rows = a.bands.filter((b) => b.count > 0 && b.avgCur != null && b.avgDx != null);
  const max = Math.max(1, ...rows.flatMap((b) => [b.avgCur, b.avgDx]));
  const tiles = [
    ["Current avg / parcel", fmtMoney(s.avgCur), C.gray, C.deep],
    ["DropX avg / parcel", fmtMoney(s.avgDx), C.gray, C.teal],
    ["Saving / parcel", fmtMoney(s.perParcel) + (s.pct != null ? `  (${fmtPct(s.pct)})` : ""), C.deep, "#fff"],
  ];
  return (
    <>
      <Header f={f} w={SW - 2 * M} size={38} />
      <div style={abs(M, 262, 470, 380)}>
        <div style={{ fontFamily: FONT_BODY, fontSize: 12, letterSpacing: ".24em", textTransform: "uppercase", color: C.muted }}>Estimated annual savings</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 76, fontWeight: 600, color: s.annual >= 0 ? C.teal : C.orange, lineHeight: 1.05, marginTop: 4 }}>{fmtMoney(s.annual, 0)}</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: C.ink, marginTop: 4 }}>{fmtMoney(s.annualCur, 0)} today → {fmtMoney(s.annualDx, 0)} with DropX · {fmtInt(a.annualVolume)} parcels / yr</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 22 }}>
          {tiles.map(([l, v, bg, fg], i) => (
            <div key={i} style={{ background: bg, borderRadius: 12, padding: "14px 16px", gridColumn: i === 2 ? "1 / span 2" : undefined }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: i === 2 ? "rgba(255,255,255,.75)" : C.muted }}>{l}</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 600, color: fg, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      {rows.length ? (
      <div style={abs(580, 262, 636, 360)}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 600, color: C.deep }}>Average cost per parcel by weight</div>
          <div style={{ display: "flex", gap: 16, fontFamily: FONT_BODY, fontSize: 12, color: C.ink }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><i style={{ width: 12, height: 12, borderRadius: 3, background: CUR_COLOR, display: "inline-block" }} />Current</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><i style={{ width: 12, height: 12, borderRadius: 3, background: C.teal, display: "inline-block" }} />DropX</span>
          </div>
        </div>
        {rows.slice(0, 8).map((b, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", height: rows.length > 6 ? 40 : 46, fontFamily: FONT_BODY, fontSize: 12.5, color: C.ink }}>
            <div style={{ width: 118, flexShrink: 0 }}>{b.label}</div>
            <div style={{ flex: 1 }}>
              {[[b.avgCur, CUR_COLOR], [b.avgDx, C.teal]].map(([v, c], j) => (
                <div key={j} style={{ position: "relative", height: 13, marginTop: j ? 2 : 0 }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(v / max) * 82}%`, background: c, borderRadius: "0 4px 4px 0" }} />
                  <div style={{ position: "absolute", left: `calc(${(v / max) * 82}% + 6px)`, top: -2, fontSize: 11.5, fontWeight: 600, color: C.deep }}>{fmtMoney(v)}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      ) : (
      <div style={abs(580, 262, 636, 360)}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 600, color: C.deep }}>DropX all-in rate by weight</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.muted, margin: "4px 0 12px" }}>Your current average: {fmtMoney(s.avgCur)} per parcel</div>
        <BarList items={a.bands.filter((b) => b.share > 0 && b.avgDx != null).slice(0, 8).map((b) => [b.label, b.avgDx])} fmt={(v) => fmtMoney(v)} labelW={118} rowH={34} />
      </div>
      )}
      {f.footnote && <div style={abs(M, 640, SW - 2 * M, 30, { fontFamily: FONT_BODY, fontSize: 11.5, color: C.muted })}>{f.footnote}</div>}
    </>
  );
};

export function RateTable({ pricing, compact }) {
  const grid = rateGrid(pricing);
  const zoned = pricing.structure === "zoned";
  const cols = zoned ? ZONES.map((z) => "Zone " + z) : ["Rate per parcel"];
  const th = { background: C.deep, color: "#fff", fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: compact ? 13 : 14, height: compact ? 32 : 38, padding: compact ? "0 10px" : "0 14px", textAlign: "right" };
  const td = { fontFamily: FONT_BODY, fontSize: compact ? 13 : 15, height: compact ? 28 : 34, padding: compact ? "0 10px" : "0 14px", textAlign: "right", color: C.deep, fontVariantNumeric: "tabular-nums" };
  return (
    <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "100%", borderRadius: 12, overflow: "hidden", border: `1px solid ${C.line}` }}>
      <thead><tr><th style={{ ...th, textAlign: "left" }}>Weight</th>{cols.map((c) => <th key={c} style={th}>{c}</th>)}</tr></thead>
      <tbody>
        {grid.map((row, i) => (
          <tr key={i} style={{ background: i % 2 ? C.gray : "#fff" }}>
            <td style={{ ...td, textAlign: "left", fontWeight: 600 }}>{bandLabel(pricing.bands, i)}</td>
            {row.map((v, j) => <td key={j} style={td}>{fmtMoney(v)}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const DraftTag = () => <span style={{ display: "inline-block", fontFamily: FONT_BODY, fontSize: 11, fontWeight: 700, letterSpacing: ".18em", color: C.orange, border: `1.5px solid ${C.orange}`, borderRadius: 99, padding: "4px 12px" }}>ILLUSTRATIVE PRICING</span>;

R.ratecard = ({ f, ctx }) => {
  const p = ctx.pricing, zoned = p.structure === "zoned";
  const extras = (
    <div style={{ fontFamily: FONT_BODY, color: C.ink }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 600, color: C.deep, marginBottom: 8 }}>Accessorials</div>
      {p.accessorials.filter((x) => x.name).map((x, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13.5, padding: "6px 0", borderBottom: `1px solid ${C.line}` }}>
          <span>{x.name}</span><span style={{ fontWeight: 600, color: C.deep, whiteSpace: "nowrap" }}>{fmtMoney(x.amount)} {x.unit ? <span style={{ fontWeight: 400, color: C.muted }}>{x.unit}</span> : null}</span>
        </div>
      ))}
      {p.fuelPct > 0 && <div style={{ fontSize: 13.5, marginTop: 10 }}><b style={{ color: C.deep }}>Fuel surcharge:</b> {p.fuelPct}% {p.fuelMode === "included" ? "(included in rates shown)" : "(applied to rates shown)"}</div>}
      {p.terms.minimum && <div style={{ fontSize: 13.5, marginTop: 6 }}><b style={{ color: C.deep }}>Minimum:</b> {p.terms.minimum}</div>}
      {p.terms.billing && <div style={{ fontSize: 13.5, marginTop: 6 }}><b style={{ color: C.deep }}>Billing:</b> {p.terms.billing}</div>}
    </div>
  );
  return (
    <>
      <Header f={f} w={880} size={34} />
      {!p.approved && <div style={abs(SW - M - 220, 64, 220, 30, { textAlign: "right" })}><DraftTag /></div>}
      {zoned ? (() => {
        const y = 220 + 32 + 28 * p.bands.length + 18;
        const acc = p.accessorials.filter((x) => x.name);
        const terms = [p.fuelPct > 0 && `Fuel surcharge: ${p.fuelPct}% ${p.fuelMode === "included" ? "(included in rates shown)" : "(applied to rates shown)"}`, p.terms.minimum && `Minimum: ${p.terms.minimum}`, p.terms.billing && `Billing: ${p.terms.billing}`].filter(Boolean);
        return (
          <>
            <div style={abs(M, 220, SW - 2 * M, 330)}><RateTable pricing={p} compact /></div>
            <div style={abs(M, y, 760, SH - 60 - y)}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 600, color: C.deep, marginBottom: 4 }}>Accessorials</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 28 }}>
                {acc.map((x, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontFamily: FONT_BODY, fontSize: 12, color: C.ink, height: 24, alignItems: "center", borderBottom: `1px solid ${C.line}` }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.name}</span><b style={{ color: C.deep, whiteSpace: "nowrap" }}>{fmtMoney(x.amount)}</b>
                  </div>
                ))}
              </div>
            </div>
            <div style={abs(860, y, SW - M - 860, SH - 60 - y, { fontFamily: FONT_BODY, fontSize: 11.5, color: C.muted, lineHeight: 1.45, whiteSpace: "pre-line" })}>
              {terms.map((t) => <div key={t} style={{ color: C.ink }}>{t}</div>)}
              <div style={{ marginTop: 4 }}>{f.notes}</div>
            </div>
          </>
        );
      })() : (
        <>
          <div style={abs(M, 220, 520, 420)}><RateTable pricing={p} /></div>
          <div style={abs(640, 220, 576, 420)}>
            {extras}
            <div style={{ fontFamily: FONT_BODY, fontSize: 12.5, color: C.muted, lineHeight: 1.5, marginTop: 16, whiteSpace: "pre-line" }}>{f.notes}</div>
          </div>
        </>
      )}
    </>
  );
};

R.whynow = ({ f }) => {
  const cards = (f.cards || []).slice(0, 4);
  return (
    <>
      <div style={abs(M, 90, 440)}>
        <div style={eyebrowSt(false)}>{f.eyebrow}</div>
        <div style={titleSt(false, 38)}>{f.title}</div>
        <div style={{ ...ledeSt(false), fontSize: 16 }}>{f.lede}</div>
      </div>
      <div style={abs(560, 90, 656, 540, { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 })}>
        {cards.map(([tag, h, b], i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 6px 24px rgba(7,49,54,.07)" }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 12, letterSpacing: ".24em", textTransform: "uppercase", color: C.orange }}>{tag}</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600, color: C.deep, marginTop: 8, lineHeight: 1.2 }}>{h}</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: C.ink, marginTop: 10, lineHeight: 1.5 }}>{b}</div>
          </div>
        ))}
      </div>
    </>
  );
};

R.nextsteps = ({ f }) => {
  const st = (f.steps || []).slice(0, 4);
  const cw = (SW - 2 * M - (st.length - 1) * 20) / Math.max(1, st.length);
  return (
    <>
      <Header f={f} />
      <div style={abs(M, 210, SW - 2 * M, 230, { display: "flex", gap: 20 })}>
        {st.map(([when, h, b], i) => (
          <div key={i} style={{ width: cw }}>
            <NumTile n={i + 1} />
            <div style={{ fontFamily: FONT_BODY, fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: C.orange, marginTop: 16, fontWeight: 600 }}>{when}</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 600, color: C.deep, marginTop: 6 }}>{h}</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: C.ink, marginTop: 6, lineHeight: 1.5 }}>{b}</div>
          </div>
        ))}
      </div>
      <div style={abs(0, 470, SW, 250, { background: C.deep })} />
      <img src={PHOTOS.boxes} alt="" style={abs(930, 440, 330, 210, { objectFit: "contain" })} />
      <div style={abs(M, 510, 800, 150, { fontFamily: FONT_BODY, color: "#fff" })}>
        <div style={{ ...eyebrowSt(true) }}>Let's talk</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 600 }}>{f.contactName}{f.contactTitle ? <span style={{ fontWeight: 400, color: "rgba(255,255,255,.7)" }}>{"  ·  " + f.contactTitle}</span> : null}</div>
        <div style={{ fontSize: 17, marginTop: 8, color: "rgba(255,255,255,.85)" }}>{[f.contactEmail, f.contactPhone].filter(Boolean).join("   ·   ")}</div>
        {f.cta && <div style={{ display: "inline-block", marginTop: 18, background: C.orange, color: "#fff", fontWeight: 600, fontSize: 14, letterSpacing: ".12em", textTransform: "uppercase", padding: "10px 20px", borderRadius: 6 }}>{f.cta}</div>}
      </div>
    </>
  );
};

R.custom = ({ f }) => {
  const bullets = String(f.body || "").split("\n").filter((s) => s.trim());
  const hasPhoto = !!f.photo;
  return (
    <>
      <Header f={{ eyebrow: f.eyebrow, title: f.title }} w={hasPhoto ? 640 : SW - 2 * M} />
      <div style={abs(M, 250, hasPhoto ? 620 : SW - 2 * M, 400)}>
        {bullets.map((b, i) => (
          <div key={i} style={{ display: "flex", gap: 16, alignItems: "baseline", fontFamily: FONT_BODY, fontSize: 20, color: C.ink, lineHeight: 1.45, marginBottom: 14 }}>
            <span style={{ width: 10, height: 10, background: C.teal, transform: "skewX(-24deg)", flexShrink: 0, display: "inline-block" }} />
            <span>{b}</span>
          </div>
        ))}
      </div>
      {hasPhoto && (CUTOUTS.has(f.photo)
        ? <><div style={abs(820, 170, 360, 420, { background: C.teal, transform: "skewX(-24deg)", borderRadius: 26 })} /><Photo k={f.photo} style={abs(800, 110, 420, 520)} /></>
        : <Photo k={f.photo} style={abs(760, 120, 456, 520, { borderRadius: 18 })} />)}
    </>
  );
};

const DARK = new Set(["solution"]);
const DARK_FOOTER = new Set(["solution", "nextsteps"]);
const BG = { whynow: C.gray };

export function SlideCanvas({ slide, f, ctx, n }) {
  const Comp = R[slide.type];
  const dark = DARK.has(slide.type);
  return (
    <div style={{ width: SW, height: SH, position: "relative", overflow: "hidden", background: dark ? C.deep : BG[slide.type] || "#fff", fontFamily: FONT_BODY }}>
      <Comp f={f} ctx={ctx} />
      {slide.type !== "cover" && <Footer ctx={ctx} n={n} dark={DARK_FOOTER.has(slide.type)} />}
    </div>
  );
}

// Scales the fixed 1280×720 canvas to whatever width it's given.
export function ScaledSlide({ width, ...p }) {
  const s = width / SW;
  return (
    <div style={{ width, height: SH * s, overflow: "hidden", position: "relative" }}>
      <div style={{ transform: `scale(${s})`, transformOrigin: "top left", width: SW, height: SH }}>
        <SlideCanvas {...p} />
      </div>
    </div>
  );
}
