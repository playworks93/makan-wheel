import { describe, expect, it } from 'vitest'
import { activeFilterCount, cuisineCounts, EMPTY_FILTERS, filterOutlets, toggle } from './filter'
import { describeOutlet, type Outlet } from './types'

const outlets: Outlet[] = [
  { id: 'mcd', name: "McDonald's", cuisines: ['Western'], type: 'fast-food', price: 1, halal: 'certified' },
  { id: 'dtf', name: 'Din Tai Fung', unit: '#B2-01', cuisines: ['Chinese'], type: 'restaurant', price: 2, halal: 'no' },
  { id: 'nasi', name: 'Nasi Padang Corner', cuisines: ['Malay', 'Indonesian'], type: 'restaurant', price: 1, halal: 'muslim-owned' },
  { id: 'cafe', name: 'Café Ōno', cuisines: ['Cafe', 'Western'], type: 'cafe', price: 3, halal: 'no' },
]

const names = (list: Outlet[]) => list.map((o) => o.id)

describe('filterOutlets', () => {
  it('returns everything with no filters', () => {
    expect(names(filterOutlets(outlets, EMPTY_FILTERS))).toEqual(['mcd', 'dtf', 'nasi', 'cafe'])
  })

  it('separates certified halal from Muslim-owned', () => {
    expect(names(filterOutlets(outlets, { ...EMPTY_FILTERS, halal: 'halal' }))).toEqual(['mcd'])
    expect(names(filterOutlets(outlets, { ...EMPTY_FILTERS, halal: 'muslim' }))).toEqual(['mcd', 'nasi'])
  })

  it('treats several prices or cuisines as "any of these"', () => {
    expect(names(filterOutlets(outlets, { ...EMPTY_FILTERS, prices: [1, 3] }))).toEqual(['mcd', 'nasi', 'cafe'])
    expect(names(filterOutlets(outlets, { ...EMPTY_FILTERS, cuisines: ['Malay', 'Chinese'] }))).toEqual(['dtf', 'nasi'])
  })

  it('combines different filters with "and"', () => {
    expect(names(filterOutlets(outlets, { ...EMPTY_FILTERS, cuisines: ['Western'], prices: [1] }))).toEqual(['mcd'])
  })

  it('searches name, unit, cuisine and type, ignoring case and accents', () => {
    expect(names(filterOutlets(outlets, { ...EMPTY_FILTERS, query: 'cafe ono' }))).toEqual(['cafe'])
    expect(names(filterOutlets(outlets, { ...EMPTY_FILTERS, query: '#b2' }))).toEqual(['dtf'])
    expect(names(filterOutlets(outlets, { ...EMPTY_FILTERS, query: 'indonesian' }))).toEqual(['nasi'])
    expect(names(filterOutlets(outlets, { ...EMPTY_FILTERS, query: 'FAST food' }))).toEqual(['mcd'])
  })
})

describe('cuisineCounts', () => {
  it('counts cuisines in the standard order', () => {
    expect(cuisineCounts(outlets)).toEqual([
      { cuisine: 'Chinese', count: 1 },
      { cuisine: 'Malay', count: 1 },
      { cuisine: 'Indonesian', count: 1 },
      { cuisine: 'Western', count: 2 },
      { cuisine: 'Cafe', count: 1 },
    ])
  })
})

describe('helpers', () => {
  it('counts active filters', () => {
    expect(activeFilterCount(EMPTY_FILTERS)).toBe(0)
    expect(activeFilterCount({ query: ' x ', halal: 'halal', prices: [1, 2], cuisines: ['Thai'] })).toBe(5)
  })

  it('toggles items in a list', () => {
    expect(toggle([1, 2], 2)).toEqual([1])
    expect(toggle([1], 2)).toEqual([1, 2])
  })
})

describe('describeOutlet', () => {
  it('skips the type when a cuisine already says it', () => {
    expect(describeOutlet(outlets[1])).toBe('Chinese · Restaurant · #B2-01')
    expect(describeOutlet({ ...outlets[3], cuisines: ['Cafe'] })).toBe('Cafe')
    expect(describeOutlet({ ...outlets[0], custom: true })).toBe('Western · Added by you')
  })
})
