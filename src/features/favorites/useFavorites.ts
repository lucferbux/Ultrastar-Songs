import { useCallback, useEffect, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'

/** Live set of song ids the user wants to sing, plus a toggle. */
export function useFavorites(uid: string) {
  const [ids, setIds] = useState<Set<string>>(new Set())

  useEffect(
    () => onSnapshot(collection(db, 'users', uid, 'favorites'), (snap) => setIds(new Set(snap.docs.map((d) => d.id)))),
    [uid],
  )

  const toggle = useCallback(
    (songId: string) => {
      const ref = doc(db, 'users', uid, 'favorites', songId)
      return ids.has(songId) ? deleteDoc(ref) : setDoc(ref, { addedAt: serverTimestamp() })
    },
    [ids, uid],
  )

  return { ids, toggle }
}
