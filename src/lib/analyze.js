// Turns mapped upload rows into a client profile + DropX savings model.
import { normZip, zip3Of, zipToState, normState, zoneBetween } from "./geo.js";
import { bandIndex, rateForWeight, bandLabel } from "./pricing.js";

const toNum = (v) => {
  if (v == null || v === "") return null;
  if (typeof v === "number") return v;
  const n = parseFloat(String(v).replace(/[$,£€\s]/g, ""));
  return isFinite(n) ? n : null;
};
const toDate = (v) => {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v) || v.getFullYear() < 2000 ? null : v;
  if (typeof v === "number" && v > 20000 && v < 80000) return new Date(Math.round((v - 25569) * 864e5)); // Excel serial
  const d = new Date(v);
  return isNaN(d) || d.getFullYear() < 2000 || d.getFullYear() > 2100 ? null : d;
};

// Normalise raw rows with a column map → [{zip, destZip, state, lb, cost, carrier, date}]
export function normalizeRows(table, map, opts = {}) {
  const get = (r, k) => (map[k] != null && map[k] >= 0 ? r[map[k]] : null);
  const unitDefault = opts.weightUnit || "lb";
  const out = [];
  for (const r of table.rows) {
    const zip = normZip(get(r, "zip"));
    let w = toNum(get(r, "weight"));
    let unit = String(get(r, "weightUnit") || unitDefault).toLowerCase();
    if (w != null) {
      if (unit.startsWith("oz") || unit.includes("ounce")) w = w / 16;
      else if (unit.startsWith("kg") || unit.includes("kilo")) w = w * 2.20462;
      else if (unit === "g" || unit.startsWith("gram")) w = w / 453.592;
    }
    const state = normState(get(r, "state")) || (zip ? zipToState(zip) : null);
    const row = {
      zip, zip3: zip ? zip3Of(zip) : null, state,
      destZip: normZip(get(r, "destZip")),
      lb: w != null && w > 0 ? w : null,
      cost: toNum(get(r, "cost")),
      carrier: String(get(r, "carrier") || "").trim() || null,
      date: toDate(get(r, "date"))?.getTime() ?? null,
    };
    if (row.zip || row.state || row.lb != null || row.cost != null) out.push(row);
  }
  return out;
}

const topN = (obj, n) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n);

// Full analysis of normalised rows against the current pricing.
export function analyze(rows, pricing, opts = {}) {
  const n = rows.length;
  if (!n) return null;
  const bands = pricing.bands;
  const bandCounts = bands.map(() => 0), bandCost = bands.map(() => 0), bandCostN = bands.map(() => 0), bandDx = bands.map(() => 0);
  let overweight = 0;
  const states = {}, zip3s = {}, carriers = {}, months = {}, zones = {};
  let wSum = 0, wN = 0, cSum = 0, cN = 0, dxSum = 0, dxN = 0, pairCur = 0, pairDx = 0, pairN = 0;
  let minD = null, maxD = null;
  for (const r of rows) {
    if (r.state) states[r.state] = (states[r.state] || 0) + 1;
    if (r.zip3) zip3s[r.zip3] = (zip3s[r.zip3] || 0) + 1;
    if (r.carrier) carriers[r.carrier] = (carriers[r.carrier] || 0) + 1;
    if (r.date != null) {
      const dt = new Date(r.date);
      const k = dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0");
      months[k] = (months[k] || 0) + 1;
      if (!minD || dt < minD) minD = dt;
      if (!maxD || dt > maxD) maxD = dt;
    }
    if (r.lb != null) { wSum += r.lb; wN++; }
    if (r.cost != null) { cSum += r.cost; cN++; }
    const lb = r.lb ?? opts.defaultLb ?? 1;
    const bi = bandIndex(bands, lb);
    let zone = null;
    const dest = r.destZip || pricing.destZip;
    if (pricing.structure === "zoned" && r.zip && dest) zone = zoneBetween(r.zip, dest);
    if (zone) zones[zone] = (zones[zone] || 0) + 1;
    if (bi < 0) { overweight++; continue; }
    bandCounts[bi]++;
    const dx = rateForWeight(pricing, lb, zone ?? pricing.avgZone);
    if (dx != null) { dxSum += dx; dxN++; bandDx[bi] += dx; }
    if (r.cost != null) {
      bandCost[bi] += r.cost; bandCostN[bi]++;
      if (dx != null) { pairCur += r.cost; pairDx += dx; pairN++; }
    }
  }
  // Annualise: from the date range if we have one, else from the stated data period (months).
  let days = minD && maxD ? Math.max(1, (maxD - minD) / 864e5 + 1) : null;
  if (days && days < 7) days = null;
  const periodMonths = opts.periodMonths || 12;
  const annualFactor = days ? 365 / days : 12 / periodMonths;
  const annualVolume = n * annualFactor;
  const avgCur = pairN ? pairCur / pairN : null;
  const avgDx = pairN ? pairDx / pairN : dxN ? dxSum / dxN : null;
  const savingsPerParcel = avgCur != null && avgDx != null ? avgCur - avgDx : null;
  return {
    n, annualVolume, annualFactor, days, periodMonths,
    dateFrom: minD, dateTo: maxD,
    avgLb: wN ? wSum / wN : null,
    avgCost: cN ? cSum / cN : null,
    costCoverage: cN / n,
    overweight,
    bands: bands.map((b, i) => ({
      label: bandLabel(bands, i), count: bandCounts[i], share: bandCounts[i] / n,
      avgCur: bandCostN[i] ? bandCost[i] / bandCostN[i] : null,
      avgDx: bandCounts[i] ? bandDx[i] / bandCounts[i] : null,
    })),
    states: topN(states, 60), stateCount: Object.keys(states).length,
    zip3s, zip3Count: Object.keys(zip3s).length,
    carriers: topN(carriers, 8), carrierTotal: Object.values(carriers).reduce((a, b) => a + b, 0),
    months: Object.entries(months).sort((a, b) => (a[0] < b[0] ? -1 : 1)),
    zones,
    savings: savingsPerParcel == null ? null : {
      avgCur, avgDx, perParcel: savingsPerParcel, pct: avgCur ? savingsPerParcel / avgCur : null,
      annualCur: avgCur * annualVolume, annualDx: avgDx * annualVolume, annual: savingsPerParcel * annualVolume,
      basis: pairN,
    },
  };
}

// No-data estimate: volume + current avg cost + weight mix (% per band).
export function quickEstimate(q, pricing) {
  const mix = q.mix || [];
  const tot = mix.reduce((a, b) => a + (+b || 0), 0) || 1;
  let dx = 0;
  const bands = pricing.bands.map((b, i) => {
    const share = (+mix[i] || 0) / tot;
    const rate = rateForWeight(pricing, b, pricing.avgZone);
    dx += share * (rate || 0);
    return { label: bandLabel(pricing.bands, i), share, count: share * (q.annualVolume || 0), avgDx: rate, avgCur: null };
  });
  const cur = +q.avgCost || null;
  const vol = +q.annualVolume || 0;
  return {
    n: null, annualVolume: vol, avgLb: null, avgCost: cur, bands, estimate: true,
    states: [], zip3s: {}, carriers: q.currentProvider ? [[q.currentProvider, 1]] : [], carrierTotal: q.currentProvider ? 1 : 0, months: [],
    savings: cur ? { avgCur: cur, avgDx: dx, perParcel: cur - dx, pct: (cur - dx) / cur, annualCur: cur * vol, annualDx: dx * vol, annual: (cur - dx) * vol, basis: null } : null,
  };
}

// Share of parcels whose ZIP3 has at least one DropX location (from an uploaded locations list).
export function coverageShare(rows, locationZip3s) {
  if (!rows?.length || !locationZip3s?.size) return null;
  let hit = 0, known = 0;
  for (const r of rows) { if (!r.zip3) continue; known++; if (locationZip3s.has(r.zip3)) hit++; }
  return known ? { share: hit / known, known } : null;
}
