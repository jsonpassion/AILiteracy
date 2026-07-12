/*
 * AILiteracy — 자체 제작 Lottie 공용 빌딩 블록
 * 모든 애니메이션 JSON을 프로그래밍 방식으로 생성합니다 (외부 에셋 없음, 저작권 100% 자체 보유).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "lottie");
mkdirSync(OUT, { recursive: true });

/* ─── 팔레트 (사이트 토큰과 동일 계열) ─── */
const hex = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];
};
export const C = {
  blue: hex("#0A84FF"), purple: hex("#BF5AF2"), green: hex("#34C759"),
  orange: hex("#FF9F0A"), teal: hex("#64D2FF"), pink: hex("#FF6482"),
  red: hex("#FF453A"), yellow: hex("#FFD60A"),
  slate: hex("#8E8E93"), card: hex("#3A3A3F"), cardLight: hex("#55555C"),
  white: [1, 1, 1, 1],
};

/* ─── 로티 빌딩 블록 ─── */
export const EASE_OUT = { o: { x: 0.25, y: 0 }, i: { x: 0.25, y: 1 } };
export const EASE_BOTH = { o: { x: 0.45, y: 0 }, i: { x: 0.55, y: 1 } };

const arr = (v) => (Array.isArray(v) ? v : [v]);
export const kf = (t, s, ease) => ({ t, s: arr(s), ...(ease ? { i: ease.i, o: ease.o } : {}) });
/* lottie-web은 마지막을 제외한 모든 키프레임에 i/o 핸들을 요구한다 —
   빠진 곳은 선형 핸들로 보정 (없으면 해당 속성 보간이 통째로 깨져 레이어가 그려지지 않음) */
const LINEAR = { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] } };
export const an = (frames) => ({
  a: 1,
  k: frames.map((f, i) =>
    i < frames.length - 1 && !f.h && (!f.i || !f.o) ? { ...LINEAR, ...f } : f
  ),
});
export const st = (v) => ({ a: 0, k: v });

export const rect = (w, h, r) => ({ ty: "rc", d: 1, s: st([w, h]), p: st([0, 0]), r: st(r) });
export const ellipse = (d, dy = d) => ({ ty: "el", d: 1, s: st([d, dy]), p: st([0, 0]) });
export const fill = (c, o = 100) => ({ ty: "fl", c: st(c), o: st(o), r: 1 });
export const strokeShape = (c, w, o = 100) => ({ ty: "st", c: st(c), o: st(o), w: st(w), lc: 2, lj: 2, ml: 4 });
export const path = (pts, closed = false) => ({
  ty: "sh",
  ks: st({ i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]), v: pts, c: closed }),
});
export const group = (items, { x = 0, y = 0, r = 0, s = [100, 100], o = 100 } = {}, oAnim, sAnim, pAnim, rAnim) => ({
  ty: "gr",
  it: [
    ...items,
    { ty: "tr", p: pAnim || st([x, y]), a: st([0, 0]), s: sAnim || st(s), r: rAnim || st(r), o: oAnim || st(o), sk: st(0), sa: st(0) },
  ],
});
export const layer = ({ nm, ind, shapes, p, s, r, o, a = [0, 0, 0], ip = 0, op, stt = 0 }) => ({
  ddd: 0, ind, ty: 4, nm, sr: 1,
  ks: { o: o ?? st(100), r: r ?? st(0), p: p ?? st([0, 0, 0]), a: st(a), s: s ?? st([100, 100, 100]) },
  ao: 0, shapes, ip, op, st: stt, bm: 0,
});
export const doc = (nm, w, h, op, layers) => ({
  v: "5.7.4", fr: 60, ip: 0, op, w, h, nm, ddd: 0, assets: [], layers,
});

/* 팝인(스케일 오버슈트) · 페이드 */
export const popIn = (t, dur = 14, peak = 112) =>
  an([kf(t, [0, 0, 100], EASE_OUT), kf(t + dur * 0.6, [peak, peak, 100], EASE_OUT), kf(t + dur, [100, 100, 100])]);
export const fadeIn = (t, dur = 8) => an([kf(t, 0, EASE_OUT), kf(t + dur, 100)]);
export const fadeInOut = (tIn, tOut, dur = 8) =>
  an([kf(tIn, 0, EASE_OUT), kf(tIn + dur, 100, EASE_BOTH), kf(tOut - dur, 100, EASE_BOTH), kf(tOut, 0)]);
/* 무한 회전 (선형) */
export const spin = (op, from = 0, turns = 1) => an([kf(0, from), kf(op, from + 360 * turns)]);

/* 펄스(스케일 맥동) — t에서 시작해 dur 동안 커졌다 복귀 */
export const pulse = (t, dur = 20, peak = 118) =>
  an([kf(t, [100, 100, 100], EASE_BOTH), kf(t + dur / 2, [peak, peak, 100], EASE_BOTH), kf(t + dur, [100, 100, 100])]);

/* 텍스트 줄 흉내 — 라운드 바 (문장/문서 표현용) */
export const textBar = (w, c = C.slate, h = 8, o = 60) => group([rect(w, h, h / 2), fill(c, o)]);

/* 위쪽을 가리키는 삼각형 (화살촉) */
export const tri = (sz) => path([[0, -sz], [sz * 0.85, sz * 0.6], [-sz * 0.85, sz * 0.6]], true);

/* 대시 라인 — 작은 바 여러 개로 구성한 점선 (가로 길이 len, 세그먼트 수 n) */
export const dashedLine = (len, n, c, w = 3, o = 60) => {
  const seg = len / (n * 2 - 1);
  const items = [];
  for (let i = 0; i < n; i++) items.push(group([rect(seg, w, w / 2), fill(c, o)], { x: -len / 2 + seg / 2 + i * seg * 2 }));
  return items;
};

export const save = (name, json) => {
  writeFileSync(join(OUT, name), JSON.stringify(json));
  console.log("✓ " + name);
};
