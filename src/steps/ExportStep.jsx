import React, { useState } from "react";
import { resolveSlide, slideAvailable, productContent } from "../slides/defs.js";
import { ScaledSlide } from "../slides/Slides.jsx";
import { exportPptx } from "../lib/exportPptx.js";
import { exportRateCardXlsx } from "../lib/exportXlsx.js";

export default function ExportStep({ state, ctx, present, printPdf, saveDeal, toast }) {
  const slides = state.deck.filter((s) => s.enabled && slideAvailable(s, ctx));
  const [busy, setBusy] = useState("");
  const run = async (k, fn, msg) => {
    setBusy(k);
    try { await fn(); toast(msg); } catch (e) { console.error(e); toast("Export failed: " + (e.message || e)); } finally { setBusy(""); }
  };
  const prod = productContent(state.deal.product);
  const items = [
    ["pptx", "PowerPoint (.pptx)", "Fully editable deck in DropX branding. Charts are native PowerPoint charts.", () => run("pptx", () => exportPptx(state.deck, ctx), "PowerPoint downloaded"), "btn orange"],
    ["pdf", "PDF", "Opens the print dialog with one slide per page. Choose \"Save as PDF\" and turn on background graphics.", printPdf, "btn"],
    ["xlsx", "Rate card (.xlsx)", "Branded Excel rate card with accessorials and terms, ready to send.", () => run("xlsx", () => exportRateCardXlsx({ deal: state.deal, pricing: state.pricing, productLabel: prod.rateCardService }), "Rate card downloaded"), "btn"],
    ["json", "Deal file (.json)", "Everything in this deal, including mapped data. Load it later from the top bar to pick up where you left off.", saveDeal, "btn ghost"],
  ];
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Step 05</div>
          <h1>Export & present</h1>
          <div className="sub">{slides.length} slides for {state.deal.client || "your client"}.{!state.pricing.approved && " Pricing is still marked illustrative."}</div>
        </div>
        <button className="btn orange big" onClick={() => present(0)}>▶ Present full screen</button>
      </div>
      <div className="grid4" style={{ marginBottom: 24 }}>
        {items.map(([k, t, d, fn, cls]) => (
          <div key={k} className="card" style={{ display: "flex", flexDirection: "column" }}>
            <h3>{t}</h3>
            <div className="sub" style={{ marginTop: 0, fontSize: 13, flex: 1 }}>{d}</div>
            <div style={{ marginTop: 14 }}><button className={cls} disabled={!!busy} onClick={fn}>{busy === k ? "Working…" : "Download"}</button></div>
          </div>
        ))}
      </div>
      <div className="thumbs">
        {slides.map((s, i) => (
          <div key={s.id} className="thumb" onClick={() => present(i)} title="Present from here">
            <ScaledSlide width={300} slide={s} f={resolveSlide(s, ctx)} ctx={ctx} n={i + 1} />
          </div>
        ))}
      </div>
    </div>
  );
}
