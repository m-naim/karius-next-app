'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import alertService, { type NotificationTestSelection } from '@/services/alertService'
import authService from '@/services/authService'
import { HttpError } from '@/services/http'
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
  Search,
  MoreVertical,
  Plus,
  ArrowRight,
  X,
  Play,
  Settings2,
  AlertCircle,
  MessageSquare,
  Radio,
  ExternalLink,
  Copy,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
interface Alert {
  id: string
  symbol: string
  type: 'PRICE' | 'PE'
  operator: string
  value: number
  isTriggered: boolean
  lastTriggeredAt?: string | number[]
  createdAt: string | number[]
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
  const [settings, setSettings] = useState<NotificationSettings>({
    channel: 'telegram',
  })
  const [checkingTelegram, setCheckingTelegram] = useState(false)
  const [openingTelegram, setOpeningTelegram] = useState(false)
  const [awaitingTelegram, setAwaitingTelegram] = useState(false)
  const [updatingSettings, setUpdatingSettings] = useState(false)
  const [alertFilter, setAlertFilter] = useState('all')
  const [pendingAlertId, setPendingAlertId] = useState<string | null>(null)
  const [alertToDelete, setAlertToDelete] = useState<Alert | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('price-alerts')
  const { toast } = useToast()

  // Edit Alert State
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null)
  const [newSymbol, setNewSymbol] = useState('')
  const [newType, setNewType] = useState<Alert['type']>('PRICE')
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
  const [preview, setPreview] = useState('')
  const [previewError, setPreviewError] = useState('')
  const [testSelection, setTestSelection] = useState<NotificationTestSelection>({
    source: 'EXAMPLE', id: '', frequency: 'WEEKLY',
  })
  const [testChannel, setTestChannel] = useState<NotificationSettings['channel'] | ''>('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [testingReport, setTestingReport] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [alertsData, settingsData, profileData, disabled, pfts, followedPortfolios, wls] =
        await Promise.all([
          alertService.getMyAlerts(),
          alertService.getNotificationSettings().catch(() => ({ channel: 'telegram' })),
          authService.getProfile().catch(() => ({})),
          authService.getDisabledEntities().catch(() => []),
          getPortfolios().catch(() => ({})),
          getFollowed().catch(() => []),
          getWatchlists().catch(() => []),
        ])
      setAlerts(alertsData)
      setSettings(settingsData)

      setNotificationsEnabled(profileData.notificationsEnabled || false)
      setPortfolioNotifFreq(profileData.portfolioNotifFreq || 'WEEKLY')
      setWatchlistNotifFreq(profileData.watchlistNotifFreq || 'WEEKLY')
      setDisabledEntities(Array.isArray(disabled) ? disabled : [])
      const ownedPortfolios = Array.isArray(pfts?.ownPortfolios) ? pfts.ownPortfolios : []
      const favoritePortfolios = Array.isArray(followedPortfolios) ? followedPortfolios : []
      setPortfolios([
        ...ownedPortfolios,
        ...favoritePortfolios.filter(
          (favorite) => !ownedPortfolios.some((owned) => owned.id === favorite.id)
        ),
      ])
      setWatchlists(Array.isArray(wls) ? wls : [])
    } catch (err: any) {
      console.error('Failed to fetch data', err)
      setError(
        err.message ||
          'Une erreur est survenue lors de la récupération des données. Veuillez réessayer.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    void alertService.trackEvent('alerts_page_viewed').catch(() => undefined)
    const requestedTab = new URLSearchParams(window.location.search).get('tab')
    if (requestedTab && ['price-alerts', 'periodic-reports', 'settings'].includes(requestedTab)) {
      setActiveTab(requestedTab)
    }
  }, [])

  const handleDelete = async () => {
    if (!alertToDelete || pendingAlertId) return
    const { id } = alertToDelete
    setPendingAlertId(id)
    try {
      await alertService.deleteAlert(id)
      setAlerts((previous) => previous.filter((alert) => alert.id !== id))
      setAlertToDelete(null)
      toast({ title: 'Alerte supprimée' })
    } catch {
      toast({ variant: 'destructive', title: 'Suppression impossible', description: 'Réessayez dans quelques instants.' })
    } finally {
      setPendingAlertId(null)
    }
  }

  const handleRestart = async (id: string) => {
    if (pendingAlertId) return
    setPendingAlertId(id)
    try {
      await alertService.restartAlert(id)
      setAlerts((previous) => previous.map((alert) => alert.id === id ? { ...alert, isTriggered: false } : alert))
      toast({ title: 'Alerte réactivée' })
    } catch {
      toast({ variant: 'destructive', title: 'Réactivation impossible', description: 'Réessayez dans quelques instants.' })
    } finally {
      setPendingAlertId(null)
    }
  }

  const handleEditInit = (alert: Alert) => {
    setEditingAlert(alert)
    setEditOperator(alert.operator)
    setEditValue(alert.value.toString())
    setIsEditingOpen(true)
  }

  const handleCreateInit = () => {
    setEditingAlert(null)
    setNewSymbol('')
    setNewType('PRICE')
    setEditOperator('>')
    setEditValue('')
    setIsEditingOpen(true)
  }

  const handleSaveEdit = async () => {
    const value = Number(editValue)
    const symbol = newSymbol.trim().toUpperCase()
    if (savingEdit || !Number.isFinite(value) || value <= 0 || (!editingAlert && !symbol)) return
    setSavingEdit(true)
    try {
      const condition = { operator: editOperator, value }
      if (editingAlert) {
        await alertService.updateAlert(editingAlert.id, condition)
      } else {
        await alertService.createAlert({ symbol, type: newType, ...condition })
        setSearchTerm('')
        setAlertFilter('all')
      }
      setIsEditingOpen(false)
      toast({ title: editingAlert ? 'Alerte modifiée' : 'Alerte créée' })
      await fetchData()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Enregistrement impossible',
        description: 'Vérifiez le symbole et le seuil saisis, puis réessayez.',
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
      toast({
        title: 'Canal mis à jour',
        description: 'Vérifiez la configuration du canal et envoyez un test.',
      })
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
      const settingsData = await alertService.getNotificationSettings()
      setSettings(settingsData)
      if (settingsData.telegramChatId) {
        toast({
          title: 'Telegram connecté',
          description: 'Votre compte Telegram est maintenant lié.',
        })
      } else {
        toast({
          title: 'Liaison non détectée',
          description: 'Cliquez sur le lien Telegram, envoyez /start, puis réessayez.',
        })
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

  const handleOpenTelegram = async () => {
    setOpeningTelegram(true)
    const popup = window.open('about:blank', '_blank')
    try {
      const activationData = await alertService.getTelegramActivationLink()
      const url = activationData?.url
      if (!url) throw new Error('Lien Telegram indisponible')
      void alertService.trackEvent('telegram_activation_link_clicked')
      setAwaitingTelegram(true)
      if (popup) {
        popup.opener = null
        popup.location.href = url
      } else window.location.href = url
    } catch (error) {
      popup?.close()
      console.error('Failed to open Telegram activation', error)
      toast({
        variant: 'destructive',
        title: 'Telegram indisponible',
        description: 'Impossible de générer votre lien personnel. Réessayez.',
      })
    } finally {
      setOpeningTelegram(false)
    }
  }

  useEffect(() => {
    if (!awaitingTelegram) return

    const refreshAfterTelegram = async () => {
      if (document.visibilityState === 'hidden') return
      try {
        const [settingsData, profileData] = await Promise.all([
          alertService.getNotificationSettings(),
          authService.getProfile(),
        ])
        setSettings(settingsData)
        setNotificationsEnabled(Boolean(profileData?.notificationsEnabled))
        if (settingsData.telegramChatId) {
          setAwaitingTelegram(false)
          toast({
            title: 'Telegram est prêt',
            description: 'Vos alertes seront désormais envoyées sur Telegram.',
          })
        }
      } catch {
        // The explicit verification action remains available as a fallback.
      }
    }

    window.addEventListener('focus', refreshAfterTelegram)
    document.addEventListener('visibilitychange', refreshAfterTelegram)
    return () => {
      window.removeEventListener('focus', refreshAfterTelegram)
      document.removeEventListener('visibilitychange', refreshAfterTelegram)
    }
  }, [awaitingTelegram, toast])

  const handleTestNotification = async () => {
    if (settings.channel === 'browser') {
      try {
        await alertService.testBrowserNotification()
        toast({
          title: 'Notification de test envoyée',
          description: 'Vérifiez votre centre de notifications navigateur.',
        })
      } catch (error: any) {
        console.error('Failed to test browser notification:', error)
        toast({
          variant: 'destructive',
          title: 'Échec du test',
          description:
            error?.message || 'Activez d’abord les notifications navigateur sur cet appareil.',
        })
      }
      return
    }
    if (!settings.telegramChatId) return
    try {
      await authService.testNotification(settings.telegramChatId)
      toast({
        title: 'Message de test envoyé',
        description: 'Vérifiez immédiatement votre conversation Telegram.',
      })
    } catch (error) {
      console.error('Failed to test notification:', error)
      toast({
        variant: 'destructive',
        title: "Échec de l'envoi du test",
        description:
          "Telegram n'a pas accepté le message. Relancez la liaison ou vérifiez que le bot n'est pas bloqué.",
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
        description: enabled
          ? `Les alertes pourront maintenant vous être envoyées via ${
              settings.channel === 'browser' ? 'le navigateur' : settings.channel
            }.`
          : 'Vous pourrez les réactiver à tout moment.',
      })
    } catch (error) {
      console.error('Failed to update notification status:', error)
      toast({
        variant: 'destructive',
        title: 'Mise à jour impossible',
        description: 'Réessayez dans quelques instants.',
      })
    } finally {
      setUpdatingSettings(false)
    }
  }

  const handleReportPreview = async () => {
    setPreviewLoading(true)
    setPreview('')
    setPreviewError('')
    try {
      setPreview((await alertService.previewNotification(testSelection)).text)
    } catch (error) {
      setPreviewError(error instanceof HttpError && error.status === 422
        ? 'Aucune variation disponible pour cette période. Choisissez une autre période ou un exemple fictif.'
        : 'Impossible de charger cet aperçu. Vérifiez votre sélection et réessayez.')
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleSendPreview = async () => {
    setTestingReport(true)
    try {
      await alertService.sendNotificationTest(testSelection, selectedTestChannel, preview)
      toast({ title: 'Notification de test envoyée', description: 'Vérifiez le canal sélectionné.' })
    } catch (error) {
      if (error instanceof HttpError && error.status === 409) {
        setPreview('')
        setPreviewError('Les données ont changé. Affichez le nouvel aperçu avant de l’envoyer.')
      } else {
        toast({ variant: 'destructive', title: 'Échec de l’envoi', description: 'Vérifiez la configuration du canal.' })
      }
    } finally {
      setTestingReport(false)
    }
  }

  const updateTestSelection = (selection: Partial<NotificationTestSelection>) => {
    setPreview('')
    setPreviewError('')
    setTestSelection((previous) => ({ ...previous, ...selection }))
  }

  const handleTestBatchNotification = async () => {
    setTestingReport(true)
    try {
      await alertService.testLastBatchNotification()
      toast({ title: 'Rapport de test envoyé', description: 'Vérifiez votre canal de réception.' })
    } catch {
      toast({ variant: 'destructive', title: 'Échec de l’envoi du rapport', description: 'Vérifiez votre canal dans l’onglet Réception, puis réessayez.' })
    } finally {
      setTestingReport(false)
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
      toast({
        title: 'Rapports sauvegardés',
        description: 'Vos fréquences et préférences de notification sont à jour.',
      })
    } catch (error) {
      console.error('Failed to save reports:', error)
      toast({
        variant: 'destructive',
        title: 'Sauvegarde des préférences échouée',
        description:
          "Impossible d'enregistrer vos paramètres. Veuillez vérifier votre connexion et réessayer.",
      })
    } finally {
      setSavingReports(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: 'Copié !' })
  }

  const safeFormat = (dateData: string | number[], formatStr: string) => {
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
    } catch {
      return 'N/A'
    }
  }

  const query = searchTerm.trim().toUpperCase()
  const activeCount = alerts.filter((alert) => !alert.isTriggered).length
  const triggeredCount = alerts.length - activeCount
  const visibleAlerts = alerts.filter((alert) => {
    const matchesStatus = alertFilter === 'all' || alert.isTriggered === (alertFilter === 'triggered')
    return matchesStatus && alert.symbol.toUpperCase().includes(query)
  })
  const channel = {
    telegram: { label: 'Telegram', ready: Boolean(settings.telegramChatId) },
    ntfy: { label: 'ntfy', ready: Boolean(settings.ntfyTopic) },
    browser: { label: 'Navigateur', ready: Boolean(settings.browserPushEnabled) },
  }[settings.channel]
  const receiving = notificationsEnabled && channel.ready

  const availableTestChannels = ([
    { value: 'telegram', label: 'Telegram', ready: Boolean(settings.telegramChatId) },
    { value: 'ntfy', label: 'ntfy', ready: Boolean(settings.ntfyTopic) },
    { value: 'browser', label: 'Navigateur', ready: Boolean(settings.browserPushEnabled) },
  ] as const).filter((option) => option.ready)
  const selectedTestChannel = availableTestChannels.find((option) => option.value === testChannel)?.value
    || availableTestChannels.find((option) => option.value === settings.channel)?.value
    || availableTestChannels[0]?.value || ''
  const previewOptions = testSelection.source === 'ALERT'
    ? alerts.map((alert) => ({ id: alert.id, name: `${alert.symbol} · ${alert.operator} ${alert.value}` }))
    : testSelection.source === 'PORTFOLIO' ? portfolios : watchlists
  const previewBusy = previewLoading || testingReport

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10 [&_p]:mb-0">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="p-0 text-3xl font-semibold tracking-tight sm:text-4xl">Alertes</h1>
          <p className="mt-2 text-sm text-muted-foreground">Surveillez vos seuils et recevez les variations de vos actifs.</p>
        </div>
        {activeTab === 'price-alerts' && (
          <Button onClick={handleCreateInit} disabled={loading}>
            <Plus className="mr-2 h-4 w-4" /> Créer une alerte
          </Button>
        )}
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList aria-label="Sections des alertes" className="mb-6 grid h-11 w-full grid-cols-3 sm:w-fit">
          <TabsTrigger value="price-alerts" className="px-3 sm:px-5">Mes alertes</TabsTrigger>
          <TabsTrigger value="periodic-reports" className="px-3 sm:px-5">Rapports</TabsTrigger>
          <TabsTrigger value="settings" className="px-3 sm:px-5">Réception</TabsTrigger>
        </TabsList>

        <Dialog open={isEditingOpen} onOpenChange={(open) => { if (!savingEdit) setIsEditingOpen(open) }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingAlert ? 'Modifier l’alerte' : 'Créer une alerte'}</DialogTitle>
              <DialogDescription>
                {editingAlert ? `Condition pour ${editingAlert.symbol}` : 'Choisissez un titre et le seuil à surveiller.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(event) => {
              event.preventDefault()
              void handleSaveEdit()
            }}>
              <div className="grid gap-4 py-4">
                {!editingAlert && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="alert-symbol">Symbole</Label>
                      <Input id="alert-symbol" value={newSymbol} maxLength={60} placeholder="AIR.PA" onChange={(event) => setNewSymbol(event.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="alert-type">Indicateur</Label>
                      <select id="alert-type" value={newType} onChange={(event) => setNewType(event.target.value as Alert['type'])} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                        <option value="PRICE">Cours</option>
                        <option value="PE">Ratio P/E</option>
                      </select>
                    </div>
                  </>
                )}
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
                    step="any"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsEditingOpen(false)}
                  disabled={savingEdit}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={savingEdit || Number(editValue) <= 0 || (!editingAlert && !newSymbol.trim())}>
                  {savingEdit ? 'Enregistrement…' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={Boolean(alertToDelete)} onOpenChange={(open) => {
          if (!open && !pendingAlertId) setAlertToDelete(null)
        }}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Supprimer l’alerte sur {alertToDelete?.symbol} ?</DialogTitle>
              <DialogDescription>Ce seuil ne sera plus surveillé.</DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAlertToDelete(null)} disabled={Boolean(pendingAlertId)}>Annuler</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={Boolean(pendingAlertId)}>
                {pendingAlertId ? 'Suppression…' : 'Supprimer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <TabsContent value="price-alerts" className="m-0 space-y-5">
          {!loading && !error && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card px-4 py-3">
              <div className="flex items-center gap-3">
                <Bell className={receiving ? 'h-4 w-4 text-primary' : 'h-4 w-4 text-muted-foreground'} />
                <div>
                  <p className="text-sm font-medium">{channel.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {receiving ? 'Réception activée' : channel.ready ? 'Notifications en pause' : 'Canal à configurer'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('settings')}>
                {receiving ? 'Gérer la réception' : 'Configurer la réception'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {loading ? (
            <p role="status" className="rounded-xl border p-8 text-center text-sm text-muted-foreground">Chargement des alertes…</p>
          ) : error ? (
            <div role="alert" className="grid justify-items-center gap-3 rounded-xl border p-8 text-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <p className="font-medium">{error}</p>
              <Button onClick={fetchData} variant="outline">Réessayer</Button>
            </div>
          ) : (
            <>
              {alerts.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div role="group" aria-label="Filtrer par état" className="flex flex-wrap gap-1">
                    {[
                      { value: 'all', label: 'Toutes', count: alerts.length },
                      { value: 'active', label: 'Actives', count: activeCount },
                      { value: 'triggered', label: 'Déclenchées', count: triggeredCount },
                    ].map(({ value, label, count }) => (
                      <Button key={value} variant={alertFilter === value ? 'secondary' : 'ghost'}
                        size="sm" aria-pressed={alertFilter === value} onClick={() => setAlertFilter(value)}>
                        {label} <span className="ml-1.5 tabular-nums text-muted-foreground">{count}</span>
                      </Button>
                    ))}
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search aria-hidden className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input aria-label="Rechercher un symbole" placeholder="Rechercher un symbole"
                      value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="pl-9 pr-9" />
                    {searchTerm && (
                      <Button aria-label="Effacer la recherche" variant="ghost" size="icon"
                        className="absolute right-1 top-1 h-8 w-8" onClick={() => setSearchTerm('')}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {visibleAlerts.length ? (
                <ul className="divide-y rounded-xl border bg-card">
                  {visibleAlerts.map((alert) => (
                    <AlertRow key={alert.id} alert={alert} pending={Boolean(pendingAlertId)}
                      onEdit={() => handleEditInit(alert)} onRestart={() => handleRestart(alert.id)}
                      onDelete={() => setAlertToDelete(alert)} safeFormat={safeFormat} />
                  ))}
                </ul>
              ) : (
                <div className="grid justify-items-center gap-3 rounded-xl border border-dashed px-5 py-10 text-center sm:py-14">
                  <BellOff className="h-6 w-6 text-muted-foreground" />
                  <h2 className="p-0 text-base font-semibold text-foreground">
                    {alerts.length === 0 ? 'Créez votre première alerte' : query ? 'Aucun symbole trouvé' :
                      alertFilter === 'active' ? 'Aucune alerte active' : 'Aucune alerte déclenchée'}
                  </h2>
                  {alerts.length === 0 ? (
                    <>
                      <p className="text-sm text-muted-foreground">Choisissez une action et le seuil de cours ou de ratio P/E à surveiller.</p>
                      <Button variant="outline" onClick={handleCreateInit}>Créer une alerte</Button>
                    </>
                  ) : (
                    <Button variant="outline" onClick={() => {
                      setSearchTerm('')
                      setAlertFilter('all')
                    }}>Afficher toutes les alertes</Button>
                  )}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent
          value="periodic-reports"
          className="m-0 animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              <Card className="overflow-hidden border-border/60 shadow-sm">
                <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
                  <div>
                    <CardTitle className="text-lg">Rapports de variation</CardTitle>
                    <CardDescription className="mt-1">Choisissez les actifs suivis et la fréquence de vos récapitulatifs.</CardDescription>
                  </div>
                  <Button size="sm" onClick={handleSaveReports} disabled={savingReports || loading || Boolean(error)}>
                    {savingReports ? 'Enregistrement…' : 'Enregistrer'}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-8 p-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground border-b pb-2">
                      Fréquences d'envoi
                    </h3>
                    <div className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                      <Bell className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      <p className="mb-0 text-xs leading-relaxed text-muted-foreground">
                        Vos portefeuilles favoris sont aussi surveillés : une alerte est envoyée dès
                        qu&apos;un favori enregistre un mouvement, si les notifications sont
                        activées.
                      </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="portfolio-frequency">Portefeuilles</Label>
                        <select id="portfolio-frequency"
                          value={portfolioNotifFreq}
                          onChange={(e) => setPortfolioNotifFreq(e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="NONE">Aucun rapport</option>
                          <option value="DAILY">Quotidien</option>
                          <option value="WEEKLY">Hebdomadaire</option>
                          <option value="MONTHLY">Mensuel</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="watchlist-frequency">Listes de suivi</Label>
                        <select id="watchlist-frequency"
                          value={watchlistNotifFreq}
                          onChange={(e) => setWatchlistNotifFreq(e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="NONE">Aucun rapport</option>
                          <option value="DAILY">Quotidien</option>
                          <option value="WEEKLY">Hebdomadaire</option>
                          <option value="MONTHLY">Mensuel</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground border-b pb-2">
                      Éléments inclus
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Cochez les portefeuilles et les listes à inclure dans les rapports.
                    </p>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase text-primary">
                          Portefeuilles
                        </Label>
                        {portfolios.map((p) => (
                          <label
                            key={p.id}
                            className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-muted/50 rounded-md"
                          >
                            <input
                              type="checkbox"
                              checked={!disabledEntities.includes(p.id)}
                              onChange={(e) => {
                                if (e.target.checked)
                                  setDisabledEntities((prev) => prev.filter((id) => id !== p.id))
                                else setDisabledEntities((prev) => [...prev, p.id])
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-primary"
                            />
                            <span className="text-sm font-medium">{p.name}</span>
                          </label>
                        ))}
                        {portfolios.length === 0 && (
                          <p className="text-xs italic text-muted-foreground">Aucun portefeuille</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase text-primary">
                          Listes de suivi
                        </Label>
                        {watchlists.map((w) => (
                          <label
                            key={w.id}
                            className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-muted/50 rounded-md"
                          >
                            <input
                              type="checkbox"
                              checked={!disabledEntities.includes(w.id)}
                              onChange={(e) => {
                                if (e.target.checked)
                                  setDisabledEntities((prev) => prev.filter((id) => id !== w.id))
                                else setDisabledEntities((prev) => [...prev, w.id])
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-primary"
                            />
                            <span className="text-sm font-medium">{w.name}</span>
                          </label>
                        ))}
                        {watchlists.length === 0 && (
                          <p className="text-xs italic text-muted-foreground">Aucune liste de suivi</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle>Aperçu et test</CardTitle>
                  <CardDescription>Prévisualisez une notification, puis envoyez-la sur un canal configuré.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="test-source">Contenu</Label>
                    <select id="test-source" value={testSelection.source} disabled={previewBusy}
                      onChange={(event) => updateTestSelection({ source: event.target.value as NotificationTestSelection['source'], id: '' })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="EXAMPLE">Exemple fictif</option>
                      <option value="ALERT">Alerte de seuil</option>
                      <option value="PORTFOLIO">Rapport de portefeuille</option>
                      <option value="WATCHLIST">Rapport de liste de suivi</option>
                    </select>
                  </div>
                  {testSelection.source !== 'EXAMPLE' && (
                    <div className="grid gap-2">
                      <Label htmlFor="test-entity">Élément à prévisualiser</Label>
                      <select id="test-entity" value={testSelection.id} disabled={previewBusy}
                        onChange={(event) => updateTestSelection({ id: event.target.value })}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="">{previewOptions.length ? 'Sélectionner un élément' : 'Aucun élément disponible'}</option>
                        {previewOptions.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
                      </select>
                    </div>
                  )}
                  {(testSelection.source === 'PORTFOLIO' || testSelection.source === 'WATCHLIST') && (
                    <div className="grid gap-2">
                      <Label htmlFor="test-period">Période</Label>
                      <select id="test-period" value={testSelection.frequency} disabled={previewBusy}
                        onChange={(event) => updateTestSelection({ frequency: event.target.value })}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="DAILY">Un jour</option>
                        <option value="WEEKLY">Une semaine</option>
                        <option value="MONTHLY">Un mois</option>
                      </select>
                    </div>
                  )}
                  <Button variant="outline" onClick={handleReportPreview}
                    disabled={previewBusy || (testSelection.source !== 'EXAMPLE' && !testSelection.id)}>
                    {previewLoading ? 'Chargement…' : 'Afficher l’aperçu'}
                  </Button>
                  {previewError && <p role="alert" className="text-sm text-destructive">{previewError}</p>}
                  {preview && (
                    <>
                      <p className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">{preview}</p>
                      {availableTestChannels.length ? (
                        <div className="grid gap-2">
                          <Label htmlFor="test-channel">Envoyer sur</Label>
                          <select id="test-channel" value={selectedTestChannel} disabled={previewBusy}
                            onChange={(event) => setTestChannel(event.target.value as NotificationSettings['channel'])}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            {availableTestChannels.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                          <Button onClick={handleSendPreview} disabled={previewBusy}>
                            {testingReport ? 'Envoi…' : 'M’envoyer ce test'}
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" onClick={() => setActiveTab('settings')}>Configurer un canal</Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="settings" className="m-0 animate-in fade-in slide-in-from-bottom-2">
          <div className="max-w-2xl">
            <Card className="overflow-hidden border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Canal de réception</CardTitle>
                <CardDescription>Choisissez où recevoir vos alertes et vos rapports.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-4">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-500">
                    Où recevoir vos alertes
                  </Label>
                  <RadioGroup
                    aria-label="Canal de réception"
                    disabled={updatingSettings || loading}
                    value={settings.channel}
                    onValueChange={(v) =>
                      handleChannelChange(v as 'telegram' | 'ntfy' | 'browser')
                    }
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
                {settings.channel === 'browser' && (
                  <PushNotificationToggle
                    compact
                    onSubscriptionChange={(active) => {
                      setSettings((previous) => ({ ...previous, browserPushEnabled: active }))
                      setNotificationsEnabled(active)
                    }}
                  />
                )}

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
                            Ouvrez votre lien personnel, cliquez sur <strong>Démarrer</strong>{' '}
                            dans Telegram, puis revenez ici.
                          </p>
                        </div>
                        {settings.telegramChatId ? (
                          <Badge
                            variant="outline"
                            className="w-fit gap-1 border-emerald-500/30 bg-emerald-500/10 text-[10px] font-bold text-emerald-600"
                          >
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            Compte lié
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="w-fit gap-1 border-amber-500/30 bg-amber-500/10 text-[10px] font-bold text-amber-700"
                          >
                            En attente
                          </Badge>
                        )}
                      </div>

                      {!settings.telegramChatId ? (
                        <div className="mt-4 space-y-3">
                          <div>
                            <Button
                              onClick={handleOpenTelegram}
                              disabled={openingTelegram}
                              className="h-10 w-full gap-2 bg-[#24A1DE] font-bold text-white hover:bg-[#2092ca]"
                            >
                              <ExternalLink className="h-4 w-4" />
                              {openingTelegram ? 'Ouverture...' : 'Activer avec Telegram'}
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            onClick={handleRefreshTelegramStatus}
                            disabled={checkingTelegram}
                            className="h-9 w-full gap-2 text-xs font-bold"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {checkingTelegram
                              ? 'Vérification...'
                              : 'J’ai démarré le bot — vérifier'}
                          </Button>
                          <p className="text-center text-[11px] text-muted-foreground">
                            Le lien expire dans 15 minutes et ne peut être utilisé que pour votre
                            compte.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4 space-y-3 rounded-lg border border-border/60 bg-background p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-bold text-foreground">
                                Notifications Telegram
                              </p>
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
                        <code className="flex-1 truncate text-[10px] font-bold">
                          ntfy.sh/{settings.ntfyTopic || 'chargement...'}
                        </code>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          aria-label="Copier le lien ntfy"
                          disabled={!settings.ntfyTopic}
                          onClick={() => copyToClipboard(`https://ntfy.sh/${settings.ntfyTopic}`)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {settings.ntfyTopic && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`https://ntfy.sh/${settings.ntfyTopic}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Ouvrir le canal <ExternalLink className="ml-2 h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant={notificationsEnabled ? 'outline' : 'default'}
                        onClick={() => handleNotificationsToggle(!notificationsEnabled)}
                        disabled={updatingSettings || !settings.ntfyTopic}>
                        {notificationsEnabled ? 'Mettre en pause' : 'Activer les notifications'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleTestBatchNotification}
                        disabled={testingReport || !settings.ntfyTopic}>
                        {testingReport ? 'Envoi…' : 'Envoyer un rapport test'}
                      </Button>
                    </div>
                  </div>
                )}

                {settings.channel === 'browser' && !settings.browserPushConfigured && (
                  <p role="status" className="rounded-lg border p-3 text-sm text-muted-foreground">
                    Les notifications navigateur sont indisponibles sur ce serveur.
                  </p>
                )}

                {process.env.NODE_ENV === 'development' && (
                  <div className="space-y-2 pt-2">
                    <p className="text-[8px] font-black uppercase text-primary/60 text-center">
                      Outils de Développement
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-dashed border-primary/50 text-[9px] font-bold text-primary hover:bg-primary/5 px-1"
                        onClick={handleTestNotification}
                      >
                        <Send className="mr-1 h-3 w-3" /> Alerte test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-dashed border-primary/50 text-[9px] font-bold text-primary hover:bg-primary/5 px-1"
                        onClick={handleTestBatchNotification}
                        disabled={testingReport}
                      >
                        <Layers className="mr-1 h-3 w-3" /> Rapport test
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AlertRow({
  alert,
  pending,
  onEdit,
  onRestart,
  onDelete,
  safeFormat,
}: {
  alert: Alert
  pending: boolean
  onEdit: () => void
  onRestart: () => void
  onDelete: () => void
  safeFormat: (date: Alert['createdAt'], pattern: string) => string
}) {
  const operatorLabel: Record<string, string> = {
    '>': 'supérieur à',
    '<': 'inférieur à',
    '>=': 'au moins',
    '<=': 'au plus',
  }
  return (
    <li className="flex items-start justify-between gap-3 px-4 py-4 sm:items-center sm:px-5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/app/stocks/${encodeURIComponent(alert.symbol)}`}
            className="break-all font-semibold hover:underline">{alert.symbol}</Link>
          <Badge variant={alert.isTriggered ? 'secondary' : 'outline'}>
            {alert.isTriggered ? 'Déclenchée' : 'Active'}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {alert.type === 'PRICE' ? 'Cours' : 'Ratio P/E'} {operatorLabel[alert.operator] || alert.operator}{' '}
          <strong className="font-medium tabular-nums text-foreground">
            {alert.value.toLocaleString('fr-FR', { maximumFractionDigits: 4 })}
          </strong>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {alert.isTriggered && alert.lastTriggeredAt
            ? `Déclenchée le ${safeFormat(alert.lastTriggeredAt, 'dd MMM yyyy à HH:mm')}`
            : `Créée le ${safeFormat(alert.createdAt, 'dd MMM yyyy')}`}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {alert.isTriggered && (
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={onRestart} disabled={pending}>
            Réactiver
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Actions pour ${alert.symbol}`} disabled={pending}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {alert.isTriggered && (
              <DropdownMenuItem className="sm:hidden" onSelect={onRestart}>
                <Play className="mr-2 h-4 w-4" /> Réactiver
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={onEdit}><Settings2 className="mr-2 h-4 w-4" /> Modifier</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  )
}
