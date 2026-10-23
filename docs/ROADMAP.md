# Roadmap

## Before the first real karaoke night

- [ ] `npm run auth:admin` → `migrate` → `covers` → `deploy:rules` → `deploy` → `set-admin` → `restrict-key`
      (see [OPERATIONS.md](OPERATIONS.md#first-production-run)).
- [ ] `npm run import:txt` with the UltraStar songs folder, for languages and duets.
- [ ] Remove the legacy `songsQueue` test document and old `users` profiles you don't recognise
      (Firebase console).

## Next

- [ ] App Check with reCAPTCHA Enterprise, then enforcement (see OPERATIONS.md).
- [ ] Drag-and-drop reordering for the host (currently ↑ / ↓ buttons).
- [ ] Votes on queued songs, and per-person history and stats ("most sung").
- [ ] Upload `#COVER` files from the `.txt` importer to Storage when Deezer has no match (~100 songs).
- [ ] Web Push "it's your turn" notifications. In-app banner and vibration already work.
- [ ] Playwright end-to-end tests against the emulators.

## Ideas

- Suggestions based on the group's favourites.
- Scores typed in after each song.
- A dedicated tvOS-style "stage" theme for the TV view.
