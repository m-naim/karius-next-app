'use client'

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react'
import { DataFreshness } from '@/components/molecules/DataFreshness'
import { FreshnessInfo } from '@/lib/data-freshness'

type Section = { label: string; info: FreshnessInfo }
const Context = createContext<{
  sections: Section[]
  update: (id: string, section: Section | null) => void
} | null>(null)

export function PortfolioFreshnessProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Record<string, Section>>({})
  const update = useCallback((id: string, section: Section | null) => {
    setEntries((previous) => {
      const next = { ...previous }
      if (section) next[id] = section
      else delete next[id]
      return next
    })
  }, [])
  const value = useMemo(() => ({ sections: Object.values(entries), update }), [entries, update])
  return <Context.Provider value={value}>{children}</Context.Provider>
}

/** Reuse the data already loaded by the active tab; do not fetch it again for the title. */
export function usePortfolioFreshness(label: string, info?: FreshnessInfo | null) {
  const context = useContext(Context)
  const update = context?.update
  const id = useId()
  useEffect(() => {
    if (!update || !info) return
    update(id, { label, info })
    return () => update(id, null)
  }, [update, id, label, info])
}

export function PortfolioFreshnessIndicator() {
  const context = useContext(Context)
  if (!context?.sections.length) return null
  return (
    <DataFreshness
      className="-ml-3 sm:-ml-4"
      display="dot"
      graceDays={1}
      label="Dates du portefeuille"
      sections={context.sections}
    />
  )
}
