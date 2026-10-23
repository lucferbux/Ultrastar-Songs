/** Deterministic pleasant gradient for a string (used when there's no cover or photo). */
export function gradientFor(seed: string): string {
  let hash = 0
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) | 0
  const hue = Math.abs(hash) % 360
  return `linear-gradient(135deg, hsl(${hue} 75% 58%), hsl(${(hue + 40) % 360} 80% 48%))`
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?'
}
