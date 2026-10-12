import { VisibilityState, ColumnOrderState } from '@tanstack/react-table'

export const VISIBILITY_STORAGE_KEY = 'boursehorus_user_column_visibility_v3'
export const ORDER_STORAGE_KEY = 'boursehorus_user_column_order_v3'
export const ACTIVE_PRESET_KEY = 'boursehorus_active_column_preset_id_v3'

const getScopedKey = (key: string, scope = 'global') => scope === 'global' ? key : `${key}_${scope}`

export function getSavedColumnVisibility(defaultVisibility: VisibilityState, scope = 'global'): VisibilityState {
  if (typeof window === 'undefined') return defaultVisibility
  try {
    const saved = localStorage.getItem(getScopedKey(VISIBILITY_STORAGE_KEY, scope))
    if (saved) {
      const parsed = JSON.parse(saved)
      if (typeof parsed === 'object' && parsed !== null) {
        return { ...defaultVisibility, ...parsed }
      }
    }
  } catch (e) {
    console.error('Error loading column visibility from localStorage:', e)
  }
  return defaultVisibility
}

export function getSavedColumnOrder(defaultOrder: ColumnOrderState = [], scope = 'global'): ColumnOrderState {
  if (typeof window === 'undefined') return defaultOrder
  try {
    const saved = localStorage.getItem(getScopedKey(ORDER_STORAGE_KEY, scope))
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Error loading column order from localStorage:', e)
  }
  return defaultOrder
}

export function saveColumnVisibility(visibility: VisibilityState, scope = 'global') {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(getScopedKey(VISIBILITY_STORAGE_KEY, scope), JSON.stringify(visibility))
  } catch (e) {
    console.error('Error saving column visibility to localStorage:', e)
  }
}

export function saveColumnOrder(order: ColumnOrderState, scope = 'global') {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(getScopedKey(ORDER_STORAGE_KEY, scope), JSON.stringify(order))
  } catch (e) {
    console.error('Error saving column order to localStorage:', e)
  }
}
