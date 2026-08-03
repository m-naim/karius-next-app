import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { genPageMetadata } from 'app/seo'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { Button } from '@/components/ui/button'
import { TelegramDemoMockup } from '@/components/molecules/landing/TelegramDemoMockup'
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  Bell,
  TrendingUp,
  Coins,
  ExternalLink,
  ShieldCheck,
  Zap,
  HelpCircle,
  Smartphone,
  QrCode,
} from 'lucide-react'

export const metadata = genPageMetadata({
  title: 'Notifications Telegram Bourse & Alertes Prix en Temps Réel | Boursehorus',
  description:
    'Recevez vos alertes de cours de bourse, notifications de dividendes et résumés hebdomadaires de portefeuille directement sur Telegram en moins d\'une seconde.',
})

export default function TelegramLandingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Boursehorus Telegram Alerts — Notifications Bourse Temps Réel',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Telegram, Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    description:
      'Service d\'alertes boursières et de notifications de portefeuille en temps réel délivrées directement via Telegram Bot.',
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Comment activer les notifications Telegram Boursehorus ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ouvrez notre bot Telegram via le lien direct ou le QR Code, envoyez /start pour recevoir votre code d\'activation, puis collez ce code dans votre espace Boursehorus.',
        },
      },
      {
        '@type': 'Question',
        name: 'Quels types d\'alertes peut-on recevoir sur Telegram ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Vous pouvez recevoir des alertes de franchissement de cours (prix cible), des notifications lors du versement de dividendes, et un résumé hebdomadaire de la performance de vos portefeuilles.',
        },
      },
      {
        '@type': 'Question',
        name: 'Le service d\'alertes Telegram est-il gratuit ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Oui, la configuration des alertes et l\'utilisation du bot Telegram Boursehorus sont 100% gratuites.',
        },
      },
      {
        '@type': 'Question',
        name: 'Quelle est la rapidité de réception des alertes ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Les notifications Telegram sont délivrées en moins d\'une seconde dès que le seuil de prix ou l\'événement est détecté par nos serveurs.',
        },
      },
    ],
  }

  const botUrl = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || 'https://t.me/boursehorus_bot'

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
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] bg-[#24A1DE]/15 blur-[140px] rounded-full pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#24A1DE]/30 bg-[#24A1DE]/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#24A1DE] mb-6 animate-in fade-in duration-700">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Bot Telegram Boursehorus 2.0</span>
          </div>

          {/* H1 Title */}
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-[1.15]">
            Recevez vos <span className="text-[#24A1DE]">Alertes Bourse sur Telegram</span> en instantané.
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl font-medium">
            Ne manquez plus aucun mouvement de marché. Franchissement de prix, versement de dividendes et résumés de portefeuilles envoyés directement sur votre téléphone en <strong>moins d&apos;une seconde</strong>.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" /> Envoi instantané (&lt; 1 seconde)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" /> Zero spams &amp; 100% Sécurisé
            </span>
            <span className="flex items-center gap-1.5 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" /> 100% Gratuit
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={botUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="h-14 px-8 text-base font-bold bg-[#24A1DE] hover:bg-[#2092ca] text-white shadow-xl shadow-[#24A1DE]/25 transition-all hover:scale-105 gap-2">
                <ExternalLink className="h-5 w-5" />
                <span>Activer le Bot Telegram</span>
              </Button>
            </a>
            <Button asChild variant="outline" size="lg" className="h-14 px-6 text-base font-semibold border-border/80 hover:bg-accent/50">
              <Link href="/signup">
                <span>Créer mon compte Boursehorus</span>
              </Link>
            </Button>
          </div>

          {/* INTERACTIVE TELEGRAM MOCKUP */}
          <div className="mt-12">
            <TelegramDemoMockup />
          </div>
        </SectionContainer>

        {/* 3-STEP SETUP GUIDE WITH QR CODE */}
        <section className="py-20 bg-muted/20 border-y border-border/50">
          <SectionContainer>
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-4xl">
                Activation rapide en <span className="text-[#24A1DE]">3 étapes simples</span>
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Aucune configuration complexe nécessaire.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Step 1 */}
              <div className="flex flex-col p-6 rounded-2xl bg-card border border-border/60 shadow-sm space-y-4 text-center items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-[#24A1DE]/10 text-[#24A1DE] font-black text-lg">
                  01
                </div>
                <h3 className="text-lg font-bold text-foreground">Ouvrez le Bot Telegram</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Cliquez sur le bouton ci-dessous ou scannez le QR code avec votre appareil photo mobile.
                </p>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(botUrl)}`}
                  alt="QR Code Telegram Bot"
                  className="h-28 w-28 rounded-xl border p-1 bg-white shadow-sm object-contain"
                />
                <a href={botUrl} target="_blank" rel="noopener noreferrer" className="w-full pt-2">
                  <Button size="sm" variant="outline" className="w-full font-bold text-xs gap-1.5">
                    <ExternalLink className="h-3.5 w-3.5 text-[#24A1DE]" />
                    Ouvrir Telegram
                  </Button>
                </a>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col p-6 rounded-2xl bg-card border border-border/60 shadow-sm space-y-4 text-center items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 font-black text-lg">
                  02
                </div>
                <h3 className="text-lg font-bold text-foreground">Envoyez /start</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dans Telegram, cliquez sur <strong>Démarrer</strong> (ou tapez <code>/start</code>).
                </p>
                <div className="p-4 rounded-xl bg-[#182533] text-white w-full text-left space-y-2 font-mono text-xs border border-white/10">
                  <div className="text-white/60">&gt; /start</div>
                  <div className="text-emerald-400 font-bold">✅ Code d&apos;activation : 849201</div>
                </div>
                <p className="text-[10px] text-muted-foreground italic">Le bot vous renvoie immédiatement votre code unique.</p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col p-6 rounded-2xl bg-card border border-border/60 shadow-sm space-y-4 text-center items-center justify-between">
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-500 font-black text-lg">
                    03
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Liez votre compte</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Collez votre code dans l&apos;application Boursehorus sur la page Alertes. Votre compte est instantanément connecté.
                  </p>
                </div>
                <Button asChild size="sm" className="w-full font-bold text-xs">
                  <Link href="/app/alerts">
                    Aller sur la page Alertes
                  </Link>
                </Button>
              </div>
            </div>
          </SectionContainer>
        </section>

        {/* COMPARISON TABLE */}
        <section className="py-20">
          <SectionContainer>
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-4xl">
                Pourquoi préférer <span className="text-[#24A1DE]">Telegram</span> aux emails ?
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Comparatif des canaux d&apos;alertes boursières.
              </p>
            </div>

            <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-muted/40 text-muted-foreground font-black uppercase text-[11px] border-b border-border/60">
                  <tr>
                    <th className="p-4">Critères</th>
                    <th className="p-4 text-center text-[#24A1DE] bg-[#24A1DE]/5 font-bold">Bot Telegram</th>
                    <th className="p-4 text-center">Notification Email</th>
                    <th className="p-4 text-center">SMS Bourse</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  <tr>
                    <td className="p-4 font-bold text-foreground">Vitesse de livraison</td>
                    <td className="p-4 text-center text-emerald-500 bg-[#24A1DE]/5 font-bold">⚡ &lt; 1 seconde</td>
                    <td className="p-4 text-center text-muted-foreground">⚠️ 1 à 15 minutes (Spam)</td>
                    <td className="p-4 text-center text-emerald-500">⚡ Instantané</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-foreground">Coût d&apos;utilisation</td>
                    <td className="p-4 text-center text-emerald-500 bg-[#24A1DE]/5 font-bold">✅ 100% Gratuit</td>
                    <td className="p-4 text-center text-emerald-500">✅ Gratuit</td>
                    <td className="p-4 text-center text-rose-500 font-bold">❌ Payant (Abonnement)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-foreground">Mise en page riche (Formatage &amp; Emojis)</td>
                    <td className="p-4 text-center text-emerald-500 bg-[#24A1DE]/5 font-bold">✅ Oui (Riche)</td>
                    <td className="p-4 text-center text-emerald-500">✅ Oui</td>
                    <td className="p-4 text-center text-muted-foreground">❌ Texte brut limité</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-foreground">Multi-appareils (PC, Mac, iOS, Android)</td>
                    <td className="p-4 text-center text-emerald-500 bg-[#24A1DE]/5 font-bold">✅ Synchronisé</td>
                    <td className="p-4 text-center text-emerald-500">✅ Oui</td>
                    <td className="p-4 text-center text-muted-foreground">⚠️ Téléphone uniquement</td>
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
                Foire Aux Questions <span className="text-[#24A1DE]">(FAQ)</span>
              </h2>
              <p className="text-muted-foreground text-sm">
                Des réponses à vos questions sur les notifications Telegram.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-2">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-[#24A1DE] shrink-0" />
                  Le service de notifications Telegram est-il payant ?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                  Non, la réception d&apos;alertes via notre bot Telegram est totalement gratuite pour tous les utilisateurs de Boursehorus.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-2">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-[#24A1DE] shrink-0" />
                  Puis-je désactiver les notifications à tout moment ?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                  Oui, vous pouvez modifier vos préférences de notification ou mettre en pause le bot Telegram depuis la page des réglages d&apos;alertes en un clic.
                </p>
              </div>
            </div>
          </SectionContainer>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-24 text-center relative overflow-hidden">
          <SectionContainer className="relative z-10 max-w-4xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Ne manquez plus aucune opportunité sur les <span className="text-[#24A1DE]">marchés</span>.
            </h2>
            <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto">
              Activez vos alertes Telegram en 30 secondes et soyez notifié dès que vos cours cibles sont atteints.
            </p>
            <div className="mt-8 flex justify-center">
              <a href={botUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="h-14 px-8 text-base font-bold bg-[#24A1DE] hover:bg-[#2092ca] text-white shadow-xl shadow-[#24A1DE]/25 transition-all hover:scale-105 gap-2">
                  <ExternalLink className="h-5 w-5" />
                  <span>Activer mes Alertes Telegram</span>
                </Button>
              </a>
            </div>
          </SectionContainer>
        </section>
      </div>
    </>
  )
}
