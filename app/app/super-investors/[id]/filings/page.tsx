'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ExternalLink, FileCheck2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getSuperInvestorById, InvestorDetail } from '@/services/superInvestorService'

function money(value: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(value)
}

function date(value: string) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(`${value}T12:00:00`))
}

export default function SuperInvestorFilingsPage() {
  const params = useParams()
  const slug = params?.id as string
  const [investor, setInvestor] = useState<InvestorDetail | null>(null)
  useEffect(() => { if (slug) getSuperInvestorById(slug).then(setInvestor) }, [slug])

  if (!investor) return <div className="h-72 animate-pulse rounded-2xl bg-muted/60" />

  return <main className="space-y-5">
    <div><p className="mb-0 text-xs font-bold uppercase tracking-wider text-primary">Preuves officielles</p><h2 className="mt-1 p-0 text-2xl font-black">Déclarations 13F</h2><p className="mb-0 mt-1 text-sm text-muted-foreground">Chaque valeur publiée reste traçable jusqu’au document SEC correspondant.</p></div>
    <div className="space-y-3">{investor.filings.map((filing) => <article key={filing.snapshotId} className="rounded-2xl border border-border bg-card p-4 sm:p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="p-0 text-base font-black">{filing.quarterLabel}</h3><Badge variant={filing.validationStatus === 'AMENDED' ? 'secondary' : 'outline'}>{filing.validationStatus === 'AMENDED' ? 'Amendé' : 'Validé'}</Badge></div><div className="mt-3 grid gap-x-8 gap-y-2 text-xs sm:grid-cols-3"><Metric label="Date du reporting" value={date(filing.reportDate)} /><Metric label="Date de publication" value={date(filing.filingDate)} /><Metric label="Valeur officielle" value={money(filing.totalValueUsd)} /></div></div><div className="flex flex-wrap gap-2">{filing.sources.map((source) => <a key={source.accessionNumber} href={source.secUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold transition-colors hover:bg-muted"><FileCheck2 className="h-4 w-4 text-primary" /><span>{source.formType}</span><span className="hidden font-mono text-[10px] text-muted-foreground lg:inline">{source.accessionNumber}</span><ExternalLink className="h-3.5 w-3.5 text-muted-foreground" /></a>)}</div></div></article>)}</div>
  </main>
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="mb-0 text-muted-foreground">{label}</p><p className="mb-0 mt-0.5 font-semibold text-foreground">{value}</p></div>
}
