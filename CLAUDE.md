# CLAUDE.md — gto.today

> Read this first. Every instruction here overrides defaults.

## 0. 절대 원칙 (타협 금지)

1. **비용 제로 GTO.** 모든 GTO 수치는 사전계산 JSON. 런타임 포커 API 호출 금지.
2. **캐시 우선 AI.** Claude Haiku 호출은 Upstash Redis 캐시 miss 시에만. Fingerprint 키는 결정적(SHA-256 of canonicalized spot).
3. **최소 클릭 모바일.** 홈 → 결과까지 5탭 이내. 터치 타겟 최소 44px, 주요 CTA 56px.
4. **브랜드 일관성.** 컬러·폰트·radius·motion은 반드시 `apps/web/src/app/styles/tokens.css` + `@gto/config/tokens`에서만. 컴포넌트 내 하드코딩 금지.

## 1. 스택 (확정)

| 영역 | 선택 |
|---|---|
| Runtime | Node.js 22+ (목표 25 LTS) |
| Framework | Next.js 15.x App Router (16 업그레이드는 `vercel:next-upgrade` 스킬로) |
| Language | TypeScript 5.7+, `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` |
| Package mgr | pnpm 10 |
| Monorepo | Turborepo |
| Styling | Tailwind CSS 4 + CSS Custom Properties + shadcn/ui (커스텀) |
| 상태 | Zustand (persist middleware) |
| 모션 | Framer Motion |
| 차트 | Recharts + visx (히트맵) |
| Forms | React Hook Form + Zod |
| DB | Prisma + Neon Postgres |
| 캐시 | Upstash Redis |
| Auth | Auth.js v5 (Google + Email Magic Link) |
| AI | Anthropic SDK (Claude Haiku 4.5, 한/영 prompt 분기) |
| 포커 엔진 | pokersolver + 자체 Monte Carlo (Web Worker) |
| PWA | next-pwa (Serwist) |
| 배포 | Vercel + Neon + Upstash |
| 테스트 | Vitest + Testing Library + Playwright (E2E 핵심 플로우) |
| 모니터링 | Vercel Analytics + Sentry |

## 2. 모노레포 구조

```
gto-today/
├── apps/
│   └── web/                   # Next.js App Router PWA
│       └── src/
│           ├── app/           # routes
│           ├── components/    # app-only components
│           ├── lib/           # app-only logic (theme, fingerprint, redis, etc.)
│           └── workers/       # Web Workers (equity, etc.)
├── packages/
│   ├── config/                # shared tsconfig/eslint/tailwind preset/tokens
│   ├── poker-core/            # typed cards/board/equity primitives
│   ├── gto-data/              # pre-computed strategies + query API
│   └── ui/                    # cross-surface components (Logo, Card, Chip)
├── prisma/                    # schema (Phase 4+)
├── turbo.json
├── pnpm-workspace.yaml
└── CLAUDE.md
```

**파일 네이밍**
- React 컴포넌트: `kebab-case.tsx` (예: `theme-toggle.tsx`) — export는 PascalCase
- 순수 로직: `kebab-case.ts`
- 테스트: 구현 옆에 `foo.test.ts`

## 3. 브랜드 (Casino Noir × Daily Ritual)

**로고**: `GTO·today` — 대문자 볼드 GTO + 소문자 today + 가운데 골드 `·` (브랜드의 심장). 축약 `G·T`, 아이콘 `·` 단독. 컴포넌트는 `@gto/ui`의 `<Logo variant="full|short|dot"/>`만 사용.

**컬러 토큰** (tokens.css와 packages/config/tailwind/tokens.ts 이중 소스 — 항상 동기)
- Brand: `felt #0E3B2E`, `felt-deep #082018`, `felt-night #051612`, `gold #D4AF37`, `gold-soft #E8CC72`, `gold-cool #C9A635`
- Neutral: `noir #0A0A0A`, `charcoal #1C1C1E`, `graphite #2E2E30`, `ivory #F4EFE6`, `cream #EDE5D3`
- Semantic: `raise #C8102E`, `call #1F9D55`, `fold #6B6B70`, `warning #E6A817`, `info #4A9EFF`
- Suits (4-color default): spade noir, heart #D63B3B, diamond #2B6CB0, club #1F6F3F

**타이포**: Inter(영문/display) + Pretendard Variable(한글) + JetBrains Mono(숫자·EV·확률) + Fraunces Variable(선택적 serif accent). 모두 `/apps/web/public/fonts/` self-hosted, `font-display: swap`.

**타이포 스케일**: display-xl(56), display-lg(40), heading(28), subheading(20), body-lg(17), body(15), caption(13), mono-lg(32), mono(15).

**모션**: ease `cubic-bezier(0.22, 1, 0.36, 1)` 기본. duration — fast 180, base 240, decisive 320, flip 480, countup 400, mix-bar 600. `prefers-reduced-motion` 존중해 자동으로 0ms로 드롭.

**테마 모드**: 4개 — `light`, `dark`, `tonight`(22–04:59 local), `auto`(시간대 연동). `<html data-theme="…">`로 스왑, `themeInitScript`가 hydration 전에 적용해 FOUC 방지.

**Voice & Tone**
- Sharp. (정답) / Here's why. (오답) · 정확해요. / 이유를 볼까요.
- 짧게. 단호하게. 판단하지 않고 설명한다.
- 이모지 금지. 느낌표 최소.

## 4. 코딩 컨벤션

- `any` 금지. 브랜드 타입(`Brand<T, 'CardCode'>` 등) 적극 사용
- Server Components 기본, `'use client'`는 상호작용 필요 시에만
- 모든 interactive element에 `aria-label` + keyboard support
- `console.log` 금지 (lint error). 허용: `console.warn`, `console.error`
- 색상·radius·duration은 CSS 변수 참조만 (`var(--color-felt)`, 직접 hex 금지)
- import alias: `@/…` = apps/web/src, `@gto/…` = packages
- 커밋: Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `test:`, `docs:`)
- TODO/FIXME 금지 — 즉시 해결하거나 GitHub issue로

## 5. 명령어

```bash
pnpm install         # 최초 1회
pnpm dev             # apps/web turbopack dev server
pnpm build           # 전체 워크스페이스 빌드
pnpm typecheck       # 전체 타입체크
pnpm lint            # 전체 lint
pnpm test            # vitest run
pnpm format          # prettier 전체 포맷
```

## 6. Claude Code 작업 규칙 (스스로에게)

- **한 번에 하나의 Phase만.** 완료 시 커밋 + 1줄 요약.
- **결정사항 생기면 기본값으로 진행 + 끝에 리스트로 제시.**
- **컴포넌트는 /dev/showcase에 라이브 데모 추가.** Storybook 쓰지 않음.
- **모든 숫자는 tabular-nums + JetBrains Mono.** 정렬의 아름다움.

## 7. 개발 Phase 체크리스트

- [x] Phase 1 — Foundation (monorepo, tokens, fonts, theme, landing skeleton)
- [ ] Phase 2 — Brand Identity (Motion presets, full Card/Chip/Table, app icons)
- [ ] Phase 3 — Data Layer (poker-core engines, gto-data JSON generation, equity worker)
- [ ] Phase 4 — Core Screens (auth, live assist, daily challenge, free sim, result modal)
- [ ] Phase 5 — AI Explanation Cache (fingerprint + Redis + Claude Haiku)
- [ ] Phase 6 — PWA + Deploy (Serwist, Vercel, domain, OG)
- [ ] Phase 7 — Polish (Lighthouse 90+/95+/100, a11y, i18n, Sentry, E2E)
