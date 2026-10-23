---
name: rules-change
description: Change who can read or write what in Ultrastar Companion (firestore.rules) together with its tests. Use when adding a collection or field that clients write, when a write fails with permission-denied, or when reviewing security.
---

# Changing Firestore rules

1. Write the failing case first in `tests/rules.test.ts`:
   - `assertSucceeds` for what should be allowed;
   - `assertFails` for the closest thing that must stay denied.
2. Edit `firestore.rules`. Keep helpers (`signedIn`, `isAdmin`, `isMember`, `isHost`,
   `changed()`) and use `changed().hasOnly([...])` for partial updates.
3. Run the tests:
   `export PATH=/opt/homebrew/opt/openjdk@21/bin:$PATH && npm run test:rules`. If an emulator
   is already running, use `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npx vitest run tests/`
   instead.
4. If a client query changed shape, check that `allow list` still matches it. For example,
   join-code lookups must use `limit(1)`, and membership queries must use
   `array-contains uid`. Add any needed composite index to `firestore.indexes.json`.
5. Update the table in `docs/DATA.md`.
6. Deploying the rules is a separate, confirmed step (see the `deploy` skill).
