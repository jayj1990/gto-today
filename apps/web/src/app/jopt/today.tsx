'use client';

// jopt.gto.today — 9/22(화) 자유일 일정표 원페이저.
//   스플래시(마스터 렌더) → 커버(도심 렌더 + 패럴랙스) → 타임라인(정거장마다 LEGO 장면 렌더)
//   → 내일 Bullet 카드 → 목·금 안내. 사진은 Google Places API 의 이용자 사진(작성자 표기 필수)이고
//   동선 지도는 Google Static Maps 로 뽑아 public/jopt/today/ 에 둔다. 처음엔 LEGO 렌더 장면을 썼는데
//   Jay 가 실제 사진을 원해서 바꿨다(2026-09-22 12:30). 돈키는 샤브샤브 뒤·C&C 앞(12:45 Jay).
//   "지금" 표시는 JST 기준 현재 시각이 9/22 일 때만 켠다.
import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import s from './today.module.css';

type Tag = 'move' | 'food' | 'shop' | 'walk' | 'whisky';
const TAG_LABEL: Record<Tag, string> = {
  move: '이동',
  food: '식사',
  shop: '쇼핑',
  walk: '산책',
  whisky: '위스키',
};
const TAG_CLASS: Record<Tag, string> = {
  move: s.tagWalk ?? '',
  food: s.tagFood ?? '',
  shop: s.tagShop ?? '',
  walk: s.tagWalk ?? '',
  whisky: s.tagWhisky ?? '',
};

interface Stop {
  key: string;
  time: string;
  until?: string;
  tag: Tag;
  title: string;
  /** 없으면 사진 없는 짧은 카드(택시 이동) */
  img?: string;
  alt?: string;
  /** Google Maps 이용자 사진 작성자 — Places API 약관상 표기 */
  credit?: string;
  meta?: string;
  desc: string[];
  map?: string;
  mapLabel?: string;
  tel?: string;
}

const HOME_Q = '北7条東4丁目15-78 札幌市東区';

const STOPS: Stop[] = [
  {
    key: 'taxi',
    time: '13:00',
    tag: 'move',
    title: '숙소 출발 (택시)',
    meta: '택시 10분 · ¥1,300 안팎 · 목적지 二条市場',
    desc: [
      '여권을 꼭 챙기세요. 면세 카운터도, 위스키 정가 판매점의 1인 1병 확인도 전부 여권으로 합니다. 낮 20도에 흐림이고 밤에 약한 비가 올 수 있어서 얇은 겉옷 하나면 됩니다.',
    ],
    map: '二条市場 札幌',
    mapLabel: '니조시장까지 경로',
  },
  {
    key: 'kaisendon',
    time: '13:15',
    until: '14:10',
    tag: 'food',
    title: '다이이치 카이센마루 · 카이센동',
    img: '/jopt/today/kaisendon.jpg',
    alt: '다이이치 카이센마루의 카이센동',
    credit: '김민재',
    meta: '니조시장 안 (南3条東1-8-2) · 화 07:00-15:00 · 카이센동 31종 · 1인 ¥4,999 이하 · 구글 4.6 (698) · 050-5456-4038',
    desc: [
      '니조시장 안에 있는 카이센동 전문점입니다. 카이센동 31종이 있고 1인 예산은 5,000엔 안쪽입니다. 8명이 한 번에 앉기 어려우면 두 팀으로 나눠 들어가는 게 빠릅니다. 게, 성게, 연어알은 가격표가 붙은 것으로 고르세요.',
    ],
    map: '第一海鮮丸 二条市場 札幌',
    tel: '05054564038',
  },
  {
    key: 'nijo',
    time: '14:10',
    until: '14:50',
    tag: 'walk',
    title: '니조시장 구경',
    img: '/jopt/today/nijo.jpg',
    alt: '니조시장 골목',
    credit: 'Franek Kosmider',
    meta: '07:00-18:00 · 가게 대부분 17시 전후 마감',
    desc: [
      '점심 먹은 자리에서 바로 이어집니다. 시장은 7시부터 18시까지 열지만 가게 대부분이 17시 전후로 문을 닫습니다. 게와 멜론은 공항 면세보다 여기가 싸고 무거운 건 택배 접수가 됩니다.',
    ],
    map: '二条市場 札幌',
  },
  {
    key: 'parco',
    time: '15:00',
    until: '15:50',
    tag: 'shop',
    title: '삿포로 파르코',
    img: '/jopt/today/parco.jpg',
    alt: '삿포로 파르코 외관',
    credit: 'G C',
    meta: '南1条西3 · 10:00-20:00 · 니조시장에서 도보 10분 · 면세',
    desc: [
      '니조시장에서 걸어서 10분입니다. 꼼데가르송, 비비안 웨스트우드, 유나이티드 애로우즈, 디젤, 포터가 있고 면세가 됩니다. 20시까지 엽니다.',
    ],
    map: '札幌PARCO',
  },
  {
    key: 'mitsukoshi',
    time: '15:50',
    until: '16:50',
    tag: 'shop',
    title: '삿포로 미츠코시',
    img: '/jopt/today/mitsukoshi.jpg',
    alt: '삿포로 미츠코시 지하 식품관',
    credit: 'narick boxx',
    meta: '파르코 길 건너 · 10:00-19:00 (B2-1F 19:30) · 루이비통 삿포로 1호점',
    desc: [
      '파르코 바로 길 건너입니다. 삿포로 루이비통 1호점이 여기 있고 1층에 티파니와 불가리 같은 주얼리 부티크가 모여 있습니다. 지하 1층 주류 코너에서 야마자키와 히비키 재고를 물어보세요. 정가면 보통 1인 1병입니다. 19시에 닫으니 이 시간이 마지막 여유입니다.',
    ],
    map: '札幌三越',
  },
  {
    key: 'walk',
    time: '16:50',
    until: '18:45',
    tag: 'walk',
    title: '산책 · 다누키코지에서 오도리공원',
    img: '/jopt/today/walk.jpg',
    alt: '가을 오도리공원',
    credit: '楊傑銘',
    meta: '일몰 17:30 안팎 · TV타워 전망대 09:00-22:00',
    desc: [
      '미츠코시에서 다누키코지까지 걸어서 5분입니다. 상점가를 따라 서쪽으로 걷다가 오도리공원으로 올라갑니다. 해가 17시 30분쯤 지니까 TV타워 불이 켜지는 걸 보기 좋은 시간입니다. 전망대는 22시까지 열고 올라가지 않아도 공원 끝에서 보는 야경이 충분합니다.',
    ],
    map: 'さっぽろテレビ塔',
  },
  {
    key: 'shabu',
    time: '19:00',
    until: '21:00',
    tag: 'food',
    title: '샤브샤브 레터스 스스키노점',
    img: '/jopt/today/shabu.jpg',
    alt: '샤브샤브 레터스의 고기와 냄비',
    credit: '김만자',
    meta: '南5条西2-8-10 氷雪の門ビル 1F · 17:00-24:00 (LO 23:30) · 평균 ¥3,500 · 구글 4.7 (1,083) · 011-206-9779',
    desc: [
      '남5조서2 효세츠노몬 빌딩 1층입니다. 1인 1냄비 방식이라 육수와 고기를 각자 고르고 평균 예산은 3,500엔입니다. 17시부터 24시까지 열고 마지막 주문은 23시 30분입니다. 8명이니 전화로 예약해 두세요.',
    ],
    map: 'しゃぶしゃぶ れたす 札幌すすきの店',
    tel: '0112069779',
  },
  {
    key: 'donki',
    time: '21:00',
    until: '21:30',
    tag: 'whisky',
    title: 'MEGA 돈키호테 다누키코지 본점',
    img: '/jopt/today/donki.jpg',
    alt: 'MEGA 돈키호테 삿포로 다누키코지 본점 외관',
    credit: 'MEGAドン・キホーテ 札幌狸小路本店',
    meta: '南3条西4 · 24시간 · 샤브샤브에서 도보 5분 · 구글 3.8 (8,163)',
    desc: [
      '샤브샤브에서 걸어서 5분, 24시간 영업입니다. C&C에 가기 전에 들러 야마자키와 히비키 시세만 보세요. 거의 항상 있지만 정가의 1.5배에서 2배라 여기서 사면 손해입니다. 오가는 편의점에서 야마자키나 하쿠슈 180ml 미니보틀이 보이면 그건 정가라 바로 집으면 됩니다.',
    ],
    map: 'ドン・キホーテ 狸小路店',
  },
  {
    key: 'whisky',
    time: '21:35',
    until: '22:00',
    tag: 'whisky',
    title: '사카야 C&C · 위스키',
    img: '/jopt/today/whisky.jpg',
    alt: '酒屋 C&C 입구',
    credit: '酒屋Ｃ＆Ｃ',
    meta: '南5条西4-9-3 ライラックビル 1F · 월-토 15:00-23:00 · 일·공휴일 휴무 · 면세 · 구글 4.1 (63) · 011-518-1351',
    desc: [
      '돈키에서 걸어서 6분, 남5조서4 라일락 빌딩 1층입니다. 리커즈 카메하타가 직영하는 주류점이고 면세가 됩니다. 월요일부터 토요일까지 15시에서 23시에 열고 일요일과 공휴일은 쉽니다.',
      '정가는 야마자키 NV 8,250엔, 야마자키 12년 17,600엔, 히비키 하모니 8,800엔입니다. 이보다 비싸면 프리미엄이 붙은 것이니 그 차이를 보고 결정하세요.',
    ],
    map: '酒屋C&C ライラックビル 南5条西4丁目 札幌',
    tel: '0115181351',
  },
  {
    key: 'home',
    time: '22:05',
    tag: 'move',
    title: '택시로 숙소',
    meta: '택시 10분 · ¥1,300 안팎',
    desc: ['10분, 1,300엔 안팎입니다. 내일 11시 불렛이니 일찍 자는 게 이깁니다.'],
    map: HOME_Q,
    mapLabel: '숙소 지도',
  },
];

const gmap = (q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
/** 오늘 동선 전체를 구글맵 경로로(경유지 최대 9곳). */
const ROUTE_URL =
  'https://www.google.com/maps/dir/?api=1' +
  `&origin=${encodeURIComponent('二条市場 札幌')}` +
  `&destination=${encodeURIComponent('酒屋C&C ライラックビル 南5条西4丁目 札幌')}` +
  `&waypoints=${encodeURIComponent(
    [
      '札幌PARCO',
      '札幌三越',
      'さっぽろテレビ塔',
      'しゃぶしゃぶ れたす 札幌すすきの店',
      'ドン・キホーテ 狸小路店',
    ].join('|'),
  )}` +
  '&travelmode=walking';

/** JST 기준 현재 시각. 9/22 가 아니면 null. */
function nowStopIndex(): number | null {
  const d = new Date(Date.now() + 9 * 3600e3);
  if (d.getUTCMonth() !== 8 || d.getUTCDate() !== 22) return null;
  const hm = d.getUTCHours() * 60 + d.getUTCMinutes();
  let idx: number | null = null;
  STOPS.forEach((st, i) => {
    const [h, m] = st.time.split(':').map(Number);
    if ((h ?? 0) * 60 + (m ?? 0) <= hm) idx = i;
  });
  if (idx !== null && hm >= 22 * 60 + 30) return null;
  return idx;
}

export function TodayItinerary() {
  const [splash, setSplash] = useState<'on' | 'out' | 'off'>('on');
  const [barOn, setBarOn] = useState(false);
  const [nowIdx, setNowIdx] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const coverImgRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<HTMLDivElement>(null);

  const dismissSplash = useCallback(() => {
    setSplash((v) => (v === 'on' ? 'out' : v));
  }, []);

  // 스플래시: 2.4초 뒤 자동, 탭하면 즉시. 떠 있는 동안은 본문 스크롤을 막는다.
  useEffect(() => {
    if (splash === 'on') {
      // 같은 세션에서 두 번째 진입(지도에서 돌아올 때 등)은 스플래시를 건너뛴다.
      try {
        if (sessionStorage.getItem('jopt-splash')) {
          setSplash('off');
          return undefined;
        }
        sessionStorage.setItem('jopt-splash', '1');
      } catch {
        /* 사파리 프라이빗 모드 등 — 그냥 보여 준다 */
      }
      document.body.style.overflow = 'hidden';
      const t = setTimeout(dismissSplash, 2400);
      return () => clearTimeout(t);
    }
    if (splash === 'out') {
      document.body.style.overflow = '';
      const t = setTimeout(() => setSplash('off'), 950);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [splash, dismissSplash]);

  // 스크롤: 커버 패럴랙스 + 스티키 바 + 타임라인 채움
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const vh = window.innerHeight;
        const img = coverImgRef.current;
        if (img) img.style.transform = `translateY(${Math.min(y, vh) * 0.35}px)`;
        setBarOn(y > vh - 80);
        const tl = tlRef.current;
        if (tl) {
          const r = tl.getBoundingClientRect();
          const f = Math.max(0, Math.min(1, (vh * 0.55 - r.top) / r.height));
          tl.style.setProperty('--fill', `${(f * 100).toFixed(1)}%`);
        }
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // 등장 애니메이션
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add(s.in ?? 'in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // "지금" 정거장 — 1분마다
  useEffect(() => {
    const tick = () => setNowIdx(nowStopIndex());
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, []);

  const nowStop = nowIdx === null ? null : (STOPS[nowIdx] ?? null);

  return (
    <div ref={rootRef} className={s.root}>
      {splash !== 'off' && (
        <button
          type="button"
          className={`${s.splash} ${splash === 'out' ? s.splashOut : ''}`}
          onClick={dismissSplash}
          aria-label="스플래시 건너뛰기"
        >
          <Image
            src="/jopt/today/splash.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className={s.splashImg}
          />
          <span className={s.splashShade} />
          <span className={s.splashHint}>TAP TO SKIP</span>
          <span className={s.splashText}>
            <span className={s.splashClover}>♣</span>
            <span className={s.splashEyebrow}>Japan Open Poker Tour</span>
            <span className={s.splashTitle}>
              JOPT
              <br />
              SAPPORO 2026
            </span>
            <span className={s.splashSub}>원정 일정표 · 9/21 - 9/25</span>
          </span>
        </button>
      )}

      <header className={s.cover}>
        <div ref={coverImgRef} className={s.coverImgWrap}>
          <Image
            src="/jopt/today/cover.jpg"
            alt="가을 오도리공원과 삿포로 도심"
            fill
            priority
            sizes="100vw"
            className={s.coverImg}
          />
        </div>
        <div className={s.coverShade} />
        <div className={s.coverTop}>
          <span>JOPT SAPPORO 2026</span>
          <Link href="/jopt/map">LEGO 지도</Link>
        </div>
        <div className={s.coverBody}>
          <div className={s.coverEyebrow}>Day 2 · Free Day</div>
          <h1 className={s.coverTitle}>
            자유일
            <br />
            <em>동선</em>
          </h1>
          <div className={`${s.coverDate} ${s.num}`}>
            2026. 9. 22 (화)<small>삿포로 · 대회 3일차</small>
          </div>
          <p className={s.coverLead}>
            오후 1시에 숙소에서 택시로 나가서 니조시장 카이센동으로 점심을 시작하고 파르코와
            미츠코시를 돈 뒤 다누키코지와 오도리공원을 걷다가 저녁 7시에 스스키노에서 샤브샤브를
            먹습니다. 돈키호테에서 시세를 본 다음 酒屋 C&amp;C에서 위스키를 사고 택시로 돌아옵니다.
          </p>
          <div className={s.chips}>
            <span className={s.chip}>
              <em>출발</em>13:00 숙소
            </span>
            <span className={s.chip}>
              <em>날씨</em>흐림 20° / 13°
            </span>
            <span className={s.chip}>
              <em>저녁</em>19:00 샤브샤브
            </span>
            <span className={s.chip}>
              <em>내일</em>11:00 Bullet
            </span>
          </div>
          <div className={s.scrollCue}>
            <span aria-hidden="true" />
            SCROLL
          </div>
        </div>
      </header>

      <div className={`${s.bar} ${barOn ? s.barOn : ''}`} aria-hidden={!barOn}>
        <span className={s.barClover}>♣</span>
        <span className={s.barTitle}>9/22 (화) 자유일</span>
        <span className={s.barNow}>
          {nowStop ? (
            <>
              지금 <b>{nowStop.time}</b> {nowStop.title}
            </>
          ) : (
            '13:00 숙소 출발'
          )}
        </span>
      </div>

      <main className={s.wrap}>
        <section className={`${s.mapSec} ${s.reveal}`} data-reveal>
          <div className={s.secHead}>
            <h2>동선 지도</h2>
            <small>
              H 숙소 → 1 니조시장 → 2 파르코 → 3 미츠코시 → 4 TV타워 → 5 샤브샤브 → 6 돈키 → 7
              C&amp;C
            </small>
          </div>
          <a
            className={s.mapCard}
            href={ROUTE_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="오늘 동선을 구글맵 경로로 열기"
          >
            <Image
              src="/jopt/today/route-map.jpg"
              alt="오늘 동선을 표시한 구글 지도"
              width={1280}
              height={840}
              sizes="(max-width: 720px) 100vw, 680px"
              className={s.mapImg}
            />
            <span className={s.mapCta}>구글맵에서 경로 열기</span>
          </a>
        </section>

        <div className={s.secHead}>
          <h2>오늘 동선</h2>
          <small>10곳 · 도보 약 3km · 택시 2회</small>
        </div>

        <div ref={tlRef} className={s.tl}>
          <div className={s.tlLine}>
            <div className={s.tlFill} />
          </div>
          {STOPS.map((st, i) => (
            <article
              key={st.key}
              data-reveal
              className={`${s.stop} ${s.reveal} ${i === nowIdx ? s.now : ''} ${st.img ? '' : s.move}`}
              aria-current={i === nowIdx ? 'step' : undefined}
            >
              <span className={s.dot} aria-hidden="true" />
              <div className={s.card}>
                {st.img && (
                  <div className={s.figure}>
                    <Image
                      src={st.img}
                      alt={st.alt ?? st.title}
                      fill
                      sizes="(max-width: 720px) 100vw, 680px"
                    />
                    <span className={`${s.figTime} ${s.num}`}>
                      {st.time}
                      {st.until && <small>- {st.until}</small>}
                    </span>
                    <span className={`${s.figTag} ${TAG_CLASS[st.tag]}`}>{TAG_LABEL[st.tag]}</span>
                    {st.credit && <span className={s.credit}>사진 Google Maps · {st.credit}</span>}
                  </div>
                )}
                <div className={s.body}>
                  <h3 className={s.title}>
                    {!st.img && <span className={`${s.moveTime} ${s.num}`}>{st.time}</span>}
                    {st.title}
                    {i === nowIdx && <span className={s.nowBadge}>지금</span>}
                  </h3>
                  {st.meta && <div className={`${s.meta} ${s.num}`}>{st.meta}</div>}
                  {st.desc.map((p) => (
                    <p key={p.slice(0, 24)} className={s.desc}>
                      {p}
                    </p>
                  ))}
                  <div className={s.acts}>
                    {st.map && (
                      <a
                        className={s.act}
                        href={gmap(st.map)}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${st.title} 구글맵 열기`}
                      >
                        {st.mapLabel ?? '구글맵 열기'}
                      </a>
                    )}
                    {st.tel && (
                      <a
                        className={s.actGhost}
                        href={`tel:${st.tel}`}
                        aria-label={`${st.title} 전화`}
                      >
                        전화 {st.tel.replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, '$1-$2-$3')}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <section className={s.tomorrow}>
          <div className={s.reveal} data-reveal>
            <div className={s.secHead}>
              <h2>내일 9/23 (수)</h2>
              <small>대회 최종일</small>
            </div>
            <div className={s.tmCard}>
              <Image
                src="/jopt/today/bullet.jpg"
                alt="담쟁이로 덮인 삿포로 팩토리 벽돌 건물"
                fill
                sizes="(max-width: 720px) 100vw, 680px"
              />
              <div className={s.tmShade} />
              <div className={s.tmBody}>
                <h3 className={s.num}>11:00 NLH Bullet #47</h3>
                <p>
                  바우처로 들어가는 필수 이벤트입니다. 레이트 레지는 14시 55분까지라 탈락하면 그
                  전에 두 번째 바우처로 다시 들어가면 됩니다. 숙소에서 팩토리 홀까지 걸어서 15분이니
                  10시 30분에 나가면 됩니다.
                </p>
                <div className={s.acts}>
                  <a
                    className={s.act}
                    href={gmap('札幌ファクトリーホール')}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="삿포로 팩토리 홀 구글맵 열기"
                  >
                    팩토리 홀 지도
                  </a>
                  <a
                    className={s.actGhost}
                    href="https://events.japanopenpoker.com/2026-sapporo-02"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="JOPT 공식 스케줄 열기"
                  >
                    JOPT 스케줄
                  </a>
                </div>
              </div>
            </div>
            <div className={s.note}>
              목요일과 금요일 일정은 아직 비워 두었습니다. 대회가 끝나면 다시 짭니다.
            </div>
          </div>
        </section>

        <footer className={`${s.foot} ${s.reveal}`} data-reveal>
          <div className={s.footLinks}>
            <Link href="/jopt/map">LEGO 동선 지도</Link>
            <Link href="/jopt/process">제작 과정</Link>
            <a
              href="https://events.japanopenpoker.com/2026-sapporo-02"
              target="_blank"
              rel="noreferrer"
            >
              JOPT Players Guide
            </a>
          </div>
          2026. 9. 22 12:45 JST 기준. 영업시간·평점은 Google Places 와 각 매장 공식 사이트에서
          확인한 값이고 재고와 대기는 현장에서 달라집니다. 사진은 Google Maps 이용자 사진이며
          작성자를 카드에 적었습니다(팩토리 홀 Kiyomi Maeda, 커버 楊傑銘, 스플래시 マーキー). 지도
          ©2026 Google.
        </footer>
      </main>
    </div>
  );
}
