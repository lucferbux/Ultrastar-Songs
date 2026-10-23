// Lists accounts by most recent sign-in, to find who to make admin.
//   npm run users
import { getAuth } from 'firebase-admin/auth'
import { app } from './admin'

const { users } = await getAuth(app).listUsers(1000)
const rows = users
  .filter((u) => u.metadata.lastSignInTime)
  .sort((a, b) => Date.parse(b.metadata.lastSignInTime) - Date.parse(a.metadata.lastSignInTime))
  .slice(0, 20)
  .map((u) => ({
    email: u.email ?? '(invitado)',
    name: u.displayName ?? '',
    provider: u.providerData.map((p) => p.providerId).join(',') || 'anonymous',
    lastSignIn: u.metadata.lastSignInTime,
  }))
console.table(rows)
process.exit(0)
