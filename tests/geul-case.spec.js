const { test, expect } = require('@playwright/test');

// 글모험 상세 페이지 (projects/geul.html): Cuddle 페이지와 같은 틀에 글모험 사례 6개
const URL = '/projects/geul.html';
const LINKS = {
  'Live ↗': 'https://geulmoheom-web-six.vercel.app/parents/login',
  'GitHub ↗': 'https://github.com/jjub0217/geulmoheom',
};

test('geul-hero-links: 맨 위 버튼 2개가 맞는 주소로 새 탭에서 열린다', async ({ page }) => {
  await page.goto(URL);
  const links = page.locator('.case_links a');
  await expect(links).toHaveCount(2);
  for (let i = 0; i < 2; i++) {
    const a = links.nth(i);
    const text = (await a.textContent()).replace(/\s+/g, ' ').trim();
    expect(Object.keys(LINKS)).toContain(text);
    await expect(a).toHaveAttribute('href', LINKS[text]);
    await expect(a).toHaveAttribute('target', '_blank');
  }
});

test('geul-period: 기간이 보인다', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('.case_period')).toContainText('2026. 09 (24일)');
});

test('geul-toc: 목차 링크 4개가 사례를 가리킨다 (커밋 기록, 아이의 낱말은 빼기로 함)', async ({ page }) => {
  await page.goto(URL);
  const hrefs = await page.locator('.case_toc a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  expect(hrefs).toEqual(['#case-01', '#case-02', '#case-03', '#case-04']);
  for (const h of hrefs) await expect(page.locator(`article.case${h}`)).toHaveCount(1);
});

test('geul-fields-filled: 사례 4개의 다섯 칸이 모두 채워져 있다', async ({ page }) => {
  await page.goto(URL);
  for (let n = 1; n <= 4; n++) {
    for (const k of ['problem', 'cause', 'solution', 'verification', 'result']) {
      const t = await page.locator(`#case-0${n} [data-field="${k}"] p`).first().textContent();
      expect(t.trim().length, `사례 0${n} ${k}`).toBeGreaterThan(10);
    }
  }
});

test('geul-confirmed-wording: 확정한 세 곳의 문장이 들어가 있다', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#case-02 [data-field="verification"]')).toContainText('문서에 "버린 문장"으로 적어 둔 옛 문구');
});

test('geul-facts-unchanged: 숫자와 인용문이 그대로다', async ({ page }) => {
  await page.goto(URL);
  const body = await page.locator('main').innerText();
  for (const t of ['16건', '24일', '390, 360, 320px', '422', 'make check-copy', 'docs/문구.md',
    '내부 저장 규칙이 맞더라도 사용자 경험은 잘못되어 있습니다']) {
    expect(body, t).toContain(t);
  }
});

test('geul-no-ai-marks: 낫표, 가운뎃점, 줄표가 본문에 없다', async ({ page }) => {
  await page.goto(URL);
  const body = await page.locator('main').innerText();
  // 근거 칸의 코드는 저장소 원문이라 제외
  const prose = await page.locator('main').evaluate((m) => {
    const c = m.cloneNode(true);
    c.querySelectorAll('pre, code').forEach((e) => e.remove());
    return c.innerText;
  });
  expect(body.length).toBeGreaterThan(0);
  for (const ch of ['「', '」', '·', '—']) expect(prose.includes(ch), ch).toBe(false);
});

test('geul-two-column: 데스크톱은 2단, 휴대폰은 1단', async ({ page }) => {
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
    expect(rows.length).toBe(4);
    for (const r of rows) {
      if (twoCol) expect(r.eLeft).toBeGreaterThan(r.tRight);
      else expect(r.eTop).toBeGreaterThanOrEqual(r.tBottom);
    }
  }
});

for (const w of [1400, 990, 375, 320]) {
  test(`geul-no-horizontal-overflow: 가로 스크롤이 없다 @ ${w}px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(URL);
    const widths = await page.evaluate(() => ({ doc: document.scrollingElement.scrollWidth, body: document.body.scrollWidth }));
    expect(widths.doc).toBeLessThanOrEqual(w);
    expect(widths.body).toBeLessThanOrEqual(w);
  });
}

test('geul-images-load: 그림이 모두 불러와진다', async ({ page }) => {
  await page.goto(URL);
  const imgs = page.locator('main img');
  const n = await imgs.count();
  expect(n).toBeGreaterThanOrEqual(2);
  for (let i = 0; i < n; i++) {
    await imgs.nth(i).scrollIntoViewIfNeeded();
    await expect.poll(() => imgs.nth(i).evaluate((el) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
  }
});

test('geul-no-errors: 콘솔 오류가 없다', async ({ page }) => {
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL);
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});

test('geul-chrome: 메인과 같은 헤더와 푸터', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(URL);
  await expect(page.locator('.cs_header .logo')).toHaveAttribute('href', '../');
  await expect(page.locator('.cs_footer .headline')).toHaveText("Let's work with you.");
  await expect(page.locator('.cs_footer')).toHaveAttribute('lang', 'en');
});

test('geul-pdf-button: 맨 아래 PDF 버튼', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('a.case_pdf')).toHaveAttribute('href', '../assets/files/kang-joohyun-portfolio.pdf');
});

test('geul-card-links-to-detail: 메인의 글모험 카드는 같은 탭에서 상세 페이지로 간다', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('.section_work a.work_link[href="./projects/geul.html"]');
  await expect(card).toHaveCount(1);
  await expect(card).toContainText('글 모험');
  expect(await card.getAttribute('target')).toBeNull();
});

test('geul-no-commit-links: Cuddle과 같이 커밋 기록 링크는 없고, 결정 기록 문서만 사례 제목 아래에 있다', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('main a[href*="/commit/"]')).toHaveCount(0);
  await expect(page.locator('main .ev_refs')).toHaveCount(0);
  const docs = page.locator('.case_head .case_source a');
  await expect(docs).toHaveCount(2);
  await expect(page.locator('#case-01 .case_source a')).toHaveAttribute('href', /docs\/adr\/0008-/);
  await expect(page.locator('#case-04 .case_source a')).toHaveAttribute('href', /docs\/adr\/0017-/);
});

test('geul-review-fixes: AI 티 두 곳과 직접 쓰기 원인을 고친 문장, 커밋 기록과 아이의 낱말 제외', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#case-04 [data-field="cause"]')).toContainText('선택지 문장은 책에 들어가지 않아서');
  const body = await page.locator('main').innerText();
  for (const t of ['아이의 글이 아니라', '면적을 차지하는', '그 자체로 결함', '702 812', '대표 결정', '낯선 말을 다른 낯선 말로', '태엽새']) expect(body, t).not.toContain(t);
  await expect(page.locator('article.case')).toHaveCount(4);
});

test('geul-toc-2x2: 데스크톱 목차는 2단, 휴대폰은 1단', async ({ page }) => {
  for (const [w, cols] of [[1400, 2], [990, 2], [375, 1]]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(URL);
    const n = await page.locator('.toc_list').evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(n, `${w}px`).toBe(cols);
  }
});
