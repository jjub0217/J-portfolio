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
  // 큰 그림은 처음 열 때 만든다. 빈 <img>를 미리 두면 깨진 그림으로 읽히기 때문이다.
  let img = null;
  let opener = null;
  document.querySelectorAll(".case_zoom").forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.querySelector("img");
      if (!img) img = dialog.appendChild(document.createElement("img"));
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

// 휴대폰 메뉴 버튼: 메인 페이지와 같은 햄버거 메뉴를 연다. Esc와 메뉴 링크로 닫는다.
function initBurger() {
  const btn = document.querySelector(".cs_header .btn_burger");
  const nav = document.getElementById("nav");
  if (!btn || !nav) return;
  const set = (open) => {
    document.body.classList.toggle("is-menu-open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
  };
  btn.addEventListener("click", () => set(!document.body.classList.contains("is-menu-open")));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("is-menu-open")) {
      set(false);
      btn.focus();
    }
  });
}

initTocScroll();
initBurger();
initCodeCopy();
initLightbox();
