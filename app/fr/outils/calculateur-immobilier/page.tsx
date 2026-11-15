import { genPageMetadata } from 'app/seo'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import CalculateurImmobilier from '@/components/organismes/tools/CalculateurImmobilier'
import { NewsletterForm } from '@/components/molecules/ui/NewsletterForm'
import { Home, Calculator, TrendingUp, Info } from 'lucide-react'
import { readPropertyQuery, readSimulationName } from '@/lib/calculator-simulations'

export const metadata = genPageMetadata({
  title: 'Simulateur Immobilier : Achat vs Location | BourseHorus',
  description:
    'Utilisez notre outil gratuit pour calculer vos mensualités de crédit immobilier et comparer si l’achat est plus avantageux que la location selon votre situation.',
  canonicalUrl: 'fr/outils/calculateur-immobilier',
})

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const query = await searchParams
  const transfer = readPropertyQuery(query)
  const initialName = transfer.invalid ? undefined : readSimulationName(query)
  return (
    <div className="pb-12">
      <SectionContainer className="pb-12 pt-4 sm:pt-8">
        <div className="mb-4 flex flex-col items-start text-left sm:mb-12 sm:items-center sm:text-center">
          <div className="mb-4 hidden rounded-full bg-primary/10 p-3 sm:block">
            <Home className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-2 py-0 text-2xl font-extrabold tracking-tight sm:mb-4 sm:py-3 sm:text-5xl">
            <span className="sm:hidden">Acheter ou louer ?</span>
            <span className="hidden sm:inline">
              Simulateur Immobilier : <span className="text-primary">Achat vs Location</span>
            </span>
          </h1>
          <p className="mb-0 max-w-2xl text-base text-muted-foreground sm:mb-6 sm:text-lg">
            <span className="sm:hidden">
              Comparez votre budget et votre patrimoine selon votre projet.
            </span>
            <span className="hidden sm:inline">
              Comparez votre budget et votre patrimoine en achetant ou en louant, selon la durée
              pendant laquelle vous comptez garder votre logement.
            </span>
          </p>
        </div>

        <CalculateurImmobilier
          key={JSON.stringify({ ...transfer, initialName })}
          initialValues={transfer.values}
          initialName={initialName}
          invalidTransfer={transfer.invalid}
        />

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
