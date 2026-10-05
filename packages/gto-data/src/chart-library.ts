/**
 * 프리플랍 차트 라이브러리 — /charts(캐시)와 /mtt/preflop(토너먼트)이 고르는
 * 차트 목록.
 *
 * 차트 본체(범례 + 169칸)는 `apps/web/public/data/rye/{id}.json` 으로 따로
 * 내려받고, 여기엔 고르는 데 필요한 메타만 둔다. RYE(Raise Your Edge, bencb)
 * 영상의 차트를 scripts/build-rye.ts 가 data/rye/charts.source.json 에서
 * 변환한다. RYE 가 다루지 않는 20/10bb 올인은 기존 Nash 차트를 그대로 쓴다.
 */

export type ChartGroupId =
  | 'open100'
  | 'sb100'
  | 'open40'
  | 'open25'
  | 'vsopen'
  | 'bbdef'
  | 'limp'
  | 'rejam'
  | 'jam20'
  | 'jam10';

/**
 * 한 칸이 둘로 갈린 핸드의 뜻.
 * - stack: 빈도 믹스가 아니라 스택에 따라 계획이 갈린다(RYE 오픈·3벳·리잼 차트).
 * - freq: 그 비율로 섞어 친다.
 */
export type SplitMeaning = 'stack' | 'freq';

export type ChartSource =
  | { readonly kind: 'rye'; readonly slide: string; readonly grid: string }
  | { readonly kind: 'nash-jam'; readonly key: string };

export interface LibraryChart {
  readonly id: string;
  /** 칩에 쓰는 짧은 이름. */
  readonly pick: string;
  /** 격자 위 제목. */
  readonly title: string;
  readonly split: SplitMeaning;
  readonly source: ChartSource;
}

export interface ChartGroup {
  readonly id: ChartGroupId;
  readonly label: string;
  /** "읽는 법" 패널에 그대로 들어가는 설명. */
  readonly desc: string;
  readonly charts: readonly LibraryChart[];
}

/** 차트 JSON 의 URL. */
export function chartUrl(c: LibraryChart): string {
  return c.source.kind === 'rye' ? `/data/rye/${c.id}.json` : `/data/preflop/${c.source.key}.json`;
}

const rye = (slide: string, grid: string): ChartSource => ({ kind: 'rye', slide, grid });

function open100(id: string, pos: string, grid: string, slide: string): LibraryChart {
  return {
    id: `open100-${id}`,
    pick: pos,
    title: `${pos} 오픈 · 100bb`,
    split: 'stack',
    source: rye(slide, grid),
  };
}
function open40(id: string, pos: string, pct: string, grid: string, slide: string): LibraryChart {
  return {
    id: `open40-${id}`,
    pick: pos,
    title: `${pos} 오픈 · 40bb+ (${pct})`,
    split: 'freq',
    source: rye(slide, grid),
  };
}
function open25(id: string, pos: string, grid: string, slide: string): LibraryChart {
  return {
    id: `open25-${id}`,
    pick: pos,
    title: `${pos} 오픈 · 25bb`,
    split: 'stack',
    source: rye(slide, grid),
  };
}
function vsOpen(opener: string, hero: string, grid: string, slide: string): LibraryChart {
  const o = opener.toLowerCase();
  const h = hero.toLowerCase().replace('+', '');
  return {
    id: `vs-${o}-from-${h}`,
    pick: `${hero} vs ${opener}`,
    title: `${hero} · ${opener} 오픈에 3벳/콜 · 50bb+`,
    split: 'stack',
    source: rye(slide, grid),
  };
}
function bbDef(pct: number, slide: string): LibraryChart {
  return {
    id: `bbdef-${pct}`,
    pick: `${pct}%`,
    title: `BB 디펜스 · 상대 오픈 ${pct}%`,
    split: 'freq',
    source: rye(slide, `${pct}%`),
  };
}
function rejam(hero: string, opener: string, grid: string, slide: string): LibraryChart {
  return {
    id: `rejam-${hero.toLowerCase()}-vs-${opener.toLowerCase().replace('+', '')}`,
    pick: `${hero} vs ${opener}`,
    title: `${hero} 리잼 · ${opener} 오픈에`,
    split: 'stack',
    source: rye(slide, grid),
  };
}
function nashJam(bb: 20 | 10, pos: string): LibraryChart {
  const show = pos === 'UTG1' ? 'UTG+1' : pos;
  return {
    id: `jam${bb}-${pos.toLowerCase()}`,
    pick: show,
    title: `${show} 올인 · ${bb}bb (Nash)`,
    split: 'freq',
    source: { kind: 'nash-jam', key: `9max_${bb}bb_jam_${pos}` },
  };
}

const NASH_POSITIONS = ['UTG', 'UTG1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB'] as const;

export const CHART_GROUPS: Readonly<Record<ChartGroupId, ChartGroup>> = {
  open100: {
    id: 'open100',
    label: '오픈 100bb',
    desc: '앞에서 모두 폴드했을 때의 오픈 레인지와, 오픈 뒤 3벳을 맞았을 때의 계획이에요. MP 부터는 100bb 에서 40bb 까지 같은 차트를 써요.',
    charts: [
      open100('utg', 'UTG', 'UTG', 'or100_a'),
      open100('utg1', 'UTG+1', 'UTG+1', 'or100_a'),
      open100('utg2', 'UTG+2', 'UTG+2', 'or100_a'),
      open100('mp', 'MP', 'MP', 'or100_b'),
      open100('hj', 'HJ', 'HJ', 'or100_b'),
      open100('co', 'CO', 'CO', 'or100_c'),
      open100('btn', 'BTN', 'BU', 'or100_c'),
    ],
  },
  sb100: {
    id: 'sb100',
    label: 'SB 오픈 100bb',
    desc: 'SB 에서 BB 를 상대로. BB 가 어떤 상대인지에 따라 오픈만 하는 전략과 림프를 섞는 전략이 갈려요. 100bb 에서 40bb 까지.',
    charts: [
      {
        id: 'sb100-tight',
        pick: 'vs 타이트',
        title: 'SB 오픈 · BB 가 타이트할 때',
        split: 'stack',
        source: rye('sbvs_a', 'tight opponent'),
      },
      {
        id: 'sb100-good',
        pick: 'vs 잘하는 상대',
        title: 'SB 오픈 · BB 가 잘 칠 때',
        split: 'stack',
        source: rye('sbvs_a', 'good opponent (-40bb)'),
      },
      {
        id: 'sb100-mixed',
        pick: '믹스',
        title: 'SB 오픈 · 림프를 섞는 믹스 전략',
        split: 'freq',
        source: rye('sbvs_b', 'good opponent (mixed strategy)'),
      },
      {
        id: 'sb100-loose',
        pick: 'vs 루즈 패시브',
        title: 'SB 오픈 · BB 가 루즈 패시브할 때 (익스플로잇)',
        split: 'freq',
        source: rye('sbvs_b', 'loose passive (exploitative)'),
      },
    ],
  },
  open40: {
    id: 'open40',
    label: '오픈 40bb+',
    desc: '40bb 이상에서 포지션별 오픈 레인지. 괄호는 전체 핸드 가운데 오픈하는 비율이에요. SB 는 오픈만 하는 46% 버전과 림프를 섞어 70% 까지 넓히는 버전 둘 다.',
    charts: [
      open40('utg', 'UTG', '11%', 'UTG 11%', 'or40_a'),
      open40('utg1', 'UTG+1', '12%', 'UTG+1 12%', 'or40_a'),
      open40('utg2', 'UTG+2', '14%', 'UTG+2 14%', 'or40_b'),
      open40('mp', 'MP', '17.3%', 'MP 17.3%', 'or40_b'),
      open40('hj', 'HJ', '25.2%', 'HJ 25.2%', 'or40_c'),
      open40('co', 'CO', '32.4%', 'CO 32.4%', 'or40_c'),
      open40('btn', 'BTN', '50%', 'BU 50%', 'or40_d'),
      {
        id: 'open40-sb',
        pick: 'SB',
        title: 'SB 오픈 · 40bb+ (46%)',
        split: 'stack',
        source: rye('or40_sb', 'SB 46%'),
      },
      {
        id: 'open40-sb-mixed',
        pick: 'SB 믹스',
        title: 'SB 오픈+림프 믹스 · 40bb+ (70%)',
        split: 'freq',
        source: rye('or40_sbmix', 'SB 70% mixed'),
      },
    ],
  },
  open25: {
    id: 'open25',
    label: '오픈 25bb',
    desc: '25bb 안팎에서 포지션별 오픈 레인지와 3벳을 맞았을 때의 계획. 블라인드가 공격적일 때의 BTN 과 림프를 섞는 SB 는 따로 있어요.',
    charts: [
      open25('utg', 'UTG', 'UTG', 'or25_a'),
      open25('utg1', 'UTG+1', 'UTG+1', 'or25_a'),
      open25('utg2', 'UTG+2', 'UTG+2', 'or25_a'),
      open25('mp', 'MP', 'MP', 'or25_b'),
      open25('hj', 'HJ', 'HJ', 'or25_b'),
      open25('co', 'CO', 'CO', 'or25_c'),
      open25('btn', 'BTN', 'BU', 'or25_c'),
      {
        id: 'open25-btn-vs-aggro',
        pick: 'BTN vs 공격적 블라인드',
        title: 'BTN · 블라인드가 공격적일 때 · 25bb',
        split: 'freq',
        source: rye('or25_d', 'BU vs aggressive Blinds'),
      },
      {
        id: 'open25-sb-mixed',
        pick: 'SB 믹스',
        title: 'SB 오픈+림프 믹스 · 25bb',
        split: 'freq',
        source: rye('or25_d', 'SB mixed strategy'),
      },
    ],
  },
  vsopen: {
    id: 'vsopen',
    label: 'vs 오픈',
    desc: '앞 포지션이 오픈했을 때 내 포지션에서 3벳(밸류/블러프)할 핸드와 콜할 핸드예요. 50bb 이상 기준.',
    charts: [
      vsOpen('UTG', 'UTG+1', 'UTG+1', 'flat_utg_a'),
      vsOpen('UTG', 'MP', 'MP', 'flat_utg_a'),
      vsOpen('UTG', 'CO', 'CO', 'flat_utg_a'),
      vsOpen('UTG', 'BTN', 'BU', 'flat_utg_b'),
      vsOpen('UTG', 'SB', 'SB', 'flat_utg_b'),
      vsOpen('MP', 'BTN', 'BU', 'flat_mp'),
      vsOpen('MP', 'SB', 'SB', 'flat_mp'),
      vsOpen('CO', 'BTN', 'BU', 'flat_co'),
      vsOpen('CO', 'SB', 'SB', 'flat_co'),
    ],
  },
  bbdef: {
    id: 'bbdef',
    label: 'BB 디펜스',
    desc: 'BB 에서 2.5x 오픈을 맞았을 때. 상대가 얼마나 넓게 오픈하는지(12% 부터 50% 까지)에 따라 콜과 3벳 범위가 넓어져요.',
    charts: [12, 15, 20, 25, 30, 35, 40, 45, 50].map((p) =>
      bbDef(p, p <= 20 ? 'bbdef_a' : p <= 35 ? 'bbdef_b' : 'bbdef_c'),
    ),
  },
  limp: {
    id: 'limp',
    label: 'BB vs SB 림프',
    desc: 'SB 가 림프했을 때 BB 의 대응. 스택이 얕을수록 레이즈 대신 올인이 늘어나요.',
    charts: [
      {
        id: 'bb-vs-sb-limp-15-20',
        pick: '15-20bb',
        title: 'BB · SB 림프에 · 15-20bb',
        split: 'freq',
        source: rye('limp', '15-20bb'),
      },
      {
        id: 'bb-vs-sb-limp-20-25',
        pick: '20-25bb',
        title: 'BB · SB 림프에 · 20-25bb',
        split: 'freq',
        source: rye('limp', '20-25bb'),
      },
      {
        id: 'bb-vs-sb-limp-30',
        pick: '30bb+',
        title: 'BB · SB 림프에 · 30bb+',
        split: 'freq',
        source: rye('limp', '30bb+'),
      },
    ],
  },
  rejam: {
    id: 'rejam',
    label: '리잼',
    desc: '앞 포지션 오픈에 올인으로 3벳(리잼)할 핸드. 색은 그 핸드로 리잼할 수 있는 최대 스택이고, 더 깊으면 3벳 뒤 올인에 콜하는 핸드만 따로 표시돼요.',
    charts: [
      rejam('BTN', 'UTG', 'UTG', 'rejam_bu'),
      rejam('BTN', 'UTG+1', 'UTG+1', 'rejam_bu'),
      rejam('BTN', 'UTG+2', 'UTG+2', 'rejam_bu'),
      rejam('BB', 'MP', 'MP', 'rejam_bb'),
      rejam('BB', 'HJ', 'HJ', 'rejam_bb'),
      rejam('BB', 'CO', 'CO', 'rejam_bb'),
    ],
  },
  jam20: {
    id: 'jam20',
    label: '20bb 올인',
    desc: '20bb 에서 앞에서 모두 폴드했을 때 올인할 핸드예요. Nash 균형 푸시 차트.',
    charts: NASH_POSITIONS.map((p) => nashJam(20, p)),
  },
  jam10: {
    id: 'jam10',
    label: '10bb 올인',
    desc: '10bb 에서 앞에서 모두 폴드했을 때 올인할 핸드예요. Nash 균형 푸시 차트.',
    charts: NASH_POSITIONS.map((p) => nashJam(10, p)),
  },
};

/** 캐시 게임 페이지(/charts)가 보여 주는 묶음 — 깊은 스택 차트만. */
export const CASH_GROUP_IDS: readonly ChartGroupId[] = ['open100', 'sb100', 'vsopen', 'bbdef'];

/** 토너먼트 페이지(/mtt/preflop) — 깊은 쪽부터 얕은 쪽으로. */
export const MTT_GROUP_IDS: readonly ChartGroupId[] = [
  'open100',
  'open40',
  'open25',
  'sb100',
  'vsopen',
  'bbdef',
  'limp',
  'rejam',
  'jam20',
  'jam10',
];

/** RYE 에서 변환해 오는 차트 전부(빌드 스크립트와 무결성 테스트가 쓴다). */
export function ryeCharts(): LibraryChart[] {
  return Object.values(CHART_GROUPS)
    .flatMap((g) => g.charts)
    .filter((c) => c.source.kind === 'rye');
}
