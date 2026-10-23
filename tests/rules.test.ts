// Security-rule tests. Run with `npm run test:rules` (starts the Firestore emulator; needs Java 21+).
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'

let env: RulesTestEnvironment

const db = (uid?: string) =>
  (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).firestore()

const session = {
  name: 'Viernes',
  date: '2026-10-23',
  hostUid: 'host',
  joinCode: 'ABC234',
  status: 'open',
  memberUids: ['host', 'ana'],
  members: { host: { name: 'Host', photoURL: null }, ana: { name: 'Ana', photoURL: null } },
  createdAt: null,
}

const queueItem = (addedBy: string) => ({
  songId: 'queen--bohemian-rhapsody',
  song: { title: 'Bohemian Rhapsody', artist: 'Queen', duet: false },
  singers: [{ uid: addedBy, name: addedBy }],
  addedBy,
  order: 1,
  status: 'pending',
})

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-ultrastar-rules',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  })
})

afterAll(() => env.cleanup())

beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (ctx) => {
    const admin = ctx.firestore()
    await setDoc(doc(admin, 'users/boss'), { displayName: 'Boss', photoURL: null, role: 'admin' })
    await setDoc(doc(admin, 'catalog/queen--bohemian-rhapsody'), { title: 'Bohemian Rhapsody', artist: 'Queen' })
    await setDoc(doc(admin, 'sessions/s1'), session)
    await setDoc(doc(admin, 'sessions/s1/queue/q-ana'), queueItem('ana'))
  })
})

describe('catalog', () => {
  it('signed-in users read, anonymous users do not', async () => {
    await assertSucceeds(getDoc(doc(db('ana'), 'catalog/queen--bohemian-rhapsody')))
    await assertFails(getDoc(doc(db(), 'catalog/queen--bohemian-rhapsody')))
  })

  it('only admins edit the catalog', async () => {
    await assertFails(setDoc(doc(db('ana'), 'catalog/x'), { title: 'x', artist: 'y' }))
    await assertSucceeds(setDoc(doc(db('boss'), 'catalog/x'), { title: 'x', artist: 'y' }))
  })
})

describe('users', () => {
  it('cannot make themselves admin', async () => {
    await assertFails(setDoc(doc(db('eve'), 'users/eve'), { displayName: 'Eve', photoURL: null, role: 'admin' }))
    await assertSucceeds(setDoc(doc(db('eve'), 'users/eve'), { displayName: 'Eve', photoURL: null, role: 'member' }))
    await assertFails(updateDoc(doc(db('eve'), 'users/eve'), { role: 'admin' }))
  })

  it('profiles are private', async () => {
    await assertSucceeds(getDoc(doc(db('ana'), 'users/ana')))
    await assertFails(getDoc(doc(db('ana'), 'users/boss')))
    await assertSucceeds(getDoc(doc(db('boss'), 'users/ana')))
  })

  it('favorites are private', async () => {
    await assertSucceeds(setDoc(doc(db('ana'), 'users/ana/favorites/x'), { addedAt: 1 }))
    await assertFails(getDoc(doc(db('bob'), 'users/ana/favorites/x')))
  })
})

describe('sessions', () => {
  it('a user can join by adding only themselves', async () => {
    const ref = doc(db('bob'), 'sessions/s1')
    await assertFails(updateDoc(ref, { memberUids: [...session.memberUids, 'carl'] }))
    await assertFails(updateDoc(ref, { name: 'Hijacked' }))
    await assertSucceeds(
      updateDoc(ref, { memberUids: arrayUnion('bob'), 'members.bob': { name: 'Bob', photoURL: null } }),
    )
  })

  it('cannot join a closed session', async () => {
    await env.withSecurityRulesDisabled((ctx) => updateDoc(doc(ctx.firestore(), 'sessions/s1'), { status: 'closed' }))
    await assertFails(
      updateDoc(doc(db('bob'), 'sessions/s1'), { memberUids: arrayUnion('bob'), 'members.bob': { name: 'Bob', photoURL: null } }),
    )
  })

  it('sessions are listed only by join code or membership', async () => {
    const sessions = collection(db('bob'), 'sessions')
    await assertSucceeds(getDocs(query(sessions, where('joinCode', '==', 'ABC234'), limit(1))))
    await assertFails(getDocs(query(sessions, where('joinCode', '==', 'ABC234'))))
    await assertFails(getDocs(sessions))
    await assertSucceeds(getDocs(query(collection(db('ana'), 'sessions'), where('memberUids', 'array-contains', 'ana'))))
  })

  it('members rename only themselves', async () => {
    await assertSucceeds(updateDoc(doc(db('ana'), 'sessions/s1'), { 'members.ana': { name: 'Ana B', photoURL: null } }))
    await assertFails(updateDoc(doc(db('ana'), 'sessions/s1'), { 'members.host': { name: 'X', photoURL: null } }))
  })

  it('only the host closes the session', async () => {
    await assertFails(updateDoc(doc(db('ana'), 'sessions/s1'), { status: 'closed' }))
    await assertSucceeds(updateDoc(doc(db('host'), 'sessions/s1'), { status: 'closed' }))
  })
})

describe('queue', () => {
  it('non-members cannot read or add', async () => {
    await assertFails(getDoc(doc(db('bob'), 'sessions/s1/queue/q-ana')))
    await assertFails(setDoc(doc(db('bob'), 'sessions/s1/queue/q-bob'), queueItem('bob')))
  })

  it('members add items in their own name', async () => {
    await assertSucceeds(setDoc(doc(db('ana'), 'sessions/s1/queue/q2'), queueItem('ana')))
    await assertFails(setDoc(doc(db('ana'), 'sessions/s1/queue/q3'), queueItem('host')))
  })

  it('only the host reorders or changes status', async () => {
    await assertFails(updateDoc(doc(db('ana'), 'sessions/s1/queue/q-ana'), { order: 0 }))
    await assertFails(updateDoc(doc(db('ana'), 'sessions/s1/queue/q-ana'), { status: 'done' }))
    await assertSucceeds(updateDoc(doc(db('host'), 'sessions/s1/queue/q-ana'), { status: 'singing' }))
  })

  it('members remove their own pending items only', async () => {
    await env.withSecurityRulesDisabled((ctx) =>
      setDoc(doc(ctx.firestore(), 'sessions/s1/queue/q-host'), queueItem('host')),
    )
    await assertFails(deleteDoc(doc(db('ana'), 'sessions/s1/queue/q-host')))
    await assertSucceeds(deleteDoc(doc(db('ana'), 'sessions/s1/queue/q-ana')))
  })
})
