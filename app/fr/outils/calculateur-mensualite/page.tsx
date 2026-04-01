import { genPageMetadata } from 'app/seo'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import CalculateurMensualite from '@/components/organismes/tools/CalculateurMensualite'
import { NewsletterForm } from '@/components/molecules/ui/NewsletterForm'
import { Calculator, ArrowRight, Info, Landmark, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = genPageMetadata({
  title: 'Calculateur de Mensualité et Amortissement | BourseHorus',
  description:
    'Simulez vos mensualités de crédit immobilier et visualisez la répartition entre le remboursement du capital et les intérêts au fil des ans.',
  canonicalUrl: 'fr/outils/calculateur-mensualite',
})

export default function Page() {
  return (
    <div className="pb-12">
      <SectionContainer className="pb-12 pt-8">
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-3">
            <Landmark className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Calculateur de <span className="text-primary">Mensualité & Amortissement</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Visualisez précisément comment votre mensualité se décompose entre le remboursement du
            capital et les intérêts bancaires chaque année.
          </p>
        </div>

        <div className="mb-8 flex justify-center">
          <Button variant="outline" asChild size="sm">
            <Link href="/fr/outils/calculateur-immobilier" className="flex items-center gap-2">
              <Home className="h-4 w-4" /> Retour au simulateur Achat vs Location
            </Link>
          </Button>
        </div>

        <CalculateurMensualite />

        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <Calculator className="h-6 w-6 text-primary" />
              Comment est calculée votre mensualité ?
            </h2>
            <p className="text-muted-foreground">
              La plupart des prêts immobiliers sont à "échéances constantes". Cela signifie que vous
              payez le même montant chaque mois, mais la répartition interne change.
            </p>
            <p className="text-muted-foreground">
              Notre outil utilise la formule standard d'amortissement pour calculer le montant
              précis qui part en intérêts (frais perdus) et celui qui part en capital (votre
              patrimoine).
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <ArrowRight className="h-6 w-6 text-primary" />
              L'impact du taux et de la durée
            </h2>
            <p className="text-muted-foreground">
              Plus la durée est longue, plus le coût total du crédit est élevé car vous amortissez
              le capital plus lentement. De même, une petite variation du taux d'intérêt peut
              représenter des dizaines de milliers d'euros sur 20 ou 25 ans.
            </p>
            <p className="text-muted-foreground">
              Utilisez ce simulateur pour trouver le curseur idéal entre une mensualité supportable
              et un coût de crédit optimisé.
            </p>
          </div>
        </div>

        <div className="mt-16 rounded-2xl border border-muted bg-muted/50 p-8">
          <div className="flex flex-col items-center gap-8 md:flex-row">
            <div className="flex-1">
              <h3 className="mb-2 flex items-center gap-2 text-xl font-bold">
                <Info className="h-5 w-5 text-primary" />
                Conseil d'expert
              </h3>
              <p className="italic text-muted-foreground">
                "Négocier son taux est important, mais n'oubliez pas l'assurance emprunteur. Elle
                peut représenter jusqu'à 30% du coût total de votre crédit. Notre simulateur vous
                permet d'ajuster ce taux pour en voir l'impact réel."
              </p>
            </div>
            <div className="flex-shrink-0">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </SectionContainer>
    </div>
  )
}
