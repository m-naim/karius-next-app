'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calculator, Info, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import NumberField, { useNumberForm } from './NumberField'
import CalculatorLayout from './CalculatorLayout'
import SimulationActions from './SimulationActions'
import { DeferredMortgageCharts } from './DeferredCalculatorCharts'
import {
  calculateMortgage,
  mortgageDefaults,
  mortgageRules,
  type MortgageInputs,
} from '@/lib/mortgage-math'

const euros = (value: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)

export default function CalculateurMensualite({
  initialValues = mortgageDefaults,
  invalidTransfer = false,
  transferred = false,
  initialName,
}: {
  initialValues?: MortgageInputs
  invalidTransfer?: boolean
  transferred?: boolean
  initialName?: string
}) {
  const form = useNumberForm(initialValues, mortgageRules)
  const result = useMemo(
    () => (form.valid ? calculateMortgage(form.values) : null),
    [form.draft, form.valid]
  )
  const field = (key: keyof MortgageInputs, label: string, hint?: string) => (
    <NumberField
      label={label}
      value={form.draft[key]}
      onChange={(value) => form.setField(key, value)}
      error={form.errors[key]}
      integer={mortgageRules[key].integer}
      hint={hint}
    />
  )

  return (
    <div className="flex flex-col gap-8">
      {invalidTransfer && (
        <p role="status" className="rounded-lg border p-4 text-sm">
          Les paramètres du lien sont incomplets ou invalides. Les valeurs par défaut ont été
          rétablies.
        </p>
      )}
      {transferred && (
        <p className="text-sm text-muted-foreground">
          Les paramètres de ce lien ont été appliqués à la simulation.
        </p>
      )}
      <CalculatorLayout
        valid={form.valid}
        resultsLabel="Voir mon amortissement"
        actions={
          <SimulationActions
            kind="mortgage"
            values={form.values}
            valid={form.valid}
            initialName={initialName}
            onLoad={form.setValues}
          />
        }
        parameters={
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calculator className="h-4 w-4 text-primary" /> Paramètres du prêt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {field('montantPret', 'Montant du prêt (€)')}
                {field('tauxInteret', 'Taux annuel du crédit (%)')}
                {field('dureeAnnees', 'Durée du crédit (années)', 'De 1 à 30 ans.')}
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label="Durées de crédit courantes"
                >
                  {[15, 20, 25].map((years) => (
                    <Button
                      key={years}
                      variant="outline"
                      size="sm"
                      className="min-h-11 text-sm lg:min-h-8 lg:text-xs"
                      aria-pressed={form.values.dureeAnnees === years}
                      onClick={() => form.setField('dureeAnnees', years)}
                    >
                      {years} ans
                    </Button>
                  ))}
                </div>
                {field(
                  'tauxAssurance',
                  'Taux annuel d’assurance (%)',
                  'Calculé sur le capital initial emprunté.'
                )}
              </CardContent>
            </Card>
          </div>
        }
        results={
          result ? (
            <MortgageResults result={result} />
          ) : (
            <p role="status" className="rounded-xl border p-6 text-sm lg:col-span-8">
              Complétez ou corrigez les champs signalés pour afficher l’amortissement.
            </p>
          )
        }
      />
      <div className="rounded-xl border bg-muted/30 p-6">
        <h3 className="mb-4 flex items-center gap-2 font-bold">
          <Info className="h-5 w-5 text-primary" />
          Comprendre l'amortissement
        </h3>
        <div className="grid grid-cols-1 gap-6 text-sm text-muted-foreground md:grid-cols-2">
          <p>
            Dans un prêt à mensualités constantes, la répartition entre le remboursement du capital
            (le principal) et les intérêts évolue chaque mois. Au début, les intérêts sont calculés
            sur le montant total emprunté, ils représentent donc une part importante de votre
            mensualité.
          </p>
          <p>
            Au fur et à mesure que vous remboursez, le capital restant diminue, et donc les intérêts
            dus chaque mois baissent. En conséquence, la part de votre mensualité consacrée au
            remboursement du capital augmente. C'est ce qu'on appelle "l'amortissement".
          </p>
        </div>
      </div>
    </div>
  )
}

function MortgageResults({ result }: { result: ReturnType<typeof calculateMortgage> }) {
  const {
    mensualiteHorsAssurance,
    mensualiteAssurance,
    mensualiteTotale,
    coutTotalInterets,
    coutTotalAssurance,
    percentTotalInterets,
    amortissementData,
  } = result
  return (
    <div className="flex min-w-0 flex-col gap-6 lg:col-span-8">
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="relative z-10 flex flex-col items-center justify-center py-10">
          <p className="mb-2 text-sm font-medium text-muted-foreground">Mensualité Totale</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-semibold tabular-nums sm:text-5xl">
              {Math.round(mensualiteTotale).toLocaleString('fr-FR')}
            </p>
            <span className="text-3xl font-bold text-primary">€</span>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Crédit : </span>
              <span className="font-bold">
                {Math.round(mensualiteHorsAssurance).toLocaleString('fr-FR')}€
              </span>
            </div>
            <div className="flex items-center gap-2 border-l border-border pl-6">
              <div className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="text-muted-foreground">Assurance : </span>
              <span className="font-bold">
                {Math.round(mensualiteAssurance).toLocaleString('fr-FR')}€
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold uppercase text-primary">Récapitulatif</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between border-b pb-2">
            <span className="text-sm text-muted-foreground">Mensualité (hors ass.)</span>
            <span className="font-bold">
              {Math.round(mensualiteHorsAssurance).toLocaleString('fr-FR')} €
            </span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-sm text-muted-foreground">Assurance / mois</span>
            <span className="font-bold">
              {Math.round(mensualiteAssurance).toLocaleString('fr-FR')} €
            </span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Coût total intérêts</span>
              <span className="text-xs text-red-500/70">({percentTotalInterets}% du prêt)</span>
            </div>
            <span className="font-bold text-red-500">
              {Math.round(coutTotalInterets).toLocaleString('fr-FR')} €
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Coût total assurance</span>
            <span className="font-bold">
              {Math.round(coutTotalAssurance).toLocaleString('fr-FR')} €
            </span>
          </div>
        </CardContent>
      </Card>

      <DeferredMortgageCharts data={amortissementData} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wider">
            <Calendar className="h-4 w-4" /> Tableau d'amortissement (Annuel)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="relative overflow-x-auto rounded-lg border"
            tabIndex={0}
            role="region"
            aria-label="Tableau d’amortissement annuel"
          >
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Année</th>
                  <th className="px-4 py-3 text-right">Principal</th>
                  <th className="px-4 py-3 text-right">Intérêts</th>
                  <th className="px-4 py-3 text-right">Assurance</th>
                  <th className="px-4 py-3 text-right font-bold">Total Payé</th>
                  <th className="px-4 py-3 text-right">Part Int. (%)</th>
                  <th className="px-4 py-3 text-right">Capital Restant</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {amortissementData.map((row) => (
                  <tr key={row.year} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">An {row.year}</td>
                    <td className="px-4 py-3 text-right text-green-600">{euros(row.principal)}</td>
                    <td className="px-4 py-3 text-right text-red-500">{euros(row.interets)}</td>
                    <td className="px-4 py-3 text-right text-indigo-500">{euros(row.assurance)}</td>
                    <td className="px-4 py-3 text-right font-bold text-primary">
                      {euros(row.totalPaye)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{row.percentInterets}%</td>
                    <td className="px-4 py-3 text-right font-mono">{euros(row.balanceRestante)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
