import React from 'react'
import Link from 'next/link'
import { genPageMetadata } from 'app/seo'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { Button } from '@/components/ui/button'
import { PortfolioDemoMockup } from '@/components/molecules/landing/PortfolioDemoMockup'
import { SimulationCalculator } from '@/components/molecules/landing/SimulationCalculator'
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Split,
  SlidersHorizontal,
  Wallet,
  TrendingUp,
  Bell,
  FileSpreadsheet,
  HelpCircle,
  BarChart2,
  Lock,
  Layers,
  PieChart,
} from 'lucide-react'

export const metadata = genPageMetadata({
  title: 'Boursehorus | Suivi & Analyse de Portefeuille Boursier 2.0',
  description:
    'Pilotez et analysez vos portefeuilles boursiers et watchlists en toute simplicité. Suivez vos actions, vos dividendes et mesurez vos risques (Sharpe, Drawdown) en temps réel.',
})

export default async function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Boursehorus — Gestion & Analyse de Portefeuille Boursier',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    description:
      'Plateforme complète pour suivre ses portefeuilles boursiers, créer des watchlists avec analyse split-screen et calculer ses métriques de risque.',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative overflow-hidden bg-background">
        {/* Ambient Grid Pattern Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* HERO SECTION */}
        <SectionContainer className="relative pt-24 pb-16 overflow-hidden text-center">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/20 blur-[140px] rounded-full pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary mb-6 animate-in fade-in duration-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Gestion de Portefeuille &amp; Watchlists Bourse 2.0</span>
          </div>

          {/* Main H1 Title */}
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-[1.15]">
            Pilotez vos investissements <span className="text-primary">avec la précision des pros.</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl font-medium">
            Centralisez vos portefeuilles et watchlists, analysez vos rendements corrigés du risque (Sharpe, Drawdown) et découvrez les meilleures opportunités en <strong>split-screen</strong>.
          </p>

          {/* Trust bullets */}
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" /> 100% Gratuit &amp; Sans engagement
            </span>
            <span className="flex items-center gap-1.5 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" /> Import Excel / CSV en 1 Clic
            </span>
            <span className="flex items-center gap-1.5 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" /> Cotations &amp; Dividendes temps réel
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-14 px-8 text-base font-bold shadow-xl shadow-primary/25 transition-all hover:scale-105">
              <Link data-umami-event="landing-try-button" href="/signup" className="flex items-center gap-2">
                <span>Commencer gratuitement</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-6 text-base font-semibold border-border/80 hover:bg-accent/50">
              <Link href="/watchlist-bourse">
                <span>Découvrir les Watchlists</span>
              </Link>
            </Button>
          </div>

          {/* INTERACTIVE PORTFOLIO DEMO MOCKUP */}
          <div className="mt-12">
            <PortfolioDemoMockup />
          </div>
        </SectionContainer>

        {/* CORE FEATURES GRID */}
        <section className="py-20 bg-muted/20 border-y border-border/50">
          <SectionContainer>
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-4xl">
                Une suite d&apos;outils conçue pour les <span className="text-primary">investisseurs exigeants</span>
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Tout ce dont vous avez besoin pour prendre de meilleures décisions et optimiser votre capital.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="flex flex-col p-6 rounded-2xl bg-card border border-border/60 shadow-sm space-y-4 transition-all hover:border-primary/50 hover:shadow-md">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Split className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Watchlists &amp; Split-Screen</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Consultez vos listes d&apos;actions et ouvrez la fiche détaillée (graphiques techniques, fondamentaux, PER) à côté de vos valeurs sans jamais perdre votre navigation.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col p-6 rounded-2xl bg-card border border-border/60 shadow-sm space-y-4 transition-all hover:border-primary/50 hover:shadow-md">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Analyse du Risque (Sharpe &amp; Beta)</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Mesurez l&apos;efficacité de votre stratégie avec le Ratio de Sharpe, le Max Drawdown et comparez vos performances en direct face aux indices (S&amp;P 500, CAC 40).
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col p-6 rounded-2xl bg-card border border-border/60 shadow-sm space-y-4 transition-all hover:border-primary/50 hover:shadow-md">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <Wallet className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Suivi des Dividendes &amp; Cash Flow</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Visualisez le calendrier de vos prochains versement de dividendes et suivez l&apos;évolution de vos revenus passifs mois par mois.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="flex flex-col p-6 rounded-2xl bg-card border border-border/60 shadow-sm space-y-4 transition-all hover:border-primary/50 hover:shadow-md">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                  <Bell className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Alertes Telegram &amp; Web</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Recevez vos notifications de franchissement de cours et vos résumés directement sur Telegram ou via votre canal ntfy privé.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="flex flex-col p-6 rounded-2xl bg-card border border-border/60 shadow-sm space-y-4 transition-all hover:border-primary/50 hover:shadow-md">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Import Excel &amp; Export CSV</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Importez vos historiques de transactions depuis un fichier Excel ou CSV en 1-clic et réexportez vos données quand vous le souhaitez.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="flex flex-col p-6 rounded-2xl bg-card border border-border/60 shadow-sm space-y-4 transition-all hover:border-primary/50 hover:shadow-md">
                <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Portefeuilles Publics ou Privés</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Gardez vos portefeuilles 100% confidentiels ou partagez-les avec la communauté en masquant les montants en euros pour protéger votre vie privée.
                </p>
              </div>
            </div>
          </SectionContainer>
        </section>

        {/* EMBEDDED SIMULATION CALCULATOR SECTION */}
        <section className="py-20">
          <SectionContainer>
            <div className="text-center max-w-3xl mx-auto mb-8 space-y-3">
              <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-4xl">
                Testez vos <span className="text-primary">intérêts composés</span>
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Simulez l&apos;impact d&apos;un investissement régulier sur votre patrimoine.
              </p>
            </div>
            <SimulationCalculator />
          </SectionContainer>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-24 text-center relative overflow-hidden bg-muted/20 border-t border-border/50">
          <SectionContainer className="relative z-10 max-w-4xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Prêt à optimiser vos <span className="text-primary">investissements</span> ?
            </h2>
            <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto">
              Rejoignez les investisseurs qui suivent et analysent leurs portefeuilles sur Boursehorus.
            </p>
            <div className="mt-8 flex justify-center">
              <Button asChild size="lg" className="h-14 px-8 text-base font-bold shadow-xl shadow-primary/25 transition-all hover:scale-105">
                <Link data-umami-event="landing-bottom-try-button" href="/signup" className="flex items-center gap-2">
                  <span>Commencer gratuitement</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </SectionContainer>
        </section>
      </div>
    </>
  )
}
