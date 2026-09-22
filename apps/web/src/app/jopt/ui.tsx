'use client';

// jopt.gto.today — JOPT 2026 Sapporo #02 원정 플래너.
// 실좌표(위경도)를 아이소메트릭으로 투영한 LEGO 스타일 삿포로 맵 위에
// 일자별 동선·핀·이동 애니메이션을 얹는다. 도시 배경은 SVG를 명령형으로
// 1회 생성하고(빌딩 200여 개 + 나무), 경로·핀·여행자만 day/sel 에 반응해 다시 그린다.
//
// 2026-09-22 Jay 현지 피드백 반영:
//  - 카드를 누르면 뜨던 장소 사진(전부 같은 master.png 크롭)이 폰 화면을 거의 다 가렸다 → 사진 제거,
//    대신 구글맵·전화 버튼. 첫 진입에서는 팝오버를 열지 않는다.
//  - 건물이 밋밋한 회색 상자였다 → 창문·지붕 스터드 패턴, 면 외곽선, 액센트 색, 빈 필지 나무.
//  - Day 2 를 넓은 동선으로 바꾸니 핀이 점처럼 작아졌다 → 핀·여행자는 화면 크기를 유지(역배율).
//  - 오늘 날짜(JST) 탭을 기본으로 연다.
import { useCallback, useEffect, useRef, useState } from 'react';
import s from './jopt.module.css';

/* ---------- 데이터 ---------- */
type Mode = 'walk' | 'jr' | 'subway' | 'taxi';

interface Place {
  nm: string;
  lng: number;
  lat: number;
  /** 구글맵 검색어(일본어 상호가 가장 정확히 잡힌다) */
  map: string;
  tel?: string;
}

const PL = {
  station: { nm: 'JR 삿포로역', lng: 141.3508, lat: 43.0687, map: 'JR札幌駅' },
  // 9/22 Jay 가 공유한 지도 핀(北7条東4丁目) 기준. 이전 값(141.348)은 Phase 0 근사치였다.
  house: { nm: '숙소 (北7条東4)', lng: 141.362, lat: 43.0706, map: '北7条東4丁目15-78 札幌市東区' },
  factory: { nm: '삿포로 팩토리 홀', lng: 141.3654, lat: 43.0662, map: '札幌ファクトリーホール' },
  nijo: { nm: '니조시장', lng: 141.3585, lat: 43.0576, map: '二条市場' },
  tv: { nm: '삿포로 TV타워', lng: 141.3565, lat: 43.0611, map: 'さっぽろテレビ塔' },
  odori: { nm: '오도리공원', lng: 141.354, lat: 43.0605, map: '大通公園' },
  clock: { nm: '삿포로 시계탑', lng: 141.3536, lat: 43.0626, map: '札幌市時計台' },
  susukino: { nm: '스스키노', lng: 141.3532, lat: 43.0554, map: 'すすきの 札幌' },
  daimaru: { nm: '다이마루 삿포로', lng: 141.3495, lat: 43.0675, map: '大丸札幌店' },
  bic: {
    nm: '빅카메라 6F 빅주판 (도큐백화점)',
    lng: 141.3532,
    lat: 43.0661,
    map: 'ビックカメラ札幌店 さっぽろ東急百貨店',
  },
  stella: {
    nm: '네무로 하나마루 (스텔라플레이스 6F)',
    lng: 141.3526,
    lat: 43.0682,
    map: '根室花まる JRタワーステラプレイス店',
  },
  mitsukoshi: { nm: '삿포로 미츠코시', lng: 141.3531, lat: 43.0596, map: '札幌三越' },
  donki: { nm: '돈키호테 다누키코지', lng: 141.3535, lat: 43.0572, map: 'ドン・キホーテ 狸小路店' },
  museum: {
    nm: '삿포로 맥주 박물관',
    lng: 141.369,
    lat: 43.0714,
    map: 'サッポロビール博物館',
    tel: '0117481876',
  },
  garden: {
    nm: '삿포로 비어가든 (징기스칸)',
    lng: 141.3696,
    lat: 43.0718,
    map: 'サッポロビール園',
    tel: '0570098346',
  },
  ario: { nm: '아리오 삿포로', lng: 141.3705, lat: 43.0715, map: 'アリオ札幌' },
  parco: { nm: '삿포로 파르코', lng: 141.3535, lat: 43.0589, map: '札幌PARCO' },
  toriton: {
    nm: '토리톤 스시 (北8条光星店)',
    lng: 141.3614,
    lat: 43.0727,
    map: '回転寿しトリトン 北8条光星店',
    tel: '0113748666',
  },
  letus: {
    nm: '샤브샤브 레터스 스스키노점',
    lng: 141.356,
    lat: 43.0549,
    map: 'しゃぶしゃぶ れたす 札幌すすきの店',
    tel: '0112069779',
  },
  pokke: {
    nm: '홋카이도 샤브샤브 폿케 본점',
    lng: 141.3545,
    lat: 43.0567,
    map: '北海道しゃぶしゃぶ ポッケ 札幌本店',
    tel: '0112121629',
  },
  cc: {
    nm: '酒屋 C&C (위스키)',
    lng: 141.3532,
    lat: 43.0542,
    map: '酒屋C&C ライラックビル 南5条西4丁目 札幌',
    tel: '0115181351',
  },
} satisfies Record<string, Place>;

type PlaceId = keyof typeof PL;
type Badge = 'main' | 'free' | 'shop' | 'whisky' | 'beer' | 'food';
const BADGE_LABEL: Record<Badge, string> = {
  main: 'MAIN',
  free: '자유',
  shop: '명품',
  whisky: '위스키',
  beer: '맥주',
  food: '식사',
};

interface Stop {
  p: PlaceId;
  t: string;
  stay: string;
  mode: Mode;
  mv: string;
  note: string;
  badge?: Badge;
  opt?: boolean;
}

interface DayPlan {
  label: string;
  date: string;
  km: number;
  min: number;
  initialSel: number;
  stops: Stop[];
}

const DAYS: DayPlan[] = [
  {
    label: 'Day 1',
    date: '9/21 월',
    km: 5.1,
    min: 75,
    initialSel: 2,
    stops: [
      {
        p: 'station',
        t: '13:20',
        stay: '10분',
        mode: 'jr',
        mv: 'JR 쾌속 에어포트 40분 · ¥1,150',
        note: '신치토세공항 11:50 도착 → 입국 후 이동',
      },
      {
        p: 'house',
        t: '13:30',
        stay: '20분',
        mode: 'walk',
        mv: '도보 12분 · 0.9km',
        note: '짐 맡기기 (체크인은 저녁)',
      },
      {
        p: 'factory',
        t: '14:00',
        stay: '14:00-18:00',
        mode: 'walk',
        mv: '도보 15분 · 1.1km',
        note: 'JOPT 메인 Day 1B 레이트 레지 · 바우처 ① / 탈락 시 18:00 Day 1C 터보 · 바우처 ②',
        badge: 'main',
      },
      {
        p: 'nijo',
        t: '대안',
        stay: '40분',
        mode: 'walk',
        mv: '도보 18분 · 1.5km',
        note: '조기 탈락 시 낮 루프 · 07:00-17:00',
        opt: true,
      },
      {
        p: 'tv',
        t: '대안',
        stay: '40분',
        mode: 'walk',
        mv: '도보 8분 · 0.6km',
        note: '전망대 09:00-22:00',
        opt: true,
      },
      {
        p: 'odori',
        t: '대안',
        stay: '20분',
        mode: 'walk',
        mv: '도보 3분 · 0.2km',
        note: '오도리공원 산책',
        opt: true,
      },
      {
        p: 'clock',
        t: '대안',
        stay: '15분',
        mode: 'walk',
        mv: '도보 4분 · 0.2km',
        note: '시계탑 · 08:45-17:10',
        opt: true,
      },
      {
        p: 'susukino',
        t: '저녁',
        stay: '90분',
        mode: 'walk',
        mv: '도보 12분 · 0.8km',
        note: '저녁 · 라멘 요코초',
      },
    ],
  },
  {
    // 9/22 자유일 — 13:00 출발 확정판(Jay 12:00). 상세는 /jopt 일정표(today.tsx)가 정본.
    label: 'Day 2',
    date: '9/22 화',
    km: 3.0,
    min: 55,
    initialSel: 1,
    stops: [
      {
        p: 'house',
        t: '13:00',
        stay: '-',
        mode: 'walk',
        mv: '도보 3분 · 240m',
        note: '여권 지참',
        badge: 'free',
      },
      {
        p: 'toriton',
        t: '13:05',
        stay: '75분',
        mode: 'walk',
        mv: '도보 3분',
        note: '회전초밥 · 11:00-22:00 · 대기 30-60분 · 발권기 번호 먼저',
        badge: 'food',
      },
      {
        p: 'nijo',
        t: '14:30',
        stay: '30분',
        mode: 'taxi',
        mv: '택시 7분 · ¥900 안팎 (도보 20분)',
        note: '가게 대부분 17시 전후 마감',
        badge: 'free',
      },
      {
        p: 'tv',
        t: '15:00',
        stay: '60분',
        mode: 'walk',
        mv: '니조시장 → 소세이강 → 오도리공원 도보 10분',
        note: '카이센동 뒤 산책 · 공원 서쪽으로 걷다 파르코로',
        badge: 'free',
      },
      {
        p: 'parco',
        t: '15:50',
        stay: '50분',
        mode: 'walk',
        mv: '오도리공원에서 도보 5분',
        note: '10:00-20:00 · 면세',
        badge: 'shop',
      },
      {
        p: 'mitsukoshi',
        t: '16:40',
        stay: '60분',
        mode: 'walk',
        mv: '도보 2분 · 길 건너',
        note: '루이비통 1호점 · B1 주류 재고 확인 · 10:00-19:00',
        badge: 'shop',
      },
      {
        p: 'letus',
        t: '19:30',
        stay: '120분',
        mode: 'walk',
        mv: '다누키코지 자유 시간(17:40-19:15) 뒤 도보 5분',
        note: '19:30 8명 예약 완료 · 1인 1냄비 · 평균 ¥3,500 · 011-206-9779',
        badge: 'food',
      },
      {
        p: 'donki',
        t: '21:30',
        stay: '30분',
        mode: 'walk',
        mv: '샤브샤브에서 도보 5분',
        note: 'C&C 가기 전 시세 확인용 (정가의 1.5-2배) · 24시간',
        badge: 'whisky',
      },
      {
        p: 'cc',
        t: '22:05',
        stay: '25분',
        mode: 'walk',
        mv: '도보 6분 · 0.4km',
        note: '면세 · 월-토 15:00-23:00 · 011-518-1351',
        badge: 'whisky',
      },
      {
        p: 'house',
        t: '22:35',
        stay: '-',
        mode: 'taxi',
        mv: '택시 10분 · ¥1,300 안팎',
        note: '귀가 후 홀덤 캐시게임 · 블라인드 1,000/1,000 · 바이인 10만 원 · 내일 11:00 Bullet',
        badge: 'main',
      },
    ],
  },
  {
    label: 'Day 3',
    date: '9/23 수',
    km: 2.2,
    min: 30,
    initialSel: 1,
    stops: [
      { p: 'house', t: '10:30', stay: '-', mode: 'walk', mv: '기상 · 준비', note: '' },
      {
        p: 'factory',
        t: '11:00',
        stay: '11:00-',
        mode: 'walk',
        mv: '도보 15분 · 1.1km',
        note: 'NLH Bullet #47 · 바우처 ③ (탈락 시 14:55 전 ④ 재엔트리)',
        badge: 'main',
      },
    ],
  },
  {
    label: 'Day 4',
    date: '9/24 목',
    km: 0,
    min: 0,
    initialSel: 0,
    stops: [
      {
        p: 'house',
        t: '미정',
        stay: '-',
        mode: 'walk',
        mv: '일정 비움',
        note: '대회가 끝나면 다시 짭니다.',
        badge: 'free',
      },
    ],
  },
  {
    label: 'Day 5',
    date: '9/25 금',
    km: 0.9,
    min: 12,
    initialSel: 1,
    stops: [
      {
        p: 'house',
        t: '09:15',
        stay: '-',
        mode: 'walk',
        mv: '체크아웃',
        note: '짐 정리 · 09:15 출발',
      },
      {
        p: 'station',
        t: '09:30',
        stay: '-',
        mode: 'walk',
        mv: '도보 12분 · 0.9km',
        note: 'JR 쾌속 에어포트 09:30 → 신치토세 10:15 → 12:55 ZE0626 → 16:00 인천',
        badge: 'main',
      },
    ],
  },
];

/** 오늘(JST) 에 해당하는 탭. 없으면 Day 1. SSR 과 어긋나지 않게 mount 후에만 부른다. */
function todayIndex(): number {
  const d = new Date(Date.now() + 9 * 3600e3);
  const key = `${d.getUTCMonth() + 1}/${d.getUTCDate()} `;
  const i = DAYS.findIndex((x) => x.date.startsWith(key));
  return i < 0 ? 0 : i;
}

/* ---------- 투영 ---------- */
const W = 141.342;
const N = 43.0748;
const MX = 81375;
const MY = 110950;
const ISX = 0.866;
const ISY = 0.5;
const XMAX = (141.378 - W) * MX;
const YMAX = (N - 43.05) * MY;

const mtr = (lng: number, lat: number) => ({ x: (lng - W) * MX, y: (N - lat) * MY });
const iso = (x: number, y: number) => ({ X: (x - y) * ISX, Y: (x + y) * ISY });
const proj = (lng: number, lat: number) => {
  const a = mtr(lng, lat);
  return iso(a.x, a.y);
};

const NS = 'http://www.w3.org/2000/svg';
function mk(tag: string, attrs: Record<string, string | number>, parent: Element): SVGElement {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  parent.appendChild(e);
  return e as SVGElement;
}
function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (n >> 16) * f) | 0;
  const g = Math.min(255, ((n >> 8) & 255) * f) | 0;
  const b = Math.min(255, (n & 255) * f) | 0;
  return `rgb(${r},${g},${b})`;
}

const MODE_STYLE: Record<Mode, { stroke: string; w: number; dash: string }> = {
  walk: { stroke: '#0B5B9F', w: 4.5, dash: '1 9' },
  jr: { stroke: '#0AA396', w: 6, dash: '' },
  subway: { stroke: '#E08A1E', w: 5.5, dash: '' },
  taxi: { stroke: '#5A6672', w: 4.5, dash: '10 7' },
};

const legPathD = (a: Place, b: Place): string => {
  const A = mtr(a.lng, a.lat);
  const B = mtr(b.lng, b.lat);
  const p0 = iso(A.x, A.y);
  const m1 = iso(B.x, A.y);
  const p1 = iso(B.x, B.y);
  return `M${p0.X},${p0.Y} L${m1.X},${m1.Y} L${p1.X},${p1.Y}`;
};

/* ---------- 도시 빌드 (1회) ---------- */
interface CityRefs {
  gRoute: SVGElement;
  gPins: SVGElement;
  trav: SVGElement;
  travIn: SVGElement;
  stopLife: () => void;
}

function buildCity(svg: SVGSVGElement): CityRefs {
  // 아이소 면에 맞춘 패턴 — 동면(+y 방향)·남면(+x 방향) 창문, 지붕 스터드(LEGO 돌기)
  const defs = mk('defs', {}, svg);
  const pat = (id: string, tf: string) =>
    mk(
      'pattern',
      { id, patternUnits: 'userSpaceOnUse', width: 7, height: 7, patternTransform: tf },
      defs,
    );
  {
    const pE = pat('jw-e', 'matrix(-0.866,0.5,0,-0.575,0,0)');
    mk(
      'rect',
      { x: 1.6, y: 1.6, width: 3.6, height: 3.4, rx: 0.5, fill: 'rgba(18,40,72,.34)' },
      pE,
    );
    const pS = pat('jw-s', 'matrix(0.866,0.5,0,-0.575,0,0)');
    mk(
      'rect',
      { x: 1.6, y: 1.6, width: 3.6, height: 3.4, rx: 0.5, fill: 'rgba(18,40,72,.22)' },
      pS,
    );
    const pT = pat('jw-stud', 'matrix(0.866,0.5,-0.866,0.5,0,0)');
    mk('circle', { cx: 3.5, cy: 3.5, r: 1.9, fill: 'rgba(0,0,0,.10)' }, pT);
    mk('circle', { cx: 3.5, cy: 3.0, r: 1.9, fill: 'rgba(255,255,255,.55)' }, pT);
  }

  const world = mk('g', {}, svg);
  const gGround = mk('g', {}, world);
  const gCity = mk('g', {}, world);
  const gRoute = mk('g', {}, world);
  const gLife = mk('g', {}, world);
  const gPins = mk('g', {}, world);

  // 바닥
  const corners = [
    iso(-150, -150),
    iso(XMAX + 150, -150),
    iso(XMAX + 150, YMAX + 150),
    iso(-150, YMAX + 150),
  ];
  mk(
    'polygon',
    { points: corners.map((p) => `${p.X},${p.Y}`).join(' '), fill: '#E8EBE6' },
    gGround,
  );

  // 도로 격자 (조·초메 근사 130m)
  for (let x = 60; x < XMAX; x += 130) {
    const a = iso(x, 0);
    const b = iso(x, YMAX);
    mk(
      'line',
      { x1: a.X, y1: a.Y, x2: b.X, y2: b.Y, stroke: '#CBD1CB', 'stroke-width': 7 },
      gGround,
    );
  }
  for (let y = 60; y < YMAX; y += 130) {
    const a = iso(0, y);
    const b = iso(XMAX, y);
    mk(
      'line',
      { x1: a.X, y1: a.Y, x2: b.X, y2: b.Y, stroke: '#CBD1CB', 'stroke-width': 7 },
      gGround,
    );
  }
  // 에키마에도리
  const ekimae = mtr(141.352, 0).x;
  {
    const a = iso(ekimae, 0);
    const b = iso(ekimae, YMAX);
    mk(
      'line',
      { x1: a.X, y1: a.Y, x2: b.X, y2: b.Y, stroke: '#BEC5BE', 'stroke-width': 16 },
      gGround,
    );
  }
  // 소세이강
  const sosei = mtr(141.357, 0).x;
  {
    const a = iso(sosei, 0);
    const b = iso(sosei, YMAX);
    mk(
      'line',
      {
        x1: a.X,
        y1: a.Y,
        x2: b.X,
        y2: b.Y,
        stroke: '#9FC4DD',
        'stroke-width': 22,
        'stroke-linecap': 'round',
      },
      gGround,
    );
    mk(
      'line',
      { x1: a.X, y1: a.Y, x2: b.X, y2: b.Y, stroke: '#B9D8EC', 'stroke-width': 12 },
      gGround,
    );
  }
  // 오도리공원 녹지축
  {
    const y = mtr(0, 43.0605).y;
    const x1 = mtr(141.3435, 0).x;
    const x2 = mtr(141.3563, 0).x;
    const c = [iso(x1, y - 42), iso(x2, y - 42), iso(x2, y + 42), iso(x1, y + 42)];
    mk('polygon', { points: c.map((p) => `${p.X},${p.Y}`).join(' '), fill: '#A6C48E' }, gGround);
    for (let x = x1 + 40; x < x2; x += 85) {
      const t = iso(x, y);
      mk('circle', { cx: t.X, cy: t.Y - 7, r: 7, fill: '#6E9E5B' }, gGround);
      mk('rect', { x: t.X - 1.5, y: t.Y - 2, width: 3, height: 6, fill: '#7A5B41' }, gGround);
    }
  }

  // 빌딩 (결정적 의사난수)
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  interface Bld {
    x: number;
    y: number;
    w: number;
    d: number;
    h: number;
    c: string;
  }
  interface Tree {
    x: number;
    y: number;
    c: string;
  }
  const box = (b: Bld, g: Element) => {
    const cs = [
      [b.x - b.w / 2, b.y - b.d / 2],
      [b.x + b.w / 2, b.y - b.d / 2],
      [b.x + b.w / 2, b.y + b.d / 2],
      [b.x - b.w / 2, b.y + b.d / 2],
    ].map((p) => iso(p[0] ?? 0, p[1] ?? 0));
    const tp = cs.map((p) => ({ X: p.X, Y: p.Y - b.h * ISY * 1.15 }));
    const c1 = cs[1]!,
      c2 = cs[2]!,
      c3 = cs[3]!;
    const t1 = tp[1]!,
      t2 = tp[2]!,
      t3 = tp[3]!;
    const east = `${c1.X},${c1.Y} ${c2.X},${c2.Y} ${t2.X},${t2.Y} ${t1.X},${t1.Y}`;
    const south = `${c2.X},${c2.Y} ${c3.X},${c3.Y} ${t3.X},${t3.Y} ${t2.X},${t2.Y}`;
    const roof = tp.map((p) => `${p.X},${p.Y}`).join(' ');
    const ln = shade(b.c, 0.5);
    const G = mk('g', {}, g);
    mk(
      'polygon',
      {
        points: east,
        fill: shade(b.c, 0.84),
        stroke: ln,
        'stroke-width': 0.5,
        'stroke-linejoin': 'round',
      },
      G,
    );
    mk(
      'polygon',
      {
        points: south,
        fill: shade(b.c, 0.66),
        stroke: ln,
        'stroke-width': 0.5,
        'stroke-linejoin': 'round',
      },
      G,
    );
    if (b.h >= 14) {
      mk('polygon', { points: east, fill: 'url(#jw-e)' }, G);
      mk('polygon', { points: south, fill: 'url(#jw-s)' }, G);
    }
    mk(
      'polygon',
      { points: roof, fill: b.c, stroke: ln, 'stroke-width': 0.6, 'stroke-linejoin': 'round' },
      G,
    );
    mk('polygon', { points: roof, fill: 'url(#jw-stud)' }, G);
  };
  const tree = (t: Tree, g: Element) => {
    const p = iso(t.x, t.y);
    mk('ellipse', { cx: p.X, cy: p.Y + 1.5, rx: 6, ry: 3, fill: 'rgba(0,0,0,.12)' }, g);
    mk('rect', { x: p.X - 1.6, y: p.Y - 6, width: 3.2, height: 7, fill: '#7A5B41' }, g);
    mk('circle', { cx: p.X, cy: p.Y - 11, r: 7.5, fill: t.c }, g);
    mk('circle', { cx: p.X - 2.5, cy: p.Y - 13.5, r: 4, fill: shade(t.c, 1.22) }, g);
  };
  const pal = [
    '#E6E0D4',
    '#D7DDE3',
    '#E0D6CA',
    '#D0D7DF',
    '#ECE7DD',
    '#DCE2DC',
    '#F2EFE8',
    '#C9D2DA',
  ];
  const accent = ['#C93A2E', '#2E6DB4', '#E2B21E', '#3C8A4A', '#E07A2B'];
  const treeCol = ['#6E9E5B', '#7FA95F', '#5F8F4E', '#C9A227', '#D9862E'];
  const pick = (arr: string[]) => arr[(rnd() * arr.length) | 0] ?? '#DCD6CB';
  const blds: Bld[] = [];
  const trees: Tree[] = [];
  const parkY = mtr(0, 43.0605).y;
  const parkX2 = mtr(141.3563, 0).x;
  for (let bx = 60; bx < XMAX - 130; bx += 130) {
    for (let by = 60; by < YMAX - 130; by += 130) {
      const cx = bx + 65;
      const cy = by + 65;
      if (Math.abs(cy - parkY) < 60 && cx < parkX2) continue;
      if (Math.abs(cx - sosei) < 28) continue;
      if (rnd() < 0.36) {
        // 빈 필지 — 나무 1-3그루
        const k = 1 + ((rnd() * 3) | 0);
        for (let i = 0; i < k; i++)
          trees.push({ x: cx + (rnd() - 0.5) * 70, y: cy + (rnd() - 0.5) * 70, c: pick(treeCol) });
        continue;
      }
      const n = 1 + ((rnd() * 2) | 0);
      for (let i = 0; i < n; i++) {
        const ox = (rnd() - 0.5) * 54;
        const oy = (rnd() - 0.5) * 54;
        blds.push({
          x: cx + ox,
          y: cy + oy,
          w: 26 + rnd() * 30,
          d: 26 + rnd() * 30,
          h: 10 + rnd() * 38,
          c: rnd() < 0.09 ? pick(accent) : pick(pal),
        });
      }
      if (rnd() < 0.35)
        trees.push({ x: cx + (rnd() - 0.5) * 90, y: cy + (rnd() - 0.5) * 90, c: pick(treeCol) });
    }
  }
  // 랜드마크
  const fm = mtr(141.3654, 43.0662);
  blds.push({ x: fm.x - 70, y: fm.y, w: 150, d: 56, h: 26, c: '#B5654F' });
  blds.push({ x: fm.x + 55, y: fm.y - 8, w: 60, d: 60, h: 34, c: '#BFD9E8' });
  blds.push({ x: fm.x - 10, y: fm.y - 48, w: 16, d: 16, h: 92, c: '#A6543F' });
  const st = mtr(141.3508, 43.0687);
  blds.push({ x: st.x, y: st.y, w: 190, d: 70, h: 30, c: '#C6CFD8' });
  blds.push({ x: st.x + 70, y: st.y + 8, w: 56, d: 56, h: 150, c: '#B9C4CF' });
  const cl = mtr(141.3536, 43.0626);
  blds.push({ x: cl.x, y: cl.y, w: 30, d: 22, h: 16, c: '#F0EDE4' });
  const bm = mtr(141.369, 43.0714);
  blds.push({ x: bm.x, y: bm.y, w: 70, d: 44, h: 40, c: '#B5432F' }); // 맥주 박물관 붉은 벽돌
  blds.push({ x: bm.x + 30, y: bm.y - 30, w: 14, d: 14, h: 80, c: '#A03A28' }); // 굴뚝
  blds.push({ x: bm.x + 55, y: bm.y + 40, w: 120, d: 70, h: 22, c: '#C8B89C' }); // 비어가든 홀
  const ar = mtr(141.3705, 43.0715);
  blds.push({ x: ar.x + 70, y: ar.y + 10, w: 130, d: 110, h: 34, c: '#D7DDE3' }); // 아리오
  const dm = mtr(141.3495, 43.0675);
  blds.push({ x: dm.x, y: dm.y, w: 90, d: 64, h: 60, c: '#D8CFC4' }); // 다이마루
  const tk = mtr(141.3532, 43.0661);
  blds.push({ x: tk.x, y: tk.y, w: 64, d: 56, h: 56, c: '#C9D2DA' }); // 도큐백화점(빅카메라)
  const mts = mtr(141.3531, 43.0596);
  blds.push({ x: mts.x, y: mts.y, w: 70, d: 60, h: 52, c: '#E0D6CA' }); // 미츠코시
  const dq = mtr(141.3535, 43.0572);
  blds.push({ x: dq.x, y: dq.y, w: 40, d: 34, h: 30, c: '#E2B21E' }); // 돈키호테
  type Item = { k: 'b'; o: Bld } | { k: 't'; o: Tree };
  const items: Item[] = [
    ...blds.map((o): Item => ({ k: 'b', o })),
    ...trees.map((o): Item => ({ k: 't', o })),
  ];
  items
    .sort((a, b) => a.o.x + a.o.y - (b.o.x + b.o.y))
    .forEach((it) => (it.k === 'b' ? box(it.o, gCity) : tree(it.o, gCity)));
  // TV타워
  {
    const t = mtr(141.3565, 43.0611);
    const b = iso(t.x, t.y);
    box({ x: t.x, y: t.y, w: 26, d: 26, h: 10, c: '#C9CFD6' }, gCity);
    mk(
      'line',
      { x1: b.X, y1: b.Y - 11, x2: b.X, y2: b.Y - 96, stroke: '#C2452F', 'stroke-width': 5 },
      gCity,
    );
    mk(
      'line',
      { x1: b.X - 11, y1: b.Y - 9, x2: b.X, y2: b.Y - 96, stroke: '#C2452F', 'stroke-width': 2.4 },
      gCity,
    );
    mk(
      'line',
      { x1: b.X + 11, y1: b.Y - 9, x2: b.X, y2: b.Y - 96, stroke: '#C2452F', 'stroke-width': 2.4 },
      gCity,
    );
    mk('rect', { x: b.X - 9, y: b.Y - 72, width: 18, height: 8, rx: 2, fill: '#E8E4DA' }, gCity);
    mk('circle', { cx: b.X, cy: b.Y - 98, r: 2.6, fill: '#C2452F' }, gCity);
  }

  // 살아있는 도시: 차량 + 보행자
  const carCols = ['#2A2A2E', '#C8CCD2', '#4B7A3B', '#2A2A2E', '#B99A2E'];
  interface Actor {
    vert: boolean;
    off: number;
    t: number;
    v: number;
    el: SVGElement;
  }
  const cars: Actor[] = [];
  const peds: Actor[] = [];
  for (let i = 0; i < 7; i++) {
    const g = mk('g', {}, gLife);
    const c = carCols[i % 5] ?? '#2A2A2E';
    mk('ellipse', { cx: 0, cy: 2.6, rx: 5.6, ry: 2.4, fill: 'rgba(0,0,0,.18)' }, g);
    mk('rect', { x: -5.5, y: -4, width: 11, height: 6.5, rx: 2.2, fill: c }, g);
    mk('rect', { x: -2.6, y: -6, width: 5.2, height: 3.4, rx: 1.4, fill: shade(c, 1.45) }, g);
    cars.push({
      vert: i % 2 === 0,
      off: 60 + 130 * (2 + ((rnd() * 10) | 0)),
      t: rnd(),
      v: 0.00035 + rnd() * 0.0004,
      el: g,
    });
  }
  for (let i = 0; i < 10; i++) {
    const d = mk('circle', { r: 2.1, fill: i % 3 ? '#3E4A55' : '#0B5B9F' }, gLife);
    peds.push({
      vert: i % 2 === 0,
      off: 60 + 130 * (1 + ((rnd() * 11) | 0)),
      t: rnd(),
      v: 0.00006 + rnd() * 0.00007,
      el: d,
    });
  }
  let lifeRaf = 0;
  const tick = () => {
    for (const c of cars) {
      c.t = (c.t + c.v) % 1;
      const p = iso(c.vert ? c.off : c.t * XMAX, c.vert ? c.t * YMAX : c.off);
      c.el.setAttribute('transform', `translate(${p.X},${p.Y})`);
    }
    for (const pd of peds) {
      pd.t = (pd.t + pd.v) % 1;
      const p = iso(pd.vert ? pd.off + 5 : pd.t * XMAX, pd.vert ? pd.t * YMAX : pd.off + 5);
      pd.el.setAttribute('cx', String(p.X));
      pd.el.setAttribute('cy', String(p.Y));
    }
    lifeRaf = requestAnimationFrame(tick);
  };
  lifeRaf = requestAnimationFrame(tick);

  // 여행자 캐릭터 — 바깥 g 는 위치, 안쪽 g 는 화면 크기 유지용 배율
  const trav = mk('g', {}, gPins);
  const travIn = mk('g', {}, trav);
  mk('ellipse', { cx: 0, cy: 2.5, rx: 6, ry: 2.6, fill: 'rgba(8,58,102,.3)' }, travIn);
  mk('rect', { x: -3.6, y: -10, width: 7.2, height: 8.4, rx: 2.4, fill: '#0B5B9F' }, travIn);
  mk('circle', { cx: 0, cy: -13.4, r: 4.2, fill: '#F2C89B' }, travIn);
  mk(
    'path',
    { d: 'M-4.4,-14.6 A4.5,4.5 0 0 1 4.4,-14.6 L4.4,-13.2 L-4.4,-13.2 Z', fill: '#083A66' },
    travIn,
  );
  mk(
    'rect',
    { x: -2.2, y: -9, width: 4.4, height: 5, rx: 1.4, fill: '#fff', opacity: 0.9 },
    travIn,
  );

  return { gRoute, gPins, trav, travIn, stopLife: () => cancelAnimationFrame(lifeRaf) };
}

/** 핀은 SVG 단위가 아니라 화면 px 로 늘 같은 크기(약 30px). 뷰박스 폭/창 폭 비율로 역보정한다. */
function pinScaleFor(vw: number): number {
  return Math.max(1, Math.min(6, (vw / window.innerWidth) * 1.15));
}

function drawPin(
  g: SVGElement,
  pt: { X: number; Y: number },
  n: number,
  opt: boolean,
  on: boolean,
  scale: number,
  onClick: () => void,
): void {
  const G = mk(
    'g',
    {
      transform: `translate(${pt.X},${pt.Y}) scale(${scale})`,
      cursor: 'pointer',
      'data-pin': '1',
      'data-x': pt.X,
      'data-y': pt.Y,
    },
    g,
  );
  G.addEventListener('click', (ev) => {
    ev.stopPropagation();
    onClick();
  });
  mk('ellipse', { cx: 0, cy: 2, rx: 9, ry: 4, fill: 'rgba(8,58,102,.25)' }, G);
  const h = on ? 34 : 26;
  const r = on ? 12 : 9.5;
  mk(
    'path',
    {
      d: `M0,0 C-${r},-${h * 0.55} -${r},-${h} 0,-${h} C${r},-${h} ${r},-${h * 0.55} 0,0`,
      fill: opt ? '#fff' : '#0B5B9F',
      stroke: opt ? '#B0432F' : '#fff',
      'stroke-width': opt ? 2 : 2.2,
    },
    G,
  );
  mk(
    'circle',
    { cx: 0, cy: -h + (on ? 11 : 8.5), r: on ? 8.6 : 6.8, fill: opt ? '#B0432F' : '#fff' },
    G,
  );
  const t = mk(
    'text',
    {
      x: 0,
      y: -h + (on ? 14.6 : 11.4),
      'text-anchor': 'middle',
      'font-size': on ? 11 : 9,
      'font-weight': 800,
      fill: opt ? '#fff' : '#0B5B9F',
    },
    G,
  );
  t.textContent = String(n);
  if (on) {
    const ring = mk(
      'circle',
      { cx: 0, cy: 2, r: 14, fill: 'none', stroke: '#0B5B9F', 'stroke-width': 2, opacity: 0.55 },
      G,
    );
    ring.innerHTML =
      '<animate attributeName="r" values="10;20" dur="1.6s" repeatCount="indefinite"/>' +
      '<animate attributeName="opacity" values=".6;0" dur="1.6s" repeatCount="indefinite"/>';
  }
}

const gmapUrl = (q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

/* ---------- 컴포넌트 ---------- */
export function JoptPlanner() {
  const [day, setDay] = useState(0);
  const [sel, setSel] = useState(2);
  // 첫 진입에서는 닫아 둔다 — 폰에서 지도부터 가렸다(2026-09-22 Jay).
  const [detailOpen, setDetailOpen] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<CityRefs | null>(null);
  const vbRef = useRef({ x: -800, y: 300, w: 2400, h: 1500 });
  const pinScaleRef = useRef(1);
  const dragRef = useRef<{
    x: number;
    y: number;
    vb: { x: number; y: number; w: number; h: number };
  } | null>(null);
  const travRaf = useRef(0);

  const D = DAYS[day] ?? DAYS[0]!;
  const stop = D.stops[sel] ?? D.stops[0]!;
  // PL 은 리터럴 유니온이라 tel 이 없는 멤버에서 접근이 막힌다 → 공통 타입으로 넓힌다.
  const place: Place = PL[stop.p];

  const applyVB = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const vb = vbRef.current;
    const r = window.innerWidth / window.innerHeight;
    // 요청 사각형을 화면 비율에 맞춰 넓힌 뒤, 그 결과를 vb 에 되써서 이후 줌·드래그가 같은 기준을 쓴다.
    const vw = vb.h * r > vb.w ? vb.h * r : vb.w;
    const vh = vw / r;
    vb.x -= (vw - vb.w) / 2;
    vb.y -= (vh - vb.h) / 2;
    vb.w = vw;
    vb.h = vh;
    svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    const k = pinScaleFor(vw);
    pinScaleRef.current = k;
    const city = cityRef.current;
    if (!city) return;
    city.gPins.querySelectorAll<SVGElement>('[data-pin]').forEach((p) => {
      p.setAttribute('transform', `translate(${p.dataset.x},${p.dataset.y}) scale(${k})`);
    });
    city.travIn.setAttribute('transform', `scale(${k})`);
  }, []);

  const fitDay = useCallback(
    (di: number) => {
      const plan = DAYS[di] ?? DAYS[0]!;
      const pts = plan.stops.map((st) => proj(PL[st.p].lng, PL[st.p].lat));
      const xs = pts.map((p) => p.X);
      const ys = pts.map((p) => p.Y);
      const x0 = Math.min(...xs) - 260;
      const x1 = Math.max(...xs) + 260;
      const y0 = Math.min(...ys) - 220;
      const y1 = Math.max(...ys) + 160;
      vbRef.current = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
      applyVB();
    },
    [applyVB],
  );

  const zoom = useCallback(
    (f: number, cx?: number, cy?: number) => {
      const vb = vbRef.current;
      const px = cx ?? window.innerWidth / 2;
      const py = cy ?? window.innerHeight / 2;
      // applyVB 가 vb 를 화면 비율로 정규화해 두므로 x·y 배율이 같다.
      const k = vb.w / window.innerWidth;
      const mx = vb.x + px * k;
      const my = vb.y + py * k;
      const nf = Math.max(0.12, Math.min(6, (vb.w * f) / 2400)) / (vb.w / 2400); // 줌 범위 제한
      vb.w *= nf;
      vb.h *= nf;
      vb.x = mx - (mx - vb.x) * nf;
      vb.y = my - (my - vb.y) * nf;
      applyVB();
    },
    [applyVB],
  );

  // 도시 1회 빌드 + 생명 루프
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const city = buildCity(svg);
    cityRef.current = city;
    fitDay(0);
    const onResize = () => applyVB();
    window.addEventListener('resize', onResize);
    return () => {
      city.stopLife();
      window.removeEventListener('resize', onResize);
      svg.innerHTML = '';
      cityRef.current = null;
    };
  }, [applyVB, fitDay]);

  // 오늘 날짜 탭으로 (SSR 과 어긋나지 않게 mount 후)
  useEffect(() => {
    const i = todayIndex();
    if (i === 0) return;
    setDay(i);
    setSel((DAYS[i] ?? DAYS[0]!).initialSel);
    fitDay(i);
  }, [fitDay]);

  // 휠 줌 + 핀치 (passive:false 필요)
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let pinch = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoom(e.deltaY > 0 ? 1.12 : 0.89, e.clientX, e.clientY);
    };
    const onTS = (e: TouchEvent) => {
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      if (t0 && t1) pinch = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
    };
    const onTM = (e: TouchEvent) => {
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      if (pinch && t0 && t1) {
        const d = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
        zoom(pinch / d, (t0.clientX + t1.clientX) / 2, (t0.clientY + t1.clientY) / 2);
        pinch = d;
      }
    };
    const onTE = () => {
      pinch = 0;
    };
    wrap.addEventListener('wheel', onWheel, { passive: false });
    wrap.addEventListener('touchstart', onTS, { passive: true });
    wrap.addEventListener('touchmove', onTM, { passive: true });
    wrap.addEventListener('touchend', onTE);
    return () => {
      wrap.removeEventListener('wheel', onWheel);
      wrap.removeEventListener('touchstart', onTS);
      wrap.removeEventListener('touchmove', onTM);
      wrap.removeEventListener('touchend', onTE);
    };
  }, [zoom]);

  // 경로 + 핀 + 여행자 (day/sel 반응)
  useEffect(() => {
    const city = cityRef.current;
    if (!city) return;
    const plan = DAYS[day] ?? DAYS[0]!;
    city.gRoute.innerHTML = '';
    // trav 를 제외한 핀 제거
    Array.from(city.gPins.children).forEach((ch) => {
      if (ch !== city.trav) ch.remove();
    });
    plan.stops.forEach((st, i) => {
      if (i === 0) return;
      const prev = plan.stops[i - 1];
      if (!prev || prev.p === st.p) return;
      const m = MODE_STYLE[st.mode];
      const attrs: Record<string, string | number> = {
        d: legPathD(PL[prev.p], PL[st.p]),
        fill: 'none',
        stroke: m.stroke,
        'stroke-width': i === sel ? m.w + 2 : m.w,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        opacity: st.opt ? 0.55 : 0.95,
      };
      if (m.dash) attrs['stroke-dasharray'] = m.dash;
      const pth = mk('path', attrs, city.gRoute);
      if (i === sel) {
        if (!m.dash) pth.setAttribute('stroke-dasharray', '30 14');
        pth.innerHTML =
          '<animate attributeName="stroke-dashoffset" values="60;0" dur="1.2s" repeatCount="indefinite"/>';
      }
    });
    plan.stops.forEach((st, i) => {
      drawPin(
        city.gPins,
        proj(PL[st.p].lng, PL[st.p].lat),
        i + 1,
        Boolean(st.opt),
        i === sel,
        pinScaleRef.current,
        () => {
          setSel(i);
          setDetailOpen(true);
        },
      );
    });
    // 여행자: 이전 정거장 → 선택 정거장 왕복 애니메이션
    cancelAnimationFrame(travRaf.current);
    const cur = plan.stops[sel] ?? plan.stops[0]!;
    const prv = plan.stops[Math.max(0, sel - 1)] ?? cur;
    const tmp = mk(
      'path',
      { d: legPathD(PL[prv.p], PL[cur.p]), fill: 'none' },
      city.gRoute,
    ) as SVGPathElement;
    const L = tmp.getTotalLength();
    if (L > 1) {
      let t0 = 0;
      const run = (ts: number) => {
        if (!t0) t0 = ts;
        const k = ((ts - t0) / 4200) % 1;
        const pt = tmp.getPointAtLength(k * L);
        city.trav.setAttribute('transform', `translate(${pt.x},${pt.y})`);
        travRaf.current = requestAnimationFrame(run);
      };
      travRaf.current = requestAnimationFrame(run);
    } else {
      const pt = proj(PL[cur.p].lng, PL[cur.p].lat);
      city.trav.setAttribute('transform', `translate(${pt.X},${pt.Y - 6})`);
    }
    return () => cancelAnimationFrame(travRaf.current);
  }, [day, sel]);

  const onDayClick = (i: number) => {
    setDay(i);
    setSel((DAYS[i] ?? DAYS[0]!).initialSel);
    setDetailOpen(false);
    fitDay(i);
  };
  const onSelect = (i: number) => {
    setSel(i);
    setDetailOpen(true);
    const plan = DAYS[day] ?? DAYS[0]!;
    const st = plan.stops[i];
    if (st) {
      const pt = proj(PL[st.p].lng, PL[st.p].lat);
      vbRef.current.x = pt.X - vbRef.current.w / 2;
      vbRef.current.y = pt.Y - vbRef.current.h / 2;
      applyVB();
    }
  };

  const badgeClass: Record<Badge, string> = {
    main: s.badgeMain ?? '',
    free: s.badgeFree ?? '',
    shop: s.badgeShop ?? '',
    whisky: s.badgeWhisky ?? '',
    beer: s.badgeBeer ?? '',
    food: s.badgeFood ?? '',
  };

  return (
    <div className={s.root}>
      <div
        ref={wrapRef}
        className={s.map}
        onPointerDown={(e) => {
          dragRef.current = { x: e.clientX, y: e.clientY, vb: { ...vbRef.current } };
          (e.target as Element).setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = dragRef.current;
          if (!d) return;
          const k = vbRef.current.w / window.innerWidth;
          vbRef.current.x = d.vb.x - (e.clientX - d.x) * k;
          vbRef.current.y = d.vb.y - (e.clientY - d.y) * k;
          applyVB();
        }}
        onPointerUp={() => {
          dragRef.current = null;
        }}
      >
        <svg ref={svgRef} xmlns={NS} />
      </div>

      <header className={s.top}>
        <div className={s.brand}>
          <span className={s.clover}>♣</span>
          <span>
            JOPT SAPPORO 2026
            <small>LEGO 원정 플래너 · 9/21 - 9/25</small>
          </span>
        </div>
        <nav className={s.tabs}>
          {DAYS.map((dp, i) => (
            <button
              key={dp.label}
              type="button"
              className={i === day ? s.tabOn : s.tab}
              onClick={() => onDayClick(i)}
              aria-label={`${dp.label} ${dp.date}`}
              aria-pressed={i === day}
            >
              {dp.label}
              <small>{dp.date}</small>
            </button>
          ))}
        </nav>
      </header>

      <aside className={s.panel}>
        {D.stops.map((st, i) => (
          <button
            key={`${st.p}-${i}`}
            type="button"
            className={[s.card, i === sel ? s.cardOn : '', st.opt ? s.cardOpt : ''].join(' ')}
            onClick={() => onSelect(i)}
            aria-pressed={i === sel}
          >
            <span className={s.row1}>
              <span className={s.no}>{i + 1}</span>
              <span className={s.nm}>{PL[st.p].nm}</span>
              {st.opt ? (
                <span className={s.badgeOpt}>대안</span>
              ) : (
                st.badge && <span className={badgeClass[st.badge]}>{BADGE_LABEL[st.badge]}</span>
              )}
              <span className={s.tm}>{st.t}</span>
            </span>
            <span className={s.mode}>
              <span className={`${s.mline} ${s[`ml_${st.mode}`] ?? ''}`} />
              {st.mv}
            </span>
            {st.note && <span className={s.note}>{st.note}</span>}
          </button>
        ))}
      </aside>

      <div className={s.zoom}>
        <button type="button" onClick={() => zoom(0.8)} aria-label="확대">
          +
        </button>
        <button type="button" onClick={() => zoom(1.25)} aria-label="축소">
          −
        </button>
        <button type="button" onClick={() => fitDay(day)} aria-label="전체 보기">
          ◎
        </button>
      </div>

      {detailOpen && (
        <section className={s.detail} aria-label="장소 상세">
          <button
            type="button"
            className={s.x}
            onClick={() => setDetailOpen(false)}
            aria-label="닫기"
          >
            ✕
          </button>
          <div className={s.dbody}>
            <h3>
              <span className={s.dno}>{sel + 1}</span>
              {place.nm}
            </h3>
            <dl className={s.meta}>
              <dt>방문 시간</dt>
              <dd>{stop.t}</dd>
              <dt>체류</dt>
              <dd>{stop.stay}</dd>
              <dt>이동</dt>
              <dd>{stop.mv}</dd>
              <dt>메모</dt>
              <dd>{stop.note || '-'}</dd>
            </dl>
            <div className={s.dacts}>
              <a
                className={s.dact}
                href={gmapUrl(place.map)}
                target="_blank"
                rel="noreferrer"
                aria-label={`${place.nm} 구글맵 열기`}
              >
                구글맵 열기
              </a>
              {place.tel && (
                <a className={s.dactTel} href={`tel:${place.tel}`} aria-label={`${place.nm} 전화`}>
                  전화
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      <footer className={s.stats}>
        <span>
          도보 <b>약 {D.km}km</b>
        </span>
        <span className={s.sep}>|</span>
        <span>
          이동 <b>약 {D.min}분</b>
        </span>
        <span className={s.sep}>|</span>
        <span>
          일정 <b>{D.stops.length}곳</b>
        </span>
        <a href="/jopt">일정표로 →</a>
      </footer>
    </div>
  );
}
