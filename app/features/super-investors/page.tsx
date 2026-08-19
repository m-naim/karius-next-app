import React from 'react'
import Link from 'next/link'
import { genPageMetadata } from 'app/seo'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Building2,
  HelpCircle,
  Search,
  Zap,
} from 'lucide-react'
import { getSuperInvestors, SuperInvestor } from '@/services/superInvestorService'

export const metadata = genPageMetadata({
  title: 'Portefeuilles des Super Investisseurs 13F (Buffett, Rochon, Akre, Hohn) | Boursehorus',
  description:
    'Suivez gratuitement les portefeuilles officiels 13F SEC des plus grands investisseurs mondiaux : François Rochon, Chuck Akre, Chris Hohn, Terry Smith et Warren Buffett.',
})

export default async function SuperInvestorsLandingPage() {
  const superInvestors: SuperInvestor[] = await getSuperInvestors()
  const displayInvestors = superInvestors.slice(0, 3)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Boursehorus — Suivi des Super Investisseurs & 13F SEC',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    description:
      'Suivi en temps réel des portefeuilles et déclarations 13F des super investisseurs Quality & Value.',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative overflow-hidden bg-background">
        {/* Ambient Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* HERO SECTION */}
        <SectionContainer className="relative pt-24 pb-16 overflow-hidden text-center">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] bg-primary/20 blur-[140px] rounded-full pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary mb-6 animate-in fade-in duration-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Suivi des Portefeuilles 13F SEC 2.0</span>
          </div>

          {/* H1 Title */}
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-[1.15]">
            Suivez les <span className="text-primary">Super Investisseurs Quality</span> en direct.
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl font-medium">
            Découvrez les portefeuilles officiels 13F déclarés à la SEC par <strong>François Rochon</strong>, <strong>Chuck Akre</strong>, <strong>Chris Hohn</strong>, <strong>Terry Smith</strong> et <strong>Warren Buffett</strong>.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" /> 100% Données SEC EDGAR Officiel
            </span>
            <span className="flex items-center gap-1.5 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" /> Analyse des mouvements trimestriels
            </span>
            <span className="flex items-center gap-1.5 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" /> 100% Gratuit
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-14 px-8 text-base font-bold shadow-xl shadow-primary/25 transition-all hover:scale-105">
              <Link href="/app/super-investors" className="flex items-center gap-2">
                <span>Voir les Portefeuilles 13F</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* INVESTOR GRID PREVIEW */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
            {displayInvestors.map((inv) => (
              <div
                key={inv.id}
                className="p-6 rounded-2xl border border-border/70 bg-card shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-primary uppercase">{inv.fundName}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">CIK: {inv.cik}</span>
                </div>
                <h3 className="text-lg font-extrabold text-foreground">{inv.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{inv.description}</p>
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {(inv.notableHoldings || []).map((h) => (
                    <span key={h} className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded border">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionContainer>
      </div>
    </>
  )
}
