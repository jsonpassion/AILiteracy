/*
 * AILiteracy — Lottie 1부 (기초 개념 5종)
 *   1. hero-ai.json           : 토큰이 모델(노드 링)로 흘러들고 답변 줄이 타이핑되는 히어로
 *   2. literacy-waves.json    : 문해력의 세 물결 — 책 → 디지털 → AI
 *   3. next-token.json        : 후보 토큰 확률 바 → 최고 확률 토큰이 문장에 붙는 루프
 *   4. training-pipeline.json : 사전학습 → 미세조정 → 인간 피드백, 3개의 게이트를 지나는 모델
 *   5. thought-planning.json  : 시의 운율 단어가 먼저 정해지고 문장이 거꾸로 채워지는 계획
 * 실행: node tools/generate-basics.mjs
 */
import { C, EASE_OUT, EASE_BOTH, kf, an, st, rect, ellipse, fill, strokeShape, path, group, layer, doc, popIn, fadeIn, fadeInOut, pulse, textBar, tri, dashedLine, save } from "./lottie-lib.mjs";

/* ════════ 1. hero-ai — 760×340, 480f(8s) 루프 ════════ */
{
  const W = 760, H = 340, OP = 480;
  const MX = 350, MY = 170, R = 62;

  // 모델: 중심 노드 + 8개 노드 링 + 엣지
  const nodes = [];
  const edges = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const x = R * Math.cos(a), y = R * Math.sin(a);
    edges.push(group([path([[x, y], [0, 0]]), strokeShape(C.slate, 2, 28)]));
    nodes.push(group([ellipse(15), fill(i % 2 ? C.teal : C.blue, 90)], { x, y }, null, pulse(30 + i * 26, 26, 132)));
  }
  const model = layer({
    nm: "model", ind: 1, ip: 0, op: OP, p: st([MX, MY, 0]), s: popIn(0, 18),
    shapes: [
      group([ellipse(R * 2 + 62), strokeShape(C.slate, 1.5, 18)]),
      ...edges,
      group([ellipse(26), fill(C.purple, 95)], {}, null, pulse(10, 40, 115)),
      ...nodes,
    ],
  });
  // 외곽 헤일로: 점 12개 링이 천천히 회전
  const haloDots = [];
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    haloDots.push(group([ellipse(6), fill(C.slate, 45)], { x: 118 * Math.cos(a), y: 118 * Math.sin(a) }));
  }
  const halo = layer({
    nm: "halo", ind: 2, ip: 0, op: OP, p: st([MX, MY, 0]),
    r: an([kf(0, 0), kf(OP, 120)]), o: fadeIn(12, 14),
    shapes: [group(haloDots)],
  });

  // 토큰 칩: 좌측에서 모델로 흘러드는 3웨이브 × 3칩
  const chipCols = [C.blue, C.teal, C.orange];
  const chips = [];
  let ind = 3;
  for (let wave = 0; wave < 3; wave++) {
    for (let j = 0; j < 3; j++) {
      const t0 = wave * 150 + j * 22;
      const y0 = 110 + j * 58;
      chips.push(layer({
        nm: `chip-${wave}-${j}`, ind: ind++, ip: 0, op: OP,
        p: an([kf(t0, [46, y0, 0], EASE_BOTH), kf(t0 + 90, [MX - 88, MY + (j - 1) * 20, 0])]),
        o: fadeInOut(t0, t0 + 92, 12),
        shapes: [group([rect(58, 26, 13), fill(C.card)]), group([rect(58, 26, 13), strokeShape(C.slate, 1.5, 40)]), group([rect(32, 7, 3.5), fill(chipCols[j], 90)])],
      }));
    }
  }

  // 우측 답변 카드: 텍스트 바 4줄이 타이핑되듯 자람
  const ansX = 585, ansW = [150, 168, 118, 146];
  const ansBars = ansW.map((w, i) => {
    const t0 = 70 + i * 62;
    return layer({
      nm: `ans-${i}`, ind: ind++, ip: 0, op: OP, p: st([ansX - 78, 116 + i * 34, 0]),
      o: an([kf(t0, 0), kf(t0 + 4, 100, EASE_BOTH), kf(440, 100, EASE_BOTH), kf(468, 0)]),
      shapes: [group([group([rect(w, 11, 5.5), fill(i === 0 ? C.green : C.slate, i === 0 ? 85 : 60)], { x: w / 2 })], {}, null,
        an([kf(t0, [0, 100], EASE_OUT), kf(t0 + 34, [100, 100])]))],
    });
  });
  const ansFrame = layer({
    nm: "ans-frame", ind: ind++, ip: 0, op: OP, p: st([ansX, 170, 0]), s: popIn(46, 16),
    shapes: [group([rect(206, 168, 18), fill(C.card, 45)]), group([rect(206, 168, 18), strokeShape(C.slate, 2, 45)])],
  });
  // 커서 깜빡임
  const caret = layer({
    nm: "caret", ind: ind++, ip: 0, op: OP, p: st([ansX - 78 + 152, 218 + 34, 0]),
    o: an([kf(320, 0), kf(328, 100, EASE_BOTH), kf(352, 0, EASE_BOTH), kf(376, 100, EASE_BOTH), kf(400, 0, EASE_BOTH), kf(424, 100, EASE_BOTH), kf(448, 0)]),
    shapes: [group([rect(3.5, 16, 1.75), fill(C.green, 95)])],
  });
  // 모델 → 답변 연결 대시
  const link = layer({
    nm: "link", ind: ind++, ip: 0, op: OP, p: st([(MX + R + ansX - 103) / 2 + 10, MY, 0]), o: fadeIn(56, 14),
    shapes: [group(dashedLine(96, 5, C.slate, 3, 45))],
  });

  save("hero-ai.json", doc("hero-ai", W, H, OP, [model, halo, ...chips, ansFrame, ...ansBars, caret, link]));
}

/* ════════ 2. literacy-waves — 640×300, 440f ════════ */
{
  const W = 640, H = 300, OP = 440;
  const XS = [140, 320, 500], Y = 128;

  const card = (ind, x, t, iconGroups, ringCol) => layer({
    nm: `st-${ind}`, ind, ip: 0, op: OP, p: st([x, Y, 0]), s: popIn(t, 16),
    o: an([kf(0, 100, EASE_BOTH), kf(414, 100, EASE_BOTH), kf(438, 0)]),
    shapes: [
      group([rect(118, 118, 26), fill(C.card)]),
      group([rect(118, 118, 26), strokeShape(ringCol, 2.5, 55)]),
      ...iconGroups,
    ],
  });

  // 아이콘 1: 책
  const book = [
    group([rect(54, 70, 6), fill(C.blue, 88)]),
    group([rect(9, 70, 3), fill(C.white, 80)], { x: -20 }),
    group([rect(30, 6, 3), fill(C.white, 85)], { y: -6, x: 3 }),
    group([rect(30, 6, 3), fill(C.white, 60)], { y: 8, x: 3 }),
  ];
  // 아이콘 2: 모니터
  const monitor = [
    group([rect(72, 50, 8), fill(C.cardLight)], { y: -10 }),
    group([rect(72, 50, 8), strokeShape(C.teal, 2.5, 80)], { y: -10 }),
    group([rect(40, 6, 3), fill(C.teal, 85)], { y: -18 }),
    group([rect(26, 6, 3), fill(C.teal, 55)], { y: -4 }),
    group([rect(10, 12, 3), fill(C.slate, 70)], { y: 22 }),
    group([rect(36, 6, 3), fill(C.slate, 70)], { y: 31 }),
  ];
  // 아이콘 3: AI 스파크 (4포인트 별 + 궤도 점)
  const spark = [
    group([path([[0, -30], [7.5, -7.5], [30, 0], [7.5, 7.5], [0, 30], [-7.5, 7.5], [-30, 0], [-7.5, -7.5]], true), fill(C.purple, 92)], {}, null, pulse(140, 46, 116)),
    group([path([[0, -12], [3, -3], [12, 0], [3, 3], [0, 12], [-3, 3], [-12, 0], [-3, -3]], true), fill(C.pink, 90)], { x: 26, y: -26 }, fadeIn(150, 12)),
  ];

  const cards = [
    card(1, XS[0], 14, book, C.blue),
    card(2, XS[1], 64, monitor, C.teal),
    card(3, XS[2], 114, spark, C.purple),
  ];

  // 타임라인 + 점 3개
  const tl = layer({
    nm: "timeline", ind: 4, ip: 0, op: OP, p: st([320, 238, 0]), o: fadeIn(6, 12),
    shapes: [
      group([rect(430, 3, 1.5), fill(C.slate, 35)]),
      ...XS.map((x, i) => group([ellipse(13), fill([C.blue, C.teal, C.purple][i], 90)], { x: x - 320 }, fadeIn(18 + i * 50, 10), popIn(18 + i * 50, 14))),
    ],
  });

  // 하이라이트 링: 세 카드를 순회
  const ring = layer({
    nm: "ring", ind: 5, ip: 0, op: OP,
    p: an([
      kf(170, [XS[0], Y, 0], EASE_BOTH), kf(230, [XS[0], Y, 0], EASE_BOTH),
      kf(260, [XS[1], Y, 0], EASE_BOTH), kf(320, [XS[1], Y, 0], EASE_BOTH),
      kf(350, [XS[2], Y, 0], EASE_BOTH), kf(430, [XS[2], Y, 0]),
    ]),
    o: an([kf(170, 0, EASE_BOTH), kf(184, 100, EASE_BOTH), kf(412, 100, EASE_BOTH), kf(436, 0)]),
    shapes: [group([rect(134, 134, 30), strokeShape(C.yellow, 3.5, 85)])],
  });

  save("literacy-waves.json", doc("literacy-waves", W, H, OP, [...cards, tl, ring]));
}

/* ════════ 3. next-token — 640×300, 520f ════════ */
{
  const W = 640, H = 300, OP = 520;
  const SY = 62;

  // 이미 쓰인 문장 토큰 (그레이 바)
  const sw = [58, 42, 66];
  let sx = 92;
  const sent = sw.map((w, i) => {
    const g = group([rect(w, 24, 12), fill(C.cardLight)], { x: sx + w / 2 });
    sx += w + 10;
    return g;
  });
  const sentLayer = layer({
    nm: "sentence", ind: 1, ip: 0, op: OP, p: st([0, SY, 0]), o: an([kf(0, 100, EASE_BOTH), kf(492, 100, EASE_BOTH), kf(516, 0)]),
    shapes: [...sent],
  });
  const appendX1 = sx + 34, appendX2 = sx + 34 + 78;

  // 후보 3종: 칩 + 확률 트랙
  const candCols = [C.blue, C.teal, C.orange];
  const candY = [138, 188, 238];
  // 라운드 1 확률: 62/28/10 → 라운드 2: 20/52/28 (다른 후보가 이김)
  const p1 = [0.62, 0.28, 0.10], p2 = [0.20, 0.52, 0.28];
  const TRACK = 250;
  const cands = candY.map((y, i) => layer({
    nm: `cand-${i}`, ind: 2 + i, ip: 0, op: OP, p: st([150, y, 0]),
    o: an([kf(10 + i * 8, 0, EASE_BOTH), kf(22 + i * 8, 100, EASE_BOTH), kf(478, 100, EASE_BOTH), kf(505, 0)]),
    shapes: [
      group([rect(56, 30, 15), fill(candCols[i], 90)]),
      group([rect(30, 7, 3.5), fill(C.white, 90)]),
      group([rect(TRACK, 14, 7), strokeShape(C.slate, 2, 40)], { x: 40 + TRACK / 2 }),
      // 확률 채움 바: 좌측 기준 성장, 라운드마다 폭 변화
      group([group([rect(TRACK, 14, 7), fill(candCols[i], 75)], { x: TRACK / 2 })], { x: 40 }, null,
        an([
          kf(24, [0, 100], EASE_OUT), kf(70, [p1[i] * 100, 100], EASE_BOTH),
          kf(225, [p1[i] * 100, 100], EASE_BOTH), kf(275, [p2[i] * 100, 100]),
        ])),
    ],
  }));

  // 승자 하이라이트 링 (라운드 1: 후보 0 / 라운드 2: 후보 1)
  const hl = (ind, y, tIn, tOut) => layer({
    nm: `hl-${ind}`, ind, ip: 0, op: OP, p: st([150, y, 0]), o: fadeInOut(tIn, tOut, 10),
    shapes: [group([rect(68, 42, 21), strokeShape(C.yellow, 3, 90)], {}, null, pulse(tIn + 12, 26, 112))],
  });

  // 문장에 날아가 붙는 칩
  const fly = (ind, fromY, toX, col, t0) => layer({
    nm: `fly-${ind}`, ind, ip: 0, op: OP,
    p: an([kf(t0, [150, fromY, 0], EASE_OUT), kf(t0 + 34, [toX, SY, 0])]),
    o: an([kf(t0, 0), kf(t0 + 5, 100, EASE_BOTH), kf(492, 100, EASE_BOTH), kf(516, 0)]),
    shapes: [group([rect(56, 26, 13), fill(col, 90)]), group([rect(30, 6, 3), fill(C.white, 85)])],
  });

  // 커서
  const caret = layer({
    nm: "caret", ind: 12, ip: 0, op: OP,
    p: an([kf(0, [sx + 4, SY, 0], EASE_BOTH), kf(110, [sx + 4, SY, 0], EASE_BOTH), kf(150, [appendX1 + 40, SY, 0], EASE_BOTH), kf(320, [appendX1 + 40, SY, 0], EASE_BOTH), kf(355, [appendX2 + 40, SY, 0])]),
    o: an([kf(0, 100, EASE_BOTH), kf(20, 0, EASE_BOTH), kf(40, 100, EASE_BOTH), kf(60, 0, EASE_BOTH), kf(80, 100, EASE_BOTH), kf(400, 100, EASE_BOTH), kf(420, 0, EASE_BOTH), kf(440, 100, EASE_BOTH), kf(470, 0)]),
    shapes: [group([rect(3.5, 22, 1.75), fill(C.green, 95)])],
  });

  save("next-token.json", doc("next-token", W, H, OP, [
    sentLayer, ...cands,
    hl(5, candY[0], 84, 132), hl(6, candY[1], 292, 340),
    fly(7, candY[0], appendX1, candCols[0], 110),
    fly(8, candY[1], appendX2, candCols[1], 318),
    caret,
  ]));
}

/* ════════ 4. training-pipeline — 680×300, 560f ════════ */
{
  const W = 680, H = 300, OP = 560;
  const GY = 178, GX = [180, 350, 520];

  // 컨베이어
  const belt = layer({
    nm: "belt", ind: 1, ip: 0, op: OP, p: st([340, GY + 62, 0]), o: fadeIn(0, 10),
    shapes: [group([rect(590, 4, 2), fill(C.slate, 30)])],
  });

  // 게이트 3종
  const gateIcon1 = [ // 문서 더미
    group([rect(44, 56, 6), fill(C.cardLight)], { x: 6, y: -6 }),
    group([rect(44, 56, 6), fill(C.card)], { x: -3, y: 3 }),
    group([rect(44, 56, 6), strokeShape(C.blue, 2, 70)], { x: -3, y: 3 }),
    group([rect(26, 5, 2.5), fill(C.blue, 80)], { x: -3, y: -10 }),
    group([rect(26, 5, 2.5), fill(C.slate, 60)], { x: -3, y: 2 }),
    group([rect(18, 5, 2.5), fill(C.slate, 60)], { x: -7, y: 14 }),
  ];
  const gateIcon2 = [ // 대화 쌍 (말풍선 2개)
    group([rect(52, 30, 14), fill(C.orange, 85)], { x: -8, y: -14 }),
    group([rect(30, 6, 3), fill(C.white, 90)], { x: -8, y: -14 }),
    group([rect(52, 30, 14), fill(C.cardLight)], { x: 8, y: 16 }),
    group([rect(30, 6, 3), fill(C.slate, 80)], { x: 8, y: 16 }),
  ];
  const gateIcon3 = [ // 사람 피드백: + / − 칩과 체크
    group([ellipse(34), fill(C.green, 85)], { x: -18, y: -6 }),
    group([rect(16, 4.5, 2.25), fill(C.white)], { x: -18, y: -6 }),
    group([rect(4.5, 16, 2.25), fill(C.white)], { x: -18, y: -6 }),
    group([ellipse(34), fill(C.pink, 80)], { x: 18, y: 10 }),
    group([rect(16, 4.5, 2.25), fill(C.white)], { x: 18, y: 10 }),
  ];
  const gates = [gateIcon1, gateIcon2, gateIcon3].map((icon, i) => layer({
    nm: `gate-${i}`, ind: 2 + i, ip: 0, op: OP, p: st([GX[i], 88, 0]), s: popIn(8 + i * 20, 16),
    o: an([kf(0, 100, EASE_BOTH), kf(530, 100, EASE_BOTH), kf(556, 0)]),
    shapes: [
      group([rect(104, 128, 20), fill(C.card, 55)]),
      group([rect(104, 128, 20), strokeShape([C.blue, C.orange, C.green][i], 2.5, 65)]),
      group(icon, { y: 0 }),
    ],
  }));

  // 모델 볼 + 단계 링 (한 레이어에서 함께 이동)
  const ballP = an([
    kf(20, [56, GY + 40, 0], EASE_BOTH), kf(80, [GX[0], GY + 40, 0], EASE_BOTH),
    kf(170, [GX[0], GY + 40, 0], EASE_BOTH), kf(230, [GX[1], GY + 40, 0], EASE_BOTH),
    kf(320, [GX[1], GY + 40, 0], EASE_BOTH), kf(380, [GX[2], GY + 40, 0], EASE_BOTH),
    kf(470, [GX[2], GY + 40, 0], EASE_BOTH), kf(535, [648, GY + 40, 0]),
  ]);
  const ball = layer({
    nm: "ball", ind: 5, ip: 0, op: OP, p: ballP,
    o: an([kf(14, 0, EASE_BOTH), kf(26, 100, EASE_BOTH), kf(508, 100, EASE_BOTH), kf(540, 0)]),
    shapes: [
      group([ellipse(38), fill(C.blue, 92)]),
      group([ellipse(54), strokeShape(C.teal, 3.5, 90)], {}, fadeIn(150, 16), popIn(150, 18)),
      group([ellipse(68), strokeShape(C.orange, 3.5, 85)], {}, fadeIn(300, 16), popIn(300, 18)),
      group([ellipse(82), strokeShape(C.green, 3.5, 85)], {}, fadeIn(452, 16), popIn(452, 18)),
    ],
  });

  // 게이트 1 통과 시: 데이터 점 6개 낙하
  const rain = [];
  for (let i = 0; i < 6; i++) {
    const t0 = 86 + i * 12;
    rain.push(layer({
      nm: `rain-${i}`, ind: 6 + i, ip: 0, op: OP,
      p: an([kf(t0, [GX[0] - 25 + (i % 3) * 25, 132, 0], EASE_OUT), kf(t0 + 26, [GX[0], GY + 34, 0])]),
      o: fadeInOut(t0, t0 + 28, 6),
      shapes: [group([ellipse(9), fill(C.blue, 85)])],
    }));
  }
  // 게이트 3 통과 시: 체크 팝
  const check = layer({
    nm: "check", ind: 12, ip: 0, op: OP, p: st([GX[2] + 44, GY + 6, 0]), s: popIn(452, 16),
    o: fadeInOut(452, 540, 12),
    shapes: [group([ellipse(34), fill(C.green, 95)]), group([path([[-9, 0], [-2.5, 7], [10, -8]]), strokeShape(C.white, 4.5)])],
  });

  save("training-pipeline.json", doc("training-pipeline", W, H, OP, [belt, ...gates, ball, ...rain, check]));
}

/* ════════ 5. thought-planning — 640×300, 520f ════════ */
{
  const W = 640, H = 300, OP = 520;
  const L1Y = 96, L2Y = 186;
  const w1 = [70, 50, 90, 62], w2 = [60, 82, 52, 70];
  const xs = (ws, x0) => { const out = []; let x = x0; for (const w of ws) { out.push(x + w / 2); x += w + 12; } return out; };
  const x1 = xs(w1, 120), x2 = xs(w2, 120);

  const fadeAll = (o = 100) => an([kf(0, o, EASE_BOTH), kf(490, o, EASE_BOTH), kf(516, 0)]);

  // 1행: 순서대로 팝 (마지막 = 운율 단어, 핑크)
  const line1 = w1.map((w, i) => layer({
    nm: `l1-${i}`, ind: 1 + i, ip: 0, op: OP, p: st([x1[i], L1Y, 0]), s: popIn(14 + i * 22, 14),
    o: fadeAll(),
    shapes: [group([rect(w, 26, 13), fill(i === 3 ? C.pink : C.cardLight, i === 3 ? 90 : 100)])],
  }));

  // 2행 빈 슬롯 (스트로크만)
  const slots = w2.map((w, i) => layer({
    nm: `slot-${i}`, ind: 5 + i, ip: 0, op: OP, p: st([x2[i], L2Y, 0]), o: an([kf(104, 0, EASE_BOTH), kf(118, 100, EASE_BOTH), kf(490, 100, EASE_BOTH), kf(516, 0)]),
    shapes: [group([rect(w, 26, 13), strokeShape(C.slate, 2, 40)])],
  }));

  // 핵심: 마지막 슬롯의 운율 단어가 먼저 등장 (글로우 + 링)
  const rhyme = layer({
    nm: "rhyme-first", ind: 9, ip: 0, op: OP, p: st([x2[3], L2Y, 0]), s: popIn(140, 18, 124),
    o: fadeAll(),
    shapes: [
      group([rect(w2[3] + 22, 48, 24), strokeShape(C.pink, 3, 70)], {}, fadeInOut(140, 260, 14), pulse(160, 40, 112)),
      group([rect(w2[3], 26, 13), fill(C.pink, 92)]),
    ],
  });

  // 나머지 단어가 왼쪽부터 채워짐
  const fillers = [0, 1, 2].map((i) => layer({
    nm: `l2-${i}`, ind: 10 + i, ip: 0, op: OP, p: st([x2[i], L2Y, 0]), s: popIn(240 + i * 34, 14),
    o: fadeAll(),
    shapes: [group([rect(w2[i], 26, 13), fill(C.cardLight)])],
  }));

  // 앞을 내다보는 화살표: 2행 시작점에서 호를 그려 끝의 운율 단어로 도달
  //  — "문장을 쓰기 전에 끝의 운율 단어를 먼저 정해 두고 거기에 도달한다"는 계획성을 직접 표현
  const startX = x2[0] - w2[0] / 2 - 6;    // 2행 왼쪽 시작점
  const endX = x2[3];                       // 운율 단어 x
  const arcPts = [
    [startX, L2Y - 2], [startX + 40, L2Y - 40], [startX + 100, L2Y - 66],
    [startX + 170, L2Y - 74], [endX - 46, L2Y - 66], [endX - 12, L2Y - 42],
    [endX, L2Y - 26], [endX, L2Y - 18],
  ];
  const lookAhead = layer({
    nm: "lookahead-arc", ind: 13, ip: 0, op: OP, o: fadeInOut(150, 486, 18),
    shapes: [
      group([path(arcPts), strokeShape(C.pink, 3.5, 85)]),
      group([ellipse(9), fill(C.pink, 90)], { x: startX, y: L2Y - 2 }), // 시작점 앵커
    ],
  });
  const lookHead = layer({
    nm: "lookahead-head", ind: 14, ip: 0, op: OP, p: st([endX, L2Y - 12, 0]), s: popIn(176, 14, 122),
    o: fadeInOut(150, 486, 18),
    shapes: [group([tri(9), fill(C.pink, 92)], { r: 180 })], // 운율 단어를 향해 아래로
  });

  // 생각 배지: 좌상단 전구 느낌 (원 + 광선 4개)
  const idea = layer({
    nm: "idea", ind: 15, ip: 0, op: OP, p: st([64, 70, 0]), s: popIn(128, 16),
    o: fadeInOut(128, 300, 14),
    shapes: [
      group([ellipse(30), fill(C.yellow, 90)]),
      ...[0, 90, 180, 270].map((r) => group([rect(3.5, 12, 1.75), fill(C.yellow, 80)], { x: 26 * Math.sin((r * Math.PI) / 180), y: -26 * Math.cos((r * Math.PI) / 180), r })),
    ],
  });

  save("thought-planning.json", doc("thought-planning", W, H, OP, [...line1, ...slots, rhyme, ...fillers, lookAhead, lookHead, idea]));
}
