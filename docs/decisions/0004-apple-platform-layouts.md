# 0004. One codebase, three Apple-style layouts

- **Status:** Accepted
- **Date:** 2026-10-23

## Context

The app should feel at home on iPhone, iPad and Mac, without separate native apps.

## Decision

Detect the platform from the pointer type and the screen size, write it to
`<html data-platform>`, and switch the chrome and density in CSS:

- **iPhone:** bottom liquid-glass tab bar.
- **iPad:** floating top tab bar.
- **Mac:** floating glass sidebar.

The components are shared. `?platform=` forces a layout so the designs can be previewed.

## Consequences

- Every new screen has to be checked in all three layouts.
- Detection is a heuristic (a touch laptop counts as an iPad). That's acceptable, because each
  layout works everywhere.
