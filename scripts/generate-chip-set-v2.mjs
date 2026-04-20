#!/usr/bin/env node
/**
 * DALL·E 3 HD — second-pass chip set. v1 got the shared design language
 * right but DALL·E mangled 8 of 9 numeric labels. This pass drops the
 * numbers entirely (we'll overlay values with HTML text) and keeps
 * only the letter D on the dealer button, rendered extra-large.
 *
 * One image, two regions:
 *   TOP 50%    — a single large ivory dealer button with a bold black
 *                letter D, clearly legible.
 *   BOTTOM 50% — a 2×4 grid (8 cells) of plain coloured chips, no text
 *                at all, all identical rim / dash / inset design.
 *
 * Colours (left→right, top→bottom of the 2×4 grid):
 *   forest-green / wine-red / steel-blue / slate-grey
 *   emerald     / black     / deep-purple / luxury-gold
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
const OUT_ROOT = join(REPO_ROOT, 'apps', 'web', 'public', 'ai-assets', 'chip-set-v2');

const PROMPT = `A 1024×1024 image, pure solid black #0A0A0A background, divided into two horizontal regions.

TOP HALF (y 0-512, centered):
A single LARGE white/ivory #F4EFE6 poker chip shown top-down, perfectly circular, occupying about 80% of the top half. Thin luxury-gold #D4AF37 outer rim. Eight evenly-spaced darker grey rim inserts around the perimeter. In the very centre of the chip, a clean thick sans-serif bold capital LETTER D rendered in solid dark noir #0A0A0A — this single letter must be crisp, centred, and legibly sized (about 35% of the chip's diameter). This is the dealer button.

BOTTOM HALF (y 512-1024):
A clean 2×4 grid of EIGHT plain poker chips, each identical in size (about 85% of its grid cell). Every chip uses the EXACT same design as the dealer button above — same dashed ivory rim inserts, same thin gold hairline outline, same lighting — but with DIFFERENT BODY COLOURS per cell and NO text whatsoever in the centre (the inset central face is plain solid matching-colour with no letters, numbers, or symbols).

Cells (row 1 left→right, then row 2 left→right):
  1. forest green
  2. wine red
  3. steel blue
  4. slate grey
  5. emerald green (slightly brighter than #1)
  6. jet black
  7. deep purple
  8. luxury gold

CRITICAL requirements:
- All chips are perfect circles viewed from directly overhead, no perspective, no shadow on the ground.
- All chips (dealer + the 8) share the same rim design and the same lighting angle so they read as one coherent set.
- ABSOLUTELY NO text, numbers, letters, suit symbols, or other decorations on the 8 plain chips. Their central inset is a smooth plain disc.
- The dealer button is the ONLY chip with a letter, and that letter is a single capital D.
- No card frame, no border around the image, no extra labels anywhere.`;

async function exists(path) {
  try { await access(path, FS.F_OK); return true; } catch { return false; }
}

async function maskToTransparent(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Corner sample for bg colour, robust to slight vignetting.
  const corners = [[0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]];
  let br = 0, bgc = 0, bb = 0;
  for (const [cx, cy] of corners) {
    const i = (cy * width + cx) * channels;
    br += data[i]; bgc += data[i + 1]; bb += data[i + 2];
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

  const gridPath = join(OUT_ROOT, 'source.png');
  if (!(await exists(gridPath))) {
    process.stdout.write('⚙  chip-set-v2 source ... ');
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
    console.log('→ source.png exists, skipping gen');
  }

  // Extract dealer button (top half centre).
  const dealerPath = join(OUT_ROOT, 'dealer.png');
  await sharp(gridPath)
    .extract({ left: 256, top: 0, width: 512, height: 512 })
    .png()
    .toFile(dealerPath);
  await maskToTransparent(dealerPath, join(OUT_ROOT, 'dealer-transparent.png'));
  console.log('✓ dealer.png');

  // Extract 8 colour chips from the bottom half (2 rows × 4 columns).
  const colourNames = [
    'forest', 'wine', 'steel', 'slate',
    'emerald', 'black', 'purple', 'gold',
  ];
  const cellW = 1024 / 4;
  const cellH = 512 / 2;
  for (let i = 0; i < 8; i++) {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const name = colourNames[i];
    const outP = join(OUT_ROOT, `chip-${name}.png`);
    await sharp(gridPath)
      .extract({
        left: col * cellW,
        top: 512 + row * cellH,
        width: cellW,
        height: cellH,
      })
      .png()
      .toFile(outP);
    await maskToTransparent(outP, join(OUT_ROOT, `chip-${name}-transparent.png`));
    console.log(`✓ chip-${name}.png`);
  }

  console.log('\nDone. Chip set v2 at', OUT_ROOT);
}

main().catch((err) => { console.error(err); process.exit(1); });
