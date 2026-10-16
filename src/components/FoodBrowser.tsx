import { useMemo } from 'react'
import { cuisineCounts, filterOutlets, type Filters } from '../lib/filter'
import { addCustom, addPicks, MAX_PICKS, removeCustom, togglePick } from '../lib/store'
import { navigate } from '../lib/useRoute'
import { describeOutlet, mallPlace, type Mall, type Outlet } from '../lib/types'
import { AddPlace } from './AddPlace'
import { HalalBadge, PriceTag } from './Badges'
import { FilterBar } from './FilterBar'
import { PickTray } from './PickTray'

interface Props {
  mall: Mall
  outlets: Outlet[]
  picks: string[]
  filters: Filters
  onFiltersChange: (f: Filters) => void
}

export function FoodBrowser({ mall, outlets, picks, filters, onFiltersChange }: Props) {
  const shown = useMemo(() => filterOutlets(outlets, filters), [outlets, filters])
  const cuisines = useMemo(() => cuisineCounts(outlets), [outlets])
  const picked = useMemo(() => new Set(picks), [picks])
  const pickedOutlets = useMemo(
    () => picks.map((id) => outlets.find((o) => o.id === id)).filter((o): o is Outlet => !!o),
    [picks, outlets],
  )
  const full = picks.length >= MAX_PICKS
  const unpickedShown = shown.filter((o) => !picked.has(o.id))

  return (
    <>
      <section className="page has-tray">
        <div className="intro">
          <h1>{mall.name}</h1>
          <p className="muted">
            {mallPlace(mall)} · {mall.address}
          </p>
        </div>

        <FilterBar filters={filters} onChange={onFiltersChange} cuisines={cuisines} />

        <div className="results-head">
          <p aria-live="polite">
            {shown.length === outlets.length ? `${outlets.length} places` : `${shown.length} of ${outlets.length} places`}
          </p>
          {unpickedShown.length > 0 && !full && (
            <button
              type="button"
              className="link"
              onClick={() => addPicks(mall.id, unpickedShown.map((o) => o.id))}
            >
              {unpickedShown.length + picks.length <= MAX_PICKS
                ? `Add all ${unpickedShown.length} shown`
                : `Add the first ${MAX_PICKS - picks.length} shown`}
            </button>
          )}
        </div>
        {full && <p className="note">The wheel holds {MAX_PICKS} places. Take one off to add another.</p>}

        {shown.length === 0 ? (
          <p className="empty">
            Nothing matches those filters.{' '}
            <button type="button" className="link" onClick={() => onFiltersChange({ ...filters, query: '', cuisines: [], prices: [] })}>
              Loosen them
            </button>
          </p>
        ) : (
          <ul className="outlets">
            {shown.map((o) => (
              <OutletRow
                key={o.id}
                outlet={o}
                picked={picked.has(o.id)}
                disabled={full && !picked.has(o.id)}
                onToggle={() => togglePick(mall.id, o.id)}
                onDelete={o.custom ? () => removeCustom(mall.id, o.id) : undefined}
              />
            ))}
          </ul>
        )}

        <AddPlace onAdd={(place) => addCustom(mall.id, place)} />
      </section>

      <PickTray
        picks={pickedOutlets}
        onRemove={(id) => togglePick(mall.id, id)}
        onSpin={() => navigate({ view: 'wheel', mallId: mall.id })}
      />
    </>
  )
}

interface RowProps {
  outlet: Outlet
  picked: boolean
  disabled: boolean
  onToggle: () => void
  onDelete?: () => void
}

function OutletRow({ outlet: o, picked, disabled, onToggle, onDelete }: RowProps) {
  return (
    <li className="outlet" data-picked={picked || undefined}>
      <button type="button" className="outlet-main" aria-pressed={picked} disabled={disabled} onClick={onToggle}>
        <span className="outlet-text">
          <span className="outlet-name">{o.name}</span>
          <span className="muted small">{describeOutlet(o)}</span>
        </span>
        <span className="outlet-tags">
          <HalalBadge halal={o.halal} />
          <PriceTag price={o.price} />
        </span>
        <span className="tick" aria-hidden="true">
          {picked ? '✓' : '+'}
        </span>
      </button>
      {onDelete && (
        <button type="button" className="outlet-delete" aria-label={`Delete ${o.name}`} onClick={onDelete}>
          Delete
        </button>
      )}
    </li>
  )
}
