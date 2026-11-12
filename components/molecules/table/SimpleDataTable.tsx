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
import type { CSSProperties } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SimpleDataTableProps {
  table: any
  colSpan: number
  onRowClick?: (row: any) => void
  selectedId?: string | null
  compactMobile?: boolean
}

const SimpleDataTable = ({
  table,
  colSpan,
  onRowClick,
  selectedId,
  compactMobile = false,
}: SimpleDataTableProps) => {
  const visibleColumns = table.getVisibleLeafColumns()
  const hasSymbol = visibleColumns.some((column) => column.id === 'symbol')
  return (
    <div
      className={cn(
        'flex h-full w-full min-h-0 flex-col',
        compactMobile && 'market-table-container'
      )}
      style={{ '--metric-count': visibleColumns.length - (hasSymbol ? 1 : 0) } as CSSProperties}
    >
      {compactMobile && visibleColumns.length > 4 && (
        <div className="flex shrink-0 items-center justify-end gap-1 px-2 py-1 text-[11px] text-muted-foreground md:hidden">
          <ArrowLeftRight className="h-3 w-3" aria-hidden="true" /> Glisser pour voir les autres
          colonnes
        </div>
      )}
      <Table
        className={compactMobile ? 'market-data-table' : undefined}
        containerClassName="w-full flex-1 min-h-0 overflow-auto overscroll-x-contain"
      >
        <colgroup>
          {visibleColumns.map((column) => (
            <col
              key={column.id}
              className={column.id === 'symbol' ? 'asset-column' : 'metric-column'}
            />
          ))}
        </colgroup>
        <TableHeader className="sticky top-0 z-30 bg-background shadow-[0_1px_0_0_hsl(var(--border))]">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-b-0 hover:bg-transparent">
              {headerGroup.headers.map((header, index) => {
                const isFirst = compactMobile ? header.column.id === 'symbol' : index === 0
                return (
                  <TableHead
                    key={header.id}
                    aria-sort={
                      header.column.getIsSorted() === 'asc'
                        ? 'ascending'
                        : header.column.getIsSorted() === 'desc'
                        ? 'descending'
                        : 'none'
                    }
                    className={cn(
                      'sticky top-0 z-30 bg-background px-4 py-2 text-xs font-semibold text-muted-foreground whitespace-nowrap shadow-[0_1px_0_0_hsl(var(--border))]',
                      compactMobile && 'px-1 py-1 md:px-4 md:py-2',
                      isFirst && 'sticky left-0 top-0 z-40 bg-background'
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
                data-state={row.getIsSelected() && 'selected'}
                className={cn(
                  'group/row border-b border-border/30 transition-colors hover:bg-accent/30',
                  onRowClick && 'cursor-pointer',
                  selectedId === row.original.symbol && 'bg-accent/50'
                )}
                onClick={() => onRowClick && onRowClick(row.original)}
              >
                {row.getVisibleCells().map((cell, index) => {
                  const isFirst = compactMobile ? cell.column.id === 'symbol' : index === 0
                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'whitespace-nowrap px-4 py-3 text-xs tabular-nums',
                        compactMobile && 'px-1 py-2 md:px-4 md:py-3',
                        isFirst &&
                          'sticky left-0 z-20 bg-background shadow-[1px_0_0_0_hsl(var(--border)/0.2)]'
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
        <TableFooter className="sticky bottom-0 z-30 bg-background font-semibold shadow-[0_-1px_0_0_hsl(var(--border))]">
          {table.getFooterGroups().map((footerGroup) => (
            <TableRow key={footerGroup.id} className="border-b-0 hover:bg-transparent">
              {footerGroup.headers.map((header, index) => {
                const isFirst = compactMobile ? header.column.id === 'symbol' : index === 0
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'whitespace-nowrap bg-muted px-1 py-2 text-[11px] md:px-2 text-foreground',
                      isFirst && 'sticky left-0 z-40 bg-muted'
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.footer, header.getContext())}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableFooter>
      </Table>
    </div>
  )
}

export default SimpleDataTable
