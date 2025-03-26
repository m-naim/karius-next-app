import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { flexRender } from '@tanstack/react-table'
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const SimpleDataTable = ({ table, colSpan }) => {
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false

  return (
    <div className="rounded-md">
      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    if (isMobile && !['symbol', 'total_value', 'retour'].includes(header.id)) {
                      return null
                    }
                    return (
                      <TableHead 
                        key={header.id} 
                        className={cn(
                          "whitespace-nowrap",
                          isMobile && header.id === 'symbol' && "w-[45%]",
                          isMobile && header.id === 'total_value' && "w-[30%]",
                          isMobile && header.id === 'retour' && "w-[20%]"
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                  {isMobile && (
                    <TableHead className="w-[5%] p-0"></TableHead>
                  )}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => {
                      if (isMobile && !['symbol', 'total_value', 'retour'].includes(cell.column.id)) {
                        return null
                      }
                      return (
                        <TableCell 
                          key={cell.id} 
                          className={cn(
                            "whitespace-nowrap",
                            isMobile && cell.column.id === 'symbol' && "w-[45%]",
                            isMobile && cell.column.id === 'total_value' && "w-[30%]",
                            isMobile && cell.column.id === 'retour' && "w-[20%]"
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
                            <Button variant="ghost" className="h-6 w-6 p-0">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {row.getVisibleCells().map((cell) => {
                              if (['symbol', 'total_value', 'retour'].includes(cell.column.id)) {
                                return null
                              }
                              return (
                                <div key={cell.id} className="flex items-center justify-between px-2 py-1.5">
                                  <span className="text-xs font-medium">
                                    {cell.column.columnDef.header}
                                  </span>
                                  <span className="text-xs">
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
                  <TableCell colSpan={colSpan} className="h-24 w-full text-center">
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

export default SimpleDataTable
