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
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import watchListService from '@/services/watchListService'
import alertService from '@/services/alertService'
import { Bell, Copy, MoreHorizontal, Move, Plus, Trash2 } from 'lucide-react'
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
  const [activeDialog, setActiveDialog] = React.useState<'copy' | 'alert' | null>(null)

  // Alert State
  const [alertType, setAlertType] = React.useState<string>('PRICE')
  const [operator, setOperator] = React.useState<string>('<')
  const [value, setValue] = React.useState<string>('')
  const [loading, setLoading] = React.useState(false)

  const otherWatchlists = allWatchlists.filter((w) => w._id !== id)

  const handleAction = async (targetId: string, targetName: string, isMove: boolean) => {
    try {
      await watchListService.addStock(targetId, {
        security: { symbol: symbol, date: new Date().toISOString().split('T')[0] },
      })

      if (isMove) {
        await watchListService.removeStock(id, symbol)
        deleteRow(symbol)
        toast({
          title: 'Action déplacée',
          description: `${symbol} a été déplacé vers ${targetName}`,
        })
      } else {
        toast({ title: 'Action ajoutée', description: `${symbol} a été ajouté à ${targetName}` })
      }
      setActiveDialog(null)
    } catch (error) {
      console.error('Failed to perform action:', error)
    }
  }

  const handleCreateAlert = async () => {
    if (!value) return
    setLoading(true)
    try {
      await alertService.createAlert({
        symbol,
        type: alertType,
        operator,
        value: parseFloat(value),
      })
      toast({
        title: 'Alerte créée',
        description: `Une alerte a été configurée pour ${symbol} sur le ${alertType}.`,
      })
      setActiveDialog(null)
    } catch (error) {
      console.error('Failed to create alert:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setActiveDialog('alert')}>
            <Bell className="mr-2 h-4 w-4" /> Ajouter une Alerte
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setActiveDialog('copy')}>
            <Copy className="mr-2 h-4 w-4" /> Copier/Déplacer vers...
          </DropdownMenuItem>

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

      {/* Copy/Move Dialog */}
      <Dialog
        open={activeDialog === 'copy'}
        onOpenChange={(open) => !open && setActiveDialog(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Copier ou Déplacer {symbol}</DialogTitle>
            <DialogDescription>Choisissez la watchlist de destination.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="mt-4 h-[300px] pr-4">
            <div className="space-y-4">
              {otherWatchlists.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Aucune autre watchlist.
                </p>
              ) : (
                otherWatchlists.map((watchlist) => (
                  <div
                    key={watchlist._id}
                    className="flex items-center justify-between gap-4 rounded-lg border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{watchlist.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(watchlist._id, watchlist.name, false)}
                      >
                        Copier
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAction(watchlist._id, watchlist.name, true)}
                      >
                        Déplacer
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
      <Dialog
        open={activeDialog === 'alert'}
        onOpenChange={(open) => !open && setActiveDialog(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Créer une alerte pour {symbol}</DialogTitle>
            <DialogDescription>
              Recevez une notification Telegram quand la condition est remplie.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs">Type</Label>
              <Select value={alertType} onValueChange={setAlertType}>
                <SelectTrigger className="col-span-3 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRICE">Prix</SelectItem>
                  <SelectItem value="PE">P/E Ratio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs">Condition</Label>
              <Select value={operator} onValueChange={setOperator}>
                <SelectTrigger className="col-span-3 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="<">Inférieur à</SelectItem>
                  <SelectItem value=">">Supérieur à</SelectItem>
                  <SelectItem value="<=">Inférieur ou égal</SelectItem>
                  <SelectItem value=">=">Supérieur ou égal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs">Valeur</Label>
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Ex: 150.50"
                className="col-span-3 h-8 text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={handleCreateAlert} disabled={loading || !value}>
              {loading ? 'Création...' : "Créer l'alerte"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
