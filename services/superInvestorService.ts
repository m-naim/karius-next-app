import localInvestors from '@/data/superInvestors.json'

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
      if (Array.isArray(data) && data.length > 0) return data
    }
  } catch (e) {
    console.warn('API connection error, falling back to local superInvestors dataset:', e)
  }
  return localInvestors as SuperInvestor[]
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
    console.warn('API connection error, falling back to local superInvestors dataset:', e)
  }
  return (localInvestors as SuperInvestor[]).find(i => i.id === idOrCik || i.cik === idOrCik) || null
}
