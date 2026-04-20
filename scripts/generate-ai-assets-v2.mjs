#!/usr/bin/env node
/**
 * Second pass of DALL·E 3 brand asset generation — adds A/B/C/D/E
 * categories Jay requested after reviewing the first batch.
 *
 *   A. Poker table top-down — landing hero / loading screen
 *   B. Premium card template per suit (4 templates; rank+corner drawn
 *      programmatically so we get consistent 52 cards without paying
 *      for 52 separate generations)
 *   C. Dealer button + blind markers (gold chip-style)
 *   D. Streak flame badge — milestone art for completion screen
 *   E. AI explanation bubble icon — top art for the "해설 보기" card
 *
 * Run like the first script:
 *   OPENAI_API_KEY=sk-... node scripts/generate-ai-assets-v2.mjs
 * or let it pick up .env.local automatically.
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
  } catch {
    /* no .env.local */
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const OUT_ROOT = join(REPO_ROOT, 'apps', 'web', 'public', 'ai-assets');

const BRAND =
  'Brand palette: deep felt green #0E3B2E primary, luxury gold #D4AF37 accent, ivory #F4EFE6 highlights on dark noir #0A0A0A. Style: premium casino lounge meets minimal modern iOS app. Avoid: any rendered text or typography, cartoon, neon, photographic realism, cluttered detail.';

const PROMPTS = [
  /* ── A. Table top-down views ────────────────────────────────────── */
  {
    id: 'table/topdown-6max',
    category: 'table',
    quality: 'hd',
    size: '1792x1024',
    prompt: `Top-down illustration of a 6-max poker table. Oval felt-green table with subtle gold rim, clean deep-green fabric texture, six evenly-spaced seat positions (simple dark circular chip markers where players would sit), a small stack of gold chips and two face-down rounded-rectangle playing cards neatly in the pot area. Dramatic cinematic top-down perspective, soft radial light from above, dark noir surroundings. No text, no numbers, no typography. ${BRAND}`,
  },
  {
    id: 'table/topdown-heads-up',
    category: 'table',
    quality: 'hd',
    size: '1792x1024',
    prompt: `Top-down illustration of a heads-up (1v1) poker table. Smaller round felt-green table with gold inner rim, two seat markers opposite each other, a central pot with a tidy stack of gold coins and two face-down cards, moody vignette fading to dark. Elegant, minimal, premium. No text anywhere. ${BRAND}`,
  },

  /* ── C. Dealer button + blind markers ───────────────────────────── */
  {
    id: 'markers/dealer-button',
    category: 'markers',
    quality: 'hd',
    size: '1024x1024',
    prompt: `Top-down view of a single luxurious white-and-gold poker dealer button. Round, premium, smooth ivory face with a subtle gold rim embossed around the edge, soft radial highlight at upper-left. Plain surface — NO text, NO "D" letter. Dark felt background. ${BRAND}`,
  },
  {
    id: 'markers/small-blind-chip',
    category: 'markers',
    quality: 'hd',
    size: '1024x1024',
    prompt: `Top-down view of a single premium small-blind poker chip. Deep forest-green face, ivory dashed rim insets around the perimeter, soft radial highlight, centered plain blank inner disc (NO text, NO 'SB' letters). Dark felt background. ${BRAND}`,
  },
  {
    id: 'markers/big-blind-chip',
    category: 'markers',
    quality: 'hd',
    size: '1024x1024',
    prompt: `Top-down view of a single premium big-blind poker chip. Deep wine-red face, ivory dashed rim insets, soft radial highlight, centered plain blank inner disc (NO text, NO 'BB' letters). Dark felt background. ${BRAND}`,
  },

  /* ── D. Streak flame badge ──────────────────────────────────────── */
  {
    id: 'badges/streak-flame',
    category: 'badges',
    quality: 'hd',
    size: '1024x1024',
    prompt: `A luxury achievement badge: a stylised upward flame in warm gold gradient inside a circular dark-forest-green medallion with a subtle gold ring, soft glow radiating outward. Minimal, geometric, polished, flat-ish with gentle 3D highlight. Represents a streak achievement. No text. ${BRAND}`,
  },
  {
    id: 'badges/streak-milestone-7',
    category: 'badges',
    quality: 'hd',
    size: '1024x1024',
    prompt: `A luxury achievement medallion: circular dark-forest-green badge with a thin ornamental gold ring, a small gold laurel wreath arch at the top, central empty gold shield for number overlay later. Minimalist, premium, polished. No text, no numbers inside. ${BRAND}`,
  },

  /* ── E. AI explanation bubble icon ──────────────────────────────── */
  {
    id: 'icons/ai-bubble',
    category: 'icons',
    quality: 'hd',
    size: '1024x1024',
    prompt: `A minimalist icon: a soft-rounded chat speech-bubble in deep felt green outlined in thin gold, a single small gold spark (four-point star / twinkle) inside representing AI insight. Flat geometric design, clean, premium, centered on a dark background. No text inside bubble. ${BRAND}`,
  },
  {
    id: 'icons/ai-coach-mark',
    category: 'icons',
    quality: 'hd',
    size: '1024x1024',
    prompt: `A minimalist icon: a small luminous gold node with three short radiating lines of thought suggesting AI reasoning, on a dark felt-green rounded square backdrop. Think 'neural node' but elegant, minimalist, premium casino aesthetic — not sci-fi. Flat with subtle gradient. No text. ${BRAND}`,
  },
];

async function exists(path) {
  try {
    await access(path, FS.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await loadDotEnvLocal(REPO_ROOT);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('✗ OPENAI_API_KEY not found. Add it to .env.local at the repo root.');
    process.exit(1);
  }
  const client = new OpenAI({ apiKey });

  await mkdir(OUT_ROOT, { recursive: true });
  const startedAt = Date.now();
  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const { id, prompt, size, quality } of PROMPTS) {
    const outPath = join(OUT_ROOT, `${id}.png`);
    await mkdir(dirname(outPath), { recursive: true });

    if (await exists(outPath)) {
      console.log(`→ ${id} already exists, skipping`);
      skipped++;
      continue;
    }

    process.stdout.write(`⚙  ${id} ... `);
    try {
      const resp = await client.images.generate({
        model: 'dall-e-3',
        prompt,
        size,
        quality,
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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
