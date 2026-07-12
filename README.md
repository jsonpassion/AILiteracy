# AILiteracy

**AI 리터러시 안내서** — 토큰과 다음 토큰 예측이라는 바닥부터 환각의 통계적 기원, 프롬프트·컨텍스트 엔지니어링, RAG·도구·에이전트를 지나 **하네스 엔지니어링**까지, AI를 읽고 쓰는 능력을 한 흐름으로 정리한 인터랙티브 웹 문서.

🔗 **Live**: https://jsonpassion.github.io/AILiteracy/

## 구성

- **12개 챕터** — 세 번째 문해력(4D 프레임워크) → 토큰·학습 파이프라인·모델 내부 → 한계 리터러시(환각) → 프롬프트 기초·고급 → 컨텍스트 엔지니어링 → RAG·도구·MCP → 에이전트 → 하네스 엔지니어링 → 안전 → 4D 로드맵
- **인터랙티브 실험실 6종** — 다음 토큰 예측기(온도), 프롬프트 업그레이드, 컨텍스트 창 시뮬레이터, 에이전트 루프, 하네스 빌더, 4D 자가진단 (전부 바닐라 JS, 라이브러리 없음)
- **자체 제작 Lottie 14종** — `tools/generate-*.mjs`로 프로그래밍 생성 (외부 에셋 없음, 저작권 자체 보유)
- 본문 위첨자 각주 → 참고 자료 16건 (Anthropic · OpenAI 공식 문서/연구 중심)

## 주요 레퍼런스

- [Anthropic — AI Fluency: Framework & Foundations](https://anthropic.skilljar.com/ai-fluency-framework-foundations) (4D: 위임·묘사·분별·책임)
- [OpenAI — Why language models hallucinate](https://openai.com/index/why-language-models-hallucinate/)
- [Anthropic — Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Mitchell Hashimoto — My AI Adoption Journey](https://mitchellh.com/writing/my-ai-adoption-journey)
- [OpenAI — Harness engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/)

## 기술

- 순수 정적 사이트 (`index.html` + `style.css` + `script.js` + `interactives.js`) — 빌드 불필요
- 다크/라이트 테마, `prefers-reduced-motion` 대응 (Lottie 정지 프레임 폴백)
- 로컬 미리보기: `python3 -m http.server 8341` → http://localhost:8341
- Lottie 재생성: `node tools/generate-basics.mjs && node tools/generate-dialog.mjs && node tools/generate-systems.mjs`
