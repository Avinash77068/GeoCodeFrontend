import { createContext, useContext } from 'react'
import { useToast } from '../hooks/useToast'
import Toast from '../components/ui/Toast'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const { toasts, toast, dismiss } = useToast()

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToastContext must be used inside ToastProvider')
  return ctx
}
