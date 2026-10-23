import { createContext, useContext } from 'react'
import type MiniSearch from 'minisearch'
import type { Song } from '../../lib/types'

export interface CatalogState {
  songs: Song[]
  byId: Map<string, Song>
  index: MiniSearch<Song> | null
  loading: boolean
  error: string | null
}

export const CatalogContext = createContext<CatalogState>({
  songs: [],
  byId: new Map(),
  index: null,
  loading: true,
  error: null,
})

export const useCatalog = () => useContext(CatalogContext)
