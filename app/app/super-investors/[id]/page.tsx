'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  AlertCircle,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  ExternalLink,
  FileCheck2,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  ChangeType,
  getSuperInvestorById,
  HoldingView,
  InvestorDetail,
} from '@/services/superInvestorService'

type InstrumentTab = 'EQUITY' | 'OPTION'

function formatMoney(value?: number | null) {
  if (value == null || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(`${value}T12:00:00`))
}

function formatQuantity(value?: number | null) {
  if (value == null) return '—'
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value)
}

export default function SuperInvestorDetailPage() {
  const params = useParams()
  const slug = params?.id as string
  const [investor, setInvestor] = useState<InvestorDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuarter, setSelectedQuarter] = useState(0)
  const [instrumentTab, setInstrumentTab] = useState<InstrumentTab>('EQUITY')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true
    if (!slug) return
    getSuperInvestorById(slug)
      .then((data) => active && setInvestor(data))
      .catch(() => active && setError('La déclaration demandée est momentanément indisponible.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [slug])

  const activeFiling = investor?.filings[selectedQuarter]
  const holdings = useMemo(() => {
    if (!activeFiling) return []
    const source = instrumentTab === 'EQUITY' ? activeFiling.equityHoldings : activeFiling.optionHoldings
    const needle = query.trim().toLocaleLowerCase('fr')
    if (!needle) return source
    return source.filter((holding) =>
      [holding.symbol || '', holding.issuerName, holding.cusip, holding.titleOfClass || '']
        .some((value) => value.toLocaleLowerCase('fr').includes(needle))
    )
  }, [activeFiling, instrumentTab, query])

  if (loading) return <DetailSkeleton />

  if (error || !investor || !activeFiling) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="max-w-lg text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h1 className="mt-4 p-0 text-xl font-semibold">Déclaration introuvable</h1>
          <p className="mb-0 mt-2 text-sm font-normal text-muted-foreground">
            {error || 'Ce profil ne possède encore aucun trimestre SEC validé.'}
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link href="/app/super-investors">Retour aux déclarants</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen w-full bg-background">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
        <Link
          href="/app/super-investors"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Tous les déclarants
        </Link>

        <header className="border-b border-border pb-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div className="min-w-0 max-w-3xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1.5 border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  {activeFiling.validationStatus === 'AMENDED' ? 'Trimestre amendé et validé' : 'Trimestre validé'}
                </Badge>
                <Badge variant="secondary">{investor.availableQuarters}/{investor.targetQuarters} trimestres</Badge>
              </div>
              <h1 className="p-0 text-2xl font-bold tracking-[-0.025em] text-foreground sm:text-3xl">{investor.displayName}</h1>
              <p className="mb-0 mt-1 text-sm font-medium text-foreground">{investor.fundDisplayName}</p>
              <p className="mb-0 mt-3 max-w-2xl text-sm font-normal leading-6 text-muted-foreground">{investor.description}</p>
            </div>

            <div className="rounded-lg bg-muted/60 px-4 py-3 text-sm">
              {investor.managers.map((manager) => (
                <div key={manager.cik} className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                  <div>
                    <p className="mb-0 text-xs font-semibold text-foreground">{manager.legalName}</p>
                    <p className="mb-0 mt-0.5 font-mono text-[11px] font-normal text-muted-foreground">CIK {manager.cik}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </header>

        <section aria-label="Résumé de la déclaration" className="grid overflow-hidden rounded-xl border border-border bg-card sm:grid-cols-2 xl:grid-cols-4">
          <SummaryMetric label="Période couverte" value={formatDate(activeFiling.reportDate)} />
          <SummaryMetric label="Dépôt le plus récent" value={formatDate(activeFiling.filingDate)} />
          <SummaryMetric label="Valeur totale déclarée" value={formatMoney(activeFiling.totalValueUsd)} />
          <SummaryMetric label="Lignes SEC" value={activeFiling.entryCount.toLocaleString('fr-FR')} />
        </section>

        <section aria-labelledby="quarters-heading">
          <div className="mb-2 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
            <h2 id="quarters-heading" className="p-0 text-sm font-semibold text-foreground">Historique des déclarations</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {investor.filings.map((filing, index) => (
              <button
                key={filing.snapshotId}
                type="button"
                onClick={() => setSelectedQuarter(index)}
                className={cn(
                  'shrink-0 rounded-md border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  selectedQuarter === index
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground hover:bg-muted'
                )}
              >
                <span className="block text-xs font-semibold">{filing.quarterLabel}</span>
                <span className={cn('mt-0.5 block text-[10px]', selectedQuarter === index ? 'text-primary-foreground/75' : 'text-muted-foreground')}>
                  {filing.validationStatus === 'AMENDED' ? 'Amendé' : 'Validé'}
                </span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card" aria-labelledby="positions-heading">
            <div className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 id="positions-heading" className="p-0 text-base font-semibold text-foreground">Positions déclarées</h2>
                <p className="mb-0 mt-1 text-xs font-normal text-muted-foreground">Poids calculés séparément pour les actions et les options.</p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ticker, émetteur ou CUSIP"
                  aria-label="Rechercher dans les positions"
                  className="h-9 bg-background pl-9"
                />
              </div>
            </div>

            <div className="flex border-b border-border px-4" role="tablist" aria-label="Type d'instrument">
              <InstrumentTabButton active={instrumentTab === 'EQUITY'} onClick={() => setInstrumentTab('EQUITY')}>
                Actions <span className="text-muted-foreground">({activeFiling.equityHoldings.length})</span>
              </InstrumentTabButton>
              <InstrumentTabButton active={instrumentTab === 'OPTION'} onClick={() => setInstrumentTab('OPTION')}>
                Options <span className="text-muted-foreground">({activeFiling.optionHoldings.length})</span>
              </InstrumentTabButton>
            </div>

            <HoldingsTable holdings={holdings} />
          </section>

          <aside className="space-y-4">
            <section className="rounded-xl border border-border bg-card p-4" aria-labelledby="sources-heading">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-primary" aria-hidden="true" />
                <h2 id="sources-heading" className="p-0 text-sm font-semibold text-foreground">Documents sources</h2>
              </div>
              <div className="mt-4 space-y-2">
                {activeFiling.sources.map((source) => (
                  <a
                    key={source.accessionNumber}
                    href={source.secUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group block rounded-md bg-muted/60 px-3 py-2.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex items-center justify-between gap-2 text-xs font-semibold text-foreground">
                      {source.formType}
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" aria-hidden="true" />
                    </span>
                    <span className="mt-1 block break-all font-mono text-[10px] text-muted-foreground">{source.accessionNumber}</span>
                  </a>
                ))}
              </div>
            </section>

            <section className="rounded-xl bg-muted/60 p-4">
              <h2 className="p-0 text-sm font-semibold text-foreground">Méthode et limites</h2>
              <p className="mb-0 mt-2 text-xs font-normal leading-5 text-muted-foreground">{investor.disclaimer}</p>
              <p className="mb-0 mt-2 text-xs font-normal leading-5 text-muted-foreground">
                Les variations comparent les quantités de deux trimestres consécutifs. Un split ou un changement de CUSIP peut produire un faux signal.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  )
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border px-4 py-4 last:border-b-0 sm:border-r sm:[&:nth-child(2)]:border-r-0 xl:border-b-0 xl:[&:nth-child(2)]:border-r xl:last:border-r-0">
      <p className="mb-0 text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mb-0 mt-1 text-base font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  )
}

function InstrumentTabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'relative px-3 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active ? 'text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primary' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
    </button>
  )
}

function HoldingsTable({ holdings }: { holdings: HoldingView[] }) {
  if (holdings.length === 0) {
    return (
      <div className="px-5 py-14 text-center">
        <p className="mb-0 text-sm font-semibold text-foreground">Aucune position dans cette vue</p>
        <p className="mb-0 mt-1 text-xs font-normal text-muted-foreground">Le dépôt SEC ne contient aucun instrument correspondant.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="border-b border-border bg-muted/45 text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-semibold">Titre</th>
            <th className="px-4 py-3 font-semibold">Activité</th>
            <th className="px-4 py-3 text-right font-semibold">Quantité</th>
            <th className="px-4 py-3 text-right font-semibold">Poids</th>
            <th className="px-4 py-3 text-right font-semibold">Valeur déclarée</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {holdings.map((holding) => (
            <tr key={`${holding.cusip}-${holding.titleOfClass}-${holding.putCall || 'equity'}`} className="transition-colors hover:bg-muted/35">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{holding.symbol || holding.cusip}</span>
                  {!holding.symbol && <Badge variant="outline" className="text-[10px] text-muted-foreground">Ticker non résolu</Badge>}
                  {holding.putCall && <Badge variant="secondary" className="text-[10px]">{holding.putCall}</Badge>}
                </div>
                <div className="mt-0.5 max-w-80 truncate text-xs text-muted-foreground">{holding.issuerName} · {holding.titleOfClass || 'Classe non précisée'}</div>
                <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">CUSIP {holding.cusip}</div>
              </td>
              <td className="px-4 py-3"><ChangeBadge holding={holding} /></td>
              <td className="px-4 py-3 text-right font-medium tabular-nums text-foreground">{formatQuantity(holding.sharesOrPrincipal)}</td>
              <td className="px-4 py-3 text-right font-medium tabular-nums text-foreground">{holding.weightPercent.toFixed(2)} %</td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">{formatMoney(holding.valueUsd)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const changeLabels: Record<ChangeType, string> = {
  NEW: 'Nouvelle position',
  ADDED: 'Renforcée',
  REDUCED: 'Allégée',
  CLOSED: 'Clôturée',
  UNCHANGED: 'Inchangée',
  NOT_COMPUTABLE: 'Non calculable',
}

function ChangeBadge({ holding }: { holding: HoldingView }) {
  const positive = holding.changeType === 'NEW' || holding.changeType === 'ADDED'
  const negative = holding.changeType === 'REDUCED' || holding.changeType === 'CLOSED'
  return (
    <div>
      <span className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold',
        positive && 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        negative && 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
        !positive && !negative && 'bg-muted text-muted-foreground'
      )}>
        {holding.changeType === 'ADDED' && <ArrowUpRight className="h-3 w-3" aria-hidden="true" />}
        {holding.changeType === 'REDUCED' && <ArrowDownRight className="h-3 w-3" aria-hidden="true" />}
        {changeLabels[holding.changeType]}
      </span>
      {holding.changePercent != null && (
        <div className="mt-1 text-xs tabular-nums text-muted-foreground">
          {holding.changePercent > 0 ? '+' : ''}{holding.changePercent.toFixed(2)} %
        </div>
      )}
    </div>
  )
}

function DetailSkeleton() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1500px] space-y-5 px-4 py-8 md:px-8" role="status" aria-label="Chargement de la déclaration">
      <div className="h-5 w-40 animate-pulse rounded bg-muted" />
      <div className="h-36 animate-pulse rounded-xl bg-muted" />
      <div className="grid gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-lg bg-muted" />)}
      </div>
      <div className="h-96 animate-pulse rounded-xl bg-muted" />
    </main>
  )
}
