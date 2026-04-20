#!/usr/bin/env node
/**
 * DALL·E 3 HD — chip set v3. v2 merged everything into one layered
 * chip. v3 does 9 separate calls with an identical style template
 * (only the colour + D-letter presence varies) so style stays uniform.
 */
import OpenAI from 'openai';
import sharp from 'sharp';
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
const OUT_ROOT = join(REPO_ROOT, 'apps', 'web', 'public', 'ai-assets', 'chip-set-v3');

const COMMON_STYLE = (centerText) => `
One poker chip only, absolutely nothing else in the frame. Top-down view, perfectly circular, centered in the image, occupying about 75% of the frame on a PURE SOLID BLACK #0A0A0A background. The chip design is:
- Six evenly-spaced IVORY DASHED rim inserts around the perimeter
- A THIN LUXURY GOLD #D4AF37 hairline outlining the chip edge
- A slightly lighter circular centre inset
${centerText}
Subtle soft highlight at upper-left, flat matte finish otherwise. No shadow on ground, no perspective, no second chip, no decorations outside the chip.
`.trim();

/**
 * @param {{id:string, body:string, label?:string|null, labelColor?:string}} cfg
 */
function buildPrompt(cfg) {
  const bodyClause = `Chip body solid ${cfg.body}.`;
  const labelClause = cfg.label
    ? `In the dead centre of the inset face, a single LARGE bold sans-serif capital letter "${cfg.label}" rendered in ${cfg.labelColor ?? 'dark noir #0A0A0A'} — crisp, very readable, roughly 35% of the chip's diameter. This is the dealer button letter.`
    : `The central inset face is PLAIN — absolutely no text, no numbers, no letters, no symbols, no decorations.`;
  return [bodyClause, labelClause, COMMON_STYLE('')].join(' ');
}

const CHIPS = [
  { id: 'dealer',  body: 'ivory #F4EFE6', label: 'D', labelColor: 'dark noir #0A0A0A' },
  { id: 'green',   body: 'deep forest-green #0E3B2E' },
  { id: 'red',     body: 'wine red #6B1A2A' },
  { id: 'blue',    body: 'steel blue #2B5F8F' },
  { id: 'grey',    body: 'slate grey #3A3A42' },
  { id: 'emerald', body: 'emerald green #1F9D55' },
  { id: 'black',   body: 'jet black #1A1A1F with subtle ivory accents so the rim still reads' },
  { id: 'purple',  body: 'deep purple #4B1F6B' },
  { id: 'gold',    body: 'luxury gold #D4AF37' },
];

async function exists(path) {
  try { await access(path, FS.F_OK); return true; } catch { return false; }
}

async function maskToTransparent(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const corners = [[0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]];
  let br = 0, bgc = 0, bb = 0;
  for (const [cx, cy] of corners) {
    const i = (cy * width + cx) * channels;
    br += data[i]; bgc += data[i + 1]; bb += data[i + 2];
  }
  br = Math.round(br / 4); bgc = Math.round(bgc / 4); bb = Math.round(bb / 4);
  const near = 22, far = 85;
  const out = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const o = (y * width + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const dist = Math.hypot(r - br, g - bgc, b - bb);
      let alpha;
      if (dist <= near) alpha = 0;
      else if (dist >= far) alpha = 255;
      else alpha = Math.round(((dist - near) / (far - near)) * 255);
      out[o] = r; out[o + 1] = g; out[o + 2] = b; out[o + 3] = alpha;
    }
  }
  await sharp(out, { raw: { width, height, channels: 4 } }).png({ compressionLevel: 9 }).toFile(outputPath);
}

async function main() {
  await loadDotEnvLocal(REPO_ROOT);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) { console.error('✗ OPENAI_API_KEY not found.'); process.exit(1); }
  const client = new OpenAI({ apiKey });
  await mkdir(OUT_ROOT, { recursive: true });

  for (const cfg of CHIPS) {
    const outP = join(OUT_ROOT, `${cfg.id}.png`);
    const tP = join(OUT_ROOT, `${cfg.id}-transparent.png`);
    if (await exists(outP) && await exists(tP)) {
      console.log(`→ ${cfg.id} exists, skipping`);
      continue;
    }
    process.stdout.write(`⚙  ${cfg.id} ... `);
    const prompt = buildPrompt(cfg);
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
    await writeFile(outP, Buffer.from(b64, 'base64'));
    await maskToTransparent(outP, tP);
    console.log('✓');
  }

  console.log('\nDone. Chip set v3 at', OUT_ROOT);
}

main().catch((err) => { console.error(err); process.exit(1); });
