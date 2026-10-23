---
name: deploy
description: Ship Ultrastar Companion to Firebase (rules, indexes, hosting) safely. Use when asked to deploy, release, publish, push to production or update the live app or its security rules.
---

# Deploy

Deploying is outward-facing. **Confirm with the user before running any `firebase deploy`.**

## Pre-flight (all must pass)

```bash
npm run lint && npm test && npm run build
export PATH=/opt/homebrew/opt/openjdk@21/bin:$PATH && npm run test:rules
npm run backup          # snapshot of catalog + sessions before changing anything
```

## Ship

| What changed | Command |
| ------------ | ------- |
| `firestore.rules` / `firestore.indexes.json` | `npm run deploy:rules` |
| App code | `npm run deploy` (build + hosting) |
| Try it before going live | `npx firebase hosting:channel:deploy preview --expires 7d` |

These need `npx firebase login` with the account that owns `ultrastar-songs`. Check it with
`npx firebase login:list`. Never deploy with the work account.

## After deploying

- Open https://ultrastar-songs.web.app on a phone. Sign in, open a session and add a song.
- If the rules changed, confirm that a non-member gets "permission denied" on another
  session's queue.
- Update the status table in `docs/OPERATIONS.md`.
