#!/usr/bin/env node
/**
 * DALL·E 3 HD — derive heart/diamond/club from the v1 spade aesthetic.
 * Jay picked v1 spade: ornate engraved glyph inside a thin art-deco
 * gold frame on a near-black background.
 *
 * The prompt is templated so all three outputs share the framing,
 * engraving density, and gold tone — only the glyph shape varies.
 *
 * Output: apps/web/public/ai-assets/suits-v4/{heart,diamond,club}.png
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
const OUT_ROOT = join(REPO_ROOT, 'apps', 'web', 'public', 'ai-assets', 'suits-v4');

// Shared framing — matches the v1 spade Jay picked.
const FRAME = `Style reference: art-deco luxury brand mark. A single large centered [GLYPH] silhouette filled with flat luxury gold (#D4AF37) on a near-black (#0A0A0A) background. Inside the glyph outline, a delicate engraved pattern of thin darker-gold curving lines (like engraving on a gold plate) radiates symmetrically. A thin double-line gold rectangular frame runs around the entire composition, about 6% of image width from each edge. The glyph is vertically symmetric and occupies roughly 65% of the frame's inner height.

ABSOLUTELY NO: text, letters, numbers, small accent suit symbols in corners, A / K / Q / J / any rank marks, secondary shapes, card-face layout elements. Just the centered [GLYPH] inside the gold frame. Flat (no 3D embossing, no shading, no gradient). Symmetrical.`;

const PROMPTS = [
  {
    id: 'heart',
    glyph:
      'a heart symbol — two equal rounded lobes at the top meeting in a small center dip, curving smoothly down to a single sharp point at the bottom',
  },
  {
    id: 'diamond',
    glyph:
      'a diamond-rhombus symbol — a tall vertical rhombus with four sharp vertices, sharper top and bottom points, wider left and right sides',
  },
  {
    id: 'club',
    glyph:
      'a club/clover symbol — three equal round lobes arranged as an equilateral triangle (one lobe on top, two lobes at the lower left and right) meeting at a common center with a short tapering triangular stem at the bottom',
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

  for (const { id, glyph } of PROMPTS) {
    const outPath = join(OUT_ROOT, `${id}.png`);
    if (await exists(outPath)) {
      console.log(`→ ${id} already exists, skipping`);
      continue;
    }
    process.stdout.write(`⚙  ${id} ... `);
    try {
      const prompt = FRAME.replace(/\[GLYPH\]/g, glyph);
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
