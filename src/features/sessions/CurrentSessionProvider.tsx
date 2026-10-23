import { useCallback, useState, type ReactNode } from 'react'
import { useUser } from '../auth/authContext'
import { CurrentSessionContext } from './currentSessionContext'
import { useSession } from './useSession'

const KEY = 'ultrastar.currentSession'

function readStored(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function CurrentSessionProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const [sessionId, setSessionId] = useState<string | null>(readStored)
  const { session, queue, isMember } = useSession(sessionId, user.uid)

  const setCurrent = useCallback((id: string | null) => {
    setSessionId(id)
    try {
      if (id) localStorage.setItem(KEY, id)
      else localStorage.removeItem(KEY)
    } catch {
      // Private mode: the current session just isn't remembered.
    }
  }, [])

  const active = session && isMember && session.status === 'open' ? session : null
  return (
    <CurrentSessionContext.Provider value={{ session: active, queue: active ? queue : [], setCurrent }}>
      {children}
    </CurrentSessionContext.Provider>
  )
}
