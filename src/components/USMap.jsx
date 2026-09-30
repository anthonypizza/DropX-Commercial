// US network map: states, hub markets, client parcel density (by ZIP3) and optional DropX locations.
import React, { useMemo, forwardRef } from "react";
import { geoAlbersUsa, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import us from "us-atlas/states-10m.json";
import { C } from "../brand/brand.js";
import { zip3LatLng } from "../lib/geo.js";

const W = 960, H = 600;
const projection = geoAlbersUsa().scale(1250).translate([W / 2, H / 2]);
const path = geoPath(projection);
const STATES = feature(us, us.objects.states).features;
const NATION = mesh(us, us.objects.states, (a, b) => a === b);
const BORDERS = mesh(us, us.objects.states, (a, b) => a !== b);
const statePaths = STATES.map((f) => path(f));
const nationPath = path(NATION);
const borderPath = path(BORDERS);

export const USMap = forwardRef(function USMap({ zip3s, hubs = [], locations = [], showHubs = true, showDemand = true, width = "100%", height }, ref) {
  const demand = useMemo(() => {
    if (!zip3s) return [];
    const ents = Object.entries(zip3s);
    const max = Math.max(1, ...ents.map((e) => e[1]));
    return ents
      .map(([z, c]) => { const ll = zip3LatLng(z); const xy = ll && projection([ll.lng, ll.lat]); return xy ? { xy, c, r: 2 + 16 * Math.sqrt(c / max) } : null; })
      .filter(Boolean)
      .sort((a, b) => b.c - a.c);
  }, [zip3s]);
  const locs = useMemo(() => locations.map((l) => projection([l.lng, l.lat])).filter(Boolean), [locations]);
  const hubPts = hubs.map((h) => ({ ...h, xy: projection([h.lng, h.lat]) })).filter((h) => h.xy);
  const LABEL_OFF = { "NY/NJ": [10, 4], BOS: [10, -4], PHL: [10, 14], CT: [-26, -10], LAX: [-38, 14], SFO: [-38, -2], IAH: [10, 14] };
  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={width} height={height} xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }} role="img" aria-label="United States network map">
      <g>{statePaths.map((d, i) => <path key={i} d={d} fill={C.bone} />)}</g>
      <path d={borderPath} fill="none" stroke={C.line} strokeWidth="0.8" />
      <path d={nationPath} fill="none" stroke={C.deep} strokeWidth="1.2" strokeLinejoin="round" />
      {locs.length > 0 && <g>{locs.map((xy, i) => <circle key={i} cx={xy[0]} cy={xy[1]} r="1.6" fill={C.teal} opacity="0.55" />)}</g>}
      {showDemand && <g>{demand.map((d, i) => <circle key={i} cx={d.xy[0]} cy={d.xy[1]} r={d.r} fill={C.orange} fillOpacity="0.38" stroke="#fff" strokeWidth="1" />)}</g>}
      {showHubs && <g>
        {hubPts.map((h) => <circle key={h.code + "h"} cx={h.xy[0]} cy={h.xy[1]} r={8 + (h.weight || 1) * 2} fill={C.mint} fillOpacity="0.28" />)}
        {hubPts.map((h) => <circle key={h.code} cx={h.xy[0]} cy={h.xy[1]} r="5.5" fill={C.deep} stroke="#fff" strokeWidth="1.8" />)}
        {hubPts.map((h) => { const o = LABEL_OFF[h.code] || [10, 4]; return (
          <text key={h.code + "t"} x={h.xy[0] + o[0]} y={h.xy[1] + o[1]} fontFamily="Outfit, Arial, sans-serif" fontSize="13" fontWeight="700" fill={C.deep} stroke="#fff" strokeWidth="3.5" paintOrder="stroke" strokeLinejoin="round">{h.code}</text>
        ); })}
      </g>}
    </svg>
  );
});

// Rasterise an SVG element to a PNG data URL (for PPTX export).
export async function svgToPng(svgEl, scale = 2) {
  const clone = svgEl.cloneNode(true);
  clone.setAttribute("width", W); clone.setAttribute("height", H);
  const src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(clone));
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = src; });
  const cv = document.createElement("canvas");
  cv.width = W * scale; cv.height = H * scale;
  const ctx = cv.getContext("2d");
  ctx.drawImage(img, 0, 0, cv.width, cv.height);
  return cv.toDataURL("image/png");
}
export const MAP_ASPECT = W / H;
