#!/usr/bin/env node
// Recompress the 4 images real users download, tuned for the
// "safe / high-quality" profile: Retina-crisp on 3x DPR phones and
// zero visible banding on the metallic chip gradient.
//
//   node scripts/optimize-user-images.mjs
//
// Safe to re-run. The script accepts either the 1024² DALL·E masters
// or its own downscaled output as input, so one-shot recompression
// and iterative tuning both work.
//
// Size targets (by design — not minimum-achievable):
//   mark-g3-transparent.png   ≤ 400 KB  (full-color PNG, 512², alpha)
//   onboarding slide *.jpg    ≤ 180 KB  (mozjpeg q92, 640²)
// Well under the original 7.3 MB but noticeably larger than the
// "aggressive" tier tried in commit e065b38 — we're buying back
// Retina sharpness at the cost of a few hundred KB cold.

import sharp from 'sharp';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

const TARGETS = [
  // Logo — transparent PNG, used at 28-140 px. 512² covers the 140 ×
  // 3.6 DPR splash case with real headroom. Full color (no palette) to
  // keep the gold gradient banding-free on premium displays.
  { in: 'apps/web/public/logos/mark-g3-transparent.png', size: 512, format: 'png' },
  // Onboarding slides — max display is 320 px, so 640² is exact 2× on
  // a 2× DPR phone and a graceful downscale on 3× DPR flagships.
  // Verified opaque (channels=3, hasAlpha=false) so JPEG is lossless
  // for what they contain; q92 keeps the felt / gold textures crisp.
  { in: 'apps/web/public/ai-assets/onboarding-v2/daily-training.png', size: 640, format: 'jpeg' },
  { in: 'apps/web/public/ai-assets/onboarding-v2/gto-mix.png', size: 640, format: 'jpeg' },
  { in: 'apps/web/public/ai-assets/onboarding-v2/mobile-assist.png', size: 640, format: 'jpeg' },
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
      ? await pipeline.jpeg({ quality: 92, mozjpeg: true }).toBuffer()
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
