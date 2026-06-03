import { test, expect } from '@playwright/test';

test.describe('Auth middleware', () => {
  test('unauthenticated user is redirected from /checkout to /login', async ({
    page,
  }) => {
    // 1. Visit /checkout without a session
    await page.goto('/checkout');

    // 2. Confirm redirect happened to /login
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain('/login');

    // 3. Confirm callbackUrl is set correctly in the query string
    expect(page.url()).toContain('callbackUrl=%2Fcheckout');

    // 4. Confirm the login page actually rendered
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('unauthenticated user cannot access /checkout directly', async ({
    page,
  }) => {
    // Attempt direct navigation — should never land on /checkout
    await page.goto('/checkout');
    await page.waitForURL(/\/login/);
    expect(page.url()).not.toContain('/checkout');
  });
});
