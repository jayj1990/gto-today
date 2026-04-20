#!/usr/bin/env node
/**
 * DALL·E 3 HD — final attempt at clean flat suit silhouettes.
 *
 * Failed attempts taught us:
 *   • "playing card" / "card suit" triggers ornate frames
 *   • "engraved pattern" / "ornate interior" triggers art-deco frames
 *   • Multi-glyph grids fail — DALL·E collapses them to one hero shape
 *
 * New strategy:
 *   • Word "suit" removed, only the raw shape described
 *   • Explicit "emoji style" / "SF Symbol" reference for minimalism
 *   • Big negative list: no frame, no border, no pattern, no card, no
 *     engraving, no ornament, no text, no decoration
 *   • "Filled silhouette with zero internal detail" is the north star
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
const OUT_ROOT = join(REPO_ROOT, 'apps', 'web', 'public', 'ai-assets', 'suits-v3');

const COMMON = `Style: flat vector emoji / SF Symbol / Material Icons minimal. A SINGLE filled silhouette, no internal detail whatsoever — the shape is a uniformly solid flat gold (#D4AF37) fill across its entire area. Centered on a pure solid black #0A0A0A background. The shape occupies roughly 75% of the frame.

FORBIDDEN — none of these should appear in the image:
- frame, border, card, rectangle around the shape
- engraved lines, ornament, decoration, pattern, filigree, scrollwork
- embossing, bevel, 3D shading, highlight, gradient, glow
- corner marks, small accent shapes, stars, dots
- text, numbers, letters, watermarks
- secondary shapes of any kind
Just one filled gold silhouette on black, nothing else.`;

const PROMPTS = [
  {
    id: 'spade',
    prompt: `A symmetrical filled silhouette with a pointed top that widens into two full rounded hips and tapers into a small triangular base at the bottom. The classic spade-playing-piece outline. ${COMMON}`,
  },
  {
    id: 'heart',
    prompt: `A symmetrical filled silhouette consisting of two equal rounded lobes at the top meeting in a small valley at the center, curving smoothly down both sides to a single sharp point at the bottom. The classic heart outline. ${COMMON}`,
  },
  {
    id: 'diamond',
    prompt: `A symmetrical filled silhouette shaped as a tall vertical rhombus — four sharp vertices, straight edges, top and bottom points sharper than left and right. The classic diamond-rhombus outline. ${COMMON}`,
  },
  {
    id: 'club',
    prompt: `A symmetrical filled silhouette consisting of three equal round circles arranged as a triangle (one circle on top center, two circles at the lower left and lower right, all touching in the middle) with a small tapering triangular base at the bottom. The classic clover/trefoil outline. ${COMMON}`,
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
