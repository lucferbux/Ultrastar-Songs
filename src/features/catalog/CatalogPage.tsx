import { useDeferredValue, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { pickRandom } from '../../lib/queue'
import { decadeOf, facet, searchSongs, type SongFilters } from '../../lib/search'
import type { Song } from '../../lib/types'
import { Empty, Loading } from '../../ui/Empty'
import { Icon } from '../../ui/Icon'
import { PageHeader } from '../../ui/PageHeader'
import { SearchField } from '../../ui/SearchField'
import { useToast } from '../../ui/toastContext'
import { useCurrentSession } from '../sessions/currentSessionContext'
import { useCatalog } from './catalogContext'
import { SongList } from './SongList'

/** A filter capsule backed by a native <select> (native pickers feel right on iOS and macOS). */
function PillSelect<T extends string | number>({
  label,
  value,
  options,
  format = String,
  onChange,
}: {
  label: string
  value: T | undefined
  options: T[]
  format?: (v: T) => string
  onChange: (v: T | undefined) => void
}) {
  return (
    <label className={`pill ${value !== undefined ? 'active' : ''}`}>
      {value !== undefined ? format(value) : label}
      <Icon name="chevronDown" size={13} strokeWidth={2.4} />
      <select
        aria-label={label}
        value={value ?? ''}
        onChange={(e) => {
          const raw = e.target.value
          const match = options.find((o) => String(o) === raw)
          onChange(match)
        }}
      >
        <option value="">Todos</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {format(o)}
          </option>
        ))}
      </select>
    </label>
  )
}

export function CatalogPage() {
  const { songs, index, loading, error } = useCatalog()
  const { session, queue } = useCurrentSession()
  const { show } = useToast()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<SongFilters>({})
  const [adding, setAdding] = useState<Song | null>(null)
  const deferredQuery = useDeferredValue(query)

  const genres = useMemo(() => facet(songs, 'genre'), [songs])
  const languages = useMemo(() => facet(songs, 'language'), [songs])
  const decades = useMemo(
    () => [...new Set(songs.map((s) => decadeOf(s.year)).filter((d): d is number => !!d))].sort(),
    [songs],
  )
  const results = useMemo(
    () => (index ? searchSongs(songs, index, deferredQuery, filters) : []),
    [songs, index, deferredQuery, filters],
  )

  const set = <K extends keyof SongFilters>(key: K, value: SongFilters[K]) => setFilters((f) => ({ ...f, [key]: value }))

  const surprise = () => {
    const song = pickRandom(results, queue)
    if (!song) return show('No hay canciones disponibles con estos filtros.')
    if (session) setAdding(song)
    else show(`🎲 ${song.title} — ${song.artist}`)
  }

  return (
    <>
      <PageHeader
        title="Canciones"
        subtitle={
          session ? (
            <Link to={`/s/${session.id}`}>
              <Icon name="mic" size={14} /> Añadiendo a {session.name}
            </Link>
          ) : (
            `${songs.length} canciones para cantar`
          )
        }
        actions={
          <button className="icon-btn tinted" aria-label="Sorpréndeme" title="Sorpréndeme" onClick={surprise}>
            <Icon name="shuffle" size={19} />
          </button>
        }
      >
        <SearchField value={query} onChange={setQuery} placeholder="Título, artista, género…" />
        <div className="pill-row">
          <PillSelect label="Género" value={filters.genre} options={genres} onChange={(v) => set('genre', v)} />
          <PillSelect
            label="Década"
            value={filters.decade}
            options={decades}
            format={(d) => `${String(d).slice(2)}s`}
            onChange={(v) => set('decade', v)}
          />
          {languages.length > 0 && (
            <PillSelect label="Idioma" value={filters.language} options={languages} onChange={(v) => set('language', v)} />
          )}
          <button
            className={`pill ${filters.duetOnly ? 'active' : ''}`}
            aria-pressed={!!filters.duetOnly}
            onClick={() => set('duetOnly', !filters.duetOnly || undefined)}
          >
            <Icon name="people" size={15} /> Dúos
          </button>
        </div>
      </PageHeader>

      {!session && !loading && (
        <Link to="/sessions" className="row link list" style={{ margin: '12px 0 4px' }}>
          <span className="icon-btn filled">
            <Icon name="mic" size={18} />
          </span>
          <span className="row-text">
            <span className="row-title">Únete a la sesión de hoy</span>
            <span className="row-subtitle">Para apuntarte a la cola de canciones</span>
          </span>
          <Icon name="chevronRight" size={16} className="muted" />
        </Link>
      )}

      {error && <p className="error-text">No se pudo cargar el catálogo: {error}</p>}
      {loading ? (
        <Loading />
      ) : results.length === 0 ? (
        <Empty icon="search" title="Sin resultados">
          Prueba con otra búsqueda o quita algún filtro.
        </Empty>
      ) : (
        <section className="section" style={{ marginTop: 12 }}>
          <div className="section-header">
            <span className="muted" style={{ fontSize: 13 }}>
              {results.length} {results.length === 1 ? 'canción' : 'canciones'}
            </span>
          </div>
          <SongList songs={results} adding={adding} onAddingChange={setAdding} />
        </section>
      )}
    </>
  )
}
