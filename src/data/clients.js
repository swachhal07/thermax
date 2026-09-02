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
  /* Hydropower jobs are listed as one line each — the entity we supplied and the
     installed capacity. Some are the developer, some are the project or the
     municipality it sits in, which is why the ledger heads this column
     "Client · project" rather than "Contractor", and why none of these carry a
     separate `project`: the name given is the job. */
  {
    slug: 'nasa-hydropower',
    name: 'Nasa Hydropower Pvt. Ltd.',
    sector: 'dams',
    capacityMw: 200,
  },
  {
    slug: 'pan-himalaya-energy',
    name: 'PAN Himalaya Energy Pvt. Ltd',
    sector: 'dams',
    capacityMw: 77,
  },
  {
    slug: 'jum-khola',
    name: 'Jum Khola Jalvidyut Aayojana',
    sector: 'dams',
    capacityMw: 56,
  },
  {
    slug: 'global-hydropower-associate',
    name: 'Global Hydropower Associate Ltd',
    sector: 'dams',
    capacityMw: 55,
  },
  {
    slug: 'bhotekoshi-rural-municipality-5',
    name: 'Bhotekoshi Rural Municipality-5, Sindhupalchok',
    sector: 'dams',
    capacityMw: 46,
  },
  {
    slug: 'numbur-himalaya-hydropower',
    name: 'Numbur Himalaya Hydropower Ltd',
    sector: 'dams',
    capacityMw: 29.4,
  },
  {
    slug: 'aayu-malun',
    name: 'Aayu Malun Hydropower Project',
    sector: 'dams',
    capacityMw: 21,
  },
  {
    slug: 'phalakhu-khola',
    name: 'Phalakhu Khola Hydropower Project',
    sector: 'dams',
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
    project:
      'Government repair work at the Federal Secretariat Construction and Management Office, Kathmandu',
  },
]
