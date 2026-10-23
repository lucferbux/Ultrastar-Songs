import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { Icon } from './Icon'
import { ToastContext, type ToastKind } from './toastContext'

interface Toast {
  id: number
  message: string
  kind: ToastKind
}

let nextId = 1

/** Maps Firebase error codes to something a person at a party can understand. */
function friendly(error: unknown): string {
  const code = (error as { code?: string }).code ?? ''
  if (code.includes('permission-denied')) return 'No tienes permiso para hacer eso.'
  if (code.includes('unavailable') || code.includes('network')) return 'Sin conexión. Inténtalo de nuevo.'
  if (code.includes('popup-closed')) return 'Inicio de sesión cancelado.'
  return (error as Error).message || 'Algo ha fallado.'
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = nextId++
    setToasts((t) => [...t.slice(-2), { id, message, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  const run = useCallback(
    async <T,>(promise: Promise<T>, success?: string) => {
      try {
        const value = await promise
        if (success) show(success, 'success')
        return value
      } catch (error) {
        console.error(error)
        show(friendly(error), 'error')
        return undefined
      }
    },
    [show],
  )

  const api = useMemo(() => ({ show, run }), [show, run])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast glass ${t.kind}`}>
            {t.kind !== 'info' && <Icon name={t.kind === 'error' ? 'xmark' : 'check'} size={18} strokeWidth={2.6} />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
