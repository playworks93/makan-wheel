import { CUISINES, TYPE_LABELS, type Cuisine, type Halal, type Outlet, type Price } from './types'

/** `halal` = MUIS-certified only. `muslim` = certified or Muslim-owned. */
export type HalalFilter = 'any' | 'halal' | 'muslim'

export interface Filters {
  query: string
  halal: HalalFilter
  prices: Price[]
  cuisines: Cuisine[]
}

export const EMPTY_FILTERS: Filters = { query: '', halal: 'any', prices: [], cuisines: [] }

export function matchesHalal(halal: Halal, filter: HalalFilter): boolean {
  if (filter === 'halal') return halal === 'certified'
  if (filter === 'muslim') return halal === 'certified' || halal === 'muslim-owned'
  return true
}

const fold = (text: string) =>
  text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

function haystack(o: Outlet): string {
  return fold([o.name, o.unit ?? '', TYPE_LABELS[o.type], ...o.cuisines].join(' '))
}

export function filterOutlets(outlets: Outlet[], f: Filters): Outlet[] {
  const words = fold(f.query).split(/\s+/).filter(Boolean)
  return outlets.filter(
    (o) =>
      matchesHalal(o.halal, f.halal) &&
      (f.prices.length === 0 || f.prices.includes(o.price)) &&
      (f.cuisines.length === 0 || o.cuisines.some((c) => f.cuisines.includes(c))) &&
      (words.length === 0 || words.every((w) => haystack(o).includes(w))),
  )
}

/** Cuisines present in `outlets`, in the standard order, with how many places serve each. */
export function cuisineCounts(outlets: Outlet[]): { cuisine: Cuisine; count: number }[] {
  const counts = new Map<Cuisine, number>()
  for (const o of outlets) for (const c of o.cuisines) counts.set(c, (counts.get(c) ?? 0) + 1)
  return CUISINES.filter((c) => counts.has(c)).map((c) => ({ cuisine: c, count: counts.get(c)! }))
}

export function activeFilterCount(f: Filters): number {
  return (f.query.trim() ? 1 : 0) + (f.halal !== 'any' ? 1 : 0) + f.prices.length + f.cuisines.length
}

export function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}
