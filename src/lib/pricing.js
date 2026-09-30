// DropX rate-card model. Rates are per parcel, by weight band (and optionally by zone).
// The defaults are ILLUSTRATIVE placeholders — the tool flags them until "Rates approved" is ticked.

export const ZONES = ["1–2", "3", "4", "5", "6", "7", "8"];
export const zoneCol = (z) => (z == null ? null : Math.max(0, Math.min(ZONES.length - 1, z <= 2 ? 0 : z - 2)));

const DEFAULT_BANDS = [1, 2, 3, 5, 10, 20, 30, 50];
const DEFAULT_FLAT = {
  returns: [4.25, 4.75, 5.25, 5.95, 7.45, 9.95, 12.95, 17.95],
  merchant: [4.45, 4.95, 5.45, 6.25, 7.95, 10.75, 13.95, 19.45],
};
const ZONE_FACTORS = [0.9, 0.95, 1.0, 1.05, 1.12, 1.18, 1.25];
const r2 = (n) => Math.round(n * 100) / 100;

export function bandLabel(bands, i) {
  const lo = i === 0 ? 0 : bands[i - 1];
  const hi = bands[i];
  return i === 0 ? `Up to ${hi} lb` : `${lo}.01 – ${hi} lb`;
}

export function defaultPricing(product = "returns") {
  const flat = DEFAULT_FLAT[product] || DEFAULT_FLAT.returns;
  return {
    structure: "flat", // "flat" | "zoned"
    bands: [...DEFAULT_BANDS],
    flat: [...flat],
    zoned: flat.map((b) => ZONE_FACTORS.map((f) => r2(b * f))),
    discountPct: 0,
    fuelPct: 0,
    fuelMode: "separate", // "separate" (shown as surcharge) | "included"
    destZip: "",
    avgZone: 5,
    accessorials: [
      { name: "Label-less / QR drop-off (label printed in store)", amount: 0.25, unit: "per parcel" },
      { name: "Oversize (any side > 30 in or > 50 lb)", amount: 8.5, unit: "per parcel" },
      { name: "Address correction", amount: 2.0, unit: "per parcel" },
      { name: "Extended area (non-covered ZIP)", amount: 1.5, unit: "per parcel" },
    ],
    terms: {
      validity: "90 days from proposal date",
      minimum: "",
      billing: "Weekly invoicing, net 15",
      notes: "Rates are per parcel. Weight rounds up to the next whole pound. Dimensional weight applies above 1,728 cubic inches (divisor 166).",
    },
    approved: false,
  };
}

// Reshape grids when bands change.
export function setBands(p, bands) {
  const flat = bands.map((_, i) => p.flat[i] ?? p.flat[p.flat.length - 1] ?? 0);
  const zoned = bands.map((_, i) => p.zoned[i] ?? p.zoned[p.zoned.length - 1] ?? ZONES.map(() => 0));
  return { ...p, bands, flat, zoned };
}

export const bandIndex = (bands, lb) => {
  if (!(lb > 0)) return 0;
  const w = Math.ceil(lb - 1e-9);
  const i = bands.findIndex((b) => w <= b);
  return i < 0 ? -1 : i;
};

// Net rate for a band (and zone), after discount; fuel added when mode = "included".
export function netRate(p, bi, zone) {
  if (bi < 0) return null;
  const base = p.structure === "zoned" ? p.zoned[bi]?.[zoneCol(zone ?? p.avgZone)] : p.flat[bi];
  if (base == null || !isFinite(base)) return null;
  let r = base * (1 - (p.discountPct || 0) / 100);
  return r;
}
// All-in rate the client pays (net + fuel surcharge).
export function allInRate(p, bi, zone) {
  const n = netRate(p, bi, zone);
  if (n == null) return null;
  return n * (1 + (p.fuelPct || 0) / 100);
}
export const rateForWeight = (p, lb, zone) => allInRate(p, bandIndex(p.bands, lb), zone);

// Grid of displayed (net) rates for the rate card: rows = bands, cols = zones or single.
export function rateGrid(p) {
  return p.bands.map((_, bi) =>
    p.structure === "zoned" ? ZONES.map((_, zi) => {
      const base = p.zoned[bi]?.[zi];
      return base == null ? null : (p.fuelMode === "included" ? 1 + (p.fuelPct || 0) / 100 : 1) * base * (1 - (p.discountPct || 0) / 100);
    }) : [(p.fuelMode === "included" ? 1 + (p.fuelPct || 0) / 100 : 1) * p.flat[bi] * (1 - (p.discountPct || 0) / 100)]
  );
}
