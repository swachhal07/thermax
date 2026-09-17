/* Slugs are the public identifier for both collections — the frontend already
   routes on them (/applications/waterproofing) and the seed carries the ones
   the static data files use, so they must round-trip identically. */
export function slugify(input) {
  return String(input ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
