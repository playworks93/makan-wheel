import { describe, expect, it } from 'vitest'
import { parseRoute, routeToHash, type Route } from './route'

describe('parseRoute', () => {
  it('falls back to the mall list', () => {
    expect(parseRoute('')).toEqual({ view: 'malls' })
    expect(parseRoute('#/')).toEqual({ view: 'malls' })
    expect(parseRoute('#/nonsense')).toEqual({ view: 'malls' })
  })

  it('reads mall and wheel routes', () => {
    expect(parseRoute('#/m/ion-orchard')).toEqual({ view: 'food', mallId: 'ion-orchard' })
    expect(parseRoute('#/m/ion-orchard/wheel')).toEqual({ view: 'wheel', mallId: 'ion-orchard' })
  })

  it('reads shared picks', () => {
    expect(parseRoute('#/m/jem/wheel?p=kfc&p=din-tai-fung&c=Auntie%27s+Nasi+Lemak')).toEqual({
      view: 'wheel',
      mallId: 'jem',
      shared: { ids: ['kfc', 'din-tai-fung'], custom: ["Auntie's Nasi Lemak"] },
    })
  })
})

describe('routeToHash', () => {
  it('round-trips every route', () => {
    const routes: Route[] = [
      { view: 'malls' },
      { view: 'food', mallId: 'vivocity' },
      { view: 'wheel', mallId: 'vivocity' },
      { view: 'wheel', mallId: 'vivocity', shared: { ids: ['a', 'b'], custom: ['Pasta & Co, level 2', 'x|y?'] } },
    ]
    for (const r of routes) expect(parseRoute(routeToHash(r))).toEqual(r)
  })
})
