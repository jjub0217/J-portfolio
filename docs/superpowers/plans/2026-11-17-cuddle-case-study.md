# Cuddle Market 상세 페이지 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 메인 페이지 Cuddle 카드를 누르면 사례 6개를 "문제, 원인, 해결, 확인한 방법, 결과" 순서로 읽는 정적 상세 페이지(`projects/cuddle.html`)로 가게 한다.

**Architecture:** 프레임워크 없는 정적 HTML 한 장에 전용 CSS와 작은 스크립트(목차 이동, 코드 복사, 그림 크게 보기)를 붙인다. 메인 페이지의 `main.js`는 불러오지 않고, 색과 글꼴만 기존 사이트와 맞춘다. 사례 글은 사용자 확인을 거친 근거 목록에서만 옮긴다.

**Tech Stack:** HTML, CSS, 바닐라 JavaScript, Playwright(`@playwright/test` 1.61, 기존 `playwright.config.js`가 `python3 -m http.server 5500`을 띄움). 이 컴퓨터에서는 `NODE_OPTIONS` 설정 때문에 Playwright가 멈추므로 항상 `env -u NODE_OPTIONS`를 앞에 붙인다(2026-11-17 기존 goals 테스트 9개 통과로 확인)

**Spec:** `docs/superpowers/specs/2026-11-17-cuddle-case-study-design.md`

## Global Constraints

- 상세 페이지 주소: `projects/cuddle.html`. 메인 카드 링크: `./projects/cuddle.html`, 같은 탭(`target` 없음).
- Live `https://cuddle-market.vercel.app/`, Admin Demo `https://cuddle-market-git-feature-admin-demo-mode-jjub0217s-projects.vercel.app/admin`, GitHub `https://github.com/jjub0217/cuddle-market`. 외부 링크는 `target="_blank" rel="noopener"`.
- PDF: `../assets/files/kang-joohyun-portfolio.pdf`, 새 탭.
- 색: 바탕 검정, 강조 연두 `#d2ff85`, 보조 연보라 `#b0a3ff`. 결과 칸만 연두 강조.
- 스크롤에 따라 나타나는 효과, 자동 재생, 가로 스크롤 금지. 허용: 목차 부드러운 이동(움직임 줄이기 설정이면 바로 이동), 코드 복사, 그림 크게 보기, 버튼 색 변화.
- 사실은 원본 HTML(`~/Desktop/채용-맞춤이력서/맞춤이력서/미리디/포트폴리오/portfolio-wide.no-contact.html`)과 Task 4에서 사용자가 확인한 근거 목록에서만 가져온다. 숫자는 PDF 값.
- "AI 도구와 함께" 표시: 01~06 모두 (2026-11-17 사용자 결정으로 03 추가).
- 01 결과에는 FCP 0.4초에서 0.9초, CLS 0에서 0.008을 반드시 함께 적는다.
- 06에는 "토스페이먼츠 테스트 모드", "취소, 환불, 웹훅은 하지 않음"을 적는다.
- 로컬에서 지워진 `assets/images/img_work_item2.mp4`, `img_work_item8.mp4`, `img_nextjs_logo.png`는 절대 스테이지하지 않는다(`git add`는 파일을 하나씩 지정).
- 작업 브랜치 `feat/cuddle-case-study`. 커밋은 각 Task 끝에 로컬로만 하고, 푸시와 PR은 사용자가 요청할 때만. 머지는 사용자.

## Review Focus

- 메인 카드 목록(2개, 3개, 2개 줄) 배치가 Cuddle 카드를 감싸는 상자 때문에 달라지는 경우 → 카드 7개의 위치와 크기가 바꾸기 전과 같아야 한다 (Task 1 `card-layout-unchanged`).
- 배지 위에 마우스를 올렸을 때 카드 제목이 밀리는 효과가 함께 켜지는 경우 → 배지에 올리면 제목은 그대로여야 한다 (Task 1 `badge-hover-no-title-shift`).
- 320px 화면에서 코드 블록과 표가 넘치는 경우 → 페이지 가로 스크롤 없이 코드 블록 안에서만 가로로 넘겨 볼 수 있어야 한다 (Task 2 `no-horizontal-overflow`, Task 5~7에서 다시 실행).
- 그림 크게 보기를 연 뒤 키보드만 쓰는 사용자 → Esc로 닫히고 초점이 그림을 연 버튼으로 돌아와야 한다 (Task 3 `lightbox-keyboard`).
- 목차 링크의 대상 id가 없거나 오타인 경우 → 목차의 모든 링크가 페이지 안의 사례 카드를 가리켜야 한다 (Task 2 `toc-targets-exist`).

---

### Task 1: 메인 페이지 Cuddle 카드 연결과 배지 분리

**Files:**
- Modify: `index.html` (Cuddle 카드, 현재 약 383~441행)
- Modify: `assets/css/style.css` (`.section_work .admin_badge` 약 957행, `:has(.admin_badge:hover)` 규칙 약 995~1007행)
- Test: `tests/cuddle-card.spec.js`

**Interfaces:**
- Produces: `<div class="work_item">` 안에 `<a class="work_link" href="./projects/cuddle.html">`와 형제 `<a class="admin_badge" href="(Admin Demo)" target="_blank" rel="noopener" aria-label="Cuddle Market 관리자 데모 새 탭에서 열기">`.

- [ ] **Step 1: 바꾸기 전 기준값 기록** — 1400px, 990px, 375px에서 `.works_box`의 카드 7개 `getBoundingClientRect()`(x, y, width, height)와 배지의 썸네일 기준 위치(right, bottom, width, height)를 `tests/fixtures/work-cards-baseline.json`에 저장하고, 1400px Cuddle 카드 캡처를 `test-results/`에 남긴다.
- [ ] **Step 2: 실패하는 테스트 작성** — `tests/cuddle-card.spec.js`
  - `card-links-to-detail`: 첫 카드 `.work_link`의 `href`가 `./projects/cuddle.html`이고 `target` 속성이 없다.
  - `badge-is-separate-link`: `.admin_badge`가 `a` 요소이고 `.work_link`의 자손이 아니며, `href`가 Admin Demo 주소, `target="_blank"`, 접근 가능한 이름에 "관리자 데모"가 들어 있다.
  - `keyboard-reaches-both`: 카드 링크에 초점을 둔 뒤 Tab 한 번에 배지에 초점이 간다. 배지에서 Enter를 누르면 Admin Demo 주소로 새 페이지가 열린다(`context.waitForEvent('page')`).
  - `card-layout-unchanged`: 세 화면 폭에서 카드 7개 위치와 크기, 배지 위치가 기준값과 1px 안에서 같다.
  - `badge-hover-no-title-shift`: 1400px에서 배지에 마우스를 올리면 `.title`의 `margin-left`가 `0px`이다. 카드 썸네일에 올리면 `10px`이다.
- [ ] **Step 3: 실패 확인** — Run: `env -u NODE_OPTIONS npx playwright test tests/cuddle-card.spec.js` / Expected: `card-links-to-detail`, `badge-is-separate-link`, `keyboard-reaches-both` FAIL.
- [ ] **Step 4: 구현** — Cuddle 카드를 `.work_item`(position: relative)으로 감싸고 배지를 형제 링크로 옮긴다. `.work_item`이 그리드에서 기존 카드 링크와 같은 자리를 차지하게 하고, 배지 위치는 기존 값(bottom 16px, right 16px, 88×88)을 `.work_item` 안의 썸네일 기준으로 맞춘다. `:has(.admin_badge:hover)` 규칙은 배지가 더는 자손이 아니므로 정리한다. 다른 6개 카드와 Trovely, headless-ui 배지는 건드리지 않는다.
- [ ] **Step 5: 통과 확인** — Run: `env -u NODE_OPTIONS npx playwright test tests/cuddle-card.spec.js tests/responsive.spec.js tests/visibility.spec.js` / Expected: 모두 PASS. 1400px 캡처를 Step 1 캡처와 나란히 보고 같아 보이는지 확인한다.
- [ ] **Step 6: 커밋** — `git add index.html assets/css/style.css tests/cuddle-card.spec.js tests/fixtures/work-cards-baseline.json` 후 `feat: Cuddle 카드를 상세 페이지로 연결하고 관리자 데모 배지를 별도 링크로 분리`.

### Task 2: 상세 페이지 뼈대 (맨 위 정보, 목차, 빈 사례 카드 6개, 맨 아래)

**Files:**
- Create: `projects/cuddle.html`
- Create: `assets/css/case-study.css`
- Create: `assets/js/case-study.js`
- Test: `tests/case-study.spec.js`

**Interfaces:**
- Produces (HTML 구조, Task 3~7이 사용):
  - 사례 카드: `<article class="case" id="case-01">` … `id="case-06"`
  - 카드 안: `.case_head`(번호와 묶음 `.case_kicker`, 제목 `h2.case_title`, 위치와 기술 `.case_meta`, 칩 `.case_chips > li`, AI 표시 `.case_ai`), `.case_body`(`.case_text`와 `.case_evidence` 2단)
  - 글 칸: `.case_text > section.case_field[data-field="problem|cause|solution|verification|result"]`, 각 칸 제목 `h3`(문제, 원인, 해결, 확인한 방법, 결과). 결과 칸은 `.case_field--result`.
  - 목차: `nav.case_toc` 안 `a[href="#case-0N"]`, 묶음 이름 4개(성능, 관리 화면, 검증, 실시간과 결제)와 사례마다 한 줄 결과 `.toc_result`
  - 맨 위 버튼: `.case_links a`(Live ↗, Admin Demo ↗, GitHub ↗), 맨 아래 `a.case_pdf`
  - `case-study.js`: `initTocScroll()`를 이 Task에서 만든다.

- [ ] **Step 1: 실패하는 테스트 작성** — `tests/case-study.spec.js` (`/projects/cuddle.html`)
  - `hero-links`: `.case_links a` 3개의 글자와 `href`가 Global Constraints 주소와 같고 모두 `target="_blank"`.
  - `info-block`: 기간 "2025. 08 ~ 2026. 11"이 보인다.
  - `toc-targets-exist`: `.case_toc a` 6개의 `href`가 `#case-01`~`#case-06`이고 각 대상이 존재한다.
  - `toc-smooth-scroll`: 목차의 `#case-04`를 누르면 1.5초 안에 `#case-04` 위쪽이 화면 위에서 0~120px 사이에 온다.
  - `toc-reduced-motion`: `page.emulateMedia({ reducedMotion: 'reduce' })`에서 누른 직후(100ms 안) 같은 위치에 온다.
  - `two-column-desktop`: 1400px에서 각 카드의 `.case_evidence` 왼쪽 끝이 `.case_text` 오른쪽 끝보다 오른쪽이다. 375px에서는 `.case_evidence` 위쪽이 `.case_text` 아래쪽보다 아래다.
  - `no-horizontal-overflow`: 1400, 990, 375, 320px에서 `document.scrollingElement.scrollWidth`와 `body.scrollWidth`가 화면 폭 이하다.
  - `pdf-button`: `a.case_pdf`의 `href`가 `../assets/files/kang-joohyun-portfolio.pdf`이고 새 탭.
  - `no-main-js`: 페이지가 `main.js`를 불러오지 않고, 콘솔 오류가 0개다.
- [ ] **Step 2: 실패 확인** — Run: `env -u NODE_OPTIONS npx playwright test tests/case-study.spec.js` / Expected: 페이지가 없어 모두 FAIL.
- [ ] **Step 3: 구현** — 맨 위 정보 칸은 설계 7절대로 원본 HTML의 Cuddle 개요, 역할, Skills를 줄여 쓴다. 사례 카드 6개는 제목, 묶음, 칸 제목만 두고 칸 내용은 비워 둔다(Task 5~7에서 채움). 사이트 헤더는 로고(`../index.html`)와 "Work" 돌아가기 링크(`../index.html#work`)만 둔다. `initTocScroll()`은 링크 클릭을 가로채 `scrollIntoView({ behavior: 움직임 줄이기면 'auto' 아니면 'smooth', block: 'start' })`를 부르고 주소창 해시를 갱신한다. `body`가 스크롤되는 구조(`style.css`를 불러오면 `html, body { height: 100% }`)에서도 동작해야 한다. 카드는 테두리와 배경으로 구분하고, 990px 이하에서 2단을 1단으로 바꾼다. 코드 블록은 블록 안에서만 가로로 넘긴다(`overflow-x: auto`).
- [ ] **Step 4: 통과 확인** — Run: `env -u NODE_OPTIONS npx playwright test tests/case-study.spec.js` / Expected: 모두 PASS.
- [ ] **Step 5: 커밋** — `git add projects/cuddle.html assets/css/case-study.css assets/js/case-study.js tests/case-study.spec.js` 후 `feat: Cuddle 상세 페이지 뼈대와 빠른 목차`.

### Task 3: 코드 복사와 그림 크게 보기

**Files:**
- Modify: `assets/js/case-study.js`, `assets/css/case-study.css`, `projects/cuddle.html`(시험용 코드 블록 1개, 그림 1개)
- Test: `tests/case-study.spec.js`에 추가

**Interfaces:**
- Consumes: Task 2의 `.case_evidence`
- Produces: 코드 블록 `<figure class="case_code"><figcaption>파일 경로</figcaption><pre><code>…</code></pre><button class="code_copy" type="button">복사</button></figure>`, 그림 `<button class="case_zoom" type="button" aria-label="(그림 설명) 크게 보기"><img …></button>`, 함수 `initCodeCopy()`, `initLightbox()`. 크게 보기 창은 `<dialog class="case_lightbox">`.

- [ ] **Step 1: 실패하는 테스트 작성**
  - `code-copy`: `context.grantPermissions(['clipboard-read','clipboard-write'])` 뒤 `.code_copy`를 누르면 클립보드 글자가 같은 블록의 `code.textContent`와 같고, 버튼 글자가 2초 안에 "복사됨"으로 바뀌었다가 "복사"로 돌아온다.
  - `lightbox-open`: `.case_zoom`을 누르면 `dialog.case_lightbox[open]` 안에 같은 `src`의 큰 그림이 보인다.
  - `lightbox-keyboard`: Tab으로 `.case_zoom`에 가서 Enter로 열고, Esc로 닫히면 `document.activeElement`가 그 `.case_zoom`이다.
- [ ] **Step 2: 실패 확인** — Run: `env -u NODE_OPTIONS npx playwright test tests/case-study.spec.js -g "code-copy|lightbox"` / Expected: FAIL.
- [ ] **Step 3: 구현** — `initCodeCopy()`는 `navigator.clipboard.writeText` 실패 시 버튼에 "복사 실패"를 2초 보여 준다. `initLightbox()`는 `dialog.showModal()`을 쓰고, 닫힐 때 연 버튼으로 초점을 돌린다. 배경 클릭으로도 닫는다.
- [ ] **Step 4: 통과 확인** — Run: `env -u NODE_OPTIONS npx playwright test tests/case-study.spec.js` / Expected: 모두 PASS.
- [ ] **Step 5: 커밋** — 바뀐 세 파일과 테스트 파일만 지정해 커밋, `feat: 상세 페이지 코드 복사와 그림 크게 보기`.

### Task 4: 사례별 근거 목록 작성과 사용자 확인 (코드 없음, 확인 관문)

**Files:**
- Create: `docs/superpowers/specs/2026-11-17-cuddle-case-evidence.md`

- [ ] **Step 1: 원본에서 옮길 문장 정리** — 사례 6개마다 원본 HTML의 해당 소제목(설계 6절 표) 아래 문장과 숫자를 칸(문제, 원인, 해결, 확인한 방법, 결과)별로 나눠 적고, 각 줄 끝에 "출처: 원본"을 단다.
- [ ] **Step 2: 원본 밖 근거 찾기** — `~/Desktop/cuddle-market`(최신 커밋 2026-11-13)에서 비어 있는 원인, 확인한 방법 칸의 근거를 찾는다. 테스트 파일(예: 채팅 재연결, 결제 확인 조건 테스트), PR(`gh pr list -R jjub0217/cuddle-market --state merged --search "<키워드>"`), 커밋, `docs/` 문서. 찾은 문장마다 "출처: 파일 경로 / PR #번호 / 커밋 해시"를 단다. 근거가 없는 칸은 "근거 없음: 사용자에게 물을 질문"으로 적는다.
- [ ] **Step 3: 사례별 근거 자료 정리** — 사례마다 오른쪽 칸에 넣을 것(그림 파일, 코드 파일 경로와 줄 범위, 수치 표, PR 링크)을 적는다. 원본 숫자와 지금 저장소 값이 다르면(예: 테스트 파일 136개) 두 값을 함께 적고 "PDF 값 사용, 사용자 확인 필요"로 표시한다.
- [ ] **Step 4: 사용자 확인** — 이 문서를 사용자에게 보여 주고, "원본 밖" 문장과 "근거 없음" 질문에 대한 답을 받는다. 사용자가 확인하지 않은 문장은 지운다. 이 Step이 끝나기 전에는 Task 5~7을 시작하지 않는다.
- [ ] **Step 5: 커밋** — `git add docs/superpowers/specs/2026-11-17-cuddle-case-evidence.md` 후 `docs: Cuddle 사례별 근거 목록`.

### Task 5: 사례 01(홈 화면 로딩), 02(관리 화면 공통 테이블) 채우기

**Files:**
- Modify: `projects/cuddle.html`
- Create: `assets/images/cuddle/admin-products.jpg` (원본 `img/admin-products.jpg`, 2880×1680을 긴 변 1600px로 줄여 복사)
- Test: `tests/case-study.spec.js`에 추가

**Interfaces:**
- Consumes: Task 2의 카드 구조, Task 3의 `.case_code`, `.case_zoom`, Task 4의 확인된 근거 목록

- [ ] **Step 1: 실패하는 테스트 작성**
  - `case01-numbers`: `#case-01`에 "1.3초", "1.0초", "94", "0.4초", "0.9초", "0.008"이 모두 보이고, 시도 순서 표에 행이 4개(시도 1, 2, 3, 해결)다.
  - `case02-numbers`: `#case-02`에 "8개", "646줄", "52~124줄", "7줄"이 보이고 `.case_zoom img`가 `admin-products.jpg`를 불러온다(`naturalWidth > 0`).
  - `ai-label`: `#case-01`, `#case-02`에 `.case_ai`가 있다.
  - `fields-filled`: 두 카드의 `.case_field` 다섯 칸이 모두 비어 있지 않다.
- [ ] **Step 2: 실패 확인** — Run: `env -u NODE_OPTIONS npx playwright test tests/case-study.spec.js -g "case01|case02|ai-label|fields-filled"` / Expected: FAIL.
- [ ] **Step 3: 구현** — Task 4에서 확인된 문장만 옮긴다. 01 근거 칸: 시도 순서 표, 결과 수치, `https://github.com/jjub0217/cuddle-market/blob/main/docs/lighthouse-optimization-log.md` 링크. 02 근거 칸: 상품 관리 화면 그림(데모 데이터라고 표기), 숫자 4개, 설정 파일과 사용하는 쪽 코드(실제 파일 경로 표기).
- [ ] **Step 4: 통과 확인** — Run: `env -u NODE_OPTIONS npx playwright test tests/case-study.spec.js` / Expected: 모두 PASS(`no-horizontal-overflow` 포함).
- [ ] **Step 5: 커밋** — 바뀐 파일만 지정해 `feat: Cuddle 사례 01, 02 내용`.

### Task 6: 사례 03(AI 리뷰 지시문), 04(PR 검사) 채우기

**Files:**
- Modify: `projects/cuddle.html`
- Test: `tests/case-study.spec.js`에 추가

- [ ] **Step 1: 실패하는 테스트 작성**
  - `case03-before-after`: `#case-03`에 고치기 전 지시문 문장과 바꾼 뒤 지시문 문장(원본 그대로)이 각각 보이고, `.case_ai`가 있다.
  - `case04-numbers`: `#case-04`에 "136개", "웹 46", "앱 77", "공통 패키지 13"이 보이고, `.case_code figcaption`이 `.github/workflows/gate.yml`이며 `.case_ai`가 있다.
- [ ] **Step 2: 실패 확인** — Run: `env -u NODE_OPTIONS npx playwright test tests/case-study.spec.js -g "case03|case04"` / Expected: FAIL.
- [ ] **Step 3: 구현** — 03 근거 칸: 지시문 고치기 전과 후 비교, Escape 키 지적을 직접 확인하고 의도를 밝히는 주석 3줄을 더한 일. 04 근거 칸: 실제 `gate.yml`의 일부(복사해도 실제 파일과 같은 줄), 테스트 파일 수, 고친 줄을 빼 보고 실패하는지 확인한 방법. PR 링크는 Task 4에서 찾은 것만.
- [ ] **Step 4: 통과 확인** — Run: `env -u NODE_OPTIONS npx playwright test tests/case-study.spec.js` / Expected: 모두 PASS.
- [ ] **Step 5: 커밋** — `feat: Cuddle 사례 03, 04 내용`.

### Task 7: 사례 05(채팅 재연결), 06(테스트 결제) 채우기

**Files:**
- Modify: `projects/cuddle.html`, `assets/css/case-study.css`(흐름 그림 모양)
- Test: `tests/case-study.spec.js`에 추가

**Interfaces:**
- Produces: 흐름 그림 `<ol class="case_flow">` (단계마다 `li`, 고치기 전과 후를 나란히 두는 `.case_flow_pair`)

- [ ] **Step 1: 실패하는 테스트 작성**
  - `case05-flow`: `#case-05`에 `.case_flow`가 고치기 전과 후 두 개 있고, 메시지 중복을 막던 코드가 재연결 때 받은 메시지를 지우던 문제를 설명하는 문장이 보이며, `.case_ai`가 있다.
  - `case06-limits`: `#case-06`에 "토스페이먼츠 테스트 모드", "취소, 환불, 웹훅은 하지 않", "Idempotency-Key: confirm-"가 보이고, `.case_ai`가 있다.
- [ ] **Step 2: 실패 확인** — Run: `env -u NODE_OPTIONS npx playwright test tests/case-study.spec.js -g "case05|case06"` / Expected: FAIL.
- [ ] **Step 3: 구현** — 05 근거 칸: 원본 문단을 바탕으로 한 고치기 전과 후 흐름 그림, Task 4의 코드나 테스트. 06 근거 칸: 예약에서 판매 완료까지 흐름, 믿지 않는 값과 확정 조건 비교, 멱등키 줄. 흐름 그림은 375px에서 세로로 쌓인다.
- [ ] **Step 4: 통과 확인** — Run: `env -u NODE_OPTIONS npx playwright test tests/case-study.spec.js` / Expected: 모두 PASS.
- [ ] **Step 5: 커밋** — `feat: Cuddle 사례 05, 06 내용`.

### Task 8: 전체 확인과 사용자 검수

**Files:**
- 바꾸는 파일 없음(문제가 나오면 해당 Task 파일 수정)

- [ ] **Step 1: 전체 테스트** — Run: `env -u NODE_OPTIONS npx playwright test` / Expected: 기존 테스트와 새 테스트 모두 PASS.
- [ ] **Step 2: 사실 대조** — 상세 페이지의 모든 숫자와 문장을 원본 HTML과 근거 목록에 하나씩 대조하고, 대조표(문장, 출처, 일치 여부)를 사용자에게 보여 준다.
- [ ] **Step 3: 링크 확인** — 페이지의 모든 외부 링크에 `curl -s -o /dev/null -w "%{http_code}" -L <주소>`로 응답 코드를 확인한다(200 또는 Vercel 로그인 화면이면 기록). Expected: 끊긴 링크 0개.
- [ ] **Step 4: 화면 캡처** — 1400px, 375px에서 상세 페이지 전체와 메인 카드 캡처를 사용자에게 보여 준다.
- [ ] **Step 5: 사용자 검수 요청** — 푸시와 PR은 사용자가 요청하면 진행한다. 머지 뒤 실제 사이트에서 사용자가 휴대폰과 데스크톱으로 확인한다.
