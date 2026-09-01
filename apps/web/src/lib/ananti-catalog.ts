// ananti.gto.today — 클라이언트/서버 공용 순수 데이터·날짜 계산.
// 오픈 규칙: 펜트하우스 정회원 정규 예약은 "투숙일이 속한 주(월-일)의
// 4주 전 월요일 오전 10:00(KST)"에 열린다. 여기 날짜 계산은 전부 KST
// 벽시계 기준: UTC Date 에 +9h 를 더해 UTC getter 로 읽는다.

export function kstNow(): Date {
  return new Date(Date.now() + 9 * 3600_000);
}

export function ymd(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

export function parseYmd(s: string): Date {
  return new Date(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8)));
}

export function weekMonday(stayDate: string): Date {
  const d = parseYmd(stayDate);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d;
}

// 해당 투숙일 예약이 열리는 월요일(YYYYMMDD)과 오픈 시각(KST 벽시계 Date).
export function openInfo(stayDate: string): { openYmd: string; openAt: Date } {
  const open = weekMonday(stayDate);
  open.setUTCDate(open.getUTCDate() - 28);
  const openAt = new Date(open);
  openAt.setUTCHours(10, 0, 0, 0);
  return { openYmd: ymd(open), openAt };
}

export function isOpen(stayDate: string): boolean {
  return kstNow() >= openInfo(stayDate).openAt;
}

export interface RoomInfo {
  name: string;
  price: number | null; // 정회원 1박 기준(세금포함), 최근 조회값. 실제는 실행 시 확정.
}

export interface RoomGroup {
  key: string;
  label: string;
  img: string | null; // 아난티 CDN 썸네일 (핫링크)
  rooms: RoomInfo[];
}

const CDN = 'https://cdn.ananti.kr/plf/ui/img/reservation/roomImg';

export const CATALOG: Record<string, { label: string; short: string; groups: RoomGroup[] }> = {
  chord: {
    label: '아난티 코드 (가평)',
    short: '아난티 코드',
    groups: [
      {
        key: 'terrace',
        label: '테라스 하우스',
        img: `${CDN}/chord/terrace/terraceThumb.jpg`,
        rooms: [
          { name: '테라스 하우스 (킹+트윈)', price: 390000 },
          { name: '테라스 하우스 (트윈+트윈)', price: 390000 },
          { name: '펫룸 테라스 하우스 (1층)', price: 520000 },
        ],
      },
      {
        key: 'murata',
        label: '무라타 하우스',
        img: `${CDN}/chord/murata/murataThumb.jpg`,
        rooms: [{ name: '무라타 하우스 (킹)', price: 490000 }],
      },
      {
        key: 'pool',
        label: '풀 하우스',
        img: `${CDN}/chord/pool/poolThumb.jpg`,
        rooms: [{ name: '풀 하우스 (킹)', price: 530000 }],
      },
      {
        key: 'theHouse',
        label: '더 하우스',
        img: `${CDN}/chord/theHouse/theHouseThumb.jpg`,
        rooms: [
          { name: '더 하우스 일반 (킹2)', price: null },
          { name: '더 하우스 확장 (킹2+트윈)', price: 770000 },
        ],
      },
      {
        key: 'suite',
        label: '스위트',
        img: `${CDN}/chord/suite/suiteThumb.jpg`,
        rooms: [{ name: '스위트 (킹2+트윈)', price: 1250000 }],
      },
    ],
  },
  cove: {
    label: '아난티 코브 (부산)',
    short: '아난티 코브',
    groups: [
      {
        key: 'terrace',
        label: '테라스풀하우스',
        img: `${CDN}/cove/terrace/terraceThumb.jpg`,
        rooms: [
          { name: '테라스풀하우스 A (트윈2)', price: 370000 },
          { name: '테라스풀하우스 B (복층/트윈2)', price: 730000 },
          { name: '테라스풀하우스 D (킹2)', price: 370000 },
        ],
      },
      {
        key: 'rdo',
        label: '레지던스 오션',
        img: `${CDN}/cove/rdo/rdoThumb.jpg`,
        rooms: [
          { name: '레지던스 오션 A (트윈-거실일체형)', price: 240000 },
          { name: '레지던스 오션 B (트윈-거실분리형)', price: 240000 },
          { name: '레지던스 오션 C (트윈-거실일체형)', price: 240000 },
          { name: '레지던스 오션 C (킹-거실일체형)', price: 240000 },
          { name: '레지던스 오션 펫룸 (트윈, 1층)', price: 320000 },
          { name: '레지던스 오션 (트윈, 휠체어 이용 / 1층)', price: 240000 },
          { name: '커넥팅 하우스 레지던스 오션 A+B (트윈 + 트윈)', price: 480000 },
        ],
      },
      {
        key: 'rdm',
        label: '레지던스 마운틴',
        img: `${CDN}/cove/rdm/rdmThumb.jpg`,
        rooms: [
          { name: '레지던스 마운틴 A (트윈-거실일체형)', price: 200000 },
          { name: '레지던스 마운틴 B (트윈-거실분리형)', price: 200000 },
          { name: '레지던스 마운틴 C (킹-거실일체형)', price: 200000 },
          { name: '커넥팅 하우스 레지던스 마운틴 A+B (트윈 + 트윈)', price: 400000 },
        ],
      },
      {
        key: 'rfm',
        label: '패밀리 마운틴',
        img: `${CDN}/cove/rfm/rfmThumb.jpg`,
        rooms: [{ name: '패밀리 마운틴 (트윈 + 킹 + 온돌)', price: null }],
      },
      {
        key: 'seaside',
        label: 'Seaside',
        img: `${CDN}/cove/seaside/seasideThumb.jpg`,
        rooms: [
          { name: 'Seaside 단층 (트윈 + 트윈)', price: 560000 },
          { name: 'Seaside 복층 (트윈 + 트윈 + 트윈)', price: 1010000 },
          { name: 'Seaside Family (트윈 + 트윈)', price: 1010000 },
        ],
      },
      {
        key: 'royal',
        label: 'Royal Chapter',
        img: null,
        rooms: [{ name: 'Royal Chapter (트윈 + 트윈 + 트윈 + 트윈)', price: 3200000 }],
      },
    ],
  },
};

// noUncheckedIndexedAccess 대응: 항상 유효한 지점 객체를 돌려준다.
export function getPlatform(key: string): (typeof CATALOG)[string] {
  return CATALOG[key] ?? CATALOG['chord']!;
}

export function findRoom(platform: string, roomName: string): RoomInfo | null {
  const plat = CATALOG[platform];
  if (!plat) return null;
  for (const g of plat.groups) {
    const r = g.rooms.find((r) => r.name === roomName);
    if (r) return r;
  }
  return null;
}
