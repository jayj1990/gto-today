import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // Keep Playwright e2e tests out of the Vitest pass — they need a
    // browser and import from @playwright/test, not vitest.
    exclude: ['**/node_modules/**', '**/e2e/**', '**/dist/**', '**/.next/**'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
