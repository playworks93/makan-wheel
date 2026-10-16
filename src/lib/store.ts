import { useSyncExternalStore } from 'react'
import { slugify } from './data'
import { loadSaved, save, type Saved } from './storage'
import type { Outlet } from './types'

/** More slices than this and the labels get too small to read. */
export const MAX_PICKS = 16

export interface StoreState extends Saved {
  /** True when the last save failed, so picks will not survive a reload. */
  saveFailed: boolean
}

let state: StoreState = { ...loadSaved(), saveFailed: false }
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function update(change: (s: Saved) => Saved) {
  const next = change(state)
  const ok = save({ picks: next.picks, custom: next.custom })
  state = { picks: next.picks, custom: next.custom, saveFailed: !ok }
  listeners.forEach((l) => l())
}

export function useStore(): StoreState {
  return useSyncExternalStore(subscribe, () => state)
}

export function setPicks(mallId: string, ids: string[]) {
  const unique = [...new Set(ids)].slice(0, MAX_PICKS)
  update((s) => ({ ...s, picks: { ...s.picks, [mallId]: unique } }))
}

export function togglePick(mallId: string, id: string) {
  const current = state.picks[mallId] ?? []
  if (current.includes(id)) setPicks(mallId, current.filter((x) => x !== id))
  else if (current.length < MAX_PICKS) setPicks(mallId, [...current, id])
}

export function addPicks(mallId: string, ids: string[]) {
  setPicks(mallId, [...(state.picks[mallId] ?? []), ...ids])
}

/** Adds a place the user typed in and puts it on the wheel. Reuses an existing one with the same name. */
export function addCustom(mallId: string, place: Omit<Outlet, 'id' | 'custom'>): string {
  const list = state.custom[mallId] ?? []
  const existing = list.find((o) => o.name.toLowerCase() === place.name.toLowerCase())
  let id = existing?.id
  if (!id) {
    const base = `custom-${slugify(place.name)}`
    id = base
    for (let n = 2; list.some((o) => o.id === id); n++) id = `${base}-${n}`
    const added: Outlet = { ...place, id, custom: true }
    update((s) => ({ ...s, custom: { ...s.custom, [mallId]: [...list, added] } }))
  }
  addPicks(mallId, [id])
  return id
}

export function removeCustom(mallId: string, id: string) {
  update((s) => ({
    picks: { ...s.picks, [mallId]: (s.picks[mallId] ?? []).filter((x) => x !== id) },
    custom: { ...s.custom, [mallId]: (s.custom[mallId] ?? []).filter((o) => o.id !== id) },
  }))
}
