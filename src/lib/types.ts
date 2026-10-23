import type { Timestamp } from 'firebase/firestore'

export type SongSource = 'legacy' | 'manual' | 'txt-import'

/** Song data without Firestore-managed fields — what importers produce. */
export interface SongData {
  title: string
  artist: string
  genre?: string
  year?: number
  language?: string
  edition?: string
  duet: boolean
  coverUrl?: string
  /** ~1000px cover for the TV view. */
  coverLargeUrl?: string
  tags: string[]
  source: SongSource
}

export interface Song extends SongData {
  id: string
}

export type Role = 'admin' | 'member'

export interface UserProfile {
  displayName?: string
  photoURL?: string | null
  role?: Role
  /** Signed in anonymously from the join QR; can be upgraded to Google later. */
  isGuest?: boolean
}

export interface Member {
  name: string
  photoURL: string | null
}

export type SessionStatus = 'open' | 'closed'

export interface Session {
  id: string
  name: string
  date: string // YYYY-MM-DD
  hostUid: string
  joinCode: string
  status: SessionStatus
  memberUids: string[]
  members: Record<string, Member>
  createdAt: Timestamp | null
}

export type QueueStatus = 'pending' | 'singing' | 'done' | 'skipped'

export interface Singer {
  uid: string
  name: string
}

export interface QueueItem {
  id: string
  songId: string
  song: { title: string; artist: string; duet: boolean }
  singers: Singer[]
  addedBy: string
  order: number
  status: QueueStatus
}
