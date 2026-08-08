import { VisibilityState, ColumnOrderState } from '@tanstack/react-table'

export const VISIBILITY_STORAGE_KEY = 'boursehorus_user_column_visibility_v3'
export const ORDER_STORAGE_KEY = 'boursehorus_user_column_order_v3'
export const ACTIVE_PRESET_KEY = 'boursehorus_active_column_preset_id_v3'

export function getSavedColumnVisibility(defaultVisibility: VisibilityState): VisibilityState {
  if (typeof window === 'undefined') return defaultVisibility
  try {
    const saved = localStorage.getItem(VISIBILITY_STORAGE_KEY)
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

export function getSavedColumnOrder(defaultOrder: ColumnOrderState = []): ColumnOrderState {
  if (typeof window === 'undefined') return defaultOrder
  try {
    const saved = localStorage.getItem(ORDER_STORAGE_KEY)
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

export function saveColumnVisibility(visibility: VisibilityState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(visibility))
  } catch (e) {
    console.error('Error saving column visibility to localStorage:', e)
  }
}

export function saveColumnOrder(order: ColumnOrderState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order))
  } catch (e) {
    console.error('Error saving column order to localStorage:', e)
  }
}
