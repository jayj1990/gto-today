import { cookies } from 'next/headers';
import { COOKIE_NAME, verifySessionCookie } from '@/lib/ananti-auth';
import AnantiApp from './ui';

export const dynamic = 'force-dynamic';

export default async function AnantiPage() {
  const jar = await cookies();
  const authed = verifySessionCookie(jar.get(COOKIE_NAME)?.value);
  return <AnantiApp initialAuthed={authed} />;
}
