# gto.today

**GTO, Today.** 매일 한 스팟, 매일 더 나은 판단.

Poker GTO guide + daily training + AI explanations. 모바일 PWA 우선.

## Quick start

```bash
pnpm install
pnpm dev
# → http://localhost:3000
# → http://localhost:3000/dev/showcase  (design system)
```

Node.js ≥22, pnpm ≥10.

## Monorepo

| Workspace | Role |
|---|---|
| `apps/web` | Next.js App Router PWA (the whole product) |
| `packages/poker-core` | Typed cards/board/equity primitives |
| `packages/gto-data` | Pre-computed strategies + query API |
| `packages/ui` | Shared components (Logo, Card, Chip) |
| `packages/config` | Shared tsconfig, ESLint, Tailwind preset, tokens |

## Tech

Next.js · React 19 · TypeScript (strict) · Tailwind CSS 4 · Framer Motion · Zustand · Prisma + Neon · Upstash Redis · Auth.js v5 · Claude Haiku 4.5 · Vitest · Playwright · Vercel.

See [`CLAUDE.md`](./CLAUDE.md) for conventions and phase roadmap.

## Phases

1. ✅ Foundation — monorepo, tokens, fonts, theme, landing skeleton
2. Brand Identity — motion, cards, icons
3. Data Layer — poker-core, gto-data generation
4. Core Screens — auth, live assist, daily challenge, free sim
5. AI Explanation Cache — Redis + Haiku
6. PWA + Deploy — Serwist, Vercel, gto.today
7. Polish — Lighthouse, a11y, i18n, Sentry

## License

Private. © Jay Jung (정재호).
