import { posts } from '@/data/posts'
import { services } from '@/data/services'

/* Covers. Drawn from the photography already in the project rather than stock
   pulled in for the occasion — every one of these is a frame the site already
   publishes elsewhere, carrying the alt text it already has. */
import resinsCover from '@/assets/images/service-ion-exchange-resins.webp'
import constructionCover from '@/assets/images/service-construction-chemicals.webp'
import waterCover from '@/assets/images/service-fuel-water-treatment.webp'
import labCover from '@/assets/about-plate-lab.webp'
import siteCover from '@/assets/images/about-site.webp'

/**
 * Everything derived from the journal content, in one place because two pages
 * need it: the index at /blog and the note at /blog/:slug. Keeping the covers
 * and the ordering here rather than in either page means a note and its own
 * card can never disagree about which photograph belongs to it.
 */

/** Short labels, keyed to the catalogue. Full product titles run far too long. */
export const LINE_LABELS = {
  'ion-exchange-resins': 'Resins',
  'oil-field-chemicals': 'Oil field',
  'fuel-water-treatment': 'Fuel & water',
  'construction-chemicals': 'Construction',
}

/** Catalogue code for a post's line, for the mono tags. */
export const codeFor = (slug) => services.find((s) => s.slug === slug)?.code ?? '——'

/**
 * One cover per note, each with the alt text that frame carries where the site
 * already uses it. Two notes share the resin photograph because they are two
 * notes about the same product line — better an honest repeat than an unrelated
 * image chosen only to avoid one.
 *
 * NOTE: if the client supplies real photography for the journal, replace the
 * `src` AND rewrite the `alt` with it. Alt text describing the wrong photograph
 * is worse than no alt text at all.
 */
export const COVERS = {
  'stock-in-kathmandu': {
    src: resinsCover,
    alt: 'Racked test tubes and flasks holding brightly coloured solutions under lab light',
  },
  'cold-weather-pours': {
    src: constructionCover,
    alt: 'Tower cranes silhouetted over a building site at blue hour',
  },
  'reading-a-boiler-water-report': {
    src: labCover,
    alt: 'Chemist in safety glasses drawing a sample from a separatory funnel in a fume hood',
  },
  'closed-loop-losing-water': {
    src: waterCover,
    alt: 'A single droplet striking still water, ringed by concentric ripples',
  },
  'chloride-before-you-specify': {
    src: resinsCover,
    alt: 'Racked test tubes and flasks holding brightly coloured solutions under lab light',
  },
  'shelf-life-and-storage': {
    src: siteCover,
    alt: 'Two steel fixers in orange vests kneeling over a rebar mat on a fresh slab, cutting gear and coiled hose around them',
  },
}

/**
 * Minutes, computed from the body at 200 words per minute rather than typed into
 * the data by hand. The notes are abridged drafts, so these read short — which is
 * the honest answer for what is actually on the page, and it corrects itself the
 * moment real articles replace them. A hand-written "6 min" over three
 * paragraphs is a small lie every card would repeat.
 */
export const readTime = (post) => {
  const words = post.body.join(' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

/**
 * Reading order: the featured note first, then the rest as the data file lists
 * them. Both the index and the previous/next links below run off this, so the
 * order a visitor sees on the index is the order they walk in.
 */
export const ordered = [...posts.filter((p) => p.feature), ...posts.filter((p) => !p.feature)]

export const findPost = (slug) => ordered.find((p) => p.slug === slug) ?? null

/**
 * The notes either side, for the footer of a note. Deliberately does not wrap
 * around: "next" on the last note leading back to the first pretends the journal
 * is a loop, and a visitor who has reached the end should be handed the index,
 * not sent round again.
 */
export const neighbours = (slug) => {
  const i = ordered.findIndex((p) => p.slug === slug)
  if (i === -1) return { previous: null, next: null }
  return {
    previous: i > 0 ? ordered[i - 1] : null,
    next: i < ordered.length - 1 ? ordered[i + 1] : null,
  }
}
