export function percentVariation(oldNumber: number, newNumber: number) {
  if (oldNumber === 0) {
    return 0
  }
  return ((newNumber - oldNumber) / oldNumber) * 100
}

/**
 * Calculates the Compound Annual Growth Rate (CAGR).
 * @param startValue The initial value.
 * @param endValue The final value.
 * @param periods The number of periods (years).
 * @returns The CAGR as a percentage (e.g., 5.5 for 5.5%), or 0 if inputs are invalid.
 */
export function calculateCAGR(startValue: number, endValue: number, periods: number): number {
  if (startValue <= 0 || endValue <= 0 || periods <= 0) {
    return 0
  }
  return (Math.pow(endValue / startValue, 1 / periods) - 1) * 100
}

/**
 * Calculates the R-squared (coefficient of determination) for a linear regression
 * of the given values against their indices (0, 1, 2, ...).
 * @param values The array of values (y-axis).
 * @returns The R-squared value (0 to 1), or 0 if inputs are insufficient.
 */
export function calculateR2(values: number[]): number {
  const n_pts = values.length
  if (n_pts < 2) return 0

  const x = Array.from({ length: n_pts }, (_, i) => i)
  const y = values

  const sum_x = x.reduce((a, b) => a + b, 0)
  const sum_y = y.reduce((a, b) => a + b, 0)
  const sum_xy = x.reduce((a, i) => a + x[i] * y[i], 0)
  const sum_x2 = x.reduce((a, b) => a + b * b, 0)
  const sum_y2 = y.reduce((a, b) => a + b * b, 0)

  const num = n_pts * sum_xy - sum_x * sum_y
  const den = Math.sqrt((n_pts * sum_x2 - sum_x * sum_x) * (n_pts * sum_y2 - sum_y * sum_y))

  return den === 0 ? 0 : Math.pow(num / den, 2)
}

interface StockHistoryItem {
  day: number // Unix timestamp in days or similar (number of days since epoch)
  close: number
}

export function calculateYearlyVariations(history: StockHistoryItem[]): {
  bestYearVariation: number | null
  worstYearVariation: number | null
} {
  if (history.length < 2) {
    return { bestYearVariation: null, worstYearVariation: null }
  }

  const yearlyData: { [year: number]: { firstClose: number; lastClose: number } } = {}

  history.forEach((item) => {
    const date = new Date(item.day * 24 * 60 * 60 * 1000) // Convert days to milliseconds for Date object
    const year = date.getFullYear()

    if (!yearlyData[year]) {
      yearlyData[year] = { firstClose: item.close, lastClose: item.close }
    } else {
      // Update lastClose as we iterate, assuming history is sorted by date
      yearlyData[year].lastClose = item.close
      // To ensure firstClose is truly the first for the year, if history isn't guaranteed sorted,
      // one might need to track min/max date for each year and use close values at those dates.
      // For simplicity, assuming history is ordered by date.
    }
  })

  const variations: number[] = []
  for (const year in yearlyData) {
    const { firstClose, lastClose } = yearlyData[year]
    if (firstClose > 0) {
      // Avoid division by zero
      variations.push(((lastClose - firstClose) / firstClose) * 100)
    }
  }

  if (variations.length === 0) {
    return { bestYearVariation: null, worstYearVariation: null }
  }

  const bestYearVariation = Math.max(...variations)
  const worstYearVariation = Math.min(...variations)

  return { bestYearVariation, worstYearVariation }
}
