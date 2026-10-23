// Fills `coverUrl` / `coverLargeUrl` for catalog songs using Deezer's public search API (no key).
// Songs without a match get `coverChecked: true` so later runs skip them (use --retry-misses).
//
//   npm run covers -- --dry-run --limit 20
//   npm run covers
import { slugify } from '../src/lib/songId'
import { firestore, flag, option } from './admin'

interface DeezerTrack {
  title: string
  artist: { name: string }
  album: { cover_medium: string; cover_xl: string }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function search(q: string): Promise<DeezerTrack[]> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`https://api.deezer.com/search?limit=5&q=${encodeURIComponent(q)}`)
    const body = (await res.json()) as { data?: DeezerTrack[]; error?: { code: number } }
    if (body.error?.code === 4) {
      await sleep(5000) // quota exceeded: 50 requests / 5 s
      continue
    }
    return body.data ?? []
  }
  return []
}

const STOP = new Set(['the', 'and', 'los', 'las', 'feat', 'ft', 'con', 'with', 'band'])
const words = (s: string) => new Set(slugify(s).split('-').filter((w) => w.length >= 3 && !STOP.has(w)))

/** Artists must share a meaningful word ("30 Seconds To Mars" ≈ "Thirty Seconds To Mars"). */
function sameArtist(a: string, b: string): boolean {
  if (slugify(a) === slugify(b)) return true
  const wb = words(b)
  return [...words(a)].some((w) => wb.has(w))
}

async function findCover(artist: string, title: string) {
  const strict = await search(`artist:"${artist}" track:"${title}"`)
  const loose = strict.length ? strict : await search(`${artist} ${title}`)
  const hit = loose.find((t) => sameArtist(artist, t.artist.name))
  return hit ? { coverUrl: hit.album.cover_medium, coverLargeUrl: hit.album.cover_xl } : null
}

const dryRun = flag('dry-run')
const limit = Number(option('limit') ?? Infinity)
const snap = await firestore.collection('catalog').get()
const todo = snap.docs
  .filter((d) => !d.get('coverUrl') && (flag('retry-misses') || !d.get('coverChecked')))
  .slice(0, limit)

console.log(`${snap.size} songs, ${todo.length} without cover${dryRun ? ' (dry run)' : ''}`)
const writer = firestore.bulkWriter()
let found = 0
for (const [i, d] of todo.entries()) {
  const { artist, title } = d.data() as { artist: string; title: string }
  const cover = await findCover(artist, title).catch(() => null)
  if (cover) found++
  if (dryRun) console.log(`${cover ? '✓' : '·'} ${artist} — ${title}${cover ? ` → ${cover.coverUrl}` : ''}`)
  else void writer.update(d.ref, cover ?? { coverChecked: true })
  if (!dryRun && (i + 1) % 50 === 0) console.log(`${i + 1}/${todo.length} (${found} found)`)
  await sleep(220) // stay under Deezer's 50 requests / 5 s
}
await writer.close()
console.log(`done: ${found}/${todo.length} covers found`)
process.exit(0)
