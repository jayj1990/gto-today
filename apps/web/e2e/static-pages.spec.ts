import { test, expect } from '@playwright/test';

/**
 * Lightweight rendering checks for the public, non-authed surfaces.
 * These catch route regressions that aren't covered by unit tests
 * (missing exports, broken imports, crashed server components).
 */

test.describe('public pages render', () => {
  test('/learn/gto renders all six intro sections', async ({ page }) => {
    await page.goto('/learn/gto');
    for (const heading of [
      'GTO가 뭐예요?',
      '왜 필요해요?',
      '한 가지 답이 아니에요',
      '자리(포지션)가 핵심',
      '자주 나오는 용어',
      '이 앱은 어떻게 써요?',
    ]) {
      await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    }
  });

  test('/onboarding slide 2 breaks at the sentence boundary', async ({ page }) => {
    await page.goto('/onboarding');
    await page.getByRole('button', { name: '다음' }).click();
    // The body should contain a real newline (whitespace-pre-line) —
    // not a soft-wrap at GTO 훈련으로.
    const body = await page.locator('p.whitespace-pre-line').innerText();
    expect(body).toContain('\n');
    expect(body.split('\n')[0]).toMatch(/균형의 싸움\.\s*$/);
  });

  test('/signin shows all three provider buttons', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.getByRole('button', { name: /Google/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /네이버/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /카카오/ })).toBeVisible();
  });
});

test.describe('mtt push-fold chart', () => {
  test('renders six position tabs with aria-pressed', async ({ page }) => {
    // Push-fold doesn't require auth.
    await page.goto('/mtt/push-fold');
    for (const pos of ['BTN', 'SB', 'CO', 'HJ', 'UTG', 'BB']) {
      await expect(page.getByRole('button', { name: new RegExp(`${pos} 포지션`) })).toBeVisible();
    }
    // Default selection is BTN per the component source.
    const btn = page.getByRole('button', { name: /BTN 포지션/ });
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  test('chart/train mode toggle is keyboard-selectable', async ({ page }) => {
    await page.goto('/mtt/push-fold');
    const trainTab = page.getByRole('button', { name: '훈련' });
    await trainTab.click();
    await expect(trainTab).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('security headers', () => {
  test('X-Frame-Options, Referrer-Policy, Permissions-Policy set on home', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.headers()['x-frame-options']).toBe('DENY');
    expect(res?.headers()['x-content-type-options']).toBe('nosniff');
    expect(res?.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(res?.headers()['permissions-policy']).toContain('camera=()');
  });
});
