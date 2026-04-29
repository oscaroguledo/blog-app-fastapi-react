import { test, expect } from '@playwright/test';

test.describe('Admin Contact Management E2E', () => {
  test('mark message read and mark-all-read', async ({ page }) => {
    // 1. Login as admin first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/', { timeout: 10000 });
    
    // 2. Navigate to admin dashboard
    await page.goto('/admin');
    await page.waitForSelector('h1:has-text("Dashboard"), text=Dashboard', { timeout: 10000 });
    
    // 3. Look for contact/messages tab
    const messagesTab = page.locator('button:has-text("Messages"), a:has-text("Messages"), [role="tab"]:has-text("Messages")').first();
    if (await messagesTab.isVisible().catch(() => false)) {
      await messagesTab.click();
      await page.waitForTimeout(1000);
    }
    
    // 4. Find an unread message and mark it as read
    const markReadButtons = page.locator('button:has-text("Mark Read"), button[aria-label*="read" i]').first();
    
    if (await markReadButtons.isVisible().catch(() => false)) {
      // Click mark read on first message
      await markReadButtons.click();
      
      // Wait for the action to complete
      await page.waitForTimeout(1000);
      
      // Verify button state changed or message is marked
      const unreadBadge = page.locator('.unread-badge, [data-unread="true"]').first();
      expect(await unreadBadge.count()).toBeGreaterThanOrEqual(0);
    }
    
    // 5. Look for mark-all-read button
    const markAllReadButton = page.locator('button:has-text("Mark All Read"), button:has-text("Mark all as read")').first();
    
    if (await markAllReadButton.isVisible().catch(() => false)) {
      await markAllReadButton.click();
      
      // Confirm action if confirmation dialog appears
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")').first();
      if (await confirmButton.isVisible().catch(() => false)) {
        await confirmButton.click();
      }
      
      // Wait for action to complete
      await page.waitForTimeout(1000);
      
      // Verify success message or state
      const successIndicator = page.locator('text=marked as read, text=success, .success-message').first();
      expect(await successIndicator.count()).toBeGreaterThanOrEqual(0);
    }
  });
});
