// DropX brand tokens — taken from the DropX website wireframes.
import logoSvgRaw from "./logo.svg?raw";
import xmarkSvgRaw from "./xmark.svg?raw";
import skyline from "./skyline.jpg";
import warehouse from "./warehouse.jpg";
import merchant from "./merchant.jpg";
import consumer from "./consumer.png";
import scanner from "./scanner.png";
import hardhat from "./hardhat.png";
import boxes from "./boxes.png";

export const C = {
  deep: "#073136",   // primary dark teal (logo, dark bands, headings)
  teal: "#087780",   // the "X" teal (primary buttons, accents)
  mint: "#5DC6B5",   // light accent on dark backgrounds
  orange: "#F07C21", // eyebrows, CTAs
  blue: "#1AA3FF",   // icon tiles, secondary CTA
  bone: "#F4F1EA",
  gray: "#F4F4F4",
  line: "#DCD8CF",
  ink: "#2C3E40",
  muted: "#6D7B7C",
  white: "#FFFFFF",
};

// Categorical order for charts (deep → teal → blue → orange → mint → muted).
export const SERIES = [C.teal, C.blue, C.orange, C.deep, C.mint, "#9AA5A6"];

export const FONT_DISPLAY = "'Outfit', 'Segoe UI', system-ui, sans-serif";
export const FONT_BODY = "'Inter', 'Segoe UI', system-ui, sans-serif";

export const svgToDataUrl = (svg) => "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));

// Logo variants: default (deep + teal arrow), white (for dark backgrounds, mint arrow).
export const LOGO_SVG = logoSvgRaw;
export const LOGO_WHITE_SVG = logoSvgRaw.replaceAll("#073136", "#FFFFFF").replaceAll("#097880", C.mint);
export const XMARK_SVG = xmarkSvgRaw;
export const XMARK_WHITE_SVG = xmarkSvgRaw.replaceAll("#073136", "#FFFFFF").replaceAll("#097880", C.mint);

export const LOGO = svgToDataUrl(LOGO_SVG);
export const LOGO_WHITE = svgToDataUrl(LOGO_WHITE_SVG);
export const XMARK = svgToDataUrl(XMARK_SVG);
export const XMARK_WHITE = svgToDataUrl(XMARK_WHITE_SVG);
export const LOGO_ASPECT = 559 / 61;

export const PHOTOS = { skyline, warehouse, merchant, consumer, scanner, hardhat, boxes };
export const PHOTO_OPTIONS = [
  ["skyline", "City skyline"],
  ["warehouse", "Warehouse team"],
  ["merchant", "Merchant / SMB"],
  ["consumer", "Consumer with parcel (cut-out)"],
  ["scanner", "Associate with scanner (cut-out)"],
  ["hardhat", "Operations lead (cut-out)"],
  ["boxes", "Parcels (cut-out)"],
];

// Natural pixel sizes (needed for cover-cropping photos in PPTX).
export const PHOTO_SIZE = {
  skyline: [1600, 870], warehouse: [1400, 933], merchant: [1400, 794],
  consumer: [537, 560], scanner: [448, 560], hardhat: [477, 560], boxes: [575, 361],
};
export const CUTOUTS = new Set(["consumer", "scanner", "hardhat", "boxes"]);
