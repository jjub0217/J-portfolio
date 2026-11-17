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
  // 리디자인으로 페이지가 길어져 부드러운 이동이 1초 넘게 걸림: 도착 위치는 그대로 검사하고 기다리는 시간만 늘림
  await expect.poll(() => topOf(page, '#case-04'), { timeout: 3000, intervals: [100] }).toBeLessThanOrEqual(120);
  // 브라우저는 정수 픽셀로만 스크롤하므로 소수점 위치(-0.5px)까지 허용
  expect(await topOf(page, '#case-04')).toBeGreaterThanOrEqual(-1);
});

test('toc-reduced-motion: 움직임 줄이기 설정이면 바로 이동한다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(URL);
  await page.locator('.case_toc a[href="#case-04"]').click();
  await page.waitForTimeout(100);
  const top = await topOf(page, '#case-04');
  // 정수 픽셀 스크롤로 생기는 소수점 차이(-0.5px)까지 허용
  expect(top).toBeGreaterThanOrEqual(-1);
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

// Task 5~7: 사례 내용
const fieldsFilled = async (page, id) =>
  page.locator(`${id} .case_field`).evaluateAll((fs) =>
    fs.map((f) => [...f.children].filter((c) => c.tagName !== 'H3').map((c) => c.textContent.trim()).join(''))
  );

test('case01-numbers: 사례 01 숫자와 시도 순서 표', async ({ page }) => {
  await page.goto(URL);
  const card = page.locator('#case-01');
  for (const t of ['1.3초', '1.0초', '94', '0.4초', '0.9초', '0.008']) await expect(card).toContainText(t);
  await expect(card.locator('.case_steps tbody tr')).toHaveCount(4);
});

test('case02-numbers: 사례 02 숫자와 그림', async ({ page }) => {
  await page.goto(URL);
  const card = page.locator('#case-02');
  for (const t of ['8개', '646줄', '52~124줄', '7줄']) await expect(card).toContainText(t);
  const img = card.locator('.case_zoom img');
  await img.scrollIntoViewIfNeeded();
  await expect(img).toHaveAttribute('src', /admin-products\.jpg$/);
  await expect.poll(() => img.evaluate((el) => el.naturalWidth)).toBeGreaterThan(0);
});

test('ai-label: 사례 6개 모두 AI 도구 표시', async ({ page }) => {
  await page.goto(URL);
  for (const n of [1, 2, 3, 4, 5, 6]) await expect(page.locator(`#case-0${n} .case_ai`)).toHaveCount(1);
});

test('fields-filled: 사례 6개의 다섯 칸이 모두 채워져 있다', async ({ page }) => {
  await page.goto(URL);
  for (const n of [1, 2, 3, 4, 5, 6]) {
    const texts = await fieldsFilled(page, `#case-0${n}`);
    expect(texts.length).toBe(5);
    texts.forEach((t, i) => expect(t.length, `사례 0${n} 칸 ${i + 1}`).toBeGreaterThan(0));
  }
});

test('case03-before-after: 사례 03 지시문 고치기 전과 후', async ({ page }) => {
  await page.goto(URL);
  const card = page.locator('#case-03');
  await expect(card).toContainText('코드 품질, 잠재적 버그, 성능 이슈, 보안 취약점, 그리고 Next.js/React 모범 사례를 확인해주세요.');
  await expect(card).toContainText('실제 버그나 런타임 에러 가능성');
  await expect(card).toContainText('이론적으로만 가능한 엣지 케이스는 무시');
});

test('case04-numbers: 사례 04 테스트 수와 검사 설정 파일', async ({ page }) => {
  await page.goto(URL);
  const card = page.locator('#case-04');
  await expect(card).toContainText('테스트 파일 130개 이상');
  await expect(card).not.toContainText('136개');
  await expect(card.locator('.case_code figcaption')).toHaveText('.github/workflows/gate.yml');
});

test('case05-flow: 사례 05 고치기 전과 후 흐름', async ({ page }) => {
  await page.goto(URL);
  const card = page.locator('#case-05');
  await expect(card.locator('.case_flow')).toHaveCount(2);
  await expect(card).toContainText('방이 바뀔 때만');
});

test('case06-limits: 사례 06 한계와 멱등키', async ({ page }) => {
  await page.goto(URL);
  const card = page.locator('#case-06');
  for (const t of ['토스페이먼츠 테스트 모드', '취소, 환불, 웹훅은 하지 않', 'Idempotency-Key: confirm-', '서버 테스트 10개 이상']) await expect(card).toContainText(t);
  expect(await card.locator('a[href*="cmarket_api"]').count()).toBe(0);
});

// 최종 검토에서 나온 문제: dialog가 왼쪽 위에 붙고 닫기 버튼이 화면 위로 나감
for (const [w, h] of [[375, 700], [1400, 900]]) {
  test(`lightbox-visible-close: 크게 보기 창이 가운데에 있고 닫기 버튼이 보인다 @ ${w}px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(URL);
    await page.locator('.case_zoom').first().click();
    const box = await page.locator('dialog.case_lightbox[open]').boundingBox();
    const close = await page.locator('.lightbox_close').boundingBox();
    expect(Math.abs(box.x + box.width / 2 - w / 2)).toBeLessThanOrEqual(2);
    expect(close.y).toBeGreaterThanOrEqual(0);
    expect(close.x + close.width).toBeLessThanOrEqual(w);
    await page.locator('.lightbox_close').click();
    await expect(page.locator('dialog.case_lightbox[open]')).toHaveCount(0);
  });
}

test('case02-page-code: 사례 02에 7줄짜리 페이지 코드가 보인다', async ({ page }) => {
  await page.goto(URL);
  const fig = page.locator('#case-02 .case_code', { hasText: 'AdminProductsPage' });
  await expect(fig.locator('figcaption')).toHaveText('src/app/(admin)/admin/products/page.tsx');
  expect((await fig.locator('code').textContent()).split('\n').length).toBe(7);
});

test('toc-approx-count: 목차의 테스트 개수도 대략으로', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('.case_toc a[href="#case-04"] .toc_result')).toHaveText('테스트 파일 130개 이상');
});

// 메인과 같은 헤더, 푸터
test('chrome-header-links: 헤더 메뉴는 메인 페이지 각 구역으로 간다', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(URL);
  const hrefs = await page.locator('.cs_header .gnb .nav-item_title').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  expect(hrefs.slice(0, 5)).toEqual(['../index.html#about', '../index.html#work', '../index.html#capabilities', '../index.html#goals', '../index.html#log']);
  await expect(page.locator('.cs_header .logo')).toHaveAttribute('href', '../index.html');
  await expect(page.locator('.cs_header .header_actions .link_pdf')).toBeVisible();
  await expect(page.locator('.cs_header .header_actions .link_mail')).toBeVisible();
});

test('chrome-footer: 푸터에 메인과 같은 연락처, 경력, 교육이 있다', async ({ page }) => {
  await page.goto(URL);
  const f = page.locator('.cs_footer');
  await expect(f.locator('.headline')).toHaveText("Let's work with you.");
  for (const t of ['Profile', 'Career', 'Education', '2021 11 - 2023 02']) await expect(f).toContainText(t);
  await expect(f.locator('.link_pdf')).toHaveAttribute('href', '../assets/files/kang-joohyun-portfolio.pdf');
});

test('chrome-burger: 휴대폰 메뉴가 열리고 Esc로 닫힌다', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(URL);
  const btn = page.locator('.cs_header .btn_burger');
  await expect(page.locator('#nav')).toBeHidden();
  await btn.click();
  await expect(page.locator('#nav')).toBeVisible();
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(page.locator('#nav')).toBeHidden();
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
});
