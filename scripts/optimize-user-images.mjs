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
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

const TARGETS = [
  // Logo — transparent PNG, used at 28-140px. 512 gives retina headroom
  // on the splash screen (140 * 3.6x) without wasting bytes. Keep PNG
  // format — the transparent chip rim would break in JPEG. Palette
  // quantization to 128 colors knocks it from 543 KB → 41 KB with no
  // visible banding on a metallic-gold chip at this size.
  { in: 'apps/web/public/logos/mark-g3-transparent.png', size: 512, format: 'png-palette' },
  // Onboarding slides — rendered at min(72vw, 320px) behind a radial
  // mask that softens the corners anyway, so 480 px square source +
  // mozjpeg quality 82 is plenty and saves ~40 % vs a 640 px PNG.
  // Verified opaque (no alpha channel) so JPEG is lossless for us.
  { in: 'apps/web/public/ai-assets/onboarding-v2/daily-training.png', size: 480, format: 'jpeg' },
  { in: 'apps/web/public/ai-assets/onboarding-v2/gto-mix.png', size: 480, format: 'jpeg' },
  { in: 'apps/web/public/ai-assets/onboarding-v2/mobile-assist.png', size: 480, format: 'jpeg' },
];

let savedBytes = 0;
for (const t of TARGETS) {
  let inPath = resolve(ROOT, t.in);
  const outPath =
    t.format === 'jpeg' ? resolve(ROOT, t.in.replace(/\.png$/, '.jpg')) : resolve(ROOT, t.in);
  // The first run strips .png originals and leaves the .jpg output.
  // On re-runs, re-use the .jpg as its own input so the script stays
  // idempotent and doesn't fail when legacy sources are missing.
  if (!existsSync(inPath) && t.format === 'jpeg' && existsSync(outPath)) {
    inPath = outPath;
  }
  if (!existsSync(inPath)) {
    console.log(`skip (source missing): ${t.in}`);
    continue;
  }
  const before = statSync(inPath).size;
  const pipeline = sharp(inPath).resize(t.size, t.size, {
    fit: 'inside',
    withoutEnlargement: true,
  });
  const buf =
    t.format === 'jpeg'
      ? await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer()
      : t.format === 'png-palette'
        ? await pipeline
            .png({ compressionLevel: 9, palette: true, quality: 90, colors: 128 })
            .toBuffer()
        : await pipeline
            .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
            .toBuffer();
  // Write from buffer so in === out is safe when format stays the same.
  await sharp(buf).toFile(outPath);
  const after = statSync(outPath).size;
  savedBytes += before - after;
  const pct = Math.round(((before - after) / before) * 100);
  console.log(
    `${outPath.split('/').pop()}: ${(before / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB (-${pct}%)`,
  );
}

console.log(`\nTotal saved: ${(savedBytes / 1024 / 1024).toFixed(2)} MB`);
