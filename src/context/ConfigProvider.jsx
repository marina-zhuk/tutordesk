// Активная ниша (репетитор / бьюти / фитнес): задаёт подписи и набор данных.
// Смена ниши или «Сбросить демо» меняют dataKey → DataProvider пересобирает датасет.

import { useMemo, useState } from 'react'
import { ConfigContext } from './ConfigContext.js'
import { NICHES, DEFAULT_NICHE } from '../data/config.js'

export function ConfigProvider({ children }) {
  const [nicheId, setNicheId] = useState(DEFAULT_NICHE)
  const [resetToken, setResetToken] = useState(0)
  const niche = NICHES[nicheId]

  const value = useMemo(
    () => ({
      nicheId,
      niche,
      appName: niche.appName,
      labels: niche.labels,
      services: niche.services,
      setNiche: (id) => setNicheId(id),
      resetData: () => setResetToken((t) => t + 1),
      dataKey: `${nicheId}:${resetToken}`,
    }),
    [nicheId, resetToken, niche],
  )

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
}
