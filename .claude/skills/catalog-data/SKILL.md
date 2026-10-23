---
name: catalog-data
description: Import, migrate, enrich, normalise or back up the Ultrastar song catalog in Firestore (legacy songs collection, UltraStar .txt folders, Deezer covers, genres/languages, admin role). Use for any data task on catalog/*, users roles or backups.
---

# Catalog data operations

All scripts live in `scripts/` and use `firebase-admin` through `scripts/admin.ts`:

- **Production:** credentials come from the isolated gcloud profile (`npm run auth:admin`).
  Never use the default gcloud profile; it belongs to a work account.
- **Emulator:** set `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`.

**Always `--dry-run` first** wherever a script supports it, and `npm run backup` before writing
to production.

| Task | Command |
| ---- | ------- |
| Snapshot the legacy `songs` collection (public REST, read-only) | `npm run backup:legacy` |
| Legacy `songs` → `catalog` | `npm run migrate -- --dry-run`, then `npm run migrate` (or `--from-file backups/legacy-songs.json`) |
| UltraStar song folder → `catalog` | `npm run import:txt -- "<folder>" --dry-run` |
| Cover art (Deezer, rate limited) | `npm run covers -- --dry-run --limit 20`, then `npm run covers` |
| Back up catalog + sessions | `npm run backup` |
| Make a user admin | `npm run set-admin -- <email>` |

## Rules of the road

- Every write to `catalog` goes through `upsertSongs()` (scripts) or `saveSong()` (app), so ids
  stay `songId(artist, title)`. Never use random ids.
- Normalisation lives in `src/lib/genres.ts` and `src/lib/languages.ts`. If you extend it, add
  cases to `src/lib/lib.test.ts`, re-run the importer, and check the facet counts in `/admin`.
- `upsertSongs` keeps existing `tags` and any field the import doesn't set. Admin edits survive
  re-imports unless the import provides that field.
- Don't modify or delete the legacy `songs` / `songsQueue` collections. Deleting data is the
  user's call, done in the console.
