import { useEffect, useState } from 'react'
import { collection, doc, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { QueueItem, Session } from '../../lib/types'

interface Loaded<T> {
  key: string
  value: T
}

/** Live session document plus its queue (the queue only loads once `uid` is a member). */
export function useSession(sessionId: string | null, uid: string) {
  // Each result remembers which session it belongs to, so a stale one is ignored on render.
  const [sessionState, setSessionState] = useState<Loaded<Session | null> | null>(null)
  const [queueState, setQueueState] = useState<Loaded<QueueItem[]> | null>(null)
  const [errorState, setErrorState] = useState<Loaded<string> | null>(null)

  const current = <T,>(loaded: Loaded<T> | null) => (loaded && loaded.key === sessionId ? loaded.value : undefined)
  const session = current(sessionState) ?? null
  const isMember = !!session?.memberUids.includes(uid)
  const queueKey = isMember ? sessionId : null

  useEffect(() => {
    if (!sessionId) return
    return onSnapshot(
      doc(db, 'sessions', sessionId),
      (snap) =>
        setSessionState({
          key: sessionId,
          value: snap.exists() ? ({ id: snap.id, ...snap.data() } as Session) : null,
        }),
      (e) => {
        setErrorState({ key: sessionId, value: e.message })
        setSessionState({ key: sessionId, value: null })
      },
    )
  }, [sessionId])

  useEffect(() => {
    if (!queueKey) return
    return onSnapshot(
      query(collection(db, 'sessions', queueKey, 'queue'), orderBy('order')),
      (snap) => setQueueState({ key: queueKey, value: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as QueueItem) }),
      (e) => setErrorState({ key: queueKey, value: e.message }),
    )
  }, [queueKey])

  return {
    session,
    queue: (isMember && current(queueState)) || [],
    loading: !!sessionId && current(sessionState) === undefined,
    error: current(errorState) ?? null,
    isMember,
  }
}

/** Sessions the user belongs to, newest first. */
export function useMySessions(uid: string) {
  const [sessions, setSessions] = useState<Session[] | null>(null)
  useEffect(
    () =>
      onSnapshot(
        query(
          collection(db, 'sessions'),
          where('memberUids', 'array-contains', uid),
          orderBy('createdAt', 'desc'),
          limit(30),
        ),
        (snap) => setSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Session)),
      ),
    [uid],
  )
  return sessions
}
