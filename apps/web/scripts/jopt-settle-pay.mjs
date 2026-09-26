// 삿포로 정산 페이지의 받는 사람 송금처를 KvBlob 에 넣는다. 클라이언트 API 로는 못 바꾸므로(인증 없음) 이 스크립트로만.
//   cd apps/web && export $(grep -E "^DATABASE_URL=" .env.local | tr -d '"') && \
//   node scripts/jopt-settle-pay.mjs '{"재호":{"bank":"토스뱅크","acct":"1000-0000-0000"},"태균":{"toss":"taegyun"}}'
//   node scripts/jopt-settle-pay.mjs --show        # 지금 값(계좌는 가려서)
//   node scripts/jopt-settle-pay.mjs --remove 태균  # 한 사람 지우기
// 값은 toss(토스 아이디 또는 supertoss:// QR 링크), kakao(카카오페이 링크), bank, acct 네 가지만 받는다.
import { PrismaClient } from '@prisma/client';

const KEY = 'jopt:settle:sapporo-2026';
const FIELDS = ['toss', 'kakao', 'bank', 'acct'];
const prisma = new PrismaClient();

const mask = (s) =>
  typeof s === 'string' && s.length > 4 ? `${s.slice(0, 2)}${'*'.repeat(s.length - 4)}${s.slice(-2)}` : s;

async function main() {
  const [arg, name] = process.argv.slice(2);
  const row = await prisma.kvBlob.findUnique({ where: { key: KEY } });
  const state = row?.value && typeof row.value === 'object' && !Array.isArray(row.value) ? { ...row.value } : {};
  state.paid ??= {};
  state.pay ??= {};

  if (!arg || arg === '--show') {
    for (const [who, info] of Object.entries(state.pay)) {
      console.log(who, JSON.stringify({ ...info, acct: mask(info.acct), toss: mask(info.toss) }));
    }
    if (!Object.keys(state.pay).length) console.log('(송금처 없음)');
    return;
  }
  if (arg === '--remove') {
    if (!name) throw new Error('--remove 뒤에 이름을 주세요');
    delete state.pay[name];
  } else {
    const input = JSON.parse(arg);
    for (const [who, raw] of Object.entries(input)) {
      const info = {};
      for (const f of FIELDS) if (typeof raw?.[f] === 'string' && raw[f].trim()) info[f] = raw[f].trim().slice(0, 120);
      if (!info.toss && !info.kakao && !info.acct) throw new Error(`${who}: toss·kakao·acct 중 하나는 있어야 합니다`);
      state.pay[who] = info;
    }
  }
  state.updatedAt = Date.now();
  await prisma.kvBlob.upsert({
    where: { key: KEY },
    create: { key: KEY, value: state },
    update: { value: state },
  });
  console.log('저장:', Object.keys(state.pay).join(', ') || '(없음)');
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
