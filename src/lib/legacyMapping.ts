import { genreMeansDuet, normalizeGenre } from './genres'
import type { SongData } from './types'

/** A song from the legacy Firestore `songs` collection: capitalised fields, strings, `-` for unknown. */
export type LegacySong = Record<string, unknown>

const KNOWN = new Set(['title', 'artist', 'genre', 'year', 'language', 'edition'])

function pick(record: LegacySong, key: string): string | undefined {
  // Legacy keys are capitalised (`Title`), but accept any casing.
  const match = Object.keys(record).find((k) => k.toLowerCase() === key)
  const value = match === undefined ? undefined : record[match]
  if (value === undefined || value === null) return undefined
  const text = String(value).trim()
  return text === '' || text === '-' ? undefined : text
}

/** Maps a legacy song to the `catalog` shape. Returns null if title or artist is missing. */
export function mapLegacySong(record: LegacySong): SongData | null {
  const title = pick(record, 'title')
  const artist = pick(record, 'artist')
  if (!title || !artist) return null

  const rawGenre = pick(record, 'genre')
  const genre = normalizeGenre(rawGenre)
  // Keep the original genre text searchable when normalisation changed it.
  const tags = rawGenre && rawGenre !== genre && genre ? [rawGenre.toLowerCase()] : []
  const song: SongData = { title, artist, duet: genreMeansDuet(rawGenre), tags, source: 'legacy' }
  const language = pick(record, 'language')
  const edition = pick(record, 'edition')
  const year = Number.parseInt(pick(record, 'year') ?? '', 10)
  if (genre) song.genre = genre
  if (language) song.language = language
  if (edition) song.edition = edition
  if (Number.isFinite(year) && year > 0) song.year = year
  return song
}

/** Field names present in the legacy data that the mapping does not carry over. */
export function unmappedKeys(records: LegacySong[]): string[] {
  const keys = new Set<string>()
  for (const record of records) {
    for (const key of Object.keys(record)) if (!KNOWN.has(key.toLowerCase())) keys.add(key)
  }
  return [...keys].sort()
}

/** Accepts the records as an array or as an object keyed by document id (the backup format). */
export function legacyRecords(snapshot: unknown): LegacySong[] {
  if (!snapshot || typeof snapshot !== 'object') return []
  const values = Array.isArray(snapshot) ? snapshot : Object.values(snapshot)
  return values.filter((v): v is LegacySong => !!v && typeof v === 'object')
}
