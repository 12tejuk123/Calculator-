const { test, expect } = require('@playwright/test');
const path = require('path');

test('basic calculation flow', async ({ page }) => {
  const html = 'file:' + path.resolve(__dirname, '../../index.html');
  await page.goto(html);
  // press 1 2 + 3 = and assert result is 15? (12+3=15)
  await page.click('[data-value="1"]');
  await page.click('[data-value="2"]');
  await page.click('[data-value="+"]');
  await page.click('[data-value="3"]');
  await page.click('[data-action="equals"]');
  const display = await page.locator('#display').innerText();
  expect(display.trim()).toBe('15');
});
