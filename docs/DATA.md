# Data model and security

Firestore `(default)` database in project `ultrastar-songs` (location `nam5`, Spark plan).

```text
catalog/{artist--title}          title, artist, genre?, year?, language?, edition?, duet,
                                 coverUrl?, coverLargeUrl?, coverChecked?, tags[], source,
                                 addedAt, updatedAt
users/{uid}                      displayName, photoURL, role: admin | member, isGuest
users/{uid}/favorites/{songId}   addedAt
sessions/{id}                    name, date (YYYY-MM-DD), hostUid, joinCode (6 chars),
                                 status: open | closed, memberUids[], members{uid → {name, photoURL}},
                                 createdAt
sessions/{id}/queue/{itemId}     songId, song{title, artist, duet}, singers[{uid, name}],
                                 addedBy, order, status: pending | singing | done | skipped,
                                 createdAt
```

## Legacy collections

The old apps (the 2018 Angular app and an iOS app) left these behind:

- **`songs`:** ~1,039 legacy songs with random ids and string fields (`Title`, `Artist`,
  `Genre`, `Year`). This is where the catalog was copied from. Leave it in place as a backup.
- **`songsQueue`:** one test document from 2021.
- **`users`:** documents of the form `{ email, uid }`. The app reuses these:
  `ensureProfile` fills in a missing `displayName`.

Once the new rules are deployed, nothing can read or write `songs` or `songsQueue`.

## Security rules

The rules are in [`firestore.rules`](../firestore.rules) and tested in
[`tests/rules.test.ts`](../tests/rules.test.ts).

| Collection | Read | Write |
| ---------- | ---- | ----- |
| `catalog` | Any signed-in user, including guests | Admins only |
| `users/{uid}` | The owner and admins. Profiles are private because legacy docs hold emails. | The owner, who can't change `role`. Admins can change anything. |
| `favorites` | The owner | The owner |
| `sessions` | `get`: any signed-in user. `list`: only queries with `limit 1` (join-code lookup) or sessions you belong to. | Create: as host. Join: add only yourself while the session is open. Members can change only their own name. The host or an admin can change everything except `hostUid`. |
| `queue` | Members and the host | Members add items as themselves while the session is open. The host or an admin reorders and changes status. The person who added an item can fix its singers or remove it while it's pending. |

## Roles

- **Member:** the default for every account, including guests (anonymous auth).
- **Admin:** set with `npm run set-admin -- <email>`. Admins can edit the catalog in-app
  (`/admin`) and run any session.

## Catalog pipeline

1. `npm run backup:legacy` downloads the legacy `songs` collection to
   `backups/legacy-songs.json`. It only works while the legacy rules allow public reads.
2. `npm run migrate` copies `songs` into `catalog`. It normalises genres, drops `-`
   placeholders and merges duplicates (9 of them).
3. `npm run covers` adds Deezer cover art (250 px for lists, 1000 px for the TV view) and marks
   songs with no match.
4. `npm run import:txt -- <UltraStar songs folder>` adds language, edition and duet data from the
   real song files. Run it again whenever you add songs to the game.
