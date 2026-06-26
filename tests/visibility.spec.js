const { test, expect } = require('@playwright/test');

// 각 섹션의 주요 콘텐츠가 크기 0으로 찌부러져 안 보이는 일이 없는지 검사
const widths = [375, 600, 768, 900, 952, 990, 1100, 1280, 1450];

const TARGETS = [
  '.section_about .text_area',
  '.section_about .thumb_area',
  '.section_log .log_list',
  '.section_goals .text_box',
  '.section_work .works_area',
];

for (const w of widths) {
  test(`주요 콘텐츠 안 찌부러짐 @ ${w}px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(400);

    const hidden = await page.evaluate((TARGETS) => {
      const out = [];
      TARGETS.forEach((sel) => {
        const el = document.querySelector(sel);
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) {
          out.push(`${sel} (${Math.round(r.width)}x${Math.round(r.height)})`);
        }
      });
      return out;
    }, TARGETS);

    expect(hidden, `\n  ${w}px에서 안 보이는(크기 0) 요소:\n   - ${hidden.join('\n   - ')}\n`).toEqual([]);
  });
}
