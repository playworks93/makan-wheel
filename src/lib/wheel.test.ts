import { describe, expect, it } from 'vitest'
import { randomIndex, sliceAt, spinTarget } from './wheel'

describe('sliceAt', () => {
  it('reads the slice under the 12 o’clock pointer', () => {
    // 4 slices of 90°. At rest, slice 0 spans 0°..90° clockwise from the top,
    // so the pointer sits on its leading edge.
    expect(sliceAt(0, 4)).toBe(0)
    // Turning the wheel clockwise by 10° brings the last slice under the pointer.
    expect(sliceAt(10, 4)).toBe(3)
    expect(sliceAt(-10, 4)).toBe(0)
    expect(sliceAt(-100, 4)).toBe(1)
    expect(sliceAt(360 * 3 - 10, 4)).toBe(0)
  })
})

describe('spinTarget', () => {
  it('lands on the chosen slice for every slice count and start angle', () => {
    let seed = 1
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }
    for (let count = 2; count <= 20; count++) {
      for (let index = 0; index < count; index++) {
        const current = rand() * 5000 - 1000
        const target = spinTarget(current, index, count, rand)
        expect(sliceAt(target, count)).toBe(index)
        expect(target - current).toBeGreaterThanOrEqual(5 * 360)
        expect(target - current).toBeLessThan(6 * 360)
      }
    }
  })

  it('keeps clear of slice edges', () => {
    const size = 360 / 6
    for (const r of [0, 0.5, 0.999999]) {
      const target = spinTarget(0, 2, 6, () => r)
      const intoSlice = ((-target % 360) + 360) % 360 - 2 * size
      expect(intoSlice).toBeGreaterThanOrEqual(size * 0.15 - 1e-9)
      expect(intoSlice).toBeLessThanOrEqual(size * 0.85 + 1e-9)
    }
  })
})

describe('randomIndex', () => {
  it('stays in range at the extremes', () => {
    expect(randomIndex(5, () => 0)).toBe(0)
    expect(randomIndex(5, () => 0.9999999)).toBe(4)
    expect(randomIndex(1, () => 0.5)).toBe(0)
  })

  it('throws on an empty wheel', () => {
    expect(() => randomIndex(0)).toThrow()
  })

  it('gives every slice a fair share with the real random source', () => {
    const counts = [0, 0, 0, 0]
    for (let i = 0; i < 40000; i++) counts[randomIndex(4)]++
    for (const c of counts) expect(c).toBeGreaterThan(9000)
  })
})
