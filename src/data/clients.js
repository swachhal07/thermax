/* Contractors and project teams we supply. `sector` must match a slug in
   data/services.js (dams, bridges, roads, tunnels, restoration) — it drives the
   filter and the sector label on each row.

   `capacityMw` is the installed capacity of the project, kept as a number
   rather than baked into `project` so the ledger on the Clients page can total
   it and scale each row's bar against the biggest job in the sector. Leave it
   off where a job has no capacity figure (repair works, framework contracts) —
   those rows render without a bar rather than with a zero-width one.
   `project` and `year` are optional too. To add a logo, put the file in
   assets/images/client-<slug>.webp and it is picked up automatically. */

export const clients = [
  {
    slug: 'sumo-construction',
    name: 'Sumo Construction & Engineering Pvt. Ltd.',
    sector: 'dams',
    project: 'Lapchey 1 Hydropower Project',
    capacityMw: 200,
  },
  {
    slug: 'bavari-construction',
    name: 'Bavari Construction Pvt. Ltd.',
    sector: 'dams',
    project: 'Jum Khola Jalvidyut Aayojana',
    capacityMw: 56,
  },
  {
    slug: 'bhugol-infrastructure',
    name: 'Bhugol Infrastructure Company Pvt. Ltd.',
    sector: 'dams',
    project: 'Bhotekoshi Rural Municipality-5, Sindhupalchok',
    capacityMw: 46,
  },
  {
    slug: 'dhaulagiri-construction',
    name: 'Dhaulagiri Construction & Development Pvt. Ltd.',
    sector: 'dams',
    project: 'Aauy Malun Hydropower Project',
    capacityMw: 21,
  },
  {
    slug: 'rasuwa-hydropower',
    name: 'Rasuwa Hydropower Limited',
    sector: 'dams',
    project: 'Phalakhu Khola Hydropower Project',
    capacityMw: 7.29,
  },
  {
    slug: 'rj-construction',
    name: 'R.J. Construction Company Pvt. Ltd.',
    sector: 'restoration',
  },
  {
    slug: 'milan-multi-construction',
    name: 'Milan Multi Construction Pvt. Ltd.',
    sector: 'restoration',
    project: 'Government repair works',
  },
]
