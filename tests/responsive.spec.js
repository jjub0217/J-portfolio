const { test, expect } = require('@playwright/test');

// 검사할 화면 너비들 (1201~1450 사각지대 집중 포함)
const widths = [375, 600, 768, 990, 1100, 1206, 1280, 1322, 1450, 1600, 1920];

// log 제목이 log_list(카드 영역) 밖으로 삐져나오는지 — 내부 넘침 감지
for (const w of widths) {
  test(`log 제목이 카드 밖으로 안 넘침 @ ${w}px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(400);

    const bad = await page.evaluate(() => {
      const list = document.querySelector('.section_log .log_list');
      if (!list) return [];
      const listRight = list.getBoundingClientRect().right;
      const offenders = [];
      document.querySelectorAll('.section_log .title').forEach((t) => {
        const r = t.getBoundingClientRect();
        // 제목 박스 오른쪽 끝이 log_list 오른쪽 끝을 넘으면 = 삐져나옴
        if (r.right > listRight + 1) {
          offenders.push(
            `"${t.textContent.trim().slice(0, 14)}…" right=${Math.round(r.right)} > list ${Math.round(listRight)}`
          );
        }
      });
      return offenders;
    });

    expect(
      bad,
      `\n  ${w}px에서 제목이 카드 밖으로 넘침:\n   - ${bad.join('\n   - ')}\n`
    ).toEqual([]);
  });
}

for (const w of widths) {
  test(`가로 넘침 없어야 함 @ ${w}px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(400); // 폰트·레이아웃 안정 대기

    const result = await page.evaluate(() => {
      const doc = document.documentElement;
      const clientW = doc.clientWidth;
      // 뷰포트 오른쪽 경계를 넘는 요소(범인) 수집
      const offenders = [];
      document.querySelectorAll('*').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.right > clientW + 1 && r.width > 0) {
          const id = el.className
            ? `.${String(el.className).trim().split(/\s+/).join('.')}`
            : el.tagName.toLowerCase();
          offenders.push(`${id} (right=${Math.round(r.right)})`);
        }
      });
      return {
        scrollW: doc.scrollWidth,
        clientW,
        offenders: [...new Set(offenders)].slice(0, 8),
      };
    });

    expect(
      result.scrollW,
      `\n  ${w}px에서 가로 넘침! (scrollWidth ${result.scrollW} > clientWidth ${result.clientW})\n  범인 요소:\n   - ${result.offenders.join('\n   - ')}\n`
    ).toBeLessThanOrEqual(result.clientW);
  });
}
