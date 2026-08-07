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

interface PortfolioTableProps {
  table: TableType<any>
  colSpan: number
  onRowClick?: (security: any) => void
  selectedSymbol?: string | null
}

const PortfolioTable = ({ table, colSpan, onRowClick, selectedSymbol }: PortfolioTableProps) => {
  return (
    <div className="w-full">
      <ScrollArea className="w-full whitespace-nowrap">
        <Table containerClassName="overflow-visible">
          <TableHeader className="sticky top-0 z-10 bg-background/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-border/50 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="sticky top-0 z-30 bg-background/95 backdrop-blur shadow-[0_1px_0_0_hsl(var(--border))] whitespace-nowrap px-4 py-3 font-semibold text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
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
                  data-state={(selectedSymbol === row.original.symbol || row.getIsSelected()) && 'selected'}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    "border-b border-border/30 transition-colors hover:bg-accent/40 data-[state=selected]:bg-accent/60",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="whitespace-nowrap px-4 py-3 tabular-nums"
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

export default PortfolioTable
