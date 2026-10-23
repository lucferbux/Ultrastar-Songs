// Gives a user the admin role (can edit the catalog and run any session).
// The user must have signed in to the app at least once.
//
//   npm run set-admin -- someone@example.com
import { getAuth } from 'firebase-admin/auth'
import { app, firestore } from './admin'

const who = process.argv[2]
if (!who) {
  console.error('usage: npm run set-admin -- <email|uid>')
  process.exit(1)
}

const user = who.includes('@') ? await getAuth(app).getUserByEmail(who) : await getAuth(app).getUser(who)
await firestore.doc(`users/${user.uid}`).set({ role: 'admin' }, { merge: true })
console.log(`${user.email ?? user.uid} is now admin.`)
process.exit(0)
