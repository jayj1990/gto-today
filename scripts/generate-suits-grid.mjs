#!/usr/bin/env node
/**
 * DALL·E 3 HD — single 2×2 grid of all four suit glyphs.
 *
 * Why one image: asking for all four in a single composition guarantees
 * identical style, stroke width, lighting, and gold tone. We then crop
 * the image into four 512×512 quadrants and strip the background.
 *
 * Layout produced:
 *   ┌─────────────┬─────────────┐
 *   │   SPADE     │   HEART     │
 *   ├─────────────┼─────────────┤
 *   │   DIAMOND   │   CLUB      │
 *   └─────────────┴─────────────┘
 */
import OpenAI from 'openai';
import { mkdir, writeFile, access, readFile } from 'node:fs/promises';
import { constants as FS } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

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

const PROMPT = `A single square image containing four playing-card suit symbols arranged in a 2×2 grid on pure flat black #0A0A0A background, no frame, no border, no card, no text.

TOP-LEFT quadrant: a SPADE suit — a pointed-top leaf shape with two rounded hips and a small tapered stem at the bottom. Inside the spade shape, a delicate ornamental pattern of thin curving lines (like engraving) visible.

TOP-RIGHT quadrant: a HEART suit — two equal rounded lobes at the top meeting at a center dip, curving down to a pointed tip at the bottom. Inside the heart shape, the same delicate engraved-line ornamental pattern.

BOTTOM-LEFT quadrant: a DIAMOND suit — a rhombus (tall vertical diamond) with four sharp vertices. Inside the diamond shape, the same delicate engraved-line pattern.

BOTTOM-RIGHT quadrant: a CLUB suit — three equal round lobes arranged as a triangle (one on top, two below) with a tapered stem at the bottom. Inside the club shape, the same delicate engraved-line pattern.

CRITICAL style requirements — ALL four glyphs must match exactly:
- Solid flat luxury gold #D4AF37 color, NO gradients, NO highlights, NO embossing, NO 3D shading, NO shadows
- The internal ornament pattern uses thin darker-gold lines, also flat — no depth
- Each glyph occupies 60-70% of its quadrant area, centered
- No dividing lines between quadrants, just empty black space
- No rendered text, no numbers, no letters, no card-frame borders
- Ornate but flat — think engraved art-deco plate, not embossed coin`;

async function exists(path) {
  try { await access(path, FS.F_OK); return true; } catch { return false; }
}

async function main() {
  await loadDotEnvLocal(REPO_ROOT);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) { console.error('✗ OPENAI_API_KEY not found.'); process.exit(1); }
  const client = new OpenAI({ apiKey });

  await mkdir(OUT_ROOT, { recursive: true });

  const gridPath = join(OUT_ROOT, 'grid.png');
  if (!(await exists(gridPath))) {
    process.stdout.write(`⚙  grid.png ... `);
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
    await writeFile(gridPath, Buffer.from(b64, 'base64'));
    console.log('✓');
  } else {
    console.log('→ grid.png already exists, skipping generation');
  }

  /* ── Split into four 512×512 quadrants ──────────────────────── */
  const quadrants = [
    { name: 'spade.png', left: 0, top: 0 },
    { name: 'heart.png', left: 512, top: 0 },
    { name: 'diamond.png', left: 0, top: 512 },
    { name: 'club.png', left: 512, top: 512 },
  ];

  for (const q of quadrants) {
    const out = join(OUT_ROOT, q.name);
    await sharp(gridPath)
      .extract({ left: q.left, top: q.top, width: 512, height: 512 })
      .png()
      .toFile(out);
    console.log(`✓ extracted ${q.name}`);
  }

  /* ── Background removal via radial alpha mask ───────────────── */
  for (const q of quadrants) {
    const inPath = join(OUT_ROOT, q.name);
    const outPath = join(OUT_ROOT, q.name.replace(/\.png$/, '-transparent.png'));
    await maskToTransparent(inPath, outPath);
    console.log(`✓ transparent ${q.name}`);
  }

  console.log('\nDone.');
}

async function maskToTransparent(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  // Sample corner 12×12 patch as background — DALL·E's black isn't always
  // #0A0A0A exactly; grabbing it lets the colour-distance threshold catch
  // compression noise too.
  let br = 0, bgc = 0, bb = 0;
  const patch = 12;
  for (let y = 0; y < patch; y++) {
    for (let x = 0; x < patch; x++) {
      const i = (y * width + x) * channels;
      br += data[i]; bgc += data[i + 1]; bb += data[i + 2];
    }
  }
  const n = patch * patch;
  br = Math.round(br / n);
  bgc = Math.round(bgc / n);
  bb = Math.round(bb / n);

  const near = 28;
  const far = 85;
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

  await sharp(out, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}

main().catch((err) => { console.error(err); process.exit(1); });
