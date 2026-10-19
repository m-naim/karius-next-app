/**
 * Returns a growth-adjusted valuation multiple.
 *
 * Growth may arrive either as a decimal (0.12) or as percentage points (12).
 * The denominator is deliberately kept in percentage points, matching the
 * conventional PEG-style presentation.
 */
export const growthAdjustedMultiple = (multiple: unknown, growth: unknown): number | null => {
  const parsedMultiple = Number(multiple)
  const parsedGrowth = Number(growth)

  if (!Number.isFinite(parsedMultiple) || parsedMultiple <= 0) return null
  if (!Number.isFinite(parsedGrowth) || parsedGrowth <= 0) return null

  const growthPercent = Math.abs(parsedGrowth) <= 1 ? parsedGrowth * 100 : parsedGrowth
  return growthPercent > 0 ? parsedMultiple / growthPercent : null
}
