import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/Live Meeting Notes/);
});

test('can sign in', async ({ page }) => {
  await page.goto('http://localhost:3000/auth/signin');
  // Fill in login details and click sign in
  // expect(page.url()).toContain('/dashboard');
});
