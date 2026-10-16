import type { Route } from '../lib/route'
import { navigate } from '../lib/useRoute'

const STEPS = [
  { view: 'malls', label: 'Mall' },
  { view: 'food', label: 'Food' },
  { view: 'wheel', label: 'Spin' },
] as const

export function Header({ route, canSpin }: { route: Route; canSpin: boolean }) {
  const mallId = route.view === 'malls' ? null : route.mallId
  const current = STEPS.findIndex((s) => s.view === route.view)

  function go(view: (typeof STEPS)[number]['view']) {
    if (view === 'malls') navigate({ view: 'malls' })
    else if (mallId) navigate({ view, mallId })
  }

  return (
    <header className="header">
      <a className="brand" href="#/">
        <Logo />
        <span>Makan Wheel</span>
      </a>
      <nav aria-label="Steps">
        <ol className="steps">
          {STEPS.map((s, i) => {
            const enabled = s.view === 'malls' || (mallId !== null && (s.view === 'food' || canSpin))
            return (
              <li key={s.view}>
                <button
                  type="button"
                  className="step"
                  aria-current={i === current ? 'step' : undefined}
                  disabled={!enabled || i === current}
                  onClick={() => go(s.view)}
                >
                  <span className="step-num">{i + 1}</span>
                  {s.label}
                </button>
              </li>
            )
          })}
        </ol>
      </nav>
    </header>
  )
}

function Logo() {
  return (
    <svg className="logo" viewBox="-12 -12 24 24" aria-hidden="true">
      <circle r="11" fill="var(--accent)" />
      <path d="M0 0 L0 -11 A11 11 0 0 1 9.53 -5.5 Z" fill="var(--wheel-2)" />
      <path d="M0 0 L9.53 5.5 A11 11 0 0 1 0 11 Z" fill="var(--wheel-2)" />
      <path d="M0 0 L-9.53 5.5 A11 11 0 0 1 -9.53 -5.5 Z" fill="var(--wheel-2)" />
      <circle r="3" fill="var(--surface)" />
    </svg>
  )
}
