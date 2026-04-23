import { test, expect } from '@playwright/test';

/**
 * Golden path: first-time visitor reaches home via the '나중에' guest
 * session. Verifies the signin-loop fix (sesssion-sync was wiping the
 * zustand store whenever next-auth returned unauthenticated) stays
 * fixed. If this test ever fails, the regression is the loop — the
 * user ends up back on /signin after clicking 나중에.
 */
test('nuxEskips signin via 나중에 and lands on home', async ({ page }) => {
  // Pre-seed zustand so we skip the onboarding intro; the persist
  // middleware uses localStorage 'gto.auth'.
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'gto.auth',
      JSON.stringify({
        state: { onboarded: true, signedIn: false, user: null },
        version: 1,
      }),
    );
  });

  await page.goto('/signin');
  await expect(page.getByRole('heading', { name: /로그인하고/ })).toBeVisible();

  await page.getByRole('button', { name: '나중에' }).click();

  // URL goes to / and home content renders (game-type options, not
  // the signin CTA).
  await page.waitForURL('/');
  await expect(page.getByRole('link', { name: /오늘의 훈련/ })).toBeVisible();

  // Header should display the guest name. The store writes '게스트'
  // on the `method: 'guest'` sign-in path.
  await expect(page.getByRole('link', { name: /내 계정/ })).toBeVisible();
});

test('home shows preflop prefetch hints in head', async ({ page }) => {
  // Same seed — need to be on the authed home, not the onboarding gate.
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'gto.auth',
      JSON.stringify({
        state: {
          onboarded: true,
          signedIn: true,
          user: { method: 'guest', name: '게스트', signedInAt: Date.now() },
        },
        version: 1,
      }),
    );
  });

  await page.goto('/');
  // React 19 hoists the <link rel="prefetch"> elements we dropped into
  // home-gate.tsx straight into <head>. This ensures the warm-cache
  // strategy survives refactors.
  const prefetchHrefs = await page.$$eval('head link[rel="prefetch"]', (links) =>
    links.map((l) => (l as HTMLLinkElement).href),
  );
  expect(prefetchHrefs.some((h) => h.endsWith('/data/preflop/manifest.json'))).toBe(true);
});
