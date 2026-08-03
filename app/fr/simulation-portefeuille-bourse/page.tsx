import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { genPageMetadata } from 'app/seo'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { Button } from '@/components/ui/button'
import { SimulationCalculator } from '@/components/molecules/landing/SimulationCalculator'
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Rocket,
  BarChart3,
  Coins,
  Users,
  ShieldCheck,
  TrendingUp,
  HelpCircle,
  Zap,
  PieChart,
  Activity,
  Layers,
} from 'lucide-react'

export const metadata = genPageMetadata({
  title: 'Simulation Portefeuille Bourse Gratuite & Simulateur d\'Investissement | Boursehorus',
  description:
    'Simulez et construisez vos portefeuilles boursiers sans aucun risque financier. Testez vos stratégies d\'investissement sur les actions, ETFs et cryptos dans les conditions réelles du marché.',
})

export default async function SimulationPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: 'Simulateur de Portefeuille Boursier Boursehorus',
    description:
      'Outil gratuit de simulation de portefeuille boursier et de calcul des intérêts composés en temps réel pour investisseurs.',
    provider: {
      '@type': 'Organization',
      name: 'Boursehorus',
      url: 'https://www.boursehorus.com',
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Qu\'est-ce qu\'une simulation de portefeuille boursier ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Une simulation de portefeuille boursier (ou paper trading) vous permet d\'investir du capital virtuel sur des actions réelles du marché afin d\'observer la performance, les variations et les risques de votre stratégie sans exposer votre argent réel.',
        },
      },
      {
        '@type': 'Question',
        name: 'La simulation est-elle 100% gratuite ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Oui, la création de portefeuilles virtuels et l\'utilisation du simulateur d\'intérêts composés sur Boursehorus est 100% gratuite et sans engagement.',
        },
      },
      {
        '@type': 'Question',
        name: 'Les données et cotations sont-elles réelles ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Oui. Boursehorus utilise les véritables cours historiques et en direct des marchés (Euronext, Wall Street, ETFs) pour calculer l\'évolution exacte de votre simulation.',
        },
      },
      {
        '@type': 'Question',
        name: 'Puis-je simuler plusieurs portefeuilles différents ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolument. Vous pouvez créer autant de portefeuilles virtuels que vous souhaitez (ex: Portefeuille Dividendes, Portefeuille Tech Growth, Portefeuille ETF DCA).',
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
        {/* Ambient Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* HERO SECTION */}
        <SectionContainer className="relative pt-24 pb-16 overflow-hidden text-center">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] bg-primary/20 blur-[130px] rounded-full pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary mb-6 animate-in fade-in duration-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Simulateur d&apos;Investissement Boursier 2.0</span>
          </div>

          {/* H1 Title */}
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-[1.15]">
            Simulez vos portefeuilles boursiers <span className="text-primary">sans aucun risque.</span>
          </h1>

          {/* SEO Paragraph */}
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl font-medium">
            Entraînez-vous à investir, projetez la puissance des <strong>intérêts composés</strong> et testez vos stratégies d&apos;allocation (Actions, ETFs, Cryptos) dans les conditions réelles du marché.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" /> Capital &amp; Simulations illimités
            </span>
            <span className="flex items-center gap-1.5 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" /> Cotations &amp; Dividendes réels
            </span>
            <span className="flex items-center gap-1.5 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" /> Sans engagement
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-14 px-8 text-base font-bold shadow-xl shadow-primary/25 transition-all hover:scale-105">
              <Link href="/signup" className="flex items-center gap-2">
                <span>Créer mon Portefeuille Virtuel</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* INTERACTIVE COMPOUND INTEREST CALCULATOR */}
          <div className="mt-12">
            <SimulationCalculator />
          </div>
        </SectionContainer>

        {/* 4 STEPS WORKFLOW */}
        <section className="py-20 bg-muted/20 border-y border-border/50">
          <SectionContainer>
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-4xl">
                Comment fonctionne la <span className="text-primary">simulation en 4 étapes</span> ?
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Créez, testez et affinez votre stratégie d&apos;investissement en quelques secondes.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {[
                {
                  step: '01',
                  title: 'Inscription Gratuite',
                  desc: 'Créez votre compte en 30 secondes sans aucune carte bancaire.',
                  icon: <Rocket className="h-6 w-6 text-primary" />,
                },
                {
                  step: '02',
                  title: 'Création du Portefeuille',
                  desc: 'Choisissez votre capital virtuel de départ et votre devise de référence (EUR, USD).',
                  icon: <BarChart3 className="h-6 w-6 text-emerald-500" />,
                },
                {
                  step: '03',
                  title: 'Achats & Allotissements',
                  desc: 'Passez des ordres virtuels sur Actions (Euronext, Wall Street), ETFs ou Cryptos.',
                  icon: <Coins className="h-6 w-6 text-amber-500" />,
                },
                {
                  step: '04',
                  title: 'Analyse & Backtest',
                  desc: 'Suivez le Sharpe Ratio, le Max Drawdown et vos performances face au S&P 500.',
                  icon: <Activity className="h-6 w-6 text-purple-500" />,
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex flex-col p-6 rounded-2xl bg-card border border-border/60 shadow-sm space-y-4 transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-primary/40">{item.step}</span>
                    <div className="p-2 rounded-xl bg-muted/50">{item.icon}</div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </SectionContainer>
        </section>

        {/* COMPARISON MATRIX */}
        <section className="py-20">
          <SectionContainer>
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-4xl">
                Pourquoi choisir <span className="text-primary">Boursehorus</span> pour vos simulations ?
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Une alternative complète aux démos de courtiers et aux feuilles de calcul manuelles.
              </p>
            </div>

            <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-muted/40 text-muted-foreground font-black uppercase text-[11px] border-b border-border/60">
                  <tr>
                    <th className="p-4">Fonctionnalité</th>
                    <th className="p-4 text-center text-primary bg-primary/5">Boursehorus</th>
                    <th className="p-4 text-center">Excel / Sheets</th>
                    <th className="p-4 text-center">Démo Courtier classique</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  <tr>
                    <td className="p-4 font-bold text-foreground">Simulations multiples illimitées</td>
                    <td className="p-4 text-center text-emerald-500 bg-primary/5 font-bold">✅ Illimité</td>
                    <td className="p-4 text-center text-muted-foreground">⚠️ Manuel</td>
                    <td className="p-4 text-center text-muted-foreground">❌ 1 seul compte démo</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-foreground">Calculateur d&apos;intérêts composés dynamique</td>
                    <td className="p-4 text-center text-emerald-500 bg-primary/5 font-bold">✅ Intégré</td>
                    <td className="p-4 text-center text-muted-foreground">⚠️ Formules complexes</td>
                    <td className="p-4 text-center text-muted-foreground">❌ Absent</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-foreground">Ratios de risque (Sharpe, Volatilité, Max DD)</td>
                    <td className="p-4 text-center text-emerald-500 bg-primary/5 font-bold">✅ Automatique</td>
                    <td className="p-4 text-center text-muted-foreground">❌ Impossible</td>
                    <td className="p-4 text-center text-muted-foreground">❌ Très rare</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-foreground">Comparaison avec les grands indices (S&amp;P 500, CAC 40)</td>
                    <td className="p-4 text-center text-emerald-500 bg-primary/5 font-bold">✅ En 1 clic</td>
                    <td className="p-4 text-center text-muted-foreground">❌ Manuel</td>
                    <td className="p-4 text-center text-muted-foreground">❌ Non disponible</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionContainer>
        </section>

        {/* FAQ SECTION */}
        <section className="py-20 bg-muted/20 border-t border-border/50">
          <SectionContainer className="max-w-3xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-4xl">
                Questions Fréquentes <span className="text-primary">(FAQ)</span>
              </h2>
              <p className="text-muted-foreground text-sm">
                Des réponses à toutes vos interrogations sur la simulation de portefeuille.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-2">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                  Qu&apos;est-ce qu&apos;une simulation de portefeuille boursier ?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                  Une simulation (ou paper trading) permet d&apos;investir avec de l&apos;argent virtuel sur des titres du marché réel. C&apos;est le meilleur moyen de tester vos stratégies, d&apos;apprendre la gestion du risque et d&apos;observer la performance sans risquer votre capital.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-2">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                  La simulation est-elle vraiment 100% gratuite ?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                  Oui, l&apos;accès au simulateur, la création de portefeuilles virtuels et le suivi des métriques sont totalement gratuits et illimités.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-2">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                  Puis-je réinitialiser ma simulation si je fais des erreurs ?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                  Oui, vous pouvez créer de nouveaux portefeuilles virtuels, ajuster votre capital ou supprimer des positions à tout moment.
                </p>
              </div>
            </div>
          </SectionContainer>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-24 text-center relative overflow-hidden">
          <SectionContainer className="relative z-10 max-w-4xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Prêt à lancer votre <span className="text-primary">première simulation</span> ?
            </h2>
            <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto">
              Rejoignez des milliers d&apos;investisseurs et maîtrisez votre stratégie avant de passer aux marchés réels.
            </p>
            <div className="mt-8 flex justify-center">
              <Button asChild size="lg" className="h-14 px-8 text-base font-bold shadow-xl shadow-primary/25 transition-all hover:scale-105">
                <Link href="/signup" className="flex items-center gap-2">
                  <span>Créer mon Portefeuille Virtuel</span>
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
