// ========================================
// Pretext Obstacle — 텍스트 회피 효과
// ========================================
// .section_about의 .title과 .text_area에 takeover 적용.
// 페이지 전역에 공 1개 떠 있고, 어디서든 드래그 가능.
// section_about이 viewport에 보일 때만 회피 알고리즘 활성화.
//
// 옵션 B: 강조 단어 색상 유지 + 단락 구분 처리

import {
  prepareWithSegments,
  layoutNextLine,
  layout,
} from "https://esm.sh/@chenglou/pretext";

// 공 크기 — init()과 setStageHeight()가 공유 (동기화 위해 한 곳에)
const BALL_RADIUS = 80;
const BALL_VERTICAL_GAP = 4;

// ────────────────────────────────────────
// 알고리즘 헬퍼
// ────────────────────────────────────────

function circleIntervalForBand(
  centerX, centerY, radius,
  lineTopY, lineBottomY,
  horizontalGap, verticalGap,
) {
  const top = lineTopY - verticalGap;
  const bottom = lineBottomY + verticalGap;
  if (top >= centerY + radius || bottom <= centerY - radius) return null;

  const minVerticalDistance =
    centerY >= top && centerY <= bottom ? 0 :
    centerY < top ? top - centerY :
    centerY - bottom;

  if (minVerticalDistance >= radius) return null;

  const maxHorizontalReach = Math.sqrt(
    radius * radius - minVerticalDistance * minVerticalDistance
  );

  return {
    left: centerX - maxHorizontalReach - horizontalGap,
    right: centerX + maxHorizontalReach + horizontalGap,
  };
}

function carveTextLineSlots(base, blocked, minSlotWidth) {
  let slots = [base];
  for (const interval of blocked) {
    const next = [];
    for (const slot of slots) {
      if (interval.right <= slot.left || interval.left >= slot.right) {
        next.push(slot);
        continue;
      }
      if (interval.left > slot.left) {
        next.push({ left: slot.left, right: interval.left });
      }
      if (interval.right < slot.right) {
        next.push({ left: interval.right, right: slot.right });
      }
    }
    slots = next;
  }
  return slots.filter((s) => s.right - s.left >= minSlotWidth);
}

// ────────────────────────────────────────
// 유틸: HTML 안전 + 강조 처리
// ────────────────────────────────────────

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 한 줄 텍스트 안에서 강조 단어들을 찾아 span으로 감싸기
function renderLineWithAccent(text, accentWords) {
  if (!accentWords || accentWords.length === 0) {
    return escapeHTML(text);
  }

  // 가장 긴 매치 우선 (긴 단어 먼저)
  const sortedWords = [...accentWords].sort((a, b) => b.length - a.length);

  // 각 매치 위치 찾기 (case-sensitive)
  const matches = [];
  for (const word of sortedWords) {
    let idx = 0;
    while ((idx = text.indexOf(word, idx)) !== -1) {
      // 겹치는 매치 제외
      const overlap = matches.some(
        (m) => idx < m.end && idx + word.length > m.start
      );
      if (!overlap) {
        matches.push({ start: idx, end: idx + word.length, word });
      }
      idx += word.length;
    }
  }

  if (matches.length === 0) return escapeHTML(text);

  matches.sort((a, b) => a.start - b.start);

  let result = "";
  let cur = 0;
  for (const m of matches) {
    result += escapeHTML(text.slice(cur, m.start));
    result += `<span class="text-accent">${escapeHTML(m.word)}</span>`;
    cur = m.end;
  }
  result += escapeHTML(text.slice(cur));
  return result;
}

// br 태그를 \n으로 변환 후 textContent 추출
function getTextWithBreaks(el) {
  const html = el.innerHTML.replace(/<br\s*\/?>/gi, "\n");
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent;
}

// ────────────────────────────────────────
// PretextZone — 한 텍스트 영역의 takeover 관리
// ────────────────────────────────────────

class PretextZone {
  constructor(targetSelector, options = {}) {
    this.targetEl = document.querySelector(targetSelector);
    if (!this.targetEl) {
      console.warn(`[PretextObstacle] not found: ${targetSelector}`);
      return;
    }

    this.options = {
      accentWords: options.accentWords || null,
      paragraphSeparator: options.paragraphSeparator || null,
      paragraphGapMultiplier: options.paragraphGapMultiplier || 1.6,
      reserveBallHeight: options.reserveBallHeight || false,
    };

    // br을 \n으로 변환해서 텍스트 추출 (단락 구분 보존)
    const rawText = getTextWithBreaks(this.targetEl).trim();

    // 단락 분리
    if (this.options.paragraphSeparator) {
      this.paragraphs = rawText
        .split(this.options.paragraphSeparator)
        .map((p) => p.trim().replace(/\s+/g, " "))
        .filter((p) => p.length > 0);
    } else {
      this.paragraphs = [rawText.replace(/\s+/g, " ")];
    }

    this.setupMarkup();
    this.measureFont();
    this.preparedList = [];
  }

  setupMarkup() {
    const originalHTML = this.targetEl.innerHTML;

    // visually-hidden source (모바일 fallback / SEO / 스크린리더)
    const source = document.createElement("div");
    source.className = "pretext-source";
    source.innerHTML = originalHTML;

    // Pretext 렌더 stage
    const stage = document.createElement("div");
    stage.className = "pretext-stage";

    this.targetEl.innerHTML = "";
    this.targetEl.appendChild(source);
    this.targetEl.appendChild(stage);
    this.targetEl.classList.add("is-pretext-takeover");

    this.sourceEl = source;
    this.stageEl = stage;
  }

  measureFont() {
    const styles = getComputedStyle(this.targetEl);

    this.fontSize = parseFloat(styles.fontSize);
    this.fontFamily = styles.fontFamily;
    this.fontWeight = styles.fontWeight;

    // Pretext에 넘길 font 문자열 (size + family)
    this.font = `${styles.fontSize} ${styles.fontFamily}`;

    const lh = styles.lineHeight;
    this.lineHeight = lh === "normal"
      ? this.fontSize * 1.2
      : parseFloat(lh);

    this.minSlotWidth = this.fontSize * 2.8;
  }

  async prepare() {
    if (!this.targetEl) return;
    await document.fonts.ready;
    this.preparedList = this.paragraphs.map((p) =>
      prepareWithSegments(p, this.font, { wordBreak: "keep-all" })
    );
  }

  setStageHeight() {
    if (!this.targetEl || !this.stageEl) return;
    if (!this.preparedList || this.preparedList.length === 0) return;

    const stageWidth = this.stageEl.clientWidth;
    if (!stageWidth) return;

    // Pretext의 layout()으로 정확한 높이 측정
    let totalHeight = 0;
    for (const prepared of this.preparedList) {
      const result = layout(prepared, stageWidth, this.lineHeight);
      totalHeight += result.height;
    }
    // 단락 사이 빈 줄 (paragraphGapMultiplier - 1)배 추가
    if (this.preparedList.length > 1) {
      totalHeight +=
        (this.preparedList.length - 1) *
        this.lineHeight *
        (this.options.paragraphGapMultiplier - 1);
    }

    // 공이 텍스트를 가리면 그 줄들이 좌우로 갈라지거나 아래로 밀려 더 많은
    // 세로 공간이 필요. 공 지름만큼 여유를 미리 확보해 잘림을 막음
    // (reserveBallHeight를 켠 zone만 — 짧은 title엔 불필요).
    const ballClearance = this.options.reserveBallHeight
      ? BALL_RADIUS * 2 + BALL_VERTICAL_GAP * 2
      : 0;

    // 박스 높이 = 자연 높이 + 공 여유. content_box를 flex-start(상단 정렬)로
    // 두므로 이 여유가 정렬을 망치지 않고(여백은 박스 아래로 감), 공이 어디
    // 있든 늘어난 줄이 박스 안에 다 들어가 잘림·넘침이 없음.
    this.stageEl.style.minHeight = `${Math.ceil(totalHeight + ballClearance)}px`;
    this.stageHeight = totalHeight + ballClearance;
  }

  draw(globalBall) {
    if (!this.preparedList || this.preparedList.length === 0) return;
    if (!this.stageEl) return;

    const stageWidth = this.stageEl.clientWidth;
    if (!stageWidth) return;

    this.stageEl.querySelectorAll(".pretext-line").forEach((el) => el.remove());

    const stageRect = this.stageEl.getBoundingClientRect();
    const ballRect = globalBall.getBoundingClientRect();
    const localBall = {
      centerX: ballRect.left + ballRect.width / 2 - stageRect.left,
      centerY: ballRect.top + ballRect.height / 2 - stageRect.top,
      radius: ballRect.width / 2,
      horizontalGap: 14,
      verticalGap: 4,
    };

    const stageHeight = this.stageHeight || 99999;
    let lineTop = 0;

    for (let pIdx = 0; pIdx < this.preparedList.length; pIdx++) {
      const prepared = this.preparedList[pIdx];
      let cursor = { segmentIndex: 0, graphemeIndex: 0 };
      let textExhausted = false;

      while (lineTop + this.lineHeight <= stageHeight && !textExhausted) {
        const bandTop = lineTop;
        const bandBottom = lineTop + this.lineHeight;

        const blocked = [];
        const interval = circleIntervalForBand(
          localBall.centerX, localBall.centerY, localBall.radius,
          bandTop, bandBottom,
          localBall.horizontalGap, localBall.verticalGap,
        );
        if (interval !== null) blocked.push(interval);

        const slots = carveTextLineSlots(
          { left: 0, right: stageWidth },
          blocked,
          this.minSlotWidth,
        );

        if (slots.length === 0) {
          lineTop += this.lineHeight;
          continue;
        }

        slots.sort((a, b) => a.left - b.left);

        for (const slot of slots) {
          const slotWidth = slot.right - slot.left;
          const line = layoutNextLine(prepared, cursor, slotWidth);
          if (line === null) {
            textExhausted = true;
            break;
          }

          const span = document.createElement("span");
          span.className = "pretext-line";
          // 강조 처리 (innerHTML 사용)
          span.innerHTML = renderLineWithAccent(line.text, this.options.accentWords);
          span.style.left = `${Math.round(slot.left)}px`;
          span.style.top = `${Math.round(lineTop)}px`;
          span.style.fontSize = `${this.fontSize}px`;
          span.style.fontFamily = this.fontFamily;
          span.style.fontWeight = this.fontWeight;
          span.style.lineHeight = `${this.lineHeight}px`;
          this.stageEl.appendChild(span);

          cursor = line.end;
        }

        lineTop += this.lineHeight;
      }

      // 단락 끝났으면 단락 사이 빈 줄
      if (pIdx < this.preparedList.length - 1) {
        lineTop += this.lineHeight * (this.options.paragraphGapMultiplier - 1);
      }
    }
  }
}

// ────────────────────────────────────────
// 메인
// ────────────────────────────────────────

async function initPretextObstacle() {
  if (window.innerWidth < 768) return;

  const sectionAbout = document.querySelector(".section_about");
  if (!sectionAbout) return;

  const zones = [
    new PretextZone(".section_about .title", {
      accentWords: ["frontend developer", "frontend", "developer"],
    }),
    new PretextZone(".section_about .text_area", {
      paragraphSeparator: "\n\n",
      paragraphGapMultiplier: 1.6,
      reserveBallHeight: true,
    }),
  ].filter((z) => z.targetEl);

  if (zones.length === 0) return;

  // prepare가 먼저 — preparedList가 있어야 layout()으로 정확한 높이 측정 가능
  await Promise.all(zones.map((z) => z.prepare()));
  zones.forEach((z) => z.setStageHeight());

  // 페이지 전역 공
  const ball = document.createElement("div");
  ball.className = "global-ball";
  ball.id = "global-ball";

  const radius = BALL_RADIUS;
  ball.style.width = `${radius * 2}px`;
  ball.style.height = `${radius * 2}px`;
  ball.style.left = `${window.innerWidth / 2 - radius}px`;
  ball.style.top = `${window.innerHeight / 2 - radius}px`;
  document.body.appendChild(ball);

  let isAvoidActive = false;
  const observer = new IntersectionObserver(
    (entries) => {
      const wasActive = isAvoidActive;
      isAvoidActive = entries[0].isIntersecting;
      // 공 가시성 토글 — about 섹션 visible 시만 보임
      ball.classList.toggle("is-visible", isAvoidActive);
      if (!wasActive && isAvoidActive) draw();
    },
    // 판정 영역을 화면 세로 중앙선으로 좁힘 — about이 화면 중앙을 점유할 때만
    // 공이 보이고, footer가 올라와 about이 중앙에서 벗어나면 자동으로 숨김.
    { threshold: 0, rootMargin: "-50% 0px -50% 0px" }
  );
  observer.observe(sectionAbout);

  const draw = () => zones.forEach((z) => z.draw(ball));
  draw();

  // 드래그
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  ball.addEventListener("mousedown", (e) => {
    isDragging = true;
    const rect = ball.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    e.preventDefault();
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    ball.style.left = `${e.clientX - dragOffsetX}px`;
    ball.style.top = `${e.clientY - dragOffsetY}px`;
    if (isAvoidActive) draw();
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
  });

  window.addEventListener("scroll", () => {
    if (isAvoidActive) draw();
  }, { passive: true });

  window.addEventListener("resize", () => {
    zones.forEach((z) => z.setStageHeight());
    if (isAvoidActive) draw();
  });
}

initPretextObstacle().catch((err) =>
  console.error("[PretextObstacle] init failed:", err)
);
