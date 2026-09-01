import { NextResponse } from 'next/server';
import { checkLogin, sessionToken, COOKIE_NAME } from '@/lib/ananti-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { id?: string; pw?: string };
  if (!body.id || !body.pw || !checkLogin(body.id, body.pw)) {
    return NextResponse.json(
      { ok: false, error: '아이디 또는 비밀번호가 맞지 않습니다.' },
      { status: 401 },
    );
  }
  const token = sessionToken();
  if (!token) return NextResponse.json({ ok: false, error: '서버 설정 누락' }, { status: 500 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}
