export interface SuperInvestorPosition {
  symbol: string
  name: string
  cusip?: string
  shares?: number
  valueUsd?: number
  weightPercent: number
  changePercent?: number
  changeType?: 'NEW' | 'ADDED' | 'REDUCED' | 'CLOSED' | 'UNCHANGED'
  sector?: string
  shareChange?: number
  reportedPrice?: number
  quarterPriceRange?: string
}

export interface QuarterlyFiling {
  quarterLabel: string
  reportDate: string
  filingDate: string
  totalValueUsd: number
  positions: SuperInvestorPosition[]
}

export interface SuperInvestor {
  id: string
  cik: string
  name: string
  fundName: string
  style: string
  description: string
  avatarUrl?: string
  aum?: number
  lastFilingDate?: string
  notableHoldings: string[]
  holdings?: SuperInvestorPosition[]
  quarterlyHistory?: QuarterlyFiling[]
  secFilingUrl?: string
}

function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return '' // Use Next.js proxy rewrites on client browser
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
}

export async function getSuperInvestors(): Promise<SuperInvestor[]> {
  try {
    const baseUrl = getApiBaseUrl()
    const res = await fetch(`${baseUrl}/api/v1/super-investors`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      }
    })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) return data
    }
  } catch (e) {
    console.error('API error fetching super investors:', e)
  }
  return []
}

export async function getSuperInvestorById(idOrCik: string): Promise<SuperInvestor | null> {
  try {
    const baseUrl = getApiBaseUrl()
    const res = await fetch(`${baseUrl}/api/v1/super-investors/${idOrCik}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      }
    })
    if (res.ok) {
      const data = await res.json()
      if (data && data.id) return data
    }
  } catch (e) {
    console.error('API error fetching super investor details:', e)
  }
  return null
}

export interface InvestorHoldingBrief {
  investorId: string
  investorName: string
  fundName: string
  weightPercent: number
  shares: number
  valueUsd: number
  changeType: 'NEW' | 'ADDED' | 'REDUCED' | 'CLOSED' | 'UNCHANGED'
  changePercent: number
}

export interface ConsensusStock {
  symbol: string
  name: string
  sector: string
  investorCount: number
  totalValueUsd: number
  averageWeightPercent: number
  buyCount: number
  sellCount: number
  holders: InvestorHoldingBrief[]
}

export interface ConsensusReport {
  mostOwned: ConsensusStock[]
  topBuys: ConsensusStock[]
  topSells: ConsensusStock[]
  totalInvestorsAnalyzed: number
  latestQuarter: string
}

export async function getConsensusReport(): Promise<ConsensusReport | null> {
  try {
    const baseUrl = getApiBaseUrl()
    const res = await fetch(`${baseUrl}/api/v1/super-investors/consensus`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      }
    })
    if (res.ok) {
      const data = await res.json()
      if (data && Array.isArray(data.mostOwned)) return data
    }
  } catch (e) {
    console.error('API error fetching super investor consensus:', e)
  }
  return null
}

export async function getStockSuperInvestors(symbol: string): Promise<ConsensusStock | null> {
  try {
    const baseUrl = getApiBaseUrl()
    const res = await fetch(`${baseUrl}/api/v1/super-investors/consensus/stock/${encodeURIComponent(symbol)}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      }
    })
    if (res.ok) {
      const data = await res.json()
      if (data && data.symbol) return data
    }
  } catch (e) {
    console.error(`API error fetching consensus holders for ${symbol}:`, e)
  }
  return null
}
