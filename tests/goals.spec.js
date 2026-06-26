const { test, expect } = require('@playwright/test');

// goals 제목칸(title_box)이 콘텐츠에 맞는지 — 넘침(겹침/잘림) & 모바일 과한 공백 둘 다 검사
const widths = [375, 600, 707, 768, 900, 990, 1008, 1100, 1200];

for (const w of widths) {
  test(`goals 제목칸 콘텐츠 맞음 (공백·겹침 없음) @ ${w}px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto('/');
    await page.evaluate(() => {
      const g = document.querySelector('#goals, .section_goals');
      if (g) g.scrollIntoView();
    });
    await page.waitForTimeout(700);

    const bad = await page.evaluate((vw) => {
      const out = [];
      document.querySelectorAll('.section_goals .title_box').forEach((tb, i) => {
        const h = tb.getBoundingClientRect().height;
        const gt = tb.querySelector('.goal_title');
        const desc = tb.querySelector('.desc');
        const gapPx = parseInt(getComputedStyle(tb).rowGap) || 16;
        const content =
          (gt ? gt.getBoundingClientRect().height : 0) +
          (desc ? desc.getBoundingClientRect().height : 0) +
          gapPx;
        // ① 콘텐츠가 칸보다 크면 = 잘림/겹침 (모든 너비)
        if (content > h + 6) out.push(`#${i} 콘텐츠 넘침(내용 ${Math.round(content)} > 칸 ${Math.round(h)})`);
        // ② 모바일(<=990)에서 칸이 콘텐츠보다 과하게 크면 = 빈 공백
        if (vw <= 990 && h - content > 60) out.push(`#${i} 과한 공백 ${Math.round(h - content)}px`);
      });
      // desc가 화면 밖으로 넘침 (html overflow-x:hidden로 시각적으론 잘려도 실제 박스로 감지)
      const clientW = document.documentElement.clientWidth;
      document.querySelectorAll('.section_goals .desc').forEach((d, i) => {
        const r = d.getBoundingClientRect();
        if (r.right > clientW + 1) out.push(`#${i} desc 화면 넘침(right ${Math.round(r.right)} > ${clientW})`);
      });
      return out;
    }, w);

    expect(bad, `\n  ${w}px goals 문제:\n   - ${bad.join('\n   - ')}\n`).toEqual([]);
  });
}
