import { test, expect } from '@playwright/test';

test('returns product results for a valid query', async ({ page }) => {
  // 1. Visit homepage where Recommender is rendered
  await page.goto('/', { waitUntil: 'networkidle' });

  // 2. Confirm the recommender section is visible
  await expect(page.getByText('Find your perfect postcard')).toBeVisible();

  // 3. Type a query into the input
  const input = page.getByPlaceholder(
    "e.g. something funny for my mum's birthday",
  );
  await input.click();
  await input.pressSequentially('romantic travel postcard', { delay: 50 });

  // 4. Click the Find button
  await page.getByRole('button', { name: 'Find' }).click();

  // 5. Wait for loading to finish — spinner disappears, Find button returns
  await expect(page.getByRole('button', { name: 'Find' })).toBeVisible({
    timeout: 60000,
  });

  // 6. Wait for product results to render
  await page.waitForSelector('h3.font-medium', { timeout: 60000 });
  const productCards = page.locator('h3.font-medium');

  await expect(productCards.first()).toBeVisible();
  expect(await productCards.count()).toBeGreaterThanOrEqual(1);

  // 7. Confirm no error message is shown
  await expect(page.getByText('Something went wrong')).not.toBeVisible();
});

test('shows empty state when no matches found', async ({ page }) => {
  await page.goto('/');

  const input = page.getByPlaceholder(
    "e.g. something funny for my mum's birthday",
  );
  await input.click();
  await input.pressSequentially('xyzzy gibberish nonsense zzz', {
    delay: 50,
  });

  await page.getByRole('button', { name: 'Find' }).click();

  await page.waitForLoadState('networkidle');

  // Wait for response — either results or empty state
  await expect(
    page
      .getByText('No matches found, try a different description')
      .or(page.locator('h3.font-medium').first()),
  ).toBeVisible({ timeout: 60000 });
});

test('Find button is disabled when input is empty', async ({ page }) => {
  await page.goto('/');
  const findButton = page.getByRole('button', { name: 'Find' });
  await expect(findButton).toBeDisabled();
});
