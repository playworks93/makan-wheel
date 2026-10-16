import { useMemo, useSyncExternalStore } from 'react'
import { parseRoute, routeToHash, type Route } from './route'

function subscribe(listener: () => void) {
  window.addEventListener('hashchange', listener)
  return () => window.removeEventListener('hashchange', listener)
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  return useMemo(() => parseRoute(hash), [hash])
}

/** Goes to a route. `replace` swaps the current history entry so Back skips it. */
export function navigate(route: Route, replace = false) {
  const hash = routeToHash(route)
  if (!replace) {
    window.location.hash = hash
    return
  }
  window.history.replaceState(null, '', hash)
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}

export function routeUrl(route: Route): string {
  const { origin, pathname, search } = window.location
  return `${origin}${pathname}${search}${routeToHash(route)}`
}
