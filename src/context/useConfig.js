import { useContext } from 'react'
import { ConfigContext } from './ConfigContext.js'

export function useConfig() {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error('useConfig должен использоваться внутри ConfigProvider')
  return ctx
}
