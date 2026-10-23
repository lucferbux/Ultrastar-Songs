import { useEffect, useState, type ReactNode } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { buildIndex } from '../../lib/search'
import type { SongData } from '../../lib/types'
import { CatalogContext, type CatalogState } from './catalogContext'

/** Loads the whole catalog once (then from the offline cache) and indexes it for search. */
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CatalogState>({
    songs: [],
    byId: new Map(),
    index: null,
    loading: true,
    error: null,
  })

  useEffect(
    () =>
      onSnapshot(
        collection(db, 'catalog'),
        (snap) => {
          const songs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as SongData) }))
          setState({
            songs,
            byId: new Map(songs.map((s) => [s.id, s])),
            index: buildIndex(songs),
            loading: false,
            error: null,
          })
        },
        (error) => setState((s) => ({ ...s, loading: false, error: error.message })),
      ),
    [],
  )

  return <CatalogContext.Provider value={state}>{children}</CatalogContext.Provider>
}
