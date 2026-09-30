import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Builds the whole tool into ONE self-contained HTML file (dist/index.html), the same way the
// SpeedX PreSales Engine ships: no server, no install, just open it in a browser.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 10_000,
    cssCodeSplit: false,
  },
});
