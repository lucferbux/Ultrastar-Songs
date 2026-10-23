import { useLayoutEffect, useRef, useState } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { isQueued } from '../../lib/queue'
import type { Song } from '../../lib/types'
import { usePlatform } from '../../ui/platform'
import { useToast } from '../../ui/toastContext'
import { useUser } from '../auth/authContext'
import { useFavorites } from '../favorites/useFavorites'
import { AddToQueueSheet } from '../sessions/AddToQueueSheet'
import { useCurrentSession } from '../sessions/currentSessionContext'
import { SongRow } from './SongRow'

interface Props {
  songs: Song[]
  /** Song to open the add-to-queue sheet for (e.g. from "Sorpréndeme"). */
  adding?: Song | null
  onAddingChange?: (song: Song | null) => void
}

/** Virtualised grouped list of songs with favourite and add-to-queue actions. */
export function SongList({ songs, adding: controlled, onAddingChange }: Props) {
  const { user } = useUser()
  const { run } = useToast()
  const { ids: favorites, toggle } = useFavorites(user.uid)
  const { session, queue } = useCurrentSession()
  const [localAdding, setLocalAdding] = useState<Song | null>(null)
  const adding = controlled !== undefined ? controlled : localAdding
  const setAdding = onAddingChange ?? setLocalAdding

  const listRef = useRef<HTMLDivElement>(null)
  const [scrollMargin, setScrollMargin] = useState(0)
  // The list's distance from the top of the page changes as banners/filters above it change,
  // so measure after every render; the equality check stops it from looping.
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const top = listRef.current ? listRef.current.getBoundingClientRect().top + window.scrollY : 0
    if (top !== scrollMargin) setScrollMargin(top)
  })

  const rowHeight = usePlatform() === 'macos' ? 44 : 60
  const virtualizer = useWindowVirtualizer({
    count: songs.length,
    estimateSize: () => rowHeight,
    overscan: 12,
    scrollMargin,
  })

  return (
    <>
      {songs.length > 0 && (
        <div ref={listRef} className="list" style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
          {virtualizer.getVirtualItems().map((row) => {
            const song = songs[row.index]
            return (
              <div
                key={song.id}
                className="virtual-row"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: row.size,
                  transform: `translateY(${row.start - virtualizer.options.scrollMargin}px)`,
                }}
              >
                <SongRow
                  song={song}
                  favorite={favorites.has(song.id)}
                  queued={isQueued(queue, song.id)}
                  canQueue={!!session}
                  onToggleFavorite={() => void run(toggle(song.id))}
                  onQueue={() => setAdding(song)}
                />
              </div>
            )
          })}
        </div>
      )}
      {adding && <AddToQueueSheet song={adding} onClose={() => setAdding(null)} />}
    </>
  )
}
