#!/usr/bin/env node
/**
 * DALL·E 3 HD — poker chip format (D3 concept) WITH "GTO TODAY" text
 * rendered on the chip face. Merges Jay's preferred symbol (D3) with
 * the wordmark requirement so the same asset works for splash + header
 * + app icon.
 *
 * Key tuning:
 *   • Start from D3's exact visual DNA: deep green chip body, dashed
 *     ivory rim insets, flat top-down view, soft gold accents.
 *   • Text positioning: "GTO" at center as the dominant glyph, "TODAY"
 *     as a small letter-spaced baseline below — same general hierarchy
 *     as a real casino chip.
 *   • Letter O disambiguation (perfect closed circle, not D / Q / 0).
 *   • Several letterform variations so Jay can pick.
 *
 * Output: apps/web/public/ai-assets/chip-wordmark/*.png
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
  'Brand palette: deep felt green #0E3B2E, luxury gold #D4AF37, ivory #F4EFE6, dark noir #0A0A0A. Premium casino lounge feel.';

const O_CLAUSE =
  'The letter O is a perfectly symmetric closed ring shape — NOT the letter D (which has a vertical left stroke), NOT the letter Q (no tail), NOT the digit zero.';

// Anchor every prompt to the D3 visual vocabulary.
const CHIP_BASE =
  'A single premium poker chip seen perfectly top-down (circular symmetrical face), centered on a subtle dark noir background. Deep forest-green chip body with approximately eight ivory dashed rim insets spaced around the perimeter; a thin gold hairline inside the rim. The center face is a lighter polished gold-bronze disc. Soft radial highlight, luxury embossed finish.';

const PROMPTS = [
  {
    id: 'chip-wordmark/v1-bold-gto',
    prompt: `${CHIP_BASE} On the chip's central gold disc: bold uppercase serif letters "GTO" — G, T, and O — large, centered, dominant. ${O_CLAUSE} Directly below the "GTO" letters, on a perfectly straight horizontal baseline, the word "TODAY" in smaller thin ivory letter-spaced capital letters. No other letters, no numbers, no values. ${BRAND}`,
  },
  {
    id: 'chip-wordmark/v2-clean-sans',
    prompt: `${CHIP_BASE} On the chip's central gold disc: three large bold uppercase sans-serif letters "GTO" arranged side by side, equal size, clearly separated. ${O_CLAUSE} Below "GTO", a thin horizontal gold rule; beneath the rule the word "TODAY" in medium-weight ivory uppercase sans-serif with loose letter-spacing. No other letters, no chip denomination, no numbers. ${BRAND}`,
  },
  {
    id: 'chip-wordmark/v3-stacked-serif',
    prompt: `${CHIP_BASE} On the chip's central gold disc, two lines of text vertically stacked: top line "GTO" in large bold gold serif capitals, bottom line "TODAY" in smaller ivory serif capitals letter-spaced. Both lines horizontally centered, each letter crisp and deeply embossed. ${O_CLAUSE} No other letters, no chip denomination, no numbers. ${BRAND}`,
  },
  {
    id: 'chip-wordmark/v4-minimal-flat',
    prompt: `A minimalist modern poker chip (flat illustration, no 3D shading) seen top-down. Deep forest-green chip body with a simple thin gold outer ring and six tiny gold dashes at the compass positions (no rim insets). Flat central light-gold disc. On the disc, bold uppercase "GTO" at the top center and "TODAY" below in smaller letter-spaced ivory capitals. ${O_CLAUSE} Clean geometric, brand-mark feel. No other letters, no numbers. ${BRAND}`,
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
