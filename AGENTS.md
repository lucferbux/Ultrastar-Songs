# AGENTS.md

Portable guide for AI coding agents working on **Ultrastar Companion**. Claude Code reads
[CLAUDE.md](CLAUDE.md); keep the two files in sync.

## What it is

A React 19 + Vite + TypeScript PWA for UltraStar karaoke nights. Users search the song
catalog, keep favourites and queue songs in a live shared session; a TV view shows the
queue. The backend is Firebase: Auth (Google, email link, anonymous guests), Firestore and
Hosting, in project `ultrastar-songs`. There is no app server, so the security rules are the
only security boundary.

## Setup and checks

```bash
npm ci
npm run lint && npm test && npm run build      # must all pass
npm run test:rules                             # needs Java 21+ (Firestore emulator)
npm run emulators & npm run seed && npm run dev:emulators   # local app, sign in as a guest
```

## Where things are

- `src/lib/`: pure logic and every Firestore write (`*Api.ts`). Has unit tests.
- `src/ui/`: design-system primitives. `src/styles/` holds tokens, base, components and layout.
- `src/features/<area>/`: screens and hooks.
- `src/app/Shell.tsx`: per-platform chrome (iPhone tab bar, iPad top bar, Mac sidebar).
- `scripts/`: firebase-admin data scripts (migrate, import, covers, backup, roles).
- `firestore.rules` + `tests/rules.test.ts`: permissions and their tests.
- `docs/`: architecture, data model, design system, operations, ADRs and the roadmap.

## Rules

1. Any change to `firestore.rules` needs matching tests in `tests/rules.test.ts`.
2. Catalog ids are always `songId(artist, title)`. Write songs through
   `upsertSongs` / `saveSong` only.
3. Don't modify the legacy `songs` / `songsQueue` collections, and don't delete production
   data.
4. Don't deploy, push, or run scripts that write to production without explicit approval.
5. Don't commit secrets. `.env.local`, `service-account*.json` and `backups/` are git-ignored.
   Prefer user ADC credentials over service-account keys.
6. UI text is in Spanish; code, comments and docs are in English.
7. Use the design tokens and primitives (see `docs/DESIGN.md`), and check the iPhone, iPad and
   Mac layouts with `?platform=ios|ipados|macos`.
8. Keep `firebase` on v12, with the single-copy `overrides` in `package.json`.
