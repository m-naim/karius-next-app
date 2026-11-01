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

export interface InvestorExploreItem {
  slug: string
  displayName: string
  fundDisplayName: string
  style: string
  cik: string
  latestReportDate: string
  totalValueUsd: number
  availableQuarters: number
  resolvedEquityCount: number
  totalPositionCount: number
  annualizedPerformance?: number | null
  cumulativePerformance?: number | null
  oneYearPerformance?: number | null
  coveragePercent?: number | null
}

export interface InvestorExplorePage {
  content: InvestorExploreItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
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

export type ValuationState =
  | 'PENDING'
  | 'RUNNING'
  | 'AVAILABLE'
  | 'INCOMPLETE'
  | 'FAILED'
export type ValuationView = 'VALUE' | 'PERFORMANCE'

export interface ValuationStatus {
  status: ValuationState
  updatedAt?: string | null
  latestManagedValueUsd?: number | null
  latestCoveragePercent?: number | null
  methodologyVersion: string
  message?: string | null
}

export interface CoverageExclusion {
  cusip: string
  symbol?: string | null
  issuerName: string
  instrumentType: 'EQUITY' | 'OPTION'
  valueUsd: number
  reason:
    | 'OPTION_NO_DAILY_PRICE'
    | 'UNRESOLVED_CUSIP'
    | 'PRICE_HISTORY_UNAVAILABLE'
}

export interface ValuationCoverage {
  reportDate?: string | null
  coveragePercent: number
  thresholdPercent: number
  exclusions: CoverageExclusion[]
}

export interface PerformancePoint {
  date: string
  value: number
  coveragePercent: number
  pointType: 'OFFICIAL_ANCHOR' | 'RETROSPECTIVE_ESTIMATE' | 'PUBLIC_ESTIMATE'
}

export interface PerformanceSeries {
  type: 'SUPER_INVESTOR' | 'INDEX' | 'PORTFOLIO'
  id: string
  label: string
  points: PerformancePoint[]
}

export interface PerformanceEvent {
  date: string
  type: 'REPORT_DATE' | 'PUBLICATION_DATE'
  accessionNumber: string
  secUrl: string
}

export interface SuperInvestorPerformance {
  status: ValuationState
  view: ValuationView
  currency: 'USD'
  period: string
  methodology: string
  coverage: {
    latestPercent: number
    minimumPercent: number
    thresholdPercent: number
  }
  series: PerformanceSeries[]
  events: PerformanceEvent[]
  updatedAt?: string | null
  message?: string | null
}

function getApiBaseUrl(): string {
  return config.API_URL.replace(/\/$/, '')
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })
  if (!response.ok)
    throw new Error(`Super Investors API: HTTP ${response.status}`)
  return response.json() as Promise<T>
}

export function getSuperInvestors(): Promise<InvestorSummary[]> {
  return getJson('/api/v2/super-investors')
}

export function getSuperInvestorExplore(params: {
  page: number
  size: number
  sort: string
  direction: 'ASC' | 'DESC'
  query?: string
}): Promise<InvestorExplorePage> {
  const search = new URLSearchParams({
    page: String(params.page),
    size: String(params.size),
    sort: params.sort,
    direction: params.direction,
  })
  if (params.query?.trim()) search.set('query', params.query.trim())
  return getJson(`/api/v2/super-investors/explore?${search.toString()}`)
}

export async function getSuperInvestorById(
  slug: string
): Promise<InvestorDetail | null> {
  try {
    return await getJson(`/api/v2/super-investors/${encodeURIComponent(slug)}`)
  } catch (error) {
    if (error instanceof Error && error.message.includes('HTTP 404'))
      return null
    throw error
  }
}

export function getConsensusReport(): Promise<ConsensusReport> {
  return getJson('/api/v2/super-investors/consensus')
}

export function getSuperInvestorValuationStatus(
  slug: string
): Promise<ValuationStatus> {
  return getJson(
    `/api/v2/super-investors/${encodeURIComponent(slug)}/valuation/status`
  )
}

export function getSuperInvestorValuationCoverage(
  slug: string
): Promise<ValuationCoverage> {
  return getJson(
    `/api/v2/super-investors/${encodeURIComponent(slug)}/valuation/coverage`
  )
}

export function getSuperInvestorPerformance(
  slug: string,
  period: string,
  view: ValuationView,
  benchmarks: string[] = []
): Promise<SuperInvestorPerformance> {
  const search = new URLSearchParams({ period, view })
  benchmarks.forEach((benchmark) => search.append('benchmarks', benchmark))
  return getJson(
    `/api/v2/super-investors/${encodeURIComponent(
      slug
    )}/performance?${search.toString()}`
  )
}

export async function getStockSuperInvestors(
  symbol: string
): Promise<ConsensusStock | null> {
  try {
    return await getJson(
      `/api/v2/super-investors/consensus/stocks/${encodeURIComponent(symbol)}`
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes('HTTP 404'))
      return null
    throw error
  }
}
