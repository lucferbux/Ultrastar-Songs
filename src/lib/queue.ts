import type { QueueItem, QueueStatus } from './types'

const ACTIVE: QueueStatus[] = ['singing', 'pending']

/** Splits a session queue into what's on now, what's next and what's already done. */
export function splitQueue(items: QueueItem[]) {
  const byOrder = [...items].sort((a, b) => a.order - b.order)
  return {
    singing: byOrder.filter((i) => i.status === 'singing'),
    upcoming: byOrder.filter((i) => i.status === 'pending'),
    finished: byOrder.filter((i) => i.status === 'done' || i.status === 'skipped').reverse(),
  }
}

/** True if the song is already waiting or being sung in this session. */
export function isQueued(items: QueueItem[], songId: string): boolean {
  return items.some((i) => i.songId === songId && ACTIVE.includes(i.status))
}

/** Order value that places a new item after every existing one. */
export function nextOrder(items: QueueItem[]): number {
  return items.reduce((max, i) => Math.max(max, i.order), 0) + 1
}

/**
 * Items whose `order` must change to move `id` one step up or down among the pending items.
 * Returns the two swapped orders, or an empty list when the move isn't possible.
 */
export function moveUpdates(
  items: QueueItem[],
  id: string,
  direction: -1 | 1,
): { id: string; order: number }[] {
  const { upcoming } = splitQueue(items)
  const index = upcoming.findIndex((i) => i.id === id)
  const target = upcoming[index + direction]
  if (index < 0 || !target) return []
  const current = upcoming[index]
  return [
    { id: current.id, order: target.order },
    { id: target.id, order: current.order },
  ]
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O, 1/I

export function generateJoinCode(random: () => number = Math.random): string {
  return Array.from({ length: 6 }, () => CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)]).join('')
}

export function normalizeJoinCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
}

/** Link encoded in the session QR code. */
export const joinUrl = (code: string) => `${window.location.origin}/join/${code}`

/** Who a queue item belongs to for turn-taking: the first singer, else whoever added it. */
const personOf = (item: QueueItem) => item.singers[0]?.uid ?? item.addedBy

/**
 * Round-robin reorder of the pending items so nobody sings twice before everyone else has had
 * a turn. People who sang longest ago (or never) go first; each person keeps their own order.
 * Returns only the items whose `order` changes.
 */
export function fairOrder(items: QueueItem[]): { id: string; order: number }[] {
  const { upcoming, finished } = splitQueue(items)
  const queues = new Map<string, QueueItem[]>()
  for (const item of upcoming) queues.set(personOf(item), [...(queues.get(personOf(item)) ?? []), item])

  // finished is newest-first, so a lower index means they sang more recently.
  const lastSang = (person: string) => {
    const i = finished.findIndex((f) => personOf(f) === person)
    return i < 0 ? Infinity : i
  }
  const people = [...queues.keys()].sort((a, b) => lastSang(b) - lastSang(a))

  const sequence: QueueItem[] = []
  while (sequence.length < upcoming.length) {
    for (const person of people) {
      const next = queues.get(person)!.shift()
      if (next) sequence.push(next)
    }
  }

  const slots = upcoming.map((i) => i.order) // already ascending
  return sequence
    .map((item, i) => ({ id: item.id, order: slots[i] }))
    .filter((u, i) => u.order !== sequence[i].order)
}

/** A random song from `songs` that isn't already waiting in the queue. */
export function pickRandom<T extends { id: string }>(songs: T[], queue: QueueItem[], random = Math.random): T | undefined {
  const candidates = songs.filter((s) => !isQueued(queue, s.id))
  return candidates[Math.floor(random() * candidates.length)]
}

/** The current user's position relative to the queue, for the "it's your turn" banner. */
export function turnFor(items: QueueItem[], uid: string): { kind: 'now' | 'next'; item: QueueItem } | null {
  const { singing, upcoming } = splitQueue(items)
  const sings = (i?: QueueItem) => !!i?.singers.some((s) => s.uid === uid)
  const now = singing.find(sings)
  if (now) return { kind: 'now', item: now }
  if (sings(upcoming[0])) return { kind: 'next', item: upcoming[0] }
  return null
}
