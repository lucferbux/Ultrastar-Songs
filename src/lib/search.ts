import MiniSearch from 'minisearch'
import type { Song } from './types'

export interface SongFilters {
  genre?: string
  language?: string
  decade?: number
  duetOnly?: boolean
}

const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

// Case- and accent-insensitive, numeric-aware ordering ("30 Seconds to Mars" ≈ "30 Seconds To Mars").
const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true })

export function buildIndex(songs: Song[]) {
  const index = new MiniSearch<Song>({
    fields: ['title', 'artist', 'genre', 'language', 'edition', 'tags'],
    storeFields: ['id'],
    extractField: (doc, field) => {
      const value = doc[field as keyof Song]
      return Array.isArray(value) ? value.join(' ') : (value as string | undefined)
    },
    processTerm: (term) => fold(term),
    searchOptions: { boost: { title: 2, artist: 2 }, prefix: true, fuzzy: 0.2, combineWith: 'AND' },
  })
  index.addAll(songs)
  return index
}

export const decadeOf = (year?: number) => (year ? Math.floor(year / 10) * 10 : undefined)

export function matchesFilters(song: Song, f: SongFilters): boolean {
  return (
    (!f.genre || song.genre === f.genre) &&
    (!f.language || song.language === f.language) &&
    (!f.decade || decadeOf(song.year) === f.decade) &&
    (!f.duetOnly || song.duet)
  )
}

/** Free-text search (ranked) plus filters; with no query, songs sorted by artist then title. */
export function searchSongs(
  songs: Song[],
  index: MiniSearch<Song>,
  query: string,
  filters: SongFilters,
): Song[] {
  const q = query.trim()
  let result: Song[]
  if (q) {
    const byId = new Map(songs.map((s) => [s.id, s]))
    result = index
      .search(q)
      .map((r) => byId.get(r.id as string))
      .filter((s): s is Song => !!s)
  } else {
    result = [...songs].sort((a, b) => collator.compare(a.artist, b.artist) || collator.compare(a.title, b.title))
  }
  return result.filter((s) => matchesFilters(s, filters))
}

/** Distinct, sorted values of a field — used to fill the filter dropdowns. */
export function facet(songs: Song[], key: 'genre' | 'language'): string[] {
  return [...new Set(songs.map((s) => s[key]).filter((v): v is string => !!v))].sort((a, b) =>
    a.localeCompare(b, 'es'),
  )
}
