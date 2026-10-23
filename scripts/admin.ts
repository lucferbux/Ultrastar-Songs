// Shared firebase-admin setup for the data scripts.
//
// Production: your own Google account via an isolated gcloud profile (`npm run auth:admin` once),
//             or GOOGLE_APPLICATION_CREDENTIALS pointing at any other credentials file.
// Emulators:  run inside `firebase emulators:exec` or export FIRESTORE_EMULATOR_HOST=127.0.0.1:8080.
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { applicationDefault, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import type { SongData } from '../src/lib/types'
import { songId } from '../src/lib/songId'

export const usingEmulator = !!process.env.FIRESTORE_EMULATOR_HOST

// Kept apart from the default gcloud profile so personal and work credentials never mix.
const PROFILE_CREDENTIALS = join(homedir(), '.config/gcloud-ultrastar/application_default_credentials.json')
if (!usingEmulator && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  if (!existsSync(PROFILE_CREDENTIALS)) {
    console.error('No credentials. Run `npm run auth:admin` once (signs in with your Google account).')
    process.exit(1)
  }
  process.env.GOOGLE_APPLICATION_CREDENTIALS = PROFILE_CREDENTIALS
}

export const app = usingEmulator
  ? initializeApp({ projectId: 'demo-ultrastar' })
  : initializeApp({
      credential: applicationDefault(),
      projectId: 'ultrastar-songs',
    })

export const firestore = getFirestore(app)

export function flag(name: string): boolean {
  return process.argv.includes(`--${name}`)
}

export function option(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

/**
 * Upserts songs by stable id. New songs get `addedAt`; existing ones keep their `tags`
 * and any field the import doesn't provide (e.g. a cover or language added by an admin).
 */
export async function upsertSongs(songs: SongData[], { dryRun }: { dryRun: boolean }) {
  const byId = new Map<string, SongData>()
  let duplicates = 0
  for (const song of songs) {
    const id = songId(song.artist, song.title)
    if (byId.has(id)) duplicates++
    byId.set(id, song)
  }

  const col = firestore.collection('catalog')
  const existing = new Set((await col.listDocuments()).map((d) => d.id))
  const created = [...byId.keys()].filter((id) => !existing.has(id)).length

  console.log(`target: ${usingEmulator ? 'emulator' : 'production'} Firestore`)
  console.log(`${byId.size} unique songs (${duplicates} duplicates merged): ${created} new, ${byId.size - created} updated`)
  if (dryRun) {
    console.log('dry run — nothing written. Sample:', [...byId.entries()].slice(0, 3))
    return
  }

  const writer = firestore.bulkWriter()
  for (const [id, song] of byId) {
    const ref = col.doc(id)
    if (existing.has(id)) {
      const { tags: _tags, ...rest } = song
      void writer.set(ref, { ...rest, updatedAt: FieldValue.serverTimestamp() }, { merge: true })
    } else {
      void writer.set(ref, { ...song, addedAt: FieldValue.serverTimestamp() })
    }
  }
  await writer.close()
  console.log('done.')
}
