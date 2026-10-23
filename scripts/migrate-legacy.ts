// Copies the legacy Firestore `songs` collection (old apps: capitalised fields, random ids) into
// the new `catalog` collection. The legacy collection is only read, never modified.
// Idempotent: ids are `artist--title`, so re-running updates the same documents.
//
//   npm run migrate -- --dry-run                                 # read live `songs`, show the plan
//   npm run migrate                                              # read live `songs`, write `catalog`
//   npm run migrate -- --from-file backups/legacy-songs.json     # use the backup instead (npm run backup:legacy)
import { readFileSync } from 'node:fs'
import { legacyRecords, mapLegacySong, unmappedKeys, type LegacySong } from '../src/lib/legacyMapping'
import type { SongData } from '../src/lib/types'
import { firestore, flag, option, upsertSongs, usingEmulator } from './admin'

async function loadRecords(): Promise<LegacySong[]> {
  const file = option('from-file')
  if (file) return legacyRecords(JSON.parse(readFileSync(file, 'utf8')))
  if (usingEmulator) throw new Error('With the emulator, pass --from-file (e.g. scripts/fixtures/sample-songs.json).')
  const snap = await firestore.collection('songs').get()
  return snap.docs.map((d) => d.data())
}

const records = await loadRecords()
const songs = records.map(mapLegacySong).filter((s): s is SongData => s !== null)

console.log(`${records.length} legacy records, ${records.length - songs.length} skipped (missing title/artist)`)
const extra = unmappedKeys(records)
if (extra.length) console.log(`fields not carried over: ${extra.join(', ')} — extend src/lib/legacyMapping.ts if useful`)

await upsertSongs(songs, { dryRun: flag('dry-run') })
process.exit(0)
