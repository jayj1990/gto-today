import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config — keeps E2E scoped to the golden paths we care about
 * (signin guest flow, daily quiz start, mtt push-fold render).
 *
 * Runs against `pnpm dev` by default so tests exercise the real HMR
 * server; in CI we swap to the built server for determinism.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: /.+\.spec\.ts$/,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: process.env['CI'] ? 'github' : 'list',
  use: {
    baseURL: process.env['PLAYWRIGHT_BASE_URL'] ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
  },
  projects: [
    {
      name: 'chromium-mobile',
      use: { ...devices['iPhone 14 Pro'] },
    },
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
    // Don't tear the dev server down between runs locally — HMR is
    // already running when Jay starts tests from another terminal.
  },
});
