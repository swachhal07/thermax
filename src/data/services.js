/**
 * The four Thermax product lines carried in Nepal, in the order the client's
 * own site presents them.
 *
 * `code` is the short catalogue reference used on the /services page. `summary`
 * is one line for listings; `body` is the longer paragraph.
 *
 * NOTE: the descriptions are written from Thermax's published product range and
 * need the client's sign-off before launch — particularly Oil Field, where the
 * Nepal offering may be narrower than the global one.
 */
export const services = [
  {
    slug: 'ion-exchange-resins',
    code: 'TUL',
    title: 'Tulsion® Ion Exchange Resins',
    summary:
      'Softening, demineralisation, and condensate polishing — Thermax’s own resin line.',
    body: 'Tulsion® is Thermax’s resin range: cation and anion resins for softening, demineralisation, and condensate polishing, plus specialty grades for process separation. Supplied with the regeneration guidance to run them properly.',
    spec: ['Softening', 'Demineralisation', 'Condensate polishing', 'Process separation'],
    imageAlt: 'Racked test tubes and flasks holding brightly coloured solutions under lab light',
    focus: '50% 50%',
  },
  {
    slug: 'oil-field-chemicals',
    code: 'OFC',
    title: 'Oil Field Chemicals',
    summary: 'Drilling, production, and stimulation chemistry for upstream operations.',
    body: 'Drilling fluid additives, production chemicals for flow assurance and corrosion control, and stimulation chemistry — the upstream end of the Thermax catalogue.',
    spec: ['Drilling fluids', 'Flow assurance', 'Corrosion control', 'Stimulation'],
    imageAlt: 'An offshore drilling platform standing in open water under a clear sky',
    // Lifted off centre so the rig clears the scrim the title sits on.
    focus: '50% 42%',
  },
  {
    slug: 'fuel-water-treatment',
    code: 'FWT',
    title: 'Fuel & Water Treatment Chemicals',
    summary:
      'Boiler and cooling water programmes, plus fuel additives that keep combustion clean.',
    body: 'Treatment programmes for boiler feedwater, cooling towers, and closed loops — scale, corrosion, and microbiological control — alongside fuel additives that hold combustion efficiency and cut deposits.',
    spec: ['Boiler feedwater', 'Cooling towers', 'Closed loops', 'Fuel additives'],
    imageAlt: 'A single droplet striking still water, ringed by concentric ripples',
    focus: '50% 48%',
  },
  {
    slug: 'construction-chemicals',
    code: 'CON',
    title: 'Construction Chemicals',
    summary:
      'Admixtures, waterproofing systems, repair mortars, and floor hardeners for structures that have to hold.',
    body: 'Concrete admixtures, integral and membrane waterproofing, structural repair mortars, grouts, and floor hardeners — specified against the pour, with stock held in Kathmandu so a delivery date is a delivery date.',
    spec: ['Admixtures', 'Waterproofing', 'Repair mortars', 'Floor hardeners'],
    imageAlt: 'Tower cranes silhouetted over a building site at blue hour',
    // Weighted down the frame — the top third is empty sky.
    focus: '50% 62%',
  },
]
