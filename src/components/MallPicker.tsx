import { useMemo, useState } from 'react'
import { mallPlace, REGIONS, type Mall, type Region } from '../lib/types'

interface Props {
  malls: Mall[]
  picks: Record<string, string[]>
  onPick: (mall: Mall) => void
}

export function MallPicker({ malls, picks, onPick }: Props) {
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState<Region | null>(null)

  const regions = useMemo(() => REGIONS.filter((r) => malls.some((m) => m.region === r)), [malls])
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return malls.filter(
      (m) =>
        (!region || m.region === region) &&
        (!q || [m.name, m.area, m.mrt].some((t) => t.toLowerCase().includes(q))),
    )
  }, [malls, query, region])

  return (
    <section className="page">
      <div className="intro">
        <h1>Hungry, but can't decide?</h1>
        <p>Pick your mall, shortlist a few places, and let the wheel choose.</p>
      </div>

      <div className="panel filters">
        <label className="search">
          <span className="sr-only">Search malls</span>
          <input
            type="search"
            placeholder="Search by mall, area or MRT"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="chips" role="group" aria-label="Region">
          <button type="button" className="chip" aria-pressed={region === null} onClick={() => setRegion(null)}>
            All
          </button>
          {regions.map((r) => (
            <button
              key={r}
              type="button"
              className="chip"
              aria-pressed={region === r}
              onClick={() => setRegion(region === r ? null : r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="empty">
          No malls match that.{' '}
          <button type="button" className="link" onClick={() => (setQuery(''), setRegion(null))}>
            Show all malls
          </button>
        </p>
      ) : (
        <ul className="mall-grid">
          {shown.map((m) => {
            const picked = picks[m.id]?.length ?? 0
            return (
              <li key={m.id}>
                <button type="button" className="mall-card" onClick={() => onPick(m)}>
                  <span className="mall-name">{m.name}</span>
                  <span className="muted">{mallPlace(m)}</span>
                  <span className="mall-foot">
                    <span>{m.outlets.length} places to eat</span>
                    {picked > 0 && <span className="pill">{picked} on your wheel</span>}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
