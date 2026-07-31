import isoLogo from '@/assets/certifications-img-4.webp'
import reachLogo from '@/assets/Reach-Accrediation.webp'
import gpcLogo from '@/assets/GPC-Europe.webp'
import responsibleCareLogo from '@/assets/certifications-img-5.webp'
import halalLogo from '@/assets/1.png'
import kosherLogo from '@/assets/3.png'

/**
 * Certification marks supplied by the client, read off the artwork itself.
 *
 * `name` is not rendered — the mark carries its own wordmark — but it keeps the
 * list readable here and gives each entry a stable React key. `alt` is what a
 * screen reader gets, so it names the certification rather than describing the
 * graphic.
 *
 * Still worth confirming before launch: which of these belong to Thermax
 * Limited as manufacturer versus to MV Dugar as distributor, and that each is
 * currently valid.
 */
export const certifications = [
  {
    name: 'ISO 9001',
    logo: isoLogo,
    alt: 'ISO 9001 certified — quality assurance management system',
  },
  {
    name: 'REACH',
    logo: reachLogo,
    alt: 'REACH compliant',
  },
  {
    name: 'GPC Europe',
    logo: gpcLogo,
    alt: 'GPC Europe — EU REACH Only Representative',
  },
  {
    name: 'Responsible Care',
    logo: responsibleCareLogo,
    alt: 'Responsible Care — commitment to sustainability',
  },
  {
    name: 'Halal (IDCP)',
    logo: halalLogo,
    alt: 'Halal certified by the Islamic Da’wah Council of the Philippines',
  },
  {
    name: 'OK Kosher',
    logo: kosherLogo,
    alt: 'OK Kosher certified',
  },
]
