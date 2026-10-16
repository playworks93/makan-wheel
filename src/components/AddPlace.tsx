import { useState, type FormEvent } from 'react'
import { CUISINES, PRICE_LABELS, PRICES, type Cuisine, type Halal, type Outlet, type Price } from '../lib/types'

interface Props {
  onAdd: (place: Omit<Outlet, 'id' | 'custom'>) => void
}

/** Lets people add a place our list is missing. It is saved on this device only. */
export function AddPlace({ onAdd }: Props) {
  const [name, setName] = useState('')
  const [cuisine, setCuisine] = useState<Cuisine | ''>('')
  const [price, setPrice] = useState<Price>(2)
  const [halal, setHalal] = useState<Halal>('no')
  const [added, setAdded] = useState<string | null>(null)

  function submit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd({ name: trimmed, cuisines: cuisine ? [cuisine] : [], type: 'restaurant', price, halal })
    setAdded(trimmed)
    setName('')
  }

  return (
    <details className="panel add-place">
      <summary>Can't find a place? Add it yourself</summary>
      <form onSubmit={submit}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nasi Lemak Ayam Taliwang" required maxLength={60} />
        </label>
        <div className="form-row">
          <label>
            Cuisine
            <select value={cuisine} onChange={(e) => setCuisine(e.target.value as Cuisine | '')}>
              <option value="">Not sure</option>
              {CUISINES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Price
            <select value={price} onChange={(e) => setPrice(Number(e.target.value) as Price)}>
              {PRICES.map((p) => (
                <option key={p} value={p}>
                  {'$'.repeat(p)} ({PRICE_LABELS[p].replace(' a person', '')})
                </option>
              ))}
            </select>
          </label>
          <label>
            Halal
            <select value={halal} onChange={(e) => setHalal(e.target.value as Halal)}>
              <option value="no">No or not sure</option>
              <option value="certified">Halal-certified</option>
              <option value="muslim-owned">Muslim-owned</option>
            </select>
          </label>
        </div>
        <button type="submit" className="button">
          Add to the wheel
        </button>
        <p className="muted small" role="status">
          {added ? `Added ${added}. ` : ''}Places you add stay on this device only.
        </p>
      </form>
    </details>
  )
}
