import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { normalizeJoinCode } from '../../lib/queue'
import type { Session } from '../../lib/types'
import { createSession } from '../../lib/sessionsApi'
import { Empty, Loading } from '../../ui/Empty'
import { Icon } from '../../ui/Icon'
import { PageHeader } from '../../ui/PageHeader'
import { useToast } from '../../ui/toastContext'
import { useUser } from '../auth/authContext'
import { useCurrentSession } from './currentSessionContext'
import { useMySessions } from './useSession'

const dateLabel = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })

function SessionList({ title, sessions, uid }: { title: string; sessions: Session[]; uid: string }) {
  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
      </div>
      <div className="list">
        {sessions.map((s) => (
          <Link key={s.id} to={`/s/${s.id}`} className="row link">
            <span className={`icon-btn ${s.status === 'open' ? 'filled' : ''}`}>
              <Icon name={s.status === 'open' ? 'mic' : 'calendar'} size={18} />
            </span>
            <span className="row-text">
              <span className="row-title" style={{ display: 'block' }}>
                {s.name}
              </span>
              <span className="row-subtitle" style={{ display: 'block' }}>
                {dateLabel(s.date)} · {s.memberUids.length} {s.memberUids.length === 1 ? 'cantante' : 'cantantes'}
              </span>
            </span>
            {s.hostUid === uid && <span className="badge accent">Anfitrión</span>}
            <Icon name="chevronRight" size={16} className="muted" />
          </Link>
        ))}
      </div>
    </section>
  )
}

export default function SessionsPage() {
  const { user, profile, name } = useUser()
  const sessions = useMySessions(user.uid)
  const { session: current, setCurrent } = useCurrentSession()
  const { run } = useToast()
  const navigate = useNavigate()
  const [sessionName, setSessionName] = useState('')
  const [code, setCode] = useState('')

  const create = async (event: FormEvent) => {
    event.preventDefault()
    const id = await run(createSession(sessionName, user.uid, { name, photoURL: profile?.photoURL ?? null }))
    if (!id) return
    setCurrent(id)
    navigate(`/s/${id}`)
  }

  const join = (event: FormEvent) => {
    event.preventDefault()
    navigate(`/join/${normalizeJoinCode(code)}`)
  }

  const open = sessions?.filter((s) => s.status === 'open') ?? []
  const past = sessions?.filter((s) => s.status === 'closed') ?? []

  return (
    <>
      <PageHeader title="Sesiones" subtitle="Únete con el código o crea la de esta noche" />

      {current && (
        <Link to={`/s/${current.id}`} className="hero" style={{ display: 'block', marginTop: 12 }}>
          <div className="now-playing">
            <span className="icon-btn" style={{ background: 'rgb(255 255 255 / 0.25)', color: '#fff' }}>
              <Icon name="mic" size={20} />
            </span>
            <div className="row-text">
              <div className="label">Sesión actual</div>
              <div className="title">{current.name}</div>
            </div>
            <Icon name="chevronRight" size={20} />
          </div>
        </Link>
      )}

      <section className="section">
        <div className="list">
          <form className="row" onSubmit={join}>
            <span className="icon-btn tinted">
              <Icon name="qr" size={18} />
            </span>
            <input
              className="input code-input mono"
              style={{ flex: 1, background: 'transparent', height: 44 }}
              placeholder="CÓDIGO"
              aria-label="Código de la sesión"
              value={code}
              onChange={(e) => setCode(normalizeJoinCode(e.target.value))}
              autoCapitalize="characters"
              autoComplete="off"
            />
            <button className="btn btn-filled btn-small" disabled={code.length !== 6}>
              Unirme
            </button>
          </form>
          <form className="row" onSubmit={create}>
            <span className="icon-btn tinted">
              <Icon name="plus" size={18} strokeWidth={2.2} />
            </span>
            <input
              className="input"
              style={{ flex: 1, background: 'transparent', height: 44, padding: 0 }}
              placeholder="Nueva sesión (p. ej. Viernes en casa)"
              aria-label="Nombre de la nueva sesión"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
            />
            <button className="btn btn-tinted btn-small">Crear</button>
          </form>
        </div>
        <p className="section-footer">También puedes escanear el QR de la pantalla del karaoke con la cámara.</p>
      </section>

      {sessions === null ? (
        <Loading />
      ) : sessions.length === 0 ? (
        <Empty icon="calendar" title="Sin sesiones todavía">
          Crea una y comparte el código con tus amigos.
        </Empty>
      ) : (
        <>
          {open.length > 0 && <SessionList title="Abiertas" sessions={open} uid={user.uid} />}
          {past.length > 0 && <SessionList title="Anteriores" sessions={past} uid={user.uid} />}
        </>
      )}
    </>
  )
}
