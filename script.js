/* ─── 테마 토글 ─── */
const root = document.documentElement;
const toggle = document.getElementById("themeToggle");

const saved = localStorage.getItem("ail-theme");
if (saved) root.dataset.theme = saved;

toggle.addEventListener("click", () => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const current = root.dataset.theme || (prefersDark ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  localStorage.setItem("ail-theme", next);
});

/* ─── Lottie (자체 제작 에셋 · assets/lottie) ───
   무한 루프로 재생하되, 성능·안정을 위해 화면(뷰포트)에 보이는 동안에만 재생하고
   벗어나면 일시정지한다. 모션 축소 설정 시에는 대표 정지 프레임(data-still)만 그린다. */
function initLottie() {
  const boxes = document.querySelectorAll("[data-lottie]");
  if (!boxes.length) return;
  if (!window.lottie) {
    boxes.forEach((el) => { el.textContent = el.getAttribute("aria-label"); });
    return;
  }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 뷰포트에 들어오면 재생, 벗어나면 일시정지 (동시 재생 수를 줄여 컴포지터 부담을 낮춘다)
  const playIO = reduced ? null : new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      const anim = e.target.__anim;
      if (!anim) return;
      if (e.isIntersecting) { if (anim.isPaused) anim.play(); }
      else if (!anim.isPaused) anim.pause();
    }),
    { rootMargin: "160px 0px" }
  );

  boxes.forEach((el) => {
    const anim = window.lottie.loadAnimation({
      container: el,
      renderer: "svg",
      loop: el.dataset.loop !== "false", // 기본 무한 루프
      autoplay: false,                    // 뷰포트 진입 시에만 재생 (IntersectionObserver가 제어)
      path: el.dataset.lottie,
      rendererSettings: { progressiveLoad: true },
    });
    el.__anim = anim;
    anim.addEventListener("DOMLoaded", () => {
      // 진입 전에도 빈 박스로 보이지 않도록 대표 정지 프레임을 미리 그려둔다
      const still = Number(el.dataset.still || 0);
      anim.goToAndStop(Math.max(0, still - 1), true);
      anim.goToAndStop(still, true);
      if (playIO) playIO.observe(el);
    });
  });
}
// bodymovin은 defer 로드 — 준비 시점에 맞춰 초기화
if (window.lottie) initLottie();
else window.addEventListener("load", initLottie);

/* ─── Reveal ─── */
const revealIO = new IntersectionObserver(
  (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); }),
  { threshold: 0.1 }
);
document.querySelectorAll(".reveal").forEach((el) => revealIO.observe(el));

/* ─── 목차 스크롤 스파이 ─── */
const navLinks = [...document.querySelectorAll(".nav-links a")];
const targets = navLinks
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

const spyIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${e.target.id}`));
    });
  },
  { rootMargin: "-30% 0px -60% 0px" }
);
targets.forEach((t) => spyIO.observe(t));
