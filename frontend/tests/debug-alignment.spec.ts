import { test, expect } from '@playwright/test';

test.describe('Debug Case Studies Alignment', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/case-studies');
    await page.waitForLoadState('networkidle');
  });

  test('debug bounding boxes of text elements', async ({ page }) => {
    // Section header elements
    const headerEyebrow = page.locator('header.section-head .eyebrow');
    const headerTitle = page.locator('header.section-head .section-title');

    // Content elements (now inside the Section's container)
    const leadText = page.locator('section.section-head .container .lead');
    const accentCard = page.locator('section.section-head .container .accent-card');

    const headerEyebrowBox = await headerEyebrow.boundingBox();
    const headerTitleBox = await headerTitle.boundingBox();
    const leadTextBox = await leadText.boundingBox();
    const accentCardBox = await accentCard.boundingBox();

    console.log('Header Eyebrow:', headerEyebrowBox);
    console.log('Header Title:', headerTitleBox);
    console.log('Lead Text:', leadTextBox);
    console.log('Accent Card:', accentCardBox);

    // Also check the containers
    const headerContainer = page.locator('header.section-head').locator('..'); // parent container
    const headerContainerBox = await headerContainer.boundingBox();
    console.log('Header Container:', headerContainerBox);

    const contentContainer = page.locator('section.section-head .container');
    const contentContainerBox = await contentContainer.boundingBox();
    console.log('Content Container:', contentContainerBox);
  });
});