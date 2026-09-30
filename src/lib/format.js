export const fmtInt = (n) => (n == null || !isFinite(n) ? "–" : Math.round(n).toLocaleString("en-US"));
export const fmtMoney = (n, d = 2) =>
  n == null || !isFinite(n) ? "–" : (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
export const fmtMoneyShort = (n) => {
  if (n == null || !isFinite(n)) return "–";
  const a = Math.abs(n), s = n < 0 ? "-$" : "$";
  if (a >= 1e6) return s + (a / 1e6).toFixed(a >= 1e7 ? 1 : 2) + "M";
  if (a >= 1e3) return s + (a / 1e3).toFixed(a >= 1e4 ? 0 : 1) + "K";
  return s + a.toFixed(0);
};
export const fmtPct = (n, d = 0) => (n == null || !isFinite(n) ? "–" : (n * 100).toFixed(d) + "%");
export const fmtNum = (n, d = 1) => (n == null || !isFinite(n) ? "–" : Number(n).toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d }));
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "");
export const todayISO = () => new Date().toISOString().slice(0, 10);
export const uid = () => Math.random().toString(36).slice(2, 10);
// Fill "{key}" / "${key}" placeholders from an object.
export const fill = (s, vars) => String(s ?? "").replace(/\$?\{(\w+)\}/g, (m, k) => (vars[k] != null ? (m.startsWith("$") ? "$" : "") + vars[k] : m));
export const slug = (s) => String(s || "client").replace(/[^\w\-]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "") || "client";
