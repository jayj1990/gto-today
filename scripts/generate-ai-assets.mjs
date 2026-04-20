#!/usr/bin/env node
/**
 * Generate brand assets for gto.today via OpenAI DALL·E 3.
 *
 * The key NEVER lives in source — it's read from process.env.OPENAI_API_KEY.
 * Run like so (bash):
 *   OPENAI_API_KEY=sk-... node scripts/generate-ai-assets.mjs
 *
 * Output goes to apps/web/public/ai-assets/<category>/<id>.png. Every
 * generated PNG is a draft — /dev/ai-assets shows them for review; the
 * final set gets promoted to /public/logos, /public/onboarding, etc.
 */
import OpenAI from 'openai';
import { mkdir, writeFile, access, readFile } from 'node:fs/promises';
import { constants as FS } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/* Minimal .env.local loader — no dotenv dep. Reads KEY=VALUE lines at
   repo root so secrets never land on the command line. */
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
    /* no .env.local — that's fine if OPENAI_API_KEY is already set */
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const OUT_ROOT = join(REPO_ROOT, 'apps', 'web', 'public', 'ai-assets');

/**
 * Brand language (kept in every prompt)
 *
 *   Palette       felt green #0E3B2E / gold #D4AF37 / ivory #F4EFE6 / noir #0A0A0A
 *   Tone          premium casino lounge × minimal modern app
 *   Disallow      neon / cartoon / stock-photo / text inside image
 */
const BRAND =
  'Brand palette: deep felt green #0E3B2E primary, luxury gold #D4AF37 accent, ivory #F4EFE6 highlights on dark noir #0A0A0A. Style: premium casino lounge meets minimal modern iOS app. Avoid: any rendered text or typography, cartoon, neon, photographic realism, cluttered detail.';

const PROMPTS = [
  /* ── Logos / Marks ───────────────────────────────────────────── */
  {
    id: 'logo/dot-halo',
    category: 'logo',
    quality: 'hd',
    size: '1024x1024',
    prompt: `Minimalist app icon for a poker training app. A single luminous gold coin/dot precisely centered on a deep felt-green rounded square, subtle radial glow radiating outward, very subtle gold rim around the square. Ultra-clean, flat-ish with soft gradient, symmetric, premium. ${BRAND}`,
  },
  {
    id: 'logo/chip-stack',
    category: 'logo',
    quality: 'hd',
    size: '1024x1024',
    prompt: `App icon: stylised top-down view of three stacked poker chips seen from above, the top chip showing a single gold dot in its center. Deep felt background, golden rim highlights, clean geometric flat illustration, no text anywhere. ${BRAND}`,
  },
  {
    id: 'logo/spade-minimal',
    category: 'logo',
    quality: 'hd',
    size: '1024x1024',
    prompt: `App icon: a strongly stylised minimalist spade silhouette in luxury gold, centered on a deep felt-green rounded square, subtle gold rim. The spade is abstracted — single continuous line feel — not a playing-card glyph. No text. ${BRAND}`,
  },
  {
    id: 'logo/compass-of-suits',
    category: 'logo',
    quality: 'hd',
    size: '1024x1024',
    prompt: `App icon: four tiny symbols of the four card suits (spade, heart, diamond, club) arranged as a compass rose around a central large gold dot, on a dark felt-green rounded square. Symbols are minimal, single-color gold, evenly spaced. Premium luxury feel, no text. ${BRAND}`,
  },

  /* ── Card design ─────────────────────────────────────────────── */
  {
    id: 'cards/card-back-weave',
    category: 'cards',
    quality: 'hd',
    size: '1024x1024',
    prompt: `Playing card back design, premium art deco pattern, dark forest green with thin gold geometric lines forming a symmetric woven diamond lattice, a single gold circular dot precisely centered, very subtle golden rim around the card edge. Vertical card aspect. No text, no numbers. ${BRAND}`,
  },
  {
    id: 'cards/card-face-ace-spade',
    category: 'cards',
    quality: 'hd',
    size: '1024x1024',
    prompt: `Minimal poker card front for an Ace of Spades. Dark charcoal solid card with a single large centered gold spade symbol as a watermark (semi-transparent), thin gold border. Leave the upper-left corner EMPTY (reserved for rank and suit we'll overlay ourselves) — put no text. Vertical card aspect. ${BRAND}`,
  },
  {
    id: 'cards/card-face-heart',
    category: 'cards',
    quality: 'hd',
    size: '1024x1024',
    prompt: `Minimal poker card front base, deep wine-red solid card, single large centered heart symbol as a watermark (semi-transparent), thin metallic rim, vertical aspect. Leave the upper-left corner empty — no text anywhere. ${BRAND}`,
  },
  {
    id: 'cards/card-face-diamond',
    category: 'cards',
    quality: 'hd',
    size: '1024x1024',
    prompt: `Minimal poker card front base, steel blue solid card, single large centered diamond symbol as a semi-transparent watermark, thin metallic rim. Upper-left corner empty. No text. Vertical aspect. ${BRAND}`,
  },
  {
    id: 'cards/card-face-club',
    category: 'cards',
    quality: 'hd',
    size: '1024x1024',
    prompt: `Minimal poker card front base, forest green solid card, single large centered club symbol as a semi-transparent watermark, thin metallic rim. Upper-left corner empty. No text. Vertical aspect. ${BRAND}`,
  },

  /* ── Chips ───────────────────────────────────────────────────── */
  {
    id: 'chips/chip-gold',
    category: 'chips',
    quality: 'hd',
    size: '1024x1024',
    prompt: `Single luxury gold poker chip, top-down view, radial gradient (lighter highlight at upper-left), subtle dashed rim segmentation, centered empty inner disc, transparent-looking dark background. No text. ${BRAND}`,
  },
  {
    id: 'chips/chip-red',
    category: 'chips',
    quality: 'hd',
    size: '1024x1024',
    prompt: `Single premium red poker chip, top-down view, polished finish with a subtle radial highlight, dashed ivory rim inset, centered blank inner disc, dark background. No text. ${BRAND}`,
  },
  {
    id: 'chips/chip-green',
    category: 'chips',
    quality: 'hd',
    size: '1024x1024',
    prompt: `Single premium green poker chip (forest green), top-down view, polished finish, dashed ivory rim inset, centered blank inner disc, dark background. No text. ${BRAND}`,
  },

  /* ── Onboarding illustrations ───────────────────────────────── */
  {
    id: 'onboarding/daily-streak',
    category: 'onboarding',
    quality: 'hd',
    size: '1024x1024',
    prompt: `Minimalist illustration representing a 10-day training streak for a poker app. A horizontal row of 10 small glowing gold dots, the 7th one pulsing brighter with a soft halo. Clean, abstract, no calendar rendering, no text, dark forest-green background. ${BRAND}`,
  },
  {
    id: 'onboarding/gto-mix',
    category: 'onboarding',
    quality: 'hd',
    size: '1024x1024',
    prompt: `Abstract illustration of a decision split: three stacked horizontal bars of red, green and blue — widths roughly 60% / 25% / 15% — representing a GTO strategy mix. Very clean, flat, minimalist, dark background. No text anywhere. ${BRAND}`,
  },
  {
    id: 'onboarding/mobile-assist',
    category: 'onboarding',
    quality: 'hd',
    size: '1024x1024',
    prompt: `Minimalist illustration: a thin smartphone silhouette on a dark forest-green background, a single large luminous gold dot floating toward it from the left. Represents glancing at GTO guidance on your phone while you play live. Clean, flat, abstract, no app UI elements rendered inside, no text. ${BRAND}`,
  },

  /* ── Backgrounds / textures ─────────────────────────────────── */
  {
    id: 'textures/felt-subtle',
    category: 'textures',
    quality: 'standard',
    size: '1024x1024',
    prompt: `Seamless subtle poker felt texture for an app background. Very low contrast, deep forest green, ultra-fine fabric weave, almost imperceptible. Premium luxury casino feel. No pattern motifs, no emblems, no text. ${BRAND}`,
  },
  {
    id: 'textures/hero-felt',
    category: 'textures',
    quality: 'standard',
    size: '1792x1024',
    prompt: `Wide hero background for a poker training app landing page. A soft radial vignette going from bright felt-green center to very dark felt-green corners, a single subtle luminous gold dot near the center, very delicate grain. Clean, cinematic, premium. No text, no objects. ${BRAND}`,
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
    console.error('✗ OPENAI_API_KEY not found. Add it to .env.local at the repo root or export it before running.');
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
