import type { CSSProperties, ReactNode } from 'react'
import { ArrowLeftRight } from 'lucide-react'

export function ExploreTable({
  children,
  metricCount,
  label,
}: {
  children: ReactNode
  metricCount: number
  label: string
}) {
  return (
    <div
      className="market-table-container min-w-0 rounded-xl border border-border bg-card"
      style={{ '--metric-count': metricCount } as CSSProperties}
    >
      <div className="flex items-center justify-end gap-1 px-2 py-1 text-[11px] text-muted-foreground md:hidden">
        <ArrowLeftRight className="h-3 w-3" aria-hidden="true" />
        Glisser pour voir les autres colonnes
      </div>
      <div
        role="region"
        aria-label={label}
        tabIndex={0}
        className="explore-table relative min-w-0 overflow-auto overscroll-x-contain rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <table className="market-data-table w-full border-collapse text-sm">
          <colgroup>
            <col className="asset-column" />
            {Array.from({ length: metricCount }, (_, index) => (
              <col key={index} className="metric-column" />
            ))}
          </colgroup>
          {children}
        </table>
      </div>
    </div>
  )
}
