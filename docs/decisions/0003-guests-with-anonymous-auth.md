# 0003. Guests sign in anonymously and can upgrade to Google

- **Status:** Accepted
- **Date:** 2026-10-23

## Context

The original plan required a real account. At a party, though, making people sign in is the
main source of friction.

## Decision

The login screen offers **Entrar como invitado**:

- It uses Firebase anonymous auth, and the guest only types a name.
- Guests are full members (favourites, queue).
- From their profile, a guest can **link Google** (`linkWithPopup`) and keep the same uid and
  all their data.

## Consequences

- Guests who sign out or clear site data lose their favourites. The profile page warns them.
- The rules treat anonymous users like any other signed-in user. Abuse protection relies on
  join codes, App Check and session hosts.
