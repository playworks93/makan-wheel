import { normalizeMall } from '../lib/data'
import type { Mall, RawMall } from '../lib/types'

/** Every JSON file in ./malls is one mall. Add a file there to add a mall. */
export const RAW_MALLS: RawMall[] = Object.values(
  import.meta.glob<RawMall>('./malls/*.json', { eager: true, import: 'default' }),
)

export const MALLS: Mall[] = RAW_MALLS.map(normalizeMall).sort((a, b) => a.name.localeCompare(b.name))

export const MALLS_BY_ID: Record<string, Mall> = Object.fromEntries(MALLS.map((m) => [m.id, m]))

/** When the outlet lists were last checked against mall directories. */
export const DATA_CHECKED = 'October 2026'
