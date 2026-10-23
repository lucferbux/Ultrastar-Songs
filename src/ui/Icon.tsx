/** SF Symbols–style line icons (24×24, round caps, `currentColor`). */
const PATHS = {
  search: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM15.3 15.3 20 20',
  star: 'm12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8L12 3.6Z',
  mic: 'M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM6 11a6 6 0 0 0 12 0M12 17v4M9 21h6',
  music: 'M9 18V6l11-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM9 10l11-2',
  list: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01',
  calendar: 'M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM4 10h16M8 3v4M16 3v4',
  person: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20.5a7.5 7.5 0 0 1 15 0',
  people:
    'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20a6.5 6.5 0 0 1 13 0M16 4.3a3.5 3.5 0 0 1 0 6.4M18 14a6.5 6.5 0 0 1 3.5 6',
  plus: 'M12 5v14M5 12h14',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  xmark: 'M6 6l12 12M18 6 6 18',
  chevronRight: 'm9 5 7 7-7 7',
  chevronLeft: 'm15 5-7 7 7 7',
  chevronDown: 'm5 9 7 7 7-7',
  arrowUp: 'M12 19V5M6 11l6-6 6 6',
  arrowDown: 'M12 5v14M6 13l6 6 6-6',
  forward: 'M4 6v12l8-6-8-6ZM12 6v12l8-6-8-6Z',
  skip: 'M5 6v12l9-6-9-6ZM18 6v12',
  play: 'M7 5v14l11-7L7 5Z',
  tv: 'M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM8 21h8M12 17v4',
  qr: 'M4 4h6v6H4V4ZM14 4h6v6h-6V4ZM4 14h6v6H4v-6ZM14 14h2v2h-2zM18 14h2M14 18h2M18 18h2v2M18 16v2',
  shuffle: 'M3 7h3.5c4 0 7 10 11 10H21M3 17h3.5c1.6 0 3-1.6 4.2-3.6M13.3 9.6C14.5 8 15.8 7 17.5 7H21M18 4l3 3-3 3M18 14l3 3-3 3',
  sparkles: 'M10 3.5 11.6 8 16 9.5 11.6 11 10 15.5 8.4 11 4 9.5 8.4 8 10 3.5ZM17.5 14l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1Z',
  wand: 'M4 20 15 9M14 4v2M19 9h2M17.5 5.5 19 4M17.5 12.5 19 14M10.5 5.5 9 4',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 13.5l1.6 1.2-2 3.4-1.9-.7a7 7 0 0 1-2.1 1.2L14.7 21h-4l-.3-2.4a7 7 0 0 1-2.1-1.2l-1.9.7-2-3.4 1.6-1.2a7 7 0 0 1 0-2.9L4.4 9.4l2-3.4 1.9.7a7 7 0 0 1 2.1-1.2L10.7 3h4l.3 2.5a7 7 0 0 1 2.1 1.2l1.9-.7 2 3.4-1.6 1.2a7 7 0 0 1 0 2.9Z',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M9 7V4h6v3',
  pencil: 'M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4',
  logout: 'M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l-4 4 4 4M6 12h10',
  wifiOff: 'M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 12.6a10 10 0 0 1 4.3-2.4M19 12.6a10 10 0 0 0-2.4-1.6M2 8.8a15 15 0 0 1 3.4-2.2M22 8.8A15 15 0 0 0 10.7 5M12 20h.01',
  crown: 'M4 18h16M4 18 3 7l5 4 4-6 4 6 5-4-1 11',
  bell: 'M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2ZM10 21h4',
  share: 'M12 3v12M7 8l5-5 5 5M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6',
  sliders: 'M4 7h10M18 7h2M4 17h2M10 17h10M16 4v6M8 14v6',
  google: '',
} as const

export type IconName = keyof typeof PATHS

interface Props {
  name: IconName
  size?: number
  filled?: boolean
  className?: string
  strokeWidth?: number
}

export function Icon({ name, size = 22, filled = false, className, strokeWidth = 1.8 }: Props) {
  if (name === 'google') return <GoogleMark size={size} />
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}

function GoogleMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2-1.9 3.2-4.7 3.2-8Z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8l3.7-2.8Z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4Z" />
    </svg>
  )
}
