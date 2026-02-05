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
}) {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="shrink-0">
        <TableContextHeader
          table={table}
          id={id}
          owned={owned}
          setData={setData}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
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
