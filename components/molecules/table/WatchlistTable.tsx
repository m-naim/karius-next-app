import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { flexRender, Table as TableType } from '@tanstack/react-table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { security } from 'app/app/watchlist/[id]/data/security'

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
  const [selectedPeriod, setSelectedPeriod] = useState('1d')

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    onPeriodChange?.(period)
  }

  return (
    <div className="rounded-md border">
      <ScrollArea className="w-full whitespace-nowrap">
        <Table containerClassName="overflow-visible">
          <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="sticky top-0 z-30 bg-background/95 backdrop-blur shadow-[0_1px_0_0_hsl(var(--border))] whitespace-nowrap px-4 py-3"
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
                ))}
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
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="whitespace-nowrap px-4 py-3"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
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
      </ScrollArea>
    </div>
  )
}

export default WatchlistTable
