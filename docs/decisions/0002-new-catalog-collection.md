# 0002. New `catalog` collection; legacy `songs` stays read-only

- **Status:** Accepted
- **Date:** 2026-10-23

## Context

The old apps left ~1,039 songs in Firestore `songs`. They use random ids and capitalised
string fields, 256 of them have the genre `"-"`, and there are 136 free-text genres. The
Realtime Database the 2018 app read from is empty.

## Decision

Copy `songs` into a new **`catalog`** collection. In the copy:

- ids are stable `artist--title` slugs;
- fields are typed;
- genres collapse into about 16 canonical ones, with the original kept as a tag.

Every importer (legacy, UltraStar `.txt`, admin UI) writes through the same id function.
`songs` is left untouched as a backup.

## Consequences

- Re-running an importer updates songs instead of duplicating them.
- Two collections hold song data until `songs` is deleted manually, if ever.
- Once the new rules are deployed, nothing can read `songs` from a client.
