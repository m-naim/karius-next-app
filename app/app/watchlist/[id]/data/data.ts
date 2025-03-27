import watchListService from '@/services/watchListService'

export const sectors = [
  {
    label: 'Technology',
    value: 'Technology',
  },
  {
    label: 'Healthcare',
    value: 'Healthcare',
  },
  {
    label: 'Consumer Cyclical',
    value: 'Consumer Cyclical',
  },
  {
    label: 'Financial Services',
    value: 'Financial Services',
  },
  {
    label: 'Communication Services',
    value: 'Communication Services',
  },
  {
    label: 'Industrials',
    value: 'Industrials',
  },

  {
    label: 'Real Estate',
    value: 'Real Estate',
  },
  {
    label: 'Energy',
    value: 'Energy',
  },
  {
    label: 'Consumer Defensive',
    value: 'Consumer Defensive',
  },
  {
    label: 'Consumer Cyclical',
    value: 'Consumer Cyclical',
  },
]

export const industries = [
  {
    label: 'Software—Infrastructure',
    value: 'Software—Infrastructure',
  },
  {
    label: 'Medical Devices',
    value: 'Medical Devices',
  },
  {
    label: 'Semiconductors',
    value: 'Semiconductors',
  },
  {
    label: 'Internet Retail',
    value: 'Internet Retail',
  },
  {
    label: 'Semiconductor Equipment & Materials',
    value: 'Semiconductor Equipment & Materials',
  },
  {
    label: 'Software—Application',
    value: 'Software—Application',
  },

  {
    label: 'Diagnostics & Research',
    value: 'Diagnostics & Research',
  },
  {
    label: 'Asset Management',
    value: 'Asset Management',
  },
  {
    label: 'Credit Services',
    value: 'Credit Services',
  },
  {
    label: 'Financial Data & Stock Exchanges',
    value: 'Financial Data & Stock Exchanges',
  },
]

export async function getWatchlistData(id: string) {
  try {
    const response = await watchListService.get(id)
    const watchlist = response.watchlist

    // Enrichir les données avec des informations de marché simulées
    const enrichedSecurities = watchlist.securities.map((security) => ({
      ...security,
      name: security.name || security.symbol, // Fallback au symbole si pas de nom
      price: Math.random() * 1000, // Prix simulé entre 0 et 1000
      change: (Math.random() - 0.5) * 10, // Variation entre -5 et +5
      changePercent: (Math.random() - 0.5) * 10, // Pourcentage de variation entre -5% et +5%
      volume: Math.floor(Math.random() * 1000000), // Volume simulé
      marketCap: Math.floor(Math.random() * 1000000000), // Capitalisation simulée
    }))

    return {
      ...watchlist,
      securities: enrichedSecurities,
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données de la watchlist:', error)
    throw error
  }
}
