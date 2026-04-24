#!/usr/bin/env node
// One-off: recompress the 4 images that real users actually download.
// All sources are 1024×1024 PNGs; we render them at 32-320px. Losing
// the extra resolution saves ~6.5 MB per first-visit, which is the
// single biggest LCP win on a Slow 4G phone (measured 5.2s → target
// under 2.5s).
//
//   pnpm dlx tsx scripts/optimize-user-images.mjs
//   (or: node scripts/optimize-user-images.mjs — sharp is a devDep)
//
// Safe to re-run; each target is deterministic given its source.

import sharp from 'sharp';
import { statSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

const TARGETS = [
  // Logo — transparent PNG, used at 28-140px. 512 gives retina headroom
  // on the splash screen (140 * 3.6x) without wasting bytes.
  { in: 'apps/web/public/logos/mark-g3-transparent.png', out: 'apps/web/public/logos/mark-g3-transparent.png', size: 512 },
  // Onboarding slides — max display is min(72vw, 320px). 640 is 2x
  // retina; the aggressive radial mask in the component hides the
  // edge-softness a lower-res source might introduce.
  { in: 'apps/web/public/ai-assets/onboarding-v2/daily-training.png', out: 'apps/web/public/ai-assets/onboarding-v2/daily-training.png', size: 640 },
  { in: 'apps/web/public/ai-assets/onboarding-v2/gto-mix.png', out: 'apps/web/public/ai-assets/onboarding-v2/gto-mix.png', size: 640 },
  { in: 'apps/web/public/ai-assets/onboarding-v2/mobile-assist.png', out: 'apps/web/public/ai-assets/onboarding-v2/mobile-assist.png', size: 640 },
];

let savedBytes = 0;
for (const t of TARGETS) {
  const inPath = resolve(ROOT, t.in);
  const outPath = resolve(ROOT, t.out);
  const before = statSync(inPath).size;
  const buf = await sharp(inPath)
    .resize(t.size, t.size, { fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
    .toBuffer();
  // Write from buffer so in === out is safe.
  await sharp(buf).toFile(outPath);
  const after = statSync(outPath).size;
  savedBytes += before - after;
  const pct = Math.round(((before - after) / before) * 100);
  console.log(
    `${t.out.split('/').pop()}: ${(before / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB (-${pct}%)`,
  );
}

console.log(`\nTotal saved: ${(savedBytes / 1024 / 1024).toFixed(2)} MB`);
