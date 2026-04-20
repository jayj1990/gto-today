#!/usr/bin/env node
// Renders the chosen brand mark (chip-stack, DALL·E HD) into every
// required app-icon size. Run via `pnpm --filter @gto/web icons`.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// Source: the 1024×1024 HD chip-stack logo Jay picked. Kept as
// /public/logos/mark-chip-stack.png so it's also serve-able directly.
const SOURCE = join(publicDir, 'logos', 'mark-chip-stack.png');

const jobs = [
  { out: 'icon-192.png', size: 192, pad: 0 },
  { out: 'icon-512.png', size: 512, pad: 0 },
  { out: 'icon-apple.png', size: 180, pad: 0 },
  // Maskable icons need ~10% safe-zone padding per PWA spec.
  { out: 'icon-maskable.png', size: 512, pad: Math.round(512 * 0.1) },
];

const source = await readFile(SOURCE);

for (const job of jobs) {
  const innerSize = job.size - job.pad * 2;
  const resized = await sharp(source)
    .resize(innerSize, innerSize, { fit: 'cover' })
    .png()
    .toBuffer();

  const buf = await sharp({
    create: {
      width: job.size,
      height: job.size,
      channels: 4,
      background: { r: 10, g: 10, b: 10, alpha: 1 }, // noir backdrop for safe-zone
    },
  })
    .composite([{ input: resized, left: job.pad, top: job.pad }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  await writeFile(join(publicDir, job.out), buf);
  console.log(`✓ ${job.out}  ${job.size}×${job.size}  ${(buf.length / 1024).toFixed(1)}KB`);
}
