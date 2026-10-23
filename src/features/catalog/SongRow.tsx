import type { Song } from '../../lib/types'
import { Cover } from '../../ui/art'
import { Icon } from '../../ui/Icon'

interface Props {
  song: Song
  favorite: boolean
  queued: boolean
  canQueue: boolean
  onToggleFavorite: () => void
  onQueue: () => void
}

export function SongRow({ song, favorite, queued, canQueue, onToggleFavorite, onQueue }: Props) {
  const meta = [song.duet ? 'Dúo' : null, song.language].filter(Boolean).join(' · ')
  return (
    <div className="row hoverable">
      <Cover src={song.coverUrl} seed={song.artist} />
      <div className="row-text">
        <div className="row-title">{song.title}</div>
        <div className="row-subtitle">
          {song.artist}
          {meta && <span className="muted"> · {meta}</span>}
        </div>
      </div>
      <span className="col col-genre">{song.genre ?? ''}</span>
      <span className="col col-year">{song.year ?? ''}</span>
      <div className="row-trailing">
        <button
          className={`icon-btn plain ${favorite ? 'on' : ''}`}
          aria-label={favorite ? 'Quitar de favoritas' : 'Añadir a favoritas'}
          aria-pressed={favorite}
          onClick={onToggleFavorite}
        >
          <Icon name="star" size={20} filled={favorite} />
        </button>
        {canQueue && (
          <button
            className={`icon-btn ${queued ? 'done' : 'tinted'}`}
            aria-label={queued ? 'Ya está en la cola' : 'Añadir a la cola'}
            disabled={queued}
            onClick={onQueue}
          >
            <Icon name={queued ? 'check' : 'plus'} size={18} strokeWidth={2.4} />
          </button>
        )}
      </div>
    </div>
  )
}
