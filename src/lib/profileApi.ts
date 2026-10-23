import { GoogleAuthProvider, linkWithPopup, updateProfile, type User } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

export async function renameUser(user: User, displayName: string) {
  const name = displayName.trim().slice(0, 40)
  if (!name) throw new Error('El nombre no puede estar vacío.')
  await updateProfile(user, { displayName: name })
  await updateDoc(doc(db, 'users', user.uid), { displayName: name })
  return name
}

/** Turns a guest (anonymous) account into a Google account, keeping uid, favourites and sessions. */
export async function upgradeGuestWithGoogle(user: User) {
  const result = await linkWithPopup(user, new GoogleAuthProvider())
  const { displayName, photoURL } = result.user
  await updateDoc(doc(db, 'users', user.uid), {
    ...(displayName ? { displayName } : {}),
    photoURL: photoURL ?? null,
    isGuest: false,
  })
}
