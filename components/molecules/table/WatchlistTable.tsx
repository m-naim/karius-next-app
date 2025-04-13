import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { flexRender, Table as TableType } from '@tanstack/react-table'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { security } from '@/app/app/watchlist/[id]/data/security'

interface WatchlistTableProps {
  table: TableType<security>
  colSpan: number
  onPeriodChange?: (period: string) => void
}

const periods = [
  { value: '1d', label: '1 jour' },
  { value: '1w', label: '1 semaine' },
  { value: '1m', label: '1 mois' },
  { value: '3m', label: '3 mois' },
  { value: '1y', label: '1 an' },
  { value: '5y', label: '5 ans' },
]

const WatchlistTable = ({ table, colSpan, onPeriodChange }: WatchlistTableProps) => {
  const [isMobile, setIsMobile] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('1d')

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    onPeriodChange?.(period)
  }

  const visibleColumns = ['symbol', 'regularMarketPrice', 'regularMarketChangePercent']

  return (
    <div className="rounded-md">
      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    if (isMobile && !visibleColumns.includes(header.id)) {
                      return null
                    }
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          'whitespace-nowrap py-3',
                          isMobile && header.id === 'symbol' && 'w-[50%]',
                          isMobile && header.id === 'regularMarketPrice' && 'w-[25%]',
                          isMobile && header.id === 'regularMarketChangePercent' && 'w-[20%]',
                          !isMobile && 'px-4'
                        )}
                      >
                        {header.id === 'regularMarketChangePercent' ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 px-2">
                                Variation
                                <span className="ml-2 text-xs text-muted-foreground">
                                  {periods.find((p) => p.value === selectedPeriod)?.label}
                                </span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuRadioGroup
                                value={selectedPeriod}
                                onValueChange={handlePeriodChange}
                              >
                                {periods.map((period) => (
                                  <DropdownMenuRadioItem
                                    key={period.value}
                                    value={period.value}
                                    className="cursor-pointer"
                                  >
                                    {period.label}
                                  </DropdownMenuRadioItem>
                                ))}
                              </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : header.isPlaceholder ? null : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </TableHead>
                    )
                  })}
                  {isMobile && <TableHead className="w-[5%] p-0"></TableHead>}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => {
                      if (isMobile && !visibleColumns.includes(cell.column.id)) {
                        return null
                      }
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            'whitespace-nowrap py-3',
                            isMobile && cell.column.id === 'symbol' && 'w-[50%]',
                            isMobile && cell.column.id === 'regularMarketPrice' && 'w-[25%]',
                            isMobile &&
                              cell.column.id === 'regularMarketChangePercent' &&
                              'w-[20%]',
                            !isMobile && 'px-4'
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      )
                    })}
                    {isMobile && (
                      <TableCell className="w-[5%] p-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-muted"
                              aria-label="Plus d'informations"
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-72 space-y-2 p-3">
                            {row.getVisibleCells().map((cell) => {
                              if (visibleColumns.includes(cell.column.id)) {
                                return null
                              }
                              return (
                                <div
                                  key={cell.id}
                                  className="flex items-center justify-between border-b border-border py-2 last:border-0"
                                >
                                  <span className="text-sm font-medium text-muted-foreground">
                                    {cell.column.columnDef.header}
                                  </span>
                                  <span className="text-sm font-medium">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                  </span>
                                </div>
                              )
                            })}
                            <div className="pt-2">
                              {flexRender(
                                row.getVisibleCells().find((cell) => cell.column.id === 'actions')
                                  ?.column.columnDef.cell,
                                row
                                  .getVisibleCells()
                                  .find((cell) => cell.column.id === 'actions')
                                  ?.getContext()
                              )}
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={colSpan} className="h-24 text-center text-muted-foreground">
                    Pas de données
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

export default WatchlistTable
