const LANGUAGES: Record<string, string> = {
  english: 'Inglés',
  ingles: 'Inglés',
  spanish: 'Español',
  espanol: 'Español',
  castellano: 'Español',
  catalan: 'Catalán',
  french: 'Francés',
  frances: 'Francés',
  german: 'Alemán',
  aleman: 'Alemán',
  italian: 'Italiano',
  italiano: 'Italiano',
  portuguese: 'Portugués',
  portugues: 'Portugués',
  japanese: 'Japonés',
  japones: 'Japonés',
  korean: 'Coreano',
  coreano: 'Coreano',
  latin: 'Latín',
}

/** Maps the `#LANGUAGE` header (English or Spanish names, any case/accents) to a Spanish label. */
export function normalizeLanguage(raw: string | undefined): string | undefined {
  const key = raw
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
  if (!key) return undefined
  return LANGUAGES[key] ?? raw!.trim().replace(/^\p{L}/u, (c) => c.toUpperCase())
}
