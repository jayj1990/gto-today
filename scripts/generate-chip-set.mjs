#!/usr/bin/env node
/**
 * DALL·E 3 HD — one 3×3 grid of chips rendered in the same style so
 * every value reads as part of the same deck. Split + bg-removed at
 * the end of this script.
 *
 * Layout:
 *   ┌──D──┬─0.5─┬──1──┐
 *   ├──2──┼─2.5─┼──5──┤
 *   ├─10──┼─25──┼─100─┤
 *
 *   D      = dealer button (ivory + gold)
 *   0.5    = small blind
 *   1      = big blind
 *   2/2.5  = standard open sizes
 *   5      = squeeze / big bet
 *   10     = 3-bet / pot-size bet
 *   25     = big pot / river bet
 *   100    = all-in marker
 *
 * Output: apps/web/public/ai-assets/chip-set/{value}.png per chip, with
 * -transparent.png alpha-masked variants ready for <BetChip>.
 */
import OpenAI from 'openai';
import sharp from 'sharp';
import { mkdir, writeFile, access, readFile } from 'node:fs/promises';
import { constants as FS } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

async function loadDotEnvLocal(rootDir) {
  try {
    const raw = await readFile(join(rootDir, '.env.local'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {}
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const OUT_ROOT = join(REPO_ROOT, 'apps', 'web', 'public', 'ai-assets', 'chip-set');

const PROMPT = `A single 1024×1024 image, a 3×3 grid of nine top-down poker chips on a pure solid black #0A0A0A background. Each chip is rendered as a perfectly circular token viewed from directly overhead, no perspective, no shadow on the ground. All nine chips are EXACTLY the same size and share the EXACT same design language:

- Chip body: solid dominant colour (different per cell, listed below)
- Rim: six ivory dashed inserts evenly spaced around the perimeter, then a thin gold hairline outlining the chip edge
- Central face: a slightly lighter circular inset with a THICK BOLD single label rendered in the centre using a clean sans-serif all-caps/numerals
- Label colour: soft ivory #F4EFE6 on dark chips, dark noir #0A0A0A on light chips
- Consistent lighting: a very subtle highlight at upper-left on every chip so the set reads as one coherent rendering

Cells (row × column, every label is EXACTLY the characters below, no extra text):

Row 1 (top):
  (1) IVORY chip, label "D"
  (2) DEEP FOREST-GREEN chip, label "0.5"
  (3) WINE-RED chip, label "1"

Row 2:
  (4) STEEL-BLUE chip, label "2"
  (5) SLATE-GREY chip, label "2.5"
  (6) EMERALD-GREEN chip, label "5"

Row 3 (bottom):
  (7) BLACK chip, label "10"
  (8) DEEP-PURPLE chip, label "25"
  (9) LUXURY GOLD chip, label "100"

NO decorations beyond what's described, NO suit symbols, NO extra text, NO rank marks, NO corner letters, NO framing, NO background card. Just the nine chips on black, evenly spaced in a clean 3×3 grid, each chip occupying about 85% of its grid cell.`;

const CELLS = [
  { name: 'D',   col: 0, row: 0 },
  { name: '0.5', col: 1, row: 0 },
  { name: '1',   col: 2, row: 0 },
  { name: '2',   col: 0, row: 1 },
  { name: '2.5', col: 1, row: 1 },
  { name: '5',   col: 2, row: 1 },
  { name: '10',  col: 0, row: 2 },
  { name: '25',  col: 1, row: 2 },
  { name: '100', col: 2, row: 2 },
];

async function exists(path) {
  try { await access(path, FS.F_OK); return true; } catch { return false; }
}

async function maskToTransparent(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Sample the 4 corners to get an average background colour (robust
  // against slight vignetting).
  const corners = [
    [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1],
  ];
  let br = 0, bgc = 0, bb = 0;
  for (const [cx, cy] of corners) {
    const i = (cy * width + cx) * channels;
    br += data[i];
    bgc += data[i + 1];
    bb += data[i + 2];
  }
  br = Math.round(br / 4);
  bgc = Math.round(bgc / 4);
  bb = Math.round(bb / 4);

  const near = 22;
  const far = 85;
  const out = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const o = (y * width + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const dist = Math.hypot(r - br, g - bgc, b - bb);
      let alpha;
      if (dist <= near) alpha = 0;
      else if (dist >= far) alpha = 255;
      else alpha = Math.round(((dist - near) / (far - near)) * 255);
      out[o] = r; out[o + 1] = g; out[o + 2] = b; out[o + 3] = alpha;
    }
  }
  await sharp(out, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}

async function main() {
  await loadDotEnvLocal(REPO_ROOT);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) { console.error('✗ OPENAI_API_KEY not found.'); process.exit(1); }
  const client = new OpenAI({ apiKey });

  await mkdir(OUT_ROOT, { recursive: true });

  const gridPath = join(OUT_ROOT, 'grid.png');
  if (!(await exists(gridPath))) {
    process.stdout.write('⚙  chip grid ... ');
    const resp = await client.images.generate({
      model: 'dall-e-3',
      prompt: PROMPT,
      size: '1024x1024',
      quality: 'hd',
      response_format: 'b64_json',
      n: 1,
    });
    const b64 = resp.data?.[0]?.b64_json;
    if (!b64) throw new Error('empty response');
    await writeFile(gridPath, Buffer.from(b64, 'base64'));
    console.log('✓');
  } else {
    console.log('→ grid.png exists, skipping gen');
  }

  // Split into 9 cells (1024/3 ≈ 341 each).
  const size = 1024;
  const cellSize = Math.floor(size / 3);
  for (const c of CELLS) {
    const name = c.name.replace('.', '_');
    const cellPath = join(OUT_ROOT, `chip-${name}.png`);
    await sharp(gridPath)
      .extract({ left: c.col * cellSize, top: c.row * cellSize, width: cellSize, height: cellSize })
      .png()
      .toFile(cellPath);
    console.log(`✓ chip-${name}.png`);
    // Alpha-mask background.
    const transparentPath = join(OUT_ROOT, `chip-${name}-transparent.png`);
    await maskToTransparent(cellPath, transparentPath);
  }

  console.log('\nDone. Chip set ready at', OUT_ROOT);
}

main().catch((err) => { console.error(err); process.exit(1); });
