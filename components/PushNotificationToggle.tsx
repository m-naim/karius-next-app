'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Bell, BellOff, CheckCircle, Smartphone, Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function PushNotificationToggle() {
  const { toast } = useToast()
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Non supporté',
        description: 'Votre navigateur ne prend pas en charge les notifications Push.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const res = await Notification.requestPermission()
      setPermission(res)

      if (res === 'granted') {
        toast({
          title: 'Notifications Actives ! 🔔',
          description: 'Vous recevrez désormais les alertes de prix directement sur votre écran.',
          variant: 'success' as any,
        })
      } else if (res === 'denied') {
        toast({
          title: 'Notifications Bloquées',
          description: 'Veuillez autoriser les notifications dans les paramètres de votre navigateur.',
          variant: 'destructive',
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const sendTestNotification = async () => {
    if (permission !== 'granted') return

    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready
      reg.showNotification('📊 Bourse Horus - Test d`Alerte', {
        body: 'Exemple : L`Oréal (OR.PA) vient d`atteindre votre prix cible de 370 € !',
        icon: '/static/favicons/android-icon-192x192.png',
        badge: '/static/favicons/favicon-32x32.png',
        vibrate: [100, 50, 100],
        data: { url: '/app/alerts' },
      } as any)
    }
  }

  return (
    <Card className="border border-border/80 bg-card/80 shadow-md backdrop-blur-md">
      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3.5">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
            permission === 'granted'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
              : 'bg-primary/10 border-primary/20 text-primary'
          }`}>
            {permission === 'granted' ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-foreground">Notifications Native PWA & Smartphone</h4>
              {permission === 'granted' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-extrabold text-emerald-500 border border-emerald-500/20">
                  <CheckCircle className="h-3 w-3" /> Activé
                </span>
              ) : (
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-extrabold text-amber-500 border border-amber-500/20">
                  Non configuré
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Recevez vos alertes de prix et mouvements directement sur votre écran verrouillé.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          {permission === 'granted' ? (
            <Button
              onClick={sendTestNotification}
              variant="outline"
              size="sm"
              className="rounded-full gap-2 text-xs border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 w-full sm:w-auto"
            >
              <Send className="h-3.5 w-3.5" /> Tester une notification
            </Button>
          ) : (
            <Button
              onClick={requestNotificationPermission}
              disabled={loading}
              size="sm"
              className="rounded-full gap-2 text-xs w-full sm:w-auto shadow-sm"
            >
              <Smartphone className="h-3.5 w-3.5" /> Activer sur ce téléphone
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
