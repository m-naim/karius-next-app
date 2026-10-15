'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Bell, BellOff, CheckCircle, Smartphone, Send, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import alertService from '@/services/alertService'

function decodeVapidKey(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

export function PushNotificationToggle({ onSubscriptionChange }: { onSubscriptionChange?: (active: boolean) => void }) {
  const { toast } = useToast()
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [active, setActive] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    const loadSubscription = async () => {
      if (typeof window === 'undefined' || !('Notification' in window)) return
      setPermission(Notification.permission)
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        const subscription = await registration.pushManager.getSubscription()
        if (!cancelled) {
          const isActive = Boolean(subscription)
          setActive(isActive)
        }
      } catch (error) {
        console.warn('Unable to inspect browser push subscription', error)
      }
    }
    void loadSubscription()
    return () => { cancelled = true }
  }, [])

  const requestNotificationPermission = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast({ title: 'Notifications non supportées', description: 'Votre navigateur ne gère pas les notifications Push. Vous pouvez utiliser Telegram ou ntfy.', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await Notification.requestPermission()
      setPermission(res)
      if (res !== 'granted') {
        toast({ title: res === 'denied' ? 'Autorisation refusée' : 'Autorisation non accordée', description: 'Autorisez les notifications dans les paramètres de votre navigateur pour continuer.', variant: 'destructive' })
        return
      }

      const config = await alertService.getBrowserConfig()
      if (!config?.configured || !config.publicKey) throw new Error('Le serveur de notifications navigateur n’est pas configuré.')

      const registration = await navigator.serviceWorker.register('/sw.js')
      const subscription = await registration.pushManager.getSubscription()
        || await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: decodeVapidKey(config.publicKey) })
      await alertService.saveBrowserSubscription(subscription.toJSON())
      setActive(true)
      onSubscriptionChange?.(true)
      toast({ title: 'Notifications navigateur activées 🔔', description: 'Vous recevrez désormais vos alertes sur cet appareil, même si l’application est fermée.' })
    } catch (error: any) {
      console.error('Failed to activate browser notifications:', error)
      toast({ title: 'Activation impossible', description: error?.message || 'Impossible d’enregistrer cet appareil. Réessayez dans quelques instants.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const disableNotifications = async () => {
    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      await alertService.removeBrowserSubscription(subscription?.endpoint)
      await subscription?.unsubscribe()
      setActive(false)
      onSubscriptionChange?.(false)
      toast({ title: 'Notifications navigateur désactivées' })
    } catch (error) {
      console.error('Failed to disable browser notifications:', error)
      toast({ title: 'Désactivation impossible', description: 'Réessayez dans quelques instants.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const sendTestNotification = async () => {
    setLoading(true)
    try {
      await alertService.syncCurrentBrowserSubscription()
      await alertService.testBrowserNotification()
      toast({ title: 'Notification de test envoyée', description: 'Vérifiez votre centre de notifications.' })
    } catch (error: any) {
      console.error('Failed to send browser notification test:', error)
      toast({ title: 'Échec du test', description: error?.message || 'Activez d’abord les notifications navigateur sur cet appareil.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const isSupported = typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window

  return (
    <Card className="border border-border/80 bg-card/80 shadow-md backdrop-blur-md">
      <CardContent className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3.5">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${active && permission === 'granted' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500' : 'border-primary/20 bg-primary/10 text-primary'}`}>
            {active && permission === 'granted' ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-foreground">Notifications navigateur</h4>
              {active && permission === 'granted' ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-extrabold text-emerald-500"><CheckCircle className="h-3 w-3" /> Activé</span>
              ) : (
                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-extrabold text-amber-600">Non configuré</span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">Recevez vos alertes sur cet appareil, sans Telegram, même lorsque l’application est fermée.</p>
            {!isSupported && <p className="mt-1 text-[11px] text-destructive">Ce navigateur ne prend pas en charge les notifications Push.</p>}
          </div>
        </div>
        <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
          {active ? (
            <>
              <Button onClick={sendTestNotification} disabled={loading} variant="outline" size="sm" className="w-full gap-2 rounded-full border-emerald-500/40 bg-emerald-500/10 text-xs text-emerald-500 hover:bg-emerald-500/20 sm:w-auto">
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Tester
              </Button>
              <Button onClick={disableNotifications} disabled={loading} variant="ghost" size="sm" className="text-xs text-muted-foreground">Désactiver</Button>
            </>
          ) : (
            <Button onClick={requestNotificationPermission} disabled={loading || !isSupported} size="sm" className="w-full gap-2 rounded-full text-xs shadow-sm sm:w-auto">
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Smartphone className="h-3.5 w-3.5" />} Activer sur cet appareil
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
