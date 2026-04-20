#!/usr/bin/env node
/**
 * DALL·E 3 HD — refine the E6 "monogram medallion" concept (Jay's pick).
 *
 * Problems from v1 pass:
 *   • Third letter rendered as "D" (rounded closed) instead of "O"
 *   • "TODAY" arc was blurry / too small to read
 *
 * Fix strategy:
 *   • Prompt says the LETTER O is a perfect circle/ring — NOT D, NOT Q,
 *     NOT zero — hoping that nails the shape.
 *   • "TODAY" moves from a blurry arc to a crisp straight baseline at
 *     a minimum percentage-of-medallion height so DALL·E commits to
 *     legible strokes.
 *   • Variants swap monogram vs side-by-side letter arrangement and
 *     serif vs sans-serif styling for diversity.
 *
 * Output: apps/web/public/ai-assets/wordmark-v2/*.png
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
const OUT_ROOT = join(REPO_ROOT, 'apps', 'web', 'public', 'ai-assets');

const BRAND =
  'Brand palette: deep felt green #0E3B2E, luxury gold #D4AF37, ivory #F4EFE6, dark noir #0A0A0A. Premium casino lounge meets minimal modern iOS app.';

// Critical: call out the letter O vs D disambiguation EXPLICITLY in every
// prompt. DALL·E tends to close circular letters into D/Q/0 otherwise.
const O_DISAMB =
  'The third letter must be the English capital letter O — a clean CLOSED CIRCLE with a uniform oval/ring shape, clearly distinct from the letter D (which has a vertical left stroke) and distinct from the letter Q (no tail). No stem, no tail, no opening.';

const PROMPTS = [
  {
    id: 'wordmark-v2/medallion-letters-side',
    prompt: `A premium circular brand medallion: a deep forest-green disc with a thick ornamental gold ring and classical beveled border. Inside the disc, three large bold gold serif capital letters "G", "T", "O" sit side by side in a single horizontal row, equal height, tightly kerned but clearly separated. ${O_DISAMB} Below the letters, on a perfectly straight horizontal baseline, the word "TODAY" in bold ivory sans-serif capitals, letter-spaced, at approximately 25% of the medallion's height — large enough to read clearly. Symmetric, crest-like, iconic. No other letters, no numbers, no decorations. ${BRAND}`,
  },
  {
    id: 'wordmark-v2/medallion-monogram-tight',
    prompt: `A premium circular brand medallion on a dark background: gold ornamental ring around a deep forest-green center. Three large bold gold sans-serif capitals "G", "T", "O" arranged as an elegant monogram where the letters slightly overlap — but each letter remains individually identifiable. ${O_DISAMB} Below the monogram, the word "TODAY" in clean uppercase ivory sans-serif on a straight horizontal baseline, letter-spaced, medium size. Modern, iconic, luxurious. No other letters or numbers. ${BRAND}`,
  },
  {
    id: 'wordmark-v2/medallion-flat-minimal',
    prompt: `A minimal modern circular logo: a simple deep forest-green disc with a single thin gold outer ring (no ornaments). Top half: large bold gold capital letters "GTO" spaced evenly — ${O_DISAMB} Bottom half: below a thin horizontal gold divider line, the word "TODAY" in smaller bold ivory capital letters, letter-spaced. Ultra clean, geometric, no decoration. Flat illustration feel. No other letters or numbers. ${BRAND}`,
  },
  {
    id: 'wordmark-v2/medallion-embossed',
    prompt: `A luxurious embossed gold brand medallion, 3D relief on a deep forest-green disc. Top half shows three large polished gold capital letters spelling "GTO" — G, T, and the letter O (a perfect closed oval ring, ${O_DISAMB.replace(/^[A-Z]/, (m) => m.toLowerCase())}). A thin horizontal gold bar across the middle. Below the bar, the word "TODAY" in bold ivory uppercase sans-serif on a straight line, medium-large size. Soft directional light from upper-left, cinematic. No other letters. ${BRAND}`,
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
    await mkdir(dirname(outPath), { recursive: true });
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
