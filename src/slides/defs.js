// Slide library. Each slide type declares:
//   label, group, needs (optional data requirement), fields (editor schema), defaults(ctx) → field values.
// A deck slide stores only the fields the user overrode, so data-driven copy stays live until edited.
import { PRODUCTS, GROWTH, WHY_NOW, NEXT_STEPS } from "../data/content.js";
import { fmtInt, fmtMoney, fmtMoneyShort, fmtPct, fmtNum, fmtDate, fill, uid } from "../lib/format.js";

const T = (key, label, extra = {}) => ({ key, label, kind: "text", ...extra });
const A = (key, label, extra = {}) => ({ key, label, kind: "textarea", ...extra });
const L = (key, label, cols, extra = {}) => ({ key, label, kind: "list", cols, ...extra });
const P = (key, label) => ({ key, label, kind: "photo" });

export const SLIDE_TYPES = {
  cover: {
    label: "Cover", group: "Story",
    fields: [T("eyebrow", "Eyebrow"), A("title", "Title"), A("subtitle", "Subtitle"), T("preparedFor", "Prepared for"), T("preparedBy", "Prepared by"), T("date", "Date"), P("photo", "Background photo")],
    defaults: ({ deal, P: prod }) => ({
      eyebrow: prod.label === "Returns" ? "Returns proposal" : "Merchant drop-off proposal",
      title: deal.client ? `${prod.tagline.replace(/\.$/, "")} for ${deal.client}.` : prod.tagline,
      subtitle: "Changing the game for out-of-home parcels in America.",
      preparedFor: [deal.contactName, deal.client].filter(Boolean).join(", "),
      preparedBy: [deal.repName, deal.repTitle].filter(Boolean).join(", "),
      date: fmtDate(deal.date),
      photo: "skyline",
    }),
  },
  about: {
    label: "About DropX", group: "Story",
    fields: [T("eyebrow", "Eyebrow"), A("title", "Title"), A("body", "Body"), L("stats", "Stats", ["Value", "Label"]), P("photo", "Photo")],
    defaults: ({ P: prod, facts }) => ({
      eyebrow: "The new route",
      title: "Your parcels reimagined.",
      body: prod.lede + "\n\nCovering PUDO, last-mile delivery and cross-border.",
      stats: [
        [fmtInt(facts.liveLocations), `Live drop-off locations (${facts.asOf})`],
        [facts.zipCodes, "ZIP codes covered"],
        [facts.parcelsPerDay, "Parcels processed per day"],
        [facts.plannedLocations, `Locations planned by ${facts.plannedBy}`],
      ],
      photo: "hardhat",
    }),
  },
  problem: {
    label: "The problem", group: "Story",
    fields: [T("eyebrow", "Eyebrow"), A("title", "Title"), A("lede", "Lede"), L("cards", "Cards", ["Heading", "Body"], { max: 4 }), A("callout", "Callout")],
    defaults: ({ P: prod, facts }) => ({
      eyebrow: "The problem", title: prod.problemTitle, lede: prod.problemLede,
      cards: prod.problems, callout: fill(prod.problemCallout, facts),
    }),
  },
  solution: {
    label: "The solution", group: "Story",
    fields: [T("eyebrow", "Eyebrow"), A("title", "Title"), A("lede", "Lede"), L("pillars", "Pillars", ["Tag", "Heading", "Body"], { max: 3 })],
    defaults: ({ P: prod, facts }) => ({
      eyebrow: "The solution", title: prod.solutionTitle, lede: prod.solutionLede,
      pillars: prod.pillars.map((p) => p.map((s) => s.replace("12,000+", facts.zipCodes))),
    }),
  },
  journey: {
    label: "Parcel journey", group: "How it works",
    fields: [T("eyebrow", "Eyebrow"), A("title", "Title"), A("lede", "Lede"), L("steps", "Steps", ["Step", "Detail"], { max: 9 })],
    defaults: ({ P: prod }) => ({ eyebrow: "How it works", title: prod.journeyTitle, lede: prod.journeyLede, steps: prod.journey }),
  },
  integration: {
    label: "Integration paths", group: "How it works",
    fields: [T("eyebrow", "Eyebrow"), A("title", "Title"), A("lede", "Lede"), L("paths", "Paths", ["Tag", "Heading", "Body"], { max: 3 }), A("footnote", "Footnote")],
    defaults: ({ P: prod }) => ({
      eyebrow: "Technical", title: prod.integrationTitle, lede: prod.integrationLede, paths: prod.integrations,
      footnote: "A dedicated customer portal is provisioned for each client, and every path converges into the same network operations layer.",
    }),
  },
  network: {
    label: "Network & coverage map", group: "Network",
    fields: [T("eyebrow", "Eyebrow"), A("title", "Title"), A("lede", "Lede"), L("stats", "Stats", ["Value", "Label"], { max: 4 })],
    defaults: ({ deal, facts, analysis, coverage, hubs }) => {
      const has = analysis && !analysis.estimate && analysis.zip3Count;
      const stats = [
        [fmtInt(facts.liveLocations), "Live drop-off locations"],
        [String(hubs.length), "Hub markets"],
        [facts.zipCodes, "ZIP codes covered"],
      ];
      if (coverage) stats.push([fmtPct(coverage.share), `of ${deal.client || "your"} parcels start in a ZIP3 with a DropX location`]);
      else if (has) stats.push([String(analysis.stateCount), `States your ${deal.product === "merchant" ? "sellers ship" : "customers return"} from`]);
      else stats.push([facts.populationReach, "Population reach"]);
      return {
        eyebrow: "The network",
        title: has ? `Where ${deal.client || "your"} parcels start, and where we are.` : "Today's footprint. Tomorrow's network.",
        lede: has
          ? `Orange circles show ${deal.client || "client"} parcel origins by 3-digit ZIP (bigger = more parcels). Dark pins mark DropX hub markets.`
          : `Dark pins mark DropX hub markets. The network is scaling from ${fmtInt(facts.liveLocations)} locations today to ${facts.plannedLocations} by ${facts.plannedBy}.`,
        stats,
      };
    },
  },
  growth: {
    label: "Growth forecast", group: "Network",
    fields: [T("eyebrow", "Eyebrow"), A("title", "Title"), A("lede", "Lede"), L("milestones", "Milestones", ["When", "Locations", "Phase", "Detail"], { max: 6 })],
    defaults: ({ facts }) => ({
      eyebrow: "Growth forecast",
      title: `From ${fmtInt(facts.liveLocations)} today to ${facts.plannedLocations} by ${facts.plannedBy}.`,
      lede: "A rapid expansion that has already moved past its foundation phase. Density compounds as the network grows.",
      milestones: GROWTH.map((g, i) => (i === 0 ? [g[0], fmtInt(facts.liveLocations), g[2], g[3]] : g)),
    }),
  },
  profile: {
    label: "Your parcel profile", group: "Your numbers", needs: "analysis",
    fields: [T("eyebrow", "Eyebrow"), A("title", "Title"), A("lede", "Lede"), L("kpis", "KPIs", ["Value", "Label"], { max: 4 })],
    defaults: ({ deal, analysis: a }) => {
      if (!a) return {};
      const noun = deal.product === "merchant" ? "shipments" : "returns";
      return {
        eyebrow: "Your numbers",
        title: `${deal.client || "Your"} ${noun} at a glance.`,
        lede: a.estimate
          ? `Based on the volume and weight mix shared in discovery.`
          : `Based on ${fmtInt(a.n)} parcels${a.dateFrom ? ` from ${fmtDate(a.dateFrom)} to ${fmtDate(a.dateTo)}` : ""}, annualised.`,
        kpis: [
          [fmtInt(a.annualVolume), `Annual ${noun}`],
          [a.avgLb != null ? fmtNum(a.avgLb, 1) + " lb" : shareLabel(a), a.avgLb != null ? "Average weight" : "Parcels at 3 lb or under"],
          [a.avgCost != null ? fmtMoney(a.avgCost) : "–", "Current average cost per parcel"],
          a.stateCount ? [String(a.stateCount), "States of origin"]
            : (a.carriers?.[0]?.[0] || deal.currentProvider) ? [a.carriers?.[0]?.[0] || deal.currentProvider, "Current provider"]
            : [a.savings ? fmtMoney(a.savings.avgDx) : "–", "DropX all-in rate / parcel"],
        ],
      };
    },
  },
  savings: {
    label: "Savings analysis", group: "Your numbers", needs: "savings",
    fields: [T("eyebrow", "Eyebrow"), A("title", "Title"), A("lede", "Lede"), A("footnote", "Footnote")],
    defaults: ({ deal, analysis: a, pricing }) => {
      const s = a?.savings;
      if (!s) return {};
      const positive = s.annual > 0;
      return {
        eyebrow: "The opportunity",
        title: positive ? `${fmtMoneyShort(s.annual)} a year back to ${deal.client || "you"}.` : "Your cost per parcel, side by side.",
        lede: positive
          ? `Moving to DropX saves an estimated ${fmtMoney(s.perParcel)} per parcel (${fmtPct(s.pct)}) across ${fmtInt(a.annualVolume)} parcels a year.`
          : `DropX delivers faster acceptance scans and a single point of accountability at ${fmtMoney(s.avgDx)} per parcel.`,
        footnote: `${a.estimate ? "Estimate from discovery inputs." : `Modelled on ${fmtInt(s.basis)} parcels with cost data.`} DropX rates are all-in per parcel${pricing.fuelPct ? ` including a ${pricing.fuelPct}% fuel surcharge` : ""}${pricing.structure === "zoned" ? "; zones estimated from ZIP distance" : ""}.${pricing.approved ? "" : " Illustrative pricing, subject to final rate card."}`,
      };
    },
  },
  ratecard: {
    label: "Rate card", group: "Commercials",
    fields: [T("eyebrow", "Eyebrow"), A("title", "Title"), A("lede", "Lede"), A("notes", "Notes under the table")],
    defaults: ({ deal, P: prod, pricing }) => ({
      eyebrow: "Commercials",
      title: `${prod.rateCardService} rate card${deal.client ? ` for ${deal.client}` : ""}.`,
      lede: `Per-parcel rates${pricing.structure === "zoned" ? " by weight and zone" : " by weight"}. ${pricing.terms.validity ? "Valid " + pricing.terms.validity + "." : ""}`,
      notes: pricing.terms.notes,
    }),
  },
  whynow: {
    label: "Why now", group: "Close",
    fields: [T("eyebrow", "Eyebrow"), A("title", "Title"), A("lede", "Lede"), L("cards", "Cards", ["Tag", "Heading", "Body"], { max: 4 })],
    defaults: () => ({
      eyebrow: "Why now",
      title: "The case for getting in at the ground floor.",
      lede: "Early adopters lock in pricing, partnership terms and integration priority before the network reaches incumbent scale. Be a co-architect, not a customer.",
      cards: WHY_NOW,
    }),
  },
  nextsteps: {
    label: "Next steps & contact", group: "Close",
    fields: [T("eyebrow", "Eyebrow"), A("title", "Title"), L("steps", "Steps", ["When", "Heading", "Detail"], { max: 4 }), T("contactName", "Contact name"), T("contactTitle", "Contact title"), T("contactEmail", "Contact email"), T("contactPhone", "Contact phone"), T("cta", "Call to action")],
    defaults: ({ deal, facts }) => ({
      eyebrow: "Next steps", title: "From discovery to live in five weeks.", steps: NEXT_STEPS,
      contactName: deal.repName || "", contactTitle: deal.repTitle || "", contactEmail: deal.repEmail || "", contactPhone: deal.repPhone || "",
      cta: `Book a discovery call · ${facts.website}`,
    }),
  },
  custom: {
    label: "Custom slide", group: "Custom",
    fields: [T("eyebrow", "Eyebrow"), A("title", "Title"), A("body", "Body (one bullet per line)"), P("photo", "Photo (optional)")],
    defaults: () => ({ eyebrow: "", title: "Add your title", body: "First point\nSecond point\nThird point", photo: "" }),
  },
};

function shareLabel(a) {
  const s = a.bands.slice(0, 3).reduce((x, b) => x + (b.share || 0), 0);
  return fmtPct(s);
}

export const DEFAULT_ORDER = ["cover", "about", "problem", "solution", "journey", "network", "growth", "profile", "savings", "ratecard", "integration", "whynow", "nextsteps"];

export const newSlide = (type) => ({ id: uid(), type, enabled: true, f: {} });
export const defaultDeck = () => DEFAULT_ORDER.map(newSlide);

// Resolve a slide's final field values.
export function resolveSlide(slide, ctx) {
  const def = SLIDE_TYPES[slide.type];
  const d = def.defaults(ctx) || {};
  return { ...d, ...slide.f };
}

// Is a slide usable with the current data?
export function slideAvailable(slide, ctx) {
  const need = SLIDE_TYPES[slide.type].needs;
  if (need === "analysis") return !!ctx.analysis;
  if (need === "savings") return !!ctx.analysis?.savings;
  return true;
}

export const productContent = (product) => PRODUCTS[product] || PRODUCTS.returns;
