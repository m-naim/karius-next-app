import { genPageMetadata } from 'app/seo'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, ArrowRight, BarChart3, Coins, Users, Rocket } from 'lucide-react'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = genPageMetadata({
  title: 'Boursehorus | L’application de simulation de portefeuilles boursiers ',
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
          <h1 className="mb-6 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Simulez vos portefeuilles boursiers <span className="text-primary">sans aucun risque.</span>
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Entraînez-vous à investir, testez de nouvelles stratégies et analysez vos rendements avec de l'argent virtuel, dans les conditions réelles du marché.
          </p>
          
          <ul className="mb-10 flex flex-col gap-3 text-sm font-medium text-muted-foreground sm:flex-row sm:gap-6">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span>Simulations illimitées</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span>Conditions réelles du marché</span>
            </li>
          </ul>
          
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="group h-14 px-8 text-lg font-bold shadow-xl shadow-primary/25 transition-all hover:scale-105 hover:shadow-primary/40">
              <Link href={'/signup'} className="flex items-center whitespace-nowrap">
                Créer mon portefeuille virtuel
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative z-10 mt-20 w-full max-w-5xl px-4 perspective-[2000px] animate-in fade-in zoom-in-95 duration-1000 delay-300 fill-mode-both">
          <div className="relative rounded-xl bg-card border border-border/50 shadow-2xl shadow-primary/10 transition-transform duration-700 hover:rotate-x-0 hover:rotate-y-0 rotate-x-2 rotate-y-[-2deg]">
            <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-3 rounded-t-xl">
              <div className="h-3 w-3 rounded-full bg-red-500/80 shadow-sm" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80 shadow-sm" />
              <div className="h-3 w-3 rounded-full bg-green-500/80 shadow-sm" />
            </div>
            <div className="relative rounded-b-xl overflow-hidden bg-background">
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none z-10" />
              <Image
                className="w-full h-auto object-cover"
                alt="Aperçu de la simulation de portefeuille"
                src="/static/images/product/portfolio-page.png"
                width={1200}
                height={600}
                priority
              />
            </div>
          </div>
        </div>
      </SectionContainer>

      <SectionContainer className="py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Comment lancer votre simulation ?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Quatre étapes simples pour commencer à investir virtuellement.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto px-4">
          {[
            {
              step: '1',
              title: "S'inscrire",
              desc: 'Créez votre compte gratuit en quelques secondes.',
              icon: <Rocket className="h-6 w-6" />,
            },
            {
              step: '2',
              title: 'Créer le portefeuille',
              desc: 'Générez un espace virtuel dédié à vos tests.',
              icon: <BarChart3 className="h-6 w-6" />,
            },
            {
              step: '3',
              title: 'Ajouter des actifs',
              desc: 'Achetez virtuellement Actions, ETFs et Cryptos.',
              icon: <Coins className="h-6 w-6" />,
            },
            {
              step: '4',
              title: 'Suivre & Comparer',
              desc: 'Analysez vos performances face à la communauté.',
              icon: <Users className="h-6 w-6" />,
            },
          ].map((item) => (
            <Card key={item.step} className="group relative flex flex-col overflow-hidden border-border/40 bg-transparent shadow-none transition-all duration-300 hover:bg-muted/30">
              <CardHeader className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {item.step}
                  </span>
                  <div className="text-muted-foreground/30 transition-colors group-hover:text-primary/50">
                    {item.icon}
                  </div>
                </div>
                <CardTitle className="text-lg font-semibold tracking-tight">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionContainer>

      <div className="flex flex-col items-center justify-center py-20 px-6 text-center border-t border-border/40 bg-muted/10">
        <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Prêt à tester vos stratégies ?</h2>
        <Button asChild size="lg" className="group h-14 px-8 text-lg font-bold shadow-xl shadow-primary/25 transition-all hover:scale-105 hover:shadow-primary/40">
          <Link href={'/signup'} className="flex items-center whitespace-nowrap">
            Lancer une simulation
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
