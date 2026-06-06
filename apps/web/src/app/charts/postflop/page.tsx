import { redirect } from 'next/navigation';

/**
 * The standalone postflop chart used to live here. It now ships inside
 * 실전 모드 (/live/play) as one of two top-level modes, so this URL
 * just bounces. Keeping the route so old bookmarks / shared links don't
 * 404 — the redirect is permanent.
 */
export default function PostflopChartRedirect(): never {
  redirect('/live/play');
}
