import { useSyncExternalStore } from 'react'

export type Platform = 'ios' | 'ipados' | 'macos'

const queries = {
  coarse: '(pointer: coarse)',
  tablet: '(min-width: 700px) and (min-height: 600px)',
  desktop: '(min-width: 900px)',
}

/**
 * Touch + large screen → iPadOS layout; touch → iOS; mouse on a wide window → macOS.
 * A narrow desktop window falls back to the iOS layout, like a Catalyst app would.
 */
const OVERRIDE_KEY = 'ultrastar.platform'

/** `?platform=ios|ipados|macos` forces a layout (for previewing designs); `?platform=auto` clears it. */
function override(): Platform | null {
  try {
    const param = new URLSearchParams(window.location.search).get('platform')
    if (param === 'auto') localStorage.removeItem(OVERRIDE_KEY)
    else if (param === 'ios' || param === 'ipados' || param === 'macos') localStorage.setItem(OVERRIDE_KEY, param)
    return localStorage.getItem(OVERRIDE_KEY) as Platform | null
  } catch {
    return null
  }
}

function detect(): Platform {
  const forced = override()
  if (forced) return forced
  const m = (q: string) => window.matchMedia(q).matches
  if (m(queries.coarse)) return m(queries.tablet) ? 'ipados' : 'ios'
  return m(queries.desktop) ? 'macos' : 'ios'
}

function subscribe(onChange: () => void) {
  const lists = Object.values(queries).map((q) => window.matchMedia(q))
  for (const l of lists) l.addEventListener('change', onChange)
  return () => lists.forEach((l) => l.removeEventListener('change', onChange))
}

export function usePlatform(): Platform {
  return useSyncExternalStore(subscribe, detect, () => 'ios')
}

/** Mirrors the platform onto <html data-platform> so CSS can adapt. */
export function syncPlatformAttribute() {
  const apply = () => (document.documentElement.dataset.platform = detect())
  apply()
  subscribe(apply)
}
