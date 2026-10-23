import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { QRCodeSVG } from 'qrcode.react'
import { joinUrl, splitQueue } from '../../lib/queue'
import {
  advance,
  joinSession,
  moveItem,
  removeItem,
  setItemStatus,
  setSessionStatus,
  shareTurns,
} from '../../lib/sessionsApi'
import type { QueueItem, Session } from '../../lib/types'
import { Avatar, Cover } from '../../ui/art'
import { Empty, Loading } from '../../ui/Empty'
import { Icon } from '../../ui/Icon'
import { PageHeader } from '../../ui/PageHeader'
import { useToast } from '../../ui/toastContext'
import { useUser } from '../auth/authContext'
import { useCatalog } from '../catalog/catalogContext'
import { useCurrentSession } from './currentSessionContext'
import { useSession } from './useSession'

const singerNames = (item: QueueItem) => item.singers.map((s) => s.name).join(' & ')

function Singers({ item }: { item: QueueItem }) {
  return (
    <span className="avatar-stack">
      {item.singers.map((s) => (
        <Avatar key={s.uid} name={s.name} />
      ))}
    </span>
  )
}

async function share(session: Session, show: (m: string) => void) {
  const url = joinUrl(session.joinCode)
  const text = `Únete a "${session.name}" en Ultrastar con el código ${session.joinCode}`
  if (navigator.share) {
    await navigator.share({ title: 'Ultrastar', text, url }).catch(() => {})
  } else {
    await navigator.clipboard.writeText(url)
    show('Enlace copiado')
  }
}

export default function SessionPage() {
  const { id = '' } = useParams()
  const { user, profile, name } = useUser()
  const { session, queue, loading, error, isMember } = useSession(id, user.uid)
  const { session: current, setCurrent } = useCurrentSession()
  const { byId } = useCatalog()
  const { run, show } = useToast()
  const [showDone, setShowDone] = useState(false)

  // Opening an open session you belong to makes it the one the catalog adds to.
  useEffect(() => {
    if (session?.status === 'open' && isMember && current?.id !== session.id) setCurrent(session.id)
  }, [session?.id, session?.status, isMember, current?.id, setCurrent])

  if (loading) return <Loading />
  if (!session)
    return (
      <Empty icon="calendar" title="Sesión no encontrada">
        {error}
      </Empty>
    )

  const isHost = session.hostUid === user.uid || profile?.role === 'admin'
  const open = session.status === 'open'
  const { singing, upcoming, finished } = splitQueue(queue)
  const nowItem = singing[0]
  const members = Object.entries(session.members)

  if (!isMember) {
    return (
      <>
        <PageHeader title={session.name} subtitle={`${members.length} cantantes`} />
        <Empty icon="mic" title={open ? 'Únete para ver la cola' : 'Esta sesión está cerrada'}>
          {open && (
            <button
              className="btn btn-filled btn-large"
              onClick={() => run(joinSession(session, user.uid, { name, photoURL: profile?.photoURL ?? null }))}
            >
              Unirme a la sesión
            </button>
          )}
        </Empty>
      </>
    )
  }

  const canRemove = (item: QueueItem) => isHost || (item.addedBy === user.uid && item.status === 'pending')
  const nowCover = nowItem ? byId.get(nowItem.songId)?.coverUrl : undefined

  const hero = (
    <div className="hero">
      {nowItem ? (
        <div className="now-playing">
          <Cover src={nowCover} seed={nowItem.song.artist} size="large" />
          <div className="row-text">
            <div className="label">Ahora suena</div>
            <div className="title">{nowItem.song.title}</div>
            <div className="muted">{nowItem.song.artist}</div>
            <div style={{ marginTop: 6, fontWeight: 600 }}>🎤 {singerNames(nowItem)}</div>
          </div>
        </div>
      ) : (
        <div className="now-playing">
          <span className="icon-btn" style={{ width: 56, height: 56, background: 'rgb(255 255 255 / 0.22)', color: '#fff' }}>
            <Icon name="mic" size={28} />
          </span>
          <div className="row-text">
            <div className="label">{open ? 'Escenario libre' : 'Sesión cerrada'}</div>
            <div className="title">{upcoming[0] ? `Siguiente: ${upcoming[0].song.title}` : '¡Elige tu canción!'}</div>
          </div>
        </div>
      )}
      {isHost && open && (nowItem || upcoming[0]) && (
        <div className="hero-actions">
          <button className="btn solid" onClick={() => run(advance(session.id, singing, upcoming[0]))}>
            <Icon name={upcoming[0] ? 'forward' : 'check'} size={18} filled />
            {upcoming[0] ? (nowItem ? 'Siguiente' : 'Empezar') : 'Terminar'}
          </button>
          {upcoming.length > 2 && (
            <button
              className="btn"
              onClick={() =>
                run(shareTurns(session.id, queue)).then((n) => show(n ? 'Turnos repartidos' : 'Los turnos ya están repartidos'))
              }
            >
              <Icon name="people" size={18} /> Repartir turnos
            </button>
          )}
        </div>
      )}
    </div>
  )

  const queueList = (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">En cola</h2>
        <span className="muted">{upcoming.length}</span>
      </div>
      {upcoming.length === 0 ? (
        <div className="list">
          <Link to="/" className="row link">
            <span className="icon-btn tinted">
              <Icon name="plus" size={18} strokeWidth={2.2} />
            </span>
            <span className="row-text row-title">Añadir una canción</span>
            <Icon name="chevronRight" size={16} className="muted" />
          </Link>
        </div>
      ) : (
        <div className="list">
          {upcoming.map((item, i) => (
            <div key={item.id} className={`row ${item.singers.some((s) => s.uid === user.uid) ? 'mine' : ''}`}>
              <span className="position">{i + 1}</span>
              <Cover src={byId.get(item.songId)?.coverUrl} seed={item.song.artist} />
              <div className="row-text">
                <div className="row-title">{item.song.title}</div>
                <div className="row-subtitle">
                  {item.song.artist} · {singerNames(item)}
                </div>
              </div>
              <div className="row-trailing">
                {isHost && open ? (
                  <>
                    <button
                      className="icon-btn plain"
                      aria-label="Subir"
                      disabled={i === 0}
                      onClick={() => run(moveItem(session.id, queue, item.id, -1))}
                    >
                      <Icon name="arrowUp" size={18} />
                    </button>
                    <button
                      className="icon-btn plain"
                      aria-label="Bajar"
                      disabled={i === upcoming.length - 1}
                      onClick={() => run(moveItem(session.id, queue, item.id, 1))}
                    >
                      <Icon name="arrowDown" size={18} />
                    </button>
                    <button className="icon-btn plain" aria-label="Saltar" onClick={() => run(setItemStatus(session.id, item.id, 'skipped'))}>
                      <Icon name="skip" size={18} />
                    </button>
                  </>
                ) : (
                  <Singers item={item} />
                )}
                {canRemove(item) && open && (
                  <button className="icon-btn plain danger" aria-label="Quitar" onClick={() => run(removeItem(session.id, item.id))}>
                    <Icon name="trash" size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )

  const aside = (
    <>
      <section className="section">
        <div className="card qr-card">
          <QRCodeSVG value={joinUrl(session.joinCode)} size={220} marginSize={2} bgColor="#ffffff" fgColor="#1b0b3a" />
          <div className="join-code mono">{session.joinCode}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-tinted btn-small" onClick={() => void share(session, show)}>
              <Icon name="share" size={16} /> Invitar
            </button>
            <Link to={`/s/${session.id}/tv`} className="btn btn-gray btn-small">
              <Icon name="tv" size={16} /> Pantalla TV
            </Link>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Cantantes</h2>
          <span className="muted">{members.length}</span>
        </div>
        <div className="list">
          {members.map(([uid, m]) => (
            <div key={uid} className="row compact">
              <Avatar name={m.name} photo={m.photoURL} />
              <span className="row-text row-title">
                {m.name}
                {uid === user.uid && <span className="muted"> (yo)</span>}
              </span>
              {uid === session.hostUid && (
                <span className="badge accent">
                  <Icon name="crown" size={12} /> Anfitrión
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  )

  return (
    <>
      <PageHeader
        title={session.name}
        subtitle={
          <>
            {open ? <span className="badge green live">En directo</span> : <span className="badge">Cerrada</span>}{' '}
            {new Date(`${session.date}T12:00:00`).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
          </>
        }
        actions={
          <button className="icon-btn tinted" aria-label="Invitar" onClick={() => void share(session, show)}>
            <Icon name="share" size={18} />
          </button>
        }
      />

      <div className="session-grid">
        <div className="session-aside">
          <section className="section" style={{ marginTop: 12 }}>
            {hero}
          </section>
          <div className="aside-wide">{aside}</div>
        </div>
        <div>
          {queueList}

          {finished.length > 0 && (
            <section className="section">
              <button className="section-header" style={{ width: '100%' }} onClick={() => setShowDone((v) => !v)}>
                <h2 className="section-title">Ya cantadas</h2>
                <span className="muted">
                  {finished.length} <Icon name={showDone ? 'chevronDown' : 'chevronRight'} size={14} />
                </span>
              </button>
              {showDone && (
                <div className="list">
                  {finished.map((item) => (
                    <div key={item.id} className="row" style={{ opacity: 0.7 }}>
                      <Cover src={byId.get(item.songId)?.coverUrl} seed={item.song.artist} />
                      <div className="row-text">
                        <div className="row-title">{item.song.title}</div>
                        <div className="row-subtitle">
                          {item.song.artist} · {singerNames(item)}
                        </div>
                      </div>
                      {item.status === 'skipped' && <span className="badge">Saltada</span>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          <div className="aside-narrow">{aside}</div>

          {isHost && (
            <section className="section">
              <button
                className={`btn btn-wide ${open ? 'btn-destructive' : 'btn-tinted'}`}
                onClick={() => run(setSessionStatus(session.id, open ? 'closed' : 'open'))}
              >
                {open ? 'Cerrar sesión' : 'Reabrir sesión'}
              </button>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
