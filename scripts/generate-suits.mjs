#!/usr/bin/env node
/**
 * DALL·E 3 HD suit glyphs — one PNG per suit, centered on a dark
 * background so the radial bg-removal script can strip it cleanly.
 *
 * Style target: polished embossed gold glyph, same lighting angle
 * across all four suits so the set reads as a coherent family.
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
const OUT_ROOT = join(REPO_ROOT, 'apps', 'web', 'public', 'ai-assets', 'suits');

const SHARED = [
  'Centered on a uniform pure-black #0A0A0A square background so the shape can be cleanly extracted later.',
  'Style: polished luxury gold #D4AF37 with subtle embossed 3D relief and a soft highlight from upper-left, very slight darker gold #8C6F1F on the lower edge.',
  'No text, no numbers, no decorations, no rim, no shadow on ground, no border, no frame.',
  'The shape fills roughly 80% of the frame, symmetrical, crisp edges.',
  'Premium casino lounge aesthetic, minimal, iconic.',
].join(' ');

const PROMPTS = [
  {
    id: 'spade',
    prompt: `A classic playing-card spade suit symbol — a pointed tapering top, two full rounded hips that swell outward, tucking into a slim tapered stem at the bottom. The iconic spade glyph shape. ${SHARED}`,
  },
  {
    id: 'heart',
    prompt: `A classic playing-card heart suit symbol — two smooth equal rounded lobes at the top meeting at a dip in the center, gently curving down to a crisp pointed tip at the bottom. The iconic heart glyph shape. ${SHARED}`,
  },
  {
    id: 'diamond',
    prompt: `A classic playing-card diamond suit symbol — a vertically-oriented rhombus with sharp top and bottom vertices, wide side points, straight slightly-angled edges. The iconic diamond glyph shape. ${SHARED}`,
  },
  {
    id: 'club',
    prompt: `A classic playing-card club suit symbol — three equal round lobes arranged as an equilateral triangle (one on top, two below), each lobe the same size, meeting at a common center with a slim tapered stem at the bottom. The iconic club/clover glyph shape. ${SHARED}`,
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
  const startedAt = Date.now();
  let ok = 0, skipped = 0, failed = 0;

  for (const { id, prompt } of PROMPTS) {
    const outPath = join(OUT_ROOT, `${id}.png`);
    if (await exists(outPath)) { console.log(`→ ${id} already exists, skipping`); skipped++; continue; }
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
      console.log(`✓`);
      ok++;
    } catch (err) {
      console.log(`✗ ${err instanceof Error ? err.message : 'unknown error'}`);
      failed++;
    }
  }

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(`\nGenerated: ${ok} · Skipped: ${skipped} · Failed: ${failed} · ${elapsed}s`);
}

main().catch((err) => { console.error(err); process.exit(1); });
