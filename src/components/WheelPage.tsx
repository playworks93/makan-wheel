import { useEffect, useRef, useState } from 'react'
import { setPicks, togglePick } from '../lib/store'
import { navigate, routeUrl } from '../lib/useRoute'
import { randomIndex, spinTarget } from '../lib/wheel'
import { describeOutlet, type Mall, type Outlet } from '../lib/types'
import { HalalBadge, PriceTag } from './Badges'
import { Wheel } from './Wheel'

const SPIN_MS = 5000
const REDUCED_MS = 400

interface Props {
  mall: Mall
  entries: Outlet[]
}

export function WheelPage({ mall, entries }: Props) {
  const [rotation, setRotation] = useState(0)
  const [duration, setDuration] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winnerId, setWinnerId] = useState<string | null>(null)
  const [shareNote, setShareNote] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const winner = entries.find((o) => o.id === winnerId) ?? null

  function spin(list: Outlet[] = entries) {
    if (spinning || list.length < 2) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const index = randomIndex(list.length)
    const ms = reduced ? 0 : SPIN_MS
    setWinnerId(null)
    setShareNote(null)
    setSpinning(true)
    setDuration(ms)
    setRotation((r) => spinTarget(r, index, list.length))
    timer.current = window.setTimeout(
      () => {
        setSpinning(false)
        setDuration(0)
        setWinnerId(list[index].id)
      },
      reduced ? REDUCED_MS : ms + 100,
    )
  }

  function dropAndSpin() {
    if (!winner) return
    const rest = entries.filter((o) => o.id !== winner.id)
    togglePick(mall.id, winner.id)
    if (rest.length === 1) setWinnerId(rest[0].id)
    else spin(rest)
  }

  function remove(id: string) {
    if (spinning) return
    // The slices move when one goes, so the old result no longer lines up with the pointer.
    setWinnerId(null)
    togglePick(mall.id, id)
  }

  async function share() {
    const url = routeUrl({
      view: 'wheel',
      mallId: mall.id,
      shared: {
        ids: entries.filter((o) => !o.custom).map((o) => o.id),
        custom: entries.filter((o) => o.custom).map((o) => o.name),
      },
    })
    try {
      if (navigator.share) {
        await navigator.share({ title: `Where to eat at ${mall.name}?`, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setShareNote('Link copied. Send it to your friends so they can spin the same wheel.')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setShareNote(`Copy this link: ${url}`)
    }
  }

  if (entries.length < 2) {
    return (
      <section className="page">
        <div className="intro">
          <h1>{mall.name}</h1>
          <p>You need at least two places on the wheel to spin it.</p>
        </div>
        <button type="button" className="button primary" onClick={() => navigate({ view: 'food', mallId: mall.id })}>
          Choose places
        </button>
      </section>
    )
  }

  return (
    <section className="page wheel-page">
      <div className="intro">
        <h1>Where to eat at {mall.name}?</h1>
        <p className="muted">{entries.length} places on the wheel. Every slice has the same chance.</p>
      </div>

      <Wheel labels={entries} rotation={rotation} duration={duration} winnerId={winnerId} />

      <div className="result" aria-live="polite">
        {winner ? (
          <div className="panel result-card">
            <p className="eyebrow">The wheel says</p>
            <h2>{winner.name}</h2>
            <p className="muted">{describeOutlet(winner)}</p>
            <p className="result-tags">
              <HalalBadge halal={winner.halal} />
              <PriceTag price={winner.price} />
            </p>
          </div>
        ) : (
          spinning && <p className="spinning-note">Spinning…</p>
        )}
      </div>

      <div className="wheel-actions">
        {winner ? (
          <>
            <button type="button" className="button primary" onClick={() => spin()}>
              Spin again
            </button>
            <button type="button" className="button" onClick={dropAndSpin}>
              Not this one
            </button>
          </>
        ) : (
          <button type="button" className="button primary big" disabled={spinning} onClick={() => spin()}>
            {spinning ? 'Spinning…' : 'Spin!'}
          </button>
        )}
      </div>

      <div className="panel">
        <div className="results-head">
          <h2 className="h3">On the wheel</h2>
          <button type="button" className="link" onClick={share} disabled={spinning}>
            Share this wheel
          </button>
        </div>
        {shareNote && (
          <p className="note" role="status">
            {shareNote}
          </p>
        )}
        <ul className="entry-list">
          {entries.map((o) => (
            <li key={o.id} data-winner={o.id === winnerId || undefined}>
              <span>{o.name}</span>
              <button
                type="button"
                className="link"
                aria-label={`Take ${o.name} off the wheel`}
                disabled={spinning}
                onClick={() => remove(o.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <div className="row-gap">
          <button type="button" className="button" onClick={() => navigate({ view: 'food', mallId: mall.id })} disabled={spinning}>
            Add more places
          </button>
          <button type="button" className="link" onClick={() => setPicks(mall.id, [])} disabled={spinning}>
            Clear the wheel
          </button>
        </div>
      </div>
    </section>
  )
}
