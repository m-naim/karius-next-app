'use client'

import React, { useEffect, useState, useMemo } from 'react'
import alertService from '@/services/alertService'
import authService from '@/services/authService'
import { PushNotificationToggle } from '@/components/PushNotificationToggle'
import { getAll as getPortfolios, getFollowed } from '@/services/portfolioService'
import { getAll as getWatchlists } from '@/services/watchListService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  BellOff,
  Bell,
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
  channel: 'telegram' | 'ntfy' | 'browser'
  telegramChatId?: string
  ntfyTopic?: string
  browserPushEnabled?: boolean
  browserPushConfigured?: boolean
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<NotificationSettings>({ channel: 'telegram' })
  const [telegramActivationLink, setTelegramActivationLink] = useState<string | null>(null)
  const [checkingTelegram, setCheckingTelegram] = useState(false)
  const [updatingSettings, setUpdatingSettings] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  // Edit Alert State
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null)
  const [editOperator, setEditOperator] = useState('>')
  const [editValue, setEditValue] = useState('')
  const [isEditingOpen, setIsEditingOpen] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)

  // Periodic Reports State
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [portfolioNotifFreq, setPortfolioNotifFreq] = useState('WEEKLY')
  const [watchlistNotifFreq, setWatchlistNotifFreq] = useState('WEEKLY')
  const [disabledEntities, setDisabledEntities] = useState<string[]>([])
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [watchlists, setWatchlists] = useState<any[]>([])
  const [savingReports, setSavingReports] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [alertsData, settingsData, activationData, profileData, disabled, pfts, followedPortfolios, wls] = await Promise.all([
        alertService.getMyAlerts(),
        alertService.getNotificationSettings().catch(() => ({ channel: 'telegram' })),
        alertService.getTelegramActivationLink().catch(() => null),
        authService.getProfile().catch(() => ({})),
        authService.getDisabledEntities().catch(() => []),
        getPortfolios().catch(() => ({})),
        getFollowed().catch(() => []),
        getWatchlists().catch(() => [])
      ])
      setAlerts(alertsData)
      setSettings(settingsData)
      setTelegramActivationLink(activationData?.url || null)

      setNotificationsEnabled(profileData.notificationsEnabled || false)
      setPortfolioNotifFreq(profileData.portfolioNotifFreq || 'WEEKLY')
      setWatchlistNotifFreq(profileData.watchlistNotifFreq || 'WEEKLY')
      setDisabledEntities(Array.isArray(disabled) ? disabled : [])
      const ownedPortfolios = Array.isArray(pfts?.ownPortfolios) ? pfts.ownPortfolios : []
      const favoritePortfolios = Array.isArray(followedPortfolios) ? followedPortfolios : []
      setPortfolios([
        ...ownedPortfolios,
        ...favoritePortfolios.filter((favorite) => !ownedPortfolios.some((owned) => owned.id === favorite.id)),
      ])
      setWatchlists(Array.isArray(wls) ? wls : [])
    } catch (err: any) {
      console.error('Failed to fetch data', err)
      setError(err.message || 'Une erreur est survenue lors de la récupération des données. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    void alertService.trackEvent('alerts_page_viewed').catch(() => undefined)
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

  const handleEditInit = (alert: Alert) => {
    setEditingAlert(alert)
    setEditOperator(alert.operator)
    setEditValue(alert.value.toString())
    setIsEditingOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingAlert || !editValue) return
    setSavingEdit(true)
    try {
      await alertService.deleteAlert(editingAlert.id)
      await alertService.createAlert({
        symbol: editingAlert.symbol,
        type: editingAlert.type,
        operator: editOperator,
        value: parseFloat(editValue)
      })
      await fetchData()
      setIsEditingOpen(false)
      toast({ title: 'Alerte modifiée' })
    } catch (error) {
      console.error('Failed to edit alert:', error)
      toast({
        variant: 'destructive',
        title: 'Modification impossible',
        description: "L'alerte n'a pas pu être mise à jour. Vérifiez la valeur saisie et réessayez.",
      })
    } finally {
      setSavingEdit(false)
    }
  }

  const handleChannelChange = async (channel: 'telegram' | 'ntfy' | 'browser') => {
    setUpdatingSettings(true)
    try {
      await alertService.updateNotificationChannel(channel)
      setSettings((prev) => ({ ...prev, channel }))
      void alertService.trackEvent('notification_channel_selected', channel)
      toast({ title: 'Canal mis à jour', description: `Vous recevrez désormais vos alertes via ${channel === 'browser' ? 'le navigateur' : channel}.` })
    } catch (error) {
      console.error('Failed to update channel:', error)
      toast({
        variant: 'destructive',
        title: 'Échec du changement de canal',
        description: 'Impossible de définir le canal de notification. Veuillez réessayer.',
      })
    } finally {
      setUpdatingSettings(false)
    }
  }

  const handleRefreshTelegramStatus = async () => {
    setCheckingTelegram(true)
    try {
      const [settingsData, activationData] = await Promise.all([
        alertService.getNotificationSettings(),
        alertService.getTelegramActivationLink(),
      ])
      setSettings(settingsData)
      setTelegramActivationLink(activationData?.url || null)
      if (settingsData.telegramChatId) {
        toast({ title: 'Telegram connecté', description: 'Votre compte Telegram est maintenant lié.' })
      } else {
        toast({ title: 'Liaison non détectée', description: 'Cliquez sur le lien Telegram, envoyez /start, puis réessayez.' })
      }
    } catch (error) {
      console.error('Failed to refresh telegram status:', error)
      toast({
        variant: 'destructive',
        title: 'Vérification impossible',
        description: 'Impossible de vérifier la liaison Telegram pour le moment.',
      })
    } finally {
      setCheckingTelegram(false)
    }
  }

  const handleTestNotification = async () => {
    if (settings.channel === 'browser') {
      try {
        await alertService.syncCurrentBrowserSubscription()
        await alertService.testBrowserNotification()
        toast({ title: 'Notification de test envoyée', description: 'Vérifiez votre centre de notifications navigateur.' })
      } catch (error: any) {
        console.error('Failed to test browser notification:', error)
        toast({ variant: 'destructive', title: 'Échec du test', description: error?.message || 'Activez d’abord les notifications navigateur sur cet appareil.' })
      }
      return
    }
    if (!settings.telegramChatId) return
    try {
      await authService.testNotification(settings.telegramChatId)
      toast({ title: 'Message de test envoyé', description: 'Vérifiez immédiatement votre conversation Telegram.' })
    } catch (error) {
      console.error('Failed to test notification:', error)
      toast({
        variant: 'destructive',
        title: 'Échec de l\'envoi du test',
        description: 'Telegram n\'a pas accepté le message. Relancez la liaison ou vérifiez que le bot n\'est pas bloqué.',
      })
    }
  }

  const handleNotificationsToggle = async (enabled: boolean) => {
    if (settings.channel === 'telegram' && !settings.telegramChatId) return
    setUpdatingSettings(true)
    try {
      const profile = await authService.getProfile()
      await authService.updateProfile({
        name: profile.name || '',
        telegramChatId: profile.telegramChatId || settings.telegramChatId || '',
        notificationsEnabled: enabled,
        portfolioNotifFreq: profile.portfolioNotifFreq || 'NONE',
        watchlistNotifFreq: profile.watchlistNotifFreq || 'NONE',
        notificationChannel: settings.channel,
      })
      setNotificationsEnabled(enabled)
      toast({
        title: enabled ? 'Notifications activées' : 'Notifications désactivées',
        description: enabled ? `Les alertes pourront maintenant vous être envoyées via ${settings.channel === 'browser' ? 'le navigateur' : settings.channel}.` : 'Vous pourrez les réactiver à tout moment.',
      })
    } catch (error) {
      console.error('Failed to update notification status:', error)
      toast({ variant: 'destructive', title: 'Mise à jour impossible', description: 'Réessayez dans quelques instants.' })
    } finally {
      setUpdatingSettings(false)
    }
  }

  const handleTestBatchNotification = async () => {
    try {
      await alertService.testLastBatchNotification()
      toast({ title: 'Synthèse test envoyée', description: 'Le rapport journalier a été envoyé.' })
    } catch (error) {
      console.error('Failed to test batch notification:', error)
      toast({
        variant: 'destructive',
        title: 'Aucune synthèse disponible',
        description: 'Aucun historique de notification journalière récent n\'a été trouvé pour le test.',
      })
    }
  }

  const handleSaveReports = async () => {
    setSavingReports(true)
    try {
      const profile = await authService.getProfile()
      await authService.updateProfile({
        name: profile.name || '',
        telegramChatId: profile.telegramChatId || '',
        notificationsEnabled,
        portfolioNotifFreq,
        watchlistNotifFreq,
        notificationChannel: settings.channel,
      })
      await authService.updateDisabledEntities(disabledEntities)
      toast({ title: 'Rapports sauvegardés', description: 'Vos fréquences et préférences de notification sont à jour.' })
    } catch (error) {
      console.error('Failed to save reports:', error)
      toast({
        variant: 'destructive',
        title: 'Sauvegarde des préférences échouée',
        description: 'Impossible d\'enregistrer vos paramètres. Veuillez vérifier votre connexion et réessayer.',
      })
    } finally {
      setSavingReports(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: 'Copié !' })
  }

  const safeFormat = (dateData: any, formatStr: string) => {
    if (!dateData) return 'N/A'
    try {
      let date: Date
      if (Array.isArray(dateData)) {
        // Backend returns [year, month, day, hour, minute, second, ns]
        date = new Date(
          dateData[0],
          dateData[1] - 1,
          dateData[2],
          dateData[3] || 0,
          dateData[4] || 0,
          dateData[5] || 0
        )
      } else {
        date = new Date(dateData)
      }
      
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
      <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight uppercase text-foreground">
            Centre d'Alertes
          </h1>
          <p className="font-medium text-muted-foreground mt-1">
            Surveillance temps réel et rapports de vos actifs.
          </p>
        </div>
        
        {/* Stats perfectly integrated into the header */}
        <div className="flex items-center gap-6 rounded-2xl bg-muted/30 px-6 py-3 border border-border/50 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actives</span>
            <span className="text-2xl font-black text-primary drop-shadow-sm">{activeAlerts.length}</span>
          </div>
          <div className="h-10 w-px bg-border/80" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Déclenchées</span>
            <span className="text-2xl font-black text-orange-500 drop-shadow-sm">{triggeredAlerts.length}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <PushNotificationToggle onSubscriptionChange={(active) => setSettings((prev) => ({ ...prev, browserPushEnabled: active }))} />
      </div>

      <Tabs defaultValue="price-alerts" className="w-full">
        <TabsList className="mb-6 h-12 w-full justify-start overflow-x-auto bg-transparent border-b rounded-none p-0">
          <TabsTrigger
            value="price-alerts"
            className="rounded-none border-b-2 border-transparent px-6 py-3 font-bold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Alertes de Prix
          </TabsTrigger>
          <TabsTrigger
            value="periodic-reports"
            className="rounded-none border-b-2 border-transparent px-6 py-3 font-bold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Rapports Périodiques
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="rounded-none border-b-2 border-transparent px-6 py-3 font-bold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Paramètres
          </TabsTrigger>
        </TabsList>

        {/* Dialog Edit Alert */}
        <Dialog open={isEditingOpen} onOpenChange={setIsEditingOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Modifier l'Alerte</DialogTitle>
              <DialogDescription>
                {editingAlert && (
                  <>Modifier la condition pour <strong>{editingAlert.symbol}</strong> ({editingAlert.type}).</>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="operator">Opérateur</Label>
                <select
                  id="operator"
                  value={editOperator}
                  onChange={(e) => setEditOperator(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value=">">Supérieur à (&gt;)</option>
                  <option value="<">Inférieur à (&lt;)</option>
                  <option value=">=">Supérieur ou égal (&gt;=)</option>
                  <option value="<=">Inférieur ou égal (&lt;=)</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="value">Valeur cible</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsEditingOpen(false)} disabled={savingEdit}>Annuler</Button>
              <Button onClick={handleSaveEdit} disabled={savingEdit || !editValue}>
                {savingEdit ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <TabsContent value="price-alerts" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-12">
              <Tabs defaultValue="all" className="w-full">
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <TabsList className="h-10 bg-muted/50 p-1">
                    <TabsTrigger value="all" className="px-4 text-xs font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">TOUT</TabsTrigger>
                    <TabsTrigger value="active" className="px-4 text-xs font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">ACTIVES</TabsTrigger>
                    <TabsTrigger value="triggered" className="px-4 text-xs font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">HISTORIQUE</TabsTrigger>
                  </TabsList>
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      placeholder="Rechercher un ticker..."
                      className="h-10 w-full border-border bg-background/50 backdrop-blur-sm pl-9 sm:w-[280px] focus-visible:ring-1 focus-visible:ring-primary transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-16 text-center border border-dashed border-destructive/30 rounded-2xl bg-destructive/5 px-6">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                    <h3 className="text-lg font-bold text-foreground">Échec du chargement</h3>
                    <p className="max-w-md text-sm text-muted-foreground">{error}</p>
                    <Button onClick={fetchData} variant="outline" className="mt-2">
                      Réessayer
                    </Button>
                  </div>
                ) : (
                  <div className="max-h-[600px] overflow-y-auto pr-2 pb-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    <TabsContent value="all" className="m-0 mt-1"><AlertList alerts={filteredAlerts} onDelete={handleDelete} onRestart={handleRestart} onEdit={handleEditInit} safeFormat={safeFormat} /></TabsContent>
                    <TabsContent value="active" className="m-0 mt-1"><AlertList alerts={activeAlerts} onDelete={handleDelete} onRestart={handleRestart} onEdit={handleEditInit} safeFormat={safeFormat} /></TabsContent>
                    <TabsContent value="triggered" className="m-0 mt-1"><AlertList alerts={triggeredAlerts} onDelete={handleDelete} onRestart={handleRestart} onEdit={handleEditInit} safeFormat={safeFormat} /></TabsContent>
                  </div>
                )}
              </Tabs>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="periodic-reports" className="m-0 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              <Card className="overflow-hidden border-border/60 shadow-sm">
                <CardHeader className="bg-slate-900 p-4 text-white">
                  <CardTitle className="flex items-center justify-between text-sm uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <BellOff className="h-4 w-4 text-blue-400" />
                      Rapports Top/Flop
                    </div>
                    <Button
                      size="sm"
                      onClick={handleSaveReports}
                      disabled={savingReports}
                      className="h-7 text-[10px] font-bold"
                    >
                      {savingReports ? '...' : 'ENREGISTRER'}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 p-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground border-b pb-2">Fréquences d'envoi</h3>
                    <div className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                      <Bell className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      <p className="mb-0 text-xs leading-relaxed text-muted-foreground">
                        Vos portefeuilles favoris sont aussi surveillés : une alerte est envoyée dès qu&apos;un favori enregistre un mouvement, si les notifications sont activées.
                      </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase">Portefeuilles</Label>
                        <select 
                          value={portfolioNotifFreq}
                          onChange={(e) => setPortfolioNotifFreq(e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="DAILY">Quotidien</option>
                          <option value="WEEKLY">Hebdomadaire</option>
                          <option value="MONTHLY">Mensuel</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase">Watchlists</Label>
                        <select 
                          value={watchlistNotifFreq}
                          onChange={(e) => setWatchlistNotifFreq(e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="DAILY">Quotidien</option>
                          <option value="WEEKLY">Hebdomadaire</option>
                          <option value="MONTHLY">Mensuel</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground border-b pb-2">Ciblage des notifications</h3>
                    <p className="text-xs text-muted-foreground">Décochez les entités pour lesquelles vous ne souhaitez pas recevoir de notifications.</p>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase text-primary">Portefeuilles Actifs</Label>
                        {portfolios.map(p => (
                          <label key={p.id} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-muted/50 rounded-md">
                            <input 
                              type="checkbox" 
                              checked={!disabledEntities.includes(p.id)}
                              onChange={(e) => {
                                if (e.target.checked) setDisabledEntities(prev => prev.filter(id => id !== p.id));
                                else setDisabledEntities(prev => [...prev, p.id]);
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-primary"
                            />
                            <span className="text-sm font-medium">{p.name}</span>
                          </label>
                        ))}
                        {portfolios.length === 0 && <p className="text-xs italic text-muted-foreground">Aucun portefeuille</p>}
                      </div>

                      <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase text-primary">Watchlists Actives</Label>
                        {watchlists.map(w => (
                          <label key={w.id} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-muted/50 rounded-md">
                            <input 
                              type="checkbox" 
                              checked={!disabledEntities.includes(w.id)}
                              onChange={(e) => {
                                if (e.target.checked) setDisabledEntities(prev => prev.filter(id => id !== w.id));
                                else setDisabledEntities(prev => [...prev, w.id]);
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-primary"
                            />
                            <span className="text-sm font-medium">{w.name}</span>
                          </label>
                        ))}
                        {watchlists.length === 0 && <p className="text-xs italic text-muted-foreground">Aucune watchlist</p>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="settings" className="m-0 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-6">
              <Card className="overflow-hidden border-border/60 shadow-sm">
                <CardHeader className="bg-slate-900 p-4 text-white">
                  <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest">
                    <Settings2 className="h-4 w-4 text-blue-400" />
                    Canal de Réception
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-4">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-500">
                      Où recevoir vos alertes
                    </Label>
                    <RadioGroup 
                      value={settings.channel} 
                      onValueChange={(v) => handleChannelChange(v as 'telegram' | 'ntfy' | 'browser')}
                      className="grid grid-cols-3 gap-2"
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
                      <div>
                        <RadioGroupItem value="browser" id="browser" className="peer sr-only" />
                        <Label
                          htmlFor="browser"
                          className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <Bell className="mb-1 h-4 w-4" />
                          <span className="text-[10px] font-bold">NAVIGATEUR</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  {settings.channel === 'telegram' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-2 pt-1">
                      <div className="rounded-xl border border-[#24A1DE]/25 bg-[#24A1DE]/5 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h4 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#168ac0] dark:text-[#58c5f0]">
                              <MessageSquare className="h-4 w-4" />
                              Connexion Telegram
                            </h4>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                              Ouvrez votre lien personnel, cliquez sur <strong>Démarrer</strong> dans Telegram, puis revenez ici.
                            </p>
                          </div>
                          {settings.telegramChatId ? (
                            <Badge variant="outline" className="w-fit gap-1 border-emerald-500/30 bg-emerald-500/10 text-[10px] font-bold text-emerald-600">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                              Compte lié
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="w-fit gap-1 border-amber-500/30 bg-amber-500/10 text-[10px] font-bold text-amber-700">
                              En attente
                            </Badge>
                          )}
                        </div>

                        {!settings.telegramChatId ? (
                          <div className="mt-4 space-y-3">
                            <a
                              href={telegramActivationLink || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                if (telegramActivationLink) void alertService.trackEvent('telegram_activation_link_clicked')
                              }}
                              className="block"
                            >
                              <Button disabled={!telegramActivationLink} className="h-10 w-full gap-2 bg-[#24A1DE] font-bold text-white hover:bg-[#2092ca]">
                                <ExternalLink className="h-4 w-4" />
                                Ouvrir mon lien Telegram
                              </Button>
                            </a>
                            <Button
                              variant="outline"
                              onClick={handleRefreshTelegramStatus}
                              disabled={checkingTelegram}
                              className="h-9 w-full gap-2 text-xs font-bold"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {checkingTelegram ? 'Vérification...' : 'J’ai démarré le bot — vérifier'}
                            </Button>
                            <p className="text-center text-[11px] text-muted-foreground">
                              Le lien expire dans 15 minutes et ne peut être utilisé que pour votre compte.
                            </p>
                          </div>
                        ) : (
                          <div className="mt-4 space-y-3 rounded-lg border border-border/60 bg-background p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-bold text-foreground">Notifications Telegram</p>
                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                  Recevoir les alertes de prix et les rapports périodiques.
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant={notificationsEnabled ? 'outline' : 'default'}
                                onClick={() => handleNotificationsToggle(!notificationsEnabled)}
                                disabled={updatingSettings}
                                aria-pressed={notificationsEnabled}
                                className="shrink-0 text-xs font-bold"
                              >
                                {notificationsEnabled ? 'Désactiver' : 'Activer les notifications'}
                              </Button>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleTestNotification}
                                disabled={updatingSettings}
                                className="flex-1 gap-2 text-xs font-bold"
                              >
                                <Send className="h-3.5 w-3.5" />
                                Envoyer un test
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRefreshTelegramStatus}
                                disabled={checkingTelegram}
                                className="text-xs font-bold text-muted-foreground"
                              >
                                Vérifier la liaison
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {settings.channel === 'ntfy' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-500">
                          Votre canal ntfy privé
                        </Label>
                        <div className="flex items-center gap-2 rounded-md border bg-muted/30 p-2">
                          <code className="flex-1 truncate text-[10px] font-bold">ntfy.sh/{settings.ntfyTopic || 'chargement...'}</code>
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

                  {settings.channel === 'browser' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                        <h4 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary">
                          <Bell className="h-4 w-4" /> Notifications navigateur
                        </h4>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          Activez d’abord cet appareil avec la carte située au-dessus, puis activez ce canal pour recevoir vos alertes.
                        </p>
                        {!settings.browserPushConfigured && (
                          <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] font-medium text-amber-700">
                            Le serveur doit être configuré avec ses clés Web Push avant de pouvoir enregistrer un appareil.
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant={notificationsEnabled ? 'outline' : 'default'}
                        className="w-full text-xs font-bold"
                        onClick={() => handleNotificationsToggle(!notificationsEnabled)}
                        disabled={updatingSettings || !settings.browserPushEnabled}
                        aria-pressed={notificationsEnabled}
                      >
                        {notificationsEnabled ? 'Désactiver les notifications' : 'Activer les notifications navigateur'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 text-xs font-bold"
                        onClick={handleTestNotification}
                        disabled={updatingSettings || !settings.browserPushEnabled}
                      >
                        <Send className="h-3.5 w-3.5" /> Envoyer un test navigateur
                      </Button>
                    </div>
                  )}

                  {process.env.NODE_ENV === 'development' && (
                    <div className="space-y-2 pt-2">
                      <p className="text-[8px] font-black uppercase text-primary/60 text-center">Outils de Développement</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" className="border-dashed border-primary/50 text-[9px] font-bold text-primary hover:bg-primary/5 px-1" onClick={handleTestNotification}>
                          <Send className="mr-1 h-3 w-3" /> TEST ALERT
                        </Button>
                        <Button variant="outline" size="sm" className="border-dashed border-primary/50 text-[9px] font-bold text-primary hover:bg-primary/5 px-1" onClick={handleTestBatchNotification}>
                          <Layers className="mr-1 h-3 w-3" /> TEST BATCH
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AlertList({
  alerts,
  onDelete,
  onRestart,
  onEdit,
  safeFormat,
}: {
  alerts: Alert[]
  onDelete: (id: string) => void
  onRestart: (id: string) => void
  onEdit: (alert: Alert) => void
  safeFormat: (d: any, f: string) => string
}) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/5 py-16 text-center transition-all hover:bg-muted/10">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border/50">
          <BellOff className="h-6 w-6 text-muted-foreground/40" />
        </div>
        <h3 className="text-lg font-bold tracking-tight text-foreground/80">Aucune alerte ici</h3>
        <p className="mt-1 max-w-[280px] text-xs font-medium text-muted-foreground/70">
          Modifiez vos filtres ou créez une nouvelle alerte.
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
          onEdit={onEdit}
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
  onEdit,
  safeFormat,
}: {
  alert: Alert
  onDelete: (id: string) => void
  onRestart: (id: string) => void
  onEdit: (alert: Alert) => void
  safeFormat: (d: any, f: string) => string
}) {
  const { toast } = useToast()

  // Styles based on state
  const isTriggered = alert.isTriggered;
  
  const cardBorder = isTriggered
    ? 'border-orange-500/30 dark:border-orange-500/20'
    : 'border-border/50';

  const badgeColors = isTriggered
    ? 'border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400'
    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';

  const cardBg = isTriggered
    ? 'bg-orange-500/[0.02] dark:bg-orange-500/[0.01]'
    : 'bg-background/80';

  return (
    <Card
      className={`group relative overflow-hidden border transition-colors hover:bg-muted/10 ${cardBorder} ${cardBg}`}
    >
      <CardContent className="p-0 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
          
          <div className="flex items-center gap-4">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-inner transition-colors ${isTriggered ? 'bg-orange-100 dark:bg-orange-900/50' : 'bg-slate-100 dark:bg-slate-800'}`}
            >
              {isTriggered ? (
                <CheckCircle2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              ) : (
                <Clock className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              )}
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xl font-bold tracking-tight uppercase">{alert.symbol}</span>
                <Badge
                  variant="outline"
                  className={`px-1.5 py-0 text-[9px] font-bold uppercase tracking-wider ${badgeColors}`}
                >
                  {isTriggered ? 'Déclenchée' : 'En veille'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-foreground/70">
                  {alert.type === 'PRICE' ? 'PRIX' : 'P/E'}
                </span>
                <span>{alert.operator}</span>
                <span className={`text-sm font-bold ${isTriggered ? 'text-orange-600 dark:text-orange-400' : 'text-primary'}`}>
                  {alert.value.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0">
            {/* The Date is always visible on desktop, hidden on mobile */}
            <div className="hidden sm:flex flex-col items-end text-right text-muted-foreground group-hover:text-foreground transition-colors">
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Créée le</span>
              <span className="text-xs font-semibold">{safeFormat(alert.createdAt, 'dd MMM yyyy')}</span>
            </div>

            {/* Actions for Desktop (visible on hover) */}
            <div className="hidden sm:flex gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 mr-2">
              {isTriggered && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950"
                  onClick={() => onRestart(alert.id)}
                  title="Relancer"
                >
                  <Play className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => onEdit(alert)}
                title="Paramètres"
              >
                <Settings2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                onClick={() => onDelete(alert.id)}
                title="Supprimer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Mobile layout Dropdown - Always visible on small screens */}
            <div className="sm:hidden flex items-center justify-between w-full">
               <div className="flex flex-col text-muted-foreground">
                 <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Créée le</span>
                 <span className="text-xs font-semibold">{safeFormat(alert.createdAt, 'dd MMM yyyy')}</span>
               </div>
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="sm" className="h-8 px-2 rounded-md">
                     <MoreVertical className="h-4 w-4 text-muted-foreground" />
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="rounded-xl shadow-md">
                   {isTriggered && (
                     <DropdownMenuItem onClick={() => onRestart(alert.id)} className="font-medium text-emerald-600">
                       <Play className="mr-2 h-3 w-3" /> Relancer
                     </DropdownMenuItem>
                   )}
                   <DropdownMenuItem onClick={() => onEdit(alert)} className="font-medium">
                     <Settings2 className="mr-2 h-3 w-3" /> Paramètres
                   </DropdownMenuItem>
                   <DropdownMenuItem className="font-medium text-red-600" onClick={() => onDelete(alert.id)}>
                     <Trash2 className="mr-2 h-3 w-3" /> Supprimer
                   </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
            </div>
          </div>
        </div>

        {isTriggered && alert.lastTriggeredAt && (
          <div className="flex items-center gap-2 border-t border-border/40 bg-orange-500/5 px-4 py-2">
            <Send className="h-3 w-3 text-orange-500" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-orange-700 dark:text-orange-400">
              Notification le {safeFormat(alert.lastTriggeredAt, 'dd/MM à HH:mm')}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
