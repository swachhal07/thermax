export const siteConfig = {
  name: 'Thermax',
  tagline: 'Engineering comfort, sustainably.',
  heroBadge: 'Part of the MV Dugar Group',
  heroHeadline: 'Chemistry that holds it together',
  heroSubheadline:
    'Construction and industrial chemicals supplied, specified, and supported across Nepal.',
  description:
    'Short one-or-two sentence description of the client used for SEO meta tags and the hero subheading.',
  email: 'info@cbinepal.com',
  phone: '+91 9903922253',
  phoneAlt: '+977 9802591332',
  address: 'Kathmandu, Nepal',
  hours: 'Sun–Fri, 9:30–18:00',
  mapQuery: '27.7142371,85.3294612',
  mapPlace: 'MV Dugar Group Head Office',
  social: {
    facebook: '#',
    instagram: '#',
    linkedin: '#',
  },
}

export const OVERLAY_ROUTES = ['/']

export const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Applications', to: '/services' },
  { label: 'About', to: '/about' },
  { label: 'Blog', to: '/blog' },
]

export const footerLinks = [...navLinks, { label: 'Careers', to: '/careers' }]
