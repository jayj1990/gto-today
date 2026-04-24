import { test, expect } from '@playwright/test';

/**
 * Golden path: user lands on /today intro → clicks 훈련 시작 →
 * /today/play renders the first spot → user picks fold → result
 * sheet appears with the verdict. This is the primary daily flow
 * for the product; regressions here would be the single most
 * damaging thing that ships.
 */

const authedGuest = () => {
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
};

test('today intro → play → first answer shows a result sheet', async ({ page }) => {
  await page.addInitScript(authedGuest);

  await page.goto('/today');
  await expect(page.getByRole('heading', { name: '오늘의 훈련' })).toBeVisible();

  // CTA to the play flow. Link semantics — 'role=link' for Korean text.
  await page.getByRole('link', { name: /훈련 시작/ }).click();
  await page.waitForURL(/\/today\/play$/);

  // First spot loads — at least one action button should be clickable.
  // The button set varies by scenario (RFI has fold/raise, vs_open adds
  // call, etc.) so we pick whichever is present and known-safe to tap.
  const foldBtn = page.getByRole('button', { name: /^폴드$/ }).first();
  await expect(foldBtn).toBeVisible({ timeout: 10_000 });
  await foldBtn.click();

  // Preflop result sheet opens with a "다음" / "다음 핸드" CTA so the
  // user can advance. This is the ResultSheet component; keyboard
  // ESC also closes it, which we tested in the unit-lint pass.
  await expect(
    page.getByRole('dialog').getByRole('button', { name: /다음|결과|회고/ }),
  ).toBeVisible({ timeout: 5_000 });
});

test('home card shows "이어서 풀기" copy once a session is active', async ({ page }) => {
  // Seed a partial daily challenge so the home CTA reflects progress.
  await page.addInitScript(() => {
    const today = new Date().toISOString().slice(0, 10);
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
    window.localStorage.setItem(
      'gto.challenge',
      JSON.stringify({
        state: {
          dateKey: today,
          cursor: 3,
          currentStreak: 1,
          bestStreak: 1,
          answers: [],
          lifetimeAnswers: [],
        },
        version: 1,
      }),
    );
  });

  await page.goto('/');
  // The primary card should surface "Daily · 3/10 진행 중" eyebrow and
  // "이어서 풀기" body when cursor > 0 but < 10.
  await expect(page.getByText(/3\/10 진행 중/)).toBeVisible();
  await expect(page.getByText('이어서 풀기')).toBeVisible();
});
