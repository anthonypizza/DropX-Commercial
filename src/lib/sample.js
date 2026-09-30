// Synthetic demo dataset so the tool can be explored without a client file. Clearly labelled as sample data.
import ZIP3 from "../data/zip3.json";

const METROS = [["100", 9], ["112", 8], ["070", 5], ["021", 4], ["191", 4], ["606", 6], ["900", 8], ["913", 4], ["941", 4], ["750", 5], ["770", 5], ["331", 5], ["303", 4], ["981", 3], ["852", 3], ["802", 2], ["481", 2], ["554", 2], ["282", 2], ["372", 2]];
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export function sampleTable(n = 4000) {
  const r = rng(7);
  const allZ3 = Object.keys(ZIP3.state).filter((z) => ZIP3.coords[z] && !["006", "007", "008", "009", "967", "968", "995", "996", "997", "998", "999"].includes(z));
  const tot = METROS.reduce((a, m) => a + m[1], 0);
  const pickZ3 = () => {
    if (r() < 0.35) return allZ3[Math.floor(r() * allZ3.length)];
    let x = r() * tot; for (const [z, w] of METROS) { x -= w; if (x <= 0) return z; } return METROS[0][0];
  };
  const carriers = [["UPS Returns", 0.38], ["USPS Returns", 0.34], ["FedEx Returns", 0.18], ["Happy Returns", 0.1]];
  const pickC = () => { let x = r(); for (const [c, w] of carriers) { x -= w; if (x <= 0) return c; } return carriers[0][0]; };
  const start = new Date(2026, 5, 1).getTime();
  const rows = [];
  for (let i = 0; i < n; i++) {
    const z3 = pickZ3();
    const zip = z3 + String(Math.floor(r() * 100)).padStart(2, "0");
    const u = r();
    const lb = u < 0.45 ? 0.2 + r() * 0.8 : u < 0.72 ? 1 + r() : u < 0.86 ? 2 + r() * 1 : u < 0.94 ? 3 + r() * 2 : u < 0.985 ? 5 + r() * 5 : 10 + r() * 15;
    const c = pickC();
    const base = { "UPS Returns": 8.9, "USPS Returns": 7.1, "FedEx Returns": 8.6, "Happy Returns": 7.9 }[c];
    const cost = base + Math.log2(1 + lb) * 1.9 + (r() - 0.5) * 1.2;
    rows.push([`RMA-${100000 + i}`, zip, "17036", Math.round(lb * 100) / 100, "lb", Math.round(cost * 100) / 100, c, new Date(start + Math.floor(r() * 91) * 864e5)]);
  }
  return {
    fileName: "Sample returns data (demo).csv", sheet: "Sample", sample: true,
    headers: ["Return ID", "Ship From Zip", "Return To Zip", "Billed Weight", "Weight Unit", "Total Cost", "Carrier", "Ship Date"],
    rows,
  };
}
