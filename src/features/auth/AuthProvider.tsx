import { useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, updateProfile, type User } from 'firebase/auth'
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../../lib/firebase'
import type { UserProfile } from '../../lib/types'
import { AuthContext, GUEST_NAME_KEY, type AuthState } from './authContext'

/**
 * Creates `users/{uid}` on first sign-in (guests get the name they typed on the login screen),
 * and backfills a name on legacy profiles that only had `{ email, uid }`.
 */
async function ensureProfile(user: User) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  const guestName = sessionStorage.getItem(GUEST_NAME_KEY)
  sessionStorage.removeItem(GUEST_NAME_KEY)
  const displayName = user.displayName || guestName || user.email?.split('@')[0] || 'Cantante'

  if (user.isAnonymous && !user.displayName && guestName) await updateProfile(user, { displayName })
  if (!snap.exists()) {
    await setDoc(ref, {
      displayName,
      photoURL: user.photoURL,
      role: 'member',
      isGuest: user.isAnonymous,
      createdAt: serverTimestamp(),
    })
  } else if (!(snap.data() as UserProfile).displayName) {
    await updateDoc(ref, { displayName })
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, profile: null, loading: true })

  useEffect(() => {
    let unsubscribeProfile = () => {}
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      unsubscribeProfile()
      if (!user) {
        setState({ user: null, profile: null, loading: false })
        return
      }
      await ensureProfile(user)
      unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (snap) =>
        setState({ user, profile: (snap.data() as UserProfile) ?? null, loading: false }),
      )
    })
    return () => {
      unsubscribeProfile()
      unsubscribeAuth()
    }
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

