#!/usr/bin/env node
/**
 * DALL·E 3 HD — burgundy card-back variant of the double-border design.
 * The green version blended into the green felt; red/wine contrasts
 * sharply like a classic casino deck.
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
const OUT_ROOT = join(REPO_ROOT, 'apps', 'web', 'public', 'ai-assets', 'card-back');

const PROMPT = `Vertical playing-card back (portrait orientation, taller than wide). Deep burgundy / wine-red #6B1A2A card body — rich and saturated, NOT green. Thin luxury-gold #D4AF37 hairline border about 3% in from each edge. Inside that, a slightly thicker inner gold rectangular frame with a small gold fleur-de-lis dot at each of the four corners of the inner frame. The space inside the inner frame is plain solid burgundy — no other decoration in the centre. Flat vector aesthetic — no 3D embossing, no gradients, no shadow, no photorealism. No text, no letters, no numbers, no suit symbols. Very simple and minimal so it still reads clean at 40-pixel render size.`;

async function exists(path) {
  try { await access(path, FS.F_OK); return true; } catch { return false; }
}

async function main() {
  await loadDotEnvLocal(REPO_ROOT);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) { console.error('✗ OPENAI_API_KEY not found.'); process.exit(1); }
  const client = new OpenAI({ apiKey });

  await mkdir(OUT_ROOT, { recursive: true });

  const outPath = join(OUT_ROOT, 'double-border-red.png');
  if (await exists(outPath)) {
    console.log('→ already exists, skipping');
    return;
  }

  process.stdout.write('⚙  double-border-red ... ');
  const resp = await client.images.generate({
    model: 'dall-e-3',
    prompt: PROMPT,
    size: '1024x1024',
    quality: 'hd',
    response_format: 'b64_json',
    n: 1,
  });
  const b64 = resp.data?.[0]?.b64_json;
  if (!b64) throw new Error('empty response');
  await writeFile(outPath, Buffer.from(b64, 'base64'));
  console.log('✓');
}

main().catch((err) => { console.error(err); process.exit(1); });
