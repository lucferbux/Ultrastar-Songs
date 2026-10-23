import { createContext, useContext } from 'react'
import type { QueueItem, Session } from '../../lib/types'

export interface CurrentSessionState {
  /** The session songs get added to from the catalog ("tonight's session"). */
  session: Session | null
  queue: QueueItem[]
  setCurrent: (sessionId: string | null) => void
}

export const CurrentSessionContext = createContext<CurrentSessionState>({
  session: null,
  queue: [],
  setCurrent: () => {},
})

export const useCurrentSession = () => useContext(CurrentSessionContext)
