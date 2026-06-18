import { useContext } from 'react'
import { DataContext } from './DataContext.js'

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData должен использоваться внутри DataProvider')
  return ctx
}
