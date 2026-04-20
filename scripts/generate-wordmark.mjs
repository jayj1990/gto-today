#!/usr/bin/env node
/**
 * DALL·E 3 HD wordmark lockups for gto.today — text-bearing brand logos
 * for splash / header / business cards.
 *
 * Caveat: DALL·E 3 text rendering is unreliable. We keep the text very
 * short ("GTO TODAY" or "gto.today" — max 2 words), use familiar
 * caps-only letterforms, and commit to simple symmetric compositions
 * to minimise letterform corruption. Still expect to throw 3-4 out.
 *
 * Output: apps/web/public/ai-assets/wordmark/*.png
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

// Text-bearing DALL·E prompts tend to fail when: the background is busy,
// text spans more than ~8 characters, letterforms are cursive, or the
// composition has perspective. All six of these lean on flat frontal
// views, CAPS, bold sans or slab serif, and thick gold lettering.
const PROMPTS = [
  {
    id: 'wordmark/v1-stacked-serif',
    prompt: `A premium brand logo lockup for a poker training service. The text "GTO" in very large bold gold serif capital letters on the top line, and directly below it the text "TODAY" in smaller ivory capital letters widely letter-spaced. A thin horizontal gold rule between the two words. Centered, symmetric, on a deep forest-green rounded-rectangle background with a subtle gold hairline border. Exact spelling: G, T, O on top; T, O, D, A, Y below. No other letters, no numbers, no decorations. ${BRAND}`,
  },
  {
    id: 'wordmark/v2-horizontal-dot',
    prompt: `A horizontal premium brand wordmark: the text "GTO" in bold gold uppercase sans-serif on the LEFT, a single luminous gold dot in the MIDDLE as separator, and the word "today" in lowercase ivory light sans-serif on the RIGHT. All on one baseline, centered composition, deep forest-green background. Clean, minimal, corporate-luxury. Exact spelling: GTO dot today. No other letters, no numbers. ${BRAND}`,
  },
  {
    id: 'wordmark/v3-embossed-gold',
    prompt: `A luxurious embossed gold metallic logotype on a dark charcoal background. The text "GTO TODAY" in two lines (GTO on top larger, TODAY below smaller) rendered as deeply engraved polished gold 3D relief letters with soft directional lighting from upper-left. Thick bold geometric sans-serif letterforms, crisp edges, premium brand quality. Exact spelling: G T O on top line, T O D A Y on second line. No other letters. ${BRAND}`,
  },
  {
    id: 'wordmark/v4-art-deco-frame',
    prompt: `A premium art-deco brand plaque. A horizontal rectangular gold-framed panel with ornamental corner filigrees, inside the frame centered text "GTO TODAY" in bold gold uppercase slab-serif letterforms on a deep forest-green inlay. Symmetric, cinematic, letterpress feel. Exact spelling: GTO TODAY as two words. No other letters, no numbers. ${BRAND}`,
  },
  {
    id: 'wordmark/v5-mark-plus-type',
    prompt: `A horizontal brand lockup: on the LEFT a small luxury round poker-chip icon (deep green with gold rim and a gold dot in its center); on the RIGHT the text "GTO TODAY" in bold gold uppercase sans-serif letters, one line, vertically centered against the chip. Clean corporate-luxury composition on dark noir background. Exact spelling: GTO TODAY. No other letters, no numbers. ${BRAND}`,
  },
  {
    id: 'wordmark/v6-monogram-circle',
    prompt: `A premium circular brand medallion: a deep forest-green disc with a thick gold ring, centered inside the monogram "GTO" in bold gold serif capitals stacked tightly, and below the monogram the word "TODAY" in small ivory letter-spaced capitals forming a subtle arc at the bottom of the ring. Crest-like, iconic, symmetric. Exact text: G T O and T O D A Y. No other letters. ${BRAND}`,
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
