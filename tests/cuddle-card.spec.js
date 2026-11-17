const { test, expect } = require('@playwright/test');
const baseline = require('./fixtures/work-cards-baseline.json');

// 메인 페이지 Cuddle 카드: 상세 페이지 연결 + 관리자 데모 배지를 카드 링크 밖의 별도 링크로 분리
const ADMIN_DEMO =
  'https://cuddle-market-git-feature-admin-demo-mode-jjub0217s-projects.vercel.app/admin';
const cuddleCard = '.section_work .work_link';
const badge = '.section_work .admin_badge';

test('card-links-to-detail: Cuddle 카드는 같은 탭에서 상세 페이지로 간다', async ({ page }) => {
  await page.goto('/');
  const card = page.locator(cuddleCard).first();
  await expect(card).toHaveAttribute('href', './projects/cuddle.html');
  expect(await card.getAttribute('target')).toBeNull();
});

test('badge-is-separate-link: 배지는 카드 링크 밖의 진짜 링크다', async ({ page }) => {
  await page.goto('/');
  const info = await page.evaluate(() => {
    const b = document.querySelector('.section_work .admin_badge');
    return {
      tag: b.tagName,
      insideCard: !!b.closest('.work_link'),
      href: b.getAttribute('href'),
      target: b.getAttribute('target'),
    };
  });
  expect(info.tag).toBe('A');
  expect(info.insideCard).toBe(false);
  expect(info.href).toBe(ADMIN_DEMO);
  expect(info.target).toBe('_blank');
  await expect(page.getByRole('link', { name: /관리자 데모/ })).toHaveCount(1);
});

test('keyboard-reaches-both: Tab으로 카드 다음 배지, Enter로 데모가 열린다', async ({ page, context }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto('/');
  await page.locator(cuddleCard).first().focus();
  await page.keyboard.press('Tab');
  const focusedIsBadge = await page.evaluate(() =>
    document.activeElement.classList.contains('admin_badge')
  );
  expect(focusedIsBadge).toBe(true);
  // 외부 주소로 실제 접속하지 않도록 요청을 막고, 열리려는 주소만 확인
  await context.route('**/*vercel.app/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: '<p>stub</p>' })
  );
  const [popup] = await Promise.all([context.waitForEvent('page'), page.keyboard.press('Enter')]);
  expect(popup.url()).toContain('cuddle-market-git-feature-admin-demo-mode');
});

for (const w of [1400, 990, 375]) {
  test(`card-layout-unchanged: 카드 7개와 배지 위치가 그대로 @ ${w}px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(800);
    const now = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('.section_work .work_link')].map((a) => {
        const r = a.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
      });
      const thumb = document.querySelector('.section_work .work_link .thumb_box').getBoundingClientRect();
      const b = document.querySelector('.section_work .admin_badge').getBoundingClientRect();
      return {
        cards,
        badge: { right: Math.round(thumb.right - b.right), bottom: Math.round(thumb.bottom - b.bottom), width: Math.round(b.width), height: Math.round(b.height) },
      };
    });
    const base = baseline[w];
    expect(now.cards.length).toBe(base.cards.length);
    now.cards.forEach((c, i) => {
      for (const k of ['x', 'y', 'width', 'height']) {
        expect(Math.abs(c[k] - base.cards[i][k]), `카드 ${i + 1} ${k}`).toBeLessThanOrEqual(1);
      }
    });
    for (const k of ['right', 'bottom', 'width', 'height']) {
      expect(Math.abs(now.badge[k] - base.badge[k]), `배지 ${k}`).toBeLessThanOrEqual(1);
    }
  });
}

test('badge-hover-no-title-shift: 배지에 올리면 제목이 밀리지 않는다', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto('/');
  const title = page.locator(cuddleCard).first().locator('.title');
  await page.locator(badge).first().scrollIntoViewIfNeeded();
  await page.locator(badge).first().hover();
  await page.waitForTimeout(600);
  expect(await title.evaluate((el) => getComputedStyle(el).marginLeft)).toBe('0px');
  await page.locator(cuddleCard).first().locator('.thumb_box').hover({ position: { x: 40, y: 40 } });
  await page.waitForTimeout(600);
  expect(await title.evaluate((el) => getComputedStyle(el).marginLeft)).toBe('10px');
});
