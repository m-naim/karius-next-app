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
