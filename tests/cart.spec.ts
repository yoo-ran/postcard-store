import { test, expect } from '@playwright/test';

test.describe('Cart flow', () => {
  test.beforeAll(async ({ browser }) => {
    // Optional: Health check before tests
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/', { waitUntil: 'networkidle' });
    await context.close();
  });

  test('browse products → add to cart → verify cart', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/', { waitUntil: 'networkidle' });

    // 2. Confirm at least one product card is visible
    const firstProduct = page
      .locator('h3.font-medium, [class*="product"]')
      .first();
    await expect(firstProduct).toBeVisible();
    await page.waitForSelector('h3.font-medium', { timeout: 10000 });

    // 3. Get the product name so we can assert it in the cart later
    const productName = await firstProduct.textContent();

    // 4. Click "Add to cart" on the first product card
    const addToCartButton = page
      .getByRole('button', { name: 'Add to cart' })
      .first();
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();

    // 5. Confirm Navbar cart badge updates to 1
    const cartLink = page.getByRole('link', { name: /Cart \(1\)/ });
    await expect(cartLink).toBeVisible();

    // 6. Navigate to /cart
    await cartLink.click();
    await page.waitForURL('/cart');

    // 7. Confirm the product appears in the cart
    await expect(page.getByText(productName!)).toBeVisible();

    // 8. Confirm quantity shows 1
    await expect(
      page.locator('span.w-8.text-center', { hasText: '1' }),
    ).toBeVisible();
  });

  test('cart is empty by default', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.getByText('Your cart is empty')).toBeVisible();
  });
});
