'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { ChangeType, getSuperInvestorById, HoldingView, InvestorDetail } from '@/services/superInvestorService'

const changeLabels: Record<ChangeType, string> = {
  NEW: 'Nouvelle', ADDED: 'Renforcée', REDUCED: 'Allégée', CLOSED: 'Clôturée',
  UNCHANGED: 'Inchangée', NOT_COMPUTABLE: 'Non calculable',
}

function money(value: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(value)
}

export default function SuperInvestorPositionsPage() {
  const params = useParams()
  const slug = params?.id as string
  const [investor, setInvestor] = useState<InvestorDetail | null>(null)
  const [quarter, setQuarter] = useState(0)
  const [instrument, setInstrument] = useState<'EQUITY' | 'OPTION'>('EQUITY')
  const [query, setQuery] = useState('')

  useEffect(() => { if (slug) getSuperInvestorById(slug).then(setInvestor) }, [slug])
  const filing = investor?.filings[quarter]
  const holdings = useMemo(() => {
    const source = instrument === 'EQUITY' ? filing?.equityHoldings : filing?.optionHoldings
    const needle = query.trim().toLowerCase()
    return (source || []).filter((holding) => !needle || [holding.symbol, holding.issuerName, holding.cusip]
      .some((value) => value?.toLowerCase().includes(needle)))
  }, [filing, instrument, query])

  if (!filing) return <div className="h-72 animate-pulse rounded-2xl bg-muted/60" />

  return (
    <main className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="mb-0 text-xs font-bold uppercase tracking-wider text-primary">Positions déclarées</p><h2 className="mt-1 p-0 text-2xl font-black">Composition 13F</h2><p className="mb-0 mt-1 text-sm text-muted-foreground">Quantités et valeurs issues des déclarations SEC officielles.</p></div>
        <div className="relative w-full lg:w-80"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ticker, société ou CUSIP" className="pl-9" /></div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {investor?.filings.map((item, index) => <button key={item.snapshotId} onClick={() => setQuarter(index)} className={cn('shrink-0 rounded-lg border px-3 py-2 text-left text-xs transition-colors', quarter === index ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-muted')}><span className="block font-bold">{item.quarterLabel}</span><span className="mt-0.5 block opacity-75">{item.validationStatus === 'AMENDED' ? 'Amendé' : 'Validé'}</span></button>)}
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border p-3">
          <Tabs value={instrument} onValueChange={(value) => setInstrument(value as 'EQUITY' | 'OPTION')}>
            <TabsList><TabsTrigger value="EQUITY">Actions ({filing.equityHoldings.length})</TabsTrigger><TabsTrigger value="OPTION">Options ({filing.optionHoldings.length})</TabsTrigger></TabsList>
          </Tabs>
        </div>
        <PositionsTable holdings={holdings} />
      </section>

      {instrument === 'OPTION' && <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-xs leading-5 text-muted-foreground">Les options sont conservées dans la valeur officielle du trimestre. Leur valeur quotidienne reste constante dans la reconstruction, faute d’historique de prix fiable.</div>}
    </main>
  )
}

function PositionsTable({ holdings }: { holdings: HoldingView[] }) {
  if (holdings.length === 0) return <div className="px-6 py-16 text-center text-sm text-muted-foreground">Aucune position dans cette vue.</div>
  return <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground"><tr><th className="px-4 py-3">Titre</th><th className="px-4 py-3">Activité</th><th className="px-4 py-3 text-right">Quantité</th><th className="px-4 py-3 text-right">Poids</th><th className="px-4 py-3 text-right">Valeur déclarée</th></tr></thead><tbody className="divide-y divide-border">{holdings.map((holding) => <tr key={`${holding.cusip}-${holding.titleOfClass}-${holding.putCall || ''}`} className="hover:bg-muted/30"><td className="px-4 py-3"><div className="flex items-center gap-2"><span className="font-bold">{holding.symbol || holding.cusip}</span>{!holding.symbol && <Badge variant="outline" className="text-[10px]">Non valorisée</Badge>}{holding.putCall && <Badge variant="secondary" className="text-[10px]">{holding.putCall}</Badge>}</div><p className="mb-0 mt-1 text-xs text-muted-foreground">{holding.issuerName} · CUSIP {holding.cusip}</p></td><td className="px-4 py-3"><Badge variant="outline">{changeLabels[holding.changeType]}</Badge></td><td className="px-4 py-3 text-right tabular-nums">{holding.sharesOrPrincipal.toLocaleString('fr-FR')}</td><td className="px-4 py-3 text-right tabular-nums">{holding.weightPercent.toFixed(2)} %</td><td className="px-4 py-3 text-right font-bold tabular-nums">{money(holding.valueUsd)}</td></tr>)}</tbody></table></div>
}
