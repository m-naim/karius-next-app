import React from 'react'
import Link from 'next/link'
import { genPageMetadata } from 'app/seo'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react'
import { getSuperInvestors, InvestorSummary } from '@/services/superInvestorService'

export const metadata = genPageMetadata({
  title: 'Portefeuilles des Super Investisseurs 13F (Buffett, Rochon, Akre, Hohn) | Boursehorus',
  description:
    'Suivez gratuitement les portefeuilles officiels 13F SEC des plus grands investisseurs mondiaux : François Rochon, Chuck Akre, Chris Hohn, Terry Smith et Warren Buffett.',
})

export default async function SuperInvestorsLandingPage() {
  const superInvestors: InvestorSummary[] = await getSuperInvestors().catch(() => [])
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
      'Consultation des positions déclarées dans les formulaires 13F des investisseurs Quality & Value.',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative overflow-hidden bg-background">
        {/* HERO SECTION */}
        <SectionContainer className="relative pt-24 pb-16 overflow-hidden text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Données vérifiées sur SEC EDGAR</span>
          </div>

          {/* H1 Title */}
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-[1.15]">
            Consultez les déclarations 13F des investisseurs de référence.
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl font-medium">
            Explorez les positions officiellement déclarées à la SEC, leurs variations trimestrielles et les documents sources de chaque gérant suivi.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" /> Accessions et liens SEC
            </span>
            <span className="flex items-center gap-1.5 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" /> Analyse des mouvements trimestriels
            </span>
            <span className="flex items-center gap-1.5 text-emerald-500">
              <FileCheck2 className="h-4 w-4" /> Jusqu&apos;à 20 trimestres
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-12 px-7 text-base font-bold">
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
                key={inv.slug}
                className="space-y-3 rounded-xl border border-border bg-card p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">{inv.fundDisplayName}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">CIK: {inv.cik}</span>
                </div>
                <h3 className="text-lg font-extrabold text-foreground">{inv.displayName}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{inv.description}</p>
                <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                  <span>{inv.availableQuarters}/{inv.targetQuarters} trimestres</span>
                  <Link href={`/app/super-investors/${inv.slug}`} className="font-semibold text-primary hover:underline">
                    Voir les déclarations
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </SectionContainer>
      </div>
    </>
  )
}
