import { test, expect } from '@playwright/test';

test.describe('Authentication Flow E2E', () => {
  test('Login → Profile update → refresh user', async ({ page }) => {
    // 1. Navigate to login page
    await page.goto('/login');
    
    // 2. Fill in login credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // 3. Click login button
    await page.click('button[type="submit"]');
    
    // 4. Wait for navigation to home/dashboard
    await page.waitForURL('/', { timeout: 10000 });
    
    // 5. Navigate to profile page
    await page.goto('/profile');
    await page.waitForSelector('h1:has-text("Profile")');
    
    // 6. Click Edit button
    await page.click('button:has-text("Edit")');
    
    // 7. Update first name
    const firstNameInput = page.locator('input').first();
    await firstNameInput.fill('UpdatedName');
    
    // 8. Click Save
    await page.click('button:has-text("Save")');
    
    // 9. Wait for success state
    await page.waitForTimeout(1000);
    
    // 10. Refresh the page
    await page.reload();
    
    // 11. Verify the updated name persists
    await page.waitForSelector('text=UpdatedName');
  });
});
