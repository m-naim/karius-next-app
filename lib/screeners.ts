import { security } from '../app/app/watchlist/[id]/data/security'

export interface ScreenerOption {
  id: string
  label: string
  desc: string
}

export const RECOMMENDED_SCREENERS: ScreenerOption[] = [
  {
    id: 'fundamentals',
    label: '📊 Fondamentaux Dispos',
    desc: 'Affiche uniquement les actions avec données fondamentales disponibles',
  },
  {
    id: 'dividend',
    label: '💰 Rendement Élevé',
    desc: 'Rendement >= 3% & P/E raisonnable (< 22)',
  },
  {
    id: 'value',
    label: '🏷️ Super Value',
    desc: 'P/E <= 15 & Rentabilité (ROE >= 12%)',
  },
  {
    id: 'garp',
    label: '🚀 Croissance GARP',
    desc: 'Forte croissance (Score >= 60%) & P/E <= 25',
  },
  {
    id: 'profitability',
    label: '🛡️ Rentabilité Forte',
    desc: 'Score rentabilité >= 70% & ROA >= 5%',
  },
  {
    id: 'megacap',
    label: '🏢 Mega-Caps',
    desc: 'Capitalisation >= 100 Milliards',
  },
]

export function filterSecuritiesByScreener(
  securities: security[],
  activeScreener: string | null
): security[] {
  if (!activeScreener) return securities

  return securities.filter((s) => {
    switch (activeScreener) {
      case 'fundamentals':
        return !!s.qualityMetrics?.hasFundamentals || !!s.lastYearFundamental
      case 'dividend': {
        const dy = s.dividendYield ?? 0
        const dyPercent = dy >= 1 ? dy : dy * 100
        return dyPercent >= 3 && (s.trailingPE ?? 999) < 22
      }
      case 'value':
        return (
          (s.trailingPE ?? 999) > 0 &&
          (s.trailingPE ?? 999) <= 15 &&
          (s.lastYearFundamental?.roe ?? 0) >= 0.12
        )
      case 'garp':
        return (
          (s.trailingPE ?? 999) > 0 &&
          (s.trailingPE ?? 999) <= 25 &&
          (s.score?.growth ?? 0) >= 0.60
        )
      case 'profitability':
        return (
          (s.score?.profitability ?? 0) >= 0.70 &&
          (s.lastYearFundamental?.roa ?? 0) >= 0.05
        )
      case 'megacap':
        return (s.marketCap ?? 0) >= 100_000_000_000
      default:
        return true
    }
  })
}
