import { useDeferredValue, useMemo, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router'
import { deleteSong, saveSong } from '../../lib/catalogApi'
import { GENRES } from '../../lib/genres'
import { searchSongs } from '../../lib/search'
import type { Song, SongData } from '../../lib/types'
import { Cover } from '../../ui/art'
import { Empty } from '../../ui/Empty'
import { Icon } from '../../ui/Icon'
import { PageHeader } from '../../ui/PageHeader'
import { SearchField } from '../../ui/SearchField'
import { Sheet } from '../../ui/Sheet'
import { useToast } from '../../ui/toastContext'
import { useUser } from '../auth/authContext'
import { useCatalog } from '../catalog/catalogContext'

const LIMIT = 100

function EditSongSheet({ song, onClose }: { song: Song | null; onClose: () => void }) {
  const { run } = useToast()
  const [form, setForm] = useState<SongData>(
    song ?? { title: '', artist: '', duet: false, tags: [], source: 'manual' },
  )
  const [saving, setSaving] = useState(false)
  const set = <K extends keyof SongData>(key: K, value: SongData[K]) => setForm((f) => ({ ...f, [key]: value }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    const { id: _id, ...data } = form as Song
    const ok = await run(saveSong(data, song ?? undefined), song ? 'Canción guardada' : 'Canción añadida')
    setSaving(false)
    if (ok) onClose()
  }

  const remove = async () => {
    if (!song) return
    const ok = await run(deleteSong(song.id).then(() => true), 'Canción borrada')
    if (ok) onClose()
  }

  const text = (key: 'title' | 'artist' | 'language' | 'edition' | 'coverUrl', label: string, required = false) => (
    <label className="field">
      <span className="field-label">{label}</span>
      <input className="input" required={required} value={form[key] ?? ''} onChange={(e) => set(key, e.target.value)} />
    </label>
  )

  return (
    <Sheet title={song ? 'Editar canción' : 'Nueva canción'} onClose={onClose}>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        {text('title', 'Título', true)}
        {text('artist', 'Artista', true)}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 12 }}>
          <label className="field">
            <span className="field-label">Género</span>
            <select className="input" value={form.genre ?? ''} onChange={(e) => set('genre', e.target.value || undefined)}>
              <option value="">—</option>
              {GENRES.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Año</span>
            <input
              className="input"
              inputMode="numeric"
              value={form.year ?? ''}
              onChange={(e) => set('year', Number.parseInt(e.target.value, 10) || undefined)}
            />
          </label>
        </div>
        {text('language', 'Idioma')}
        {text('coverUrl', 'URL de la portada')}
        <div className="row compact" style={{ padding: '0 4px' }}>
          <span className="row-text">Dúo</span>
          <button
            type="button"
            role="switch"
            aria-checked={form.duet}
            aria-label="Dúo"
            className="switch"
            onClick={() => set('duet', !form.duet)}
          />
        </div>
        <div className="sheet-actions">
          {song && (
            <button type="button" className="btn btn-destructive" onClick={remove}>
              <Icon name="trash" size={17} /> Borrar
            </button>
          )}
          <button className="btn btn-filled" disabled={saving}>
            Guardar
          </button>
        </div>
      </form>
    </Sheet>
  )
}

export default function AdminPage() {
  const { profile } = useUser()
  const { songs, index } = useCatalog()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Song | null | undefined>(undefined)
  const deferred = useDeferredValue(query)
  const results = useMemo(() => (index ? searchSongs(songs, index, deferred, {}) : []), [songs, index, deferred])
  const missing = useMemo(
    () => ({
      genre: songs.filter((s) => !s.genre).length,
      cover: songs.filter((s) => !s.coverUrl).length,
      language: songs.filter((s) => !s.language).length,
    }),
    [songs],
  )

  if (profile && profile.role !== 'admin') return <Navigate to="/profile" replace />

  return (
    <>
      <PageHeader
        title="Catálogo"
        subtitle={`${songs.length} canciones · sin género ${missing.genre} · sin portada ${missing.cover} · sin idioma ${missing.language}`}
        actions={
          <button className="icon-btn filled" aria-label="Añadir canción" onClick={() => setEditing(null)}>
            <Icon name="plus" size={18} strokeWidth={2.4} />
          </button>
        }
      >
        <SearchField value={query} onChange={setQuery} placeholder="Buscar para editar" />
      </PageHeader>

      {results.length === 0 ? (
        <Empty icon="search" title="Sin resultados" />
      ) : (
        <section className="section" style={{ marginTop: 16 }}>
          <div className="list">
            {results.slice(0, LIMIT).map((song) => (
              <button key={song.id} className="row link" style={{ width: '100%', textAlign: 'left' }} onClick={() => setEditing(song)}>
                <Cover src={song.coverUrl} seed={song.artist} />
                <div className="row-text">
                  <div className="row-title">{song.title}</div>
                  <div className="row-subtitle">
                    {song.artist} · {song.genre ?? 'sin género'}
                    {song.year ? ` · ${song.year}` : ''}
                  </div>
                </div>
                <Icon name="chevronRight" size={16} className="muted" />
              </button>
            ))}
          </div>
          {results.length > LIMIT && <p className="section-footer">Mostrando {LIMIT} de {results.length}. Afina la búsqueda.</p>}
        </section>
      )}

      {editing !== undefined && <EditSongSheet song={editing} onClose={() => setEditing(undefined)} />}
    </>
  )
}
