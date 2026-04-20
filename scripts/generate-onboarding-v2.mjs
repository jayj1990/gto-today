#!/usr/bin/env node
/**
 * DALL·E 3 high-quality onboarding illustrations (v2).
 *
 * First pass gave us ultra-minimalist dots & bars. Jay wants these
 * upgraded to polished, atmospheric scenes that feel like key-visuals
 * rather than placeholder icons. Same brand palette but richer
 * composition, soft cinematic lighting, painterly depth.
 *
 * Output: apps/web/public/ai-assets/onboarding-v2/*.png
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
  'Brand palette: deep felt green #0E3B2E primary, luxury gold #D4AF37 accent, ivory #F4EFE6 highlights on dark noir #0A0A0A. Style: premium casino lounge meets minimal modern iOS app — cinematic, atmospheric, painterly with soft volumetric lighting. Avoid: any rendered text or typography, photographic realism, cartoon, neon, cluttered detail.';

const PROMPTS = [
  {
    id: 'onboarding-v2/daily-training',
    category: 'onboarding-v2',
    quality: 'hd',
    size: '1024x1024',
    prompt: `A cinematic illustration representing daily poker training. Foreground: a cluster of three stylised premium playing cards fanned out, backs facing up, each back showing an elegant gold geometric pattern on deep forest-green with a subtle gold rim. A small single gold luminous coin rests in front of the cards. Background: an elegant dark felt table surface receding into shadow, a soft glowing gold ribbon of light suggesting the sunrise of a new training day above. Painterly volumetric lighting, warm gold highlights, rich shadows. Mood: daily ritual, precision, calm focus. No text. ${BRAND}`,
  },
  {
    id: 'onboarding-v2/gto-mix',
    category: 'onboarding-v2',
    quality: 'hd',
    size: '1024x1024',
    prompt: `A cinematic illustration representing GTO strategy — balanced decision mixing. Center: three parallel flowing ribbons or bands of light suspended in space — a bold red ribbon (the widest, representing raise), a thin green ribbon (call), and a slim blue ribbon (fold). They interweave gracefully, each with soft inner glow. Behind them, a dark forest-green atmospheric background with subtle depth and a single tiny gold star in the far distance suggesting AI insight. Elegant, minimal, abstract — conveys "ratio of actions" without any chart or numbers. Painterly glow, premium feel. No text, no typography, no percentage marks. ${BRAND}`,
  },
  {
    id: 'onboarding-v2/mobile-assist',
    category: 'onboarding-v2',
    quality: 'hd',
    size: '1024x1024',
    prompt: `A cinematic illustration representing live-game mobile assistance. A slim, premium smartphone silhouette stands elegantly on the right, its screen glowing with a single soft gold circular dot (no UI details, no text). A translucent luminous gold strand of light arcs from the phone outward to the left, suggesting guidance flowing from the device to the player. The background is a moody felt-green vignette fading to near-black at the edges, evoking a dimly lit poker lounge. Painterly, atmospheric, premium. No text anywhere, no poker hands visible, no UI chrome. ${BRAND}`,
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
    console.error('✗ OPENAI_API_KEY not found.');
    process.exit(1);
  }
  const client = new OpenAI({ apiKey });

  await mkdir(OUT_ROOT, { recursive: true });
  const startedAt = Date.now();
  let ok = 0, skipped = 0, failed = 0;

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
