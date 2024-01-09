import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isDefined = (variable) => {
  if (typeof variable != 'undefined' && variable != null) return true
  return false
}

export const comparator = (a, b) => {
  console.log(typeof a, a)
  if (typeof a === 'string') return a.localeCompare(b)
  if (typeof a === 'number') return a - b
  return 0
}
