// 프로젝트 상세 페이지 전용 스크립트: 목차 이동, 코드 복사, 그림 크게 보기

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// 목차 링크를 누르면 해당 사례로 이동한다. 움직임 줄이기 설정이면 바로 이동한다.
// 이 사이트는 html, body가 height: 100%라 body가 스크롤되므로 scrollIntoView를 쓴다.
function initTocScroll() {
  document.querySelectorAll('.case_toc a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", link.getAttribute("href"));
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });
}

// 복사 버튼: 같은 블록의 코드 글자를 클립보드에 넣고 2초 동안 결과를 보여 준다.
function initCodeCopy() {
  document.querySelectorAll(".case_code").forEach((fig) => {
    const btn = fig.querySelector(".code_copy");
    const code = fig.querySelector("code");
    if (!btn || !code) return;
    let timer;
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(code.textContent);
        btn.textContent = "복사됨";
      } catch {
        btn.textContent = "복사 실패";
      }
      clearTimeout(timer);
      timer = setTimeout(() => (btn.textContent = "복사"), 2000);
    });
  });
}

// 그림 크게 보기: dialog로 띄우고, 닫히면 연 버튼으로 초점을 돌린다. Esc와 배경 클릭으로 닫힌다.
function initLightbox() {
  const dialog = document.querySelector(".case_lightbox");
  if (!dialog) return;
  const img = dialog.querySelector("img");
  let opener = null;
  document.querySelectorAll(".case_zoom").forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.querySelector("img");
      img.src = src.getAttribute("src");
      img.alt = src.alt;
      opener = btn;
      dialog.showModal();
    });
  });
  dialog.querySelector(".lightbox_close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => opener && opener.focus());
}

initTocScroll();
initCodeCopy();
initLightbox();
