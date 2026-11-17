// 프로젝트 상세 페이지 전용 스크립트: 목차 이동 (Task 3에서 코드 복사, 그림 크게 보기 추가)

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

initTocScroll();
