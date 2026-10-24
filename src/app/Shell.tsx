import { useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { turnFor } from '../lib/queue'
import { useUser } from '../features/auth/authContext'
import { useCatalog } from '../features/catalog/catalogContext'
import { useFavorites } from '../features/favorites/useFavorites'
import { useCurrentSession } from '../features/sessions/currentSessionContext'
import { Avatar } from '../ui/art'
import { ErrorBoundary } from '../ui/ErrorBoundary'
import { Icon, type IconName } from '../ui/Icon'
import { usePlatform } from '../ui/platform'
import { useMediaQuery } from '../ui/useMediaQuery'
import { useOnline } from '../ui/useOnline'

interface Tab {
  to: string
  label: string
  icon: IconName
  match: (path: string) => boolean
  dot?: boolean
}

function useTabs(): Tab[] {
  const { session } = useCurrentSession()
  return [
    { to: '/', label: 'Canciones', icon: 'music', match: (p) => p === '/' },
    { to: '/favorites', label: 'Favoritas', icon: 'star', match: (p) => p.startsWith('/favorites') },
    {
      to: session ? `/s/${session.id}` : '/sessions',
      label: 'Sesión',
      icon: 'mic',
      match: (p) => p.startsWith('/s/') || p.startsWith('/sessions') || p.startsWith('/join'),
      dot: !!session,
    },
    { to: '/profile', label: 'Perfil', icon: 'person', match: (p) => p.startsWith('/profile') || p.startsWith('/admin') },
  ]
}

/** Floating liquid-glass tab bar: bottom on iPhone, top-centre on iPad. */
function TabBar() {
  const tabs = useTabs()
  const { pathname } = useLocation()
  const index = tabs.findIndex((t) => t.match(pathname))
  return (
    <nav className="tabbar glass" style={{ '--tabs': tabs.length, '--index': Math.max(index, 0) } as React.CSSProperties}>
      <span className="lens" hidden={index < 0} />
      {tabs.map((tab, i) => (
        <NavLink key={tab.label} to={tab.to} className={i === index ? 'active' : ''} aria-current={i === index ? 'page' : undefined}>
          <Icon name={tab.icon} size={24} filled={i === index && tab.icon === 'star'} />
          <span>{tab.label}</span>
          {tab.dot && <span className="dot" aria-label="sesión activa" />}
        </NavLink>
      ))}
    </nav>
  )
}

/** Edge-to-edge sidebar in the macOS 27 / iPadOS 27 style, with per-destination icon colours. */
function Sidebar() {
  const { user, profile, name } = useUser()
  const { session, queue } = useCurrentSession()
  const { songs } = useCatalog()
  const { ids } = useFavorites(user.uid)
  const pending = queue.filter((i) => i.status === 'pending').length
  const item = (to: string, icon: IconName, color: string, label: string, count?: number, end = false) => (
    <NavLink to={to} end={end} style={{ '--icon-color': color } as React.CSSProperties}>
      <Icon name={icon} size={17} filled={icon === 'star'} />
      <span className="label">{label}</span>
      {count !== undefined && <span className="count">{count}</span>}
    </NavLink>
  )
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src="/icon.svg" alt="" />
        Ultrastar
      </div>
      <div className="sidebar-section">Biblioteca</div>
      {item('/', 'music', 'var(--pink)', 'Canciones', songs.length, true)}
      {item('/favorites', 'star', 'var(--yellow)', 'Favoritas', ids.size)}
      <div className="sidebar-section">Karaoke</div>
      {session && item(`/s/${session.id}`, 'mic', 'var(--accent)', session.name, pending)}
      {session && item(`/s/${session.id}/tv`, 'tv', 'var(--blue)', 'Pantalla TV')}
      {item('/sessions', 'calendar', 'var(--orange)', 'Sesiones', undefined, true)}
      {profile?.role === 'admin' && (
        <>
          <div className="sidebar-section">Administración</div>
          {item('/admin', 'gear', 'var(--gray)', 'Catálogo')}
        </>
      )}
      <Link to="/profile" className="sidebar-footer">
        <Avatar name={name} photo={profile?.photoURL ?? user.photoURL} />
        <span>{name}</span>
      </Link>
    </aside>
  )
}

/** "¡Te toca!" / "Eres el siguiente" banner, shown on every page while in a session. */
function TurnBanner() {
  const { user } = useUser()
  const { session, queue } = useCurrentSession()
  const { pathname } = useLocation()
  const turn = session ? turnFor(queue, user.uid) : null
  const last = useRef<string | null>(null)

  useEffect(() => {
    const key = turn ? `${turn.kind}:${turn.item.id}` : null
    if (key && key !== last.current && turn?.kind === 'now') navigator.vibrate?.([120, 80, 120])
    last.current = key
  }, [turn])

  // The session page already highlights your songs.
  if (!session || !turn || pathname === `/s/${session.id}`) return null
  return (
    <Link to={`/s/${session.id}`} className="turn-banner glass">
      <span className="icon-btn">
        <Icon name="mic" size={18} />
      </span>
      <span>
        <strong>{turn.kind === 'now' ? '¡Te toca!' : 'Eres el siguiente'}</strong>
        <span className="muted">
          {turn.item.song.title} · {turn.item.song.artist}
        </span>
      </span>
    </Link>
  )
}

function Banners() {
  const online = useOnline()
  return (
    <div className="banners">
      {!online && (
        <div className="offline glass">
          <Icon name="wifiOff" size={16} /> Sin conexión — los cambios se enviarán al volver
        </div>
      )}
      <TurnBanner />
    </div>
  )
}

export function Shell() {
  const platform = usePlatform()
  // iPadOS: sidebar in landscape / wide windows, floating top tab bar otherwise.
  const wideIpad = useMediaQuery('(min-width: 1024px)')
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const content = (
    <main className="content">
      <ErrorBoundary key={pathname}>
        <Outlet />
      </ErrorBoundary>
    </main>
  )

  if (platform === 'macos' || (platform === 'ipados' && wideIpad)) {
    return (
      <div className="split">
        <Sidebar />
        <div className="split-main">{content}</div>
        <Banners />
      </div>
    )
  }
  return (
    <>
      {content}
      <TabBar />
      <Banners />
    </>
  )
}
