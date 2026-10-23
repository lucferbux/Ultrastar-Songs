import { deleteDoc, doc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore'
import { db } from './firebase'
import { songId } from './songId'
import type { Song, SongData } from './types'

const ref = (id: string) => doc(db, 'catalog', id)

/** Drops empty optional fields so Firestore doesn't store `undefined`/empty strings. */
function clean(song: SongData): SongData {
  return Object.fromEntries(Object.entries(song).filter(([, v]) => v !== undefined && v !== '')) as unknown as SongData
}

/**
 * Creates or updates a song. The id derives from artist + title, so renaming either moves the
 * document to its new id in one batch. Returns the id the song ends up with.
 */
export async function saveSong(song: SongData, previous?: Song): Promise<string> {
  const id = songId(song.artist, song.title)
  const data = { ...clean(song), updatedAt: serverTimestamp() }
  if (!previous) {
    await setDoc(ref(id), { ...data, addedAt: serverTimestamp() })
  } else if (previous.id === id) {
    await setDoc(ref(id), data)
  } else {
    const batch = writeBatch(db)
    batch.set(ref(id), { ...data, addedAt: serverTimestamp() })
    batch.delete(ref(previous.id))
    await batch.commit()
  }
  return id
}

export const deleteSong = (id: string) => deleteDoc(ref(id))
