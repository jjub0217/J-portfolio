const { test } = require('@playwright/test');

// 모바일~데스크탑 전 구간에서 가로로 넘치는 요소를 자동 수집
test('전 페이지 가로 넘침 스캔 (모바일~데스크탑)', async ({ page }) => {
  const widths = [375, 414, 600, 768, 990, 1100, 1206, 1280, 1322, 1450, 1600, 1920];
  // 의도된 넘침(마퀴)은 제외
  const IGNORE = ['marauee_area', 'capabilities_list', 'capabilities_item'];

  for (const w of widths) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(300);

    const offenders = await page.evaluate((IGNORE) => {
      const clientW = document.documentElement.clientWidth;
      const out = [];
      document.querySelectorAll('body *').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width <= 0) return;
        if (r.right > clientW + 1) {
          const cls = String(el.className || '');
          if (IGNORE.some((i) => cls.includes(i))) return;
          const first = cls.trim().split(/\s+/)[0];
          const sel = el.tagName.toLowerCase() + (first ? '.' + first : '');
          out.push(`${sel}(right=${Math.round(r.right)})`);
        }
      });
      return [...new Set(out)].slice(0, 8);
    }, IGNORE);

    console.log(
      `[${String(w).padStart(4)}px] ${offenders.length ? '⚠  ' + offenders.join('  ') : '✓ 넘침 없음'}`
    );
  }
});
