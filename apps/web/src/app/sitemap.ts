import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gto.today';

/**
 * Static sitemap — enumerates the user-facing routes that should show
 * up in search. /dev/* + /api/* are blocked in robots.txt so they're
 * deliberately omitted here. /charts/postflop stays out until the
 * data set is complete (hidden from the nav for the same reason).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/today`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/sim`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/live`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/charts`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/learn/gto`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/review`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/stats`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/mtt/push-fold`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/signin`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
