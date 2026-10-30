'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { AlertTriangle, BarChart3, CalendarClock, ChevronDown, ShieldCheck } from 'lucide-react'
import { LineValue } from '@/components/molecules/charts/LineValue'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
  getSuperInvestorPerformance,
  getSuperInvestorValuationCoverage,
  SuperInvestorPerformance,
  ValuationCoverage,
  ValuationView,
} from '@/services/superInvestorService'

const periods = ['1M', '3M', 'YTD', '1Y', '3Y', '5Y', 'MAX']

export default function SuperInvestorPerformancePage() {
  const params = useParams()
  const slug = params?.id as string
  const [view, setView] = useState<ValuationView>('VALUE')
  const [period, setPeriod] = useState('1Y')
  const [data, setData] = useState<SuperInvestorPerformance | null>(null)
  const [coverageDetail, setCoverageDetail] = useState<ValuationCoverage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError(false)
    const benchmarks = view === 'PERFORMANCE' ? ['INDEX:SPY'] : []
    getSuperInvestorPerformance(slug, period, view, benchmarks)
      .then(setData).catch(() => setError(true)).finally(() => setLoading(false))
  }, [slug, period, view])

  useEffect(() => {
    if (!slug) return
    getSuperInvestorValuationCoverage(slug).then(setCoverageDetail).catch(() => setCoverageDetail(null))
  }, [slug])

  const chartData = useMemo(() => {
    const primary = data?.series[0]
    if (!primary) return { labels: [], datasets: [] }
    const labels = primary.points.map((point) => point.date)
    return {
      labels: labels.map((value) => new Date(`${value}T12:00:00`).toLocaleDateString('fr-FR')),
      datasets: data.series.map((series, index) => {
        const valuesByDate = new Map(series.points.map((point) => [point.date, point.value]))
        let last: number | undefined
        const values = labels.map((date) => {
          if (valuesByDate.has(date)) last = valuesByDate.get(date)
          return last ?? 0
        })
        return { label: series.label, data: values, ...(index > 0 ? { borderColor: `hsl(${10 + index * 75} 75% 55%)` } : {}) }
      }),
    }
  }, [data])

  const coverage = data?.coverage.latestPercent
  const belowThreshold = view === 'PERFORMANCE' && coverage != null && coverage < (data?.coverage.thresholdPercent || 90)

  return (
    <main className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="mb-0 text-xs font-bold uppercase tracking-wider text-primary">Historique reconstruit</p><h2 className="mt-1 p-0 text-2xl font-black">Valeur et performance</h2><p className="mb-0 mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">Les points trimestriels proviennent de la SEC. Les valeurs quotidiennes entre ces points sont estimées à partir des cours historiques.</p></div>
        {coverage != null && <Badge variant="outline" className="w-fit gap-1.5 px-3 py-1.5"><ShieldCheck className="h-4 w-4 text-emerald-600" />{coverage.toFixed(1)} % du portefeuille valorisé</Badge>}
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-4 border-b border-border p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <Tabs value={view} onValueChange={(value) => setView(value as ValuationView)}><TabsList><TabsTrigger value="VALUE">Valeur gérée</TabsTrigger><TabsTrigger value="PERFORMANCE">Performance</TabsTrigger></TabsList></Tabs>
          <div className="flex max-w-full gap-1 overflow-x-auto rounded-lg border border-border bg-muted/30 p-1 no-scrollbar">{periods.map((option) => <button key={option} onClick={() => setPeriod(option)} className={cn('shrink-0 rounded-md px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wide', period === option ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground')}>{option}</button>)}</div>
        </div>

        <div className="p-4 sm:p-5">
          {view === 'PERFORMANCE' && <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><Badge variant="secondary">Comparaison : SPY</Badge><span>Les changements trimestriels de capital et de composition sont neutralisés. Les dividendes sont exclus.</span></div>}
          <div className="h-[360px] sm:h-[460px]">
            {loading ? <ChartState icon={BarChart3} title="Calcul de la série…" />
              : error ? <ChartState icon={AlertTriangle} title="La série est momentanément indisponible" />
              : belowThreshold ? <ChartState icon={ShieldCheck} title={`Performance masquée : couverture inférieure à ${data?.coverage.thresholdPercent || 90} %`} />
              : chartData.labels.length < 2 ? <ChartState icon={CalendarClock} title={data?.message || 'La valorisation est en attente'} />
              : <LineValue data={chartData} unit={view === 'VALUE' ? '$' : '%'} />}
          </div>
        </div>
      </section>

      {coverageDetail && coverageDetail.exclusions.length > 0 && (
        <details className="group overflow-hidden rounded-xl border border-border bg-card">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-sm font-bold sm:px-5">
            <span>Détail de la couverture · {coverageDetail.exclusions.length} position(s) portée(s) à valeur constante</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="border-t border-border px-4 py-3 sm:px-5">
            <p className="mb-3 mt-0 text-xs leading-5 text-muted-foreground">Ces lignes participent à la valeur gérée officielle, mais pas au calcul de performance quotidienne tant qu’aucun cours exploitable n’est disponible.</p>
            <div className="divide-y divide-border">
              {coverageDetail.exclusions.slice(0, 20).map((item) => (
                <div key={`${item.cusip}-${item.instrumentType}-${item.issuerName}`} className="grid gap-1 py-2.5 text-xs sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4">
                  <div><span className="font-semibold text-foreground">{item.issuerName}</span><span className="ml-2 font-mono text-muted-foreground">{item.cusip}</span></div>
                  <div className="flex items-center gap-2 text-muted-foreground"><span>{coverageReason(item.reason)}</span><span className="tabular-nums">{formatUsd(item.valueUsd)}</span></div>
                </div>
              ))}
            </div>
            {coverageDetail.exclusions.length > 20 && <p className="mb-0 mt-3 text-xs text-muted-foreground">Et {coverageDetail.exclusions.length - 20} autre(s) position(s).</p>}
          </div>
        </details>
      )}

      <section className="grid gap-3 md:grid-cols-3">
        <Info title="Points officiels" text="Chaque fin de trimestre est ancrée sur la valeur totale déclarée dans le Form 13F." />
        <Info title="Estimation quotidienne" text="Les actions résolues évoluent avec leurs cours. Les options et positions non résolues restent constantes." />
        <Info title="Performance comparable" text="Les sauts trimestriels sont neutralisés pour comparer la stratégie aux indices et aux portefeuilles." />
      </section>
    </main>
  )
}

function ChartState({ icon: Icon, title }: { icon: typeof BarChart3; title: string }) {
  return <div className="flex h-full flex-col items-center justify-center rounded-xl bg-muted/15 text-center"><Icon className="h-7 w-7 text-muted-foreground" /><p className="mb-0 mt-3 text-sm font-semibold">{title}</p></div>
}

function Info({ title, text }: { title: string; text: string }) {
  return <div className="rounded-xl border border-border bg-card p-4"><h3 className="p-0 text-sm font-bold">{title}</h3><p className="mb-0 mt-1 text-xs leading-5 text-muted-foreground">{text}</p></div>
}

function coverageReason(reason: string) {
  if (reason === 'OPTION_NO_DAILY_PRICE') return 'Option sans cours quotidien'
  if (reason === 'UNRESOLVED_CUSIP') return 'CUSIP non résolu'
  return 'Historique de prix indisponible'
}

function formatUsd(value: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}
