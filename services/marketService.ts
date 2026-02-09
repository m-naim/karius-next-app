import { getQuotes } from './stock.service'

export interface IndexComposition {
  symbol: string
  name: string
  constituents: string[]
}

export async function getIndexComposition(symbol: string): Promise<IndexComposition> {
  // Map standard symbols to our file names
  const fileMap: { [key: string]: string } = {
    '^NDX': 'nasdaq.json',
    '^DJI': 'dowjones.json',
    // Add sp500 later if available
  }

  const filename = fileMap[symbol]
  if (!filename) {
    throw new Error('Index not found')
  }

  const response = await fetch(`/data/indices/${filename}`)
  if (!response.ok) {
    throw new Error('Failed to fetch index data')
  }
  return response.json()
}

export async function getIndexData(constituents: string[]) {
  return getQuotes(constituents)
}

const marketService = {
  getIndexComposition,
  getIndexData,
}

export default marketService
