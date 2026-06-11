import { test, expect } from '@playwright/test';
test('loads dashboard page', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByText('Dashboard')).toBeVisible();
});
test('displays metric cards', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByText('Forecast Accuracy')).toBeVisible();
});
