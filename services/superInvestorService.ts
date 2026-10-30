import config from './config'

export type ChangeType =
  | 'NEW'
  | 'ADDED'
  | 'REDUCED'
  | 'CLOSED'
  | 'UNCHANGED'
  | 'NOT_COMPUTABLE'

export interface InvestorSummary {
  slug: string
  displayName: string
  fundDisplayName: string
  style: string
  description: string
  cik: string
  legalName: string
  latestReportDate: string
  latestFilingDate: string
  totalValueUsd: number
  availableQuarters: number
  targetQuarters: number
  lastSuccessfulSyncAt?: string
}

export interface ManagerView {
  cik: string
  legalName: string
  verificationStatus: 'VERIFIED' | 'PENDING_VERIFICATION' | 'SUSPENDED'
}

export interface AccessionView {
  accessionNumber: string
  formType: '13F-HR' | '13F-HR/A'
  secUrl: string
}

export interface HoldingView {
  symbol?: string | null
  issuerName: string
  titleOfClass?: string
  cusip: string
  instrumentType: 'EQUITY' | 'OPTION'
  putCall?: 'PUT' | 'CALL' | null
  sharesOrPrincipal: number
  valueUsd: number
  weightPercent: number
  sector?: string | null
  changeType: ChangeType
  quantityChange?: number | null
  changePercent?: number | null
}

export interface FilingView {
  snapshotId: number
  quarterLabel: string
  reportDate: string
  filingDate: string
  validationStatus: 'VALIDATED' | 'AMENDED' | 'INCOMPLETE'
  totalValueUsd: number
  entryCount: number
  sources: AccessionView[]
  equityHoldings: HoldingView[]
  optionHoldings: HoldingView[]
}

export interface InvestorDetail {
  slug: string
  displayName: string
  fundDisplayName: string
  style: string
  description: string
  managers: ManagerView[]
  availableQuarters: number
  targetQuarters: number
  filings: FilingView[]
  disclaimer: string
}

export interface ConsensusHolder {
  investorSlug: string
  investorName: string
  fundName: string
  reportDate: string
  weightPercent: number
  valueUsd: number
  changeType: ChangeType
  changePercent?: number | null
}

export interface ConsensusStock {
  symbol: string
  issuerName: string
  investorCount: number
  totalValueUsd: number
  averageWeightPercent: number
  buyCount: number
  sellCount: number
  holders: ConsensusHolder[]
}

export interface ConsensusReport {
  mostOwned: ConsensusStock[]
  topBuys: ConsensusStock[]
  topSells: ConsensusStock[]
  totalInvestorsAnalyzed: number
  latestReportDate?: string
  coverageLabel: string
}

function getApiBaseUrl(): string {
  return config.API_URL.replace(/\/$/, '')
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) throw new Error(`Super Investors API: HTTP ${response.status}`)
  return response.json() as Promise<T>
}

export function getSuperInvestors(): Promise<InvestorSummary[]> {
  return getJson('/api/v2/super-investors')
}

export async function getSuperInvestorById(slug: string): Promise<InvestorDetail | null> {
  try {
    return await getJson(`/api/v2/super-investors/${encodeURIComponent(slug)}`)
  } catch (error) {
    if (error instanceof Error && error.message.includes('HTTP 404')) return null
    throw error
  }
}

export function getConsensusReport(): Promise<ConsensusReport> {
  return getJson('/api/v2/super-investors/consensus')
}

export async function getStockSuperInvestors(symbol: string): Promise<ConsensusStock | null> {
  try {
    return await getJson(`/api/v2/super-investors/consensus/stocks/${encodeURIComponent(symbol)}`)
  } catch (error) {
    if (error instanceof Error && error.message.includes('HTTP 404')) return null
    throw error
  }
}
