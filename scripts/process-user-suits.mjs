#!/usr/bin/env node
/**
 * Process Jay's hand-picked suit grid (~/Desktop/GTO-Today Image/symbols.png)
 * into four transparent alpha-only masks for the card watermark layer.
 *
 * Pipeline:
 *   1. Split the source image into four quadrants
 *      ┌──spade──┬─diamond─┐
 *      ├─heart───┼─club────┤
 *      └─────────┴─────────┘
 *   2. Drop all colour: any non-white pixel → solid black silhouette,
 *      any white/near-white pixel → fully transparent.
 *      Produces pure alpha masks so we can recolour via CSS
 *      background-color + mask-image in React.
 *
 * Output: apps/web/public/ai-assets/suits-user/{spade,heart,diamond,club}.png
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const SOURCE = 'C:\\Users\\Jay\\Desktop\\GTO-Today Image\\symbols.png';
const OUT_DIR = join(REPO_ROOT, 'apps', 'web', 'public', 'ai-assets', 'suits-user');

const QUADRANTS = [
  { id: 'spade',   col: 0, row: 0 },
  { id: 'diamond', col: 1, row: 0 },
  { id: 'heart',   col: 0, row: 1 },
  { id: 'club',    col: 1, row: 1 },
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const meta = await sharp(SOURCE).metadata();
  const w = meta.width ?? 512;
  const h = meta.height ?? 512;
  const qw = Math.floor(w / 2);
  const qh = Math.floor(h / 2);

  for (const q of QUADRANTS) {
    const outPath = join(OUT_DIR, `${q.id}.png`);

    // 1. Crop this quadrant out of the grid.
    const cropped = await sharp(SOURCE)
      .extract({ left: q.col * qw, top: q.row * qh, width: qw, height: qh })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // 2. Walk RGBA pixels and build a pure-black / pure-transparent mask.
    //    Any pixel whose total luminance is near white → transparent.
    //    Any coloured pixel → black at full opacity.
    //    Edges keep their coverage by interpolating alpha vs luminance.
    const { data, info } = cropped;
    const out = Buffer.alloc(info.width * info.height * 4);
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const i = (y * info.width + x) * info.channels;
        const o = (y * info.width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = info.channels === 4 ? data[i + 3] : 255;

        // How FAR from white the pixel is — use min channel, which is
        // 255 for pure white and 0 for any fully-saturated colour (pure
        // red, pure blue, etc). This keeps coloured hearts/diamonds
        // fully opaque, not translucent like luminance would.
        const minCh = Math.min(r, g, b);
        const coverage = Math.max(0, Math.min(1, (255 - minCh) / 180));
        // Combine with source alpha so sub-pixel edges feather naturally.
        const alpha = Math.round(coverage * a);

        out[o] = 0;
        out[o + 1] = 0;
        out[o + 2] = 0;
        out[o + 3] = alpha;
      }
    }

    // 3. Find the tight bbox of non-transparent pixels so we can trim
    //    each suit to its actual shape. Guarantees identical vertical
    //    extent across all four masks regardless of the original grid
    //    layout quirks.
    let minX = info.width;
    let minY = info.height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const alpha = out[(y * info.width + x) * 4 + 3];
        if (alpha > 8) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    const bboxW = maxX - minX + 1;
    const bboxH = maxY - minY + 1;

    // 4. Pad the bbox to a square (taller dimension wins) so aspect is
    //    preserved and we don't deform any suit. The bbox is centered
    //    horizontally inside the square.
    const side = Math.max(bboxW, bboxH);
    const padX = Math.floor((side - bboxW) / 2);
    const padY = Math.floor((side - bboxH) / 2);
    const square = Buffer.alloc(side * side * 4);
    for (let y = 0; y < bboxH; y++) {
      for (let x = 0; x < bboxW; x++) {
        const src = ((minY + y) * info.width + (minX + x)) * 4;
        const dst = ((y + padY) * side + (x + padX)) * 4;
        square[dst] = out[src];
        square[dst + 1] = out[src + 1];
        square[dst + 2] = out[src + 2];
        square[dst + 3] = out[src + 3];
      }
    }

    await sharp(square, {
      raw: { width: side, height: side, channels: 4 },
    })
      .png({ compressionLevel: 9 })
      .toFile(outPath);

    console.log(
      `✓ ${q.id}.png  bbox ${bboxW}×${bboxH} → square ${side}×${side}`,
    );
  }

  console.log('\nDone. Alpha-only suit masks ready.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
