// Playwright test configuration (minimal). Tests assume a local file open.
const { devices } = require('@playwright/test');
module.exports = {
  timeout: 30 * 1000,
  retries: 0,
  use: {
    headless: true,
    viewport: { width: 980, height: 720 }
  }
};
