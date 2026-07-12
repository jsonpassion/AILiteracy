/* AILiteracy — 인터랙티브 실험실 6종 (바닐라 JS, 라이브러리 없음) */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);

  /* ══════════ 실험실 1: 다음 토큰 예측기 ══════════ */
  {
    // 기저 분포 (학습된 확률이라고 가정)
    const CANDS = [
      { w: "길어졌다", p: 0.42, c: "#0a84ff" },
      { w: "빨리 끝났다", p: 0.31, c: "#64d2ff" },
      { w: "순조로웠다", p: 0.18, c: "#34c759" },
      { w: "치열했다", p: 0.06, c: "#ff9f0a" },
      { w: "고요했다", p: 0.03, c: "#bf5af2" },
    ];
    const bars = $("tokBars"), temp = $("tokTemp"), tempVal = $("tokTempVal");
    const out = $("tokOut"), note = $("tokNote");

    // 바 DOM 구성
    const rows = CANDS.map((cd) => {
      const row = document.createElement("div");
      row.className = "pbar";
      row.innerHTML = `<span class="lbl">${cd.w}</span>
        <div class="track"><div class="fillbar" style="background:${cd.c}"></div></div>
        <span class="pct"></span>`;
      bars.appendChild(row);
      return { fill: row.querySelector(".fillbar"), pct: row.querySelector(".pct") };
    });

    let probs = CANDS.map((cd) => cd.p);
    function applyTemp() {
      const T = parseFloat(temp.value);
      tempVal.textContent = T.toFixed(1);
      // 소프트맥스 재가중: p^(1/T) 정규화
      const raw = CANDS.map((cd) => Math.pow(cd.p, 1 / T));
      const sum = raw.reduce((a, b) => a + b, 0);
      probs = raw.map((r) => r / sum);
      rows.forEach((row, i) => {
        row.fill.style.width = (probs[i] * 100).toFixed(1) + "%";
        row.pct.textContent = (probs[i] * 100).toFixed(1) + "%";
      });
      note.textContent =
        T <= 0.3 ? `온도 ${T.toFixed(1)} — 최고 확률에 몰아줍니다. 답이 거의 매번 같아집니다.` :
        T < 1 ? `온도 ${T.toFixed(1)} — 분포가 뾰족해져 일관성이 올라갑니다.` :
        T === 1 ? "온도 1.0 — 학습된 분포 그대로 뽑습니다." :
        `온도 ${T.toFixed(1)} — 분포가 평평해져 의외의 토큰이 자주 나옵니다.`;
    }
    temp.addEventListener("input", applyTemp);

    function sampleOne() {
      let r = Math.random(), acc = 0;
      for (let i = 0; i < probs.length; i++) { acc += probs[i]; if (r < acc) return i; }
      return probs.length - 1;
    }
    const chipHTML = (i) => `<span class="tok-chip" style="background:${CANDS[i].c}">${CANDS[i].w}</span>`;
    $("tokSample1").addEventListener("click", () => {
      out.innerHTML = `오늘 회의는 생각보다 ${chipHTML(sampleOne())}`;
    });
    $("tokSample10").addEventListener("click", () => {
      const counts = new Array(CANDS.length).fill(0);
      for (let k = 0; k < 10; k++) counts[sampleOne()]++;
      out.innerHTML = "10회 샘플링 → " + counts.map((n, i) => (n ? `${chipHTML(i)}×${n}` : "")).filter(Boolean).join(" ");
    });
    $("tokReset").addEventListener("click", () => { out.innerHTML = "오늘 회의는 생각보다 <b>…</b>"; });
    applyTemp();
  }

  /* ══════════ 실험실 2: 프롬프트 업그레이드 ══════════ */
  {
    const PARTS = {
      context: "다음 주 월요일 경영진 보고에 쓸 자료야. 읽는 사람은 세부 실무를 모르는 임원 3명이고, 이 요약만 보고 예산 지속 여부를 판단해.",
      task: "첨부한 3분기 프로젝트 보고서(28쪽)에서 핵심 성과, 리스크, 의사결정이 필요한 항목을 추려줘.",
      format: "형식: ① 결론 한 문단 → ② 성과·리스크·요청사항 각 불릿 3개 이내 → ③ 다음 분기 계획 한 줄. 전체 A4 반 장 이내, 존댓말.",
      example: "톤 예시: \"3분기 전환율은 목표 대비 112%를 달성했습니다. 다만 4분기 서버 증설이 승인되지 않으면 응답 지연 리스크가 있습니다.\"",
      criteria: "성공 기준: 임원이 3분 안에 읽고 '승인/보류'를 결정할 수 있어야 해. 확실하지 않은 수치는 (확인 필요)로 표시해줘.",
    };
    const LABELS = { context: "맥락", task: "과제", format: "형식", example: "예시", criteria: "성공 기준" };
    const on = new Set();
    const text = $("puxText"), fillEl = $("puxFill"), verdict = $("puxVerdict"), detail = $("puxDetail");

    function render() {
      const parts = [];
      if (on.has("context")) parts.push(PARTS.context);
      parts.push(on.has("task") ? PARTS.task : "보고서 요약해줘.");
      if (on.has("format")) parts.push(PARTS.format);
      if (on.has("example")) parts.push(PARTS.example);
      if (on.has("criteria")) parts.push(PARTS.criteria);
      text.textContent = parts.join("\n\n");

      const n = on.size;
      fillEl.style.width = (n / 5) * 100 + "%";
      const verdicts = [
        "모델이 다섯 가지를 추측해야 하는 프롬프트입니다.",
        "출발했습니다 — 아직 추측할 것이 많습니다.",
        "쓸 만한 초안이 나오기 시작하는 수준입니다.",
        "방향이 잡혔습니다. 재작업이 크게 줄어듭니다.",
        "거의 다 왔습니다 — 한 요소만 더.",
        "위임 가능한 브리핑입니다. 첫 결과물부터 목적에 맞게 나옵니다.",
      ];
      verdict.textContent = verdicts[n];
      const missing = Object.keys(LABELS).filter((k) => !on.has(k)).map((k) => LABELS[k]);
      detail.textContent = n === 5
        ? "다섯 요소가 전부 담겼습니다. 이 구조를 템플릿으로 저장하면 그것이 §10에서 말하는 개인 하네스의 첫 조각입니다."
        : `아직 모델이 추측해야 하는 것: ${missing.join(", ")}.`;
    }
    document.querySelectorAll(".pux-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        const k = btn.dataset.part;
        if (on.has(k)) { on.delete(k); btn.classList.remove("on"); }
        else { on.add(k); btn.classList.add("on"); }
        render();
      });
    });
    render();
  }

  /* ══════════ 실험실 3: 컨텍스트 창 시뮬레이터 ══════════ */
  {
    const CAP = 100_000;
    const SYS = 3_000, TOOL = 6_000, DOC = 9_000, TURN = 1_500;
    const bar = $("ctxBar"), readout = $("ctxReadout"), status = $("ctxStatus");
    const turns = $("ctxTurns"), turnsVal = $("ctxTurnsVal");
    const docs = $("ctxDocs"), docsVal = $("ctxDocsVal");
    let summary = 0;          // 압축 요약 토큰
    let compactedTurns = 0;   // 압축으로 치운 턴 수
    let notes = false;

    const segs = ["sys", "tool", "doc", "sum", "hist"].map((k) => {
      const d = document.createElement("div");
      d.className = "ctx-seg";
      d.style.background = `var(--ctx-${k})`;
      bar.appendChild(d);
      return d;
    });

    function render() {
      const t = parseInt(turns.value), d = parseInt(docs.value);
      turnsVal.textContent = t; docsVal.textContent = d;
      const liveTurns = Math.max(0, t - compactedTurns);
      const histTok = Math.round(liveTurns * TURN * (notes ? 0.5 : 1));
      const parts = [SYS, TOOL, d * DOC, summary, histTok];
      const total = parts.reduce((a, b) => a + b, 0);
      const pct = total / CAP;
      segs.forEach((s, i) => { s.style.width = Math.min(100, (parts[i] / CAP) * 100) + "%"; });
      bar.classList.toggle("danger", pct > 0.7);
      readout.innerHTML = `사용: <b>${total.toLocaleString()}</b> / ${CAP.toLocaleString()} 토큰 (${Math.round(pct * 100)}%)`;
      status.textContent =
        pct > 1 ? "한도 초과 — 오래된 기록부터 잘려 나갑니다. 모델은 잘린 내용을 '모르는' 상태가 됩니다." :
        pct > 0.7 ? "혼잡 — 주의 예산이 옅어지는 구간입니다. 초반 지시를 잊거나 실수가 늘 수 있습니다(컨텍스트 부패)." :
        pct > 0.4 ? "보통 — 여유가 있지만, 관련 없는 첨부가 있다면 지금 빼는 것이 좋습니다." :
        "쾌적 — 모든 토큰이 충분한 주의를 받습니다.";
    }
    turns.addEventListener("input", render);
    docs.addEventListener("input", render);
    $("ctxCompact").addEventListener("click", () => {
      const t = parseInt(turns.value);
      const liveTurns = Math.max(0, t - compactedTurns);
      if (!liveTurns) return;
      compactedTurns = t;           // 지금까지의 기록을 전부 요약으로
      summary = 2_000;              // 요약 블록은 일정 크기를 유지
      render();
    });
    $("ctxNotes").addEventListener("click", (e) => {
      notes = !notes;
      e.target.classList.toggle("on", notes);
      e.target.textContent = notes ? "구조적 메모: 켜짐" : "구조적 메모 켜기";
      render();
    });
    render();
  }

  /* ══════════ 실험실 4: 에이전트 루프 시뮬레이터 ══════════ */
  {
    const log = $("agLog"), state = $("agState"), runBtn = $("agRun"), verBtn = $("agVerify");
    let verify = true, running = false;

    verBtn.addEventListener("click", () => {
      verify = !verify;
      verBtn.dataset.on = verify ? "1" : "0";
      verBtn.textContent = verify ? "✓ 검증 수단 제공: 켜짐" : "✗ 검증 수단 제공: 꺼짐";
      verBtn.classList.toggle("on", verify);
    });
    verBtn.classList.add("on");

    const SCRIPT_VERIFIED = [
      ["dim", "작업: '주문 금액 계산이 틀어지는 버그를 고쳐라'"],
      ["act", "① 컨텍스트 수집 — 관련 파일 3개, 실패하는 테스트 1개 확인"],
      ["", "② 행동 — 반올림 시점을 수정 (합산 후 → 항목별)"],
      ["act", "③ 검증 — 테스트 실행…"],
      ["fail", "   ✗ 2개 실패: 쿠폰 적용 케이스에서 1원 오차"],
      ["", "② 행동 — 쿠폰 할인도 항목별 반올림으로 통일"],
      ["act", "③ 검증 — 테스트 실행…"],
      ["ok", "   ✓ 14/14 통과"],
      ["ok", "완료 — 결과: 검증됨. 사람은 증거(테스트 로그)만 확인하면 됩니다."],
    ];
    const SCRIPT_BLIND = [
      ["dim", "작업: '주문 금액 계산이 틀어지는 버그를 고쳐라'"],
      ["act", "① 컨텍스트 수집 — 관련 파일 3개 확인"],
      ["", "② 행동 — 반올림 시점을 수정 (합산 후 → 항목별)"],
      ["warn", "③ 검증 — 실행 권한 없음. 코드를 다시 읽어봄… 맞아 보임"],
      ["warn", "완료(?) — \"수정했습니다. 아마 될 겁니다.\""],
      ["fail", "상태: 미검증. 쿠폰 케이스의 1원 오차는 아무도 모른 채 남아 있습니다."],
      ["dim", "→ 이제 사람이 직접 돌려보며 검증 루프가 되어야 합니다."],
    ];

    runBtn.addEventListener("click", () => {
      if (running) return;
      running = true; runBtn.disabled = true;
      log.innerHTML = "";
      state.textContent = "실행 중…";
      const script = verify ? SCRIPT_VERIFIED : SCRIPT_BLIND;
      script.forEach(([cls, txt], i) => {
        setTimeout(() => {
          const div = document.createElement("div");
          div.className = "ag-line" + (cls ? " ag-" + cls : "");
          div.textContent = txt;
          log.appendChild(div);
          log.scrollTop = log.scrollHeight;
          if (i === script.length - 1) {
            state.innerHTML = verify
              ? "결과: <b>검증 완료</b> — 루프가 스스로 닫혔습니다"
              : "결과: <b>미검증</b> — 확실성이 사람 몫으로 남았습니다";
            running = false; runBtn.disabled = false;
          }
        }, 600 * (i + 1));
      });
    });
  }

  /* ══════════ 실험실 5: 하네스 빌더 ══════════ */
  {
    const ERRORS = [
      { key: "style", label: "스타일 규칙 위반", rule: "보고서는 반드시 팀 서식 v3 템플릿을 따른다", p: 0.30 },
      { key: "place", label: "엉뚱한 위치에 저장", rule: "산출물은 /프로젝트/결과물 폴더에만 저장한다", p: 0.22 },
      { key: "verify", label: "결과 확인 생략", rule: "제출 전 체크리스트 5항목과 대조하고 그 결과를 첨부한다", p: 0.26 },
      { key: "stale", label: "낡은 자료 인용", rule: "올해 분기 데이터만 사용하고, 출처 날짜를 명시한다", p: 0.18 },
    ];
    const tasks = $("hxTasks"), chart = $("hxChart"), docList = $("hxDoc"), btns = $("hxRuleBtns"), msg = $("hxMsg");
    const runBtn = $("hxRun"), resetBtn = $("hxReset");
    const added = new Set();
    let runs = [];
    let lastCounts = {};

    // 규칙 버튼
    const ruleBtns = {};
    ERRORS.forEach((er) => {
      const b = document.createElement("button");
      b.className = "ix-btn";
      b.innerHTML = `+ 규칙 추가: ${er.label} <span class="cnt"></span>`;
      b.addEventListener("click", () => {
        added.add(er.key);
        b.classList.add("added");
        renderDoc();
        msg.textContent = `하네스 규칙 ${added.size}개 — 이 유형의 실수는 이제 구조적으로 막혔습니다. 다시 실행해 보세요.`;
      });
      btns.appendChild(b);
      ruleBtns[er.key] = b;
    });

    function renderDoc() {
      docList.innerHTML = "";
      if (!added.size) {
        docList.innerHTML = '<li class="hx-empty">아직 규칙이 없습니다 — 실수가 곧 첫 규칙이 됩니다.</li>';
        return;
      }
      ERRORS.filter((er) => added.has(er.key)).forEach((er) => {
        const li = document.createElement("li");
        li.textContent = er.rule;
        docList.appendChild(li);
      });
    }

    function renderChart() {
      chart.innerHTML = "";
      runs.forEach((n, i) => {
        const col = document.createElement("div");
        col.className = "hx-col";
        const bar = document.createElement("div");
        bar.className = "bar" + (n === 0 ? " zero" : "");
        bar.style.height = Math.max(4, n * 14) + "px";
        col.appendChild(bar);
        const lbl = document.createElement("span");
        lbl.textContent = `${i + 1}회차`;
        col.appendChild(lbl);
        chart.appendChild(col);
      });
    }

    runBtn.addEventListener("click", () => {
      tasks.innerHTML = "";
      let fails = 0;
      lastCounts = {};
      for (let i = 0; i < 10; i++) {
        // 각 작업: 방지되지 않은 오류 유형 중 확률적으로 하나 발생
        let hit = null;
        for (const er of ERRORS) {
          if (!added.has(er.key) && Math.random() < er.p / 1.6) { hit = er; break; }
        }
        const dot = document.createElement("div");
        dot.className = "hx-dot " + (hit ? "bad" : "ok");
        dot.textContent = hit ? "✗" : "✓";
        dot.title = hit ? hit.label : "성공";
        tasks.appendChild(dot);
        if (hit) { fails++; lastCounts[hit.key] = (lastCounts[hit.key] || 0) + 1; }
      }
      runs.push(fails);
      if (runs.length > 6) runs.shift();
      renderChart();
      ERRORS.forEach((er) => {
        const cnt = ruleBtns[er.key].querySelector(".cnt");
        cnt.textContent = lastCounts[er.key] ? `— 이번에 ${lastCounts[er.key]}회 발생` : "";
      });
      if (added.size === ERRORS.length) {
        msg.textContent = `실패 ${fails}/10. 네 가지 실수 유형이 전부 하네스로 막혔습니다 — 같은 실수는 두 번 일어나지 않습니다.`;
      } else if (fails === 0) {
        msg.textContent = "이번엔 운이 좋았습니다. 막히지 않은 실수 유형은 언제든 돌아옵니다.";
      } else {
        msg.textContent = `실패 ${fails}/10. 실수를 소비하지 말고 저축하세요 — 오른쪽에서 해당 규칙을 추가할 수 있습니다.`;
      }
    });
    resetBtn.addEventListener("click", () => {
      added.clear(); runs = []; lastCounts = {};
      tasks.innerHTML = ""; chart.innerHTML = "";
      Object.values(ruleBtns).forEach((b) => { b.classList.remove("added"); b.querySelector(".cnt").textContent = ""; });
      renderDoc();
      msg.textContent = "아직 실행 전입니다. 하네스 규칙 0개.";
    });
    renderDoc();
  }

  /* ══════════ 실험실 6: 4D 자가진단 ══════════ */
  {
    const DS = [
      { name: "위임", color: "#0a84ff", ch: "§9–10" },
      { name: "묘사", color: "#64d2ff", ch: "§5–7" },
      { name: "분별", color: "#ff9f0a", ch: "§3–4" },
      { name: "책임", color: "#bf5af2", ch: "§11" },
    ];
    const QS = [
      [0, "일을 시작하기 전에 'AI에 맡길 부분'과 '내가 할 부분'을 의식적으로 나눈다"],
      [0, "AI가 잘하는 작업 유형과 못하는 유형을 경험으로 몇 가지 말할 수 있다"],
      [0, "반복되는 작업에 재사용하는 프롬프트 템플릿이나 지침 문서가 있다"],
      [1, "요청할 때 맥락(누가·왜·어디에)을 습관적으로 함께 준다"],
      [1, "원하는 형식·분량·어조를 지정하거나 견본 예시를 붙인다"],
      [1, "긴 대화가 늘어지면 새 대화로 리셋하거나 요약해서 이어간다"],
      [2, "AI가 말한 숫자·이름·인용을 공개 전에 원문으로 확인한다"],
      [2, "환각이 왜 생기는지(패턴 없는 사실, 추측 보상) 설명할 수 있다"],
      [2, "유도 질문을 피하고, 일부러 반론이나 약점을 따로 요청해 본 적이 있다"],
      [3, "민감한 정보를 넣기 전에 서비스의 데이터 정책을 확인한 적이 있다"],
      [3, "외부 문서·웹을 처리시킬 때 그 안의 지시가 끼어들 수 있음을 인지한다"],
      [3, "AI가 실질적으로 기여한 결과물은 맥락에 맞게 그 사실을 밝힌다"],
    ];
    const qWrap = $("flQuestions"), barsWrap = $("flBars");
    const fillEl = $("flFill"), verdict = $("flVerdict"), detail = $("flDetail");
    const answers = new Array(QS.length).fill(null);

    // 문항 렌더
    QS.forEach(([d, txt], i) => {
      const row = document.createElement("div");
      row.className = "q-row";
      row.innerHTML = `<span class="q-txt"><span class="q-d" style="background:${DS[d].color}">${DS[d].name}</span>${txt}</span>
        <span class="q-btns"><button class="q-yn" data-v="1">예</button><button class="q-yn" data-v="0">아니오</button></span>`;
      const [yes, no] = row.querySelectorAll(".q-yn");
      yes.addEventListener("click", () => { answers[i] = 1; yes.classList.add("on-yes"); no.classList.remove("on-no"); score(); });
      no.addEventListener("click", () => { answers[i] = 0; no.classList.add("on-no"); yes.classList.remove("on-yes"); score(); });
      qWrap.appendChild(row);
    });
    // 역량 바
    const dFills = DS.map((d) => {
      const div = document.createElement("div");
      div.className = "fl-bar";
      div.innerHTML = `${d.name}<div class="fl-track"><div class="fl-fill" style="background:${d.color}"></div></div>`;
      barsWrap.appendChild(div);
      return div.querySelector(".fl-fill");
    });

    function score() {
      const done = answers.filter((a) => a !== null).length;
      const per = DS.map((_, d) => {
        const qs = QS.map((q, i) => [q[0], answers[i]]).filter(([dd]) => dd === d);
        const yes = qs.filter(([, a]) => a === 1).length;
        return yes / qs.length;
      });
      per.forEach((p, d) => { dFills[d].style.width = p * 100 + "%"; });
      const total = answers.filter((a) => a === 1).length;
      fillEl.style.width = (total / QS.length) * 100 + "%";
      if (done < QS.length) {
        verdict.textContent = `${done}/12 답변 완료 — 계속해 보세요.`;
        detail.textContent = "";
        return;
      }
      const minP = Math.min(...per), maxP = Math.max(...per);
      const weakest = per.indexOf(minP);
      const strongest = per.indexOf(maxP);
      verdict.textContent =
        total >= 10 ? "여섯 단계 로드맵의 후반부에 있습니다 — 이제 하네스를 지을 차례입니다." :
        total >= 7 ? "기본기가 잡혀 있습니다. 위임의 폭을 한 단계 넓혀 보세요." :
        total >= 4 ? "출발이 좋습니다. 습관 몇 개가 큰 차이를 만듭니다." :
        "지금이 가장 좋은 시작점입니다 — 이 문서를 순서대로 따라와 보세요.";
      detail.textContent = minP === maxP
        ? "네 역량이 고르게 발달해 있습니다. 지금 단계에서 아쉬웠던 챕터 하나를 골라 이번 주에 하나만 실천해 보세요."
        : `가장 단단한 역량은 ${DS[strongest].name}, 가장 여지가 큰 역량은 ${DS[weakest].name}입니다. ${DS[weakest].name} 역량은 ${DS[weakest].ch}를 다시 읽고 이번 주에 하나만 실천해 보세요.`;
    }
  }
})();
