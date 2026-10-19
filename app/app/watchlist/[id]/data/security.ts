export interface security {
  id: string
  symbol: string
  lastUpdated: string
  exchange: string
  shortname: string
  quoteType: string
  longname: string
  sector: string
  industry: string
  logo: string
  regularMarketChangePercent: number
  regularMarketPreviousClose: number
  regularMarketPrice: number
  regularMarketChange: number
  dividendDate: number
  dividendRate: number
  dividendYield: number
  earningsTimestamp: number
  earningsTimestampStart: number
  marketCap: number
  score: score
  variations: Record<string, number>
  relativePerformances: Record<string, number>
  trailingPE: number
  forwardPE: number
  priceToSales?: number
  currency: string
  weight?: number
  linearity10y: number
  lastYearFundamental?: {
    roa: number
    roe: number
    totalRevenue?: number
    sharesOutstanding?: number
  }
  tags?: string[]
  qualityMetrics?: any
}

export interface score {
  global: number
  balance: number
  growth: number
  momentum: number
  profitability: number
}
