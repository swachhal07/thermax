import { posts } from '@/data/posts'
import { services } from '@/data/services'

import resinsCover from '@/assets/images/service-ion-exchange-resins.webp'
import constructionCover from '@/assets/images/service-construction-chemicals.webp'
import waterCover from '@/assets/images/service-fuel-water-treatment.webp'
import labCover from '@/assets/about-plate-lab.webp'
import siteCover from '@/assets/images/about-site.webp'

export const LINE_LABELS = {
  'ion-exchange-resins': 'Resins',
  'oil-field-chemicals': 'Oil field',
  'fuel-water-treatment': 'Fuel & water',
  'construction-chemicals': 'Construction',
}

export const codeFor = (slug) => services.find((s) => s.slug === slug)?.code ?? '——'

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

export const readTime = (post) => {
  const words = post.body.join(' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export const ordered = [...posts.filter((p) => p.feature), ...posts.filter((p) => !p.feature)]

export const findPost = (slug) => ordered.find((p) => p.slug === slug) ?? null

export const neighbours = (slug) => {
  const i = ordered.findIndex((p) => p.slug === slug)
  if (i === -1) return { previous: null, next: null }
  return {
    previous: i > 0 ? ordered[i - 1] : null,
    next: i < ordered.length - 1 ? ordered[i + 1] : null,
  }
}
