import React, { useState } from "react";
import { Field, Num, Text, Area, Seg, Kpi } from "../components/ui.jsx";
import { ZONES, bandLabel, setBands, defaultPricing } from "../lib/pricing.js";
import { RateTable } from "../slides/Slides.jsx";
import { fmtMoney, fmtPct, fmtInt } from "../lib/format.js";
import { productContent } from "../slides/defs.js";
import { exportRateCardXlsx } from "../lib/exportXlsx.js";

export default function PricingStep({ state, set, analysis, go, toast }) {
  const p = state.pricing;
  const up = (patch) => set((s) => ({ ...s, pricing: { ...s.pricing, ...patch } }));
  const upT = (k) => (v) => up({ terms: { ...p.terms, [k]: v } });
  const [bandsTxt, setBandsTxt] = useState(p.bands.join(", "));
  const applyBands = () => {
    const b = [...new Set(bandsTxt.split(/[,\s]+/).map(Number).filter((x) => x > 0))].sort((x, y) => x - y);
    if (b.length) { up(setBands(p, b)); setBandsTxt(b.join(", ")); }
  };
  const setFlat = (i, v) => { const flat = [...p.flat]; flat[i] = v; up({ flat }); };
  const setZ = (i, j, v) => { const zoned = p.zoned.map((r) => [...r]); zoned[i][j] = v; up({ zoned }); };
  const setAcc = (i, k, v) => { const acc = p.accessorials.map((a) => ({ ...a })); acc[i][k] = v; up({ accessorials: acc }); };
  const prod = productContent(state.deal.product);
  const s = analysis?.savings;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Step 03</div>
          <h1>Pricing & rate card</h1>
          <div className="sub">Build the {prod.rateCardService.toLowerCase()} rate card. It feeds the savings model, the rate-card slide and the Excel rate card.</div>
        </div>
        <div className="row">
          <button className="btn ghost" onClick={() => exportRateCardXlsx({ deal: state.deal, pricing: p, productLabel: prod.rateCardService }).then(() => toast("Rate card downloaded"))}>Download rate card (.xlsx)</button>
          <button className="btn big" onClick={() => go("deck")}>Next: presentation →</button>
        </div>
      </div>

      {!p.approved && (
        <div className="banner warn" style={{ marginBottom: 18 }}>
          <span>The starting rates are <b>illustrative placeholders</b>, not approved DropX pricing. Slides and the Excel file are marked "Illustrative pricing" until you tick <b>Rates approved</b> below.</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.25fr) minmax(0, 1fr)", gap: 20, alignItems: "start" }}>
        <div className="stack">
          <div className="card stack">
            <div className="row">
              <h2 style={{ margin: 0 }}>Structure</h2>
              <div className="spacer" />
              <Seg value={p.structure} onChange={(v) => up({ structure: v })} options={[["flat", "Flat by weight"], ["zoned", "Weight × zone"]]} />
            </div>
            <div className="grid2">
              <Field label="Weight bands (upper limit, lb)" hint="Comma-separated, e.g. 1, 2, 3, 5, 10, 20">
                <div className="row" style={{ flexWrap: "nowrap" }}><Text value={bandsTxt} onChange={setBandsTxt} onBlur={applyBands} onKeyDown={(e) => e.key === "Enter" && applyBands()} /></div>
              </Field>
              {p.structure === "zoned" ? (
                <div className="grid2">
                  <Field label="Destination ZIP" hint="Return centre / DC. Used to estimate zones."><Text value={p.destZip} onChange={(v) => up({ destZip: v })} placeholder="e.g. 17036" /></Field>
                  <Field label="Fallback zone" hint="When a ZIP is unknown"><Num value={p.avgZone} onChange={(v) => up({ avgZone: v || 5 })} step="1" min="1" max="8" /></Field>
                </div>
              ) : <div />}
            </div>
          </div>

          <div className="card">
            <h2>Base rates ($ per parcel)</h2>
            <div style={{ overflowX: "auto" }}>
              <table className="tbl">
                <thead><tr><th>Weight</th>{p.structure === "zoned" ? ZONES.map((z) => <th key={z} className="num">Zone {z}</th>) : <th className="num">Base rate</th>}</tr></thead>
                <tbody>
                  {p.bands.map((b, i) => (
                    <tr key={i}>
                      <td style={{ whiteSpace: "nowrap", fontWeight: 600, color: "var(--deep)" }}>{bandLabel(p.bands, i)}</td>
                      {p.structure === "zoned"
                        ? ZONES.map((_, j) => <td key={j}><Num className="sm" value={p.zoned[i]?.[j]} onChange={(v) => setZ(i, j, v)} style={{ minWidth: 70 }} /></td>)
                        : <td><Num className="sm" value={p.flat[i]} onChange={(v) => setFlat(i, v)} /></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="row" style={{ marginTop: 14 }}>
              <Field label="Discount (%)"><Num value={p.discountPct} onChange={(v) => up({ discountPct: v || 0 })} step="0.5" /></Field>
              <Field label="Fuel surcharge (%)"><Num value={p.fuelPct} onChange={(v) => up({ fuelPct: v || 0 })} step="0.25" /></Field>
              <Field label="Show fuel"><Seg value={p.fuelMode} onChange={(v) => up({ fuelMode: v })} options={[["separate", "As surcharge"], ["included", "Built into rates"]]} /></Field>
            </div>
          </div>

          <div className="card">
            <div className="row" style={{ marginBottom: 10 }}>
              <h2 style={{ margin: 0 }}>Accessorials</h2><div className="spacer" />
              <button className="btn ghost sm" onClick={() => up({ accessorials: [...p.accessorials, { name: "", amount: 0, unit: "per parcel" }] })}>+ Add</button>
            </div>
            <table className="tbl">
              <thead><tr><th>Charge</th><th className="num" style={{ width: 110 }}>Amount ($)</th><th style={{ width: 130 }}>Unit</th><th style={{ width: 30 }} /></tr></thead>
              <tbody>
                {p.accessorials.map((a, i) => (
                  <tr key={i}>
                    <td><input className="inp sm" value={a.name} onChange={(e) => setAcc(i, "name", e.target.value)} /></td>
                    <td><Num className="sm" value={a.amount} onChange={(v) => setAcc(i, "amount", v)} /></td>
                    <td><input className="inp sm" value={a.unit} onChange={(e) => setAcc(i, "unit", e.target.value)} /></td>
                    <td><button className="ibtn" title="Remove" onClick={() => up({ accessorials: p.accessorials.filter((_, j) => j !== i) })}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card stack">
            <h2 style={{ margin: 0 }}>Terms</h2>
            <div className="grid3">
              <Field label="Validity"><Text value={p.terms.validity} onChange={upT("validity")} /></Field>
              <Field label="Minimum volume / commitment"><Text value={p.terms.minimum} onChange={upT("minimum")} placeholder="e.g. 2,000 parcels / week" /></Field>
              <Field label="Billing"><Text value={p.terms.billing} onChange={upT("billing")} /></Field>
            </div>
            <Field label="Notes (shown under the rate table)"><Area value={p.terms.notes} onChange={upT("notes")} rows={3} /></Field>
            <label className="row" style={{ gap: 10, cursor: "pointer", fontWeight: 600, color: "var(--deep)" }}>
              <input type="checkbox" checked={p.approved} onChange={(e) => up({ approved: e.target.checked })} style={{ width: 18, height: 18 }} />
              Rates approved for this client (removes the "Illustrative pricing" label)
            </label>
            <div><button className="btn link" onClick={() => { if (confirm("Reset all pricing to the default placeholders?")) { const d = defaultPricing(state.deal.product); up(d); setBandsTxt(d.bands.join(", ")); } }}>Reset to defaults</button></div>
          </div>
        </div>

        <div className="stack" style={{ position: "sticky", top: 84 }}>
          <div className="card">
            <div className="row" style={{ marginBottom: 12 }}>
              <h2 style={{ margin: 0 }}>Client rate card</h2>
              <span className={"pill " + (p.approved ? "teal" : "orange")}>{p.approved ? "Approved" : "Illustrative"}</span>
            </div>
            <RateTable pricing={p} compact={p.structure === "zoned"} />
            {p.fuelPct > 0 && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>Fuel surcharge {p.fuelPct}% {p.fuelMode === "included" ? "is built into the rates shown." : "applies on top of the rates shown."}</div>}
          </div>
          {s ? (
            <div className="card">
              <h2>Savings with these rates</h2>
              <div className="kpis" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <Kpi accent v={fmtMoney(s.annual, 0)} l={`Est. annual savings (${fmtPct(s.pct)})`} />
                <Kpi v={fmtMoney(s.perParcel)} l="Saving per parcel" />
                <Kpi v={fmtMoney(s.avgCur)} l="Current avg / parcel" />
                <Kpi v={fmtMoney(s.avgDx)} l="DropX avg / parcel (all-in)" />
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 10 }}>{fmtInt(analysis.annualVolume)} parcels / year{analysis.estimate ? " · quick estimate" : ""}</div>
            </div>
          ) : (
            <div className="banner info">Add client data or a quick estimate with a current cost to see savings here.</div>
          )}
        </div>
      </div>
    </div>
  );
}
