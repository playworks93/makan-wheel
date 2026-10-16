const R = 96
const COLORS = ['#ffb703', '#8ecae6', '#f28482', '#90be6d', '#f6bd60', '#cdb4db', '#f4a261', '#84a59d']

interface Props {
  labels: { id: string; name: string }[]
  rotation: number
  /** How long the current turn animates, in ms. 0 jumps straight there. */
  duration: number
  winnerId: string | null
}

export function Wheel({ labels, rotation, duration, winnerId }: Props) {
  const n = labels.length
  const size = 360 / Math.max(n, 1)
  const font = n <= 4 ? 10 : n <= 8 ? 8.5 : n <= 12 ? 7 : 6
  const maxChars = Math.floor((R - 26) / (0.56 * font))

  return (
    <div className="wheel-wrap">
      <svg className="wheel" viewBox="-100 -100 200 200" role="img" aria-label={`Wheel with ${n} places`}>
        <circle r="99" className="wheel-rim" />
        <g
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: duration ? `transform ${duration}ms cubic-bezier(0.15, 0.6, 0.1, 1)` : 'none',
          }}
          className="wheel-face"
        >
          {labels.map((l, i) => (
            <g key={l.id} opacity={winnerId && winnerId !== l.id ? 0.35 : 1}>
              <path d={slicePath(i, n)} fill={sliceColor(i, n)} />
              <text
                transform={`rotate(${i * size + size / 2 - 90})`}
                x={R - 8}
                y={0}
                textAnchor="end"
                dominantBaseline="central"
                fontSize={font}
                className="wheel-label"
              >
                {truncate(l.name, maxChars)}
              </text>
            </g>
          ))}
        </g>
        <circle r="13" className="wheel-hub" />
      </svg>
      <div className="wheel-pointer" aria-hidden="true" />
    </div>
  )
}

function point(deg: number): string {
  const rad = (deg * Math.PI) / 180
  return `${(R * Math.sin(rad)).toFixed(3)} ${(-R * Math.cos(rad)).toFixed(3)}`
}

/** Slice `i` of `n`, drawn clockwise from 12 o'clock. */
function slicePath(i: number, n: number): string {
  if (n === 1) return `M 0 ${-R} A ${R} ${R} 0 1 1 0 ${R} A ${R} ${R} 0 1 1 0 ${-R} Z`
  const size = 360 / n
  const large = size > 180 ? 1 : 0
  return `M 0 0 L ${point(i * size)} A ${R} ${R} 0 ${large} 1 ${point((i + 1) * size)} Z`
}

function sliceColor(i: number, n: number): string {
  // Keep the last slice from matching the first one it touches.
  if (n > 1 && i === n - 1 && i % COLORS.length === 0) return COLORS[3]
  return COLORS[i % COLORS.length]
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`
}
