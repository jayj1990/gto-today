#!/usr/bin/env node
/**
 * Radial alpha mask background removal for DALL·E chip logos.
 *
 * Color-distance thresholding ate into the chip itself because the rim
 * and inner details share hue with the noir bg. A circular radial mask
 * is more reliable: the chip fills most of the frame, so we just fade
 * the outer corners to transparent.
 *
 * Params per shape:
 *   innerRadius  — everything inside this radius is fully opaque
 *   outerRadius  — fully transparent beyond this radius
 *   center       — where the chip sits (default: image center)
 *
 * Output: foo.png → foo-transparent.png
 */
import sharp from 'sharp';
import { resolve, dirname, basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const LOGOS_DIR = join(REPO_ROOT, 'apps', 'web', 'public', 'logos');

// Tuned for DALL·E chip-wordmark outputs where the chip roughly fills
// the frame with a small gutter. inner 45% = chip core, outer 52% =
// edge fade zone, beyond 52% fully transparent.
const INPUTS = [
  { file: 'mark-g1.png', innerPct: 0.40, outerPct: 0.49 },
  { file: 'mark-g3.png', innerPct: 0.40, outerPct: 0.49 },
];

async function processFile({ file, innerPct, outerPct }) {
  const inputPath = join(LOGOS_DIR, file);
  const outName = file.replace(/\.png$/, '-transparent.png');
  const outputPath = join(LOGOS_DIR, outName);

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const cx = width / 2;
  const cy = height / 2;
  const diag = Math.hypot(cx, cy);
  const innerR = diag * innerPct * Math.SQRT2; // scale to radius-from-center
  const outerR = diag * outerPct * Math.SQRT2;
  // Simpler: use min(w,h)/2 * pct as the reference so it works for
  // square images predictably.
  const base = Math.min(width, height) / 2;
  const inner = base * innerPct * 2;
  const outer = base * outerPct * 2;

  void innerR; void outerR;

  const out = Buffer.alloc(width * height * 4);
  const ch = info.channels;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * ch;
      const dstIdx = (y * width + x) * 4;
      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.hypot(dx, dy);

      let alpha;
      if (dist <= inner) alpha = 255;
      else if (dist >= outer) alpha = 0;
      else {
        const t = 1 - (dist - inner) / (outer - inner);
        alpha = Math.round(t * 255);
      }

      out[dstIdx] = r;
      out[dstIdx + 1] = g;
      out[dstIdx + 2] = b;
      out[dstIdx + 3] = alpha;
    }
  }

  await sharp(out, {
    raw: { width, height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  console.log(
    `✓ ${basename(outputPath)}  inner=${inner.toFixed(0)}px outer=${outer.toFixed(0)}px`,
  );
}

for (const input of INPUTS) {
  await processFile(input);
}
