import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { flexRender } from '@tanstack/react-table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { InfoIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface SimpleDataTableProps {
  table: any
  colSpan: number
  onRowClick?: (row: any) => void
  selectedId?: string | null
}

const SimpleDataTable = ({ table, colSpan, onRowClick, selectedId }: SimpleDataTableProps) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const visibleColumns = [
    'symbol',
    'regularMarketPrice',
    'variation',
    'actions',
    'amountByShare',
    'totalAmount',
    'date',
    'amount',
    'price',
  ]

  return (
    <div className="flex h-full w-full flex-col min-h-0">
      <Table containerClassName="w-full flex-1 min-h-0 overflow-auto">
        <TableHeader className="sticky top-0 z-30 bg-background shadow-[0_1px_0_0_hsl(var(--border))]">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="border-b-0 hover:bg-transparent">
            {headerGroup.headers.map((header, index) => {
              if (isMobile && !visibleColumns.includes(header.id)) {
                return null
              }
              const isFirst = index === 0;
              return (
                <TableHead
                  key={header.id}
                  className={cn(
                    'sticky top-0 z-30 bg-background py-2 text-xs font-semibold text-muted-foreground whitespace-nowrap shadow-[0_1px_0_0_hsl(var(--border))]',
                    isFirst && "sticky left-0 top-0 z-40 bg-background",
                    isMobile && header.id === 'symbol' && 'w-[50%]',
                    isMobile && header.id === 'regularMarketPrice' && 'w-[25%]',
                    isMobile && header.id === 'variation' && 'w-[20%]',
                    !isMobile && 'px-4'
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              )
            })}
            {isMobile && <TableHead className="sticky top-0 z-30 bg-background w-[5%] px-0 text-xs"></TableHead>}
          </TableRow>
        ))}
      </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(
                    'group/row border-b border-border/30 transition-colors hover:bg-accent/30',
                    onRowClick && 'cursor-pointer',
                    selectedId === row.original.symbol && 'bg-accent/50'
                  )}
                  onClick={() => onRowClick && onRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell, index) => {
                    if (isMobile && !visibleColumns.includes(cell.column.id)) {
                      return null
                    }
                    const isFirst = index === 0;
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          'whitespace-nowrap py-3 text-xs tabular-nums',
                          isFirst && "sticky left-0 z-20 bg-background shadow-[1px_0_0_0_hsl(var(--border)/0.2)]",
                          isMobile && cell.column.id === 'symbol' && 'w-[50%]',
                          isMobile && cell.column.id === 'regularMarketPrice' && 'w-[25%]',
                          isMobile && cell.column.id === 'variation' && 'w-[20%]',
                          !isMobile && 'px-4'
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                  {isMobile &&
                    table
                      .getHeaderGroups()
                      .flatMap((headerGroup) => headerGroup.headers.map((header) => header.id))
                      .filter((header) => !visibleColumns.includes(header)).length > 0 && (
                      <TableCell className="w-[5%] p-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-muted"
                              aria-label="Plus d'informations"
                            >
                              <InfoIcon className="h-3.5 w-3.5" />
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
          <TableFooter className="sticky bottom-0 z-30 bg-muted/50 font-semibold shadow-[0_-1px_0_0_hsl(var(--border))]">
            {table.getFooterGroups().map((footerGroup) => (
              <TableRow key={footerGroup.id} className="border-b-0 hover:bg-transparent">
                {footerGroup.headers.map((header, index) => {
                  if (isMobile && !visibleColumns.includes(header.id)) {
                    return null
                  }
                  const isFirst = index === 0;
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'whitespace-nowrap py-2 text-[11px] text-foreground',
                        isFirst && "sticky left-0 z-40 bg-muted/95 backdrop-blur",
                        !isMobile && 'px-2'
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.footer, header.getContext())}
                    </TableHead>
                  )
                })}
                {isMobile && <TableHead className="w-[5%] p-0"></TableHead>}
              </TableRow>
            ))}
          </TableFooter>
        </Table>
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
          <div className="flex-1 text-xs text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 text-xs"
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 text-xs"
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SimpleDataTable
