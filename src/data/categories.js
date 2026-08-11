/* Photographs resolve by slug — src/assets/images/product-<slug>.{jpg,webp,…}
   `uses` entries reference a sector slug from src/data/services.js, which supplies
   the sector's title and photograph. */
export const categories = [
  {
    slug: 'waterproofing',
    name: 'Waterproofing',
    body: 'PVC sheet and spray-applied MMA membranes for structures that sit under permanent water load — reliable barriers against ingress, from foundation to lining.',
    imageAlt: 'Foundation walls coated in black waterproofing membrane, rebar standing proud',
    uses: [
      {
        sector: 'tunnels',
        detail:
          'Sheet membrane laid behind the final lining and umbrella waterproofing over the crown, so the heading stays dry once the shotcrete is closed.',
      },
      {
        sector: 'dams',
        detail:
          'Upstream face and gallery treatment, and lining protection through headrace tunnels and intakes that carry permanent head.',
      },
      {
        sector: 'bridges',
        detail:
          'Deck waterproofing under the wearing course and abutment tanking, keeping chlorides off the reinforcement below.',
      },
    ],
  },
  {
    slug: 'repair-rehabilitation',
    name: 'Repair & Rehabilitation',
    body: 'Cementitious and epoxy repair mortars that address visible damage and the structural issue underneath it, restoring cover and long-term performance.',
    imageAlt: 'A gloved hand spreading repair mortar across a wall with a float',
    uses: [
      {
        sector: 'bridges',
        detail:
          'Pier, soffit and parapet repairs where cover has spalled — rebuilding section and re-passivating exposed steel.',
      },
      {
        sector: 'dams',
        detail:
          'Spillway, stilling basin and intake repairs, including surfaces losing material to abrasion and cavitation.',
      },
      {
        sector: 'tunnels',
        detail:
          'Lining repairs and patching around segment joints and over-break, brought back flush before finishing.',
      },
      {
        sector: 'roads',
        detail:
          'Fast-set patching that returns a lane to service the same day, plus repairs to kerbs, culverts and structures.',
      },
    ],
  },
  {
    slug: 'concrete-admixtures',
    name: 'Concrete Admixtures',
    body: 'PC-based superplasticisers, micro silica, shotcrete accelerators, and steel and PP fibre — dosed for consistent workability, strength, and durability.',
    imageAlt: 'Concrete discharging from a chute into reinforced formwork',
    uses: [
      {
        sector: 'dams',
        detail:
          'Retarding and water-reducing admixtures for mass pours, holding workability through long placements and limiting heat gain.',
      },
      {
        sector: 'bridges',
        detail:
          'Superplasticisers for high-strength deck and pier pours, and for concrete that has to stay pumpable at height.',
      },
      {
        sector: 'tunnels',
        detail:
          'Alkali-free shotcrete accelerators for sprayed face support, with fibre dosed into the mix in place of mesh.',
      },
      {
        sector: 'roads',
        detail:
          'Workability and strength control for pavement-quality concrete laid in long, continuous runs.',
      },
    ],
  },
  {
    slug: 'grouts-anchors',
    name: 'Grouts & Anchors',
    body: 'Resin and cement capsules for rock bolting, non-shrink cementitious and epoxy grouts, and polyurethane injection resins for water ingress.',
    imageAlt: 'Threaded bar and rebar anchors set into a concrete block with resin',
    uses: [
      {
        sector: 'tunnels',
        detail:
          'Rock bolting with resin and cement capsules, contact and backfill grouting behind the lining, and PU injection where water is already coming in.',
      },
      {
        sector: 'bridges',
        detail:
          'Non-shrink grout under bearings and base plates, and anchor systems for holding-down bolts and starter bars.',
      },
      {
        sector: 'dams',
        detail:
          'Consolidation and curtain grouting through the foundation, and anchorage for gates and penstock fixings.',
      },
      {
        sector: 'roads',
        detail:
          'Soil nails and rock bolts through cut slopes, plus anchoring for barriers, gantries and signage.',
      },
    ],
  },
  {
    slug: 'protective-coatings',
    name: 'Protective Coatings',
    body: 'Anti-carbonation and chemical-resistant coatings that keep reinforcement cover intact and surfaces serviceable in aggressive exposure.',
    imageAlt: 'The underside of a concrete flyover, piers and beams against a clear sky',
    uses: [
      {
        sector: 'bridges',
        detail:
          'Anti-carbonation coatings over piers, decks and crossheads, slowing the carbonation front through the monsoon cycle.',
      },
      {
        sector: 'dams',
        detail:
          'Chemical- and abrasion-resistant systems for treatment structures, sumps and channels in constant contact with water.',
      },
      {
        sector: 'tunnels',
        detail:
          'Portal structures and cross-passage surfaces exposed to weather, exhaust and washdown.',
      },
    ],
  },
  {
    slug: 'surface-treatment',
    name: 'Surface Treatment',
    body: 'Curing, sealing, and protective treatments that hold moisture in the pour while it gains strength and keep the finished surface serviceable.',
    imageAlt: 'A concrete floor being washed down with a pressure lance',
    uses: [
      {
        sector: 'roads',
        detail:
          'Curing compounds sprayed across pavement and slab pours, holding water in the mix through early strength gain.',
      },
      {
        sector: 'dams',
        detail:
          'Curing across mass pours and lift joints, where surface moisture loss would otherwise show up as early cracking.',
      },
      {
        sector: 'bridges',
        detail:
          'Deck and pier curing straight after the pour, plus sealers on finished surfaces exposed to traffic and de-icing.',
      },
    ],
  },
]

export const categoryBySlug = (slug) => categories.find((c) => c.slug === slug) ?? null
