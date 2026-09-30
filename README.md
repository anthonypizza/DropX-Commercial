# DropX PreSales Engine

A single-file browser tool for building DropX client presentations and rate cards. It's the DropX version of the SpeedX PreSales Engine, in DropX branding (colours, logo and photography from the website wireframes).

**To use it:** open `DropX_PreSales_Engine.html` in Chrome or Edge. There's nothing to install and no server. Client files stay in your browser. Your work autosaves in the browser, and you can save or load a deal file (`.json`) from the top bar.

## Workflow

| Step | What it does |
|---|---|
| **01 Deal** | Client, contact, product (**Returns** or **Merchant drop-offs**), your details, and DropX network facts (locations, ZIPs, growth). |
| **02 Data** | Upload a client parcel file (CSV/XLSX) and map its columns: ZIP, weight, cost, carrier, date. You get annual volume, weight mix, carrier mix, origin states and a US map. There's also a quick estimate (volume + average cost + weight mix) for when you have no file, a sample dataset for demos, and an optional DropX locations upload for coverage. |
| **03 Pricing** | Rate-card generator: flat-by-weight or weight × zone (zones estimated from ZIP distance), editable weight bands, discount, fuel surcharge, accessorials and terms. It gives a live savings model against the client's current cost, and exports a branded `.xlsx` rate card. |
| **04 Presentation** | 13 slide templates plus custom slides. Toggle, reorder, duplicate and edit any text. Copy fills itself from the deal, data and pricing until you override it. Present full screen from here. |
| **05 Export** | Editable PowerPoint (`.pptx`, native charts and tables), PDF (print dialog, one slide per page), rate card (`.xlsx`) and deal file (`.json`). |

### Slide library
Cover · About DropX · The problem · The solution · Parcel journey · Network & coverage map · Growth forecast · Your parcel profile* · Savings analysis* · Rate card · Integration paths · Why now · Next steps & contact · Custom

\* These need client data or a quick estimate, and are skipped until you add one.

## Things to know
- **Starting rates are illustrative placeholders**, not approved DropX pricing. Slides and the Excel file say "Illustrative pricing" until you tick *Rates approved* in step 03.
- Default copy and network facts (7,158 locations, 60K+ by end of 2027, the 11 hub markets, the growth timeline) come from the DropX section of the SpeedX overview deck. Keep them current in step 01.
- Zones use straight-line ZIP3 distance bands (like USPS zones). That's fine for proposals, but it isn't a billing-grade zone chart.
- The coverage figure is the share of client parcels that start in a 3-digit ZIP area with at least one uploaded DropX location.

## Development

```bash
npm install
npm run dev     # local dev server
npm run build   # builds dist/index.html and copies it to DropX_PreSales_Engine.html
```

Stack: React 18 + Vite, bundled into one HTML file with `vite-plugin-singlefile`. It uses pptxgenjs (PowerPoint), ExcelJS (styled rate card), SheetJS (reading uploads), d3-geo, topojson and us-atlas (maps).

| Path | Contents |
|---|---|
| `src/data/content.js` | Default copy, network facts, growth timeline, hubs |
| `src/slides/defs.js` | Slide types, editable fields and data-driven defaults |
| `src/slides/Slides.jsx` | HTML slide layouts (1280×720), used by preview, present and PDF |
| `src/lib/exportPptx.js` | PowerPoint builders that mirror the HTML layouts |
| `src/lib/pricing.js` | Rate-card model |
| `src/lib/analyze.js` | Upload normalisation, profile and savings |
| `src/brand/` | Logo (vector, extracted from the wireframes), photos, colour tokens |
