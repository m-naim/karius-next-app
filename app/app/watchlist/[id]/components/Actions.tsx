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
import {
  Bell,
  Copy,
  MoreHorizontal,
  Move,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Smartphone,
  Send,
  Clock,
  Activity,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { watchList } from '../page'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { security } from '../data/security'

interface ActionsProps {
  allWatchlists: watchList[]
  symbol: string
  id: string
  deleteRow: (symbol: string) => void
  security?: security
}

export const Actions = ({ symbol, id, deleteRow, allWatchlists = [], security }: ActionsProps) => {
  const { toast } = useToast()
  const [activeDialog, setActiveDialog] = React.useState<'copy' | 'alert' | null>(null)

  // Alert State
  const [alertType, setAlertType] = React.useState<string>('PRICE')
  const [operator, setOperator] = React.useState<string>('<')
  const [value, setValue] = React.useState<string>(security?.regularMarketPrice?.toString() || '')
  const [loading, setLoading] = React.useState(false)

  // New UI states
  const [option, setOption] = React.useState('once')
  const [expiration, setExpiration] = React.useState('30')
  const [message, setMessage] = React.useState(
    `Alerte sur ${symbol} : le ${alertType} est ${operator} ${value}`
  )

  React.useEffect(() => {
    setMessage(
      `Alerte sur ${symbol} : le ${alertType === 'PRICE' ? 'Prix' : 'P/E'} est ${operator} ${value}`
    )
  }, [alertType, operator, value, symbol])

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
        <DialogContent className="gap-0 overflow-hidden border-none p-0 shadow-2xl sm:max-w-[480px]">
          <div className="bg-slate-900 p-6 text-white">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-slate-700 bg-white">
                <AvatarImage src={security?.logo} alt={symbol} />
                <AvatarFallback className="font-bold text-slate-900">
                  {symbol.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl font-bold">{symbol}</DialogTitle>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  {security?.longname || 'Security'}
                </p>
              </div>
            </div>
          </div>

          <ScrollArea className="max-h-[80vh]">
            <div className="space-y-8 p-6">
              {/* Section: Condition */}
              <div className="space-y-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-4 w-1 rounded-full bg-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-tight text-slate-500">
                    Condition
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">
                      Type d'indicateur
                    </Label>
                    <Select value={alertType} onValueChange={setAlertType}>
                      <SelectTrigger className="h-10 border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRICE">Prix</SelectItem>
                        <SelectItem value="PE">P/E Ratio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">
                      Croisement
                    </Label>
                    <Select value={operator} onValueChange={setOperator}>
                      <SelectTrigger className="h-10 border-slate-200">
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
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">
                    Valeur cible
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="Ex: 150.50"
                      className="h-10 border-slate-200 pl-8 font-bold"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                      $
                    </span>
                  </div>
                </div>
              </div>

              {/* Section: Options */}
              <div className="space-y-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-4 w-1 rounded-full bg-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-tight text-slate-500">
                    Options
                  </h3>
                </div>

                <RadioGroup
                  value={option}
                  onValueChange={setOption}
                  className="grid grid-cols-2 gap-4"
                >
                  <Label
                    htmlFor="once"
                    className={`flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 transition-all hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary ${option === 'once' ? 'border-primary bg-primary/5' : ''}`}
                  >
                    <RadioGroupItem value="once" id="once" className="sr-only" />
                    <Clock className="mb-2 h-5 w-5 text-slate-400" />
                    <span className="text-[10px] font-bold uppercase">Une seule fois</span>
                  </Label>
                  <Label
                    htmlFor="every"
                    className={`flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 transition-all hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary ${option === 'every' ? 'border-primary bg-primary/5' : ''}`}
                  >
                    <RadioGroupItem value="every" id="every" className="sr-only" />
                    <Activity className="mb-2 h-5 w-5 text-slate-400" />
                    <span className="text-[10px] font-bold uppercase">À chaque fois</span>
                  </Label>
                </RadioGroup>

                <div className="pt-2">
                  <Label className="mb-2 block text-[10px] font-bold uppercase text-slate-400">
                    Expiration
                  </Label>
                  <Select value={expiration} onValueChange={setExpiration}>
                    <SelectTrigger className="h-10 border-slate-200">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-slate-400" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Dans 7 jours</SelectItem>
                      <SelectItem value="30">Dans 30 jours</SelectItem>
                      <SelectItem value="90">Dans 90 jours</SelectItem>
                      <SelectItem value="never">Jamais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Section: Notifications */}
              <div className="space-y-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-4 w-1 rounded-full bg-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-tight text-slate-500">
                    Actions
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-blue-500 p-1.5 text-white">
                        <Send className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-700">
                        Notification Telegram
                      </span>
                    </div>
                    <div className="relative h-5 w-10 cursor-pointer rounded-full bg-primary">
                      <div className="absolute right-1 top-1 h-3 w-3 rounded-full bg-white shadow-sm" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-slate-400 p-1.5 text-white">
                        <Smartphone className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-700">
                        App Push (Indisponible)
                      </span>
                    </div>
                    <div className="relative h-5 w-10 cursor-not-allowed rounded-full bg-slate-200">
                      <div className="absolute left-1 top-1 h-3 w-3 rounded-full bg-white shadow-sm" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">
                  Message d'alerte
                </Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[80px] border-slate-200 text-sm italic"
                />
              </div>
            </div>
          </ScrollArea>

          <div className="flex gap-3 border-t bg-slate-50 p-6">
            <Button
              variant="outline"
              className="h-11 flex-1 font-bold uppercase tracking-tight"
              onClick={() => setActiveDialog(null)}
            >
              Annuler
            </Button>
            <Button
              className="h-11 flex-1 font-bold uppercase tracking-tight shadow-lg shadow-primary/20"
              onClick={handleCreateAlert}
              disabled={loading || !value}
            >
              {loading ? 'Création...' : "Créer l'alerte"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
