import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { normalizeJoinCode } from '../../lib/queue'
import { findSessionByCode, joinSession } from '../../lib/sessionsApi'
import { useUser } from '../auth/authContext'
import { Empty } from '../../ui/Empty'
import { useCurrentSession } from './currentSessionContext'

/** `/join/:code` — target of the QR code: joins the session and opens it. */
export default function JoinPage() {
  const { code = '' } = useParams()
  const { user, profile, name } = useUser()
  const { setCurrent } = useCurrentSession()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const session = await findSessionByCode(normalizeJoinCode(code))
      if (cancelled) return
      if (!session) return setError('No existe ninguna sesión con ese código.')
      if (session.status !== 'open' && !session.memberUids.includes(user.uid))
        return setError('Esta sesión ya está cerrada.')
      await joinSession(session, user.uid, { name, photoURL: profile?.photoURL ?? null })
      if (session.status === 'open') setCurrent(session.id)
      navigate(`/s/${session.id}`, { replace: true })
    })().catch((e: Error) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
    }
  }, [code, user.uid, name, profile?.photoURL, setCurrent, navigate])

  return error ? (
    <Empty icon="qr" title="No se pudo unir">
      <p>{error}</p>
      <Link to="/sessions" className="btn btn-tinted">
        Volver a sesiones
      </Link>
    </Empty>
  ) : (
    <Empty icon="mic" title={`Uniéndote a ${code}…`}>
      <div className="spinner" />
    </Empty>
  )
}
