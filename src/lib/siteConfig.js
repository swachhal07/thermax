/**
 * Single source of truth for client-specific details.
 * Swap these values instead of hunting through components.
 */
export const siteConfig = {
  name: 'Thermax',
  tagline: 'Engineering comfort, sustainably.',
  heroBadge: 'Part of the MV Dugar Group',
  heroHeadline: 'Engineered for what you build',
  heroSubheadline:
    'Construction and industrial chemicals supplied, specified, and supported across Nepal.',
  description:
    'Short one-or-two sentence description of the client used for SEO meta tags and the hero subheading.',
  email: 'hello@example.com',
  phone: '+977 1 234 5678',
  address: 'Kathmandu, Nepal',
  // NOTE: placeholder. The contact page publishes these as a promise about when
  // a call gets answered — confirm the real desk hours before launch.
  hours: 'Sun–Fri, 9:30–18:00',
  /**
   * What the contact map centres on, and what the directions button routes to.
   *
   * `lat,lng` rather than the place name on purpose: a name is resolved by
   * Google at request time and can drift to a differently-labelled listing,
   * whereas coordinates land on the same point every time. These are the
   * MV Dugar Group head office pin.
   */
  mapQuery: '27.7142371,85.3294612',
  /** Human label for the pin — the coordinates above are precise, not readable. */
  mapPlace: 'MV Dugar Group Head Office',
  social: {
    facebook: '#',
    instagram: '#',
    linkedin: '#',
  },
}

/**
 * Routes that open with a dark full-bleed hero. On these the fixed header
 * starts transparent and sits on top of the hero; everywhere else the page
 * is padded down by the header's height.
 *
 * A page listed here MUST open on something dark enough to carry the white
 * lockup and nav, and MUST pad its own first block down past the bar's 6rem,
 * because Layout stops doing it.
 *
 * /about is deliberately NOT here, even though it opens on a hero of its own.
 * components/sections/AboutHero is a WHITE field, so the bar has to stay solid
 * over it and Layout keeps padding the page down past the bar's 6rem. Add the
 * route back only if that block ever goes dark enough to carry the white lockup.
 */
export const OVERLAY_ROUTES = ['/']

/**
 * Top navigation. An item with `children` renders as a dropdown.
 */
export const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  /* Was a dropdown with Our Story and Leadership. The leadership block is gone
     from the About page, and a dropdown holding a single item that goes to the
     same place as its parent is a menu that costs a click and returns nothing —
     so About is a plain link again. Restore the `children` array if the page
     grows sections worth jumping to. */
  { label: 'About', to: '/about' },
  { label: 'Blog', to: '/blog' },
]

/**
 * Footer pages. The header is deliberately shorter than this: Careers is a page
 * someone goes looking for rather than one that competes with Services for a
 * buyer's attention, and the footer is where people look for it. The page is
 * still routed and still linked — just not from the top bar.
 */
export const footerLinks = [...navLinks, { label: 'Careers', to: '/careers' }]
