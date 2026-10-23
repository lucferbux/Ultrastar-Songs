import { useMemo } from 'react'
import { Empty } from '../../ui/Empty'
import { PageHeader } from '../../ui/PageHeader'
import { useUser } from '../auth/authContext'
import { useCatalog } from '../catalog/catalogContext'
import { SongList } from '../catalog/SongList'
import { useFavorites } from './useFavorites'

export default function FavoritesPage() {
  const { user } = useUser()
  const { byId } = useCatalog()
  const { ids } = useFavorites(user.uid)
  const songs = useMemo(
    () =>
      [...ids]
        .map((id) => byId.get(id))
        .filter((s) => !!s)
        .sort((a, b) => a.artist.localeCompare(b.artist, 'es')),
    [ids, byId],
  )

  return (
    <>
      <PageHeader title="Favoritas" subtitle={songs.length ? `${songs.length} canciones que quieres cantar` : undefined} />
      {songs.length === 0 ? (
        <Empty icon="star" title="Aún no tienes favoritas">
          Marca canciones con la estrella en el catálogo y aparecerán aquí para añadirlas rápido a la cola.
        </Empty>
      ) : (
        <section className="section" style={{ marginTop: 12 }}>
          <SongList songs={songs} />
        </section>
      )}
    </>
  )
}
