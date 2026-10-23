import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router'
import {
  GoogleAuthProvider,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInAnonymously,
  signInWithEmailLink,
  signInWithPopup,
} from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { Icon } from '../../ui/Icon'
import { useToast } from '../../ui/toastContext'
import { GUEST_NAME_KEY, useAuth } from './authContext'

const EMAIL_KEY = 'ultrastar.emailForSignIn'

type Mode = 'start' | 'email' | 'guest'

export function LoginPage() {
  const { user } = useAuth()
  const { run } = useToast()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  // Arriving from a session QR? Guests are the quickest way in.
  const [mode, setMode] = useState<Mode>(from.startsWith('/join') ? 'guest' : 'start')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  // Finish an email-link sign-in when the user comes back from their inbox.
  useEffect(() => {
    if (!isSignInWithEmailLink(auth, window.location.href)) return
    const saved = localStorage.getItem(EMAIL_KEY) ?? window.prompt('Confirma tu email') ?? ''
    void run(signInWithEmailLink(auth, saved, window.location.href)).then(() => localStorage.removeItem(EMAIL_KEY))
  }, [run])

  if (user) return <Navigate to={from} replace />

  const busyRun = async (promise: Promise<unknown>) => {
    setBusy(true)
    await run(promise)
    setBusy(false)
  }

  const google = () => busyRun(signInWithPopup(auth, new GoogleAuthProvider()))

  const sendLink = async (event: FormEvent) => {
    event.preventDefault()
    const url = new URL('/login', window.location.origin).toString()
    await busyRun(
      sendSignInLinkToEmail(auth, email, { url, handleCodeInApp: true }).then(() => {
        localStorage.setItem(EMAIL_KEY, email)
        setSent(true)
      }),
    )
  }

  const guest = async (event: FormEvent) => {
    event.preventDefault()
    sessionStorage.setItem(GUEST_NAME_KEY, name.trim())
    await busyRun(signInAnonymously(auth))
  }

  return (
    <main className="login">
      <div className="login-card glass">
        <img className="app-icon" src="/icon.svg" alt="" />
        <h1>Ultrastar</h1>
        <p className="tagline">Busca tu canción, apúntate a la cola y a cantar.</p>

        {mode === 'start' && (
          <>
            <button className="btn btn-glass glass btn-large btn-wide" onClick={google} disabled={busy}>
              <Icon name="google" size={20} /> Continuar con Google
            </button>
            <button className="btn btn-gray btn-large btn-wide" onClick={() => setMode('email')}>
              Continuar con email
            </button>
            <div className="divider">o</div>
            <button className="btn btn-filled btn-large btn-wide" onClick={() => setMode('guest')}>
              Entrar como invitado
            </button>
          </>
        )}

        {mode === 'email' &&
          (sent ? (
            <p>
              Te hemos enviado un enlace a <strong>{email}</strong>. Ábrelo en este dispositivo para entrar.
            </p>
          ) : (
            <form onSubmit={sendLink} className="field">
              <input
                className="input"
                type="email"
                required
                autoFocus
                autoComplete="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="btn btn-filled btn-large btn-wide" disabled={busy}>
                Enviarme un enlace
              </button>
            </form>
          ))}

        {mode === 'guest' && (
          <form onSubmit={guest} className="field">
            <input
              className="input"
              required
              autoFocus
              maxLength={40}
              autoComplete="nickname"
              placeholder="¿Cómo te llamas?"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button className="btn btn-filled btn-large btn-wide" disabled={busy || !name.trim()}>
              Entrar
            </button>
            <p className="muted" style={{ fontSize: 13, margin: '4px 0 0' }}>
              Sin cuenta. Podrás guardarla con Google más tarde desde tu perfil.
            </p>
          </form>
        )}

        {mode !== 'start' && (
          <button className="btn btn-plain" onClick={() => setMode('start')}>
            Otras opciones
          </button>
        )}
      </div>
    </main>
  )
}
