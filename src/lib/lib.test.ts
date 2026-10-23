import { describe, expect, it } from 'vitest'
import { songId } from './songId'
import { parseUltrastarTxt } from './ultrastarTxt'
import { legacyRecords, mapLegacySong, unmappedKeys } from './legacyMapping'
import { normalizeGenre } from './genres'
import { normalizeLanguage } from './languages'
import {
  fairOrder,
  generateJoinCode,
  isQueued,
  moveUpdates,
  nextOrder,
  normalizeJoinCode,
  pickRandom,
  splitQueue,
  turnFor,
} from './queue'
import type { QueueItem, QueueStatus } from './types'

describe('songId', () => {
  it('is stable across casing, accents and punctuation', () => {
    expect(songId('Mägo de Oz', '¡Fiesta Pagana!')).toBe('mago-de-oz--fiesta-pagana')
    expect(songId('MAGO DE OZ', 'fiesta pagana')).toBe('mago-de-oz--fiesta-pagana')
    expect(songId('Simon & Garfunkel', 'The Boxer')).toBe('simon-and-garfunkel--the-boxer')
  })
})

describe('parseUltrastarTxt', () => {
  const header = [
    '﻿#TITLE:Bohemian Rhapsody',
    '#ARTIST:Queen',
    '#LANGUAGE:English',
    '#GENRE:Rock',
    '#YEAR:1975',
    '#EDITION:SingStar Queen',
    '#COVER:Queen - Bohemian Rhapsody [CO].jpg',
    '#BPM:286',
    ': 0 4 12 Is ',
    'E',
  ].join('\r\n')

  it('reads the header tags', () => {
    expect(parseUltrastarTxt(header)).toEqual({
      title: 'Bohemian Rhapsody',
      artist: 'Queen',
      language: 'Inglés',
      genre: 'Rock',
      year: 1975,
      edition: 'SingStar Queen',
      coverFile: 'Queen - Bohemian Rhapsody [CO].jpg',
      duet: false,
      tags: [],
      source: 'txt-import',
    })
  })

  it('detects duets', () => {
    const duet = '#TITLE:Islands in the Stream\n#ARTIST:Dolly Parton\nP1\n: 0 2 3 Ba\nP2\n: 4 2 3 by\nE'
    expect(parseUltrastarTxt(duet)?.duet).toBe(true)
  })

  it('rejects files without title or artist', () => {
    expect(parseUltrastarTxt('#TITLE:Only title')).toBeNull()
  })
})

describe('normalizeGenre', () => {
  it('collapses variants into canonical genres', () => {
    expect(normalizeGenre('Jrock')).toBe('Anime y pop asiático')
    expect(normalizeGenre('ROCK ALTERNATIVE')).toBe('Indie y alternativo')
    expect(normalizeGenre('Hardrock')).toBe('Rock')
    expect(normalizeGenre('Pop Punk')).toBe('Punk')
    expect(normalizeGenre('Pop latino')).toBe('Latino')
    expect(normalizeGenre('Trash Metal')).toBe('Metal')
    expect(normalizeGenre('Bandas sonoras')).toBe('Bandas sonoras')
    expect(normalizeGenre('Pop')).toBe('Pop')
    expect(normalizeGenre('Sea shanty')).toBe('Otros')
  })

  it('drops placeholders', () => {
    expect(normalizeGenre('-')).toBeUndefined()
    expect(normalizeGenre('Other')).toBeUndefined()
    expect(normalizeGenre(undefined)).toBeUndefined()
  })
})

describe('normalizeLanguage', () => {
  it('maps English and Spanish names to Spanish labels', () => {
    expect(normalizeLanguage('English')).toBe('Inglés')
    expect(normalizeLanguage('ESPAÑOL')).toBe('Español')
    expect(normalizeLanguage('swedish')).toBe('Swedish')
    expect(normalizeLanguage('')).toBeUndefined()
  })
})

describe('legacy mapping', () => {
  it('maps the legacy capitalised fields', () => {
    expect(mapLegacySong({ Title: ' Thriller ', Artist: 'Michael Jackson', Genre: 'Pop', Year: '1982' })).toEqual({
      title: 'Thriller',
      artist: 'Michael Jackson',
      genre: 'Pop',
      year: 1982,
      duet: false,
      tags: [],
      source: 'legacy',
    })
  })

  it('normalises the genre and keeps the original as a tag', () => {
    const song = mapLegacySong({ Title: 'Smells Like Teen Spirit', Artist: 'Nirvana', Genre: 'Grunge', Year: '1991' })
    expect(song?.genre).toBe('Indie y alternativo')
    expect(song?.tags).toEqual(['grunge'])
    expect(mapLegacySong({ Title: 'a', Artist: 'b', Genre: 'Dueto' })?.duet).toBe(true)
  })

  it('drops incomplete records and reports unknown keys', () => {
    expect(mapLegacySong({ Title: 'No artist' })).toBeNull()
    expect(mapLegacySong({ Title: 'a', Artist: 'b', Genre: '-', Year: '-' })).toEqual({
      title: 'a',
      artist: 'b',
      duet: false,
      tags: [],
      source: 'legacy',
    })
    expect(unmappedKeys([{ Title: 'a', Artist: 'b', Mp3: 'x.mp3' }])).toEqual(['Mp3'])
  })

  it('accepts array or object snapshots', () => {
    expect(legacyRecords([null, { Title: 'a' }])).toHaveLength(1)
    expect(legacyRecords({ k1: { Title: 'a' }, k2: { Title: 'b' } })).toHaveLength(2)
    expect(legacyRecords(null)).toEqual([])
  })
})

describe('queue', () => {
  const item = (id: string, order: number, status: QueueStatus = 'pending', song = id): QueueItem => ({
    id,
    songId: song,
    song: { title: id, artist: 'x', duet: false },
    singers: [],
    addedBy: 'u1',
    order,
    status,
  })
  const items = [item('c', 3), item('a', 1, 'done'), item('b', 2, 'singing'), item('d', 4), item('e', 5, 'skipped')]

  it('splits by status in order', () => {
    const { singing, upcoming, finished } = splitQueue(items)
    expect(singing.map((i) => i.id)).toEqual(['b'])
    expect(upcoming.map((i) => i.id)).toEqual(['c', 'd'])
    expect(finished.map((i) => i.id)).toEqual(['e', 'a'])
  })

  it('detects active duplicates only', () => {
    expect(isQueued(items, 'c')).toBe(true)
    expect(isQueued(items, 'a')).toBe(false)
  })

  it('appends after the last item', () => {
    expect(nextOrder(items)).toBe(6)
    expect(nextOrder([])).toBe(1)
  })

  it('swaps orders with the neighbouring pending item', () => {
    expect(moveUpdates(items, 'd', -1)).toEqual([
      { id: 'd', order: 3 },
      { id: 'c', order: 4 },
    ])
    expect(moveUpdates(items, 'c', -1)).toEqual([])
    expect(moveUpdates(items, 'b', 1)).toEqual([])
  })

  it('rotates turns fairly, least-recent singers first', () => {
    const by = (id: string, order: number, who: string, status: QueueStatus = 'pending'): QueueItem => ({
      ...item(id, order, status),
      singers: [{ uid: who, name: who }],
    })
    const q = [
      by('done-ana', 1, 'ana', 'done'),
      by('ana1', 2, 'ana'),
      by('ana2', 3, 'ana'),
      by('bob1', 4, 'bob'),
      by('ana3', 5, 'ana'),
      by('cat1', 6, 'cat'),
    ]
    const updates = new Map(fairOrder(q).map((u) => [u.id, u.order]))
    const ordered = q
      .filter((i) => i.status === 'pending')
      .map((i) => ({ id: i.id, order: updates.get(i.id) ?? i.order }))
      .sort((a, b) => a.order - b.order)
      .map((i) => i.id)
    // bob and cat haven't sung yet, so they go before ana; ana keeps her own order.
    expect(ordered).toEqual(['bob1', 'cat1', 'ana1', 'ana2', 'ana3'])
    expect(fairOrder([by('x', 1, 'ana'), by('y', 2, 'bob')])).toEqual([])
  })

  it('picks a random song that is not queued', () => {
    expect(pickRandom([{ id: 'c' }, { id: 'z' }], items, () => 0)).toEqual({ id: 'z' })
    expect(pickRandom([{ id: 'c' }], items)).toBeUndefined()
  })

  it('tells me when it is my turn', () => {
    const mine = { ...item('m', 9), singers: [{ uid: 'me', name: 'Me' }] }
    expect(turnFor([mine], 'me')).toEqual({ kind: 'next', item: mine })
    expect(turnFor([{ ...mine, status: 'singing' }], 'me')?.kind).toBe('now')
    expect(turnFor([item('a', 1), mine], 'me')).toBeNull()
  })

  it('generates and normalises join codes', () => {
    expect(generateJoinCode()).toMatch(/^[A-Z2-9]{6}$/)
    expect(normalizeJoinCode(' ab-c d3e9x ')).toBe('ABCD3E')
  })
})
