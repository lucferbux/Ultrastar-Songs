# CLAUDE.md — Ultrastar Companion

A companion PWA for UltraStar karaoke nights. Friends search the song catalog, save favourites
and queue songs for tonight's session from their phones. A TV view shows what's playing now and
what's next. The backend is Firebase (Auth + Firestore + Hosting, project `ultrastar-songs`).
[AGENTS.md](AGENTS.md) is the portable summary for other agents; **update both together.**

This folder is its **own git repo** (`main`, remote `lucferbux/Ultrastar-Songs`). It is
checked out inside a personal monorepo (`apps/ultrastar`) that ignores it. Run `git` from here.

## Read first

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): layout, conventions, bundle.
- [docs/DATA.md](docs/DATA.md): Firestore model, rules table, legacy collections.
- [docs/DESIGN.md](docs/DESIGN.md): the iOS/iPadOS/macOS design system.
- [docs/OPERATIONS.md](docs/OPERATIONS.md): Firebase setup state, credentials, deploys.
- [docs/decisions/](docs/decisions/): ADRs. Add one for structural choices.

## Commands

```bash
npm run dev:emulators   # app against local emulators (start them with `npm run emulators`)
npm run lint            # oxlint, must stay warning-free
npm test                # unit tests (src/**/*.test.ts)
npm run test:rules      # Firestore rule tests (emulator; needs Java 21+)
npm run build           # tsc -b (app, vite config, scripts, tests) + vite build
```

Java is keg-only here: `export PATH=/opt/homebrew/opt/openjdk@21/bin:$PATH` before anything
that uses the emulators.

## Skills (`.claude/skills/`)

- `run-local`: emulators, the real catalog, previewing the three layouts.
- `apple-ui`: how to build screens with the design system.
- `rules-change`: changing `firestore.rules` test-first.
- `catalog-data`: migrate, import, covers, backups, admin role.
- `deploy`: pre-flight checks and shipping rules or hosting. Always ask the user first.

## Hard rules

- **`firestore.rules` is the only security boundary.** Every rule change comes with a test in
  `tests/rules.test.ts`.
- **Writes go through `src/lib/*Api.ts`.** Song ids always come from `songId()`.
- **Don't touch the legacy `songs` / `songsQueue` collections**, and never delete production
  data. That's the user's call, done in the console.
- **Credentials.**
  - Never create service-account keys; scripts use the isolated gcloud profile
    (`npm run auth:admin`).
  - The default gcloud profile is a work account; don't use it.
  - `.env*` files are blocked by the user's permissions; ask the user to edit them.
- **UI copy is in Spanish.** Code, comments and docs are in English.
- **Pin the Firebase versions.** `firebase` stays on v12 until `@firebase/rules-unit-testing`
  supports v13. `overrides` pins `@firebase/app` and `@firebase/app-compat` to single copies,
  because duplicates break auth at runtime ("Component auth has not been registered yet").

## Firebase project state

See the table in [docs/OPERATIONS.md](docs/OPERATIONS.md#firebase-project-setup).

- **Live** at https://ultrastar-songs.web.app: the catalog is migrated, the rules and indexes
  are deployed, hosting is deployed, the web key is restricted, and
  lucasfernandezaragon@gmail.com is admin.
- **Pending:** App Check; restricting the legacy Angular browser key.
