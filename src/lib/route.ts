export type Route =
  | { view: 'malls' }
  | { view: 'food'; mallId: string }
  | { view: 'wheel'; mallId: string; shared?: SharedPicks }

/** Picks carried in a shared wheel link. `custom` holds names of places the sender added by hand. */
export interface SharedPicks {
  ids: string[]
  custom: string[]
}

/**
 * Hash routes:
 *   #/                         mall list
 *   #/m/<mall>                 food list for a mall
 *   #/m/<mall>/wheel?p=..&c=.. the wheel, optionally with shared picks
 */
export function parseRoute(hash: string): Route {
  const raw = hash.replace(/^#/, '')
  const [path, query = ''] = raw.split('?', 2)
  const parts = path.split('/').filter(Boolean).map(safeDecode)
  if (parts[0] !== 'm' || !parts[1]) return { view: 'malls' }
  const mallId = parts[1]
  if (parts[2] !== 'wheel') return { view: 'food', mallId }
  const params = new URLSearchParams(query)
  const ids = params.getAll('p').filter(Boolean)
  const custom = params
    .getAll('c')
    .map((c) => c.trim())
    .filter(Boolean)
  return ids.length || custom.length
    ? { view: 'wheel', mallId, shared: { ids, custom } }
    : { view: 'wheel', mallId }
}

export function routeToHash(route: Route): string {
  if (route.view === 'malls') return '#/'
  const base = `#/m/${encodeURIComponent(route.mallId)}`
  if (route.view === 'food') return base
  if (!route.shared) return `${base}/wheel`
  const params = new URLSearchParams()
  route.shared.ids.forEach((id) => params.append('p', id))
  route.shared.custom.forEach((name) => params.append('c', name))
  return `${base}/wheel?${params}`
}

function safeDecode(part: string): string {
  try {
    return decodeURIComponent(part)
  } catch {
    return part
  }
}
