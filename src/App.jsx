import React, { useEffect, useMemo, useRef, useState } from "react";
import { LOGO_WHITE } from "./brand/brand.js";
import { DEFAULT_FACTS, HUBS } from "./data/content.js";
import { defaultPricing } from "./lib/pricing.js";
import { defaultDeck, productContent, resolveSlide, slideAvailable } from "./slides/defs.js";
import { normalizeRows, analyze, quickEstimate, coverageShare } from "./lib/analyze.js";
import { loadSaved, save, clearSaved } from "./lib/storage.js";
import { downloadBlob } from "./lib/exportXlsx.js";
import { todayISO, slug } from "./lib/format.js";
import { SlideCanvas } from "./slides/Slides.jsx";
import DealStep from "./steps/DealStep.jsx";
import DataStep from "./steps/DataStep.jsx";
import PricingStep from "./steps/PricingStep.jsx";
import DeckStep, { Present } from "./steps/DeckStep.jsx";
import ExportStep from "./steps/ExportStep.jsx";

const STEPS = [["deal", "Deal"], ["data", "Data"], ["pricing", "Pricing"], ["deck", "Presentation"], ["export", "Export"]];
const VERSION = 1;

function freshState() {
  return {
    v: VERSION,
    deal: { client: "", contactName: "", contactTitle: "", industry: "", currentProvider: "", product: "returns", repName: "", repTitle: "", repEmail: "", repPhone: "", date: todayISO() },
    facts: { ...DEFAULT_FACTS },
    hubs: HUBS,
    dataMode: "none",
    map: {}, weightUnit: "lb", periodMonths: 12, rows: [], fileName: "", sample: false,
    quick: { annualVolume: 250000, avgCost: 8.5, currentProvider: "", mix: [45, 25, 13, 8, 6, 2, 1, 0] },
    locations: [], locationsFile: "",
    pricing: defaultPricing("returns"),
    deck: defaultDeck(),
  };
}

// Keep saved files forward-compatible: merge onto fresh defaults.
function hydrate(s) {
  const f = freshState();
  if (!s || typeof s !== "object") return f;
  return { ...f, ...s, deal: { ...f.deal, ...s.deal }, facts: { ...f.facts, ...s.facts }, quick: { ...f.quick, ...s.quick },
    pricing: { ...f.pricing, ...s.pricing, terms: { ...f.pricing.terms, ...(s.pricing?.terms || {}) } }, deck: s.deck?.length ? s.deck : f.deck };
}

export default function App() {
  const [state, setState] = useState(() => hydrate(loadSaved()));
  const [step, setStep] = useState("deal");
  const [table, setTable] = useState(null); // raw upload (memory only)
  const [presenting, setPresenting] = useState(null);
  const [printing, setPrinting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const toastT = useRef();
  const toast = (m) => { setToastMsg(m); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToastMsg(""), 3200); };

  // Re-normalise rows whenever the upload or its mapping changes.
  useEffect(() => {
    if (!table) return;
    const rows = normalizeRows(table, state.map, { weightUnit: state.weightUnit });
    setState((s) => ({ ...s, rows }));
  }, [table, state.map, state.weightUnit]);

  // Autosave (rows only if small enough for browser storage).
  useEffect(() => {
    const t = setTimeout(() => {
      const ok = save(state.rows.length > 40000 ? { ...state, rows: [] } : state);
      if (!ok && state.rows.length) save({ ...state, rows: [] });
    }, 500);
    return () => clearTimeout(t);
  }, [state]);

  const analysis = useMemo(() => {
    if (state.dataMode === "file" && state.rows.length) return analyze(state.rows, state.pricing, { periodMonths: state.periodMonths });
    if (state.dataMode === "quick" && state.quick.annualVolume > 0) return quickEstimate(state.quick, state.pricing);
    return null;
  }, [state.dataMode, state.rows, state.pricing, state.periodMonths, state.quick]);

  const coverage = useMemo(() => {
    if (state.dataMode !== "file" || !state.locations.length) return null;
    return coverageShare(state.rows, new Set(state.locations.map((l) => l.zip3).filter(Boolean)));
  }, [state.rows, state.locations, state.dataMode]);

  const ctx = useMemo(() => ({
    deal: state.deal, facts: state.facts, hubs: state.hubs, P: productContent(state.deal.product),
    analysis, pricing: state.pricing, locations: state.locations, coverage,
  }), [state.deal, state.facts, state.hubs, analysis, state.pricing, state.locations, coverage]);

  const saveDeal = () => {
    const blob = new Blob([JSON.stringify(state)], { type: "application/json" });
    downloadBlob(blob, `DropX_Deal_${slug(state.deal.client)}.json`);
    toast("Deal saved");
  };
  const loadDeal = async (file) => {
    try {
      const s = JSON.parse(await file.text());
      setTable(null); setState(hydrate(s)); setStep("deal");
      toast(`Loaded ${s.deal?.client || "deal"}`);
    } catch { toast("That file isn't a DropX deal file."); }
  };
  const newDeal = () => {
    if (!confirm("Start a new deal? Save the current one first if you need it.")) return;
    clearSaved(); setTable(null); setState(freshState()); setStep("deal");
  };
  const printPdf = () => {
    setPrinting(true);
    setTimeout(() => { window.print(); setPrinting(false); }, 400);
  };

  const visible = state.deck.filter((s) => s.enabled && slideAvailable(s, ctx));
  const props = { state, set: setState, ctx, analysis, go: setStep, toast };

  return (
    <>
      <div id="app-shell">
        <header className="topbar">
          <div className="brand"><img src={LOGO_WHITE} alt="DropX" /><span>PreSales Engine</span></div>
          <nav className="steps">
            {STEPS.map(([k, l], i) => (
              <button key={k} className={"step" + (step === k ? " on" : "")} onClick={() => setStep(k)}><b>{String(i + 1).padStart(2, "0")}</b><span>{l}</span></button>
            ))}
          </nav>
          <div className="actions">
            <button className="tbtn" onClick={newDeal}>New</button>
            <label className="tbtn" style={{ cursor: "pointer" }}>Load<input type="file" accept=".json" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) loadDeal(f); e.target.value = ""; }} /></label>
            <button className="tbtn" onClick={saveDeal}>Save</button>
          </div>
        </header>
        {step === "deal" && <DealStep {...props} />}
        {step === "data" && <DataStep {...props} table={table} setTable={setTable} />}
        {step === "pricing" && <PricingStep {...props} />}
        {step === "deck" && <DeckStep {...props} present={(i) => setPresenting({ start: i })} />}
        {step === "export" && <ExportStep {...props} present={(i) => setPresenting({ start: i })} printPdf={printPdf} saveDeal={saveDeal} />}
      </div>
      {presenting && visible.length > 0 && <Present slides={visible} ctx={ctx} start={Math.min(presenting.start, visible.length - 1)} onClose={() => setPresenting(null)} />}
      {printing && (
        <div className="print-root">
          {visible.map((s, i) => <div key={s.id} className="print-page"><SlideCanvas slide={s} f={resolveSlide(s, ctx)} ctx={ctx} n={i + 1} /></div>)}
        </div>
      )}
      {toastMsg && <div className="toast">{toastMsg}</div>}
    </>
  );
}
