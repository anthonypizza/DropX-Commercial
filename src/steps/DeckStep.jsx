import React, { useEffect, useRef, useState } from "react";
import { SLIDE_TYPES, resolveSlide, slideAvailable, newSlide } from "../slides/defs.js";
import { ScaledSlide, SW, SH } from "../slides/Slides.jsx";
import { Field } from "../components/ui.jsx";
import { PHOTO_OPTIONS } from "../brand/brand.js";

function useWidth(ref) {
  const [w, setW] = useState(800);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return w;
}

function ListEditor({ value, cols, max, onChange }) {
  const rows = value || [];
  const upd = (i, j, v) => onChange(rows.map((r, k) => (k === i ? r.map((c, m) => (m === j ? v : c)) : r)));
  return (
    <div className="listed">
      {rows.map((r, i) => (
        <div key={i} className="li">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>#{i + 1}</span>
            <span>
              <button className="ibtn" title="Move up" disabled={!i} onClick={() => { const n = [...rows]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n); }}>↑</button>
              <button className="ibtn" title="Remove" onClick={() => onChange(rows.filter((_, k) => k !== i))}>✕</button>
            </span>
          </div>
          {cols.map((c, j) => (
            c === "Body" || c === "Detail" || (cols.length <= 2 && j === 1 && String(r[j] || "").length > 40)
              ? <textarea key={j} className="inp sm" rows={2} placeholder={c} value={r[j] ?? ""} onChange={(e) => upd(i, j, e.target.value)} />
              : <input key={j} className="inp sm" placeholder={c} value={r[j] ?? ""} onChange={(e) => upd(i, j, e.target.value)} />
          ))}
        </div>
      ))}
      {(!max || rows.length < max) && <button className="btn link sm" onClick={() => onChange([...rows, cols.map(() => "")])}>+ Add item</button>}
    </div>
  );
}

export function Present({ slides, ctx, start = 0, onClose }) {
  const [i, setI] = useState(start);
  const [vw, setVw] = useState([window.innerWidth, window.innerHeight]);
  useEffect(() => {
    const onKey = (e) => {
      if (["ArrowRight", "PageDown", " ", "Enter"].includes(e.key)) { e.preventDefault(); setI((x) => Math.min(slides.length - 1, x + 1)); }
      else if (["ArrowLeft", "PageUp", "Backspace"].includes(e.key)) { e.preventDefault(); setI((x) => Math.max(0, x - 1)); }
      else if (e.key === "Escape") onClose();
      else if (e.key === "Home") setI(0);
      else if (e.key === "End") setI(slides.length - 1);
    };
    const onRs = () => setVw([window.innerWidth, window.innerHeight]);
    window.addEventListener("keydown", onKey); window.addEventListener("resize", onRs);
    document.documentElement.requestFullscreen?.().catch(() => {});
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("resize", onRs); if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {}); };
  }, []);
  const w = Math.min(vw[0], (vw[1] * SW) / SH);
  const sl = slides[i];
  return (
    <div className="present" onClick={(e) => { if (e.clientX > window.innerWidth / 3) setI((x) => Math.min(slides.length - 1, x + 1)); else setI((x) => Math.max(0, x - 1)); }}>
      <ScaledSlide width={w} slide={sl} f={resolveSlide(sl, ctx)} ctx={ctx} n={i + 1} />
      <div className="hud" onClick={(e) => e.stopPropagation()}>
        <span>{i + 1} / {slides.length}</span>
        <button onClick={() => setI((x) => Math.max(0, x - 1))}>←</button>
        <button onClick={() => setI((x) => Math.min(slides.length - 1, x + 1))}>→</button>
        <button onClick={onClose}>Exit (Esc)</button>
      </div>
    </div>
  );
}

export default function DeckStep({ state, set, ctx, go, present }) {
  const deck = state.deck;
  const [sel, setSel] = useState(deck[0]?.id);
  const cur = deck.find((s) => s.id === sel) || deck[0];
  const prevRef = useRef(null);
  const pw = useWidth(prevRef);
  const setDeck = (fn) => set((s) => ({ ...s, deck: fn(s.deck) }));
  const upd = (id, patch) => setDeck((d) => d.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const move = (id, dir) => setDeck((d) => { const i = d.findIndex((s) => s.id === id), j = i + dir; if (j < 0 || j >= d.length) return d; const n = [...d]; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const [addType, setAddType] = useState("");

  const visible = deck.filter((s) => s.enabled && slideAvailable(s, ctx));
  const numberOf = (s) => visible.indexOf(s) + 1;

  const def = cur && SLIDE_TYPES[cur.type];
  const f = cur ? resolveSlide(cur, ctx) : {};
  const defaults = cur ? def.defaults(ctx) || {} : {};
  const setField = (k, v) => upd(cur.id, { f: { ...cur.f, [k]: v } });
  const resetField = (k) => { const n = { ...cur.f }; delete n[k]; upd(cur.id, { f: n }); };

  return (
    <div className="page" style={{ maxWidth: 1600 }}>
      <div className="page-head">
        <div>
          <div className="eyebrow">Step 04</div>
          <h1>Presentation</h1>
          <div className="sub">Pick, order and edit slides. Copy fills itself from the deal, data and pricing. Anything you type overrides it (orange dot), and you can reset any field.</div>
        </div>
        <div className="row">
          <button className="btn orange big" onClick={() => present(Math.max(0, visible.indexOf(cur)))}>▶ Present</button>
          <button className="btn big" onClick={() => go("export")}>Next: export →</button>
        </div>
      </div>

      <div className="deck">
        <div className="slist">
          {deck.map((s) => {
            const avail = slideAvailable(s, ctx);
            const on = s.enabled && avail;
            return (
              <div key={s.id} className={"sitem" + (s.id === cur?.id ? " on" : "") + (on ? "" : " off")} onClick={() => setSel(s.id)}>
                <input type="checkbox" checked={s.enabled} onChange={(e) => upd(s.id, { enabled: e.target.checked })} onClick={(e) => e.stopPropagation()} title={avail ? "Include in deck" : "Needs data"} />
                <span className="n">{on ? numberOf(s) : ""}</span>
                <span className="nm" title={avail ? "" : "Add client data to use this slide"}>{s.type === "custom" ? (s.f.title || "Custom slide") : SLIDE_TYPES[s.type].label}{!avail && " · needs data"}</span>
                <span className="mini">
                  <button className="ibtn" title="Move up" onClick={(e) => { e.stopPropagation(); move(s.id, -1); }}>↑</button>
                  <button className="ibtn" title="Move down" onClick={(e) => { e.stopPropagation(); move(s.id, 1); }}>↓</button>
                  <button className="ibtn" title="Duplicate" onClick={(e) => { e.stopPropagation(); setDeck((d) => { const i = d.findIndex((x) => x.id === s.id); const n = [...d]; n.splice(i + 1, 0, { ...newSlide(s.type), f: { ...s.f } }); return n; }); }}>⧉</button>
                  <button className="ibtn" title="Delete" onClick={(e) => { e.stopPropagation(); if (deck.length > 1) { setDeck((d) => d.filter((x) => x.id !== s.id)); if (s.id === sel) setSel(deck.find((x) => x.id !== s.id)?.id); } }}>✕</button>
                </span>
              </div>
            );
          })}
          <div style={{ borderTop: "1px solid #EEEBE4", marginTop: 6, paddingTop: 8, display: "flex", gap: 6 }}>
            <select className="inp sm" value={addType} onChange={(e) => setAddType(e.target.value)}>
              <option value="">Add a slide…</option>
              {Object.entries(SLIDE_TYPES).map(([k, t]) => <option key={k} value={k}>{t.group} · {t.label}</option>)}
            </select>
            <button className="btn sm" disabled={!addType} onClick={() => { const s = newSlide(addType); setDeck((d) => { const i = d.findIndex((x) => x.id === cur?.id); const n = [...d]; n.splice(i + 1, 0, s); return n; }); setSel(s.id); setAddType(""); }}>Add</button>
          </div>
        </div>

        <div className="preview-wrap">
          <div ref={prevRef}>
            {cur && <div className="preview-shadow"><ScaledSlide width={pw} slide={cur} f={f} ctx={ctx} n={numberOf(cur) || "–"} /></div>}
          </div>
          {cur && !slideAvailable(cur, ctx) && <div className="banner warn" style={{ marginTop: 12 }}>This slide needs client data (step 02) and is skipped in exports until then.</div>}
          <div className="row" style={{ marginTop: 12, color: "var(--muted)", fontSize: 12.5 }}>
            <span>{visible.length} slides in deck</span><div className="spacer" />
            <button className="btn ghost sm" onClick={() => { const i = deck.indexOf(cur); if (i > 0) setSel(deck[i - 1].id); }}>← Prev</button>
            <button className="btn ghost sm" onClick={() => { const i = deck.indexOf(cur); if (i < deck.length - 1) setSel(deck[i + 1].id); }}>Next →</button>
          </div>
        </div>

        <div className="editor">
          {cur && (
            <>
              <div className="row" style={{ marginBottom: 12 }}>
                <h2 style={{ margin: 0 }}>{def.label}</h2>
                <div className="spacer" />
                {Object.keys(cur.f).length > 0 && <button className="btn link sm" onClick={() => upd(cur.id, { f: {} })}>Reset slide</button>}
              </div>
              {def.fields.map((fd) => {
                const edited = fd.key in cur.f;
                const lab = (
                  <span style={{ display: "flex", alignItems: "center", width: "100%" }}>
                    {fd.label}{edited && <span className="edited" title="Edited" />}
                    <span className="spacer" />
                    {edited && fd.key in defaults && <button className="btn link sm" style={{ padding: 0, fontSize: 11 }} onClick={() => resetField(fd.key)}>reset</button>}
                  </span>
                );
                return (
                  <Field key={fd.key} label={lab}>
                    {fd.kind === "text" && <input className="inp sm" value={f[fd.key] ?? ""} onChange={(e) => setField(fd.key, e.target.value)} />}
                    {fd.kind === "textarea" && <textarea className="inp sm" rows={String(f[fd.key] || "").length > 120 ? 5 : 3} value={f[fd.key] ?? ""} onChange={(e) => setField(fd.key, e.target.value)} />}
                    {fd.kind === "photo" && (
                      <select className="inp sm" value={f[fd.key] ?? ""} onChange={(e) => setField(fd.key, e.target.value)}>
                        <option value="">None</option>
                        {PHOTO_OPTIONS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                      </select>
                    )}
                    {fd.kind === "list" && <ListEditor value={f[fd.key]} cols={fd.cols} max={fd.max} onChange={(v) => setField(fd.key, v)} />}
                  </Field>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
