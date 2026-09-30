// Styled, client-ready rate card workbook (ExcelJS): DropX logo, deep-teal headers, banded rows.
import ExcelJS from "exceljs";
import { C, LOGO_SVG } from "../brand/brand.js";
import { ZONES, rateGrid, bandLabel } from "./pricing.js";
import { fmtDate, slug } from "./format.js";

const argb = (c) => "FF" + c.replace("#", "").toUpperCase();
const fillOf = (c) => ({ type: "pattern", pattern: "solid", fgColor: { argb: argb(c) } });

async function logoPng() {
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(LOGO_SVG); });
  const cv = document.createElement("canvas"); cv.width = 1118; cv.height = 122;
  cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
  return cv.toDataURL("image/png");
}

export async function exportRateCardXlsx({ deal, pricing, productLabel }) {
  const wb = new ExcelJS.Workbook();
  wb.creator = deal.repName || "DropX";
  const ws = wb.addWorksheet("Rate Card", { views: [{ showGridLines: false }], pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1 } });
  const zoned = pricing.structure === "zoned";
  const cols = zoned ? ZONES.map((z) => "Zone " + z) : ["Rate per parcel"];
  ws.columns = [{ width: 3 }, { width: 26 }, ...cols.map(() => ({ width: zoned ? 12 : 22 })), { width: 3 }];
  const lastCol = 2 + cols.length;

  const id = wb.addImage({ base64: await logoPng(), extension: "png" });
  ws.addImage(id, { tl: { col: 1, row: 1 }, ext: { width: 260, height: 28 } });
  ws.getRow(2).height = 26;

  let r = 4;
  const put = (row, col, v, st = {}) => { const c = ws.getCell(row, col); c.value = v; Object.assign(c, st); return c; };
  put(r, 2, `${productLabel} rate card`, { font: { name: "Arial", size: 18, bold: true, color: { argb: argb(C.deep) } } }); r++;
  put(r, 2, deal.client ? `Prepared for ${deal.client}` : "", { font: { name: "Arial", size: 11, color: { argb: argb(C.ink) } } }); r++;
  put(r, 2, [fmtDate(deal.date), deal.repName && `Prepared by ${deal.repName}`].filter(Boolean).join("  ·  "), { font: { name: "Arial", size: 10, color: { argb: argb(C.muted) } } }); r++;
  if (!pricing.approved) { put(r, 2, "ILLUSTRATIVE PRICING — subject to final approval", { font: { name: "Arial", size: 10, bold: true, color: { argb: argb(C.orange) } } }); r++; }
  r++;

  // Rate table
  const hdr = ws.getRow(r);
  ["Weight", ...cols].forEach((h, i) => {
    const c = hdr.getCell(2 + i); c.value = h;
    c.font = { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFFFF" } }; c.fill = fillOf(C.deep);
    c.alignment = { horizontal: i ? "center" : "left", vertical: "middle" };
  });
  hdr.height = 22; r++;
  rateGrid(pricing).forEach((row, i) => {
    const R = ws.getRow(r);
    const c0 = R.getCell(2); c0.value = bandLabel(pricing.bands, i); c0.font = { name: "Arial", size: 11, bold: true, color: { argb: argb(C.deep) } };
    row.forEach((v, j) => { const c = R.getCell(3 + j); c.value = v == null ? null : Math.round(v * 100) / 100; c.numFmt = '"$"#,##0.00'; c.font = { name: "Arial", size: 11, color: { argb: argb(C.deep) } }; c.alignment = { horizontal: "center" }; });
    for (let k = 2; k <= lastCol; k++) {
      const c = R.getCell(k);
      if (i % 2) c.fill = fillOf(C.gray);
      c.border = { bottom: { style: "thin", color: { argb: argb(C.line) } } };
    }
    R.height = 20; r++;
  });
  r++;
  const section = (t) => { put(r, 2, t, { font: { name: "Arial", size: 12, bold: true, color: { argb: argb(C.teal) } } }); r++; };
  section("Accessorials");
  pricing.accessorials.filter((a) => a.name).forEach((a) => {
    put(r, 2, a.name, { font: { name: "Arial", size: 10, color: { argb: argb(C.ink) } } });
    put(r, lastCol, a.amount, { numFmt: '"$"#,##0.00', font: { name: "Arial", size: 10, bold: true, color: { argb: argb(C.deep) } }, alignment: { horizontal: "center" } });
    if (a.unit && lastCol > 3) put(r, lastCol - 1, a.unit, { font: { name: "Arial", size: 9, color: { argb: argb(C.muted) } }, alignment: { horizontal: "right" } });
    r++;
  });
  r++;
  section("Terms");
  const terms = [
    pricing.fuelPct > 0 && `Fuel surcharge: ${pricing.fuelPct}% ${pricing.fuelMode === "included" ? "(included in rates above)" : "(applied to rates above)"}`,
    pricing.discountPct ? `Rates shown include a ${pricing.discountPct}% discount.` : null,
    pricing.terms.minimum && `Minimum: ${pricing.terms.minimum}`,
    pricing.terms.billing && `Billing: ${pricing.terms.billing}`,
    pricing.terms.validity && `Validity: ${pricing.terms.validity}`,
    ...String(pricing.terms.notes || "").split("\n"),
  ].filter(Boolean);
  terms.forEach((t) => { ws.mergeCells(r, 2, r, lastCol); put(r, 2, t, { font: { name: "Arial", size: 10, color: { argb: argb(C.ink) } }, alignment: { wrapText: true, vertical: "top" } }); ws.getRow(r).height = t.length > 110 ? 28 : 16; r++; });

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  downloadBlob(blob, `DropX_RateCard_${slug(deal.client)}.xlsx`);
}

export function downloadBlob(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
