# Operations

## Firebase project setup

| Item | State |
| ---- | ----- |
| Web app "Ultrastar Companion" (`1:115752466609:web:dad06851d439bb575d8a90`) | ✅ registered |
| Auth: Google | ✅ enabled. Public name is "Ultrastar". |
| Auth: email link (passwordless) | ✅ enabled |
| Auth: anonymous (guests) | ✅ enabled |
| Authorised domains | ✅ `localhost`, `ultrastar-songs.firebaseapp.com`, `ultrastar-songs.web.app` |
| Service Usage API + API Keys API | ✅ enabled (needed by `firebase deploy` and `restrict-key`; free) |
| Firestore rules and indexes | ✅ deployed 2026-10-23. The legacy open rules are gone. |
| `catalog` migrated | ✅ 1,030 songs, covers from Deezer |
| Hosting | ✅ https://ultrastar-songs.web.app |
| Admin | ✅ lucasfernandezaragon@gmail.com |
| Browser API key restricted to our domains | ✅ web.app, firebaseapp.com, localhost:5173/4173 |
| Legacy Angular browser key (in old public git history, unrestricted) | ⚠️ restrict or delete it |
| App Check (reCAPTCHA Enterprise) | ⏳ optional. See below. |

## Credentials

- **Web config:** goes in `.env.local` (copy `.env.example`). It's public by design, because it
  ends up in the bundle.
- **Admin scripts:** use your own Google account, not a service-account key.

  ```bash
  npm run auth:admin   # one-time: signs in through an isolated gcloud profile (~/.config/gcloud-ultrastar)
  ```

  This leaves your default gcloud profile alone (it may belong to another account).
  `GOOGLE_APPLICATION_CREDENTIALS` overrides it.
- **Firebase CLI deploys:** `npx firebase login` once with the account that owns the project.

## First production run

```bash
npm run auth:admin                      # 1. credentials for the scripts
npm run backup:legacy                   # 2. local copy of the legacy songs
npm run migrate -- --dry-run && npm run migrate
npm run covers                          # ~4 min, Deezer rate limit
npx firebase login
npm run deploy:rules                    # 3. replaces the legacy open rules
npm run deploy                          # 4. build + hosting
# open https://ultrastar-songs.web.app, sign in once, then:
npm run set-admin -- you@example.com
npm run restrict-key                    # 5. lock the browser API key to our domains
```

## Routine tasks

| Task | Command |
| ---- | ------- |
| Back up the catalog and sessions | `npm run backup` → `backups/<date>/` |
| Add new songs from the game | `npm run import:txt -- "/path/to/UltraStar/songs"`, then `npm run covers` |
| See who signed in recently | `npm run users` |
| Make someone an admin | `npm run set-admin -- email` |
| Preview a deploy | `npx firebase hosting:channel:deploy preview` |

## App Check (optional hardening)

1. In Google Cloud, go to **reCAPTCHA Enterprise**, create a *website* key, and add the domains.
2. In the Firebase console, go to **App Check**, register the web app with that key, and set
   `VITE_APPCHECK_SITE_KEY` in `.env.local`.
3. Deploy, and watch App Check → Metrics for a few days.
4. Once the metrics show almost no unverified requests, **Enforce** it for Firestore and Auth.

## Limits (Spark plan)

- Firestore allows 50k reads and 20k writes a day. Each new device downloads the catalog once
  (~1,000 reads) and reads it from the offline cache after that.
- There are no Cloud Functions and no managed backups. That's why enrichment and backups are
  local scripts.
