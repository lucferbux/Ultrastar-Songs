# 0001. Firebase + React PWA, no native apps

- **Status:** Accepted
- **Date:** 2026-10-23

## Context

Everyone at a karaoke night uses their own phone, and nobody wants to install an app for one
evening. The song data already lives in the Firebase project `ultrastar-songs`.

## Decision

Build a Vite + React + TypeScript **PWA** on the existing Firebase project:

- Auth handles sign-in.
- Firestore stores the data and pushes live updates.
- Hosting serves the app.

There is no app server and no native iOS app.

## Consequences

- People join by scanning a QR code; installing to the Home Screen is optional.
- `firestore.rules` is the only security boundary, so every rule change needs a rule test.
- The project stays on the free Spark plan. That rules out Cloud Functions, so enrichment and
  backups are local scripts.
