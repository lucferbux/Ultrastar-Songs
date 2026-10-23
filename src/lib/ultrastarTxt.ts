import { normalizeGenre } from './genres'
import { normalizeLanguage } from './languages'
import type { SongData } from './types'

export interface ParsedTxt extends SongData {
  /** Cover file name relative to the song folder (`#COVER`), if any. */
  coverFile?: string
}

/**
 * Parses the header of an UltraStar song `.txt` file.
 * Returns null when the file has no `#TITLE` or `#ARTIST`.
 */
export function parseUltrastarTxt(content: string): ParsedTxt | null {
  const tags = new Map<string, string>()
  let duet = false

  for (const raw of content.replace(/^﻿/, '').split(/\r?\n/)) {
    const line = raw.trim()
    if (line.startsWith('#')) {
      const sep = line.indexOf(':')
      if (sep > 1) tags.set(line.slice(1, sep).trim().toUpperCase(), line.slice(sep + 1).trim())
    } else if (/^P\s*2\b/.test(line)) {
      duet = true
    }
  }

  const title = tags.get('TITLE')
  const artist = tags.get('ARTIST')
  if (!title || !artist) return null

  const year = Number.parseInt(tags.get('YEAR') ?? '', 10)
  const song: ParsedTxt = {
    title,
    artist,
    duet: duet || tags.has('P2') || tags.has('DUETSINGERP2'),
    tags: [],
    source: 'txt-import',
  }
  const rawGenre = tags.get('GENRE')
  const genre = normalizeGenre(rawGenre)
  if (rawGenre && genre && rawGenre !== genre) song.tags.push(rawGenre.toLowerCase())
  const optional = {
    genre,
    language: normalizeLanguage(tags.get('LANGUAGE')),
    edition: tags.get('EDITION'),
    coverFile: tags.get('COVER'),
  }
  for (const [key, value] of Object.entries(optional)) {
    if (value) song[key as keyof typeof optional] = value
  }
  if (Number.isFinite(year) && year > 0) song.year = year
  return song
}
