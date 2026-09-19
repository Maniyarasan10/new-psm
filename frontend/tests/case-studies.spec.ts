import { test, expect } from '@playwright/test';

test.describe('Case Studies Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/case-studies');
    await page.waitForLoadState('networkidle');
  });

  test('page loads without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('section header and content are properly aligned', async ({ page }) => {
    // The header inside the Section component's container
    const sectionHeader = page.locator('header.section-head');
    // The content container is the same container (Section's internal container)
    const contentContainer = page.locator('section.section-head .container');

    await expect(sectionHeader).toBeVisible();
    await expect(contentContainer).toBeVisible();

    // Get the content elements inside each container
    const headerContent = page.locator('header.section-head .section-title');
    const leadContent = page.locator('section.section-head .container .lead');

    await expect(headerContent).toBeVisible();
    await expect(leadContent).toBeVisible();

    const headerContentBox = await headerContent.boundingBox();
    const leadContentBox = await leadContent.boundingBox();

    expect(headerContentBox).not.toBeNull();
    expect(leadContentBox).not.toBeNull();

    if (headerContentBox && leadContentBox) {
      // Check horizontal alignment of content - both should start at similar x positions
      const xDiff = Math.abs(headerContentBox.x - leadContentBox.x);
      expect(xDiff).toBeLessThan(20); // Allow small difference for padding/margin
    }
  });

  test('overview and PSM engagement elements are visible', async ({ page }) => {
    const eyebrow = page.locator('header.section-head .eyebrow');
    const title = page.locator('header.section-head .section-title');
    const leadText = page.locator('section.section-head .container .lead');
    const accentCard = page.locator('section.section-head .container .accent-card');

    await expect(eyebrow).toBeVisible();
    await expect(title).toBeVisible();
    await expect(leadText).toBeVisible();
    await expect(accentCard).toBeVisible();

    // Check text content
    await expect(eyebrow).toHaveText('Overview');
    await expect(title).toHaveText('PSM Engagements.');
  });

  test('no horizontal overflow', async ({ page }) => {
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 1); // Allow 1px rounding
  });

  test('responsive layout at different viewports', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },  // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1440, height: 900 }, // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);

      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 1);
    }
  });

  test('page screenshot for visual regression', async ({ page }) => {
    await page.waitForTimeout(1000); // Wait for animations
    await expect(page).toHaveScreenshot('case-studies.png', {
      fullPage: true,
      threshold: 0.3,
    });
  });
});