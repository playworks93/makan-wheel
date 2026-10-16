import { describe, expect, it } from 'vitest'
import { normalizeMall, slugify, validateMall, withIds } from './data'
import { MALLS, RAW_MALLS } from '../data/malls'
import type { RawMall } from './types'

describe('slugify and withIds', () => {
  it('makes readable ids', () => {
    expect(slugify("McDonald's")).toBe('mcdonald-s')
    expect(slugify('Fish & Co.')).toBe('fish-and-co')
    expect(slugify('Café Ōno')).toBe('cafe-ono')
    expect(slugify('!!!')).toBe('place')
  })

  it('keeps repeated names apart', () => {
    expect(withIds([{ name: 'Starbucks' }, { name: 'Starbucks' }, { name: 'KFC' }]).map((o) => o.id)).toEqual([
      'starbucks',
      'starbucks-2',
      'kfc',
    ])
  })
})

describe('validateMall', () => {
  const good: RawMall = {
    id: 'test-mall',
    name: 'Test Mall',
    region: 'Central',
    area: 'Somewhere',
    mrt: 'Somewhere',
    address: '1 Test Road',
    outlets: [{ name: 'KFC', cuisines: ['Western'], type: 'fast-food', price: 1, halal: 'certified' }],
  }

  it('accepts a good file', () => {
    expect(validateMall(good)).toEqual([])
    expect(normalizeMall(good).outlets[0]).toEqual({
      id: 'kfc',
      name: 'KFC',
      cuisines: ['Western'],
      type: 'fast-food',
      price: 1,
      halal: 'certified',
    })
  })

  it('flags bad values', () => {
    const bad = {
      ...good,
      region: 'Mars',
      outlets: [{ name: 'X', cuisines: ['Martian'], type: 'stall', price: 4, halal: 'maybe' }],
    }
    expect(validateMall(bad)).toHaveLength(5)
  })
})

describe('bundled mall data', () => {
  it('has malls', () => {
    expect(RAW_MALLS.length).toBeGreaterThan(0)
  })

  it.each(RAW_MALLS.map((m) => [m.id, m] as const))('%s is valid', (_id, mall) => {
    expect(validateMall(mall)).toEqual([])
    expect(mall.outlets.length).toBeGreaterThanOrEqual(10)
  })

  it('uses unique mall ids', () => {
    const ids = MALLS.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
