/* The photographs behind each application, shared by the home hero and the
   sector grid below it. They used to be two separate sets — the hero on
   `hero-*` plates and the grid on a `service-*` glob — which meant the same
   sector was represented by two different photographs on one page, and a plate
   swapped in the hero silently disagreed with the card further down.

   One list, keyed by the slug in data/services.js. An application may hold
   several plates: the hero plays them in order before moving to the next name,
   and the grid card uses the first as its still.

   Sizes are not uniform and it shows. Anything much over 1920w is decoding more
   bitmap than any viewport displays — the hero holds up to three of these live
   at once and the compositor carries them through the drift animation, so an
   oversized plate here costs more than it would in an ordinary <img>. */

import damsPlateA from '@/assets/images/hero-dam-01.jpg'
import damsPlateB from '@/assets/images/hero-dam-02.jpg'
// 2560×1920 and 4.9MP, the largest plate in the set, and 4:3 against a 16:9
// viewport so cover crops the top and bottom off it. Worth resizing to 1920w.
import bridgesPlate from '@/assets/images/spray-shotcrete-scaled.jpg'
import roadsPlate from '@/assets/images/hero-road.webp'
import tunnelsPlateA from '@/assets/images/hero-tunnel-01.jpg'
import tunnelsPlateB from '@/assets/images/glo-shotcrete-05.webp'
import restorationPlateA from '@/assets/images/Linjebygg-surface-treatment-4.jpg'
// Resized from a 2522×1680 original to match the rest of the set at 1920w. At
// 4.2MP it was decoding half again as much bitmap as any other plate for pixels
// no screen ever showed.
import restorationPlateB from '@/assets/images/hero-restoration-02.webp'

export const PLATES = {
  dams: [damsPlateA, damsPlateB],
  bridges: [bridgesPlate],
  // One plate: the second was an excavator clearing a riverbed, which read as a
  // washout rather than as pavement work.
  roads: [roadsPlate],
  tunnels: [tunnelsPlateA, tunnelsPlateB],
  restoration: [restorationPlateA, restorationPlateB],
}

// The still for a sector — the first plate of its run.
export const plateFor = (slug) => PLATES[slug]?.[0] ?? null
