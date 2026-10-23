import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

export function Empty({ icon, title, children }: { icon: IconName; title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <Icon name={icon} size={52} strokeWidth={1.4} />
      <div className="empty-title">{title}</div>
      {children}
    </div>
  )
}

export function Loading() {
  return (
    <div className="loading">
      <div className="spinner" />
    </div>
  )
}
