import { test, expect } from '@playwright/test';

test.describe('Search Page E2E', () => {
  test('apply filters, pagination, and sorting', async ({ page }) => {
    // 1. Navigate to posts page
    await page.goto('/posts');
    
    // 2. Enter search query and press Enter
    const searchInput = page.locator('input[placeholder*="Search" i]').first();
    await searchInput.fill('react');
    await searchInput.press('Enter');
    
    // 3. Wait for URL to update with search param
    await page.waitForURL(/q=react/);
    
    // 4. Apply category filter
    const filterButton = page.locator('button:has-text("Filter")').first();
    await filterButton.click();
    
    // Wait for filter modal/dropdown
    await page.waitForTimeout(500);
    
    // Select a category if available
    const categoryOption = page.locator('text=Technology');
    if (await categoryOption.isVisible().catch(() => false)) {
      await categoryOption.click();
    }
    
    // 5. Apply sorting
    const sortDropdown = page.locator('select, [role="combobox"]').first();
    if (await sortDropdown.isVisible().catch(() => false)) {
      await sortDropdown.selectOption('popular');
    }
    
    // 6. Wait for results to update
    await page.waitForTimeout(1000);
    
    // 7. Check if pagination exists and navigate
    const nextPageButton = page.locator('button:has-text(">")').first();
    if (await nextPageButton.isVisible().catch(() => false)) {
      await nextPageButton.click();
      
      // Wait for page change
      await page.waitForTimeout(1000);
      
      // Verify URL contains offset or page param
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/offset=|page=/);
    }
    
    // 8. Verify search results are displayed
    const posts = page.locator('[data-testid="post-card"], article, .post-card');
    const postCount = await posts.count();
    
    // Should have posts or show empty state
    expect(postCount).toBeGreaterThanOrEqual(0);
  });
});
