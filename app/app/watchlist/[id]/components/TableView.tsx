'use client'

import SimpleDataTable from '@/components/molecules/table/SimpleDataTable'
import { TableContextHeader } from '../components/table-header'

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
}) {
  return (
    <div className="flex h-full w-full flex-col min-h-0 overflow-hidden">
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
        />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
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
