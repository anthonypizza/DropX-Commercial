import ZIP3 from "../data/zip3.json";

export const STATE_NAMES = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut",
  DE: "Delaware", DC: "D.C.", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana",
  IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts",
  MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota",
  OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", PR: "Puerto Rico",
};
const NAME_TO_ABBR = Object.fromEntries(Object.entries(STATE_NAMES).map(([k, v]) => [v.toUpperCase(), k]));

export const normZip = (z) => {
  if (z == null) return null;
  const d = String(z).trim().split("-")[0].replace(/\D/g, "");
  if (d.length < 3 || d.length > 5) return d.length === 9 ? d.slice(0, 5) : null;
  return d.padStart(5, "0");
};
export const zip3Of = (z) => { const n = normZip(z); return n ? n.slice(0, 3) : null; };
export const zipToState = (z) => { const p = zip3Of(z); return p ? ZIP3.state[p] || null : null; };
export const zipToLatLng = (z) => { const p = zip3Of(z); const c = p && ZIP3.coords[p]; return c ? { lat: c[0], lng: c[1] } : null; };
export const zip3LatLng = (p) => { const c = ZIP3.coords[p]; return c ? { lat: c[0], lng: c[1] } : null; };
export const normState = (s) => {
  if (!s) return null;
  const v = String(s).trim().toUpperCase();
  if (v.length === 2 && STATE_NAMES[v]) return v;
  return NAME_TO_ABBR[v] || null;
};

export function haversineMi(a, b) {
  const R = 3958.8, r = (x) => (x * Math.PI) / 180;
  const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Distance-band zone (1–8), same bands as USPS. Approximate — good for analysis, not billing.
export function zoneFromMiles(mi) {
  if (mi <= 50) return 1; if (mi <= 150) return 2; if (mi <= 300) return 3; if (mi <= 600) return 4;
  if (mi <= 1000) return 5; if (mi <= 1400) return 6; if (mi <= 1800) return 7; return 8;
}
export function zoneBetween(zipA, zipB) {
  const a = zipToLatLng(zipA), b = zipToLatLng(zipB);
  if (!a || !b) return null;
  return zoneFromMiles(haversineMi(a, b));
}
