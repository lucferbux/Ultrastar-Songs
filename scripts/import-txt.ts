// Imports songs from an UltraStar songs folder (one `.txt` per song) into Firestore `catalog/*`.
// Re-run it whenever you add songs to the game; existing songs are updated, not duplicated.
//
//   npm run import:txt -- "/path/to/UltraStar/songs" --dry-run
//   npm run import:txt -- "/path/to/UltraStar/songs"
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseUltrastarTxt } from '../src/lib/ultrastarTxt'
import type { SongData } from '../src/lib/types'
import { flag, upsertSongs } from './admin'

const root = process.argv[2]
if (!root || root.startsWith('--')) {
  console.error('usage: npm run import:txt -- <songs-folder> [--dry-run]')
  process.exit(1)
}

/** Song files are usually UTF-8, but older ones are Windows-1252. */
function decode(buffer: Buffer): string {
  const utf8 = new TextDecoder('utf-8').decode(buffer)
  return utf8.includes('�') ? new TextDecoder('windows-1252').decode(buffer) : utf8
}

const files = readdirSync(root, { recursive: true, encoding: 'utf8' })
  .filter((f) => f.toLowerCase().endsWith('.txt'))
  .map((f) => join(root, f))

const songs: SongData[] = []
const rejected: string[] = []
for (const file of files) {
  const parsed = parseUltrastarTxt(decode(readFileSync(file)))
  if (!parsed) {
    rejected.push(file)
    continue
  }
  // Covers are local files; uploading them to Storage is a later step.
  const { coverFile: _cover, ...song } = parsed
  songs.push(song)
}

console.log(`${files.length} .txt files, ${songs.length} songs, ${rejected.length} without #TITLE/#ARTIST`)
for (const file of rejected.slice(0, 10)) console.log(`  skipped: ${file}`)

await upsertSongs(songs, { dryRun: flag('dry-run') })
process.exit(0)
