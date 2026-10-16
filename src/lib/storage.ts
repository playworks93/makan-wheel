import type { Outlet } from './types'

const KEY = 'makan-wheel:v1'

export interface Saved {
  /** Outlet ids on the wheel, per mall. */
  picks: Record<string, string[]>
  /** Places the user added by hand, per mall. */
  custom: Record<string, Outlet[]>
}

export const EMPTY_SAVED: Saved = { picks: {}, custom: {} }

/** Reads saved state. Storage can be missing or blocked (private mode), so this never throws. */
export function loadSaved(): Saved {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY_SAVED
    const data = JSON.parse(raw) as Partial<Saved>
    return {
      picks: isRecord(data.picks) ? (data.picks as Saved['picks']) : {},
      custom: isRecord(data.custom) ? (data.custom as Saved['custom']) : {},
    }
  } catch {
    return EMPTY_SAVED
  }
}

/** Returns false when the browser refused to store (quota, private mode). */
export function save(state: Saved): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

function isRecord(value: unknown): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
