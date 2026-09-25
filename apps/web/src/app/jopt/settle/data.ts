// 삿포로 원정 정산 — 원천 데이터. Jay 가 2026-09-25 카톡 메모로 준 리스트를 그대로 옮겼다.
// 금액·인원은 여기서만 고친다. 화면(settle.tsx)은 이 파일을 읽어 손익과 송금 목록을 계산할 뿐이다.
//   - 엔화 지출은 현지 결제, 원화 지출(숙소·한국 택시)은 태균이 원화로 낸 것.
//   - 커피숍 메모의 "홍석"은 오타, 징기스칸의 "홍성"과 같은 사람(2026-09-26 Jay 확정) → 홍성으로 통일.
//   - 징기스칸 양고기(39,061엔, 스티브예 결제)는 스티브예 형이 사기로 해서 뺐다(2026-09-26 Jay). 그 항목에만 있던 빠니도 명단에서 뺌.

export type Cur = 'JPY' | 'KRW';

export const PEOPLE = [
  '재호',
  '서원',
  '태균',
  '스티브예',
  '지나',
  '민아',
  '지후',
  '준수',
  '민지',
  '홍성',
] as const;
export type Person = (typeof PEOPLE)[number];

export interface Expense {
  id: string;
  title: string;
  /** 표시용 날짜 (JST) */
  date: string;
  cur: Cur;
  total: number;
  payer: Person;
  /** 균등 분담 명단. weight 가 있으면 그만큼 몫(동행 +1 = 2). 나머지 1엔 단위는 결제자가 진다. */
  even?: { name: Person; weight?: number }[];
  /** 직접 지정 몫. 합이 total 과 같아야 한다(빠지는 사람 = 0). */
  shares?: Partial<Record<Person, number>>;
  /** 이미 결제자에게 직접 준 사람 — 손익·송금에서 뺀다. */
  prepaid?: Person[];
  /** 연결된 영수증 id */
  receipt?: string;
  note?: string;
}

export const EXPENSES: Expense[] = [
  {
    id: 'yakitori',
    title: '야키토리 · 串鳥(쿠시도리)',
    date: '9/21 (월) 22:14',
    cur: 'JPY',
    total: 30000,
    payer: '재호',
    even: [
      { name: '재호' },
      { name: '서원' },
      { name: '태균' },
      { name: '지나' },
      { name: '스티브예' },
      { name: '민아' },
    ],
    receipt: 'r1',
    note: '메모에는 3만엔. 카드 영수증 261,543원을 9/22 요이치야 환율(886원/100엔)로 나누면 약 29,500엔이라 실제 계산서는 조금 적었을 수 있습니다.',
  },
  {
    id: 'taxi-market',
    title: '택시 · 숙소 → 니조시장',
    date: '9/22 (화)',
    cur: 'JPY',
    total: 1300,
    payer: '서원',
    even: [{ name: '재호' }, { name: '스티브예' }, { name: '서원' }, { name: '지후' }],
  },
  {
    id: 'unidon',
    title: '우니동 · 요이치야(YOICHIYA)',
    date: '9/22 (화) 14:45',
    cur: 'JPY',
    total: 32120,
    payer: '재호',
    shares: { 재호: 7370, 서원: 7370, 준수: 7150 + 2090, 태균: 7150 + 990 },
    receipt: 'r2',
    note: '기본 7,370엔씩. 준수 +2,090엔, 태균 +990엔은 각자 추가 주문 몫으로 7,150엔에 더했습니다.',
  },
  {
    id: 'donki',
    title: '돈키호테 · 598엔 × 2',
    date: '9/22 (화)',
    cur: 'JPY',
    total: 1196,
    payer: '태균',
    shares: { 재호: 1196 },
    note: '태균이 대신 결제. 재호가 태균에게 갚을 몫.',
  },
  {
    id: 'liquor',
    title: '리커샵 · 酒屋 C&C (준수 몫)',
    date: '9/22 (화) 16:51',
    cur: 'JPY',
    total: 32000,
    payer: '재호',
    shares: { 준수: 32000 },
    receipt: 'r5',
    note: '카드 영수증 638,143원(약 72,000엔)은 재호 본인 구매까지 합친 금액입니다. 정산에는 준수 몫 32,000엔만 넣었습니다.',
  },
  {
    id: 'taxi-home',
    title: '택시 · 리커샵 → 숙소',
    date: '9/22 (화)',
    cur: 'JPY',
    total: 1600,
    payer: '재호',
    even: [{ name: '재호' }, { name: '태균' }, { name: '스티브예' }, { name: '서원' }],
  },
  {
    id: 'sakebar',
    title: '사케바',
    date: '9/22 (화)',
    cur: 'JPY',
    total: 1250,
    payer: '지나',
    shares: { 재호: 1250 },
    note: '지나가 대신 결제. 재호가 지나에게 갚을 몫.',
  },
  {
    id: 'coffee',
    title: '커피숍',
    date: '9/24 (목)',
    cur: 'JPY',
    total: 7040,
    payer: '서원',
    even: [
      { name: '태균' },
      { name: '민지' },
      { name: '준수' },
      { name: '홍성' },
      { name: '스티브예' },
      { name: '재호' },
      { name: '서원' },
      { name: '지후' },
    ],
    prepaid: ['민지'],
    note: '8명 880엔씩. 민지는 서원에게 이미 입금해서 목록에서 뺐습니다.',
  },
  {
    id: 'cash',
    title: '현금 인출 1.6만엔 나눔',
    date: '9/24 (목)',
    cur: 'JPY',
    total: 16000,
    payer: '재호',
    shares: { 서원: 10000, 태균: 3000, 재호: 3000 },
    note: '재호 카드로 뽑아 서원 1만엔, 태균 3천엔, 재호 3천엔으로 나눴습니다.',
  },
  {
    id: 'conv',
    title: '편의점 · 로손(LAWSON)',
    date: '9/25 (금) 00:54',
    cur: 'JPY',
    total: 14791,
    payer: '재호',
    even: [
      { name: '재호' },
      { name: '스티브예' },
      { name: '서원' },
      { name: '지후' },
      { name: '준수' },
      { name: '지나' },
      { name: '민지' },
      { name: '민아' },
      { name: '태균' },
    ],
    receipt: 'r3',
    note: '9명 1,643엔씩, 남는 4엔은 재호가.',
  },
  {
    id: 'lodging',
    title: '숙소비 · 1인 18만원',
    date: '9/21-25',
    cur: 'KRW',
    total: 180000 * 8,
    payer: '태균',
    shares: {
      재호: 180000,
      스티브예: 180000,
      서원: 180000,
      지후: 180000,
      준수: 180000,
      지나: 180000,
      민지: 180000,
      민아: 180000,
    },
    note: '태균이 예약. 8명이 각 18만원씩 태균에게.',
  },
  {
    id: 'taxi-out',
    title: '출국 택시 (한국)',
    date: '9/21 (월)',
    cur: 'KRW',
    total: 42000,
    payer: '태균',
    shares: { 민아: 21000, 서원: 21000 },
    note: '민아·서원 각 21,000원을 태균에게.',
  },
  {
    id: 'taxi-in',
    title: '귀국 택시 (한국)',
    date: '9/25 (금)',
    cur: 'KRW',
    total: 48000,
    payer: '태균',
    shares: { 재호: 24000, 서원: 24000 },
    note: '재호·서원 각 24,000원을 태균에게.',
  },
];

export interface Receipt {
  id: string;
  src: string;
  merchant: string;
  /** 대한항공카드 청구 원화 */
  krw: number;
  at: string;
  /** 연결된 지출 id. 없으면 리스트에 없는 결제 */
  expense?: string;
  note?: string;
}

// 카드 앱 캡처 5장(2026-09-25 Jay). 청구 원화 ÷ 현지 엔화로 환율을 역산할 수 있다.
export const RECEIPTS: Receipt[] = [
  {
    id: 'r1',
    src: '/jopt/settle/r1.webp',
    merchant: 'KUSHIDORI SAPPORO STAT',
    krw: 261543,
    at: '9/21 22:14',
    expense: 'yakitori',
    note: '3만엔 기준이면 872원/100엔. 요이치야 환율로는 약 29,500엔.',
  },
  {
    id: 'r2',
    src: '/jopt/settle/r2.webp',
    merchant: 'YOICHIYA',
    krw: 284680,
    at: '9/22 14:45',
    expense: 'unidon',
    note: '32,120엔 → 886원/100엔.',
  },
  {
    id: 'r3',
    src: '/jopt/settle/r3.webp',
    merchant: 'LAWSON',
    krw: 128362,
    at: '9/25 00:54',
    expense: 'conv',
    note: '14,791엔 → 868원/100엔.',
  },
  {
    id: 'r4',
    src: '/jopt/settle/r4.webp',
    merchant: 'OKUSHIBASHOUTEN',
    krw: 147532,
    at: '9/24 15:05',
    note: '奥芝商店(스프카레). 정산 리스트에 없는 결제라 항목을 붙이지 못했습니다. 약 16,800엔.',
  },
  {
    id: 'r5',
    src: '/jopt/settle/r5.webp',
    merchant: 'SAKAYA SHI-ANDOSHI-GIY',
    krw: 638143,
    at: '9/22 16:51',
    expense: 'liquor',
    note: '酒屋 C&C 전체 결제(약 72,000엔). 이 중 준수 몫 32,000엔만 정산.',
  },
];

/** 기본 환율(원/100엔). 요이치야 886·로손 868 의 사이값. 화면에서 바꿀 수 있다. */
export const DEFAULT_RATE = 880;

export const CHECKS: string[] = [
  '야키토리는 메모대로 3만엔으로 계산했습니다. 카드 청구 261,543원을 환율로 나누면 약 29,500엔이라 실제 계산서 확인이 필요합니다.',
  '9/24 15:05 오쿠시바쇼텐(스프카레) 147,532원 결제는 정산 리스트에 없어 어느 항목에도 넣지 않았습니다.',
  '리커샵 카드 결제 638,143원은 재호 개인 구매를 포함한 금액이라 준수 몫 32,000엔만 정산에 넣었습니다.',
  '현금 인출 1.6만엔은 카드 영수증이 없어 메모 금액 그대로 넣었습니다.',
];
