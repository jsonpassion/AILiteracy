/*
 * AILiteracy — Lottie 2부 (대화와 한계 4종)
 *   6. hallucination.json  : 정확도만 채점하면 추측이 이기고, 채점을 바꾸면 정직이 이긴다
 *   7. prompt-anatomy.json : 역할·맥락·과제·형식·예시 블록이 하나의 프롬프트로 조립
 *   8. iterate-loop.json   : 프롬프트 → 출력 → 평가 → 수정 사이클, 돌수록 품질 게이지 상승
 *   9. context-budget.json : 컨텍스트 창이 차오르며 흐려지고, 압축으로 되살아나는 과정
 * 실행: node tools/generate-dialog.mjs
 */
import { C, EASE_OUT, EASE_BOTH, kf, an, st, rect, ellipse, fill, strokeShape, path, group, layer, doc, popIn, fadeIn, fadeInOut, pulse, tri, dashedLine, save } from "./lottie-lib.mjs";

/* ════════ 6. hallucination — 680×320, 640f ════════ */
{
  const W = 680, H = 320, OP = 640;
  const fadeAll = an([kf(0, 100, EASE_BOTH), kf(606, 100, EASE_BOTH), kf(634, 0)]);

  // 질문 카드 (좌측)
  const qCard = layer({
    nm: "question", ind: 1, ip: 0, op: OP, p: st([100, 150, 0]), s: popIn(8, 16), o: fadeAll,
    shapes: [
      group([rect(120, 84, 18), fill(C.card)]),
      group([rect(120, 84, 18), strokeShape(C.slate, 2, 50)]),
      ...[-24, 0, 24].map((x) => group([ellipse(11), fill(C.slate, 70)], { x, y: 0 }, null, pulse(30 + (x + 24) * 1.2, 40, 130))),
    ],
  });

  // 답변 A: 자신만만 오답 (zigzag + X 배지)
  const ansA = layer({
    nm: "ans-guess", ind: 2, ip: 0, op: OP, p: st([320, 92, 0]), s: popIn(50, 16), o: fadeAll,
    shapes: [
      group([rect(160, 66, 16), fill(C.card)]),
      group([rect(160, 66, 16), strokeShape(C.red, 2.5, 70)]),
      group([path([[-52, 8], [-26, -8], [0, 8], [26, -8], [52, 8]]), strokeShape(C.red, 4, 85)]),
      group([ellipse(30), fill(C.red, 95)], { x: 80, y: -33 }, fadeIn(74, 10), popIn(74, 14)),
      group([rect(20, 4.5, 2.25), fill(C.white)], { x: 80, y: -33, r: 45 }, fadeIn(74, 10)),
      group([rect(20, 4.5, 2.25), fill(C.white)], { x: 80, y: -33, r: -45 }, fadeIn(74, 10)),
    ],
  });
  // 답변 B: "모른다" (물결 + 점선 테두리 느낌)
  const ansB = layer({
    nm: "ans-honest", ind: 3, ip: 0, op: OP, p: st([320, 218, 0]), s: popIn(66, 16), o: fadeAll,
    shapes: [
      group([rect(160, 66, 16), fill(C.card, 60)]),
      group([rect(160, 66, 16), strokeShape(C.slate, 2.5, 60)]),
      group([path([[-46, 0], [-23, -7], [0, 0], [23, 7], [46, 0]]), strokeShape(C.slate, 4, 75)]),
      group([ellipse(30), strokeShape(C.teal, 3, 85)], { x: 80, y: -33 }, fadeIn(90, 10), popIn(90, 14)),
      group([rect(16, 4.5, 2.25), fill(C.teal, 90)], { x: 80, y: -33 }, fadeIn(90, 10)),
    ],
  });

  // 스코어보드: 기준선 + 두 막대 (A red, B teal)
  const BASE = 232, AX = 552, BX = 616;
  // A: 1구간에서 크게 상승 → 2구간에서 아래로 반전
  const barA = layer({
    nm: "barA", ind: 4, ip: 0, op: OP, p: st([AX, BASE, 0]), o: fadeAll,
    shapes: [
      // 위로 자라는 막대
      group([group([rect(34, 150, 8), fill(C.red, 85)], { y: -75 })], {}, null,
        an([kf(100, [100, 0], EASE_OUT), kf(180, [100, 78], EASE_BOTH), kf(360, [100, 78], EASE_BOTH), kf(430, [100, 0])])),
      // 아래로 자라는 막대 (감점)
      group([group([rect(34, 150, 8), fill(C.red, 60)], { y: 75 })], {}, null,
        an([kf(400, [100, 0], EASE_OUT), kf(470, [100, 34], EASE_BOTH), kf(OP, [100, 34])])),
    ],
  });
  const barB = layer({
    nm: "barB", ind: 5, ip: 0, op: OP, p: st([BX, BASE, 0]), o: fadeAll,
    shapes: [
      group([group([rect(34, 150, 8), fill(C.teal, 55)], { y: -75 })], {}, null,
        an([kf(120, [100, 0], EASE_OUT), kf(190, [100, 18], EASE_BOTH), kf(380, [100, 18], EASE_BOTH), kf(470, [100, 72], EASE_BOTH), kf(OP, [100, 72])])),
    ],
  });
  const baseline = layer({
    nm: "baseline", ind: 6, ip: 0, op: OP, p: st([584, BASE, 0]), o: fadeAll,
    shapes: [group([rect(130, 3, 1.5), fill(C.slate, 55)])],
  });

  // 별 (승자 표시): 1구간 A 위 → 2구간 B 위
  const star = layer({
    nm: "star", ind: 7, ip: 0, op: OP,
    p: an([kf(200, [AX, BASE - 138, 0], EASE_BOTH), kf(430, [AX, BASE - 138, 0], EASE_BOTH), kf(480, [BX, BASE - 130, 0])]),
    o: fadeInOut(200, 612, 12),
    shapes: [group([path([[0, -16], [4.5, -4.5], [16, 0], [4.5, 4.5], [0, 16], [-4.5, 4.5], [-16, 0], [-4.5, -4.5]], true), fill(C.yellow, 95)], {}, null, pulse(210, 40, 118))],
  });

  // 채점 규칙 변경 배지: 자 모양 (t=360에 등장)
  const ruler = layer({
    nm: "ruler", ind: 8, ip: 0, op: OP, p: st([584, 62, 0]), s: popIn(362, 18),
    o: fadeInOut(362, 616, 14),
    shapes: [
      group([rect(120, 30, 8), fill(C.card)]),
      group([rect(120, 30, 8), strokeShape(C.yellow, 2.5, 90)]),
      ...[-42, -21, 0, 21, 42].map((x) => group([rect(3, 12, 1.5), fill(C.yellow, 85)], { x, y: 4 })),
    ],
  });

  // 흐름 화살표: 질문 → 두 답변
  const arrows = layer({
    nm: "arrows", ind: 9, ip: 0, op: OP, p: st([0, 0, 0]), o: fadeIn(40, 16),
    shapes: [
      group(dashedLine(64, 4, C.slate, 3, 45), { x: 200, y: 118, r: -14 }),
      group(dashedLine(64, 4, C.slate, 3, 45), { x: 200, y: 186, r: 14 }),
    ],
  });

  save("hallucination.json", doc("hallucination", W, H, OP, [qCard, ansA, ansB, barA, barB, baseline, star, ruler, arrows]));
}

/* ════════ 7. prompt-anatomy — 640×300, 560f ════════ */
{
  const W = 640, H = 300, OP = 560;
  const DOCX = 468, DOCY = 152;
  const cols = [C.purple, C.blue, C.green, C.orange, C.teal];
  const starts = [[104, 56], [82, 130], [120, 210], [212, 84], [196, 246]];
  const slotY = (i) => DOCY - 78 + i * 38;

  const fadeAll = an([kf(0, 100, EASE_BOTH), kf(528, 100, EASE_BOTH), kf(556, 0)]);

  // 문서 프레임 (접힌 모서리 삼각형은 노이즈로 보여 제거)
  const docFrame = layer({
    nm: "doc", ind: 1, ip: 0, op: OP, p: st([DOCX, DOCY, 0]), s: popIn(6, 16), o: fadeAll,
    shapes: [
      group([rect(190, 232, 18), fill(C.card, 45)]),
      group([rect(190, 232, 18), strokeShape(C.slate, 2.5, 55)], {}, null, pulse(300, 36, 104)),
    ],
  });

  // 5개 블록: 흩어진 위치 → 문서 안으로 순차 비행
  const blocks = cols.map((col, i) => {
    const t0 = 40 + i * 46;
    return layer({
      nm: `blk-${i}`, ind: 2 + i, ip: 0, op: OP,
      p: an([
        kf(0, [...starts[i], 0], EASE_BOTH),
        kf(t0, [...starts[i], 0], EASE_OUT),
        kf(t0 + 26, [DOCX, slotY(i) + 6, 0], EASE_BOTH),
        kf(t0 + 34, [DOCX, slotY(i), 0]),
      ]),
      s: popIn(4 + i * 8, 14), o: fadeAll,
      shapes: [
        group([rect(152, 30, 10), fill(col, 88)]),
        group([rect(84 - i * 8, 7, 3.5), fill(C.white, 88)], { x: -20 }),
        group([ellipse(12), fill(C.white, 60)], { x: 58 }),
      ],
    });
  });

  // 조립 완료 스파크
  const spark = layer({
    nm: "spark", ind: 7, ip: 0, op: OP, p: st([DOCX + 108, DOCY - 118, 0]), s: popIn(300, 18),
    o: fadeInOut(300, 430, 14),
    shapes: [
      group([path([[0, -20], [5.5, -5.5], [20, 0], [5.5, 5.5], [0, 20], [-5.5, 5.5], [-20, 0], [-5.5, -5.5]], true), fill(C.yellow, 95)], {}, null, pulse(312, 44, 122)),
    ],
  });

  // 출력 별: 문서에서 오른쪽 아래로 발사 → 결과 카드 대신 별+링
  const result = layer({
    nm: "result", ind: 8, ip: 0, op: OP, p: st([DOCX, DOCY, 0]),
    o: fadeInOut(340, 470, 14),
    shapes: [group([ellipse(250), strokeShape(C.green, 3, 55)], {}, null,
      an([kf(340, [40, 40, 100], EASE_OUT), kf(430, [100, 100, 100], EASE_BOTH), kf(470, [112, 112, 100])]))],
  });

  save("prompt-anatomy.json", doc("prompt-anatomy", W, H, OP, [docFrame, ...blocks, spark, result]));
}

/* ════════ 8. iterate-loop — 640×300, 480f ════════ */
{
  const W = 640, H = 300, OP = 480;
  const CX = 232, CY = 152, R = 92;
  const nodeAngles = [-90, 0, 90, 180]; // 상(프롬프트)·우(출력)·하(평가)·좌(수정)
  const nodeCols = [C.blue, C.teal, C.orange, C.purple];

  const fadeAll = an([kf(0, 100, EASE_BOTH), kf(448, 100, EASE_BOTH), kf(476, 0)]);

  // 궤도 링
  const orbit = layer({
    nm: "orbit", ind: 1, ip: 0, op: OP, p: st([CX, CY, 0]), o: fadeIn(4, 12),
    shapes: [group([ellipse(R * 2), strokeShape(C.slate, 2.5, 30)])],
  });

  // 노드 4개 (도는 점이 지나는 시점마다 펄스: 주기 133f, 상단 t=0 기준)
  const nodes = nodeAngles.map((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const glyphs = [
      [group([rect(22, 5, 2.5), fill(C.white, 90)], { y: -5 }), group([rect(14, 5, 2.5), fill(C.white, 60)], { y: 5, x: -4 })], // 프롬프트: 줄
      [group([rect(5, 18, 2.5), fill(C.white, 90)], { x: -7, y: 2, r: 18 }), group([rect(5, 26, 2.5), fill(C.white, 90)], { x: 5, r: 18 })], // 출력: 바
      [group([path([[-8, 0], [-2, 6], [9, -7]]), strokeShape(C.white, 4)])], // 평가: 체크
      [group([ellipse(20), strokeShape(C.white, 4, 90)]), group([tri(6), fill(C.white, 90)], { x: 10, y: -1, r: 90 })], // 수정: 순환 화살표
    ][i];
    return layer({
      nm: `node-${i}`, ind: 2 + i, ip: 0, op: OP, p: st([CX + R * Math.cos(a), CY + R * Math.sin(a), 0]),
      s: popIn(10 + i * 14, 14), o: fadeAll,
      shapes: [
        group([ellipse(52), fill(C.card)]),
        group([ellipse(52), strokeShape(nodeCols[i], 3, 85)], {}, null,
          an([0, 1, 2].reduce((acc, lap) => {
            const t = lap * 133 + (i * 133) / 4 + 34;
            return acc.concat([kf(t, [100, 100, 100], EASE_BOTH), kf(t + 12, [122, 122, 100], EASE_BOTH), kf(t + 24, [100, 100, 100], EASE_BOTH)]);
          }, [kf(0, [100, 100, 100], EASE_BOTH)]).concat([kf(OP, [100, 100, 100])]))),
        ...glyphs,
      ],
    });
  });

  // 도는 펄스 점 (레이어 회전, 3바퀴)
  const runner = layer({
    nm: "runner", ind: 6, ip: 0, op: OP, p: st([CX, CY, 0]),
    r: an([kf(34, 0), kf(433, 360 * 3)]), o: fadeInOut(30, 440, 10),
    shapes: [group([ellipse(15), fill(C.white, 95)], { y: -R }), group([ellipse(26), strokeShape(C.yellow, 2.5, 70)], { y: -R })],
  });

  // 품질 게이지 (우측): 3단계 상승, 마지막에 초록
  const GX = 540, GY = 152;
  const gauge = layer({
    nm: "gauge", ind: 7, ip: 0, op: OP, p: st([GX, GY, 0]), o: fadeAll,
    shapes: [
      group([rect(40, 170, 12), strokeShape(C.slate, 2.5, 50)]),
      // 채움: 아래 고정 성장 (33 → 66 → 100%)
      group([group([rect(32, 162, 9), fill(C.teal, 80)], { y: -81 })], { y: 81 }, null,
        an([kf(40, [100, 4], EASE_BOTH), kf(160, [100, 33], EASE_BOTH), kf(290, [100, 66], EASE_BOTH), kf(424, [100, 100])])),
      // 완성 시 초록 오버레이
      group([group([rect(32, 162, 9), fill(C.green, 85)], { y: -81 })], { y: 81 },
        fadeIn(424, 14),
        an([kf(40, [100, 0], EASE_BOTH), kf(424, [100, 100])])),
    ],
  });
  const gaugeCheck = layer({
    nm: "gauge-check", ind: 8, ip: 0, op: OP, p: st([GX, GY - 112, 0]), s: popIn(430, 16),
    o: fadeInOut(430, 462, 10),
    shapes: [group([ellipse(34), fill(C.green, 95)]), group([path([[-9, 0], [-2.5, 7], [10, -8]]), strokeShape(C.white, 4.5)])],
  });

  save("iterate-loop.json", doc("iterate-loop", W, H, OP, [orbit, ...nodes, runner, gauge, gaugeCheck]));
}

/* ════════ 9. context-budget — 680×320, 600f ════════ */
{
  const W = 680, H = 320, OP = 600;
  const BOXX = 218, BOXY = 168, BW = 336, BH = 200;
  const fadeAll = an([kf(0, 100, EASE_BOTH), kf(566, 100, EASE_BOTH), kf(596, 0)]);

  // 컨테이너
  const box = layer({
    nm: "box", ind: 1, ip: 0, op: OP, p: st([BOXX, BOXY, 0]), s: popIn(4, 14), o: fadeAll,
    shapes: [group([rect(BW, BH, 20), strokeShape(C.slate, 2.5, 55)])],
  });

  // 블록 스택: 행 단위로 차오름 (아래→위)
  // 행 0: 시스템(보라) / 행 1: 도구(주황) / 행 2: 문서(청록) / 행 3~4: 대화 기록(회색)
  const rowCols = [C.purple, C.orange, C.teal, C.slate, C.slate];
  const perRow = 9, bw = 32, bh = 26, gap = 4;
  const blocks = [];
  let ind = 2;
  const blockPos = [];
  for (let r = 0; r < 5; r++) {
    const n = r === 4 ? 6 : perRow;
    for (let c = 0; c < n; c++) {
      const x = BOXX - BW / 2 + 18 + bw / 2 + c * (bw + gap);
      const y = BOXY + BH / 2 - 16 - bh / 2 - r * (bh + gap);
      const t0 = 16 + (r * perRow + c) * 4.5;
      const isHist = r >= 3;
      blockPos.push({ x, y, isHist });
      blocks.push(layer({
        nm: `b-${r}-${c}`, ind: ind++, ip: 0, op: OP,
        p: isHist
          ? an([ // 대화 기록: 압축 시 좌하단 덩어리로 수렴
              kf(t0, [x, y - 40, 0], EASE_OUT), kf(t0 + 18, [x, y, 0], EASE_BOTH),
              kf(330, [x, y, 0], EASE_OUT), kf(368, [BOXX - BW / 2 + 62, BOXY + BH / 2 - 96, 0]),
            ])
          : an([kf(t0, [x, y - 40, 0], EASE_OUT), kf(t0 + 18, [x, y, 0])]),
        o: isHist
          ? an([kf(t0, 0), kf(t0 + 8, 100, EASE_BOTH), kf(330, 100, EASE_BOTH), kf(366, 0)])
          : an([kf(t0, 0), kf(t0 + 8, 100, EASE_BOTH), kf(566, 100, EASE_BOTH), kf(596, 0)]),
        shapes: [group([rect(bw, bh, 7), fill(rowCols[r], r >= 3 ? 65 : 82)])],
      }));
    }
  }

  // 흐림 베일 (가득 찼을 때) — 컨테이너 위 반투명 + 경고 링
  const veil = layer({
    nm: "veil", ind: ind++, ip: 0, op: OP, p: st([BOXX, BOXY, 0]),
    o: an([kf(220, 0, EASE_BOTH), kf(252, 46, EASE_BOTH), kf(268, 34, EASE_BOTH), kf(286, 48, EASE_BOTH), kf(304, 38, EASE_BOTH), kf(330, 48, EASE_BOTH), kf(370, 0)]),
    shapes: [group([rect(BW - 6, BH - 6, 18), fill(C.card, 100)])],
  });
  const warnRing = layer({
    nm: "warn", ind: ind++, ip: 0, op: OP, p: st([BOXX, BOXY, 0]),
    o: an([kf(224, 0, EASE_BOTH), kf(244, 90, EASE_BOTH), kf(264, 30, EASE_BOTH), kf(284, 90, EASE_BOTH), kf(304, 30, EASE_BOTH), kf(324, 90, EASE_BOTH), kf(362, 0)]),
    shapes: [group([rect(BW + 10, BH + 10, 24), strokeShape(C.red, 3.5, 90)])],
  });

  // 압축 결과: 초록 요약 블록
  const summary = layer({
    nm: "summary", ind: ind++, ip: 0, op: OP, p: st([BOXX - BW / 2 + 62, BOXY + BH / 2 - 96, 0]), s: popIn(362, 18, 126),
    o: an([kf(362, 0), kf(372, 100, EASE_BOTH), kf(566, 100, EASE_BOTH), kf(596, 0)]),
    shapes: [
      group([rect(72, 30, 9), fill(C.green, 90)]),
      group([rect(40, 6, 3), fill(C.white, 90)]),
      group([ellipse(46), strokeShape(C.green, 2.5, 60)], {}, fadeInOut(366, 430, 10), popIn(366, 30, 140)),
    ],
  });

  // 압축 후 새 블록 2개가 여유롭게 안착
  const fresh = [0, 1].map((i) => layer({
    nm: `fresh-${i}`, ind: ind++, ip: 0, op: OP,
    p: an([kf(440 + i * 40, [BOXX + 40 + i * 40, BOXY - 130, 0], EASE_OUT), kf(470 + i * 40, [BOXX - 26 + i * (bw + gap), BOXY + BH / 2 - 16 - bh / 2 - 3 * (bh + gap), 0])]),
    o: an([kf(440 + i * 40, 0), kf(450 + i * 40, 100, EASE_BOTH), kf(566, 100, EASE_BOTH), kf(596, 0)]),
    shapes: [group([rect(bw, bh, 7), fill(C.teal, 82)])],
  }));

  // 우측 게이지: 차오름 → 90% 경고 → 압축 후 50%
  const GX2 = 596;
  const meter = layer({
    nm: "meter", ind: ind++, ip: 0, op: OP, p: st([GX2, BOXY, 0]), o: fadeAll,
    shapes: [
      group([rect(36, 200, 12), strokeShape(C.slate, 2.5, 50)]),
      group([group([rect(28, 192, 9), fill(C.blue, 80)], { y: -96 })], { y: 96 }, null,
        an([kf(16, [100, 2], EASE_BOTH), kf(230, [100, 90], EASE_BOTH), kf(330, [100, 90], EASE_BOTH), kf(380, [100, 48], EASE_BOTH), kf(470, [100, 48], EASE_BOTH), kf(540, [100, 60])])),
      // 경고 구간 상단 마커
      group([rect(36, 3, 1.5), fill(C.red, 70)], { y: -100 + 200 * 0.15 }),
    ],
  });

  save("context-budget.json", doc("context-budget", W, H, OP, [box, ...blocks, veil, warnRing, summary, ...fresh, meter]));
}
