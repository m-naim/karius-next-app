'use client'

import SimpleDataTable from '@/components/molecules/table/SimpleDataTable'
import { TableContextHeader } from '../components/table-header'
import { cn } from '@/lib/utils'

export function TableView({
  table,
  id,
  owned,
  setData,
  selectedPeriod,
  setSelectedPeriod,
  columns,
  onRowClick,
  selectedTicker,
  allAvailableTags = [],
  allWatchlists = [],
  showMetrics,
  setShowMetrics,
  activeScreener,
  setActiveScreener,
  isFixedLayout = true,
}: {
  table: any
  id: string
  owned: boolean
  setData: any
  selectedPeriod: string
  setSelectedPeriod: any
  columns: any[]
  onRowClick?: (row: any) => void
  selectedTicker?: string | null
  allAvailableTags?: string[]
  allWatchlists?: any[]
  showMetrics?: boolean
  setShowMetrics?: any
  activeScreener?: string | null
  setActiveScreener?: (screenerId: string | null) => void
  isFixedLayout?: boolean
}) {
  return (
    <div
      className={cn(
        'flex h-full w-full flex-col min-h-0',
        isFixedLayout ? 'overflow-visible md:overflow-hidden' : 'overflow-y-auto'
      )}
    >
      <div className="shrink-0">
        <TableContextHeader
          table={table}
          id={id}
          owned={owned}
          setData={setData}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          allAvailableTags={allAvailableTags}
          showMetrics={showMetrics}
          setShowMetrics={setShowMetrics}
          activeScreener={activeScreener}
          setActiveScreener={setActiveScreener}
        />
      </div>
      <div
        className={cn(
          'flex-1 min-h-0',
          isFixedLayout ? 'overflow-visible md:overflow-hidden' : 'overflow-y-auto'
        )}
      >
        <SimpleDataTable
          table={table}
          colSpan={columns.length}
          onRowClick={onRowClick}
          selectedId={selectedTicker}
        />
      </div>
    </div>
  )
}
