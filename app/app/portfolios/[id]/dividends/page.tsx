'use client'

import { usePathname } from 'next/navigation'
import SectionContainer from '@/components/organismes/layout/SectionContainer'

import DividendsView from './dividends'
import { useEffect, useState } from 'react'
import { getDividends } from '@/services/portfolioService'
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { columns } from './columns'
import { Card, CardContent } from '@/components/ui/card'
import SimpleDataTable from '@/components/molecules/table/SimpleDataTable'

interface yearRecord {
  totalAmount: string
}
interface DividendesChart {
  yearlyDividends: Map<string, yearRecord>
  monthlyDividends: Map<string, yearRecord>
  dividends: unknown[]
}

function PageDividends() {
  const id = usePathname().split('/')[3]
  const [data, setData] = useState<unknown[]>([])

  const [loading, setLoading] = useState(false)
  const [dates, setDates] = useState<string[]>([])
  const [perfs, setPerfs] = useState<number[]>([])

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dividends: DividendesChart = await getDividends(id)
        setDates(Object.keys(dividends.yearlyDividends))
        setPerfs(Object.values(dividends.yearlyDividends).map((v) => v.totalAmount))
        setData(dividends.dividends)
      } catch (e) {
        console.error('error api', e)
      }
    }
    fetchData()
    setLoading(false)
  }, [id])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <SectionContainer className="w-full">
        <DividendsView id={id} loading={loading} dates={dates} values={perfs} />
      </SectionContainer>

      <SectionContainer className="w-full">
        <Card>
          <CardContent>
            <SimpleDataTable table={table} colSpan={columns.length} />
          </CardContent>
        </Card>
      </SectionContainer>
    </div>
  )
}

export default PageDividends
