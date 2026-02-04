export function percentVariation(oldNumber: number, newNumber: number) {
  if (oldNumber === 0) {
    return 0
  }
  return ((newNumber - oldNumber) / oldNumber) * 100
}
