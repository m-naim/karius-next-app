import { Button } from '@/components/ui/button'
import { formatRisk, riskStatusMessage, type PortfolioRiskResult } from '@/hooks/useRiskMetrics'

interface Props {
  metrics?: PortfolioRiskResult
  years: 1 | 3
  onYearsChange: (years: 1 | 3) => void
  loading: boolean
  error: boolean
  recalculating: boolean
  onRecalculate: () => void
  onRetry: () => void
}

export default function RiskQuickStats({
  metrics, years, onYearsChange, loading, error, recalculating, onRecalculate, onRetry,
}: Props) {
  const risk = metrics?.snapshot

  return (
    <section aria-labelledby="portfolio-risk-title" className="rounded-xl border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 id="portfolio-risk-title" className="p-0 text-base font-semibold">Risque du portefeuille</h3>
          {risk?.asOf && <p className="mb-0 text-xs text-muted-foreground">Données au {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(risk.asOf))}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <div role="group" aria-label="Période du risque" className="flex gap-1 rounded-lg bg-muted p-1">
            {([1, 3] as const).map((period) => (
              <Button key={period} size="sm" variant={period === years ? 'secondary' : 'ghost'}
                aria-pressed={period === years} onClick={() => onYearsChange(period)}>
                {period === 1 ? '1 an' : '3 ans'}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={onRecalculate} disabled={recalculating}>
            {recalculating ? 'Recalcul en cours…' : 'Recalculer'}
          </Button>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 divide-x rounded-lg border py-3">
        <div className="px-2 sm:px-4">
          <dt className="text-xs text-muted-foreground">Sharpe</dt>
          <dd className="text-lg font-semibold tabular-nums">{formatRisk(risk?.sharpe)}</dd>
        </div>
        <div className="px-2 sm:px-4">
          <dt className="text-xs text-muted-foreground">Baisse maximale</dt>
          <dd className="text-lg font-semibold tabular-nums">{formatRisk(risk?.maxDrawdown, true)}</dd>
        </div>
        <div className="px-2 sm:px-4">
          <dt className="text-xs text-muted-foreground">Volatilité</dt>
          <dd className="text-lg font-semibold tabular-nums">{formatRisk(risk?.volatility, true)}</dd>
        </div>
      </dl>

      {loading && <p role="status" className="mb-0 mt-3 text-sm text-muted-foreground">Chargement des indicateurs…</p>}
      {error && (
        <div role="alert" className="mt-3 flex flex-wrap items-center gap-2 text-sm text-destructive">
          Les indicateurs n’ont pas pu être actualisés.
          <Button size="sm" variant="outline" onClick={onRetry}>Réessayer</Button>
        </div>
      )}
      {risk && risk.status !== 'READY' && (
        <p className="mb-0 mt-3 text-sm text-muted-foreground">{riskStatusMessage[risk.status]}</p>
      )}
      <details className="mt-3 border-t pt-3 text-sm">
        <summary className="cursor-pointer font-medium">Méthode et comparaisons</summary>
        <p className="mb-0 mt-2 text-sm text-muted-foreground">
          Sharpe · rendement au-dessus du taux de référence rapporté à la volatilité.
          {metrics?.reference && ` Référence ${metrics.reference} (${metrics.currency}).`}
        </p>
        {risk?.calculatedAt && <p className="mb-0 mt-1 text-xs text-muted-foreground">Calculé le {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(risk.calculatedAt))}</p>}
        <dl className="mt-3 space-y-2">
          <div className="flex justify-between gap-3"><dt>Sortino</dt><dd>{formatRisk(risk?.sortino)}</dd></div>
        </dl>
        {Object.entries(metrics?.benchmarks ?? {}).map(([symbol, comparison]) => (
          <div key={symbol} className="mt-3 rounded-lg border p-3">
            <h4 className="font-semibold">{symbol.replace('SUPER_INVESTOR:', '')}</h4>
            <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {([
                ['Sharpe', comparison.sharpe, false],
                ['Baisse max.', comparison.maxDrawdown, true],
                ['Volatilité', comparison.volatility, true],
                ['Sortino', comparison.sortino, false],
                ['Bêta', comparison.beta, false],
              ] as const).map(([label, value, percent]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="tabular-nums">{formatRisk(value, percent)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </details>
    </section>
  )
}
