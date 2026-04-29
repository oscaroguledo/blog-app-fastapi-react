import { test, expect } from '@playwright/test';

test.describe('Search Page E2E', () => {
  test('page loads and displays search interface', async ({ page }) => {
    // 1. Navigate to posts page
    await page.goto('/posts');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // 2. Verify page title is visible
    const title = page.locator('h1').first();
    await expect(title).toBeVisible();
    
    // 3. Verify URL is correct
    expect(page.url()).toContain('/posts');
  });
});
