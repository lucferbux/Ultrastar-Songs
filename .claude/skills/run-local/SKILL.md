---
name: run-local
description: Run Ultrastar Companion locally against the Firebase emulators with the real song catalog, and preview the iPhone/iPad/Mac layouts. Use when asked to run, start, try, demo or screenshot the app, or to check a UI change in the browser.
---

# Run locally

The emulators need **Java 21+**. On this Mac it is keg-only, so put it on the PATH first:
`export PATH=/opt/homebrew/opt/openjdk@21/bin:$PATH`.

1. **Emulators** (run in the background): `npm run emulators`. It's ready when the output says
   `All emulators ready`. Auth is on :9099, Firestore on :8080 and the UI on :4000.
2. **Data** (a separate shell):
   - The real catalog, if `backups/legacy-songs.json` exists:
     `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npx tsx scripts/migrate-legacy.ts --from-file backups/legacy-songs.json`
   - Otherwise, about 18 sample songs: `npm run seed`.
   - Optional covers (≈4 min for 1,000 songs): `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm run covers`.
3. **App:** `npm run dev:emulators` → http://localhost:5173. Sign in with **Entrar como
   invitado**, which needs no account.
4. **Layouts:** append `?platform=ios`, `?platform=ipados` or `?platform=macos` to any URL.
   `?platform=auto` resets it.
5. **Two users:** open a second browser profile or an incognito window, join with the session
   code, and check that queue changes show up live in both windows and in `/s/<id>/tv`.

## Gotchas

- **A blank page with "Component auth has not been registered yet"** means Vite's dependency
  cache is stale, or `@firebase/app` is installed twice. Restart with `npx vite --force`, and
  check `npm ls @firebase/app` (the `overrides` in `package.json` pin a single copy).
- **`emulators:exec` fails because the port is in use:** an emulator is already running. Point
  the command at it with `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080` instead.
- **Don't touch `.env*` files.** The user's permission settings block them. The emulators are
  selected with the `VITE_USE_EMULATORS=true` environment variable (`npm run dev:emulators`).
