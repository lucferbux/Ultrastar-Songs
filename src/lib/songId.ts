/** Lowercase, accent-free, dash-separated slug. */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Stable song id shared by every importer (`artist--title`), so re-importing the same song
 * from the legacy collection or from an UltraStar `.txt` updates one document instead of duplicating it.
 */
export function songId(artist: string, title: string): string {
  return `${slugify(artist) || 'unknown'}--${slugify(title) || 'untitled'}`
}
