/** A random number in [0, 1) from the browser's crypto source, so every slice has a fair chance. */
export function secureRandom(): number {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0] / 2 ** 32
}

export function randomIndex(count: number, rand: () => number = secureRandom): number {
  if (count < 1) throw new Error('randomIndex needs at least one item')
  return Math.min(count - 1, Math.floor(rand() * count))
}

const mod = (n: number, m: number) => ((n % m) + m) % m

/**
 * Slices are laid out clockwise from 12 o'clock and the pointer sits at 12 o'clock.
 * Given the wheel's rotation in degrees (clockwise), returns the slice under the pointer.
 */
export function sliceAt(rotation: number, count: number): number {
  const size = 360 / count
  return Math.min(count - 1, Math.floor(mod(-rotation, 360) / size))
}

/**
 * The rotation to animate to so that slice `index` ends under the pointer.
 * It always turns forward from `current` by at least `turns` full spins, and
 * lands away from the slice edges so nobody argues about a borderline result.
 */
export function spinTarget(
  current: number,
  index: number,
  count: number,
  rand: () => number = secureRandom,
  turns = 5,
): number {
  const size = 360 / count
  const offset = size * (0.15 + 0.7 * rand())
  const wanted = mod(-(index * size + offset), 360)
  return current + turns * 360 + mod(wanted - mod(current, 360), 360)
}
