import { useEffect, useMemo, useState } from 'react'
import { FoodBrowser } from './components/FoodBrowser'
import { Header } from './components/Header'
import { MallPicker } from './components/MallPicker'
import { WheelPage } from './components/WheelPage'
import { DATA_CHECKED, MALLS, MALLS_BY_ID } from './data/malls'
import { EMPTY_FILTERS, type Filters } from './lib/filter'
import { addCustom, setPicks, useStore } from './lib/store'
import { navigate, useRoute } from './lib/useRoute'
import type { Outlet } from './lib/types'

export default function App() {
  const route = useRoute()
  const store = useStore()
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)

  const mall = route.view === 'malls' ? undefined : MALLS_BY_ID[route.mallId]
  const outlets = useMemo<Outlet[]>(
    () => (mall ? [...mall.outlets, ...(store.custom[mall.id] ?? [])] : []),
    [mall, store.custom],
  )
  const picks = useMemo(() => {
    if (!mall) return []
    const known = new Set(outlets.map((o) => o.id))
    return (store.picks[mall.id] ?? []).filter((id) => known.has(id))
  }, [mall, outlets, store.picks])
  const entries = useMemo(
    () => picks.map((id) => outlets.find((o) => o.id === id)).filter((o): o is Outlet => !!o),
    [picks, outlets],
  )

  // A shared link carries its picks in the URL. Load them, then tidy the URL.
  useEffect(() => {
    if (route.view !== 'wheel' || !route.shared || !mall) return
    const known = new Set(mall.outlets.map((o) => o.id))
    setPicks(
      mall.id,
      route.shared.ids.filter((id) => known.has(id)),
    )
    for (const name of route.shared.custom.slice(0, 16))
      addCustom(mall.id, { name: name.slice(0, 60), cuisines: [], type: 'restaurant', price: 2, halal: 'no' })
    navigate({ view: 'wheel', mallId: mall.id }, true)
  }, [route, mall])

  useEffect(() => {
    document.title = mall ? `${mall.name} · Makan Wheel` : 'Makan Wheel · Where to eat in the mall'
  }, [mall])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route.view, mall])

  return (
    <div className="app">
      <Header route={route} canSpin={picks.length >= 2} />
      <main>
        {route.view === 'malls' && (
          <MallPicker
            malls={MALLS}
            picks={store.picks}
            onPick={(m) => {
              setFilters((f) => ({ ...f, query: '', cuisines: [] }))
              navigate({ view: 'food', mallId: m.id })
            }}
          />
        )}
        {route.view !== 'malls' && !mall && (
          <section className="page">
            <div className="intro">
              <h1>We don't know that mall</h1>
              <p>The link may be old, or the mall isn't on our list yet.</p>
            </div>
            <a className="button primary" href="#/">
              Pick a mall
            </a>
          </section>
        )}
        {route.view === 'food' && mall && (
          <FoodBrowser mall={mall} outlets={outlets} picks={picks} filters={filters} onFiltersChange={setFilters} />
        )}
        {route.view === 'wheel' && mall && !route.shared && <WheelPage key={mall.id} mall={mall} entries={entries} />}
      </main>
      <footer className={`footer${route.view === 'food' ? ' has-tray' : ''}`}>
        {store.saveFailed && (
          <p className="note">Your browser isn't saving your picks, so they'll be gone when you close this tab.</p>
        )}
        <p>
          Outlet lists were last checked in {DATA_CHECKED}, and shops come and go. Check the mall directory before you
          head over. For halal food, look for the MUIS certificate at the shop.
        </p>
      </footer>
    </div>
  )
}
