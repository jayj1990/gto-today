#!/usr/bin/env node
// Renders master SVGs into PNG app icons.
// Run via `pnpm --filter @gto/web icons`.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const jobs = [
  { src: 'icon-master.svg', out: 'icon-192.png', size: 192 },
  { src: 'icon-master.svg', out: 'icon-512.png', size: 512 },
  { src: 'icon-maskable.svg', out: 'icon-maskable.png', size: 512 },
  { src: 'icon-master.svg', out: 'icon-apple.png', size: 180 },
];

for (const job of jobs) {
  const input = await readFile(join(publicDir, job.src));
  const buf = await sharp(input, { density: 384 })
    .resize(job.size, job.size, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(join(publicDir, job.out), buf);
  console.log(`✓ ${job.out}  ${job.size}×${job.size}  ${(buf.length / 1024).toFixed(1)}KB`);
}
