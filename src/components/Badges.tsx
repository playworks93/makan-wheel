import { PRICE_LABELS, type Halal, type Price } from '../lib/types'

export function PriceTag({ price }: { price: Price }) {
  return (
    <span className="price" title={PRICE_LABELS[price]}>
      <span aria-hidden="true">{'$'.repeat(price)}</span>
      <span className="sr-only">{PRICE_LABELS[price]}</span>
    </span>
  )
}

export function HalalBadge({ halal }: { halal: Halal }) {
  if (halal === 'certified')
    return (
      <span className="badge badge-halal" title="MUIS halal-certified. Look for the certificate at the shop.">
        Halal
      </span>
    )
  if (halal === 'muslim-owned')
    return (
      <span className="badge badge-muslim" title="Muslim-owned, but not MUIS halal-certified.">
        Muslim-owned
      </span>
    )
  return null
}
