import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import { fairOrder, generateJoinCode, moveUpdates } from './queue'
import type { Member, QueueItem, QueueStatus, Session, Singer, Song } from './types'

const sessionsCol = collection(db, 'sessions')
const queueCol = (sessionId: string) => collection(db, 'sessions', sessionId, 'queue')

const today = () => new Date().toLocaleDateString('sv-SE') // YYYY-MM-DD in local time

export async function findSessionByCode(code: string): Promise<Session | null> {
  const snap = await getDocs(query(sessionsCol, where('joinCode', '==', code), limit(1)))
  const d = snap.docs[0]
  return d ? ({ id: d.id, ...d.data() } as Session) : null
}

export async function createSession(name: string, uid: string, member: Member): Promise<string> {
  let joinCode = generateJoinCode()
  while (await findSessionByCode(joinCode)) joinCode = generateJoinCode()
  const ref = await addDoc(sessionsCol, {
    name: name.trim() || `Karaoke ${today()}`,
    date: today(),
    hostUid: uid,
    joinCode,
    status: 'open',
    memberUids: [uid],
    members: { [uid]: member },
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function joinSession(session: Session, uid: string, member: Member) {
  if (session.memberUids.includes(uid)) return
  await updateDoc(doc(sessionsCol, session.id), {
    memberUids: arrayUnion(uid),
    [`members.${uid}`]: member,
  })
}

export const setSessionStatus = (sessionId: string, status: Session['status']) =>
  updateDoc(doc(sessionsCol, sessionId), { status })

export function addToQueue(sessionId: string, song: Song, singers: Singer[], uid: string, order: number) {
  return addDoc(queueCol(sessionId), {
    songId: song.id,
    song: { title: song.title, artist: song.artist, duet: song.duet },
    singers,
    addedBy: uid,
    order,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
}

export const setItemStatus = (sessionId: string, itemId: string, status: QueueStatus) =>
  updateDoc(doc(queueCol(sessionId), itemId), { status })

export const removeItem = (sessionId: string, itemId: string) => deleteDoc(doc(queueCol(sessionId), itemId))

/** Marks the current song done and starts the next pending one, atomically. */
export async function advance(sessionId: string, singing: QueueItem[], next: QueueItem | undefined) {
  const batch = writeBatch(db)
  for (const item of singing) batch.update(doc(queueCol(sessionId), item.id), { status: 'done' })
  if (next) batch.update(doc(queueCol(sessionId), next.id), { status: 'singing' })
  await batch.commit()
}

async function applyOrder(sessionId: string, updates: { id: string; order: number }[]) {
  if (!updates.length) return
  const batch = writeBatch(db)
  for (const u of updates) batch.update(doc(queueCol(sessionId), u.id), { order: u.order })
  await batch.commit()
}

export const moveItem = (sessionId: string, items: QueueItem[], id: string, direction: -1 | 1) =>
  applyOrder(sessionId, moveUpdates(items, id, direction))

/** Round-robin the pending queue so everyone gets a turn. Returns how many items moved. */
export async function shareTurns(sessionId: string, items: QueueItem[]) {
  const updates = fairOrder(items)
  await applyOrder(sessionId, updates)
  return updates.length
}

/** Keeps the name shown in a session in sync after the user renames themselves. */
export const updateMemberName = (sessionId: string, uid: string, member: Member) =>
  updateDoc(doc(sessionsCol, sessionId), { [`members.${uid}`]: member })
