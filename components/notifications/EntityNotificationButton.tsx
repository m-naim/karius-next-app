'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, BellRing, Loader2, MessageSquare } from 'lucide-react'
import authService from '@/services/authService'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PushNotificationToggle } from '@/components/PushNotificationToggle'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface EntityNotificationButtonProps {
  entityId: string
  entityType: 'portfolio' | 'watchlist'
  label: string
  description: string
  mobileLabel?: string
  className?: string
  onBeforeEnable?: () => Promise<boolean | void>
  eligible?: boolean
}

export function EntityNotificationButton({
  entityId,
  entityType,
  label,
  description,
  mobileLabel,
  className,
  onBeforeEnable,
  eligible = true,
}: EntityNotificationButtonProps) {
  const { toast } = useToast()
  const [subscribed, setSubscribed] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [setupOpen, setSetupOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([authService.getDisabledEntities(), authService.getProfile()])
      .then(([disabled, profile]) => {
        if (cancelled) return
        const disabledIds = Array.isArray(disabled) ? disabled : []
        setSubscribed(eligible && !disabledIds.includes(entityId))
        setNotificationsEnabled(Boolean(profile?.notificationsEnabled))
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [eligible, entityId])

  const ensureFrequency = async () => {
    const profile = await authService.getProfile()
    const portfolioFrequency = profile?.portfolioNotifFreq || 'NONE'
    const watchlistFrequency = profile?.watchlistNotifFreq || 'NONE'
    const nextPortfolioFrequency =
      entityType === 'portfolio' && portfolioFrequency === 'NONE'
        ? 'WEEKLY'
        : portfolioFrequency
    const nextWatchlistFrequency =
      entityType === 'watchlist' && watchlistFrequency === 'NONE'
        ? 'WEEKLY'
        : watchlistFrequency

    if (
      nextPortfolioFrequency === portfolioFrequency &&
      nextWatchlistFrequency === watchlistFrequency
    ) {
      return
    }

    await authService.updateProfile({
      name: profile?.name || '',
      telegramChatId: profile?.telegramChatId || '',
      notificationsEnabled: Boolean(profile?.notificationsEnabled),
      portfolioNotifFreq: nextPortfolioFrequency,
      watchlistNotifFreq: nextWatchlistFrequency,
      notificationChannel: profile?.notificationChannel || 'telegram',
    })
  }

  const handleToggle = async () => {
    if (pending) return
    if (subscribed && !notificationsEnabled) {
      setPending(true)
      try {
        await ensureFrequency()
        setSetupOpen(true)
      } catch {
        toast({
          variant: 'destructive',
          title: 'Préférence non enregistrée',
          description: 'Réessayez dans quelques instants.',
        })
      } finally {
        setPending(false)
      }
      return
    }
    setPending(true)
    try {
      const disabled = await authService.getDisabledEntities()
      const disabledIds = new Set<string>(Array.isArray(disabled) ? disabled : [])

      if (subscribed) {
        disabledIds.add(entityId)
        await authService.updateDisabledEntities([...disabledIds])
        setSubscribed(false)
        toast({ title: 'Suivi désactivé', description })
        return
      }

      const canEnable = await onBeforeEnable?.()
      if (canEnable === false) return

      await ensureFrequency()
      disabledIds.delete(entityId)
      await authService.updateDisabledEntities([...disabledIds])
      setSubscribed(true)

      if (!notificationsEnabled) {
        setSetupOpen(true)
      } else {
        toast({ title: 'Suivi activé', description })
      }
    } catch (error) {
      console.error('Unable to update entity notification preference', error)
      toast({
        variant: 'destructive',
        title: 'Préférence non enregistrée',
        description: 'Réessayez dans quelques instants.',
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant={subscribed && notificationsEnabled ? 'secondary' : 'outline'}
        onClick={handleToggle}
        disabled={loading || pending}
        aria-pressed={subscribed && notificationsEnabled}
        className={cn('h-8 gap-1.5 text-xs font-semibold', className)}
        title={subscribed && notificationsEnabled ? 'Désactiver ce suivi' : description}
      >
        {loading || pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : subscribed && notificationsEnabled ? (
          <BellRing className="h-3.5 w-3.5 text-primary" />
        ) : (
          <Bell className="h-3.5 w-3.5" />
        )}
        {mobileLabel && (
          <span className="sm:hidden">
            {subscribed && notificationsEnabled ? 'Actif' : mobileLabel}
          </span>
        )}
        <span className="hidden sm:inline">
          {subscribed && notificationsEnabled ? 'Alertes actives' : label}
        </span>
        <span className="sr-only">
          {subscribed && notificationsEnabled ? 'Alertes actives' : label}
        </span>
      </Button>

      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Une dernière étape pour être prévenu</DialogTitle>
            <DialogDescription>
              Votre suivi est enregistré. Activez maintenant un canal de réception.
            </DialogDescription>
          </DialogHeader>

          <PushNotificationToggle
            compact
            onSubscriptionChange={(active) => {
              if (!active) return
              setNotificationsEnabled(true)
              setSetupOpen(false)
            }}
          />

          <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 p-4">
            <div className="min-w-0">
              <p className="mb-0 text-sm font-semibold">Vous préférez Telegram ?</p>
              <p className="mb-0 mt-1 text-xs text-muted-foreground">
                Liez le bot une seule fois pour toutes vos alertes.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="shrink-0 gap-2">
              <Link href="/app/alerts?tab=settings">
                <MessageSquare className="h-4 w-4" />
                Configurer
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
