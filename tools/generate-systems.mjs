/*
 * AILiteracy — Lottie 3부 (시스템 5종)
 *   10. rag-flow.json         : 질문 → 문서 검색 → 근거 컨텍스트 → 출처 달린 답변
 *   11. agent-loop.json       : 수집 → 행동 → 검증 루프, 2회차 실패 후 3회차 완주
 *   12. harness-loop.json     : 실수 → 규칙 추가 → 같은 실수는 두 번 없음 (2라운드 + 완주)
 *   13. injection-shield.json : 문서 속 숨은 명령이 방패에 막히고, 데이터만 통과
 *   14. fluency-compass.json  : 4D 나침반 — 위임·묘사·분별·책임을 차례로 가리키다
 * 실행: node tools/generate-systems.mjs
 */
import { C, EASE_OUT, EASE_BOTH, kf, an, st, rect, ellipse, fill, strokeShape, path, group, layer, doc, popIn, fadeIn, fadeInOut, pulse, tri, dashedLine, save } from "./lottie-lib.mjs";

/* ════════ 10. rag-flow — 680×300, 560f ════════ */
{
  const W = 680, H = 300, OP = 560;
  const fadeAll = an([kf(0, 100, EASE_BOTH), kf(528, 100, EASE_BOTH), kf(556, 0)]);

  // 질문 칩
  const q = layer({
    nm: "q", ind: 1, ip: 0, op: OP, p: st([92, 76, 0]), s: popIn(6, 14), o: fadeAll,
    shapes: [group([rect(112, 44, 22), fill(C.blue, 90)]), group([rect(64, 8, 4), fill(C.white, 90)])],
  });

  // 서고: 3×4 그리드, 두 칸이 관련 문서 (teal, green)
  const SHX = 258, SHY = 150;
  const shelfItems = [];
  const hotIdx = [[1, 2], [2, 0]];
  const hotCols = [C.teal, C.green];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const hi = hotIdx.findIndex(([hr, hc]) => hr === r && hc === c);
    shelfItems.push(group(
      [rect(28, 38, 5), fill(hi >= 0 ? hotCols[hi] : C.slate, hi >= 0 ? 88 : 40)],
      { x: (c - 1.5) * 36, y: (r - 1) * 48 },
      hi >= 0 ? an([kf(0, 45, EASE_BOTH), kf(64 + hi * 14, 45, EASE_BOTH), kf(80 + hi * 14, 100)]) : null,
      hi >= 0 ? pulse(78 + hi * 14, 30, 124) : null
    ));
  }
  const shelf = layer({
    nm: "shelf", ind: 2, ip: 0, op: OP, p: st([SHX, SHY, 0]), s: popIn(14, 14), o: fadeAll,
    shapes: [group([rect(176, 176, 16), strokeShape(C.slate, 2, 45)]), ...shelfItems],
  });

  // 질문 → 서고 펄스
  const probe = layer({
    nm: "probe", ind: 3, ip: 0, op: OP,
    p: an([kf(34, [150, 80, 0], EASE_BOTH), kf(64, [SHX - 60, SHY - 40, 0])]),
    o: fadeInOut(34, 66, 8),
    shapes: [group([ellipse(12), fill(C.blue, 90)])],
  });

  // 문서 사본 2개 → 컨텍스트 박스
  const CTX = 452, CTY = 150;
  const copies = hotIdx.map(([r, c], i) => layer({
    nm: `copy-${i}`, ind: 4 + i, ip: 0, op: OP,
    p: an([
      kf(104 + i * 22, [SHX + (c - 1.5) * 36, SHY + (r - 1) * 48, 0], EASE_BOTH),
      kf(140 + i * 22, [CTX, CTY - 18 + i * 36, 0]),
    ]),
    o: an([kf(104 + i * 22, 0), kf(112 + i * 22, 100, EASE_BOTH), kf(528, 100, EASE_BOTH), kf(556, 0)]),
    shapes: [group([rect(64, 26, 6), fill(hotCols[i], 85)]), group([rect(38, 5, 2.5), fill(C.white, 85)])],
  }));
  const ctxBox = layer({
    nm: "ctx", ind: 6, ip: 0, op: OP, p: st([CTX, CTY, 0]), s: popIn(92, 14), o: fadeAll,
    shapes: [group([rect(104, 104, 16), strokeShape(C.orange, 2.5, 75)])],
  });

  // 컨텍스트 → 모델 → 답변
  const model = layer({
    nm: "model", ind: 7, ip: 0, op: OP, p: st([588, 112, 0]), s: popIn(24, 14), o: fadeAll,
    shapes: [group([ellipse(58), fill(C.purple, 90)], {}, null, pulse(210, 40, 114)), group([ellipse(24), fill(C.white, 55)])],
  });
  const feed = layer({
    nm: "feed", ind: 8, ip: 0, op: OP,
    p: an([kf(188, [CTX + 58, CTY - 10, 0], EASE_BOTH), kf(216, [588 - 34, 118, 0])]),
    o: fadeInOut(188, 218, 8),
    shapes: [group([ellipse(12), fill(C.orange, 90)])],
  });
  // 답변 카드 + 출처 태그 2개 (문서 색과 동일)
  const ans = layer({
    nm: "ans", ind: 9, ip: 0, op: OP, p: st([576, 232, 0]), s: popIn(238, 16), o: fadeAll,
    shapes: [
      group([rect(150, 62, 14), fill(C.card)]),
      group([rect(150, 62, 14), strokeShape(C.slate, 2, 55)]),
      group([rect(96, 6, 3), fill(C.slate, 80)], { y: -12, x: -12 }),
      group([rect(70, 6, 3), fill(C.slate, 60)], { y: 0, x: -25 }),
      group([rect(24, 13, 6.5), fill(C.teal, 90)], { x: 42, y: 16 }, fadeIn(266, 10)),
      group([rect(24, 13, 6.5), fill(C.green, 90)], { x: 68, y: 16 }, fadeIn(276, 10)),
    ],
  });

  save("rag-flow.json", doc("rag-flow", W, H, OP, [q, shelf, probe, ...copies, ctxBox, model, feed, ans]));
}

/* ════════ 11. agent-loop — 680×320, 720f ════════ */
{
  const W = 680, H = 320, OP = 720;
  const CX = 280, CY = 162, R = 112;
  const CYC = 200, T0 = 60; // 사이클 길이, 시작 오프셋
  const fadeAll = an([kf(0, 100, EASE_BOTH), kf(686, 100, EASE_BOTH), kf(716, 0)]);

  // 중앙 에이전트
  const agent = layer({
    nm: "agent", ind: 1, ip: 0, op: OP, p: st([CX, CY, 0]), s: popIn(6, 16), o: fadeAll,
    shapes: [
      group([ellipse(66), fill(C.blue, 92)]),
      group([ellipse(30), fill(C.white, 50)]),
      // 완주 시 초록 링
      group([ellipse(84), strokeShape(C.green, 4, 95)], {}, fadeIn(T0 + CYC * 3 + 20, 14), popIn(T0 + CYC * 3 + 20, 20)),
    ],
  });
  const orbit = layer({
    nm: "orbit", ind: 2, ip: 0, op: OP, p: st([CX, CY, 0]), o: fadeIn(4, 10),
    shapes: [group([ellipse(R * 2), strokeShape(C.slate, 2.5, 28)])],
  });

  // 스테이션 3개: 수집(상, teal) · 행동(우하, orange) · 검증(좌하, green)
  const stAngles = [-90, 30, 150];
  const stCols = [C.teal, C.orange, C.green];
  const stGlyphs = [
    [group([ellipse(20), strokeShape(C.white, 4, 92)], { x: -3, y: -3 }), group([rect(4.5, 13, 2.25), fill(C.white, 92)], { x: 9, y: 10, r: -45 })], // 돋보기
    [group([rect(26, 5, 2.5), fill(C.white, 92)], { r: 45 }), group([ellipse(12), strokeShape(C.white, 4, 92)], { x: -10, y: 10 })], // 도구
    [group([path([[-9, 0], [-2.5, 7], [10, -8]]), strokeShape(C.white, 4.5)])], // 체크
  ];
  // 도는 점이 스테이션에 닿는 시점: 수집 t=T0+lap*CYC, 행동 +CYC/3, 검증 +2CYC/3
  const stations = stAngles.map((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const hits = [0, 1, 2].map((lap) => T0 + lap * CYC + (i * CYC) / 3);
    const pulseFrames = hits.reduce((acc, t) => acc.concat([kf(t, [100, 100, 100], EASE_BOTH), kf(t + 12, [124, 124, 100], EASE_BOTH), kf(t + 26, [100, 100, 100], EASE_BOTH)]), [kf(0, [100, 100, 100], EASE_BOTH)]).concat([kf(OP, [100, 100, 100])]);
    return layer({
      nm: `st-${i}`, ind: 3 + i, ip: 0, op: OP, p: st([CX + R * Math.cos(a), CY + R * Math.sin(a), 0]),
      s: popIn(14 + i * 14, 14), o: fadeAll,
      shapes: [
        group([ellipse(54), fill(C.card)]),
        group([ellipse(54), strokeShape(stCols[i], 3, 88)], {}, null, an(pulseFrames)),
        ...stGlyphs[i],
      ],
    });
  });

  // 검증 실패 플래시 (2회차: t = T0 + CYC + 2CYC/3)
  const failT = T0 + CYC + (2 * CYC) / 3;
  const aFail = (150 * Math.PI) / 180;
  const failX = layer({
    nm: "fail", ind: 6, ip: 0, op: OP, p: st([CX + R * Math.cos(aFail), CY + R * Math.sin(aFail), 0]),
    o: fadeInOut(failT, failT + 54, 8), s: popIn(failT, 14, 130),
    shapes: [
      group([ellipse(62), strokeShape(C.red, 4, 95)]),
      group([rect(24, 5, 2.5), fill(C.red, 95)], { r: 45 }),
      group([rect(24, 5, 2.5), fill(C.red, 95)], { r: -45 }),
    ],
  });

  // 도는 점 (3바퀴, 등속)
  const runner = layer({
    nm: "runner", ind: 7, ip: 0, op: OP, p: st([CX, CY, 0]),
    r: an([kf(T0, 0), kf(T0 + CYC * 3, 360 * 3)]), o: fadeInOut(T0 - 10, T0 + CYC * 3 + 10, 10),
    shapes: [group([ellipse(16), fill(C.white, 95)], { y: -R }), group([ellipse(28), strokeShape(C.yellow, 2.5, 75)], { y: -R })],
  });

  // 진행 바 (우측): 사이클 1 후 45% → 사이클 2 실패(그대로+흔들림) → 사이클 3 후 100% 초록
  const PBX = 588, PBY = 162;
  const c1End = T0 + CYC * 0.85, c2End = T0 + CYC * 1.85, c3End = T0 + CYC * 2.85;
  const progress = layer({
    nm: "progress", ind: 8, ip: 0, op: OP, p: st([PBX, PBY, 0]), o: fadeAll,
    shapes: [
      group([rect(42, 210, 13), strokeShape(C.slate, 2.5, 50)]),
      group([group([rect(34, 202, 10), fill(C.teal, 80)], { y: -101 })], { y: 101 }, null,
        an([kf(T0, [100, 3], EASE_BOTH), kf(c1End, [100, 3], EASE_BOTH), kf(c1End + 24, [100, 46], EASE_BOTH), kf(c3End, [100, 46], EASE_BOTH), kf(c3End + 24, [100, 100])])),
      group([group([rect(34, 202, 10), fill(C.green, 88)], { y: -101 })], { y: 101 }, fadeIn(c3End + 26, 12),
        an([kf(T0, [100, 0], EASE_BOTH), kf(c3End + 26, [100, 100])])),
    ],
  });
  // 실패 시 진행 바 흔들림
  const shake = layer({
    nm: "shake-x", ind: 9, ip: 0, op: OP, p: st([PBX, PBY - 128, 0]),
    o: fadeInOut(c2End + 8, c2End + 60, 8), s: popIn(c2End + 8, 12),
    shapes: [
      group([ellipse(30), fill(C.red, 95)]),
      group([rect(16, 4.5, 2.25), fill(C.white)], { r: 45 }),
      group([rect(16, 4.5, 2.25), fill(C.white)], { r: -45 }),
    ],
  });
  // 최종 체크
  const done = layer({
    nm: "done", ind: 10, ip: 0, op: OP, p: st([PBX, PBY - 128, 0]), s: popIn(c3End + 30, 16),
    o: fadeInOut(c3End + 30, 700, 10),
    shapes: [group([ellipse(34), fill(C.green, 95)]), group([path([[-9, 0], [-2.5, 7], [10, -8]]), strokeShape(C.white, 4.5)])],
  });

  save("agent-loop.json", doc("agent-loop", W, H, OP, [agent, orbit, ...stations, failX, runner, progress, shake, done]));
}

/* ════════ 12. harness-loop — 680×320, 760f ════════ */
{
  const W = 680, H = 320, OP = 760;
  const RY = 252; // 런웨이 y
  const OB1 = 300, OB2 = 452, FIN = 604;
  const fadeAll = an([kf(0, 100, EASE_BOTH), kf(726, 100, EASE_BOTH), kf(756, 0)]);

  const runway = layer({
    nm: "runway", ind: 1, ip: 0, op: OP, p: st([340, RY + 22, 0]), o: fadeIn(0, 10),
    shapes: [group([rect(600, 4, 2), fill(C.slate, 35)])],
  });
  // 결승 깃발
  const flag = layer({
    nm: "flag", ind: 2, ip: 0, op: OP, p: st([FIN, RY - 14, 0]), s: popIn(8, 14), o: fadeAll,
    shapes: [
      group([rect(5, 66, 2.5), fill(C.slate, 80)], { y: 8 }),
      group([path([[0, -24], [30, -14], [0, -4]], true), fill(C.green, 90)], { x: 2.5 }, null,
        an([kf(0, [100, 100, 100], EASE_BOTH), kf(660, [100, 100, 100], EASE_BOTH), kf(672, [118, 118, 100], EASE_BOTH), kf(684, [100, 100, 100], EASE_BOTH), kf(696, [114, 114, 100], EASE_BOTH), kf(708, [100, 100, 100])])),
    ],
  });

  // AGENTS.md 문서 (우상단): 규칙 줄이 하나씩 늘어남
  const DX = 566, DY = 96;
  const docCard = layer({
    nm: "doc", ind: 3, ip: 0, op: OP, p: st([DX, DY, 0]), s: popIn(14, 16), o: fadeAll,
    shapes: [
      group([rect(150, 150, 16), fill(C.card, 60)]),
      group([rect(150, 150, 16), strokeShape(C.slate, 2.5, 60)]),
      group([rect(92, 9, 4.5), fill(C.slate, 90)], { y: -56 }),
      // 기존 규칙 한 줄
      group([rect(110, 7, 3.5), fill(C.slate, 55)], { y: -32 }),
      // 규칙 1 (라운드 1 실수 후): 주황
      group([rect(110, 7, 3.5), fill(C.orange, 90)], { y: -12 }, fadeIn(196, 12)),
      group([ellipse(9), fill(C.orange, 90)], { x: -64, y: -12 }, fadeIn(196, 12)),
      // 규칙 2 (라운드 2 실수 후): 핑크
      group([rect(110, 7, 3.5), fill(C.pink, 90)], { y: 10 }, fadeIn(452, 12)),
      group([ellipse(9), fill(C.pink, 90)], { x: -64, y: 10 }, fadeIn(452, 12)),
    ],
  });

  // 에이전트 점: 라운드 1 (80→OB1 정지) / 라운드 2 (80→OB1 통과→OB2 정지) / 라운드 3 (완주)
  const runnerP = an([
    kf(30, [80, RY, 0], EASE_BOTH), kf(110, [OB1, RY, 0], EASE_BOTH),      // R1: 장애물 1에서 정지
    kf(238, [OB1, RY, 0], EASE_BOTH), kf(252, [80, RY, 0], EASE_BOTH),     // 리셋 (페이드로 가림)
    kf(288, [80, RY, 0], EASE_BOTH), kf(346, [OB1, RY, 0], EASE_BOTH),     // R2: 통과
    kf(366, [OB2, RY, 0], EASE_BOTH),                                       // 장애물 2에서 정지
    kf(494, [OB2, RY, 0], EASE_BOTH), kf(508, [80, RY, 0], EASE_BOTH),     // 리셋
    kf(544, [80, RY, 0], EASE_BOTH), kf(596, [OB1, RY, 0], EASE_BOTH),
    kf(618, [OB2, RY, 0], EASE_BOTH), kf(652, [FIN - 26, RY, 0]),          // R3: 완주
  ]);
  const runnerO = an([
    kf(24, 0), kf(34, 100, EASE_BOTH), kf(234, 100, EASE_BOTH), kf(246, 0, EASE_BOTH), kf(284, 0, EASE_BOTH), kf(294, 100, EASE_BOTH),
    kf(490, 100, EASE_BOTH), kf(502, 0, EASE_BOTH), kf(540, 0, EASE_BOTH), kf(550, 100, EASE_BOTH), kf(700, 100, EASE_BOTH), kf(724, 0),
  ]);
  const runner = layer({
    nm: "runner", ind: 4, ip: 0, op: OP, p: runnerP, o: runnerO,
    shapes: [group([ellipse(30), fill(C.blue, 95)]), group([ellipse(12), fill(C.white, 60)])],
  });

  // 실수 X 2개 (장애물 위치에서 팝) → 칩이 문서로 날아감 → 방패로 교체
  const mkFail = (ind, x, t) => layer({
    nm: `fail-${ind}`, ind, ip: 0, op: OP, p: st([x, RY - 44, 0]), s: popIn(t, 14, 128), o: fadeInOut(t, t + 74, 8),
    shapes: [
      group([ellipse(36), fill(C.red, 95)]),
      group([rect(18, 5, 2.5), fill(C.white)], { r: 45 }),
      group([rect(18, 5, 2.5), fill(C.white)], { r: -45 }),
    ],
  });
  const mkChip = (ind, x, t, col) => layer({
    nm: `chip-${ind}`, ind, ip: 0, op: OP,
    p: an([kf(t, [x, RY - 60, 0], EASE_BOTH), kf(t + 40, [DX, DY + 30, 0])]),
    o: fadeInOut(t, t + 44, 8),
    shapes: [group([rect(40, 18, 9), fill(col, 92)])],
  });
  const mkShield = (ind, x, t, col) => layer({
    nm: `shield-${ind}`, ind, ip: 0, op: OP, p: st([x, RY - 34, 0]), s: popIn(t, 16), o: an([kf(t, 0), kf(t + 10, 100, EASE_BOTH), kf(726, 100, EASE_BOTH), kf(756, 0)]),
    shapes: [
      group([path([[0, -30], [24, -18], [24, 8], [0, 28], [-24, 8], [-24, -18]], true), fill(col, 88)], {}, null,
        an([kf(t, [100, 100, 100], EASE_BOTH), kf(t + 10, [100, 100, 100], EASE_BOTH)].concat(
          [590, 616].map((tt) => [kf(tt, [100, 100, 100], EASE_BOTH), kf(tt + 12, [120, 120, 100], EASE_BOTH), kf(tt + 24, [100, 100, 100], EASE_BOTH)]).flat()
        ).concat([kf(OP, [100, 100, 100])]))),
      group([path([[-8, -2], [-2, 5], [9, -8]]), strokeShape(C.white, 4)]),
    ],
  });

  const fail1 = mkFail(5, OB1, 116);
  const chip1 = mkChip(6, OB1, 152, C.orange);
  const shield1 = mkShield(7, OB1, 206, C.orange);
  const fail2 = mkFail(8, OB2, 372);
  const chip2 = mkChip(9, OB2, 408, C.pink);
  const shield2 = mkShield(10, OB2, 462, C.pink);

  // 완주 축하 점 5개
  const confetti = [0, 1, 2, 3, 4].map((i) => layer({
    nm: `conf-${i}`, ind: 11 + i, ip: 0, op: OP,
    p: an([kf(656, [FIN - 10, RY - 30, 0], EASE_OUT), kf(700, [FIN - 60 + i * 26, RY - 96 - (i % 3) * 22, 0])]),
    o: fadeInOut(656, 712, 8),
    shapes: [group([ellipse(10), fill([C.green, C.teal, C.yellow, C.pink, C.blue][i], 92)])],
  }));

  save("harness-loop.json", doc("harness-loop", W, H, OP, [runway, flag, docCard, runner, fail1, chip1, shield1, fail2, chip2, shield2, ...confetti]));
}

/* ════════ 13. injection-shield — 640×300, 520f ════════ */
{
  const W = 640, H = 300, OP = 520;
  const fadeAll = an([kf(0, 100, EASE_BOTH), kf(488, 100, EASE_BOTH), kf(516, 0)]);

  // 외부 문서 카드 (좌측): 정상 줄 + 숨은 빨간 줄
  const docCard = layer({
    nm: "doc", ind: 1, ip: 0, op: OP, p: st([110, 130, 0]), s: popIn(6, 14), o: fadeAll,
    shapes: [
      group([rect(140, 180, 16), fill(C.card, 70)]),
      group([rect(140, 180, 16), strokeShape(C.slate, 2.5, 55)]),
      group([rect(96, 7, 3.5), fill(C.slate, 70)], { y: -62 }),
      group([rect(96, 7, 3.5), fill(C.slate, 55)], { y: -40 }),
      group([rect(70, 7, 3.5), fill(C.slate, 55)], { y: -18, x: -13 }),
      // 숨은 명령 (반짝이는 빨강)
      group([rect(96, 7, 3.5), fill(C.red, 90)], { y: 8 }, an([kf(0, 20, EASE_BOTH), kf(40, 20, EASE_BOTH), kf(58, 95, EASE_BOTH), kf(76, 30, EASE_BOTH), kf(94, 95, EASE_BOTH), kf(480, 95, EASE_BOTH), kf(510, 0)])),
      group([rect(84, 7, 3.5), fill(C.slate, 55)], { y: 34, x: -6 }),
      group([rect(60, 7, 3.5), fill(C.slate, 45)], { y: 56, x: -18 }),
    ],
  });

  // 모델 (우측)
  const model = layer({
    nm: "model", ind: 2, ip: 0, op: OP, p: st([520, 130, 0]), s: popIn(16, 14), o: fadeAll,
    shapes: [group([ellipse(72), fill(C.purple, 90)]), group([ellipse(30), fill(C.white, 50)])],
  });

  // 방패 (모델 앞)
  const SHX = 392;
  const shield = layer({
    nm: "shield", ind: 3, ip: 0, op: OP, p: st([SHX, 130, 0]), s: popIn(30, 16), o: fadeAll,
    shapes: [
      group([path([[0, -52], [40, -32], [40, 14], [0, 48], [-40, 14], [-40, -32]], true), fill(C.teal, 30)]),
      group([path([[0, -52], [40, -32], [40, 14], [0, 48], [-40, 14], [-40, -32]], true), strokeShape(C.teal, 3.5, 90)], {}, null,
        an([kf(0, [100, 100, 100], EASE_BOTH), kf(150, [100, 100, 100], EASE_BOTH), kf(162, [116, 116, 100], EASE_BOTH), kf(176, [100, 100, 100], EASE_BOTH), kf(310, [100, 100, 100], EASE_BOTH), kf(322, [116, 116, 100], EASE_BOTH), kf(336, [100, 100, 100], EASE_BOTH), kf(OP, [100, 100, 100])])),
    ],
  });

  // 데이터(회색 점): 방패를 통과해 모델로 (2회)
  const mkData = (ind, t, y0) => layer({
    nm: `data-${ind}`, ind, ip: 0, op: OP,
    p: an([kf(t, [186, y0, 0], EASE_BOTH), kf(t + 70, [520 - 40, 130, 0])]),
    o: fadeInOut(t, t + 72, 8),
    shapes: [group([rect(34, 16, 8), fill(C.slate, 80)])],
  });

  // 숨은 명령(빨강): 방패에 충돌 → 튕겨나가 격리 박스로 낙하 (2회)
  const mkInj = (ind, t) => layer({
    nm: `inj-${ind}`, ind, ip: 0, op: OP,
    p: an([
      kf(t, [186, 138, 0], EASE_BOTH), kf(t + 44, [SHX - 46, 132, 0], EASE_OUT),
      kf(t + 78, [SHX - 66, 236, 0]),
    ]),
    o: fadeInOut(t, t + 80, 8),
    shapes: [group([rect(34, 16, 8), fill(C.red, 92)]), group([path([[-10, 4], [-3, -4], [4, 4], [11, -4]]), strokeShape(C.white, 2.5, 90)])],
  });
  // 충돌 플래시
  const mkFlash = (ind, t) => layer({
    nm: `flash-${ind}`, ind, ip: 0, op: OP, p: st([SHX - 44, 130, 0]), s: popIn(t, 10, 150), o: fadeInOut(t, t + 26, 6),
    shapes: [group([path([[0, -18], [5, -5], [18, 0], [5, 5], [0, 18], [-5, 5], [-18, 0], [-5, -5]], true), fill(C.yellow, 95)])],
  });

  // 격리 박스
  const jail = layer({
    nm: "jail", ind: 10, ip: 0, op: OP, p: st([SHX - 66, 244, 0]), s: popIn(96, 14), o: fadeAll,
    shapes: [
      group([rect(96, 58, 12), strokeShape(C.red, 2.5, 70)]),
      ...dashedLine(80, 5, C.red, 3, 50),
    ],
  });

  // 모델의 정상 출력 (하단 우측): 초록 체크 카드
  const okOut = layer({
    nm: "ok", ind: 11, ip: 0, op: OP, p: st([520, 246, 0]), s: popIn(410, 16), o: fadeAll,
    shapes: [
      group([rect(120, 48, 12), fill(C.card)]),
      group([rect(120, 48, 12), strokeShape(C.green, 2.5, 80)]),
      group([path([[-9, 0], [-2.5, 7], [10, -8]]), strokeShape(C.green, 4.5)], { x: -36 }),
      group([rect(56, 6, 3), fill(C.slate, 75)], { x: 12 }),
    ],
  });

  save("injection-shield.json", doc("injection-shield", W, H, OP, [
    docCard, model, shield,
    mkData(4, 120, 92), mkData(5, 290, 74),
    mkInj(6, 150), mkInj(7, 310),
    mkFlash(8, 192), mkFlash(9, 352),
    jail, okOut,
  ]));
}

/* ════════ 14. fluency-compass — 680×320, 640f ════════ */
{
  const W = 680, H = 320, OP = 640;
  const CX = 268, CY = 160, R = 108;
  const fadeAll = an([kf(0, 100, EASE_BOTH), kf(606, 100, EASE_BOTH), kf(636, 0)]);

  // 나침반 본체
  const face = layer({
    nm: "face", ind: 1, ip: 0, op: OP, p: st([CX, CY, 0]), s: popIn(6, 18), o: fadeAll,
    shapes: [
      group([ellipse(R * 2 + 26), strokeShape(C.slate, 2, 30)]),
      group([ellipse(R * 2 - 30), strokeShape(C.slate, 1.5, 22)]),
      ...[0, 90, 180, 270].map((r) => group([rect(4, 14, 2), fill(C.slate, 55)], { x: (R + 22) * Math.sin((r * Math.PI) / 180), y: -(R + 22) * Math.cos((r * Math.PI) / 180), r })),
    ],
  });

  // 4D 스테이션: 위임(N, blue) · 묘사(E, teal) · 분별(S, orange) · 책임(W, purple)
  const dAngles = [-90, 0, 90, 180];
  const dCols = [C.blue, C.teal, C.orange, C.purple];
  const dGlyphs = [
    [group([tri(9), fill(C.white, 92)], { r: 90 }), group([rect(14, 4.5, 2.25), fill(C.white, 92)], { x: -8 })], // 위임: 전달 화살표
    [group([rect(20, 4.5, 2.25), fill(C.white, 92)], { y: -6 }), group([rect(13, 4.5, 2.25), fill(C.white, 70)], { y: 4, x: -3 })], // 묘사: 글줄
    [group([ellipse(18), strokeShape(C.white, 4, 92)], { x: -3, y: -3 }), group([rect(4, 11, 2), fill(C.white, 92)], { x: 8, y: 9, r: -45 })], // 분별: 돋보기
    [group([path([[0, -13], [11, -7], [11, 4], [0, 12], [-11, 4], [-11, -7]], true), strokeShape(C.white, 3.5, 92)])], // 책임: 방패
  ];
  const hitT = [70, 200, 330, 460];
  const dNodes = dAngles.map((deg, i) => {
    const a = (deg * Math.PI) / 180;
    return layer({
      nm: `d-${i}`, ind: 2 + i, ip: 0, op: OP, p: st([CX + (R - 24) * Math.cos(a), CY + (R - 24) * Math.sin(a), 0]),
      s: popIn(16 + i * 12, 14), o: fadeAll,
      shapes: [
        group([ellipse(50), fill(C.card)]),
        group([ellipse(50), strokeShape(dCols[i], 3, 55)], {}, an([kf(0, 55, EASE_BOTH), kf(hitT[i], 55, EASE_BOTH), kf(hitT[i] + 14, 100)]), pulse(hitT[i], 30, 122)),
        ...dGlyphs[i],
      ],
    });
  });

  // 바늘: N→E→S→W 순서로 회전 (연속, 정지 구간 포함)
  const needle = layer({
    nm: "needle", ind: 6, ip: 0, op: OP, p: st([CX, CY, 0]),
    r: an([
      kf(20, -140, EASE_BOTH), kf(hitT[0], 0, EASE_BOTH), kf(hitT[0] + 76, 0, EASE_BOTH),
      kf(hitT[1], 90, EASE_BOTH), kf(hitT[1] + 76, 90, EASE_BOTH),
      kf(hitT[2], 180, EASE_BOTH), kf(hitT[2] + 76, 180, EASE_BOTH),
      kf(hitT[3], 270, EASE_BOTH), kf(hitT[3] + 76, 270, EASE_BOTH), kf(600, 315),
    ]),
    o: fadeIn(18, 12),
    shapes: [
      group([path([[0, -R + 46], [9, 0], [-9, 0]], true), fill(C.red, 92)], { y: -(R - 46) / 2 - 0 }),
      group([path([[0, R - 62], [8, 0], [-8, 0]], true), fill(C.white, 55)], { y: (R - 62) / 2 }),
      group([ellipse(16), fill(C.white, 90)]),
    ],
  });

  // 우측 패널: 4D 바 4개 — 바늘이 가리킬 때 채워짐
  const PX = 548;
  const bars = dCols.map((col, i) => layer({
    nm: `bar-${i}`, ind: 7 + i, ip: 0, op: OP, p: st([PX, 76 + i * 56, 0]), o: fadeAll,
    shapes: [
      group([ellipse(16), fill(col, 90)], { x: -86 }),
      group([rect(150, 16, 8), strokeShape(C.slate, 2, 45)], { x: 8 }),
      group([group([rect(150, 16, 8), fill(col, 80)], { x: 75 })], { x: 8 - 75 }, null,
        an([kf(hitT[i], [0, 100], EASE_OUT), kf(hitT[i] + 60, [100, 100])])),
    ],
  }));

  // 모두 채워지면 중심 글로우
  const glow = layer({
    nm: "glow", ind: 11, ip: 0, op: OP, p: st([CX, CY, 0]), s: popIn(548, 20),
    o: fadeInOut(548, 620, 14),
    shapes: [group([ellipse(46), fill(C.green, 92)]), group([path([[-11, 0], [-3, 8], [12, -10]]), strokeShape(C.white, 5)])],
  });

  save("fluency-compass.json", doc("fluency-compass", W, H, OP, [face, ...dNodes, needle, ...bars, glow]));
}
