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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { InfoIcon, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { he, vi } from 'date-fns/locale'

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
                          'whitespace-nowrap py-2 text-xs',
                          isMobile && header.id === 'symbol' && 'w-[50%]',
                          isMobile && header.id === 'regularMarketPrice' && 'w-[25%]',
                          isMobile && header.id === 'regularMarketChangePercent' && 'w-[20%]',
                          !isMobile && 'px-2'
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
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
                    className={cn(
                      'hover:bg-muted/50',
                      onRowClick && 'cursor-pointer',
                      selectedId === row.original.symbol && 'bg-muted'
                    )}
                    onClick={() => onRowClick && onRowClick(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => {
                      if (isMobile && !visibleColumns.includes(cell.column.id)) {
                        return null
                      }
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            'whitespace-nowrap py-2 text-xs',
                            isMobile && cell.column.id === 'symbol' && 'w-[50%]',
                            isMobile && cell.column.id === 'regularMarketPrice' && 'w-[25%]',
                            isMobile &&
                              cell.column.id === 'regularMarketChangePercent' &&
                              'w-[20%]',
                            !isMobile && 'px-2'
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
            <TableFooter className="sticky bottom-0 z-10 bg-muted/50 font-semibold">
              {table.getFooterGroups().map((footerGroup) => (
                <TableRow key={footerGroup.id}>
                  {footerGroup.headers.map((header) => {
                    if (isMobile && !visibleColumns.includes(header.id)) {
                      return null
                    }
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          'whitespace-nowrap py-2 text-[11px] text-foreground',
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
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

export default SimpleDataTable
