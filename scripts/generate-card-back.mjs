#!/usr/bin/env node
/**
 * DALL·E 3 HD — vertical card-back designs sized for miniature
 * rendering (shown at ~22×30px in PokerTable villain cards).
 *
 * Constraint: at that size, any detail finer than "one gold dot" becomes
 * mush. Each prompt targets a tight, high-contrast pattern that still
 * reads as something at 30px high.
 */
import OpenAI from 'openai';
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
const OUT_ROOT = join(REPO_ROOT, 'apps', 'web', 'public', 'ai-assets', 'card-back');

const COMMON = `Vertical playing-card back (portrait orientation, taller than wide), very simple and minimal so it still reads at 30-pixel render size. Deep forest-green #0E3B2E card body, thin luxury-gold #D4AF37 hairline border about 3% in from each edge. Flat vector aesthetic — no 3D embossing, no gradients, no shadow, no photorealism. No text, no letters, no numbers, no suit symbols, no corner marks.`;

const PROMPTS = [
  {
    id: 'dot-center',
    prompt: `${COMMON} Single pattern: one small luminous gold dot centered in the card, with a very thin gold ring (barely thicker than a hairline) around it at about 2× the dot diameter. Nothing else on the card except the gold border.`,
  },
  {
    id: 'diamond-lattice',
    prompt: `${COMMON} Single pattern: a sparse diagonal gold diamond-lattice (rhombus grid) covering the card interior — thin gold lines crossing at ~45°, roughly 5 lines each direction, leaving plenty of green space between. At each line intersection, a tiny gold dot. No other decoration.`,
  },
  {
    id: 'chevron',
    prompt: `${COMMON} Single pattern: a vertical stack of 5 thin gold chevron shapes (V-marks pointing down) evenly spaced from top to bottom of the card, each chevron spanning about 40% of the card width, centered horizontally. No other decoration.`,
  },
  {
    id: 'double-border',
    prompt: `${COMMON} Single pattern: two concentric thin gold rectangular frames (outer and inner) with a small gold fleur-de-lis-style dot at each of the four corners of the inner frame. The space inside the inner frame is plain solid green — no other decoration in the centre.`,
  },
];

async function exists(path) {
  try { await access(path, FS.F_OK); return true; } catch { return false; }
}

async function main() {
  await loadDotEnvLocal(REPO_ROOT);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) { console.error('✗ OPENAI_API_KEY not found.'); process.exit(1); }
  const client = new OpenAI({ apiKey });

  await mkdir(OUT_ROOT, { recursive: true });

  for (const { id, prompt } of PROMPTS) {
    const outPath = join(OUT_ROOT, `${id}.png`);
    if (await exists(outPath)) {
      console.log(`→ ${id} already exists, skipping`);
      continue;
    }
    process.stdout.write(`⚙  ${id} ... `);
    try {
      const resp = await client.images.generate({
        model: 'dall-e-3',
        prompt,
        size: '1024x1024',
        quality: 'hd',
        response_format: 'b64_json',
        n: 1,
      });
      const b64 = resp.data?.[0]?.b64_json;
      if (!b64) throw new Error('empty response');
      await writeFile(outPath, Buffer.from(b64, 'base64'));
      console.log('✓');
    } catch (err) {
      console.log(`✗ ${err instanceof Error ? err.message : 'unknown error'}`);
    }
  }

  console.log('\nDone.');
}

main().catch((err) => { console.error(err); process.exit(1); });
