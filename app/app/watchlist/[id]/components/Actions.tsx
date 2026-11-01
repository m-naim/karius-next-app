'use client'

import * as React from 'react'
import Link from 'next/link'
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
import { Bell, CheckCircle2, Copy, MoreHorizontal, Move, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { watchList } from '../page'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { security } from '../data/security'
import { PushNotificationToggle } from '@/components/PushNotificationToggle'

interface ActionsProps {
  allWatchlists: watchList[]
  symbol: string
  id?: string
  deleteRow?: (symbol: string) => void
  security?: security
}

export const Actions = ({
  symbol,
  id = '',
  deleteRow,
  allWatchlists = [],
  security,
}: ActionsProps) => {
  const { toast } = useToast()
  const [activeDialog, setActiveDialog] = React.useState<'copy' | 'alert' | 'alert-success' | null>(
    null
  )

  // Alert State
  const [alertType, setAlertType] = React.useState<string>('PRICE')
  const [operator, setOperator] = React.useState<string>('<')
  const [value, setValue] = React.useState<string>(security?.regularMarketPrice?.toString() || '')
  const [loading, setLoading] = React.useState(false)

  const otherWatchlists = id ? allWatchlists.filter((w) => (w._id || w.id) !== id) : allWatchlists
  const canMove = Boolean(id && deleteRow)
  const watchlistActionLabel = canMove
    ? 'Copier ou déplacer vers...'
    : id
    ? 'Copier vers...'
    : 'Ajouter à une watchlist...'

  const handleAction = async (targetId: string, targetName: string, isMove: boolean) => {
    try {
      await watchListService.addStock(targetId, {
        security: {
          symbol: symbol,
          date: new Date().toISOString().split('T')[0],
        },
      })

      if (isMove && id && deleteRow) {
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
      setActiveDialog(null)
    } catch (error) {
      console.error('Failed to perform action:', error)
      toast({
        title: isMove ? 'Déplacement impossible' : 'Ajout impossible',
        description: `Impossible de transférer ${symbol} vers ${targetName}. Vérifiez votre connexion et réessayez.`,
        variant: 'destructive',
      })
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
        description: `Nous surveillons maintenant ${symbol}.`,
      })
      void alertService.trackEvent('first_alert_created', 'telegram', {
        symbol,
        type: alertType,
      })
      setActiveDialog('alert-success')
    } catch (error) {
      console.error('Failed to create alert:', error)
      toast({
        title: "Création de l'alerte échouée",
        description: `Impossible d'enregistrer l'alerte pour ${symbol}. Vérifiez la valeur saisie.`,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary"
        onClick={(event) => {
          event.stopPropagation()
          setActiveDialog('alert')
        }}
        aria-label={`Créer une alerte sur ${symbol}`}
        title={`Créer une alerte sur ${symbol}`}
      >
        <Bell className="h-4 w-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => setTimeout(() => setActiveDialog('copy'), 100)}>
            <Plus className="mr-2 h-4 w-4" /> {watchlistActionLabel}
          </DropdownMenuItem>

          {id && deleteRow && (
            <>
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
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Watchlist destination dialog */}
      <Dialog
        open={activeDialog === 'copy'}
        onOpenChange={(open) => !open && setActiveDialog(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {canMove ? `Copier ou déplacer ${symbol}` : `Ajouter ${symbol} à une watchlist`}
            </DialogTitle>
            <DialogDescription>
              {canMove
                ? 'Choisissez une watchlist de destination et l’action à effectuer.'
                : 'Choisissez la watchlist dans laquelle ajouter cette valeur.'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="mt-4 h-[300px] pr-4">
            <div className="space-y-4">
              {otherWatchlists.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  {id ? 'Aucune autre watchlist.' : 'Aucune watchlist disponible.'}
                </p>
              ) : (
                otherWatchlists.map((watchlist, index) => {
                  const wlId = watchlist._id || watchlist.id || index.toString()
                  return (
                    <div
                      key={wlId}
                      className="flex items-center justify-between gap-4 rounded-lg border p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{watchlist.name}</p>
                      </div>
                      {canMove ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            onClick={() => handleAction(wlId, watchlist.name, false)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                            Copier
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="gap-1.5"
                            onClick={() => handleAction(wlId, watchlist.name, true)}
                          >
                            <Move className="h-3.5 w-3.5" />
                            Déplacer
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleAction(wlId, watchlist.name, false)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Ajouter
                        </Button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Alert composer */}
      <Dialog
        open={activeDialog === 'alert'}
        onOpenChange={(open) => !open && setActiveDialog(null)}
      >
        <DialogContent className="gap-0 overflow-hidden p-0 [&>button]:bg-white/10 [&>button]:text-white sm:max-w-[480px]">
          <div className="bg-foreground p-5 text-background">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-border bg-background">
                <AvatarImage src={security?.logo} alt={symbol} />
                <AvatarFallback className="font-bold text-foreground">
                  {symbol.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl font-bold">{symbol}</DialogTitle>
                <p className="text-xs font-medium uppercase tracking-wider text-background/60">
                  {security?.longname || 'Security'}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-5 p-6">
            <div>
              <DialogTitle className="text-lg">Quand devons-nous vous prévenir ?</DialogTitle>
              <DialogDescription className="mt-1">
                Cette règle apparaîtra aussi dans votre Centre d&apos;alertes.
              </DialogDescription>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Indicateur</Label>
                <Select value={alertType} onValueChange={setAlertType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRICE">Cours</SelectItem>
                    <SelectItem value="PE">Ratio P/E</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select value={operator} onValueChange={setOperator}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="<">Descend sous</SelectItem>
                    <SelectItem value=">">Monte au-dessus de</SelectItem>
                    <SelectItem value="<=">Inférieur ou égal à</SelectItem>
                    <SelectItem value=">=">Supérieur ou égal à</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`alert-value-${symbol}`}>Valeur cible</Label>
              <Input
                id={`alert-value-${symbol}`}
                type="number"
                step="0.01"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="Ex. 130,00"
                className="font-semibold"
              />
            </div>

            <p className="mb-0 rounded-lg bg-muted/60 p-3 text-sm text-foreground">
              Vous serez prévenu lorsque <strong>{symbol}</strong>{' '}
              {operator.includes('<') ? 'descendra sous' : 'montera au-dessus de'}{' '}
              <strong>{value || '—'}</strong>.
            </p>
          </div>

          <div className="flex gap-3 border-t bg-muted/40 p-5">
            <Button variant="outline" className="flex-1" onClick={() => setActiveDialog(null)}>
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleCreateAlert} disabled={loading || !value}>
              {loading ? 'Création...' : "Créer l'alerte"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* First value and delivery setup */}
      <Dialog
        open={activeDialog === 'alert-success'}
        onOpenChange={(open) => !open && setActiveDialog(null)}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <DialogTitle>Alerte {symbol} enregistrée</DialogTitle>
            <DialogDescription>
              Activez un canal de réception si ce n&apos;est pas déjà fait.
            </DialogDescription>
          </DialogHeader>

          <PushNotificationToggle compact />

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/app/alerts?tab=settings">Configurer Telegram</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/app/alerts">Voir mes alertes</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
