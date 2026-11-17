const { test, expect } = require('@playwright/test');

// Cuddle Market 상세 페이지 (projects/cuddle.html)
const URL = '/projects/cuddle.html';
const LINKS = {
  'Live ↗': 'https://cuddle-market.vercel.app/',
  'Admin Demo ↗':
    'https://cuddle-market-git-feature-admin-demo-mode-jjub0217s-projects.vercel.app/admin',
  'GitHub ↗': 'https://github.com/jjub0217/cuddle-market',
};

test('hero-links: 맨 위 버튼 3개가 맞는 주소로 새 탭에서 열린다', async ({ page }) => {
  await page.goto(URL);
  const links = page.locator('.case_links a');
  await expect(links).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    const a = links.nth(i);
    const text = (await a.textContent()).replace(/\s+/g, ' ').trim();
    expect(Object.keys(LINKS)).toContain(text);
    await expect(a).toHaveAttribute('href', LINKS[text]);
    await expect(a).toHaveAttribute('target', '_blank');
  }
});

test('info-block: 기간이 보인다', async ({ page }) => {
  await page.goto(URL);
  await expect(page.getByText('2025. 08 ~ 2026. 11')).toBeVisible();
});

test('toc-targets-exist: 목차 링크 6개가 사례 카드를 가리킨다', async ({ page }) => {
  await page.goto(URL);
  const hrefs = await page.locator('.case_toc a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  expect(hrefs).toEqual(['#case-01', '#case-02', '#case-03', '#case-04', '#case-05', '#case-06']);
  for (const h of hrefs) await expect(page.locator(`article.case${h}`)).toHaveCount(1);
});

async function topOf(page, sel) {
  return page.locator(sel).evaluate((el) => el.getBoundingClientRect().top);
}

test('toc-smooth-scroll: 목차를 누르면 해당 사례로 이동한다', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(URL);
  await page.locator('.case_toc a[href="#case-04"]').click();
  await expect.poll(() => topOf(page, '#case-04'), { timeout: 1500 }).toBeLessThanOrEqual(120);
  expect(await topOf(page, '#case-04')).toBeGreaterThanOrEqual(0);
});

test('toc-reduced-motion: 움직임 줄이기 설정이면 바로 이동한다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(URL);
  await page.locator('.case_toc a[href="#case-04"]').click();
  await page.waitForTimeout(100);
  const top = await topOf(page, '#case-04');
  expect(top).toBeGreaterThanOrEqual(0);
  expect(top).toBeLessThanOrEqual(120);
});

test('two-column-desktop: 데스크톱은 2단, 휴대폰은 1단', async ({ page }) => {
  for (const [w, twoCol] of [[1400, true], [375, false]]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(URL);
    const rows = await page.locator('article.case').evaluateAll((cards) =>
      cards.map((c) => {
        const t = c.querySelector('.case_text').getBoundingClientRect();
        const e = c.querySelector('.case_evidence').getBoundingClientRect();
        return { tRight: t.right, tBottom: t.bottom, eLeft: e.left, eTop: e.top };
      })
    );
    expect(rows.length).toBe(6);
    for (const r of rows) {
      if (twoCol) expect(r.eLeft).toBeGreaterThan(r.tRight);
      else expect(r.eTop).toBeGreaterThanOrEqual(r.tBottom);
    }
  }
});

for (const w of [1400, 990, 375, 320]) {
  test(`no-horizontal-overflow: 가로 스크롤이 없다 @ ${w}px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(URL);
    const widths = await page.evaluate(() => ({
      doc: document.scrollingElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    expect(widths.doc).toBeLessThanOrEqual(w);
    expect(widths.body).toBeLessThanOrEqual(w);
  });
}

test('pdf-button: 맨 아래 PDF 버튼', async ({ page }) => {
  await page.goto(URL);
  const a = page.locator('a.case_pdf');
  await expect(a).toHaveAttribute('href', '../assets/files/kang-joohyun-portfolio.pdf');
  await expect(a).toHaveAttribute('target', '_blank');
});

test('no-main-js: main.js를 불러오지 않고 콘솔 오류가 없다', async ({ page }) => {
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  const scripts = [];
  page.on('request', (r) => r.resourceType() === 'script' && scripts.push(r.url()));
  await page.goto(URL);
  await page.waitForTimeout(500);
  expect(scripts.some((u) => u.endsWith('/main.js'))).toBe(false);
  expect(errors).toEqual([]);
});

// Task 3: 코드 복사, 그림 크게 보기
test('code-copy: 복사 버튼이 코드 글자를 클립보드에 넣고 상태를 알린다', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(URL);
  const fig = page.locator('.case_code').first();
  const btn = fig.locator('.code_copy');
  await btn.click();
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  expect(clip).toBe(await fig.locator('code').textContent());
  await expect(btn).toHaveText('복사됨');
  await expect(btn).toHaveText('복사', { timeout: 3000 });
});

test('lightbox-open: 그림을 누르면 크게 보인다', async ({ page }) => {
  await page.goto(URL);
  const zoom = page.locator('.case_zoom').first();
  const src = await zoom.locator('img').getAttribute('src');
  await zoom.click();
  const dlg = page.locator('dialog.case_lightbox[open]');
  await expect(dlg).toHaveCount(1);
  await expect(dlg.locator('img')).toHaveAttribute('src', src);
});

test('lightbox-keyboard: Enter로 열고 Esc로 닫으면 초점이 돌아온다', async ({ page }) => {
  await page.goto(URL);
  const zoom = page.locator('.case_zoom').first();
  await zoom.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('dialog.case_lightbox[open]')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog.case_lightbox[open]')).toHaveCount(0);
  expect(await zoom.evaluate((el) => el === document.activeElement)).toBe(true);
});
