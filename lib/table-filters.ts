export const genericNumericFilterFn = (row: any, id: string, value: any) => {
  if (!value) return true
  const rawVal = row.getValue(id)
  if (rawVal === undefined || rawVal === null || rawVal === '') return false
  const val = Number(rawVal)
  if (isNaN(val)) return false

  // Custom Min / Max range filter: { min, max }
  if (
    typeof value === 'object' &&
    !Array.isArray(value) &&
    (value.min !== undefined || value.max !== undefined)
  ) {
    const min =
      value.min !== undefined && value.min !== '' && value.min !== null ? Number(value.min) : -Infinity
    const max =
      value.max !== undefined && value.max !== '' && value.max !== null ? Number(value.max) : Infinity
    return val >= min && val <= max
  }

  // Object mode filter: { values, mode }
  if (typeof value === 'object' && !Array.isArray(value) && value.values) {
    const { values, mode } = value as { values: string[]; mode: 'is' | 'isnot' }
    if (!values || values.length === 0) return true
    const matches = values.some((filter: string) => {
      if (filter === 'positive') return val > 0
      if (filter === 'negative') return val < 0
      if (filter === 'flat') return val === 0
      if (filter === 'value') return val < 15
      if (filter === 'fair') return val >= 15 && val <= 25
      if (filter === 'growth') return val > 25
      if (filter === 'hyper') return val > 20
      if (filter === 'steady') return val >= 10 && val <= 20
      if (filter === 'slow') return val < 10
      if (filter === 'high') return val >= 15
      if (filter === 'good') return val >= 5 && val < 15
      if (filter === 'medium') return val >= 2 && val < 4
      if (filter === 'low') return val < 5
      return true
    })
    return mode === 'is' ? matches : !matches
  }

  // Array filter
  if (Array.isArray(value)) {
    if (value.length === 0) return true
    return value.some((filter: string) => {
      if (filter === 'positive') return val > 0
      if (filter === 'negative') return val < 0
      if (filter === 'flat') return val === 0
      if (filter === 'value') return val < 15
      if (filter === 'fair') return val >= 15 && val <= 25
      if (filter === 'growth') return val > 25
      if (filter === 'hyper') return val > 20
      if (filter === 'steady') return val >= 10 && val <= 20
      if (filter === 'slow') return val < 10
      if (filter === 'high') return val >= 15
      if (filter === 'good') return val >= 5 && val < 15
      if (filter === 'medium') return val >= 2 && val < 4
      if (filter === 'low') return val < 5
      return true
    })
  }

  return true
}
