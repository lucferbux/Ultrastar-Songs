// Exports the app's data to backups/<date>/ (git-ignored). The Spark plan has no managed
// backups, so run this now and then — before migrations and after a big night.
//
//   npm run backup
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { firestore, usingEmulator } from './admin'

const dir = join('backups', `${new Date().toISOString().slice(0, 10)}${usingEmulator ? '-emulator' : ''}`)
mkdirSync(dir, { recursive: true })

const plain = (value: unknown): unknown =>
  JSON.parse(JSON.stringify(value, (_k, v) => (v && typeof v.toDate === 'function' ? v.toDate().toISOString() : v)))

async function dump(name: string, read: () => Promise<Record<string, unknown>>) {
  const data = await read()
  writeFileSync(join(dir, `${name}.json`), JSON.stringify(plain(data), null, 2))
  console.log(`${name}: ${Object.keys(data).length} → ${join(dir, `${name}.json`)}`)
}

await dump('catalog', async () => {
  const snap = await firestore.collection('catalog').get()
  return Object.fromEntries(snap.docs.map((d) => [d.id, d.data()]))
})

await dump('sessions', async () => {
  const snap = await firestore.collection('sessions').get()
  const entries = await Promise.all(
    snap.docs.map(async (d) => {
      const queue = await d.ref.collection('queue').get()
      return [d.id, { ...d.data(), queue: Object.fromEntries(queue.docs.map((q) => [q.id, q.data()])) }] as const
    }),
  )
  return Object.fromEntries(entries)
})

process.exit(0)
