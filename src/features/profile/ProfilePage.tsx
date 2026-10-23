import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { signOut } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { renameUser, upgradeGuestWithGoogle } from '../../lib/profileApi'
import { updateMemberName } from '../../lib/sessionsApi'
import { Avatar } from '../../ui/art'
import { Icon } from '../../ui/Icon'
import { PageHeader } from '../../ui/PageHeader'
import { usePlatform } from '../../ui/platform'
import { useToast } from '../../ui/toastContext'
import { useUser } from '../auth/authContext'
import { useFavorites } from '../favorites/useFavorites'
import { useCurrentSession } from '../sessions/currentSessionContext'

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true

export default function ProfilePage() {
  const { user, profile, name } = useUser()
  const { session } = useCurrentSession()
  const { ids } = useFavorites(user.uid)
  const { run } = useToast()
  const platform = usePlatform()
  const [draft, setDraft] = useState<string | null>(null)
  const guest = user.isAnonymous
  const photo = profile?.photoURL ?? user.photoURL

  const saveName = async (event: FormEvent) => {
    event.preventDefault()
    if (draft === null || draft.trim() === name) return setDraft(null)
    const newName = await run(renameUser(user, draft), 'Nombre actualizado')
    if (!newName) return
    setDraft(null)
    if (session?.members[user.uid]) await run(updateMemberName(session.id, user.uid, { name: newName, photoURL: photo ?? null }))
  }

  return (
    <>
      <PageHeader title="Perfil" />

      <section className="section center" style={{ marginTop: 8 }}>
        <Avatar name={name} photo={photo} large />
        <h2 style={{ marginTop: 12, fontSize: 24 }}>{name}</h2>
        <p className="muted" style={{ margin: '4px 0 0' }}>
          {guest ? 'Invitado' : (user.email ?? 'Cuenta de Google')} · {ids.size} favoritas
        </p>
      </section>

      <section className="section">
        <div className="list">
          <form className="row" onSubmit={saveName}>
            <span className="icon-btn tinted">
              <Icon name="pencil" size={17} />
            </span>
            <input
              className="input"
              style={{ flex: 1, background: 'transparent', padding: 0, height: 44 }}
              aria-label="Tu nombre"
              maxLength={40}
              value={draft ?? name}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={(e) => void saveName(e)}
            />
            {draft !== null && draft.trim() !== name && <button className="btn btn-filled btn-small">Guardar</button>}
          </form>
        </div>
        <p className="section-footer">Es el nombre que verán los demás en la cola y en la pantalla.</p>
      </section>

      {guest && (
        <section className="section">
          <div className="card">
            <strong>Guarda tu cuenta</strong>
            <p className="muted" style={{ margin: '6px 0 12px' }}>
              Eres invitado: si cierras sesión o cambias de móvil perderás tus favoritas. Vincula Google para conservarlas.
            </p>
            <button className="btn btn-gray btn-wide" onClick={() => run(upgradeGuestWithGoogle(user), 'Cuenta guardada')}>
              <Icon name="google" size={18} /> Vincular con Google
            </button>
          </div>
        </section>
      )}

      {!isStandalone() && platform !== 'macos' && (
        <section className="section">
          <div className="card" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <img src="/icon.svg" alt="" width={56} height={56} />
            <div>
              <strong>Instala Ultrastar</strong>
              <p className="muted" style={{ margin: '4px 0 0', fontSize: 15 }}>
                Toca <Icon name="share" size={15} /> Compartir y luego «Añadir a pantalla de inicio» para tenerla como una app.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="list">
          {profile?.role === 'admin' && (
            <Link to="/admin" className="row compact link">
              <span className="icon-btn tinted">
                <Icon name="gear" size={17} />
              </span>
              <span className="row-text row-title">Administrar catálogo</span>
              <Icon name="chevronRight" size={16} className="muted" />
            </Link>
          )}
          <Link to="/sessions" className="row compact link">
            <span className="icon-btn tinted">
              <Icon name="calendar" size={17} />
            </span>
            <span className="row-text row-title">Mis sesiones</span>
            <Icon name="chevronRight" size={16} className="muted" />
          </Link>
          <button className="row compact link" style={{ width: '100%', color: 'var(--red)' }} onClick={() => run(signOut(auth))}>
            <span className="icon-btn" style={{ color: 'var(--red)' }}>
              <Icon name="logout" size={17} />
            </span>
            <span className="row-text row-title" style={{ textAlign: 'left' }}>
              Salir de la cuenta
            </span>
          </button>
        </div>
      </section>
    </>
  )
}
