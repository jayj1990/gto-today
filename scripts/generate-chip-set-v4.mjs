#!/usr/bin/env node
/**
 * DALL·E 3 HD — chip set v4. One prompt → one image → nine distinctly
 * separated chips in a 3×3 grid, split and bg-removed locally.
 *
 * Learning from v2: saying "3×3 grid of chips" lets DALL·E fuse them
 * into concentric rings of one chip. v4 emphasises "NINE SEPARATE
 * round chips, each completely isolated on a black square with empty
 * space between every chip" repeatedly.
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
const OUT_ROOT = join(REPO_ROOT, 'apps', 'web', 'public', 'ai-assets', 'chip-set-v4');

const PROMPT = `A single 1024×1024 image containing NINE separate individual poker chips, each completely isolated and surrounded by pure solid black #0A0A0A empty space. The nine chips are arranged in a simple 3-row × 3-column grid — each chip occupies roughly 28% of its grid cell, with black gap between every chip and its neighbours. The chips do NOT overlap. The chips do NOT form concentric rings of one larger chip. They are NINE independent circular tokens, one per grid cell.

Every chip is viewed directly top-down (overhead), perfectly circular, flat with a subtle upper-left highlight. Every chip shares the EXACT same design language so the set reads as one coherent deck:
- SIX evenly-spaced ivory dashed rim inserts around the perimeter
- A thin luxury-gold #D4AF37 hairline outlining the edge
- A slightly lighter plain inset disc in the centre

The ONLY variable between chips is the body colour (below). EIGHT of the nine chips have a PLAIN CENTRE with NO text, NO numbers, NO letters, NO symbols, NO decorations. ONE chip (row 1 column 1 only) has a single LARGE bold sans-serif capital letter D rendered crisply in dark noir at the centre — that chip is the dealer button.

Cells, row × column:
  R1C1 IVORY #F4EFE6 — has the letter D
  R1C2 FOREST GREEN #0E3B2E — plain centre
  R1C3 WINE RED #6B1A2A — plain centre
  R2C1 STEEL BLUE #2B5F8F — plain centre
  R2C2 SLATE GREY #3A3A42 — plain centre
  R2C3 EMERALD GREEN #1F9D55 — plain centre
  R3C1 JET BLACK #1A1A1F (with visible ivory rim dashes) — plain centre
  R3C2 DEEP PURPLE #4B1F6B — plain centre
  R3C3 LUXURY GOLD #D4AF37 — plain centre

Absolutely forbidden: concentric rings of one chip, overlapping chips, chips touching each other, any text or number other than the single letter D on R1C1, any card frame, any background decoration, any shadow on the ground.`;

const CELLS = [
  { id: 'dealer',  row: 0, col: 0 },
  { id: 'green',   row: 0, col: 1 },
  { id: 'red',     row: 0, col: 2 },
  { id: 'blue',    row: 1, col: 0 },
  { id: 'grey',    row: 1, col: 1 },
  { id: 'emerald', row: 1, col: 2 },
  { id: 'black',   row: 2, col: 0 },
  { id: 'purple',  row: 2, col: 1 },
  { id: 'gold',    row: 2, col: 2 },
];

async function exists(path) {
  try { await access(path, FS.F_OK); return true; } catch { return false; }
}

async function maskToTransparent(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const corners = [[0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]];
  let br = 0, bgc = 0, bb = 0;
  for (const [cx, cy] of corners) {
    const i = (cy * width + cx) * channels;
    br += data[i]; bgc += data[i + 1]; bb += data[i + 2];
  }
  br = Math.round(br / 4); bgc = Math.round(bgc / 4); bb = Math.round(bb / 4);
  const near = 22, far = 85;
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
  await sharp(out, { raw: { width, height, channels: 4 } }).png({ compressionLevel: 9 }).toFile(outputPath);
}

async function main() {
  await loadDotEnvLocal(REPO_ROOT);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) { console.error('✗ OPENAI_API_KEY not found.'); process.exit(1); }
  const client = new OpenAI({ apiKey });
  await mkdir(OUT_ROOT, { recursive: true });

  const gridPath = join(OUT_ROOT, 'grid.png');
  if (!(await exists(gridPath))) {
    process.stdout.write('⚙  grid ... ');
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

  const cellSize = 1024 / 3;
  for (const c of CELLS) {
    const outP = join(OUT_ROOT, `${c.id}.png`);
    await sharp(gridPath)
      .extract({
        left: Math.round(c.col * cellSize),
        top: Math.round(c.row * cellSize),
        width: Math.round(cellSize),
        height: Math.round(cellSize),
      })
      .png()
      .toFile(outP);
    await maskToTransparent(outP, join(OUT_ROOT, `${c.id}-transparent.png`));
    console.log(`✓ ${c.id}`);
  }

  console.log('\nDone. Chip set v4 at', OUT_ROOT);
}

main().catch((err) => { console.error(err); process.exit(1); });
