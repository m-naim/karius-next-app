import { genPageMetadata } from 'app/seo'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import CalculateurImmobilier from '@/components/organismes/tools/CalculateurImmobilier'
import { NewsletterForm } from '@/components/molecules/ui/NewsletterForm'
import { Home, Calculator, TrendingUp, Info } from 'lucide-react'

export const metadata = genPageMetadata({
  title: 'Simulateur Immobilier : Achat vs Location | BourseHorus',
  description:
    'Utilisez notre outil gratuit pour calculer vos mensualités de crédit immobilier et comparer si l’achat est plus avantageux que la location selon votre situation.',
  canonicalUrl: 'fr/outils/calculateur-immobilier',
})

export default function Page() {
  return (
    <div className="pb-12">
      <SectionContainer className="pb-12 pt-8">
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-3">
            <Home className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Simulateur Immobilier : <span className="text-primary">Achat vs Location</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Calculez votre mensualité, vos frais de notaire et déterminez après combien d'années
            l'achat devient plus rentable que la location.
          </p>
        </div>

        <CalculateurImmobilier />

        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <Calculator className="h-6 w-6 text-primary" />
              Pourquoi utiliser un simulateur immobilier ?
            </h2>
            <p className="text-muted-foreground">
              L'achat d'une résidence principale est souvent considéré comme le "meilleur
              investissement". Pourtant, selon les prix du marché, les taux d'intérêt et votre durée
              de détention, la location peut s'avérer plus avantageuse financièrement.
            </p>
            <p className="text-muted-foreground">
              Notre outil prend en compte les <strong>frais perdus</strong> des deux côtés :
            </p>
            <ul className="ml-4 list-inside list-disc space-y-1 text-muted-foreground">
              <li>
                <strong>Côté Achat :</strong> Frais de notaire, intérêts bancaires, taxe foncière,
                charges de copropriété et entretien.
              </li>
              <li>
                <strong>Côté Location :</strong> Cumul des loyers payés sur la période.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <TrendingUp className="h-6 w-6 text-primary" />
              Optimisation
            </h2>
            <p className="text-muted-foreground">
              Optimisez votre gestion de patrimoine en comprenant l'impact de l'apport personnel et
              des taux. Un apport plus élevé réduit vos intérêts mais représente un coût
              d'opportunité si cet argent n'est pas investi en bourse.
            </p>
            <p className="text-muted-foreground">
              Ce simulateur est un outil d'aide à la décision. Nous vous conseillons de toujours
              consulter un conseiller financier ou votre banquier avant de vous engager dans un
              crédit immobilier.
            </p>
          </div>
        </div>

        <div className="mt-16 rounded-2xl border border-muted bg-muted/50 p-8">
          <div className="flex flex-col items-center gap-8 md:flex-row">
            <div className="flex-1">
              <h3 className="mb-2 flex items-center gap-2 text-xl font-bold">
                <Info className="h-5 w-5 text-primary" />
                Le saviez-vous ?
              </h3>
              <p className="italic text-muted-foreground">
                "En France, les frais de notaire s'élèvent généralement à 7-8% du prix de vente pour
                un logement ancien, contre seulement 2-3% pour un logement neuf. C'est un facteur
                déterminant dans le calcul de rentabilité de votre achat."
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
