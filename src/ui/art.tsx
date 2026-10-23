import { gradientFor, initials } from './artUtils'
import { Icon } from './Icon'

export function Cover({ src, seed, size = '' }: { src?: string; seed: string; size?: '' | 'large' | 'huge' }) {
  return (
    <div className={`cover ${size}`} style={src ? undefined : { background: gradientFor(seed) }}>
      {src ? <img src={src} alt="" loading="lazy" /> : <Icon name="music" size={size ? 40 : 20} />}
    </div>
  )
}

export function Avatar({ name, photo, large }: { name: string; photo?: string | null; large?: boolean }) {
  return (
    <span className={`avatar ${large ? 'large' : ''}`} style={photo ? undefined : { background: gradientFor(name) }} title={name}>
      {photo ? <img src={photo} alt="" referrerPolicy="no-referrer" /> : initials(name)}
    </span>
  )
}
