const { test, expect } = require('@playwright/test');

// Trovely, Wavve, jjub-headless-ui, claude-code-skills 상세 페이지: Cuddle, 글모험과 같은 틀
const PAGES = [
  {
    url: '/projects/trovely.html', card: 'Trovely', cases: 3,
    links: { 'Live ↗': 'https://trovely.vercel.app', 'GitHub ↗': 'https://github.com/jjub0217/trovely' },
    facts: ['.env.local', '최대 3번', '0.4ms', '18ms', '14ms', '캐싱 코드 0줄', 'AI 도구의 제안으로'],
  },
  {
    url: '/projects/wavve.html', card: 'Wavve', cases: 2,
    links: { 'Live ↗': 'https://jjub0217.github.io/wavve_github.io/', 'GitHub ↗': 'https://github.com/jjub0217/wavve_github.io' },
    facts: ['252개', '74개', 'AI 도구로 번역 초안을 만들고', 'region 역할', '검토해 확정한 일본어 제목이 들어갔습니다'],
    banned: ['직접 번역'],
  },
  {
    url: '/projects/headless-ui.html', card: 'jjub-headless-ui', cases: 2,
    links: {
      'npm ↗': 'https://www.npmjs.com/package/jjub-headless-ui',
      'Storybook ↗': 'https://jjub-headless-ui.vercel.app/?path=/docs/introduction--docs',
      'GitHub ↗': 'https://github.com/jjub0217/jjub-headless-ui',
    },
    facts: ['20종', 'AI 도구와 함께', 'ESM, CommonJS'],
  },
  {
    url: '/projects/claude-code-skills.html', card: 'claude-code-skills', cases: 2,
    links: { 'GitHub ↗': 'https://github.com/jjub0217/claude-code-skills' },
    facts: ['11종', 'Claude Code와 함께', '테스트 시나리오 24개'],
  },
];

for (const p of PAGES) {
  test.describe(p.url, () => {
    test('hero-links: 맨 위 버튼이 맞는 주소로 새 탭에서 열린다', async ({ page }) => {
      await page.goto(p.url);
      const links = page.locator('.case_links a');
      await expect(links).toHaveCount(Object.keys(p.links).length);
      for (let i = 0; i < Object.keys(p.links).length; i++) {
        const a = links.nth(i);
        const text = (await a.textContent()).replace(/\s+/g, ' ').trim();
        expect(Object.keys(p.links)).toContain(text);
        await expect(a).toHaveAttribute('href', p.links[text]);
        await expect(a).toHaveAttribute('target', '_blank');
      }
    });

    test('toc-and-cases: 목차 링크와 사례 수가 같고, 칸이 모두 채워져 있다', async ({ page }) => {
      await page.goto(p.url);
      const hrefs = await page.locator('.case_toc a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
      expect(hrefs.length).toBe(p.cases);
      for (const h of hrefs) await expect(page.locator(`article.case${h}`)).toHaveCount(1);
      const empty = await page.locator('article.case .case_field p').evaluateAll((ps) => ps.filter((x) => x.textContent.trim().length < 10).length);
      expect(empty).toBe(0);
    });

    test('facts: 확인한 숫자와 AI 표시가 들어 있다', async ({ page }) => {
      await page.goto(p.url);
      const body = await page.locator('main').innerText();
      for (const t of p.facts) expect(body, t).toContain(t);
      for (const t of p.banned || []) expect(body, t).not.toContain(t);
    });

    test('no-ai-marks: 낫표, 가운뎃점, 줄표, 커밋 링크가 없다', async ({ page }) => {
      await page.goto(p.url);
      const prose = await page.locator('main').evaluate((m) => {
        const c = m.cloneNode(true);
        c.querySelectorAll('pre, code').forEach((e) => e.remove());
        return c.innerText;
      });
      for (const ch of ['「', '」', '·', '—']) expect(prose.includes(ch), ch).toBe(false);
      await expect(page.locator('main a[href*="/commit/"], main a[href*="/pull/"]')).toHaveCount(0);
    });

    for (const w of [1400, 990, 375, 320]) {
      test(`no-horizontal-overflow @ ${w}px`, async ({ page }) => {
        await page.setViewportSize({ width: w, height: 900 });
        await page.goto(p.url);
        const widths = await page.evaluate(() => ({ doc: document.scrollingElement.scrollWidth, body: document.body.scrollWidth }));
        expect(widths.doc).toBeLessThanOrEqual(w);
        expect(widths.body).toBeLessThanOrEqual(w);
      });
    }

    test('images-and-console: 그림이 불러와지고 콘솔 오류가 없다', async ({ page }) => {
      const errors = [];
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(p.url);
      const imgs = page.locator('main img');
      const n = await imgs.count();
      for (let i = 0; i < n; i++) {
        await imgs.nth(i).scrollIntoViewIfNeeded();
        await expect.poll(() => imgs.nth(i).evaluate((el) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
      }
      expect(errors).toEqual([]);
    });

    test('chrome-and-pdf: 메인과 같은 헤더와 푸터, PDF 버튼', async ({ page }) => {
      await page.goto(p.url);
      await expect(page.locator('.cs_header .logo')).toHaveAttribute('href', '../');
      await expect(page.locator('.cs_footer')).toHaveAttribute('lang', 'en');
      await expect(page.locator('a.case_pdf')).toHaveAttribute('href', '../assets/files/kang-joohyun-portfolio.pdf');
    });

    test('card-links-here: 메인 카드가 같은 탭에서 이 페이지로 온다', async ({ page }) => {
      await page.goto('/');
      const card = page.locator(`.section_work a.work_link[href=".${p.url}"]`);
      await expect(card).toHaveCount(1);
      await expect(card).toContainText(p.card);
      expect(await card.getAttribute('target')).toBeNull();
    });
  });
}

// 맨 위 PC 화면 그림은 Cuddle과 같은 크기 (휴대폰 화면인 Trovely, 그림 대신 목록인 claude-code-skills는 제외)
for (const w of [1400, 375]) {
  test(`hero-shot-size-matches-cuddle @ ${w}px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    const size = async (url) => {
      await page.goto(url);
      return page.locator('.case_hero_shot img').evaluate((e) => {
        const r = e.getBoundingClientRect();
        return [Math.round(r.width), Math.round(r.height)];
      });
    };
    const base = await size('/projects/cuddle.html');
    for (const url of ['/projects/geul.html', '/projects/wavve.html', '/projects/headless-ui.html']) {
      expect(await size(url), url).toEqual(base);
    }
  });
}

// 메인 카드 6개: 호버나 키보드 초점 때만 "자세히 보기" 표시가 썸네일 가운데에 보이고, 썸네일이 흐려진다
test('card-detail-hint: 카드 6개 모두 호버와 초점 때만 "자세히 보기"가 보인다', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 1000 });
  await page.goto('/');
  const cards = page.locator('.section_work a.work_link[href^="./projects/"]');
  await expect(cards).toHaveCount(6);
  for (let i = 0; i < 6; i++) {
    const card = cards.nth(i);
    const hint = card.locator('.detail_hint');
    await expect(hint).toHaveText('자세히 보기');
    await expect(hint).toHaveAttribute('aria-hidden', 'true');
    await expect(card.locator('.blind')).toHaveText('프로젝트 상세 페이지로 이동');
    await card.scrollIntoViewIfNeeded();
    await page.mouse.move(2, 2);
    await expect.poll(() => hint.evaluate((e) => getComputedStyle(e).opacity)).toBe('0');
    const box = await card.locator('.thumb_box').boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect.poll(() => hint.evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
    const media = card.locator('.thumb_box video, .thumb_box img').first();
    await expect.poll(() => media.evaluate((e) => getComputedStyle(e).opacity)).toBe('0.6');
  }
  await page.mouse.move(2, 2);
  await cards.first().focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect.poll(() => cards.first().locator('.detail_hint').evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
});

// 상세 페이지 헤더 로고를 누르면 주소 끝에 index.html이 붙지 않고 사이트 첫 주소로 간다
test('logo-goes-to-site-root: 로고를 누르면 index.html 없이 메인으로 간다', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  for (const slug of ['cuddle', 'geul', 'trovely', 'wavve', 'headless-ui', 'claude-code-skills']) {
    await page.goto(`/projects/${slug}.html`);
    await Promise.all([page.waitForURL((u) => !u.pathname.includes('/projects/')), page.locator('.cs_header .logo').click()]);
    const u = new URL(page.url());
    expect(u.pathname, slug).toBe('/');
  }
});
