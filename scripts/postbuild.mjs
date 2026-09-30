// Copies the single-file build to the repo root as the distributable tool.
import { copyFileSync, statSync } from "node:fs";
const out = "DropX_PreSales_Engine.html";
copyFileSync("dist/index.html", out);
console.log(`\n✔ ${out} (${(statSync(out).size / 1e6).toFixed(2)} MB)`);
