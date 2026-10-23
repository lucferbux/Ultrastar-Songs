import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './Icon'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
}

/** Bottom sheet on iPhone, centred dialog on iPad and Mac (styled per platform in CSS). */
export function Sheet({ title, onClose, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  return createPortal(
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grabber" />
        <div className="sheet-header">
          <h2 className="sheet-title">{title}</h2>
          <button className="icon-btn" aria-label="Cerrar" onClick={onClose}>
            <Icon name="xmark" size={16} strokeWidth={2.4} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
