# Phase 2 완료 이후 구현 플랜

Phase 2 완료 (~15:00) 후 아래 순서로 실행합니다. 이 문서는 설계 노트 — 실행은 phase 2 종료 + 커밋 후.

---

## 1. 콤보 클릭 → 세부 확률 바텀시트

### UI 구조

```
사용자가 RangeGrid 의 AKs 셀 탭
      ↓
모달 (iOS 바텀시트 스타일, swipe down to close)
┌──────────────────────────────┐
│  AKs  ★ 레이즈               │
│                              │
│  ●●● 레이즈  ████████ 82%    │
│  ●●● 콜     ██        15%    │
│  ●●● 폴드    ─          3%    │
│                              │
│  수츠별 콤보:                │
│  ♠♥ ♠♦ ♠♣ ♥♦ ♥♣ ♦♣          │
│                              │
│  [AI 해설 보기]              │
└──────────────────────────────┘
```

### 파일 변경

- `packages/ui/src/range-grid.tsx` — `onCellClick?: (hand: string) => void` prop 추가
- `apps/web/src/components/chart-navigator.tsx` — modal state + bottom sheet 렌더
- `packages/ui/src/combo-detail-sheet.tsx` (새 컴포넌트)
  - 호버 아닌 **탭** 전용 (모바일 first)
  - Framer Motion slide-up, drag-to-dismiss

### 데이터

RangeGrid 이미 `mixes` prop 으로 조합별 frequency 받음. 추가 fetch 없이 즉시 표시 가능.

### 예상 시간

**2~3시간**. 모달 컴포넌트 + tap handler + style 만.

---

## 2. 훈련용 플랍 보기 — 텍스처별 그룹화

### 커버리지 현실

| 시나리오            | 보드 수 |
| ------------------- | ------- |
| CO vs BB            | 50      |
| UTG/MP/BTN/SB vs BB | 15 each |

사용자가 **임의 플랍 입력 → 솔버 답** 은 커버리지 0.5% 미만이라 불가.
→ 대신 **미리 솔빙된 50/15 보드 중 텍스처별 선택** 제공.

### 텍스처 그룹 (7개)

| 그룹 id    | UI 라벨                | 설명                     | 포함 텍스처                |
| ---------- | ---------------------- | ------------------------ | -------------------------- |
| `ace-dry`  | **에이스 하이 드라이** | A 탑, 연결·드로우 없음   | `ace_high`                 |
| `dry-high` | **하이카드 드라이**    | K/Q 탑, 정적인 보드      | `dry_high`                 |
| `wet`      | **젖은 보드**          | 스트레이트·플러시 드로우 | `wet_draw`, `semi_wet`     |
| `paired`   | **페어드 보드**        | 보드에 페어 (88x, K7K…)  | `paired`                   |
| `monotone` | **모노톤**             | 한 수트 삼연             | `monotone`                 |
| `low-mid`  | **로우·미들**          | 6 이하 / 중간 드라이     | `low_connected`, `dry_mid` |
| `broadway` | **브로드웨이**         | KQJ, QJT                 | `broadway`                 |

### UI 플로우

```
ChartNavigator (프리플랍 끝, SRP 진행)
  ↓
"플랍으로 넘어가기 →" 버튼 등장
  ↓
플랍 선택 화면
  [탭: 시나리오별] UTG / MP / CO / BTN / SB
  [탭: 텍스처별]   A-high / 페어드 / 젖은 / ...
  [리스트]         Ad 7h 2c  ·  As 8d 3c  ·  As Kd 4h  ...
  ↓
보드 선택
  ↓
포스트플랍 결정 트리 (BB 차례, 솔버 mix 표시)
```

### 파일 변경

- `packages/gto-data/src/postflop-textures.ts` — 텍스처 그룹 정의 + `groupSpotsByTexture()` helper
- `apps/web/src/components/flop-picker.tsx` (새) — 탭 + 리스트 UI
- `apps/web/src/components/chart-navigator.tsx` — 프리플랍 완료 시 "플랍으로 넘어가기" 트리거
- `apps/web/src/components/postflop-chart.tsx` (새) — 보드 선택 후 bb 플랍 mix 표시

### 예상 시간

**3~4시간** (flop picker + chart 전환 UX + 포스트플랍 모드 UI)

---

## 3. 네이버 · 카카오 OAuth

### Jay 작업

`docs/oauth-setup.md` 참고 (별도 문서).

- 네이버 developer 콘솔 등록 → `NAVER_CLIENT_ID/SECRET`
- 카카오 developers 콘솔 등록 → `KAKAO_CLIENT_ID/SECRET`
- Vercel 환경변수 4개 입력

### 코드 변경 (제가)

**`apps/web/src/lib/auth.ts`** — providers 배열에 추가:

```ts
import Naver from 'next-auth/providers/naver';
import Kakao from 'next-auth/providers/kakao';

providers: [
  Google({ clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET }),
  Naver({ clientId: env.NAVER_CLIENT_ID, clientSecret: env.NAVER_CLIENT_SECRET }),
  Kakao({ clientId: env.KAKAO_CLIENT_ID, clientSecret: env.KAKAO_CLIENT_SECRET }),
  // ...
];
```

**`apps/web/src/app/signin/page.tsx`** — 버튼 2개 추가:

```tsx
<SignInButton provider="naver" label="네이버로 계속하기" logo="/oauth/naver.svg" />
<SignInButton provider="kakao" label="카카오로 계속하기" logo="/oauth/kakao.svg" />
```

네이버·카카오 공식 가이드라인 컬러:

- 네이버: `#03C75A` (녹색)
- 카카오: `#FEE500` (노랑) + 검은 글씨

### 예상 시간

**1시간** (코드) + Jay **15~20분** (콘솔 등록)

---

## 실행 순서 (phase 2 완료 후)

1. **커밋 검증 + push** (10분)
   - solver-spots.ts 최종 550 스팟 확인
   - typecheck 통과 확인

2. **콤보 클릭 모달** (2~3h) ← 가장 임팩트 큼, 즉시 사용자 체감

3. **플랍 픽커 (텍스처 그룹)** (3~4h) ← phase 2 데이터 활용 최대화

4. **OAuth 코드 스켈레톤** (1h) — Jay 가 키 받아오면 바로 머지 가능

**예상 총 소요**: 오후 ~8시간 작업.
