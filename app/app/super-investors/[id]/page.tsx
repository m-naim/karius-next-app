'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AlertCircle, ArrowRight, CalendarDays, FileCheck2, ShieldCheck, TrendingUp } from 'lucide-react'
import { LineValue } from '@/components/molecules/charts/LineValue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  getSuperInvestorById,
  getSuperInvestorPerformance,
  getSuperInvestorValuationStatus,
  InvestorDetail,
  SuperInvestorPerformance,
  ValuationStatus,
} from '@/services/superInvestorService'

function money(value?: number | null) {
  if (value == null) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(value)
}

function date(value?: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(`${value}T12:00:00`))
}

export default function SuperInvestorOverviewPage() {
  const params = useParams()
  const slug = params?.id as string
  const [investor, setInvestor] = useState<InvestorDetail | null>(null)
  const [valuation, setValuation] = useState<ValuationStatus | null>(null)
  const [performance, setPerformance] = useState<SuperInvestorPerformance | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    Promise.all([
      getSuperInvestorById(slug),
      getSuperInvestorValuationStatus(slug).catch(() => null),
      getSuperInvestorPerformance(slug, '3M', 'VALUE').catch(() => null),
    ]).then(([detail, status, chart]) => {
      setInvestor(detail)
      setValuation(status)
      setPerformance(chart)
    }).finally(() => setLoading(false))
  }, [slug])

  const latest = investor?.filings[0]
  const chart = performance?.series[0]
  const chartData = useMemo(() => ({
    labels: chart?.points.map((point) => new Date(`${point.date}T12:00:00`).toLocaleDateString('fr-FR')) || [],
    datasets: [{ label: 'Valeur gérée estimée', data: chart?.points.map((point) => point.value) || [] }],
  }), [chart])

  if (loading) return <div className="h-80 animate-pulse rounded-2xl bg-muted/60" />
  if (!investor || !latest) {
    return <div className="rounded-xl border border-border p-8 text-center"><AlertCircle className="mx-auto h-7 w-7 text-muted-foreground" /><p className="mb-0 mt-3 text-sm font-semibold">Aucune déclaration validée disponible.</p></div>
  }

  const root = `/app/super-investors/${slug}`
  return (
    <main className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,.6fr)]">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1.5 border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" /> Données SEC vérifiées
            </Badge>
            <Badge variant="secondary">{investor.availableQuarters}/{investor.targetQuarters} trimestres</Badge>
          </div>
          <h2 className="mt-4 p-0 text-2xl font-black tracking-tight">{investor.displayName}</h2>
          <p className="mb-0 mt-1 text-sm font-semibold text-foreground">{investor.fundDisplayName}</p>
          <p className="mb-0 mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{investor.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {investor.managers.map((manager) => <Badge key={manager.cik} variant="outline" className="font-mono text-[11px]">CIK {manager.cik}</Badge>)}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="mb-0 text-xs font-bold uppercase tracking-wider text-muted-foreground">Valeur gérée estimée</p>
          <p className="mb-0 mt-2 text-3xl font-black tabular-nums">{money(valuation?.latestManagedValueUsd ?? latest.totalValueUsd)}</p>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Couverture</span><span className="font-semibold">{valuation?.latestCoveragePercent?.toFixed(1) ?? '—'} %</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Dernier trimestre</span><span className="font-semibold">{date(latest.reportDate)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Mise à jour</span><span className="font-semibold">{valuation?.updatedAt ? date(valuation.updatedAt.slice(0, 10)) : 'En attente'}</span></div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <div><p className="mb-0 text-xs font-bold uppercase tracking-wider text-primary">Évolution</p><h2 className="mt-1 p-0 text-lg font-black">Valeur reconstruite sur trois mois</h2></div>
          <Button asChild variant="outline" size="sm"><Link href={`${root}/performance`}>Voir la performance <ArrowRight className="ml-1.5 h-4 w-4" /></Link></Button>
        </div>
        <div className="h-[320px] p-4">
          {chartData.labels.length > 1 ? <LineValue data={chartData} unit="$" /> : <EmptyCalculation status={valuation?.status} />}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <OverviewLink href={`${root}/positions`} icon={TrendingUp} title="Positions" description={`${latest.equityHoldings.length} actions et ${latest.optionHoldings.length} options au ${latest.quarterLabel}.`} />
        <OverviewLink href={`${root}/filings`} icon={FileCheck2} title="Déclarations 13F" description={`${latest.sources.length} document(s) source pour le dernier trimestre.`} />
        <OverviewLink href={`${root}/performance`} icon={CalendarDays} title="Méthodologie" description="Valeurs officielles trimestrielles et estimations quotidiennes clairement distinguées." />
      </section>
    </main>
  )
}

function OverviewLink({ href, icon: Icon, title, description }: { href: string; icon: typeof TrendingUp; title: string; description: string }) {
  return <Link href={href} className="group rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/40"><Icon className="h-5 w-5 text-primary" /><h3 className="mt-3 p-0 text-sm font-bold">{title}</h3><p className="mb-0 mt-1 text-xs leading-5 text-muted-foreground">{description}</p></Link>
}

function EmptyCalculation({ status }: { status?: string }) {
  return <div className="flex h-full flex-col items-center justify-center text-center"><TrendingUp className="h-7 w-7 text-muted-foreground" /><p className="mb-0 mt-3 text-sm font-semibold">{status === 'FAILED' ? 'Le calcul a échoué' : 'Valorisation en cours de préparation'}</p><p className="mb-0 mt-1 text-xs text-muted-foreground">La courbe apparaîtra après le traitement des cours historiques.</p></div>
}
