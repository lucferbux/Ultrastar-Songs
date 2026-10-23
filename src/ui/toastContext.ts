import { createContext, useContext } from 'react'

export type ToastKind = 'info' | 'success' | 'error'

export interface ToastApi {
  show: (message: string, kind?: ToastKind) => void
  /** Runs a promise and shows its error as a toast instead of failing silently. */
  run: <T>(promise: Promise<T>, success?: string) => Promise<T | undefined>
}

export const ToastContext = createContext<ToastApi>({
  show: () => {},
  run: async (p) => p,
})

export const useToast = () => useContext(ToastContext)
