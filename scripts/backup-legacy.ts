// Downloads the legacy Firestore `songs` collection (written by the old apps, capitalised fields,
// random ids) to a local JSON file, keyed by document id. Read-only; uses the public REST API, so
// it only works while the legacy rules allow public reads.
//
//   npm run backup:legacy            # → backups/legacy-songs.json
import { mkdirSync, writeFileSync } from 'node:fs'

const PROJECT = 'ultrastar-songs'
const COLLECTION = process.argv[2] ?? 'songs'
const OUT = `backups/legacy-${COLLECTION}.json`
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/${COLLECTION}`

type RestValue = Record<string, unknown>

/** Converts a Firestore REST typed value (`{ stringValue: 'x' }`) into plain JSON. */
function plain(value: RestValue): unknown {
  const [type, inner] = Object.entries(value)[0] ?? []
  switch (type) {
    case 'integerValue':
      return Number(inner)
    case 'nullValue':
      return null
    case 'arrayValue':
      return ((inner as { values?: RestValue[] }).values ?? []).map(plain)
    case 'mapValue':
      return fields((inner as { fields?: Record<string, RestValue> }).fields)
    default:
      return inner // string, boolean, double, timestamp (ISO string), reference…
  }
}

const fields = (f: Record<string, RestValue> = {}) =>
  Object.fromEntries(Object.entries(f).map(([k, v]) => [k, plain(v)]))

const docs: Record<string, unknown> = {}
let pageToken: string | undefined
do {
  const url = `${BASE}?pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  const page = (await res.json()) as {
    documents?: { name: string; fields?: Record<string, RestValue> }[]
    nextPageToken?: string
  }
  for (const d of page.documents ?? []) docs[d.name.split('/').pop()!] = fields(d.fields)
  pageToken = page.nextPageToken
} while (pageToken)

mkdirSync('backups', { recursive: true })
writeFileSync(OUT, JSON.stringify(docs, null, 2))
console.log(`${Object.keys(docs).length} documents → ${OUT}`)
