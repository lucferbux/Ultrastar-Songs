import { createContext, useContext } from 'react'
import type { User } from 'firebase/auth'
import type { UserProfile } from '../../lib/types'

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
}

/** sessionStorage key carrying the name a guest typed until their profile is created. */
export const GUEST_NAME_KEY = 'ultrastar.guestName'

export const AuthContext = createContext<AuthState>({ user: null, profile: null, loading: true })

export const useAuth = () => useContext(AuthContext)

/** The signed-in user; only call below a route guarded by `RequireAuth`. */
export function useUser() {
  const { user, profile } = useContext(AuthContext)
  if (!user) throw new Error('useUser() called without a signed-in user')
  return { user, profile, name: profile?.displayName ?? user.displayName ?? 'Cantante' }
}
