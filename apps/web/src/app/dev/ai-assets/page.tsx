import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { SiteHeader } from '@/components/site-header';

export const metadata = { title: 'AI 자산 미리보기' };
export const dynamic = 'force-dynamic';

/**
 * Lists every PNG in /public/ai-assets/ by category so we can eyeball the
 * DALL·E drafts and pick winners. Server-side reads the filesystem once
 * per request (force-dynamic) so newly-generated files appear without a
 * redeploy.
 */
async function listAssets() {
  const root = join(process.cwd(), 'public', 'ai-assets');
  try {
    const categories = await readdir(root);
    const out: { category: string; files: string[] }[] = [];
    for (const cat of categories) {
      const catPath = join(root, cat);
      const catStat = await stat(catPath);
      if (!catStat.isDirectory()) continue;
      const files = (await readdir(catPath))
        .filter((f) => f.endsWith('.png'))
        .sort();
      out.push({ category: cat, files });
    }
    return out;
  } catch {
    return [];
  }
}

export default async function AiAssetsPage() {
  const groups = await listAssets();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl safe-pad-x pb-24 pt-10">
        <header className="mb-8">
          <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
            /dev/ai-assets
          </p>
          <h1 className="mt-2 font-display text-[36px] font-bold tracking-[-0.02em]">
            AI 자산 드래프트
          </h1>
          <p className="mt-2 text-fg-muted">
            DALL·E 3로 생성된 후보들. 카테고리별로 나열됐어요. 마음에 드는 것 말씀 주시면 해당 파일을 최종 자리 ({`/public/logos/, /public/onboarding/ 등`})로 이관하고 PNG 파생본 생성합니다.
          </p>
        </header>

        {groups.length === 0 && (
          <div className="rounded-[var(--radius-panel)] border-hair surface p-8 text-center">
            <p className="font-mono text-[13px] text-fg-muted">
              생성된 자산이 없어요. <code>node scripts/generate-ai-assets.mjs</code> 실행 필요.
            </p>
          </div>
        )}

        <ul className="space-y-10">
          {groups.map(({ category, files }) => (
            <li key={category}>
              <h2 className="font-mono text-[12px] uppercase tracking-[0.22em] text-fg-muted">
                {category} · {files.length}
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {files.map((file) => {
                  const src = `/ai-assets/${category}/${file}`;
                  const label = file.replace(/\.png$/, '');
                  return (
                    <figure
                      key={file}
                      className="overflow-hidden rounded-[var(--radius-panel)] border-hair surface"
                    >
                      <div
                        className="relative w-full"
                        style={{ aspectRatio: '1 / 1', background: '#08120E' }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={label}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      </div>
                      <figcaption className="p-3">
                        <p className="font-mono text-[11px] text-fg">{label}</p>
                        <p className="mt-1 font-mono text-[10px] text-fg-muted">{src}</p>
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
