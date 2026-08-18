import { ColumnFiltersState, SortingState } from '@tanstack/react-table'

export const WATCHLIST_FILTERS_STORAGE_KEY = 'boursehorus_watchlist_filters_v1'
export const MARKET_FILTERS_STORAGE_KEY = 'boursehorus_market_filters_v1'

export interface SavedTableFilterState {
  columnFilters?: ColumnFiltersState
  globalFilter?: string
  sorting?: SortingState
  activeScreener?: string | null
  selectedPeriod?: string
}

export function getSavedTableFilters(storageKey: string): SavedTableFilterState {
  if (typeof window === 'undefined') return {}
  try {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed
      }
    }
  } catch (e) {
    console.error(`Error loading saved table filters for key '${storageKey}':`, e)
  }
  return {}
}

export function saveTableFilters(storageKey: string, state: SavedTableFilterState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(storageKey, JSON.stringify(state))
  } catch (e) {
    console.error(`Error saving table filters for key '${storageKey}':`, e)
  }
}

export function clearSavedTableFilters(storageKey: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(storageKey)
  } catch (e) {
    console.error(`Error clearing saved table filters for key '${storageKey}':`, e)
  }
}
