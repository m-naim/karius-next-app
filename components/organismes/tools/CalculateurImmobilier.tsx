'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calculator, Info, Wallet } from 'lucide-react'
import NumberField, { useNumberForm } from './NumberField'
import CalculatorLayout from './CalculatorLayout'
import SimulationActions from './SimulationActions'
import { DeferredPropertyCharts } from './DeferredCalculatorCharts'
import {
  calculateBuyVsRent,
  mortgageHref,
  propertyDefaults,
  propertyErrors,
  propertyRules,
  type PropertyInputs,
} from '@/lib/mortgage-math'

const euros = (value: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)

type Comparison = ReturnType<typeof calculateBuyVsRent>

function Results({ result, inputs }: { result: Comparison; inputs: PropertyInputs }) {
  const { horizon, anneeEquilibreFrais, anneeEquilibrePatrimoine } = result
  const difference = horizon['Patrimoine Achat'] - horizon['Patrimoine Location']
  const roundedDifference = Math.round(difference)
  const href = mortgageHref({
    montantPret: result.montantPret,
    tauxInteret: inputs.tauxInteret,
    dureeAnnees: inputs.dureeAnnees,
    tauxAssurance: inputs.tauxAssurance,
  })
  return (
    <div className="flex min-w-0 flex-col gap-6 lg:col-span-8">
      <section
        className="space-y-5 rounded-xl border border-primary/30 bg-primary/5 p-5 sm:p-6"
        aria-labelledby="comparison-title"
      >
        <div aria-live="polite" aria-atomic="true">
          <h2 id="comparison-title" className="text-lg font-semibold">
            Votre comparaison à {inputs.dureeDetention} {inputs.dureeDetention === 1 ? 'an' : 'ans'}
          </h2>
          <p className="mt-2 text-xl font-semibold text-primary">
            {roundedDifference === 0
              ? 'Les patrimoines projetés sont équivalents.'
              : `${roundedDifference > 0 ? 'Acheter' : 'Louer'} : ${euros(
                  Math.abs(difference)
                )} de patrimoine en plus`}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Selon vos hypothèses, à budget mensuel identique et en plaçant la différence.
          </p>
        </div>
        <dl className="grid grid-cols-1 gap-4 border-t border-primary/20 pt-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">Patrimoine en achetant</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums">
              {euros(horizon['Patrimoine Achat'])}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Patrimoine en louant</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums">
              {euros(horizon['Patrimoine Location'])}
            </dd>
          </div>
        </dl>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-4 w-4" /> Budget de l’achat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Dépense mensuelle initiale</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">
                {euros(result.mensualiteAvecCharges)}
              </dd>
              <p className="mt-1 text-xs text-muted-foreground">
                Crédit, assurance, charges et taxes inclus.
              </p>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Dont crédit et assurance</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">
                {euros(result.mensualiteTotaleCredit)}
              </dd>
              <p className="mt-1 text-xs text-muted-foreground">
                Assurance : {euros(result.mensualiteAssurance)} / mois.
              </p>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Montant emprunté</dt>
              <dd className="mt-1 font-semibold tabular-nums">{euros(result.montantPret)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">
                Coût du crédit sur {inputs.dureeAnnees} {inputs.dureeAnnees === 1 ? 'an' : 'ans'}
              </dt>
              <dd className="mt-1 font-semibold tabular-nums">{euros(result.coutTotalCredit)}</dd>
              <p className="mt-1 text-xs text-muted-foreground">
                Intérêts et assurance, hors capital remboursé.
              </p>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Frais d’acquisition estimés</dt>
              <dd className="mt-1 font-semibold tabular-nums">{euros(result.fraisNotaire)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Prix + acquisition + coût du crédit</dt>
              <dd className="mt-1 font-semibold tabular-nums">{euros(result.coutTotalAchat)}</dd>
              <p className="mt-1 text-xs text-muted-foreground">
                Hors charges, entretien et taxe foncière.
              </p>
            </div>
          </dl>
          <Button
            asChild
            variant="outline"
            className="h-auto min-h-11 whitespace-normal text-left lg:min-h-9"
          >
            <Link href={href}>
              Voir l’amortissement avec ces paramètres{' '}
              <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
            </Link>
          </Button>
          {result.montantPret === 0 && (
            <p className="text-sm text-muted-foreground">
              Votre apport couvre entièrement l’achat et les frais : aucun crédit nécessaire.
            </p>
          )}
        </CardContent>
      </Card>

      <section className="space-y-3 rounded-xl border p-5" aria-labelledby="thresholds-title">
        <h3 id="thresholds-title" className="flex items-center gap-2 font-semibold">
          <Info className="h-4 w-4 shrink-0" /> Deux seuils à distinguer
        </h3>
        <p className="text-sm">
          <strong>Frais cumulés :</strong>{' '}
          {anneeEquilibreFrais === null
            ? 'l’achat n’a pas de frais cumulés inférieurs à la location sur 30 ans.'
            : `première année où l’achat coûte moins en frais non récupérables : ${anneeEquilibreFrais} ${
                anneeEquilibreFrais === 1 ? 'an' : 'ans'
              }.`}
        </p>
        <p className="text-sm">
          <strong>Patrimoine net :</strong>{' '}
          {anneeEquilibrePatrimoine === null
            ? 'le patrimoine en achetant ne dépasse pas celui en louant sur 30 ans.'
            : `première année où le patrimoine en achetant dépasse celui en louant : ${anneeEquilibrePatrimoine} ${
                anneeEquilibrePatrimoine === 1 ? 'an' : 'ans'
              }.`}
        </p>
        <p className="text-xs text-muted-foreground">
          Premiers croisements observés en fin d’année sur une projection de 30 ans. L’avantage peut
          s’inverser ensuite ; le résumé ci-dessus correspond à votre durée de détention.
        </p>
      </section>

      <DeferredPropertyCharts data={result.dataSimulation.slice(0, inputs.dureeDetention)} />
      <details className="rounded-xl border p-5 text-sm">
        <summary className="min-h-11 cursor-pointer content-center font-medium lg:min-h-0">
          Hypothèses et méthode de comparaison
        </summary>
        <div className="mt-4 space-y-3 text-muted-foreground">
          <p>
            Les deux scénarios disposent du même apport et du même budget mensuel. Le locataire
            place l’apport. Chaque mois, le scénario le moins coûteux place la différence, y compris
            après le remboursement du crédit. Les versements ont lieu en fin de mois.
          </p>
          <p>
            Le rendement annuel saisi est converti en rendement mensuel équivalent. Il est supposé
            net des frais et de la fiscalité du placement. L’assurance est calculée sur le capital
            initial et s’arrête à la fin du prêt.
          </p>
          <p>
            Les charges annuelles du propriétaire restent constantes. Le loyer évolue selon le taux
            saisi. Le patrimoine comprend le bien moins la dette et l’épargne accumulée. Les frais
            de revente, de garantie, de dossier et les travaux initiaux ne sont pas inclus.
          </p>
        </div>
      </details>
    </div>
  )
}

export default function CalculateurImmobilier({
  initialValues = propertyDefaults,
  initialName,
  invalidTransfer = false,
}: {
  initialValues?: PropertyInputs
  initialName?: string
  invalidTransfer?: boolean
}) {
  const form = useNumberForm(initialValues, propertyRules)
  const errors = { ...form.errors, ...propertyErrors(form.values) }
  const valid = Object.keys(errors).length === 0
  const result = useMemo(
    () => (valid ? calculateBuyVsRent(form.values) : null),
    [form.draft, valid]
  )
  const field = (key: keyof PropertyInputs, label: string, hint?: string) => (
    <NumberField
      label={label}
      value={form.draft[key]}
      onChange={(value) => form.setField(key, value)}
      error={errors[key]}
      integer={propertyRules[key].integer}
      hint={hint}
    />
  )

  return (
    <div className="space-y-4">
      {invalidTransfer && (
        <p role="status" className="rounded-lg border p-4 text-sm">
          Les paramètres du lien sont incomplets ou invalides. Les valeurs par défaut ont été
          rétablies.
        </p>
      )}
      <CalculatorLayout
        valid={valid}
        resultsLabel="Voir ma comparaison"
        actions={
          <SimulationActions
            kind="property"
            values={form.values}
            valid={valid}
            initialName={initialName}
            onLoad={form.setValues}
          />
        }
        parameters={
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calculator className="h-4 w-4 text-primary" /> Votre projet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {field('prixBien', 'Prix du bien (€)')}
                {field(
                  'apport',
                  'Apport personnel (€)',
                  'Il finance le prix du bien et les frais d’acquisition.'
                )}
                {field(
                  'loyerMensuel',
                  'Loyer mensuel équivalent (€)',
                  'Comparez des logements et des charges de service équivalents.'
                )}
                {field(
                  'dureeDetention',
                  'Durée de détention (années)',
                  'Combien de temps comptez-vous garder ce logement ? De 1 à 30 ans.'
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Crédit et acquisition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {field('tauxInteret', 'Taux annuel du crédit (%)')}
                {field(
                  'tauxAssurance',
                  'Taux annuel d’assurance (%)',
                  'Sur le capital initial emprunté.'
                )}
                {field(
                  'dureeAnnees',
                  'Durée du crédit (années)',
                  'De 1 à 30 ans, indépendamment de la durée de détention.'
                )}
                {field('fraisNotaireTaux', 'Frais d’acquisition estimés (%)')}
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label="Exemples de frais d’acquisition"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-11 text-sm lg:min-h-8 lg:text-xs"
                    aria-pressed={form.values.fraisNotaireTaux === 7.5}
                    onClick={() => form.setField('fraisNotaireTaux', 7.5)}
                  >
                    Ancien : 7,5 %
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-11 text-sm lg:min-h-8 lg:text-xs"
                    aria-pressed={form.values.fraisNotaireTaux === 2.5}
                    onClick={() => form.setField('fraisNotaireTaux', 2.5)}
                  >
                    Neuf : 2,5 %
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Exemples indicatifs : ajustez les frais selon votre projet.
                </p>
              </CardContent>
            </Card>
            <details
              className="rounded-xl border px-5 py-3 lg:py-5"
              open={
                [
                  'taxeFonciere',
                  'chargesCopropriete',
                  'entretienAnnuel',
                  'inflationLoyer',
                  'rendementEpargne',
                  'appreciationImmo',
                ].some((key) => errors[key]) || undefined
              }
            >
              <summary className="min-h-11 cursor-pointer content-center text-base font-semibold lg:min-h-0">
                Charges et hypothèses avancées
              </summary>
              <div className="mt-5 space-y-5">
                {field('taxeFonciere', 'Taxe foncière (€/an)')}
                {field('chargesCopropriete', 'Charges de copropriété (€/an)')}
                {field('entretienAnnuel', 'Entretien et travaux récurrents (€/an)')}
                {field('inflationLoyer', 'Évolution annuelle du loyer (%)')}
                {field('rendementEpargne', 'Rendement annuel net de l’épargne (%)')}
                {field('appreciationImmo', 'Évolution annuelle du prix du bien (%)')}
              </div>
            </details>
          </div>
        }
        results={
          result ? (
            <Results result={result} inputs={form.values} />
          ) : (
            <div role="status" className="rounded-xl border p-6 text-sm lg:col-span-8">
              Complétez ou corrigez les champs signalés pour afficher la comparaison.
            </div>
          )
        }
      />
    </div>
  )
}
