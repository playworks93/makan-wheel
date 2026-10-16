import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/**/*.test.ts'],
    // The on-disk module cache misses new files picked up by import.meta.glob,
    // so a freshly added mall file would skip the data checks.
    fsModuleCache: false,
  },
})
