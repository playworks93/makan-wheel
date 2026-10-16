# Makan Wheel: notes for Claude Code

A static React + TypeScript + Vite app. Pick a Singapore mall, shortlist food,
spin a wheel. No backend.

## Commands

- `npm run dev`: dev server on port 5173
- `npm test`: Vitest unit tests, including a check on every mall JSON file
- `npm run lint`: ESLint, zero warnings allowed
- `npm run build`: type-check, then build to `dist/`

Run lint, test and build before calling a change done. CI (`.github/workflows/ci.yml`)
runs the same three.

## Git

Work on a branch and open a pull request. Don't push straight to `main`.

## Where things live

- `src/data/malls/*.json`: one file per mall, loaded with `import.meta.glob`.
  `validateMall` in `src/lib/data.ts` defines what's allowed.
- `src/lib/`: plain logic with tests next to it (`*.test.ts`).
- `src/components/`: React screens. `App.tsx` picks the screen from the URL hash.

## Rules

- **Halal data:** mark `certified` or `muslim-owned` only with a source, and put
  the source in `halalSource`. When unsure, use `no`. A false "halal" is far
  worse than a missing one.
- **Wheel math:** slices run clockwise from 12 o'clock and the pointer sits at
  12 o'clock. `spinTarget` and `sliceAt` in `src/lib/wheel.ts` must agree; the
  tests check every slice count from 2 to 20.
- **Storage can fail** (private mode, full quota). `save` returns `false`; the
  footer warns the user. Never let it throw.
- **Respect `prefers-reduced-motion`:** the wheel jumps to the result instead
  of spinning.
- Vitest's on-disk module cache (`fsModuleCache`) is off on purpose: it hid new
  mall files from `import.meta.glob`.
