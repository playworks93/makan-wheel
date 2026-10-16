import {
  CUISINES,
  HALAL,
  OUTLET_TYPES,
  PRICES,
  REGIONS,
  type Cuisine,
  type Halal,
  type Mall,
  type Outlet,
  type OutletType,
  type Price,
  type RawMall,
  type Region,
} from './types'

export function slugify(text: string): string {
  const slug = text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'place'
}

/** Give each item a stable id from its name; repeats get `-2`, `-3`, ... */
export function withIds<T extends { name: string }>(items: T[], prefix = ''): (T & { id: string })[] {
  const seen = new Map<string, number>()
  return items.map((item) => {
    const base = prefix + slugify(item.name)
    const n = (seen.get(base) ?? 0) + 1
    seen.set(base, n)
    return { ...item, id: n === 1 ? base : `${base}-${n}` }
  })
}

const byName = (a: { name: string }, b: { name: string }) =>
  a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })

export function normalizeMall(raw: RawMall): Mall {
  const outlets: Outlet[] = withIds([...raw.outlets].sort(byName)).map((o) => ({
    id: o.id,
    name: o.name.trim(),
    ...(o.unit ? { unit: o.unit.trim() } : {}),
    cuisines: o.cuisines.filter((c): c is Cuisine => (CUISINES as readonly string[]).includes(c)),
    type: o.type as OutletType,
    price: o.price as Price,
    halal: o.halal as Halal,
  }))
  return {
    id: raw.id,
    name: raw.name,
    region: raw.region as Region,
    area: raw.area,
    mrt: raw.mrt,
    address: raw.address,
    outlets,
  }
}

/** Returns a list of problems with a raw mall file; empty means it is fine. */
export function validateMall(raw: RawMall): string[] {
  const errors: string[] = []
  const where = raw.id || raw.name || '(unnamed mall)'
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(raw.id ?? '')) errors.push(`${where}: id must be kebab-case`)
  for (const key of ['name', 'area', 'mrt', 'address'] as const) {
    if (typeof raw[key] !== 'string' || !raw[key].trim()) errors.push(`${where}: missing ${key}`)
  }
  if (!(REGIONS as readonly string[]).includes(raw.region)) errors.push(`${where}: bad region "${raw.region}"`)
  if (!Array.isArray(raw.outlets) || raw.outlets.length === 0) {
    errors.push(`${where}: no outlets`)
    return errors
  }
  raw.outlets.forEach((o, i) => {
    const at = `${where} outlet ${i} (${o.name ?? '?'})`
    if (typeof o.name !== 'string' || !o.name.trim()) errors.push(`${at}: missing name`)
    if (!Array.isArray(o.cuisines) || o.cuisines.length === 0) errors.push(`${at}: needs at least one cuisine`)
    else
      for (const c of o.cuisines)
        if (!(CUISINES as readonly string[]).includes(c)) errors.push(`${at}: unknown cuisine "${c}"`)
    if (!(OUTLET_TYPES as readonly string[]).includes(o.type)) errors.push(`${at}: bad type "${o.type}"`)
    if (!(PRICES as readonly number[]).includes(o.price)) errors.push(`${at}: bad price "${o.price}"`)
    if (!(HALAL as readonly string[]).includes(o.halal)) errors.push(`${at}: bad halal "${o.halal}"`)
  })
  return errors
}
