import { activeFilterCount, EMPTY_FILTERS, toggle, type Filters, type HalalFilter } from '../lib/filter'
import { PRICE_LABELS, PRICES, type Cuisine } from '../lib/types'

const HALAL_OPTIONS: { value: HalalFilter; label: string; title: string }[] = [
  { value: 'any', label: 'Any', title: 'Show every place' },
  { value: 'halal', label: 'Halal', title: 'MUIS halal-certified only' },
  { value: 'muslim', label: 'Halal or Muslim-owned', title: 'Certified, or run by Muslims without a certificate' },
]

interface Props {
  filters: Filters
  onChange: (f: Filters) => void
  cuisines: { cuisine: Cuisine; count: number }[]
}

export function FilterBar({ filters, onChange, cuisines }: Props) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch })
  const active = activeFilterCount(filters)

  return (
    <div className="panel filters">
      <label className="search">
        <span className="sr-only">Search places</span>
        <input
          type="search"
          placeholder="Search places, food or unit"
          value={filters.query}
          onChange={(e) => set({ query: e.target.value })}
        />
      </label>

      <div className="filter-row">
        <span className="filter-label" id="halal-label">
          Halal
        </span>
        <div className="segmented" role="radiogroup" aria-labelledby="halal-label">
          {HALAL_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={filters.halal === o.value}
              title={o.title}
              onClick={() => set({ halal: o.value })}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-row">
        <span className="filter-label" id="price-label">
          Price
        </span>
        <div className="chips" role="group" aria-labelledby="price-label">
          {PRICES.map((p) => (
            <button
              key={p}
              type="button"
              className="chip"
              aria-pressed={filters.prices.includes(p)}
              title={PRICE_LABELS[p]}
              onClick={() => set({ prices: toggle(filters.prices, p) })}
            >
              {'$'.repeat(p)}
              <span className="sr-only"> {PRICE_LABELS[p]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="filter-row filter-row-top">
        <span className="filter-label" id="cuisine-label">
          Cuisine
        </span>
        <div className="chips chips-scroll" role="group" aria-labelledby="cuisine-label">
          {cuisines.map(({ cuisine, count }) => (
            <button
              key={cuisine}
              type="button"
              className="chip"
              aria-pressed={filters.cuisines.includes(cuisine)}
              onClick={() => set({ cuisines: toggle(filters.cuisines, cuisine) })}
            >
              {cuisine} <span className="chip-count">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {active > 0 && (
        <button type="button" className="link clear" onClick={() => onChange(EMPTY_FILTERS)}>
          Clear {active === 1 ? 'filter' : `${active} filters`}
        </button>
      )}
    </div>
  )
}
