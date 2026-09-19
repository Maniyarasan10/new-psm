import { test, expect } from '@playwright/test';

test.describe('Debug Partner Page Alignment', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/partner');
    await page.waitForLoadState('networkidle');
  });

  test('debug bounding boxes', async ({ page }) => {
    // Check all elements with section-head class
    const sectionHeads = page.locator('.section-head');
    const count = await sectionHeads.count();
    console.log(`Found ${count} elements with .section-head class`);

    for (let i = 0; i < count; i++) {
      const el = sectionHeads.nth(i);
      const box = await el.boundingBox();
      const tagName = await el.evaluate(e => e.tagName);
      const className = await el.getAttribute('class');
      console.log(`  [${i}] ${tagName}.${className}:`, box);
    }

    // The container inside the first section
    const container = page.locator('section.section-head .container').first();
    const containerBox = await container.boundingBox();
    console.log('First Section Container Box:', containerBox);

    // Check the check-list
    const checkList = page.locator('.check-list').first();
    const checkListBox = await checkList.boundingBox();
    console.log('Check List Box:', checkListBox);
  });
});