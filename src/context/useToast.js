import { useContext } from 'react'
import { ToastContext } from './ToastContext.js'

export function useToast() {
  const ctx = useContext(ToastContext)
  return ctx || { show: () => {} }
}
