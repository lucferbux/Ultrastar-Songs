import { useState } from 'react'
import { addToQueue } from '../../lib/sessionsApi'
import { isQueued, nextOrder } from '../../lib/queue'
import type { Song } from '../../lib/types'
import { Avatar, Cover } from '../../ui/art'
import { Icon } from '../../ui/Icon'
import { Sheet } from '../../ui/Sheet'
import { useToast } from '../../ui/toastContext'
import { useUser } from '../auth/authContext'
import { useCurrentSession } from './currentSessionContext'

/** Pick who sings a song and add it to the current session's queue. */
export function AddToQueueSheet({ song, onClose }: { song: Song; onClose: () => void }) {
  const { user } = useUser()
  const { session, queue } = useCurrentSession()
  const { run } = useToast()
  const [singers, setSingers] = useState<string[]>([user.uid])
  const [saving, setSaving] = useState(false)
  if (!session) return null

  const already = isQueued(queue, song.id)
  const members = Object.entries(session.members).sort(([a, ma], [b, mb]) =>
    a === user.uid ? -1 : b === user.uid ? 1 : ma.name.localeCompare(mb.name, 'es'),
  )
  const toggle = (uid: string) => setSingers((s) => (s.includes(uid) ? s.filter((u) => u !== uid) : [...s, uid]))

  const submit = async () => {
    setSaving(true)
    const chosen = singers.map((uid) => ({ uid, name: session.members[uid]?.name ?? '?' }))
    const ok = await run(addToQueue(session.id, song, chosen, user.uid, nextOrder(queue)), 'Añadida a la cola')
    setSaving(false)
    if (ok) onClose()
  }

  return (
    <Sheet title="Añadir a la cola" onClose={onClose}>
      <div className="row" style={{ padding: 0, minHeight: 0 }}>
        <Cover src={song.coverUrl} seed={song.artist} size="large" />
        <div className="row-text">
          <div className="row-title" style={{ fontSize: 19, whiteSpace: 'normal' }}>
            {song.title}
          </div>
          <div className="row-subtitle">{song.artist}</div>
          <div className="row-meta">→ {session.name}</div>
        </div>
      </div>

      <div className="section" style={{ marginTop: 20 }}>
        <div className="section-header">
          <span className="muted" style={{ fontSize: 13 }}>
            ¿Quién canta?{song.duet && ' · es un dúo, elige a dos'}
          </span>
        </div>
        <div className="list">
          {members.map(([uid, m]) => {
            const on = singers.includes(uid)
            return (
              <button key={uid} className="row compact link" style={{ width: '100%' }} onClick={() => toggle(uid)} aria-pressed={on}>
                <Avatar name={m.name} photo={m.photoURL} />
                <span className="row-text row-title" style={{ textAlign: 'left' }}>
                  {uid === user.uid ? `${m.name} (yo)` : m.name}
                </span>
                {on && <Icon name="check" size={20} strokeWidth={2.6} className="accent" />}
              </button>
            )
          })}
        </div>
      </div>

      {already && <p className="error-text">Esta canción ya está en la cola.</p>}
      <div className="sheet-actions">
        <button className="btn btn-filled btn-large" disabled={saving || singers.length === 0 || already} onClick={submit}>
          <Icon name="plus" size={18} strokeWidth={2.4} /> Añadir
        </button>
      </div>
    </Sheet>
  )
}
