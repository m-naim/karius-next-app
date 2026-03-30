'use client'

import React, { useEffect, useState } from 'react'
import alertService from '@/services/alertService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Bell, BellOff, Send, Trash2, CheckCircle2, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

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

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [chatId, setChatId] = useState('')
  const [updatingTelegram, setUpdatingTelegram] = useState(false)
  const { toast } = useToast()

  const fetchAlerts = async () => {
    try {
      const data = await alertService.getMyAlerts()
      setAlerts(data)
    } catch (error) {
      console.error('Failed to fetch alerts', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
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

  const handleUpdateTelegram = async () => {
    if (!chatId) return
    setUpdatingTelegram(true)
    try {
      await alertService.updateTelegram(chatId)
      toast({
        title: 'Configuration mise à jour',
        description: 'Votre Chat ID Telegram a été enregistré.',
      })
    } catch (error) {
      console.error('Failed to update telegram:', error)
    } finally {
      setUpdatingTelegram(false)
    }
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

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes Alertes</h1>
          <p className="text-sm text-muted-foreground">
            Gérez vos alertes de prix et de valorisation.
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Telegram Config */}
        <Card className="h-fit md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Send className="h-5 w-5 text-blue-500" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configurez Telegram pour recevoir vos alertes instantanément.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chatId" className="text-xs">
                Chat ID Telegram
              </Label>
              <div className="flex gap-2">
                <Input
                  id="chatId"
                  placeholder="Ex: 12345678"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  className="h-9 text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleUpdateTelegram}
                  disabled={updatingTelegram || !chatId}
                >
                  {updatingTelegram ? '...' : 'Save'}
                </Button>
              </div>
            </div>
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              Obtenez votre ID via <code className="rounded bg-muted px-1">@userinfobot</code> sur
              Telegram. N'oubliez pas de lancer votre bot avec{' '}
              <code className="rounded bg-muted px-1">/start</code>.
            </p>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <div className="space-y-4 md:col-span-2">
          {loading ? (
            <div className="flex justify-center py-12">
              <span className="animate-pulse text-muted-foreground">Chargement des alertes...</span>
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border bg-card/50 px-4 py-12 text-center">
              <BellOff className="mb-4 h-12 w-12 text-muted-foreground/30" />
              <h3 className="text-lg font-semibold">Aucune alerte active</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Ajoutez des alertes depuis vos watchlists pour suivre vos actions préférées.
              </p>
            </div>
          ) : (
            alerts.map((alert) => (
              <Card
                key={alert.id}
                className={`overflow-hidden transition-all ${alert.isTriggered ? 'border-green-200 bg-green-50/10' : ''}`}
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`rounded-full p-2 ${alert.isTriggered ? 'bg-green-100' : 'bg-blue-50'}`}
                      >
                        {alert.isTriggered ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">{alert.symbol}</span>
                          <Badge
                            variant={alert.isTriggered ? 'default' : 'secondary'}
                            className={alert.isTriggered ? 'bg-green-600' : ''}
                          >
                            {alert.isTriggered ? 'Déclenchée' : 'Active'}
                          </Badge>
                        </div>
                        <div className="mt-0.5 text-sm text-muted-foreground">
                          {alert.type === 'PRICE' ? 'Prix' : 'P/E Ratio'} {alert.operator}{' '}
                          <span className="font-medium text-foreground">{alert.value}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(alert.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <span className="text-[10px] text-muted-foreground">
                        Créée le {safeFormat(alert.createdAt, 'dd MMM yyyy')}
                      </span>
                    </div>
                  </div>
                  {alert.isTriggered && alert.lastTriggeredAt && (
                    <div className="flex items-center justify-between border-t border-green-100 bg-green-600/5 px-4 py-2">
                      <span className="text-[10px] font-medium text-green-700">
                        Notification envoyée le {safeFormat(alert.lastTriggeredAt, 'dd/MM HH:mm')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
