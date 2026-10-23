import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router'
import { Shell } from './app/Shell'
import { AuthProvider } from './features/auth/AuthProvider'
import { useAuth } from './features/auth/authContext'
import { LoginPage } from './features/auth/LoginPage'
import { CatalogProvider } from './features/catalog/CatalogProvider'
import { CatalogPage } from './features/catalog/CatalogPage'
import { CurrentSessionProvider } from './features/sessions/CurrentSessionProvider'
import { Loading } from './ui/Empty'
import { ToastProvider } from './ui/ToastProvider'

// Secondary screens load on demand to keep the first paint on a phone small.
const FavoritesPage = lazy(() => import('./features/favorites/FavoritesPage'))
const SessionsPage = lazy(() => import('./features/sessions/SessionsPage'))
const SessionPage = lazy(() => import('./features/sessions/SessionPage'))
const JoinPage = lazy(() => import('./features/sessions/JoinPage'))
const TvPage = lazy(() => import('./features/sessions/TvPage'))
const ProfilePage = lazy(() => import('./features/profile/ProfilePage'))
const AdminPage = lazy(() => import('./features/admin/AdminPage'))

/** Everything below needs a signed-in user; also hosts the data providers that depend on it. */
function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return (
    <CatalogProvider>
      <CurrentSessionProvider>
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </CurrentSessionProvider>
    </CatalogProvider>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<RequireAuth />}>
              <Route path="/s/:id/tv" element={<TvPage />} />
              <Route element={<Shell />}>
                <Route index element={<CatalogPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/sessions" element={<SessionsPage />} />
                <Route path="/join/:code" element={<JoinPage />} />
                <Route path="/s/:id" element={<SessionPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}
