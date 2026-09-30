import React from "react";
import { Field, Text, Select, Seg, Num } from "../components/ui.jsx";
import { INDUSTRIES } from "../data/content.js";

export default function DealStep({ state, set, go }) {
  const d = state.deal;
  const up = (k) => (v) => set((s) => ({ ...s, deal: { ...s.deal, [k]: v } }));
  const facts = state.facts;
  const upF = (k) => (v) => set((s) => ({ ...s, facts: { ...s.facts, [k]: v } }));
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Step 01</div>
          <h1>Deal set-up</h1>
          <div className="sub">Who the presentation is for and what you're selling. Everything here flows into the slides, rate card and file names.</div>
        </div>
        <button className="btn big" onClick={() => go("data")}>Next: client data →</button>
      </div>

      <div className="grid2">
        <div className="card stack">
          <h2>Client</h2>
          <Field label="Client / company name"><Text value={d.client} onChange={up("client")} placeholder="e.g. Acme Apparel" /></Field>
          <div className="grid2">
            <Field label="Contact name"><Text value={d.contactName} onChange={up("contactName")} /></Field>
            <Field label="Contact title"><Text value={d.contactTitle} onChange={up("contactTitle")} /></Field>
          </div>
          <div className="grid2">
            <Field label="Industry"><Select value={d.industry} onChange={up("industry")} options={["", ...INDUSTRIES].map((x) => [x, x || "Select…"])} /></Field>
            <Field label="Current provider(s)"><Text value={d.currentProvider} onChange={up("currentProvider")} placeholder="e.g. UPS Returns, Happy Returns" /></Field>
          </div>
          <Field label="Product" hint="Switches the story, parcel journey, integration paths and rate-card name.">
            <Seg value={d.product} onChange={(v) => set((s) => ({ ...s, deal: { ...s.deal, product: v } }))} options={[["returns", "Returns"], ["merchant", "Merchant drop-offs"]]} />
          </Field>
        </div>

        <div className="card stack">
          <h2>Prepared by</h2>
          <div className="grid2">
            <Field label="Your name"><Text value={d.repName} onChange={up("repName")} /></Field>
            <Field label="Your title"><Text value={d.repTitle} onChange={up("repTitle")} /></Field>
          </div>
          <div className="grid2">
            <Field label="Email"><Text value={d.repEmail} onChange={up("repEmail")} type="email" /></Field>
            <Field label="Phone"><Text value={d.repPhone} onChange={up("repPhone")} /></Field>
          </div>
          <Field label="Proposal date"><Text value={d.date} onChange={up("date")} type="date" /></Field>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="row" style={{ marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>DropX network facts</h2>
          <span className="pill">Used across all slides</span>
        </div>
        <div className="sub" style={{ marginTop: 0, marginBottom: 14 }}>Keep these current. Defaults come from the DropX overview deck ({facts.asOf}).</div>
        <div className="grid3">
          <Field label="As of"><Text value={facts.asOf} onChange={upF("asOf")} /></Field>
          <Field label="Live drop-off locations"><Num value={facts.liveLocations} onChange={upF("liveLocations")} step="1" /></Field>
          <Field label="ZIP codes covered"><Text value={facts.zipCodes} onChange={upF("zipCodes")} /></Field>
          <Field label="Parcels processed per day"><Text value={facts.parcelsPerDay} onChange={upF("parcelsPerDay")} /></Field>
          <Field label="Planned locations"><Text value={facts.plannedLocations} onChange={upF("plannedLocations")} /></Field>
          <Field label="…planned by"><Text value={facts.plannedBy} onChange={upF("plannedBy")} /></Field>
          <Field label="Population reach"><Text value={facts.populationReach} onChange={upF("populationReach")} /></Field>
          <Field label="Market cost per return: low ($)"><Num value={facts.marketCostLow} onChange={upF("marketCostLow")} step="1" /></Field>
          <Field label="Market cost per return: high ($)"><Num value={facts.marketCostHigh} onChange={upF("marketCostHigh")} step="1" /></Field>
          <Field label="Website"><Text value={facts.website} onChange={upF("website")} /></Field>
        </div>
      </div>
    </div>
  );
}
