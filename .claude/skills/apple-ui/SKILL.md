---
name: apple-ui
description: Build or change Ultrastar Companion screens so they look native on iPhone (iOS 26 liquid glass), iPad (iPadOS 26) and Mac (macOS Tahoe/27). Use when adding a page, component, sheet, list or visual change, or when asked about the design system, icons or theming.
---

# Apple-style UI

Read `docs/DESIGN.md` first. Then:

1. **Reuse the primitives** in `src/ui/` (`PageHeader`, `SearchField`, `Sheet`, `Cover`,
   `Avatar`, `Empty`, `Icon`) and the CSS classes (`.list` / `.row`, `.btn-*`, `.icon-btn`,
   `.pill`, `.card`, `.hero`, `.glass`) before writing new CSS.
2. **Use tokens only:** colours `--label*`, `--bg*`, `--fill*`, `--accent*`, plus the radii and
   `--spring`. Never hard-code a colour. Every surface must work in dark mode.
3. **Add icons to `src/ui/Icon.tsx`** as 24 × 24 round-cap line paths, in SF Symbols style.
   Never use emoji in chrome.
4. **Handle platform differences in CSS** with `[data-platform='ios'|'ipados'|'macos']`. Use
   `usePlatform()` in JS only when the structure changes (as `Shell` does).
5. **Spanish UI copy.** Use sentence case, short and friendly, the way Apple's Spanish UI is
   written. Code and comments are in English.
6. **Check all three layouts** in the browser with `?platform=ios|ipados|macos` (see the
   `run-local` skill), in both light and dark mode, and with long titles.
7. **Writes.** Wrap them in `useToast().run(promise, 'Mensaje de éxito')`. Show a `Loading` or
   `Empty` state instead of a blank area.
8. **App icon changes.** Edit `public/icon.svg` and `design/icon-full.svg` together, then run
   `npm run icons`.
