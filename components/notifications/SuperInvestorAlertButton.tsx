'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, BellRing, Loader2, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import alertService, { type SuperInvestorAlertSettings } from '@/services/alertService'

export function SuperInvestorAlertButton({ slug }: { slug: string }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [settings, setSettings] = useState<SuperInvestorAlertSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!user) return
    const controller = new AbortController()
    setSettings(null)
    setLoading(true)
    setLoadFailed(false)
    alertService.getSuperInvestorAlert(slug, controller.signal)
      .then((next) => {
        if (!controller.signal.aborted) setSettings(next)
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadFailed(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [slug, user, attempt])

  if (!user) {
    const destination = encodeURIComponent(`/app/super-investors/${slug}`)
    return (
      <Button asChild size="sm" variant="outline">
        <Link href={`/login?redirect=${destination}`}>
          <Bell aria-hidden="true" className="h-4 w-4" />
          Alertes
        </Link>
      </Button>
    )
  }

  async function toggle() {
    if (loadFailed) {
      setAttempt((value) => value + 1)
      return
    }
    if (!settings || saving) return
    setSaving(true)
    try {
      const next = await alertService.updateSuperInvestorAlert(slug, !settings.enabled)
      setSettings(next)
      toast({
        title: next.enabled ? 'Abonnement enregistré' : 'Alertes désactivées',
        description: next.enabled && !next.deliveryReady
          ? 'Configurez votre canal de réception dans les paramètres d’alertes.'
          : undefined,
      })
    } catch {
      toast({ variant: 'destructive', title: 'Préférence non enregistrée' })
    } finally {
      setSaving(false)
    }
  }

  const enabled = settings?.enabled ?? false
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        size="sm"
        variant={enabled ? 'secondary' : 'outline'}
        aria-pressed={enabled}
        disabled={loading || saving || (!settings && !loadFailed)}
        onClick={toggle}
        title="Recevoir les nouveaux changements de positions 13F de cet investisseur"
      >
        {loading || saving ? (
          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
        ) : enabled ? (
          <BellRing aria-hidden="true" className="h-4 w-4" />
        ) : (
          <Bell aria-hidden="true" className="h-4 w-4" />
        )}
        {loadFailed ? 'Réessayer' : enabled ? 'Alertes suivies' : 'Suivre'}
      </Button>
      {enabled && !settings?.deliveryReady && (
        <Button asChild size="icon" variant="outline" className="h-8 w-8">
          <Link href="/app/alerts?tab=settings" aria-label="Configurer le canal de réception">
            <Settings2 aria-hidden="true" className="h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  )
}
