# Design system

The app should feel native on each Apple platform without being a native app. It applies one
of three layouts, chosen in [`src/ui/platform.ts`](../src/ui/platform.ts) and written to
`<html data-platform="…">`:

| Platform | When | Chrome |
| -------- | ---- | ------ |
| `ios` | Touch screen and small, or a narrow desktop window | Large titles that collapse into a blurred nav bar. A floating **liquid-glass tab bar** at the bottom, with a sliding "lens" under the active tab. The "it's your turn" banner sits just above the tab bar, like the Music mini player. Sheets slide up from the bottom. |
| `ipados` | Touch screen and ≥ 700 × 600 px | **Landscape (≥ 1024 px):** an edge-to-edge sidebar in the iPadOS 27 style, touch-sized, with an accent-filled selection. **Portrait:** a floating glass tab bar at the top, centred. Two-column session layout. Sheets appear as centred dialogs. Toasts appear top-right. |
| `macos` | Mouse/trackpad and ≥ 900 px wide | An **edge-to-edge translucent sidebar** in the macOS 27 style: flush with the window, a hairline separator, and colour per destination. Denser 13 px type. Music.app-style rows with genre and year columns. Dialogs, and toasts top-right. |

To preview a layout from any browser, add `?platform=ios|ipados|macos` to the URL. The choice
is remembered in `localStorage`; `?platform=auto` clears it.

## Tokens ([`src/styles/tokens.css`](../src/styles/tokens.css))

- **Colour.** Apple system colours, with grouped backgrounds (`--bg`, `--bg-elevated`), label
  levels (`--label`, `--label-2`, `--label-3`), fills and separators. A full dark palette is
  applied with `prefers-color-scheme`.
- **Accent.** A single violet-indigo hue, `--accent`. `--accent-gradient` is a subtle vertical
  shade of that one hue, used on filled buttons.
- **Stage.** `--stage` is the icon's dark aubergine with a violet halo. It's used for the "Now
  playing" card and the TV view.
- **Sidebar colours.** `--pink`, `--yellow`, `--orange`, `--blue`, `--gray`. Each sidebar
  destination keeps its own colour.
- **Glass.** `--glass-bg`, `--glass-border`, `--glass-highlight`, `--glass-shadow`, and
  `--glass-blur` (`blur(22px) saturate(190%)`).
- **Motion.** `--spring` (`cubic-bezier(.32,.72,0,1)`) for anything that moves. Every animation
  respects `prefers-reduced-motion`.

## Primitives

| Class / component | Use |
| ----------------- | --- |
| `.glass` | The liquid-glass material: translucent background with blur and saturation, an inner top highlight, a soft-light specular sheen, and a layered shadow. |
| `<PageHeader>` | Large title with subtitle and actions. Collapses into the compact nav bar on iPhone. |
| `<SearchField>` | iOS search field, or a capsule on macOS. |
| `.pill` + native `<select>` | Filter capsules. They use the native picker, which feels right on iOS and macOS. |
| `.list` / `.row` | Inset grouped lists. Separators are inset past the artwork. |
| `.btn-filled / -tinted / -gray / -plain / -destructive / -glass` | Button styles. |
| `.icon-btn` | Circular icon buttons (`tinted`, `filled`, `plain`, `done`, `danger`). |
| `<Sheet>` | Bottom sheet with a grabber on iPhone; a centred dialog elsewhere. |
| `<Cover>`, `<Avatar>` | Artwork and people. When there is no image, they fall back to a deterministic gradient. |
| `.hero` | The gradient "Now playing" card. |
| `<Icon>` | SF Symbols–style line icons, drawn in-house (24 × 24, `currentColor`). |
| Toasts | `useToast().show()` / `.run()`. |

## App icon

[`public/icon.svg`](../public/icon.svg) has rounded corners and is used as the favicon and the
"any" icon. [`design/icon-full.svg`](../design/icon-full.svg) is full-bleed, because iOS and
maskable icons crop to their own shape. `npm run icons` renders the PNGs: the 180 px Apple touch
icon, 192 and 512 px icons, the 512 px maskable icon and a 64 px favicon.

The artwork is a silver microphone with two pairs of thin violet sound waves and a soft halo,
on a dark aubergine-to-graphite background. It's deliberately quiet, like a system app icon.
