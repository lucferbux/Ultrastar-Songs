# 0005. Edge-to-edge sidebars (macOS 27 / iPadOS 27) and a calmer brand

- **Status:** Accepted. Supersedes the Mac sidebar part of [0004](0004-apple-platform-layouts.md).
- **Date:** 2026-10-24

## Context

ADR 0004 copied the macOS 26 / iPadOS 26 look: the sidebar was an inset, floating glass panel.

macOS 27 (Golden Gate) and iPadOS 27 reverse that. Sidebars reach the window edge again. They
are still Liquid Glass, but now part of the window, and their icons have colour again. Tab bars
are unchanged.

Separately, the first brand pass was a violet → magenta → orange gradient with stage beams and
sparkles. It was felt to be loud.

## Decision

- **Mac:** an edge-to-edge translucent sidebar with a hairline separator, a colour per
  destination (Songs pink, Favourites yellow, Session violet, TV blue, Sessions orange, Admin
  gray) and a gray rounded selection.
- **iPad in landscape (≥ 1024 px):** the same sidebar, touch-sized, with an accent-filled
  selection. In portrait it keeps the floating top tab bar.
- **iPhone:** keeps the floating liquid-glass tab bar.
- **Brand:** one violet-indigo accent. The new icon is a silver microphone with thin violet
  waves on dark aubergine. The hero card and TV use the same dark "stage" surface. The login
  screen has one subtle halo instead of colour blobs.

## Consequences

- `Shell` picks a split view for Mac and wide iPads, and a tab bar otherwise.
- The layout CSS uses `.split` / `.split-main`; `--sidebar-w` is 240 px on Mac and 300 px on iPad.
