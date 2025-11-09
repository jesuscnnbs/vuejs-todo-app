import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['api/**/*.test.ts'],
    globals: true,
    setupFiles: ['./api/__tests__/setup.ts'],
    pool: 'forks',
    testTimeout: 30000,
  },
})
