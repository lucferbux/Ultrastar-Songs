import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { QRCodeSVG } from 'qrcode.react'
import { joinUrl, splitQueue } from '../../lib/queue'
import { Avatar, Cover } from '../../ui/art'
import { Loading } from '../../ui/Empty'
import { useUser } from '../auth/authContext'
import { useCatalog } from '../catalog/catalogContext'
import { useSession } from './useSession'

/** Keeps the TV/laptop screen awake while this view is open (re-acquired when the tab returns). */
function useWakeLock() {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null
    const acquire = async () => {
      if (document.visibilityState !== 'visible' || !('wakeLock' in navigator)) return
      lock = await navigator.wakeLock.request('screen').catch(() => null)
    }
    void acquire()
    document.addEventListener('visibilitychange', acquire)
    return () => {
      document.removeEventListener('visibilitychange', acquire)
      void lock?.release()
    }
  }, [])
}

/** Big-screen view to leave on the TV next to the game. */
export default function TvPage() {
  const { id = '' } = useParams()
  const { user } = useUser()
  const { session, queue, loading } = useSession(id, user.uid)
  const { byId } = useCatalog()
  useWakeLock()

  useEffect(() => {
    document.documentElement.style.colorScheme = 'dark'
    return () => {
      document.documentElement.style.colorScheme = ''
    }
  }, [])

  if (loading || !session) return <Loading />
  const { singing, upcoming } = splitQueue(queue)
  const now = singing[0]
  const song = now ? byId.get(now.songId) : undefined
  const cover = song?.coverLargeUrl ?? song?.coverUrl

  return (
    <div className="tv">
      <div
        className={`tv-backdrop ${cover ? '' : 'default'}`}
        style={cover ? { backgroundImage: `url(${cover})` } : undefined}
      />
      <Link to={`/s/${session.id}`} className="tv-exit">
        Salir de la pantalla TV
      </Link>

      <section className="tv-now">
        <span className="tv-label">{now ? 'Ahora suena' : session.name}</span>
        {now ? (
          <>
            <Cover src={cover} seed={now.song.artist} size="huge" />
            <div>
              <div className="tv-title">{now.song.title}</div>
              <div className="tv-artist">{now.song.artist}</div>
            </div>
            <span className="tv-singers">
              {now.singers.map((s) => (
                <Avatar key={s.uid} name={s.name} />
              ))}
              {now.singers.map((s) => s.name).join(' & ')}
            </span>
          </>
        ) : (
          <div className="tv-title">¡Escanea y elige tu canción!</div>
        )}
      </section>

      <aside className="tv-side">
        <span className="tv-label">Siguientes</span>
        {upcoming.length > 0 ? (
          <ol className="tv-queue">
            {upcoming.slice(0, 7).map((item, i) => (
              <li key={item.id}>
                <span className="n">{i + 1}</span>
                <span>
                  <strong>{item.song.title}</strong>
                  <br />
                  <span style={{ opacity: 0.7 }}>{item.song.artist}</span>
                </span>
                <span className="who">{item.singers.map((s) => s.name).join(' & ')}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p style={{ opacity: 0.7 }}>La cola está vacía.</p>
        )}
        <div className="tv-join">
          <QRCodeSVG value={joinUrl(session.joinCode)} size={160} marginSize={2} />
          <div>
            <div className="tv-label">Únete con el código</div>
            <div className="tv-code">{session.joinCode}</div>
          </div>
        </div>
      </aside>
    </div>
  )
}
