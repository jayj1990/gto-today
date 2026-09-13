import type { Metadata } from 'next';
import Image from 'next/image';
import s from './process.module.css';

export const metadata: Metadata = {
  title: '제작 과정 · JOPT SAPPORO 플래너',
  robots: { index: false, follow: false },
};

// 캠페인 BEFORE 화면용 raw scraped rows — 앱 UI가 아닌 제작 과정 아카이브.
const ROWS = [
  [
    '신치토세공항 (CTS)',
    'transit',
    '42.7752',
    '141.6923',
    '-',
    '-',
    '50m',
    '도착 (ZE0625 11:50)',
    'eastarjet.com',
  ],
  [
    'JR 삿포로역',
    'transit',
    '43.0687',
    '141.3508',
    '-',
    '-',
    '통과',
    'JR 쾌속 에어포트 40m ¥1,150',
    'jrhokkaido.co.jp',
  ],
  [
    '삿포로 하우스 (숙소)',
    'stay',
    '43.0700',
    '141.3480',
    '4.95',
    '체크인 9/21',
    '30m',
    '도보 10m',
    'airbnb.co.kr',
  ],
  [
    '삿포로 팩토리 홀',
    'event',
    '43.0662',
    '141.3654',
    '-',
    '10:00-20:00 (몰)',
    '14:00-23:30',
    '도보 20m / 지하철 5m',
    'events.japanopenpoker.com · visit-hokkaido.jp',
  ],
  [
    '니조시장',
    'food',
    '43.0576',
    '141.3585',
    '-',
    '07:00-17:00',
    '40m',
    '도보 18m',
    'visit-hokkaido.jp',
  ],
  [
    '삿포로 TV타워',
    'sight',
    '43.0611',
    '141.3565',
    '-',
    '09:00-22:00',
    '40m',
    '도보 8m',
    'visit-hokkaido.jp detail_10011',
  ],
  [
    '오도리공원',
    'sight',
    '43.0605',
    '141.3540',
    '-',
    '상시',
    '20m',
    '도보 3m',
    'visit-hokkaido.jp',
  ],
  [
    '삿포로 시계탑',
    'sight',
    '43.0626',
    '141.3536',
    '-',
    '08:45-17:10',
    '15m',
    '도보 4m',
    'sapporoshi-tokeidai.jp',
  ],
  [
    '스스키노',
    'food·night',
    '43.0554',
    '141.3532',
    '-',
    '저녁-심야',
    '90m',
    '지하철 2정거장 / 도보 12m',
    '공개 지도',
  ],
];

const SHOTS: Array<{ src: string; title: string; cap: string; wide?: boolean }> = [
  {
    src: '/jopt/master.png',
    title: '① Master Style — LEGO 삿포로 도심',
    cap: '오도리공원 녹지축 · TV타워 · JR타워 · 격자 시가지. 모든 에셋의 조명·재질·스케일 기준.',
    wide: true,
  },
  {
    src: '/jopt/factory.png',
    title: '② Day 1 핵심 — 삿포로 팩토리 홀',
    cap: '붉은 벽돌 양조장 단지 · 굴뚝 · 유리 아트리움 · JOPT 블루 배너와 입장하는 플레이어들.',
    wide: true,
  },
  {
    src: '/jopt/streets.png',
    title: '③ 일본 거리 에셋',
    cap: '횡단보도 · 콘비니 · 지하철 출입구 · 신호등 · 자판기.',
  },
  {
    src: '/jopt/transport.png',
    title: '④ 교통수단',
    cap: '일본 택시 · 버스 · JR 쾌속 에어포트 · 이동수단 아이콘.',
  },
  {
    src: '/jopt/people.png',
    title: '⑤ LEGO 피플',
    cap: '카드를 든 메인 여행자 · 관광객 · 직장인, 워크 사이클용 포즈.',
  },
  {
    src: '/jopt/mapui.png',
    title: '⑥ 맵 UI 에셋',
    cap: 'JOPT 블루 핀 · 방문 순서 마커 · 도보/지하철/택시 경로 리본.',
  },
];

const HEAD = [
  'name',
  'category',
  'lat',
  'lng',
  'rating',
  'opening_hours',
  'duration',
  'transport',
  'source',
];

export default function JoptProcessPage() {
  return (
    <main className={s.wrap}>
      <h1>제작 과정 — 실제 웹 데이터에서 살아있는 LEGO 삿포로까지</h1>
      <p className={s.sub}>JOPT 2026 Sapporo #02 원정 플래너 · 캠페인 BEFORE/AFTER 아카이브</p>

      <div className={s.flow}>
        <span className={s.step}>Phase 0 · Data Collection</span>
        <span className={s.arrow}>→</span>
        <span className={s.step}>Phase 1 · Higgsfield Asset Generation</span>
        <span className={s.arrow}>→</span>
        <span className={s.step}>Review &amp; Approval</span>
        <span className={s.arrow}>→</span>
        <span className={s.stepOn}>Functional App</span>
      </div>

      <h2>Phase 0 — Raw scraped rows (BEFORE)</h2>
      <p>
        앱을 만들기 전에 수집한 가공 전 데이터입니다. 좌표는 공개 지도 기준 근사값이고 영업시간은
        홋카이도 공식 관광 사이트 등에서 확인했습니다. 이 표는 제작 과정 산출물이라 앱 UI에는
        들어가지 않는데, 아래 원시 행이 완성 앱의 핀·동선·일정 카드로 변환됐다는 게 이 페이지가
        보여주려는 전부입니다.
      </p>
      <div className={s.tablewrap}>
        <table>
          <thead>
            <tr>
              {HEAD.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r[0]}>
                {r.map((c, i) => (
                  <td key={`${r[0]}-${HEAD[i]}`}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Phase 1 — Higgsfield 에셋 (FLUX.2 Pro · 6종)</h2>
      <p>
        컨셉은 하나입니다. &ldquo;Real Sapporo transformed into a premium miniature LEGO-style
        travel world.&rdquo; 모든 장이 같은 45도 아이소메트릭 시점, 9월 초가을 광선, JOPT
        블루(#0B5B9F) 액센트를 공유하도록 한 배치로 생성했고, 사용자 승인을 받은 뒤에야 앱 빌드에
        들어갔습니다.
      </p>
      <div className={s.gallery}>
        {SHOTS.map((sh) => (
          <figure key={sh.src} className={sh.wide ? s.shotWide : s.shot}>
            <div className={sh.wide ? s.imgWide : s.img}>
              <Image
                src={sh.src}
                alt={sh.title}
                fill
                sizes="(max-width: 640px) 100vw, 450px"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <figcaption>
              <b>{sh.title}</b>
              <span>{sh.cap}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <a className={s.back} href="/jopt">
        ← 완성된 플래너로 돌아가기
      </a>
    </main>
  );
}
