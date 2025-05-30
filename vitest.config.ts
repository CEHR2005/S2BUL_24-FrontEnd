import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      all: true,
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/main.ts', 'src/env.d.ts', 'node_modules/'],
      reportsDirectory: 'coverage'
    },
  },
});