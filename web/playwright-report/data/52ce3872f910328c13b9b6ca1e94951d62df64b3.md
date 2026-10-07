# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: diagnostic.spec.ts >> Diagnostic Pass >> Company Login & Journey
- Location: tests/diagnostic.spec.ts:61:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/login
Call log:
  - navigating to "http://localhost:5173/login", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Diagnostic Pass', () => {
  4  |   let consoleLogs: string[] = [];
  5  |   let consoleErrors: string[] = [];
  6  |   let networkErrors: string[] = [];
  7  | 
  8  |   test.beforeEach(async ({ page }) => {
  9  |     consoleLogs = [];
  10 |     consoleErrors = [];
  11 |     networkErrors = [];
  12 | 
  13 |     page.on('console', msg => {
  14 |       if (msg.type() === 'error') {
  15 |         consoleErrors.push(msg.text());
  16 |       } else {
  17 |         consoleLogs.push(msg.text());
  18 |       }
  19 |     });
  20 | 
  21 |     page.on('response', response => {
  22 |       if (!response.ok()) {
  23 |         networkErrors.push(`${response.request().method()} ${response.url()} - ${response.status()}`);
  24 |       }
  25 |     });
  26 |   });
  27 | 
  28 |   test.afterEach(async ({}, testInfo) => {
  29 |     if (consoleErrors.length > 0) {
  30 |       console.log(`[${testInfo.title}] Console Errors:`, consoleErrors);
  31 |     }
  32 |     if (networkErrors.length > 0) {
  33 |       console.log(`[${testInfo.title}] Network Errors:`, networkErrors);
  34 |     }
  35 |   });
  36 | 
  37 |   test('Admin Login & Journey', async ({ page }) => {
  38 |     await page.goto('/login');
  39 |     await page.fill('input[type="email"]', 'admin@test.com');
  40 |     await page.fill('input[type="password"]', 'password');
  41 |     await page.click('button:has-text("Sign In")');
  42 | 
  43 |     await page.waitForURL('/admin/companies');
  44 |     expect(page.url()).toContain('/admin/companies');
  45 | 
  46 |     // Additional admin checks can go here
  47 |   });
  48 | 
  49 |   test('Student Login & Journey', async ({ page }) => {
  50 |     await page.goto('/login');
  51 |     await page.fill('input[type="email"]', 'student@test.com');
  52 |     await page.fill('input[type="password"]', 'password');
  53 |     await page.click('button:has-text("Sign In")');
  54 | 
  55 |     await page.waitForURL('/student/opportunities');
  56 |     expect(page.url()).toContain('/student/opportunities');
  57 |     
  58 |     // Additional student checks
  59 |   });
  60 | 
  61 |   test('Company Login & Journey', async ({ page }) => {
> 62 |     await page.goto('/login');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/login
  63 |     await page.fill('input[type="email"]', 'company@test.com');
  64 |     await page.fill('input[type="password"]', 'password');
  65 |     await page.click('button:has-text("Sign In")');
  66 | 
  67 |     await page.waitForURL('/company');
  68 |     expect(page.url()).toContain('/company');
  69 |     
  70 |     // Additional company checks
  71 |   });
  72 | });
  73 | 
```