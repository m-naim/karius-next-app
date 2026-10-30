'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Database,
  FileCheck2,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ConsensusReport,
  ConsensusStock,
  getConsensusReport,
  getSuperInvestors,
  InvestorSummary,
} from '@/services/superInvestorService'
import { cn } from '@/lib/utils'

type Tab = 'INVESTORS' | 'MOST_OWNED' | 'TOP_BUYS' | 'TOP_SELLS'

const tabs: Array<{ id: Tab; label: string }> = [
  { id: 'INVESTORS', label: 'Déclarants' },
  { id: 'MOST_OWNED', label: 'Plus détenues' },
  { id: 'TOP_BUYS', label: 'Renforcements' },
  { id: 'TOP_SELLS', label: 'Allègements' },
]

function formatMoney(value?: number) {
  if (value == null || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

function formatDate(value?: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(`${value}T12:00:00`))
}

export default function SuperInvestorsAppPage() {
  const [investors, setInvestors] = useState<InvestorSummary[]>([])
  const [consensus, setConsensus] = useState<ConsensusReport | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('INVESTORS')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([getSuperInvestors(), getConsensusReport()])
      .then(([investorData, consensusData]) => {
        if (!active) return
        setInvestors(investorData)
        setConsensus(consensusData)
      })
      .catch(() => active && setError('Les données 13F vérifiées sont momentanément indisponibles.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const filteredInvestors = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('fr')
    if (!needle) return investors
    return investors.filter((investor) =>
      [investor.displayName, investor.fundDisplayName, investor.style, investor.legalName, investor.cik]
        .filter(Boolean)
        .some((value) => value.toLocaleLowerCase('fr').includes(needle))
    )
  }, [investors, query])

  const consensusRows = useMemo(() => {
    const source =
      activeTab === 'MOST_OWNED'
        ? consensus?.mostOwned
        : activeTab === 'TOP_BUYS'
          ? consensus?.topBuys
          : consensus?.topSells
    const needle = query.trim().toLocaleLowerCase('fr')
    if (!source) return []
    if (!needle) return source
    return source.filter((stock) =>
      [stock.symbol, stock.issuerName, ...stock.holders.map((holder) => holder.investorName)]
        .some((value) => value.toLocaleLowerCase('fr').includes(needle))
    )
  }, [activeTab, consensus, query])

  const latestReportDate = investors
    .map((investor) => investor.latestReportDate)
    .filter(Boolean)
    .sort()
    .at(-1)

  return (
    <main className="min-h-screen w-full bg-background">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
        <header className="border-b border-border pb-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1.5 border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  Données vérifiées sur SEC EDGAR
                </Badge>
                {latestReportDate && (
                  <Badge variant="secondary" className="font-mono font-medium">
                    Dernière période : {formatDate(latestReportDate)}
                  </Badge>
                )}
              </div>
              <h1 className="p-0 text-2xl font-bold tracking-[-0.025em] text-foreground sm:text-3xl">
                Déclarations 13F des super investisseurs
              </h1>
              <p className="mb-0 mt-2 max-w-2xl text-sm font-normal leading-6 text-muted-foreground">
                Consultez les positions officiellement déclarées, leur évolution trimestrielle et les documents sources. La SEC reste la référence de chaque donnée publiée.
              </p>
            </div>

            <div className="relative w-full lg:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un déclarant ou un titre"
                aria-label="Rechercher un déclarant ou un titre"
                className="h-10 bg-card pl-9"
              />
            </div>
          </div>
        </header>

        <section aria-label="État des données" className="grid overflow-hidden rounded-xl border border-border bg-card sm:grid-cols-3">
          <TrustMetric icon={Users} label="Déclarants publiés" value={`${investors.length} / 13`} />
          <TrustMetric icon={Database} label="Couverture du consensus" value={consensus?.coverageLabel || 'En attente'} />
          <TrustMetric icon={FileCheck2} label="Méthode" value="Accessions SEC auditées" />
        </section>

        <nav aria-label="Vues Super Investors" className="flex gap-1 overflow-x-auto border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              className={cn(
                'relative shrink-0 px-3 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                activeTab === tab.id && 'text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primary'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {error ? (
          <ErrorState message={error} />
        ) : loading ? (
          <LoadingState />
        ) : activeTab === 'INVESTORS' ? (
          <InvestorList investors={filteredInvestors} />
        ) : (
          <ConsensusTable rows={consensusRows} tab={activeTab} />
        )}

        <aside className="flex items-start gap-3 rounded-lg bg-muted/60 px-4 py-3 text-xs leading-5 text-muted-foreground">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p className="mb-0 text-xs font-normal leading-5 text-muted-foreground">
            Les formulaires 13F sont publiés après la fin du trimestre et ne couvrent pas nécessairement les liquidités, positions vendeuses, obligations ou titres étrangers du gestionnaire.
          </p>
        </aside>
      </div>
    </main>
  )
}

function TrustMetric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="flex min-h-20 items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="mb-0 text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mb-0 truncate text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
}

function InvestorList({ investors }: { investors: InvestorSummary[] }) {
  if (investors.length === 0) {
    return <EmptyState title="Aucun déclarant trouvé" detail="Modifiez la recherche ou vérifiez que les CIK ont été validés." />
  }

  return (
    <section aria-label="Déclarants 13F" className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="hidden grid-cols-[minmax(240px,1.3fr)_minmax(180px,1fr)_150px_130px_44px] gap-4 border-b border-border bg-muted/50 px-5 py-2.5 text-xs font-semibold text-muted-foreground lg:grid">
        <span>Déclarant</span>
        <span>Identité SEC</span>
        <span>Dernière période</span>
        <span className="text-right">Valeur 13F</span>
        <span className="sr-only">Ouvrir</span>
      </div>
      <div className="divide-y divide-border">
        {investors.map((investor) => (
          <Link
            key={investor.slug}
            href={`/app/super-investors/${investor.slug}`}
            className="group grid gap-4 px-4 py-4 transition-colors hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring lg:grid-cols-[minmax(240px,1.3fr)_minmax(180px,1fr)_150px_130px_44px] lg:items-center lg:px-5"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                {investor.displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('')}
              </div>
              <div className="min-w-0">
                <h2 className="truncate p-0 text-sm font-semibold text-foreground group-hover:text-primary">{investor.displayName}</h2>
                <p className="mb-0 mt-0.5 truncate text-xs font-normal text-muted-foreground">{investor.fundDisplayName} · {investor.style}</p>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{investor.legalName}</span>
              </div>
              <p className="mb-0 mt-1 font-mono text-[11px] font-normal text-muted-foreground">CIK {investor.cik}</p>
            </div>

            <div>
              <p className="mb-0 text-xs font-semibold text-foreground">{formatDate(investor.latestReportDate)}</p>
              <p className="mb-0 mt-1 text-[11px] font-normal text-muted-foreground">{investor.availableQuarters}/{investor.targetQuarters} trimestres</p>
            </div>

            <p className="mb-0 text-sm font-semibold tabular-nums text-foreground lg:text-right">{formatMoney(investor.totalValueUsd)}</p>
            <ArrowRight className="hidden h-4 w-4 justify-self-end text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary lg:block" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  )
}

function ConsensusTable({ rows, tab }: { rows: ConsensusStock[]; tab: Tab }) {
  if (rows.length === 0) {
    return <EmptyState title="Aucune donnée de consensus" detail="Le consensus apparaîtra lorsque des snapshots vérifiés partageront des tickers résolus." />
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card" aria-label="Consensus des déclarants">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Titre</th>
              <th className="px-4 py-3 text-center font-semibold">Déclarants</th>
              <th className="px-4 py-3 text-right font-semibold">Poids moyen</th>
              <th className="px-4 py-3 text-right font-semibold">Valeur déclarée</th>
              <th className="px-4 py-3 font-semibold">Détail et période</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((stock) => (
              <tr key={stock.symbol} className="align-top transition-colors hover:bg-muted/35">
                <td className="px-4 py-3">
                  <div className="font-semibold text-foreground">{stock.symbol}</div>
                  <div className="mt-0.5 max-w-64 truncate text-xs text-muted-foreground">{stock.issuerName}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="secondary">{stock.investorCount}</Badge>
                </td>
                <td className="px-4 py-3 text-right font-medium tabular-nums">{stock.averageWeightPercent.toFixed(2)} %</td>
                <td className="px-4 py-3 text-right font-medium tabular-nums">{formatMoney(stock.totalValueUsd)}</td>
                <td className="px-4 py-3">
                  <div className="flex max-w-xl flex-wrap gap-1.5">
                    {stock.holders.map((holder) => (
                      <Link
                        key={`${stock.symbol}-${holder.investorSlug}`}
                        href={`/app/super-investors/${holder.investorSlug}`}
                        className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {holder.investorName}
                        <span className="text-muted-foreground">{formatDate(holder.reportDate)}</span>
                        {(tab === 'TOP_BUYS' || tab === 'TOP_SELLS') && holder.changePercent != null && (
                          <span className={cn('inline-flex items-center font-semibold', tab === 'TOP_BUYS' ? 'text-emerald-600' : 'text-rose-600')}>
                            {tab === 'TOP_BUYS' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {Math.abs(holder.changePercent).toFixed(1)} %
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function LoadingState() {
  return (
    <div className="space-y-2" aria-label="Chargement des déclarations" role="status">
      {[0, 1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-lg bg-muted" />)}
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-8 text-center">
      <h2 className="p-0 text-base font-semibold text-foreground">Impossible de charger les déclarations</h2>
      <p className="mb-0 mt-2 text-sm font-normal text-muted-foreground">{message}</p>
      <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Réessayer</Button>
    </div>
  )
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center">
      <Building2 className="mx-auto h-7 w-7 text-muted-foreground" aria-hidden="true" />
      <h2 className="mt-3 p-0 text-base font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mb-0 mt-1 max-w-lg text-sm font-normal text-muted-foreground">{detail}</p>
    </div>
  )
}
