import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import watchListService from '@/services/watchListService'
import { MoreHorizontal } from 'lucide-react'

export const Actions = ({ symbol, id, deleteRow }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem>Ajouter une Alerte</DropdownMenuItem>
        <DropdownMenuItem>Tager Prochain achat</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            watchListService.removeStock(id, symbol)
            deleteRow(symbol)
          }}
        >
          Retirer de la liste
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
