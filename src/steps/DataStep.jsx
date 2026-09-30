import React, { useState } from "react";
import { Field, Num, Select, Text, Kpi, Seg } from "../components/ui.jsx";
import { readTable, FIELDS, autoMap } from "../lib/parse.js";
import { sampleTable } from "../lib/sample.js";
import { bandLabel } from "../lib/pricing.js";
import { normZip, zip3Of, zipToLatLng } from "../lib/geo.js";
import { fmtInt, fmtMoney, fmtNum, fmtPct, fmtDate } from "../lib/format.js";
import { USMap } from "../components/USMap.jsx";
import { MapLegend } from "../slides/Slides.jsx";
import { C } from "../brand/brand.js";

function Drop({ onFile, label, accept = ".csv,.xlsx,.xls,.txt" }) {
  const [over, setOver] = useState(false);
  return (
    <label className={"drop" + (over ? " over" : "")} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }} style={{ display: "block", cursor: "pointer" }}>
      <input type="file" accept={accept} style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
      <div style={{ fontFamily: "var(--display)", fontSize: 17, color: "var(--deep)", fontWeight: 600 }}>{label}</div>
      <div style={{ marginTop: 6 }}>Drag a CSV or Excel file here, or click to browse. Files stay in your browser.</div>
    </label>
  );
}

export function Bars({ items, color = C.teal, fmt = fmtPct, labelW = 130 }) {
  const max = Math.max(1e-9, ...items.map((x) => x[1]));
  return (
    <div>
      {items.map(([l, v], i) => (
        <div key={i} title={`${l}: ${fmt(v)}`} style={{ display: "flex", alignItems: "center", height: 26, fontSize: 12.5 }}>
          <div style={{ width: labelW, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>{l}</div>
          <div style={{ flex: 1, position: "relative", height: 12 }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(v / max) * 84}%`, minWidth: v > 0 ? 2 : 0, background: color, borderRadius: "0 4px 4px 0" }} />
            <div style={{ position: "absolute", left: `calc(${(v / max) * 84}% + 6px)`, top: -3, fontWeight: 600, color: C.deep }}>{fmt(v)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DataStep({ state, set, table, setTable, analysis, ctx, go, toast }) {
  const mode = state.dataMode;
  const setMode = (m) => set((s) => ({ ...s, dataMode: m }));
  const [err, setErr] = useState("");

  const onFile = async (file) => {
    setErr("");
    try {
      const t = await readTable(file);
      setTable(t);
      set((s) => ({ ...s, dataMode: "file", map: autoMap(t.headers), fileName: t.fileName, sample: false }));
      toast(`Loaded ${fmtInt(t.rows.length)} rows from ${file.name}`);
    } catch (e) { setErr(String(e.message || e)); }
  };
  const loadSample = () => {
    const t = sampleTable();
    setTable(t);
    set((s) => ({ ...s, dataMode: "file", map: autoMap(t.headers), fileName: t.fileName, sample: true }));
    toast("Sample returns data loaded");
  };
  const onLocations = async (file) => {
    try {
      const t = await readTable(file);
      const H = t.headers.map((h) => h.toLowerCase());
      const zi = H.findIndex((h) => /zip|postal/.test(h));
      const la = H.findIndex((h) => /^lat/.test(h)), lo = H.findIndex((h) => /^(lon|lng)/.test(h));
      const locs = [];
      for (const r of t.rows) {
        let lat = la >= 0 ? parseFloat(r[la]) : NaN, lng = lo >= 0 ? parseFloat(r[lo]) : NaN;
        const z = zi >= 0 ? normZip(r[zi]) : null;
        if (!(isFinite(lat) && isFinite(lng)) && z) { const ll = zipToLatLng(z); if (ll) { lat = ll.lat; lng = ll.lng; } }
        if (isFinite(lat) && isFinite(lng)) locs.push({ lat, lng, zip3: z ? zip3Of(z) : null });
      }
      if (!locs.length) throw new Error("Couldn't find ZIP or latitude/longitude columns.");
      set((s) => ({ ...s, locations: locs, locationsFile: file.name }));
      toast(`${fmtInt(locs.length)} DropX locations loaded`);
    } catch (e) { setErr(String(e.message || e)); }
  };

  const map = state.map || {};
  const setMap = (k, v) => set((s) => ({ ...s, map: { ...s.map, [k]: v === "" ? -1 : +v } }));
  const q = state.quick;
  const upQ = (k) => (v) => set((s) => ({ ...s, quick: { ...s.quick, [k]: v } }));
  const a = analysis;
  const noun = state.deal.product === "merchant" ? "shipments" : "returns";

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Step 02</div>
          <h1>Client data</h1>
          <div className="sub">Upload the client's {noun} data (PLD) for a real profile, map and savings model. No file yet? Use a quick estimate from discovery numbers.</div>
        </div>
        <button className="btn big" onClick={() => go("pricing")}>Next: pricing →</button>
      </div>

      <div className="grid3" style={{ marginBottom: 20 }}>
        {[["file", "Upload parcel data", "CSV or Excel export with ZIPs, weights and costs. Gives the full profile, map and savings."],
          ["quick", "Quick estimate", "No file? Enter annual volume, average cost and a weight mix from discovery."],
          ["none", "Skip for now", "Build a story-only deck. Data slides are hidden until you add data."]].map(([k, t, d]) => (
          <button key={k} className={"choice" + (mode === k ? " on" : "")} onClick={() => setMode(k)}>
            <div className="t">{t}</div><div className="d">{d}</div>
          </button>
        ))}
      </div>
      {err && <div className="banner warn" style={{ marginBottom: 16 }}>{err}</div>}

      {mode === "file" && (
        <div className="stack">
          {!table && !state.rows?.length && (
            <div className="grid2">
              <Drop onFile={onFile} label="Upload client parcel data" />
              <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <h3>Just exploring?</h3>
                <div className="sub" style={{ marginTop: 0, marginBottom: 12 }}>Load 4,000 synthetic returns to see how the tool works. It's labelled as sample data everywhere.</div>
                <div><button className="btn ghost" onClick={loadSample}>Load sample data</button></div>
              </div>
            </div>
          )}
          {(table || state.rows?.length > 0) && (
            <div className="card">
              <div className="row" style={{ marginBottom: 12 }}>
                <h2 style={{ margin: 0 }}>{state.fileName || "Uploaded data"}</h2>
                {state.sample && <span className="pill orange">Sample data</span>}
                <span className="pill teal">{fmtInt(table ? table.rows.length : state.rows.length)} rows</span>
                <div className="spacer" />
                <label className="btn ghost sm" style={{ cursor: "pointer" }}>Replace file<input type="file" accept=".csv,.xlsx,.xls,.txt" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} /></label>
                <button className="btn ghost sm" onClick={() => { setTable(null); set((s) => ({ ...s, rows: [], fileName: "", sample: false })); }}>Clear</button>
              </div>
              {table ? (
                <>
                  <h3>Map columns</h3>
                  <table className="tbl">
                    <thead><tr><th style={{ width: "28%" }}>DropX field</th><th style={{ width: "30%" }}>Column in file</th><th>First values</th></tr></thead>
                    <tbody>
                      {FIELDS.map((f) => {
                        const ci = map[f.key];
                        const vals = ci >= 0 ? table.rows.slice(0, 3).map((r) => r[ci] instanceof Date ? r[ci].toLocaleDateString() : String(r[ci] ?? "")).join("  ·  ") : "";
                        return (
                          <tr key={f.key}>
                            <td><b style={{ color: "var(--deep)" }}>{f.label}</b><div style={{ fontSize: 11.5, color: "var(--muted)" }}>{f.hint}</div></td>
                            <td><select className="inp sm" value={ci >= 0 ? ci : ""} onChange={(e) => setMap(f.key, e.target.value)}>
                              <option value="">— not in file —</option>
                              {table.headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                            </select></td>
                            <td style={{ color: "var(--muted)", fontSize: 12 }}>{vals}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="row" style={{ marginTop: 14 }}>
                    <Field label="Weight unit (if no unit column)"><Select value={state.weightUnit} onChange={(v) => set((s) => ({ ...s, weightUnit: v }))} options={[["lb", "Pounds (lb)"], ["oz", "Ounces (oz)"], ["kg", "Kilograms (kg)"]]} /></Field>
                    <Field label="Months of data in file" hint="Used to annualise when there's no date column."><Num value={state.periodMonths} onChange={(v) => set((s) => ({ ...s, periodMonths: v || 1 }))} step="1" /></Field>
                  </div>
                </>
              ) : (
                <div className="banner info">Mapped data restored from your last session ({fmtInt(state.rows.length)} parcels). Upload the file again to change the column mapping.</div>
              )}
            </div>
          )}
        </div>
      )}

      {mode === "quick" && (
        <div className="card">
          <h2>Quick estimate</h2>
          <div className="grid3">
            <Field label={`Annual ${noun} (parcels)`}><Num value={q.annualVolume} onChange={upQ("annualVolume")} step="1000" /></Field>
            <Field label="Current average cost per parcel ($)"><Num value={q.avgCost} onChange={upQ("avgCost")} /></Field>
            <Field label="Current provider"><Text value={q.currentProvider} onChange={upQ("currentProvider")} /></Field>
          </div>
          <h3 style={{ marginTop: 18 }}>Weight mix (% of parcels)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
            {state.pricing.bands.map((b, i) => (
              <Field key={i} label={bandLabel(state.pricing.bands, i)}>
                <Num value={q.mix[i]} step="1" onChange={(v) => set((s) => { const mix = [...s.quick.mix]; mix[i] = v; return { ...s, quick: { ...s.quick, mix } }; })} />
              </Field>
            ))}
          </div>
          <div className="hint" style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>Total: {fmtNum(q.mix.reduce((x, y) => x + (+y || 0), 0), 0)}% (normalised automatically)</div>
        </div>
      )}

      {a && mode !== "none" && (
        <div className="stack" style={{ marginTop: 20 }}>
          <div className="kpis">
            <Kpi accent v={fmtInt(a.annualVolume)} l={`Annual ${noun}${a.estimate ? "" : a.days ? ` (from ${Math.round(a.days)} days of data)` : ` (from ${a.periodMonths} months)`}`} />
            <Kpi v={a.avgLb != null ? fmtNum(a.avgLb, 2) + " lb" : "–"} l="Average weight" />
            <Kpi v={fmtMoney(a.avgCost)} l="Current avg cost / parcel" />
            <Kpi v={a.savings ? fmtMoney(a.savings.annual, 0) : "–"} l={a.savings ? `Est. annual savings (${fmtPct(a.savings.pct)})` : "Add cost data for savings"} />
          </div>
          {!a.estimate && (a.costCoverage < 0.5 || a.overweight > 0) && (
            <div className="banner warn">
              {a.costCoverage < 0.5 && <span>Only {fmtPct(a.costCoverage)} of rows have a cost, so savings are based on those rows. </span>}
              {a.overweight > 0 && <span>{fmtInt(a.overweight)} parcels are heavier than the top weight band and are excluded from savings.</span>}
            </div>
          )}
          <div className="grid2">
            <div className="card">
              <h3>Share of parcels by weight</h3>
              <Bars items={a.bands.map((b) => [b.label, b.share])} />
            </div>
            <div className="card">
              {a.carriers?.length > 0 ? (<><h3>Current carrier mix</h3><Bars items={a.carriers.map(([c, n]) => [c, n / a.carrierTotal])} color={C.blue} labelW={150} /></>)
                : (<><h3>Top origin states</h3><Bars items={a.states.slice(0, 8).map(([s, n]) => [s, n / a.n])} color={C.blue} labelW={50} /></>)}
            </div>
          </div>
          {!a.estimate && a.zip3Count > 0 && (
            <div className="card">
              <div className="row"><h3 style={{ margin: 0 }}>Where parcels start</h3><span className="pill">{a.stateCount} states · {a.zip3Count} ZIP3 areas</span>
                {a.dateFrom && <span className="pill">{fmtDate(a.dateFrom)} – {fmtDate(a.dateTo)}</span>}</div>
              <div style={{ maxWidth: 860, margin: "10px auto 0" }}>
                <USMap zip3s={a.zip3s} hubs={ctx.hubs} locations={state.locations} />
                <MapLegend ctx={ctx} style={{ justifyContent: "center", marginTop: 6 }} />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card" style={{ marginTop: 20 }}>
        <div className="row">
          <div>
            <h3>DropX drop-off locations <span className="pill" style={{ marginLeft: 6 }}>Optional</span></h3>
            <div className="sub" style={{ marginTop: 0 }}>Upload a current locations export (ZIP or latitude/longitude columns) to plot real locations and show what share of the client's parcels start in a ZIP3 area DropX already serves.</div>
          </div>
          <div className="spacer" />
          {state.locations?.length ? (
            <div className="row"><span className="pill teal">{fmtInt(state.locations.length)} locations · {state.locationsFile}</span>
              <button className="btn ghost sm" onClick={() => set((s) => ({ ...s, locations: [], locationsFile: "" }))}>Remove</button></div>
          ) : (
            <label className="btn ghost" style={{ cursor: "pointer" }}>Upload locations<input type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) onLocations(f); e.target.value = ""; }} /></label>
          )}
        </div>
        {ctx.coverage && <div className="banner info" style={{ marginTop: 12 }}><b>{fmtPct(ctx.coverage.share)}</b>&nbsp;of {state.deal.client || "the client"}'s parcels start in a ZIP3 area with at least one DropX location.</div>}
      </div>
    </div>
  );
}
