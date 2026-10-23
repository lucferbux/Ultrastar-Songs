# Architecture

Ultrastar Companion is a client-only PWA. There is no app server: the browser talks to
Firebase directly, and **security lives entirely in [`firestore.rules`](../firestore.rules)**.

```
 phone / iPad / Mac browser (PWA)
 ┌───────────────────────────────────────────┐
 │ React 19 + React Router (lazy routes)     │
 │  ├─ AuthProvider     → Firebase Auth      │  Google · email link · anonymous guests
 │  ├─ CatalogProvider  → catalog/* (once,   │  offline cache + MiniSearch index
 │  │                     then from cache)   │
 │  └─ CurrentSession   → sessions/{id}      │  live onSnapshot
 │                        + queue/* (live)   │
 └───────────────────────────────────────────┘
                     │
            Firebase project `ultrastar-songs`
            Auth · Firestore (nam5) · Hosting
                     ▲
 data scripts (Node, firebase-admin, your own Google account via gcloud ADC)
 migrate-legacy · import-txt · enrich-covers (Deezer) · backup · set-admin
```

## Source layout

| Path | What lives there |
| ---- | ---------------- |
| `src/lib/` | Framework-free logic. Safe to import from Node scripts, and covered by unit tests. |
| `src/lib/firebase.ts` | Firebase init: emulators when `VITE_USE_EMULATORS=true`, App Check when a site key is set. |
| `src/lib/sessionsApi.ts`, `catalogApi.ts`, `profileApi.ts` | Every Firestore write the app makes. |
| `src/lib/queue.ts` | Queue ordering, fair turn rotation, "it's your turn", join codes. |
| `src/lib/search.ts`, `genres.ts`, `languages.ts` | Search index, filters and data normalisation. |
| `src/ui/` | Design-system primitives (see [DESIGN.md](DESIGN.md)). |
| `src/app/Shell.tsx` | Per-platform chrome: iPhone tab bar, iPad top tab bar, Mac sidebar, banners. |
| `src/features/<area>/` | Screens and hooks: `auth`, `catalog`, `favorites`, `sessions`, `profile`, `admin`. |
| `scripts/` | Admin and data scripts (Node + `firebase-admin`). |
| `tests/rules.test.ts` | Security-rule tests run against the Firestore emulator. |

## Conventions

- **Context files.** Each context has a `xxxContext.ts` holding the context object and its
  hooks, and an `XxxProvider.tsx` holding the component. A file that exports components exports
  only components, which keeps Fast Refresh working.
- **Lazy routes.** Every route except login and the catalog is loaded on demand with
  `React.lazy`, so those page modules use `export default`.
- **Visible errors.** Writes go through `useToast().run(promise, successMessage)`, which shows
  failures as toasts instead of swallowing them.
- **Stable song ids.** Song ids are `artist--title` slugs (`songId()`), so importers can run
  again and update the same documents instead of creating duplicates.
- **Data normalisation.** Genres collapse into about 16 canonical ones, and the original genre
  text is kept in `tags`. Languages are mapped to Spanish labels.

## Bundle

Vite splits the build into these chunks:

- `react`
- `firebase` (app and auth)
- `firebase-firestore` (~165 kB gzip — this is the SDK itself)
- the main app
- one chunk per lazy route

The service worker (`vite-plugin-pwa`, autoUpdate) precaches the app shell. It also keeps
Deezer cover images in a cache-first runtime cache so the catalog looks right offline.
