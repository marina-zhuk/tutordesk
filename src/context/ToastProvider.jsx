// Лёгкие тосты-уведомления об успешных действиях. Без зависимостей.

import { useCallback, useMemo, useRef, useState } from 'react'
import { ToastContext } from './ToastContext.js'
import ToastViewport from '../components/Toast.jsx'

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const show = useCallback((message) => {
    const id = ++idRef.current
    setToasts((prev) => [...prev, { id, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const value = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} />
    </ToastContext.Provider>
  )
}
