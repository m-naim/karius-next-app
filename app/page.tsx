import { Features } from '@/components/molecules/home/Features'

import { genPageMetadata } from 'app/seo'
import { AccordionDemo } from '@/components/ui/AccordionDemo'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export const metadata = genPageMetadata({
  title: 'Boursehorus | Logiciel de gestion de portefeuilles boursiers',
})

export default async function Page() {
  return (
    <div>
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <SectionContainer className="relative flex flex-col items-center justify-center pt-32 pb-24 overflow-hidden">
        {/* Glow Background Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex w-full flex-col items-center px-6 text-center lg:col-span-7 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
          <h1 className="mb-6 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            Suivez et comprenez votre portefeuille <span className="text-primary">sans complexité.</span>
          </h1>
          <p className="mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Un outil pensé pour les investisseurs qui souhaitent centraliser leurs actifs, 
            analyser leurs rendements et prendre de meilleures décisions, en toute simplicité.
          </p>
          
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="group h-14 px-8 text-lg font-bold shadow-xl shadow-primary/25 transition-all hover:scale-105 hover:shadow-primary/40">
              <Link data-umami-event="landing-try-button" href={'/signup'} className="flex items-center whitespace-nowrap">
                Commencer gratuitement
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
            Aucune carte bancaire requise. Configuration en 30 secondes.
          </p>
        </div>

        <div className="relative z-10 mt-20 w-full max-w-5xl px-4 perspective-[2000px] animate-in fade-in zoom-in-95 duration-1000 delay-300 fill-mode-both">
          <div className="relative rounded-xl bg-card border border-border/50 shadow-2xl shadow-primary/10 transition-transform duration-700 hover:rotate-x-0 hover:rotate-y-0 rotate-x-2 rotate-y-[-2deg]">
            {/* Browser Mockup Header */}
            <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-3 rounded-t-xl">
              <div className="h-3 w-3 rounded-full bg-red-500/80 shadow-sm" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80 shadow-sm" />
              <div className="h-3 w-3 rounded-full bg-green-500/80 shadow-sm" />
            </div>
            {/* Browser Mockup Content */}
            <div className="relative rounded-b-xl overflow-hidden bg-background">
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none z-10" />
              <Image
                className="w-full h-auto object-cover"
                alt="Aperçu du tableau de bord Karius"
                src="/static/images/product/portfolio-page.png"
                width={1200}
                height={600}
                priority
              />
            </div>
          </div>
        </div>
      </SectionContainer>

      <Features></Features>
      <section>
        <h6 className="pt-8 text-center text-xl font-semibold text-muted-foreground">Une approche transparente</h6>
        <div className="mx-auto max-w-screen-xl px-4 py-8 text-center lg:px-6 lg:py-16">
          <dl className="mx-auto grid max-w-screen-md gap-8 text-foreground sm:grid-cols-3">
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-muted/20 border border-border/50">
              <dt className="mb-2 text-2xl font-bold text-primary md:text-3xl">Clarté</dt>
              <dd className="font-medium text-muted-foreground text-sm">Vos données lisibles au premier coup d'œil</dd>
            </div>
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-muted/20 border border-border/50">
              <dt className="mb-2 text-2xl font-bold text-primary md:text-3xl">Temps Réel</dt>
              <dd className="font-medium text-muted-foreground text-sm">Cotations et valorisations à jour</dd>
            </div>
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-muted/20 border border-border/50">
              <dt className="mb-2 text-2xl font-bold text-primary md:text-3xl">Indépendant</dt>
              <dd className="font-medium text-muted-foreground text-sm">Créé par et pour des investisseurs</dd>
            </div>
          </dl>
        </div>
      </section>
      <SectionContainer>
        <AccordionDemo></AccordionDemo>
      </SectionContainer>
      
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Prêt à optimiser vos investissements ?</h2>
        <Button asChild size="lg" className="group h-14 px-8 text-lg font-bold shadow-xl shadow-primary/25 transition-all hover:scale-105 hover:shadow-primary/40">
          <Link data-umami-event="landing-bottom-try-button" href={'/signup'} className="flex items-center whitespace-nowrap">
            Commencer gratuitement
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
