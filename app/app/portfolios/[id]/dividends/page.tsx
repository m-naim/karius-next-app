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

import { AlertCircle, RefreshCw, GemIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface yearRecord {
  totalAmount: string
}
interface DividendesChart {
  yearlyDividends?: Record<string, yearRecord> | Map<string, yearRecord>
  monthlyDividends?: Record<string, yearRecord> | Map<string, yearRecord>
  dividends?: unknown[]
}

function PageDividends() {
  const id = usePathname().split('/')[3]
  const [data, setData] = useState<unknown[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dates, setDates] = useState<string[]>([])
  const [perfs, setPerfs] = useState<number[]>([])

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const dividends: DividendesChart = await getDividends(id)
      
      const yearly = dividends?.yearlyDividends || {}
      const datesList = Array.isArray(yearly) ? [] : Object.keys(yearly)
      const perfsList = Array.isArray(yearly) ? [] : Object.values(yearly).map((v) => parseFloat(v?.totalAmount || '0'))

      setDates(datesList)
      setPerfs(perfsList)
      setData(Array.isArray(dividends?.dividends) ? dividends.dividends : [])
    } catch (e) {
      console.error('Failed to load dividends data', e)
      setError('Impossible de charger l\'historique des dividendes. Veuillez vérifier votre connexion et réessayer.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
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
    <div className="flex flex-col gap-6 w-full pb-12">
      <SectionContainer className="w-full">
        <DividendsView id={id} loading={loading} dates={dates} values={perfs} />
      </SectionContainer>

      <SectionContainer className="w-full">
        {error ? (
          <Card className="border-destructive/30 bg-destructive/5 text-foreground">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1 max-w-md">
                <h3 className="text-base font-bold">Erreur de chargement</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button onClick={fetchData} variant="outline" size="sm" className="gap-2 rounded-full border-border/50">
                <RefreshCw className="h-4 w-4" />
                <span>Réessayer</span>
              </Button>
            </CardContent>
          </Card>
        ) : !loading && data.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <GemIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Aucun dividende enregistré</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Vos détachements de dividendes s'afficheront automatiquement ici au fur et à mesure des versements effectués par les entreprises de votre portefeuille.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border bg-card">
            <CardContent className="p-0">
              <SimpleDataTable table={table} colSpan={columns.length} />
            </CardContent>
          </Card>
        )}
      </SectionContainer>
    </div>
  )
}

export default PageDividends
