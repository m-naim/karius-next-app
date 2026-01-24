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
}) {
  return (
    <div className="w-full">
      <TableContextHeader
        table={table}
        id={id}
        owned={owned}
        setData={setData}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
      />
      <div className="overflow-auto">
        <SimpleDataTable table={table} colSpan={columns.length} />
      </div>
    </div>
  )
}
