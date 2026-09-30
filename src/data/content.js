// Default copy + company facts for DropX presentations.
// Source: the DropX section of the SpeedX Interactive Overview deck and the DropX website wireframes.
// Everything here is editable in the tool (Presentation → Content library); these are just the defaults.

export const DEFAULT_FACTS = {
  asOf: "April 2026",
  liveLocations: 7158,
  plannedLocations: "60K+",
  plannedBy: "end of 2027",
  parcelsPerDay: "50K",
  zipCodes: "12,000+",
  populationReach: "175M",
  hubs: 11,
  marketCostLow: 6,
  marketCostHigh: 12,
  website: "wearedropx.com",
  liveMapUrl: "https://pulse.wearedropx.com/locations",
};

export const PRODUCTS = {
  returns: {
    label: "Returns",
    tagline: "Returns, Reimagined as a Network.",
    lede: "DropX is a unified drop-off and last-mile network purpose-built for ecommerce. One integration, one point of accountability, a measurably better experience at a meaningfully lower cost.",
    problemTitle: "Returns are broken, expensive, and fragmented.",
    problemLede: "Retailers stitch together multiple vendors, accept slow refund processing, and pay a premium for a mediocre consumer experience.",
    problems: [
      ["Slow acceptance scans", "Marketplaces wait days for the scan that triggers refund eligibility. Customer satisfaction drops with every hour of delay."],
      ["Fragmented vendor stack", "Happy Returns, UPS, FedEx, USPS. Multiple integrations, multiple SLAs, and no single point of accountability."],
      ["Limited drop-off density", "Inconvenient locations and inconsistent hours mean returns sit in closets, generating support tickets and refund delays."],
      ["Premium pricing, average service", "Retailers pay top-of-market rates for a returns experience that underdelivers on speed and visibility."],
    ],
    problemCallout: "Current market cost per return: ${marketCostLow} to ${marketCostHigh}.",
    solutionTitle: "One network. One integration. One standard.",
    solutionLede: "DropX combines a rapidly scaling drop-off footprint with the SpeedX last-mile network into a single returns product built for marketplaces.",
    pillars: [
      ["Density", "Drop-off built for density", "A growing footprint of partner locations within a short walk or drive of every consumer in target markets."],
      ["Linehaul", "SpeedX-operated last mile", "National coverage across 12,000+ ZIP codes, with automated sortation and proven hub operations."],
      ["Accountability", "Single accountability layer", "One contract, one SLA, one integration. DropX owns the experience end to end so you do not have to."],
    ],
    journeyTitle: "The parcel journey, end to end.",
    journeyLede: "From the consumer printing a label to network injection at the hub. The acceptance scan is the moment that triggers marketplace refund eligibility.",
    journey: [
      ["Label generation", "Consumer initiates the return and prints the label."],
      ["Drop-off", "Consumer drops the parcel at any DropX location during operating hours."],
      ["In-store scan", "Partner scans the parcel into the network. First confirmation event for the consumer."],
      ["Pickup request", "System pushes a pickup request to the appropriate hub."],
      ["Driver pickup", "Driver collects the parcel on the next scheduled pickup window."],
      ["Hub arrival", "Parcel arrives at the sorting center."],
      ["Acceptance scan", "The receive scan that triggers refund eligibility, committed within network SLA."],
      ["Sort", "Automated sortation routes the parcel to the correct outbound lane."],
      ["Network injection", "Parcel delivers locally or cross-docks to a destination hub for outbound."],
    ],
    integrationTitle: "One integration to the entire network.",
    integrationLede: "Retailers integrate once with DropX. Three paths cover every operational reality, from native API to platform-mediated through Loop, Narvar, and beyond.",
    integrations: [
      ["Path A · Direct", "Direct API integration", "Connect directly to DropX APIs for labels, tracking events, and reconciliation. Full event stream from drop-off scan to final disposition. Onboarding in two to four weeks."],
      ["Path B · Lightweight", "Returns-platform mediated", "Already on Loop, Narvar, or another platform? DropX is pre-integrated and appears as a carrier option. Often live inside one week."],
      ["Path C · Custom", "Custom on your stack", "For retailers running their own returns platform. DropX completes a direct integration with joint engineering scoping at kickoff."],
    ],
    rateCardService: "Returns Drop-off",
  },
  merchant: {
    label: "Merchant Drop-offs",
    tagline: "Merchant Drop-offs. One Rate for Every Seller.",
    lede: "The same drop-off network, pointed outbound. DropX lets a marketplace extend hyper-competitive rates to its entire seller base, from one package to hundreds, with no first-mile pickup required.",
    problemTitle: "Sellers are boxed in by carrier costs.",
    problemLede: "When shipping is the constraint, sellers list less, price higher, and convert worse, and the marketplace feels it too.",
    problems: [
      ["Few competitive options", "Marketplaces have few choices beyond the mainstream carriers to offer sellers. As those options grow cost-prohibitive, they limit what a seller can profitably list."],
      ["Higher costs, lower conversion", "Higher shipping forces sellers to raise listing prices, which lowers conversion, which hits both seller and marketplace bottom lines."],
      ["Amazon's logistics advantage", "These listings compete against Amazon, whose logistical advantage is effectively beyond reach for most SMB shippers."],
      ["No leverage on rates", "SMB shippers lack the buying power to control shipping costs, and many lack the volume to justify a first-mile pickup."],
    ],
    problemCallout: "Many SMBs lack the volume to secure their own rate card.",
    solutionTitle: "One rate card. Every seller.",
    solutionLede: "DropX extends hyper-competitive service to a marketplace's entire seller population, with the first mile designed out.",
    pillars: [
      ["One-to-many rate", "Every merchant qualifies", "A truly disruptive one-to-many rate card that any merchant can use, whether they have one package or hundreds."],
      ["No first mile", "Drop-off, not pickup", "The DropX network eliminates first-mile pickup cost, so the marketplace can cascade unprecedented savings to the seller."],
      ["We take it from there", "Thousands of locations", "Sellers drop shipments at the nearest of thousands of DropX locations. The network handles line-haul and last-mile delivery."],
    ],
    journeyTitle: "The parcel journey, end to end.",
    journeyLede: "From the shipper printing labels to final delivery. The same network flow, pointed outbound.",
    journey: [
      ["Label generation", "Shipper creates labels on the marketplace or an integrated TMS platform and prints them."],
      ["Drop-off", "Shipper drops parcels at any DropX location during operating hours."],
      ["In-store scan", "Partner scans parcels into the network. First confirmation event for the shipper."],
      ["Pickup request", "System pushes a pickup request to the appropriate hub."],
      ["Driver pickup", "Driver collects the parcels on the next scheduled pickup window."],
      ["Hub arrival", "Parcels arrive at the sorting center."],
      ["Acceptance scan", "The receive scan confirms the parcels are inducted into the network, within SLA."],
      ["Sort", "Automated sortation routes each parcel to the correct outbound lane."],
      ["Delivery", "Parcels deliver locally or cross-dock to a destination hub for final delivery."],
    ],
    integrationTitle: "One integration to the entire network.",
    integrationLede: "Shippers integrate once. Three paths cover every operational reality, from native API to marketplace-native to TMS-mediated.",
    integrations: [
      ["Path A · Direct", "Direct API integration", "Connect directly to DropX APIs for labels, tracking events, and reconciliation. Full event stream from drop-off scan to final delivery."],
      ["Path B · Marketplace", "Label on the marketplace", "The shipper creates the delivery label on the marketplace platform, with DropX available as a built-in shipping option. No new integration for the seller."],
      ["Path C · TMS", "Label on a TMS platform", "The shipper creates labels on an integrated TMS platform such as eHub, EasyPost, or ShipStation, with DropX available as a carrier option."],
    ],
    rateCardService: "Merchant Drop-off",
  },
};

export const GROWTH = [
  ["Today", "7,158", "Foundation phase", "Live in production with anchor volume and validated unit economics."],
  ["Q3 2026", "~8K", "Top-10 metro expansion", "ORD, LAX, DFW, IAH, Boston, Philly, CT, MIA, SFO, ATL active."],
  ["End 2026", "~18K", "National coverage threshold", "Top-25 metros at target density. Secondary markets underway."],
  ["Q2 2027", "~32K", "Scale inflection", "Convenience parity with incumbent returns networks."],
  ["Q3 2027", "~48K", "Coverage lead", "Drop-off density exceeds incumbents in priority markets."],
  ["End 2027", "60K+", "Network maturity", "A national drop-off network at scale, with operating leverage driving further cost reductions."],
];

export const WHY_NOW = [
  ["Pricing", "Locked-in early rates", "Foundational rate cards set before the network commands a scale premium. Your unit economics improve as it grows."],
  ["Roadmap", "Integration priority", "A direct line to the product roadmap. Features built around your requirements rather than retrofitted later."],
  ["Experience", "Compounding convenience", "Every new location improves the convenience your customers see. The network gets better while you stand still."],
  ["Moat", "Competitive moat", "Established integrations, contractual SLAs, and operational runway competitors cannot replicate at the same cost basis."],
];

export const NEXT_STEPS = [
  ["Week 1", "Discovery & data review", "Confirm volumes, return reasons and current carrier mix. Finalise rate card."],
  ["Week 2", "Commercial agreement", "Rate card sign-off, SLA and service schedule agreed."],
  ["Weeks 3–4", "Integration", "Direct API, returns platform or TMS set-up. Test labels and tracking events."],
  ["Week 5", "Pilot launch", "Go live in priority markets with daily performance reporting."],
];

// Hub markets shown on network maps — the 11 hubs from the DropX coverage map in the SpeedX overview deck.
// weight = relative market size (drives halo size on the map).
export const HUBS = [
  { code: "NY/NJ", lat: 40.728, lng: -74.078, weight: 4.0 },
  { code: "BOS", lat: 42.358, lng: -71.06, weight: 1.4 },
  { code: "PHL", lat: 39.952, lng: -75.165, weight: 1.4 },
  { code: "CT", lat: 41.184, lng: -73.19, weight: 0.9 },
  { code: "ORD", lat: 41.978, lng: -87.905, weight: 2.5 },
  { code: "DFW", lat: 32.897, lng: -97.04, weight: 2.0 },
  { code: "IAH", lat: 29.984, lng: -95.341, weight: 1.7 },
  { code: "LAX", lat: 33.942, lng: -118.408, weight: 3.2 },
  { code: "SFO", lat: 37.621, lng: -122.379, weight: 1.9 },
  { code: "MIA", lat: 25.795, lng: -80.29, weight: 1.5 },
  { code: "ATL", lat: 33.64, lng: -84.428, weight: 1.6 },
];

export const INDUSTRIES = [
  "Apparel & footwear", "Accessories & jewellery", "Beauty & personal care", "Consumer electronics",
  "Home & furniture", "Marketplace", "Returns platform", "3PL / fulfilment", "Sporting goods", "Other",
];
