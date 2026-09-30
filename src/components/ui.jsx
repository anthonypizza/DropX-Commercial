import React from "react";

export const Field = ({ label, hint, children, style }) => (
  <div className="field" style={style}>
    {label && <label>{label}</label>}
    {children}
    {hint && <div className="hint">{hint}</div>}
  </div>
);

export const Text = ({ value, onChange, ...p }) => <input className="inp" value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...p} />;
export const Area = ({ value, onChange, rows = 3, ...p }) => <textarea className="inp" rows={rows} value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...p} />;
export const Num = ({ value, onChange, step = "0.01", className = "", ...p }) => (
  <input className={"inp num " + className} type="number" step={step} value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : parseFloat(e.target.value))} {...p} />
);
export const Select = ({ value, onChange, options, ...p }) => (
  <select className="inp" value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...p}>
    {options.map((o) => (Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o} value={o}>{o}</option>))}
  </select>
);
export const Seg = ({ value, onChange, options }) => (
  <div className="seg">{options.map(([v, l]) => <button key={v} className={value === v ? "on" : ""} onClick={() => onChange(v)}>{l}</button>)}</div>
);
export const Kpi = ({ v, l, accent }) => <div className={"kpi" + (accent ? " accent" : "")}><div className="v">{v}</div><div className="l">{l}</div></div>;
