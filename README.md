<p align="center">
  <img src="public/icon.svg" width="120" alt="Ultrastar icon" />
</p>

<h1 align="center">Ultrastar Companion</h1>

<p align="center">
  A companion app for <a href="https://usdx.eu">UltraStar</a> karaoke nights.<br/>
  Search the song catalog, save favourites and queue up for tonight's session from your phone.
</p>

---

## Features

- **Catalog of ~1,000 songs:**
  - instant search that tolerates typos and ignores accents;
  - filters by genre, decade, language and duets;
  - cover art for 90% of the songs;
  - 🔀 *Sorpréndeme* for a random pick.
- **Favourites:** your "songs I want to sing" list, kept between nights.
- **Sessions:**
  - create tonight's session and get a 6-letter code and a QR code;
  - join by scanning the QR, entering the code, or opening a link;
  - guests can join without an account.
- **Live queue:**
  - add a song and pick who sings it (solo or duet);
  - the host starts the next song, reorders, skips, and can **share out turns fairly**
    (round-robin, so the people who sang longest ago go first);
  - a *¡Te toca!* banner tells you when you're up or next.
- **TV view:** a big-screen "now playing" page with blurred album art, the next songs and the
  join QR. It keeps the screen awake.
- **Admin:** edit, add and remove songs from the catalog.
- **Native look on each platform:**
  - iPhone: a liquid-glass tab bar;
  - iPad: a floating top tab bar;
  - Mac: a glass sidebar.

  All three have light and dark modes, and the app can be installed as a PWA.

## Stack

| Layer | Choice |
| ----- | ------ |
| App | React 19, Vite 8, TypeScript, React Router 7, plain CSS design system, `vite-plugin-pwa` |
| Search | MiniSearch in the browser, over an offline-cached catalog |
| Backend | Firebase (Auth, Firestore, Hosting), project `ultrastar-songs` |
| Data scripts | Node + `firebase-admin` (`tsx`) |
| Quality | oxlint, Vitest unit tests, Firestore rule tests on the emulator, GitHub Actions CI |

## Getting started

```bash
npm install
cp .env.example .env.local     # Firebase web config (public values)

# Local, against the emulators (needs Java 21+):
npm run emulators              # terminal 1
npm run seed                   # terminal 2: sample songs
npm run dev:emulators          # http://localhost:5173 → "Entrar como invitado"
```

Add `?platform=ios`, `?platform=ipados` or `?platform=macos` to any URL to preview each layout.

## Scripts

| Command | What it does |
| ------- | ------------ |
| `npm run dev` / `dev:emulators` | Dev server against production / against the local emulators |
| `npm run lint` · `test` · `test:rules` · `build` | Quality gates |
| `npm run emulators` · `seed` | Local Firebase emulators; load sample songs |
| `npm run auth:admin` | One-time sign-in for the admin scripts (isolated gcloud profile) |
| `npm run backup:legacy` · `migrate` | Snapshot the legacy songs and copy them into `catalog` |
| `npm run import:txt -- <folder>` | Import songs from an UltraStar songs folder |
| `npm run covers` | Add Deezer cover art |
| `npm run backup` | Export the catalog and sessions to `backups/<date>/` |
| `npm run set-admin -- <email>` | Give someone the admin role |
| `npm run icons` | Render the PWA and Apple icons from the SVG artwork |
| `npm run deploy:rules` · `deploy` · `restrict-key` | Ship the rules, ship hosting, lock the API key |

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Data model and security](docs/DATA.md)
- [Design system](docs/DESIGN.md)
- [Operations and deploys](docs/OPERATIONS.md)
- [Decisions](docs/decisions/)
- [Roadmap](docs/ROADMAP.md)

AI agents: see [CLAUDE.md](CLAUDE.md) / [AGENTS.md](AGENTS.md) and the project skills in
[`.claude/skills/`](.claude/skills/).

## History

This replaces [ultrastarSongsAngular](https://github.com/lucferbux/ultrastarSongsAngular)
(2018), a read-only table of songs from Firebase. The song data carried over; the code did not.
