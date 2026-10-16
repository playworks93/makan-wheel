export const CUISINES = [
  'Local',
  'Chinese',
  'Malay',
  'Indian',
  'Indonesian',
  'Japanese',
  'Korean',
  'Thai',
  'Vietnamese',
  'Western',
  'Italian',
  'Mexican',
  'Middle Eastern',
  'Fusion',
  'Seafood',
  'Healthy',
  'Cafe',
  'Bakery',
  'Dessert',
  'Drinks',
] as const
export type Cuisine = (typeof CUISINES)[number]

export const OUTLET_TYPES = ['restaurant', 'fast-food', 'cafe', 'dessert', 'food-court', 'kiosk'] as const
export type OutletType = (typeof OUTLET_TYPES)[number]

/** "Cuisine, Cuisine · Type · #unit", leaving out the type when a cuisine already says it. */
export function describeOutlet(o: Outlet): string {
  const type = o.custom ? 'Added by you' : TYPE_LABELS[o.type]
  const showType = !o.cuisines.some((c) => c.toLowerCase() === type.toLowerCase())
  return [o.cuisines.join(', '), showType ? type : null, o.unit].filter(Boolean).join(' · ')
}

export const TYPE_LABELS: Record<OutletType, string> = {
  restaurant: 'Restaurant',
  'fast-food': 'Fast food',
  cafe: 'Cafe',
  dessert: 'Dessert',
  'food-court': 'Food court',
  kiosk: 'Kiosk',
}

/** `certified` = MUIS halal certificate. `muslim-owned` = run by Muslims but not certified. */
export const HALAL = ['certified', 'muslim-owned', 'no'] as const
export type Halal = (typeof HALAL)[number]

export const PRICES = [1, 2, 3] as const
export type Price = (typeof PRICES)[number]

export const PRICE_LABELS: Record<Price, string> = {
  1: 'Under S$15 a person',
  2: 'S$15 to S$35 a person',
  3: 'Over S$35 a person',
}

export const REGIONS = ['Central', 'North', 'North-East', 'East', 'West'] as const
export type Region = (typeof REGIONS)[number]

export interface Outlet {
  id: string
  name: string
  unit?: string
  cuisines: Cuisine[]
  type: OutletType
  price: Price
  halal: Halal
  /** Added by the user on this device, not part of the bundled data. */
  custom?: boolean
}

/** "Tampines MRT", or "Marina Centre · Promenade MRT" when the area has a different name. */
export function mallPlace(m: Pick<Mall, 'area' | 'mrt'>): string {
  return m.area === m.mrt ? `${m.mrt} MRT` : `${m.area} · ${m.mrt} MRT`
}

export interface Mall {
  id: string
  name: string
  region: Region
  area: string
  mrt: string
  address: string
  outlets: Outlet[]
}

/** Shape of the JSON files in `src/data/malls/`. */
export interface RawOutlet {
  name: string
  unit?: string
  cuisines: string[]
  type: string
  price: number
  halal: string
  halalSource?: string
}

export interface RawMall {
  id: string
  name: string
  region: string
  area: string
  mrt: string
  address: string
  sources?: string[]
  outlets: RawOutlet[]
}
