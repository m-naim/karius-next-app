'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import watchListService from '@/services/watchListService'
import { Copy, MoreHorizontal, Move, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { watchList } from '../page'

interface ActionsProps {
  allWatchlists: watchList[]
  symbol: string
  id: string
  deleteRow: (symbol: string) => void
}

export const Actions = ({ symbol, id, deleteRow, allWatchlists = [] }: ActionsProps) => {
  const { toast } = useToast()
  const [open, setOpen] = React.useState(false)

  const otherWatchlists = allWatchlists.filter((w) => w._id !== id)

  const handleAction = async (targetId: string, targetName: string, isMove: boolean) => {
    try {
      // 1. Add to destination
      await watchListService.addStock(targetId, {
        security: {
          symbol: symbol,
          date: new Date().toISOString().split('T')[0],
        },
      })

      if (isMove) {
        // 2. Remove from source
        await watchListService.removeStock(id, symbol)
        deleteRow(symbol)
        toast({
          title: 'Action déplacée',
          description: `${symbol} a été déplacé vers ${targetName}`,
        })
      } else {
        toast({
          title: 'Action ajoutée',
          description: `${symbol} a été ajouté à ${targetName}`,
        })
      }
      setOpen(false)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Impossible d'effectuer l'opération.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>
            <Plus className="mr-2 h-4 w-4" /> Ajouter une Alerte
          </DropdownMenuItem>

          <DialogTrigger asChild>
            <DropdownMenuItem>
              <Copy className="mr-2 h-4 w-4" /> Copier/Déplacer vers...
            </DropdownMenuItem>
          </DialogTrigger>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
            onClick={() => {
              watchListService.removeStock(id, symbol)
              deleteRow(symbol)
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Retirer de la liste
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Copier ou Déplacer {symbol}</DialogTitle>
          <DialogDescription>
            Choisissez la watchlist de destination pour cette valeur.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="mt-4 h-[300px] pr-4">
          <div className="space-y-4">
            {otherWatchlists.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Vous n'avez pas d'autres watchlists.
              </p>
            ) : (
              otherWatchlists.map((watchlist) => (
                <div
                  key={watchlist._id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-3 hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{watchlist.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {watchlist.securities?.length || 0} valeurs
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2"
                      onClick={() => handleAction(watchlist._id, watchlist.name, false)}
                    >
                      <Plus className="mr-1 h-3 w-3" /> Copier
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 px-2"
                      onClick={() => handleAction(watchlist._id, watchlist.name, true)}
                    >
                      <Move className="mr-1 h-3 w-3" /> Déplacer
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
