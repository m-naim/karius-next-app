import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { genPageMetadata } from 'app/seo'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { Button } from '@/components/ui/button'
import { PortfolioDemoMockup } from '@/components/molecules/landing/PortfolioDemoMockup'
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Wallet,
  TrendingUp,
  Split,
  ShieldCheck,
  FileSpreadsheet,
  HelpCircle,
  BarChart2,
  Lock,
  Layers,
} from 'lucide-react'

export const metadata = genPageMetadata({
  title: 'Gestion de Portefeuille Boursier & Suivi en Temps Réel | Boursehorus',
  description:
    'Pilotez l\'ensemble de vos portefeuilles boursiers (PEA, CTO, Crypto). Suivez vos dividendes, analysez vos performances ajustées du risque et gérez vos positions en split-screen.',
})

export default function PortfolioLandingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Boursehorus — Gestion de Portefeuille Boursier',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    description:
      'Solution de suivi et gestion de portefeuille boursier avec calcul de risque, suivi des dividendes et split-screen d’analyse.',
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Qu\'est-ce que le suivi de portefeuille boursier Boursehorus ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'C\'est un outil centralisé permettant de suivre la valorisation, les plus-values, les dividendes et le risque de l\'ensemble de vos comptes boursiers (PEA, CTO, Crypto) en temps réel.',
        },
      },
      {
        '@type': 'Question',
        name: 'Peut-on importer son portefeuille depuis un fichier Excel ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Oui ! Boursehorus prend en charge l\'importation en 1-clic de vos fichiers Excel ou CSV pour créer automatiquement vos positions et votre historique d\'achats.',
        },
      },
      {
        '@type': 'Question',
        name: 'Est-il possible de masquer ses montants en euros pour partager son portefeuille ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolument. La fonctionnalité de confidentialité vous permet de publier votre portefeuille ou de le partager avec la communauté en ne montrant que les pourcentages de répartition et les variations.',
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="relative overflow-hidden bg-background">
        {/* Ambient Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* HERO SECTION */}
        <SectionContainer className="relative pt-24 pb-16 overflow-hidden text-center">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] bg-primary/20 blur-[130px] rounded-full pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary mb-6 animate-in fade-in duration-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Gestion &amp; Suivi de Portefeuille Boursier 2.0</span>
          </div>

          {/* H1 Title */}
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-[1.15]">
            Centralisez et analysez vos <span className="text-primary">Portefeuilles Boursiers</span> en temps réel.
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl font-medium">
            Regroupez vos comptes PEA, CTO et Cryptos. Suivez l&apos;évolution de vos plus-values, anticipez vos dividendes et analysez vos positions en <strong>split-screen</strong> sans jamais quitter votre tableau de bord.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" /> Import Excel / CSV en 1 Clic
            </span>
            <span className="flex items-center gap-1.5 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" /> Mode Public / Privé Sécurisé
            </span>
            <span className="flex items-center gap-1.5 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" /> 100% Gratuit
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-14 px-8 text-base font-bold shadow-xl shadow-primary/25 transition-all hover:scale-105">
              <Link href="/signup" className="flex items-center gap-2">
                <span>Créer mon Portefeuille</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* PLAYWRIGHT INTERACTIVE DEMO SHOWCASE */}
          <div className="mt-12">
            <PortfolioDemoMockup />
          </div>
        </SectionContainer>

        {/* KEY FEATURES GRID */}
        <section className="py-20 bg-muted/20 border-y border-border/50">
          <SectionContainer>
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-4xl">
                Toutes les fonctionnalités pour <span className="text-primary">dominer vos placements</span>
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Fini la dispersion de vos comptes chez plusieurs courtiers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="flex flex-col p-6 rounded-2xl bg-card border border-border/60 shadow-sm space-y-4 transition-all hover:border-primary/50 hover:shadow-md">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Split className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Drawer Split-Screen d&apos;Actif</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Cliquez sur n&apos;importe quelle position : le panneau latéral s&apos;ouvre pour vous montrer l&apos;historique de vos achats, la plus-value exacte de chaque lot et le graphique d&apos;analyse.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col p-6 rounded-2xl bg-card border border-border/60 shadow-sm space-y-4 transition-all hover:border-primary/50 hover:shadow-md">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Calculateur du Risque &amp; Alpha</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Calculez automatiquement votre Sharpe Ratio, la volatilité annuelle et votre surperformance face aux grands indices (S&amp;P 500, CAC 40).
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col p-6 rounded-2xl bg-card border border-border/60 shadow-sm space-y-4 transition-all hover:border-primary/50 hover:shadow-md">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Partage &amp; Mode Confidentialité</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Masquez vos montants en euros en un clic pour partager votre portefeuille publiquement ou comparer vos stratégies en toute sécurité.
                </p>
              </div>
            </div>
          </SectionContainer>
        </section>

        {/* FAQ SECTION */}
        <section className="py-20 bg-muted/20 border-t border-border/50">
          <SectionContainer className="max-w-3xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-4xl">
                Foire Aux Questions <span className="text-primary">(FAQ)</span>
              </h2>
              <p className="text-muted-foreground text-sm">
                Des réponses à vos questions sur le suivi de portefeuille.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-2">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                  Comment importer son portefeuille depuis Excel ?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                  Il vous suffit de vous rendre sur la page d&apos;importation et de déposer votre fichier CSV ou Excel. Boursehorus détectera automatiquement vos symboles, prix d&apos;achat et quantités.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-2">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                  Quels types de comptes puis-je suivre ?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                  Vous pouvez créer des portefeuilles dédiés à vos PEA, CTO (Comptes Titres), comptes Crypto ou comptes d&apos;épargne.
                </p>
              </div>
            </div>
          </SectionContainer>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-24 text-center relative overflow-hidden">
          <SectionContainer className="relative z-10 max-w-4xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Prêt à piloter votre <span className="text-primary">portefeuille</span> ?
            </h2>
            <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto">
              Rejoignez des milliers d&apos;investisseurs et gardez le contrôle total sur votre patrimoine.
            </p>
            <div className="mt-8 flex justify-center">
              <Button asChild size="lg" className="h-14 px-8 text-base font-bold shadow-xl shadow-primary/25 transition-all hover:scale-105">
                <Link href="/signup" className="flex items-center gap-2">
                  <span>Créer mon Portefeuille Gratuit</span>
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
