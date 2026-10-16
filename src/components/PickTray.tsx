import type { Outlet } from '../lib/types'

interface Props {
  picks: Outlet[]
  onRemove: (id: string) => void
  onSpin: () => void
}

export function PickTray({ picks, onRemove, onSpin }: Props) {
  const hint =
    picks.length === 0 ? 'Tap places to put them on the wheel.' : picks.length === 1 ? 'Add one more to spin.' : null

  return (
    <div className="tray" role="region" aria-label="Your wheel">
      <div className="tray-inner">
        <div className="tray-picks">
          {hint && <p className="muted">{hint}</p>}
          {picks.length > 0 && (
            <ul className="tray-list">
              {picks.map((o) => (
                <li key={o.id} className="tray-chip">
                  <span>{o.name}</span>
                  <button type="button" aria-label={`Take ${o.name} off the wheel`} onClick={() => onRemove(o.id)}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="button" className="button primary" disabled={picks.length < 2} onClick={onSpin}>
          Spin the wheel{picks.length > 0 ? ` (${picks.length})` : ''}
        </button>
      </div>
    </div>
  )
}
