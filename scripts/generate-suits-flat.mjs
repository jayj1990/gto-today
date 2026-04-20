#!/usr/bin/env node
/**
 * DALL·E 3 HD — four flat gold suit ICONS, one per call, with a shared
 * style anchor so the set reads as a coherent family.
 *
 * Key tuning vs v1:
 *   • Word "playing card" and "card" completely removed — triggered the
 *     ornate frame + single hero-spade failure mode.
 *   • Describes each glyph as a "symbol" or "icon" on black background.
 *   • Forbids embossing / 3D / shading / highlights — needs flat so the
 *     card layer can dial opacity down to use it as a watermark.
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
const OUT_ROOT = join(REPO_ROOT, 'apps', 'web', 'public', 'ai-assets', 'suits-v2');

// Shared visual language — pasted into every prompt so style matches.
const STYLE = `Flat vector-icon aesthetic. Solid luxury gold color (#D4AF37) with a thin darker-gold engraved ornamental pattern visible inside the shape. NO 3D shading, NO highlights, NO gradients, NO embossing, NO shadows, NO rim, NO frame, NO border, NO background card, NO rendered text, NO letters, NO numbers, NO corner marks. Just the single gold symbol centered on a pure flat black #0A0A0A background. The symbol occupies about 70% of the frame. Ornate interior engraving (thin curving lines) is fine, but the overall shape is a flat silhouette — like an art-deco engraved plate, never like an embossed coin.`;

const PROMPTS = [
  {
    id: 'spade',
    prompt: `A single SPADE symbol — a pointed-top leaf shape with two rounded hips swelling outward and a small tapered stem at the bottom. ${STYLE}`,
  },
  {
    id: 'heart',
    prompt: `A single HEART symbol — two equal rounded lobes at the top meeting in a small center dip, curving smoothly down to a crisp pointed tip at the bottom. ${STYLE}`,
  },
  {
    id: 'diamond',
    prompt: `A single DIAMOND symbol — a tall vertical rhombus with four sharp vertices and straight slightly-angled edges. ${STYLE}`,
  },
  {
    id: 'club',
    prompt: `A single CLUB symbol — three equal round lobes arranged as an equilateral triangle (one lobe on top, two lobes below) joined at the center with a short tapered stem at the bottom. ${STYLE}`,
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
    const outPath = join(OUT_ROOT, `${id}-flat.png`);
    if (await exists(outPath)) {
      console.log(`→ ${id}-flat.png already exists, skipping`);
      continue;
    }
    process.stdout.write(`⚙  ${id}-flat ... `);
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
