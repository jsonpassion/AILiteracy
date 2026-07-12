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
   각 애니메이션은 끝부분에서 전체를 opacity 0으로 페이드아웃하며 루프한다.
   그대로 무한 루프하면 매 주기마다 화면이 비어(어두운 박스 배경만 남아) "배경이 앞으로
   나온" 것처럼 보인다. 그래서 (1) 뷰포트에 처음 들어올 때 한 번만 재생하고
   (2) 페이드아웃이 시작되기 직전의 '완성된 그림' 프레임에서 멈춰 그 상태로 유지한다.
   결과적으로 각 그림은 스크롤해 들어오면 스스로 그려진 뒤 정적 일러스트로 남는다.
   모션 축소 설정 시에는 대표 정지 프레임(data-still)만 그린다. */
var LOTTIE_FADE_TAIL = 44; // 끝의 페이드아웃 구간(프레임) — 이 앞에서 멈춘다

function initLottie() {
  const boxes = document.querySelectorAll("[data-lottie]");
  if (!boxes.length) return;
  if (!window.lottie) {
    boxes.forEach((el) => { el.textContent = el.getAttribute("aria-label"); });
    return;
  }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 뷰포트에 처음 들어오면 완성 프레임까지 한 번만 재생하고 멈춰 유지
  const playIO = reduced ? null : new IntersectionObserver(
    (entries, obs) => entries.forEach((e) => {
      const anim = e.target.__anim;
      if (!e.isIntersecting || !anim || anim.__started) return;
      anim.__started = true;
      const hold = Math.max(1, Math.round(anim.totalFrames) - LOTTIE_FADE_TAIL);
      anim.playSegments([0, hold], true); // 페이드아웃 꼬리는 재생하지 않음
      obs.unobserve(e.target);
    }),
    { rootMargin: "140px 0px" }
  );

  boxes.forEach((el) => {
    const anim = window.lottie.loadAnimation({
      container: el,
      renderer: "svg",
      loop: false,       // 한 번 그린 뒤 완성 상태로 정지 (무한 루프의 페이드아웃 깜빡임 제거)
      autoplay: false,   // 뷰포트 진입 시에만 재생 (아래 IntersectionObserver가 제어)
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
