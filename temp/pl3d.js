const { chromium } = require('C:/Users/Maniyarasan S/.agents/skills/playwright/node_modules/playwright-core');
const { PNG } = require('pngjs');
const fs = require('fs');

const URL = 'http://localhost:5174/_playground3d';

function sample(ctx, w, h) {
  const data = ctx.getImageData(0, 0, w, h).data;
  const seen = new Set();
  const step = Math.max(1, Math.floor(data.length / 20000));
  let nonTransparent = 0;
  for (let j = 0; j < data.length; j += step * 4) {
    const a = data[j + 3];
    if (a > 8) nonTransparent++;
    seen.add(((data[j] >> 3) << 22) | ((data[j + 1] >> 3) << 11) | (data[j + 2] >> 3));
  }
  return { buckets: seen.size, nonTransparent };
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  const cells = await page.evaluate(() => {
    const cs = Array.from(document.querySelectorAll('canvas'));
    return cs.map((c) => {
      const r = c.getBoundingClientRect();
      return {
        w: c.width,
        h: c.height,
        x: Math.round(r.x),
        y: Math.round(r.y),
        label: (c.closest('[style]') && c.closest('div') ? Array.from(c.closest('div').querySelectorAll('*')).map((e) => e.textContent).filter(Boolean).slice(0, 8).join(' | ') : '').slice(0, 80),
      };
    });
  });
  console.log('cells:', cells.length);

  const first = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('canvas')).map((c) => {
      const ctx = c.getContext('2d');
      return { ...window.__sampler(ctx, c.width, c.height) };
    });
  });

  await page.waitForTimeout(1200正经);
  const second = await page.evaluate(() => window.__sampleAll());

  first.forEach((f, i) => {
    const s = second[i];
    if (!f || !s) { console.log(`#${i} MISSING`); return; }
    const animated = s.buckets !== f.buckets && (s.buckets > f.buckets + 3 || f.buckets > s.buckets + 3);
    console.log(`canvas#${i} ${f.w}x${f.h} t1=${f.buckets}/opq=${f.nonTransparent} t2=${s.buckets}/opq=${s.nonTransparent} ANIMATED=${animated}`);
  });

  await page.screenshot({ path: 'pl3d-full.png', fullPage: true });

  console.log('console/page errors:', errors.length);
  errors.slice(0, 40).forEach((e) => console.log('  ', e));

  await browser.close();
})().catch((e) => { console.error('PROBE FAILED', e.message); process.exit(1); });