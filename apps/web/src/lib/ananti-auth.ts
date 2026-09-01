// ananti.gto.today 인증 — 단일 계정(env) + HMAC 쿠키 세션.
// 구글 연동 없이 Jay 전용 아이디·비밀번호 하나로만 통과시킨다.
// 러너(맥북 launchd)는 Bearer 토큰으로 별도 인증.
import { createHmac, timingSafeEqual } from 'node:crypto';

export const COOKIE_NAME = 'ananti_keeper';

function secret(): string | undefined {
  return process.env['ANANTI_UI_SECRET'];
}

export function sessionToken(): string | null {
  const s = secret();
  const id = process.env['ANANTI_UI_ID'];
  if (!s || !id) return null;
  return createHmac('sha256', s).update(`keeper:${id}`).digest('hex');
}

export function verifySessionCookie(value: string | undefined): boolean {
  const expected = sessionToken();
  if (!expected || !value || value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

export function checkLogin(id: string, pw: string): boolean {
  const envId = process.env['ANANTI_UI_ID'];
  const envPw = process.env['ANANTI_UI_PW'];
  return !!envId && !!envPw && id === envId && pw === envPw;
}

export function checkRunner(req: Request): boolean {
  const token = process.env['ANANTI_RUNNER_TOKEN'];
  if (!token) return false;
  return req.headers.get('authorization') === `Bearer ${token}`;
}

// 페이지 API 공용 가드: 브라우저 쿠키 또는 러너 토큰.
export function isAuthed(req: Request): boolean {
  if (checkRunner(req)) return true;
  const cookie = req.headers.get('cookie') || '';
  const m = cookie.match(new RegExp(`${COOKIE_NAME}=([0-9a-f]+)`));
  return verifySessionCookie(m ? m[1] : undefined);
}
