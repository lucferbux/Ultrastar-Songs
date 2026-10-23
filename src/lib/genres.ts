/**
 * Canonical genres. The legacy catalog has ~136 free-text genres (case variants, typos, one-offs);
 * importers map them to this short list and keep the original text as a tag.
 */
export const GENRES = [
  'Pop',
  'Rock',
  'Indie y alternativo',
  'Metal',
  'Punk',
  'Electrónica y dance',
  'Hip hop y R&B',
  'Latino',
  'Baladas',
  'Cantautor y copla',
  'Folk y country',
  'Blues y jazz',
  'Clásicos',
  'Bandas sonoras',
  'Anime y pop asiático',
  'Otros',
] as const

export type Genre = (typeof GENRES)[number]

// First match wins, so more specific rules go first ("Pop Punk" → Punk, "Pop latino" → Latino).
const RULES: [RegExp, Genre | null][] = [
  [/^(-|other|misc|unknown|dueto)$/, null],
  [/metal|industrial/, 'Metal'],
  [/punk/, 'Punk'],
  [/anime|k-?pop|j-?pop|j-?rock|kdrama/, 'Anime y pop asiático'],
  [/soundtrack|banda[s]? sonora|musical|disney|dibujos|anuncio|villancico/, 'Bandas sonoras'],
  [/latin|reggaet|salsa|bachata|merengue|vallenato|sertanejo/, 'Latino'],
  [/hip.?hop|rap|r&b|r'n'b|urban|funk|soul/, 'Hip hop y R&B'],
  [/dance|edm|electr|house|disco|synthwave/, 'Electrónica y dance'],
  [/alternativ|indie|grunge|britpop|shoegaz/, 'Indie y alternativo'],
  [/cantautor|copla/, 'Cantautor y copla'],
  [/folk|country|celta/, 'Folk y country'],
  [/blues|jazz/, 'Blues y jazz'],
  [/balada|ballad/, 'Baladas'],
  [/cl[aá]sicos|oldies/, 'Clásicos'],
  [/rock|glam/, 'Rock'],
  [/pop|new wave|new romantic|vari[eé]t[eé]/, 'Pop'],
]

/** Maps free-text genre to a canonical one; undefined for placeholders like "-" or "Other". */
export function normalizeGenre(raw: string | undefined): Genre | undefined {
  const text = raw?.trim().toLowerCase()
  if (!text) return undefined
  for (const [pattern, genre] of RULES) if (pattern.test(text)) return genre ?? undefined
  return 'Otros'
}

/** True when the legacy genre field was used to flag a duet. */
export const genreMeansDuet = (raw: string | undefined) => raw?.trim().toLowerCase() === 'dueto'
