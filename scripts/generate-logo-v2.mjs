#!/usr/bin/env node
/**
 * DALL·E 3 HD second-pass logo candidates. Prior batch was minimal-flat;
 * this one aims at "premium brand mark" territory — sculpted volumetric
 * light, art-deco framing, embossed metal finishes.
 *
 * Output: apps/web/public/ai-assets/logo-v2/*.png
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
  'Brand palette: deep felt green #0E3B2E primary, luxury gold #D4AF37 accent, ivory #F4EFE6 highlights on dark noir #0A0A0A. Style: premium casino lounge meets minimal modern iOS app — cinematic volumetric lighting, embossed precision. Avoid: any rendered text or typography, photographic realism, cartoon, neon, cluttered detail, amateur flat vector.';

const PROMPTS = [
  {
    id: 'logo-v2/gold-seal',
    prompt: `A premium circular brand medallion, an embossed gold seal on a dark forest-green rounded-square backdrop. Central motif: a luminous polished gold dot with a thin ornamental gold ring and four tiny radial tick marks at the cardinals (like a compass rose reduced to bare essentials). Subtle engraved art-deco micro-patterns in the outer ring. Soft directional light from upper-left, sculpted 3D relief, museum quality. Symmetric, iconic, instantly scales down to favicon. No text, no numbers.`,
  },
  {
    id: 'logo-v2/spade-emblem',
    prompt: `A luxury brand emblem for a poker training app: a stylised sharp-geometric gold spade silhouette centered on a deep felt-green rounded square, the spade outlined in a finer ivory hairline, a single tiny gold dot precisely at the spade's visual center. Flat base with a subtle radial vignette and a soft upper-left highlight to suggest embossing. Elegant, modern, iconic. No text, no typography.`,
  },
  {
    id: 'logo-v2/chip-dot',
    prompt: `App icon: a single luxury poker chip seen from a slight top-down 3-quarter angle, deep forest-green edge with thin dashed ivory rim insets, the flat top face facing viewer showing a large luminous gold dot centered. Subtle ambient glow radiating from the dot, soft directional lighting, premium embossed finish. Icon sits on a dark noir background. Iconic, symmetric, readable at 40px. No text, no numbers.`,
  },
  {
    id: 'logo-v2/crown-chip',
    prompt: `A luxury minimalist brand mark: a small poker-chip shape in deep forest-green with a thin gold rim, topped by three tiny gold rays suggesting a subtle crown silhouette (only three short outward-tapering strokes above the chip). Everything centered on a dark noir rounded-square backdrop. Premium, polished, under 8 shapes total. No text, no typography.`,
  },
  {
    id: 'logo-v2/ace-monogram',
    prompt: `A premium wordmark lockup — abstract decorative frame only. A horizontal panel shaped like a luxurious gold art-deco plaque with beveled edges and fine engraved corner filigrees, centered on deep forest-green. The INSIDE of the plaque is intentionally left BLANK and dark (reserved for text we overlay programmatically later). No letters, no numbers, no glyphs inside the frame — just the ornate gold frame and empty center.`,
  },
  {
    id: 'logo-v2/geom-dot',
    prompt: `A minimalist modern tech-luxe brand symbol: a single luminous gold dot surrounded by three thin concentric rings of increasing radius, the outermost ring has four tiny gold dashes at the compass cardinals. On deep forest-green rounded square with a subtle gold hairline border. Clean geometric flat design with a hint of volumetric glow. No text.`,
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
        prompt: `${prompt} ${BRAND}`,
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
