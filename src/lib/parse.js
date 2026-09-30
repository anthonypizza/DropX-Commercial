// Reads CSV / XLSX uploads into { headers, rows } (rows = arrays of cell values).
import * as XLSX from "xlsx";

export async function readTable(file) {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true, raw: false });
  // Pick the sheet with the most rows.
  let best = null;
  for (const name of wb.SheetNames) {
    const aoa = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: "", raw: true, blankrows: false });
    if (!best || aoa.length > best.aoa.length) best = { name, aoa };
  }
  if (!best || !best.aoa.length) throw new Error("No rows found in " + file.name);
  // Header row = first row within the first 10 with the most non-empty text cells.
  let hi = 0, hc = -1;
  best.aoa.slice(0, 10).forEach((r, i) => {
    const c = r.filter((v) => typeof v === "string" && v.trim()).length;
    if (c > hc) { hc = c; hi = i; }
  });
  const headers = best.aoa[hi].map((h, i) => String(h || "").trim() || `Column ${i + 1}`);
  const rows = best.aoa.slice(hi + 1).filter((r) => r.some((v) => v !== "" && v != null));
  return { sheet: best.name, headers, rows, fileName: file.name };
}

// Field definitions + header aliases for auto-mapping.
export const FIELDS = [
  { key: "zip", label: "Consumer / origin ZIP", hint: "Where the parcel starts (the returner or seller)", aliases: ["origin zip", "from zip", "ship from zip", "sender zip", "customer zip", "consumer zip", "zip", "zipcode", "zip code", "postal code", "postcode", "origin postal", "shipper zip", "return from zip", "ship to zip", "recipient zip", "dest zip", "destination zip"] },
  { key: "destZip", label: "Destination ZIP (optional)", hint: "Return centre / DC, for zone estimates", aliases: ["destination zip", "dest zip", "return to zip", "warehouse zip", "dc zip", "to zip", "ship to postal"] },
  { key: "state", label: "State (optional)", hint: "Used when ZIP is missing", aliases: ["state", "origin state", "ship from state", "customer state", "province", "region"] },
  { key: "weight", label: "Weight", hint: "Actual or billed weight", aliases: ["billed weight", "weight", "rated weight", "actual weight", "weight lb", "weight (lb)", "weight lbs", "wt", "package weight", "weight oz"] },
  { key: "weightUnit", label: "Weight unit (optional)", hint: "Column with lb / oz / kg", aliases: ["weight unit", "unit", "uom", "weight uom"] },
  { key: "cost", label: "Current cost per parcel", hint: "What the client pays today", aliases: ["total cost", "cost", "total charge", "net charge", "shipping cost", "label cost", "rate", "amount", "price", "postage", "charge", "total"] },
  { key: "carrier", label: "Carrier / service (optional)", hint: "Current provider", aliases: ["carrier", "service", "carrier service", "shipping method", "method", "provider", "ship method"] },
  { key: "date", label: "Date (optional)", hint: "Ship / return date, to annualise volume", aliases: ["date", "ship date", "shipped date", "created", "created at", "return date", "label date", "order date"] },
];

const norm = (s) => String(s || "").toLowerCase().replace(/[_\-\.\/()]+/g, " ").replace(/\s+/g, " ").trim();

export function autoMap(headers) {
  const H = headers.map(norm);
  const used = new Set();
  const map = {};
  for (const f of FIELDS) {
    let hit = -1;
    for (const a of f.aliases) {
      const i = H.findIndex((h, j) => !used.has(j) && h === a);
      if (i >= 0) { hit = i; break; }
    }
    if (hit < 0) for (const a of f.aliases) {
      const i = H.findIndex((h, j) => !used.has(j) && a.length > 3 && h.includes(a));
      if (i >= 0) { hit = i; break; }
    }
    if (hit >= 0) { map[f.key] = hit; if (f.key !== "weightUnit") used.add(hit); }
  }
  return map;
}
