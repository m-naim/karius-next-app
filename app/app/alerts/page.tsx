'use client'

import React, { useEffect, useState, useMemo } from 'react'
import alertService from '@/services/alertService'
import authService from '@/services/authService'
import { getAll as getPortfolios } from '@/services/portfolioService'
import { getAll as getWatchlists } from '@/services/watchListService'
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
    try {
      const [alertsData, settingsData, profileData, disabled, pfts, wls] = await Promise.all([
        alertService.getMyAlerts(),
        alertService.getNotificationSettings().catch(() => ({ channel: 'telegram' })),
        authService.getProfile().catch(() => ({})),
        authService.getDisabledEntities().catch(() => []),
        getPortfolios().catch(() => []),
        getWatchlists().catch(() => [])
      ])
      setAlerts(alertsData)
      setSettings(settingsData)
      setTempChatId(settingsData.telegramChatId || '')

      setNotificationsEnabled(profileData.notificationsEnabled || false)
      setPortfolioNotifFreq(profileData.portfolioNotifFreq || 'WEEKLY')
      setWatchlistNotifFreq(profileData.watchlistNotifFreq || 'WEEKLY')
      setDisabledEntities(Array.isArray(disabled) ? disabled : [])
      setPortfolios(Array.isArray(pfts) ? pfts : [])
      setWatchlists(Array.isArray(wls) ? wls : [])
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
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de modifier.' })
    } finally {
      setSavingEdit(false)
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
      toast({ title: 'Rapports sauvegardés', description: 'Vos préférences ont été mises à jour.' })
    } catch (error) {
      console.error('Failed to save reports:', error)
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de sauvegarder.' })
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
          <h1 className="text-4xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
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
                          <Button size="sm" onClick={handleUpdateTelegram} disabled={updatingSettings || !tempChatId} className="font-bold">
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
  const gradientBorder = isTriggered 
    ? 'bg-gradient-to-b from-orange-400 to-red-500' 
    : 'bg-gradient-to-b from-emerald-400 to-blue-500';
    
  const badgeColors = isTriggered
    ? 'border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400'
    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';

  const cardBg = isTriggered
    ? 'bg-background/80 hover:bg-orange-50/30 dark:hover:bg-orange-950/20'
    : 'bg-background/80 hover:bg-slate-50/50 dark:hover:bg-slate-900/40';

  return (
    <Card
      className={`group relative overflow-hidden border border-border/50 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${cardBg}`}
    >
      {/* Avant-Garde Glowing Gradient Border on the left */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${gradientBorder} transition-all duration-300 group-hover:w-1.5`} />
      
      {/* Background glow effect for triggered alerts */}
      {isTriggered && (
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
      )}

      <CardContent className="p-0 relative z-10 pl-1.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
          
          <div className="flex items-center gap-4">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-inner transition-transform group-hover:scale-105 ${isTriggered ? 'bg-orange-100 dark:bg-orange-900/50' : 'bg-slate-100 dark:bg-slate-800'}`}
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
