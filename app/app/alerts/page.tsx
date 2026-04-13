'use client'

import React, { useEffect, useState, useMemo } from 'react'
import alertService from '@/services/alertService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  BellOff,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  Search,
  MoreVertical,
  Play,
  Settings2,
  AlertCircle,
  MessageSquare,
  Radio,
  ExternalLink,
  Copy,
  Info,
  Layers,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'

interface Alert {
  id: string
  symbol: string
  type: 'PRICE' | 'PE'
  operator: string
  value: number
  isTriggered: boolean
  lastTriggeredAt?: string
  createdAt: string
}

interface NotificationSettings {
  channel: 'telegram' | 'ntfy'
  telegramChatId?: string
  ntfyTopic?: string
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<NotificationSettings>({ channel: 'telegram' })
  const [tempChatId, setTempChatId] = useState('')
  const [updatingSettings, setUpdatingSettings] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      const [alertsData, settingsData] = await Promise.all([
        alertService.getMyAlerts(),
        alertService.getNotificationSettings().catch(() => ({ channel: 'telegram' })),
      ])
      setAlerts(alertsData)
      setSettings(settingsData)
      setTempChatId(settingsData.telegramChatId || '')
    } catch (error) {
      console.error('Failed to fetch data', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await alertService.deleteAlert(id)
      setAlerts(alerts.filter((a) => a.id !== id))
      toast({ title: 'Alerte supprimée' })
    } catch (error) {
      console.error('Failed to delete alert:', error)
    }
  }

  const handleRestart = async (id: string) => {
    try {
      const updated = await alertService.restartAlert(id)
      setAlerts(alerts.map((a) => (a.id === id ? updated : a)))
      toast({ title: 'Alerte réactivée' })
    } catch (error) {
      console.error('Failed to restart alert:', error)
    }
  }

  const handleChannelChange = async (channel: 'telegram' | 'ntfy') => {
    setUpdatingSettings(true)
    try {
      await alertService.updateNotificationChannel(channel)
      setSettings((prev) => ({ ...prev, channel }))
      toast({ title: 'Canal mis à jour', description: `Vous recevrez désormais vos alertes via ${channel}.` })
    } catch (error) {
      console.error('Failed to update channel:', error)
    } finally {
      setUpdatingSettings(false)
    }
  }

  const handleUpdateTelegram = async () => {
    setUpdatingSettings(true)
    try {
      await alertService.updateTelegram(tempChatId)
      setSettings((prev) => ({ ...prev, telegramChatId: tempChatId }))
      toast({ title: 'Config Telegram enregistrée' })
    } catch (error) {
      console.error('Failed to update telegram:', error)
    } finally {
      setUpdatingSettings(false)
    }
  }

  const handleTestNotification = async () => {
    try {
      await alertService.testLastNotification()
      toast({ title: 'Test envoyé', description: 'La dernière notification a été renvoyée.' })
    } catch (error) {
      console.error('Failed to test notification:', error)
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de renvoyer la notification.' })
    }
  }

  const handleTestBatchNotification = async () => {
    try {
      await alertService.testLastBatchNotification()
      toast({ title: 'Test Batch envoyé', description: 'La dernière notification batch a été renvoyée.' })
    } catch (error) {
      console.error('Failed to test batch notification:', error)
      toast({ variant: 'destructive', title: 'Erreur', description: 'Aucun historique de batch trouvé.' })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: 'Copié !' })
  }

  const safeFormat = (dateStr: string | undefined | null, formatStr: string) => {
    if (!dateStr) return 'N/A'
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return 'N/A'
      return format(date, formatStr, { locale: fr })
    } catch (e) {
      return 'N/A'
    }
  }

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => a.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [alerts, searchTerm])

  const activeAlerts = filteredAlerts.filter((a) => !a.isTriggered)
  const triggeredAlerts = filteredAlerts.filter((a) => a.isTriggered)

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Alertes</h1>
          <p className="font-medium text-muted-foreground">
            Surveillance temps réel de vos actifs favoris.
          </p>
        </div>
        <div className="flex gap-3">
          <Card className="flex items-center gap-4 border-primary/10 bg-primary/5 px-4 py-2">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Actives</p>
              <p className="text-lg font-black text-primary">{activeAlerts.length}</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Déclenchées</p>
              <p className="text-lg font-black text-orange-500">{triggeredAlerts.length}</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Sidebar: Config & Info */}
        <div className="space-y-6 lg:col-span-4">
          <Card className="overflow-hidden border-border/60 shadow-sm">
            <CardHeader className="bg-slate-900 p-4 text-white">
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest">
                <Settings2 className="h-4 w-4 text-blue-400" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-4">
              {/* Canal Selection */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-500">
                  Canal de réception
                </Label>
                <RadioGroup 
                  value={settings.channel} 
                  onValueChange={(v) => handleChannelChange(v as 'telegram' | 'ntfy')}
                  className="grid grid-cols-2 gap-2"
                >
                  <div>
                    <RadioGroupItem value="telegram" id="tg" className="peer sr-only" />
                    <Label
                      htmlFor="tg"
                      className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <MessageSquare className="mb-1 h-4 w-4" />
                      <span className="text-[10px] font-bold">TELEGRAM</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="ntfy" id="ntfy" className="peer sr-only" />
                    <Label
                      htmlFor="ntfy"
                      className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Radio className="mb-1 h-4 w-4" />
                      <span className="text-[10px] font-bold">NTFY (WEB)</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {/* Telegram Config */}
              {settings.channel === 'telegram' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
                  <div className="space-y-2">
                    <Label htmlFor="chatId" className="text-[10px] font-black uppercase text-slate-500">
                      Chat ID Telegram
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="chatId"
                        placeholder="Ex: 12345678"
                        value={tempChatId}
                        onChange={(e) => setTempChatId(e.target.value)}
                        className="h-9 border-slate-200 text-sm font-bold"
                      />
                      <Button
                        size="sm"
                        onClick={handleUpdateTelegram}
                        disabled={updatingSettings || !tempChatId}
                        className="font-bold"
                      >
                        {updatingSettings ? '...' : 'SAVE'}
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-3 rounded-lg border border-blue-100 bg-blue-50/50 p-3">
                    <Info className="h-4 w-4 shrink-0 text-blue-500" />
                    <p className="text-[10px] font-medium leading-relaxed text-blue-700">
                      Obtenez votre ID via @userinfobot et envoyez /start à notre bot.
                    </p>
                  </div>
                </div>
              )}

              {/* Ntfy Config */}
              {settings.channel === 'ntfy' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500">
                      Votre canal ntfy privé
                    </Label>
                    <div className="flex items-center gap-2 rounded-md border bg-muted/30 p-2">
                      <code className="flex-1 truncate text-[10px] font-bold">
                        ntfy.sh/{settings.ntfyTopic || 'chargement...'}
                      </code>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(`https://ntfy.sh/${settings.ntfyTopic}`)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full gap-2 text-[10px] font-bold" asChild>
                      <a href={`https://ntfy.sh/${settings.ntfyTopic}`} target="_blank" rel="noopener noreferrer">
                        OUVRIR LE CANAL <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>

                  <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
                    <div className="flex gap-2 mb-1">
                      <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                      <span className="text-[10px] font-bold uppercase text-amber-700">Information Format</span>
                    </div>
                    <p className="text-[10px] font-medium leading-relaxed text-amber-800">
                      ntfy n'accepte pas le HTML. Les messages seront reçus en texte brut optimisé.
                    </p>
                  </div>
                </div>
              )}

              {/* Dev Test Button */}
              {process.env.NODE_ENV === 'development' && (
                <div className="space-y-2 pt-2">
                  <p className="text-[8px] font-black uppercase text-primary/60 text-center">Outils de Développement</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-dashed border-primary/50 text-[9px] font-bold text-primary hover:bg-primary/5 px-1"
                      onClick={handleTestNotification}
                    >
                      <Send className="mr-1 h-3 w-3" />
                      TEST ALERT
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-dashed border-primary/50 text-[9px] font-bold text-primary hover:bg-primary/5 px-1"
                      onClick={handleTestBatchNotification}
                    >
                      <Layers className="mr-1 h-3 w-3" />
                      TEST BATCH
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-dashed bg-muted/30">
            <CardContent className="space-y-2 p-4 text-[11px] italic text-muted-foreground">
              <p>• Les alertes de prix sont vérifiées toutes les minutes.</p>
              <p>• Une alerte déclenchée ne sonnera plus jusqu'à sa réactivation.</p>
            </CardContent>
          </Card>
        </div>

        {/* Main: Alerts Manager */}
        <div className="lg:col-span-8">
          <Tabs defaultValue="all" className="w-full">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <TabsList className="h-10 bg-muted/50 p-1">
                <TabsTrigger
                  value="all"
                  className="px-4 text-xs font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  TOUT
                </TabsTrigger>
                <TabsTrigger
                  value="active"
                  className="px-4 text-xs font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  ACTIVES
                </TabsTrigger>
                <TabsTrigger
                  value="triggered"
                  className="px-4 text-xs font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  HISTORIQUE
                </TabsTrigger>
              </TabsList>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un ticker..."
                  className="h-10 w-full border-border bg-background pl-9 sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center gap-4 py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  Synchronisation...
                </span>
              </div>
            ) : (
              <>
                <TabsContent value="all" className="m-0">
                  <AlertList
                    alerts={filteredAlerts}
                    onDelete={handleDelete}
                    onRestart={handleRestart}
                    safeFormat={safeFormat}
                  />
                </TabsContent>
                <TabsContent value="active" className="m-0">
                  <AlertList
                    alerts={activeAlerts}
                    onDelete={handleDelete}
                    onRestart={handleRestart}
                    safeFormat={safeFormat}
                  />
                </TabsContent>
                <TabsContent value="triggered" className="m-0">
                  <AlertList
                    alerts={triggeredAlerts}
                    onDelete={handleDelete}
                    onRestart={handleRestart}
                    safeFormat={safeFormat}
                  />
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function AlertList({
  alerts,
  onDelete,
  onRestart,
  safeFormat,
}: {
  alerts: Alert[]
  onDelete: (id: string) => void
  onRestart: (id: string) => void
  safeFormat: (d: any, f: string) => string
}) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/20 py-20 text-center">
        <div className="mb-4 rounded-full bg-background p-4 shadow-sm">
          <BellOff className="h-10 w-10 text-muted-foreground/30" />
        </div>
        <h3 className="text-lg font-bold">Aucune alerte trouvée</h3>
        <p className="mt-1 max-w-[250px] text-sm text-muted-foreground">
          Modifiez vos filtres ou ajoutez une alerte depuis une watchlist.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <AlertCard
          key={alert.id}
          alert={alert}
          onDelete={onDelete}
          onRestart={onRestart}
          safeFormat={safeFormat}
        />
      ))}
    </div>
  )
}

function AlertCard({
  alert,
  onDelete,
  onRestart,
  safeFormat,
}: {
  alert: Alert
  onDelete: (id: string) => void
  onRestart: (id: string) => void
  safeFormat: (d: any, f: string) => string
}) {
  const { toast } = useToast()

  const handleFeatureSoon = () => {
    toast({
      title: 'Bientôt disponible',
      description: 'Cette fonctionnalité de gestion avancée arrive prochainement.',
    })
  }

  return (
    <Card
      className={`group overflow-hidden border-l-4 border-none shadow-sm transition-all duration-200 hover:shadow-md ${alert.isTriggered ? 'border-l-orange-500 bg-orange-50/5' : 'border-l-primary bg-background'}`}
    >
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="flex min-w-0 items-center gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${alert.isTriggered ? 'bg-orange-100' : 'bg-primary/10'}`}
            >
              {alert.isTriggered ? (
                <CheckCircle2 className="h-6 w-6 text-orange-600" />
              ) : (
                <Clock className="h-6 w-6 text-primary" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight uppercase italic">{alert.symbol}</span>
                <Badge
                  variant={alert.isTriggered ? 'outline' : 'secondary'}
                  className={`py-0 text-[10px] font-bold uppercase ${alert.isTriggered ? 'border-orange-200 bg-orange-50 text-orange-600' : ''}`}
                >
                  {alert.isTriggered ? 'Déclenchée' : 'En veille'}
                </Badge>
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm font-bold text-muted-foreground/80">
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                  {alert.type === 'PRICE' ? 'PRIX' : 'P/E'}
                </span>
                <span>{alert.operator}</span>
                <span className="text-primary">{alert.value.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <div className="mr-4 hidden flex-col items-end text-right md:flex">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">
                Créée le
              </span>
              <span className="text-xs font-bold">
                {safeFormat(alert.createdAt, 'dd MMM yyyy')}
              </span>
            </div>

            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {alert.isTriggered && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-emerald-50 hover:text-emerald-600"
                  onClick={() => onRestart(alert.id)}
                  title="Relancer"
                >
                  <Play className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-slate-100"
                onClick={handleFeatureSoon}
                title="Paramètres"
              >
                <Settings2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-red-50 hover:text-red-600"
                onClick={() => onDelete(alert.id)}
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {alert.isTriggered && (
                    <DropdownMenuItem onClick={() => onRestart(alert.id)}>
                      Relancer
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleFeatureSoon}>Paramètres</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => onDelete(alert.id)}>
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {alert.isTriggered && alert.lastTriggeredAt && (
          <div className="flex items-center gap-2 border-t border-orange-100 bg-orange-50/30 px-4 py-2">
            <Send className="h-3 w-3 text-orange-400" />
            <span className="text-[10px] font-bold uppercase tracking-tight text-orange-700">
              Notification envoyée le {safeFormat(alert.lastTriggeredAt, 'dd/MM à HH:mm')}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
