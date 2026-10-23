import { useEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
  children?: ReactNode
}

/** iOS large title that collapses into a compact blurred nav bar when scrolled away. */
export function PageHeader({ title, subtitle, actions, children }: Props) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setCompact(!entry.isIntersecting), {
      rootMargin: '-44px 0px 0px 0px',
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.title = `${title} · Ultrastar`
  }, [title])

  return (
    <>
      <div className={`nav-bar ${compact ? 'visible' : ''}`} aria-hidden={!compact}>
        {title}
      </div>
      <header className="page-header">
        <div className="titles">
          <h1 className="large-title" ref={titleRef}>
            {title}
          </h1>
          {subtitle && <div className="page-subtitle">{subtitle}</div>}
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </header>
      {children}
    </>
  )
}
