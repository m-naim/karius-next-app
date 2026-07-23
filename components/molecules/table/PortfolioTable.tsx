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
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface PortfolioTableProps {
  table: TableType<any>
  colSpan: number
  onRowClick?: (security: any) => void
  selectedSymbol?: string | null
}

const PortfolioTable = ({ table, colSpan, onRowClick, selectedSymbol }: PortfolioTableProps) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const visibleColumns = ['symbol', 'last', 'weight', 'variationPercent']

  return (
    <div className="w-full">
      <ScrollArea className="w-full whitespace-nowrap">
        <Table containerClassName="overflow-visible">
          <TableHeader className="sticky top-0 z-10 bg-background/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-border/50 hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  if (isMobile && !visibleColumns.includes(header.id)) {
                    return null
                  }
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'sticky top-0 z-30 bg-background/95 backdrop-blur shadow-[0_1px_0_0_hsl(var(--border))] whitespace-nowrap py-3 font-semibold text-muted-foreground',
                        isMobile && header.id === 'symbol' && 'w-[25%]',
                        isMobile && header.id === 'averagePrice' && 'w-[20%]',
                        isMobile && header.id === 'currentValue' && 'w-[20%]',
                        isMobile && header.id === 'performance' && 'w-[10%]',
                        !isMobile && 'px-4'
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={(selectedSymbol === row.original.symbol || row.getIsSelected()) && 'selected'}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    "border-b border-border/30 transition-colors hover:bg-accent/40 data-[state=selected]:bg-accent/60",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    if (isMobile && !visibleColumns.includes(cell.column.id)) {
                      return null
                    }
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          'whitespace-nowrap py-3 tabular-nums',
                          isMobile && cell.column.id === 'symbol' && 'w-[35%]',
                          isMobile && cell.column.id === 'quantity' && 'w-[15%]',
                          isMobile && cell.column.id === 'averagePrice' && 'w-[20%]',
                          isMobile && cell.column.id === 'currentValue' && 'w-[20%]',
                          isMobile && cell.column.id === 'performance' && 'w-[10%]',
                          !isMobile && 'px-4'
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
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

export default PortfolioTable
