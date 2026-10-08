import { test, expect } from '@playwright/test';

test.describe('Diagnostic Pass', () => {
  let consoleLogs: string[] = [];
  let consoleErrors: string[] = [];
  let networkErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleLogs = [];
    consoleErrors = [];
    networkErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else {
        consoleLogs.push(msg.text());
      }
    });

    page.on('response', response => {
      if (!response.ok()) {
        networkErrors.push(`${response.request().method()} ${response.url()} - ${response.status()}`);
      }
    });
  });

  test.afterEach(async ({}, testInfo) => {
    if (consoleErrors.length > 0) {
      console.log(`[${testInfo.title}] Console Errors:`, consoleErrors);
    }
    if (networkErrors.length > 0) {
      console.log(`[${testInfo.title}] Network Errors:`, networkErrors);
    }
  });

  test('Admin Login & Journey', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("Sign In")');

    await page.waitForURL('/admin');
    expect(page.url()).toContain('/admin');

    // Additional admin checks can go here
  });

  test('Student Login & Journey', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'student@demo.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("Sign In")');

    await page.waitForURL('/student/dashboard');
    expect(page.url()).toContain('/student/dashboard');
    
    // Additional student checks
  });

  test('Company Login & Journey', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'techcorp@demo.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("Sign In")');

    await page.waitForURL('/company');
    expect(page.url()).toContain('/company');
    
    // Additional company checks
  });
});
