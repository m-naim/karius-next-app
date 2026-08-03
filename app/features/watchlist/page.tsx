import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { genPageMetadata } from 'app/seo'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { Button } from '@/components/ui/button'
import { WatchlistDemoMockup } from '@/components/molecules/landing/WatchlistDemoMockup'
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  Split,
  Tag,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  Zap,
  HelpCircle,
  BarChart2,
  Search,
} from 'lucide-react'

export const metadata = genPageMetadata({
  title: 'Watchlist Bourse Gratuite & Liste de Suivi d\'Actions | Boursehorus',
  description:
    'Créez vos watchlists bourse personnalisées. Suivez vos actions en temps réel, filtrez par ratios fondamentaux (PE, ROIC, Croissance) et analysez en split-screen.',
})

export default function WatchlistLandingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Boursehorus Watchlists — Outil de suivi bourse',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    description:
      'Solution complète pour créer et gérer des watchlists d’actions boursières gratuites avec analyse fondamentale et technique intégrée.',
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Qu\'est-ce qu\'une Watchlist Bourse ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Une watchlist bourse (ou liste de suivi) est un panier virtuel personnalisé dans lequel vous rassemblez des actions, ETF ou indices afin de suivre leurs cours, leurs variations et leurs données financières en temps réel sans devoir les acheter immédiatement.',
        },
      },
      {
        '@type': 'Question',
        name: 'Pourquoi utiliser Boursehorus pour créer ses watchlists ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Boursehorus propose un affichage split-screen innovant qui permet d\'analyser le graphique technique et les fondamentaux d\'une action tout en gardant sa watchlist sous les yeux. De plus, vous bénéficiez de screeners pré-intégrés (GARP, ROIC, Rendement) et d\'un système de tags personnalisés.',
        },
      },
      {
        '@type': 'Question',
        name: 'Est-ce que la création de watchlists est gratuite ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Oui, la fonctionnalité de création et de suivi de watchlists bourse sur Boursehorus est 100% gratuite et ne nécessite aucune carte bancaire.',
        },
      },
      {
        '@type': 'Question',
        name: 'Peut-on exporter ses watchlists en CSV ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolument. Vous pouvez exporter l\'intégralité de vos listes de valeurs en CSV en un seul clic pour vos analyses complémentaires sur Excel ou Google Sheets.',
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
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/20 blur-[130px] rounded-full pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary mb-6 animate-in fade-in duration-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Nouveau — Watchlists Bourse Split-Screen 2.0</span>
          </div>

          {/* Main H1 Title */}
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-[1.15]">
            Créez des <span className="text-primary">Watchlists Bourse</span> intelligentes et sur-mesure.
          </h1>

          {/* SEO Paragraph */}
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl font-medium">
            Centralisez le suivi de vos actions préférées (CAC 40, Wall Street, Europe). Analysez en <strong>split-screen</strong> sans perdre le contexte de votre liste et filtrez selon vos critères fondamentaux.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-14 px-8 text-base font-bold shadow-xl shadow-primary/25 transition-all hover:scale-105">
              <Link href="/signup" className="flex items-center gap-2">
                <span>Créer ma première Watchlist</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-6 text-base font-semibold border-border/80 hover:bg-accent/50">
              <Link href="/app/watchlist">
                <span>Voir les Watchlists de la communauté</span>
              </Link>
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground font-semibold">
            ⚡ 100% Gratuit • Sans carte bancaire • Prêt en 30 secondes
          </p>

          {/* PLAYWRIGHT INTERACTIVE DEMO SHOWCASE */}
          <div className="mt-12">
            <WatchlistDemoMockup />
          </div>
        </SectionContainer>

        {/* KEY FEATURES GRID */}
        <section className="py-20 bg-muted/20 border-y border-border/50">
          <SectionContainer>
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-4xl">
                Tout ce dont vous avez besoin pour <span className="text-primary">surveiller les marchés</span>
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Oubliez les fichiers Excel obsolètes et les listes brouillonnes de vos courtiers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="flex flex-col p-6 rounded-2xl bg-card border border-border/60 shadow-sm space-y-4 transition-all hover:border-primary/50 hover:shadow-md">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Split className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Affichage Split-Screen</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Cliquez sur n&apos;importe quelle valeur dans votre watchlist : le panneau d&apos;analyse s&apos;ouvre à côté du tableau sans recharger la page. Vous gardez 100% du contexte de votre liste sous les yeux.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col p-6 rounded-2xl bg-card border border-border/60 shadow-sm space-y-4 transition-all hover:border-primary/50 hover:shadow-md">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                  <SlidersHorizontal className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Screeners &amp; Ratios Intégrés</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Filtrez instantanément votre liste par rendement (PE), rentabilité du capital (ROIC), croissance du chiffre d&apos;affaires ou stratégie GARP en un clic.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col p-6 rounded-2xl bg-card border border-border/60 shadow-sm space-y-4 transition-all hover:border-primary/50 hover:shadow-md">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                  <Tag className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Tags &amp; Thèses Personnalisées</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Organisez vos actions avec des étiquettes personnalisées (#Luxe, #Dividende, #IA, #Pépites). Retrouvez et classez vos opportunités par stratégie d&apos;investissement.
                </p>
              </div>
            </div>
          </SectionContainer>
        </section>

        {/* COMPARISON MATRIX SECTION */}
        <section className="py-20">
          <SectionContainer>
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-4xl">
                Pourquoi remplacer votre <span className="text-primary">Tableur Excel</span> ?
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Comparatif entre Boursehorus, les tableurs manuels et les interfaces de courtiers classiques.
              </p>
            </div>

            <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-muted/40 text-muted-foreground font-black uppercase text-[11px] border-b border-border/60">
                  <tr>
                    <th className="p-4">Fonctionnalité</th>
                    <th className="p-4 text-center text-primary bg-primary/5">Boursehorus</th>
                    <th className="p-4 text-center">Tableur Excel</th>
                    <th className="p-4 text-center">Courtier Classique</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  <tr>
                    <td className="p-4 font-bold text-foreground">Cotations &amp; Variations en temps réel</td>
                    <td className="p-4 text-center text-emerald-500 bg-primary/5 font-bold">✅ Oui</td>
                    <td className="p-4 text-center text-muted-foreground">❌ Complexe (API)</td>
                    <td className="p-4 text-center text-emerald-500">✅ Oui</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-foreground">Analyse Split-Screen (Garder la liste ouverte)</td>
                    <td className="p-4 text-center text-emerald-500 bg-primary/5 font-bold">✅ Oui</td>
                    <td className="p-4 text-center text-muted-foreground">❌ Non</td>
                    <td className="p-4 text-center text-muted-foreground">❌ Non (Allers-retours)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-foreground">Filtres Fondamentaux (ROIC, PE 5a, CA)</td>
                    <td className="p-4 text-center text-emerald-500 bg-primary/5 font-bold">✅ Automatique</td>
                    <td className="p-4 text-center text-muted-foreground">❌ Saisie manuelle</td>
                    <td className="p-4 text-center text-muted-foreground">❌ Très limité</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-foreground">Tags &amp; Thèses d&apos;investissement</td>
                    <td className="p-4 text-center text-emerald-500 bg-primary/5 font-bold">✅ Illimités</td>
                    <td className="p-4 text-center text-muted-foreground">⚠️ Manuel</td>
                    <td className="p-4 text-center text-muted-foreground">❌ Non</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-foreground">Export CSV &amp; Partage de liste</td>
                    <td className="p-4 text-center text-emerald-500 bg-primary/5 font-bold">✅ 1-Clic</td>
                    <td className="p-4 text-center text-emerald-500">✅ Fichier local</td>
                    <td className="p-4 text-center text-muted-foreground">❌ Non</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionContainer>
        </section>

        {/* FAQ SECTION WITH ACCORDION */}
        <section className="py-20 bg-muted/20 border-t border-border/50">
          <SectionContainer className="max-w-3xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-4xl">
                Foire Aux Questions <span className="text-primary">(FAQ)</span>
              </h2>
              <p className="text-muted-foreground text-sm">
                Des réponses claires pour vous lancer immédiatement.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-2">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                  Qu&apos;est-ce qu&apos;une Watchlist Bourse ?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                  Une watchlist bourse est un panier virtuel dans lequel vous regroupez les actions ou ETF que vous souhaitez surveiller. Elle vous permet de suivre leurs cotations, leurs variations et leurs données financières sans avoir à les acheter immédiatement.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-2">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                  Est-ce que la fonction Watchlist est 100% gratuite ?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                  Oui, la création de watchlists, l&apos;accès au split-screen d&apos;analyse et l&apos;utilisation des filtres fondamentaux sont totalement gratuits sur Boursehorus.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-2">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                  Puis-je exporter ma Watchlist en CSV ?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                  Oui ! Un bouton d&apos;export en haut du tableau vous permet de télécharger immédiatement toutes les valeurs et leurs métriques au format CSV pour Excel ou Google Sheets.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-2">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                  Quels marchés boursiers sont pris en charge ?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                  Boursehorus couvre l&apos;ensemble du marché américain (S&P 500, Nasdaq, NYSE), Euronext Paris (CAC 40, SBF 120), les grands indices européens (DAX, STOXX 600) ainsi que la majorité des ETF majeurs.
                </p>
              </div>
            </div>
          </SectionContainer>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-24 text-center relative overflow-hidden">
          <SectionContainer className="relative z-10 max-w-4xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Prêt à créer votre propre <span className="text-primary">Watchlist Bourse</span> ?
            </h2>
            <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto">
              Rejoignez des milliers d&apos;investisseurs et gardez toujours une longueur d&apos;avance sur les marchés.
            </p>
            <div className="mt-8 flex justify-center">
              <Button asChild size="lg" className="h-14 px-8 text-base font-bold shadow-xl shadow-primary/25 transition-all hover:scale-105">
                <Link href="/signup" className="flex items-center gap-2">
                  <span>Créer ma Watchlist Gratuite</span>
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
