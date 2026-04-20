#!/usr/bin/env node
/**
 * Renders /public/og.png — the 1200×630 social share card.
 *
 * Composition:
 *   • Felt-green radial gradient backdrop
 *   • G3 chip mark positioned on the left
 *   • Wordmark + tagline rendered as SVG text overlay on the right
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const W = 1200;
const H = 630;

const bgSvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="felt" cx="50%" cy="45%" r="70%">
      <stop offset="0%" stop-color="#0E3B2E"/>
      <stop offset="65%" stop-color="#082018"/>
      <stop offset="100%" stop-color="#051612"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#felt)"/>
  <!-- subtle inner edge -->
  <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="rgba(212,175,55,0.12)" stroke-width="2"/>
</svg>
`);

const textSvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <text
    x="520" y="295"
    font-family="Inter, 'Pretendard Variable', sans-serif"
    font-size="108"
    font-weight="900"
    letter-spacing="-3"
    fill="#F4EFE6"
  >GTO</text>
  <circle cx="745" cy="255" r="10" fill="#D4AF37"/>
  <text
    x="775" y="295"
    font-family="Inter, 'Pretendard Variable', sans-serif"
    font-size="108"
    font-weight="300"
    letter-spacing="-2"
    fill="#F4EFE6"
  >today</text>
  <text
    x="520" y="355"
    font-family="'Pretendard Variable', sans-serif"
    font-size="26"
    font-weight="600"
    letter-spacing="2"
    fill="#D4AF37"
  >매일 쌓이는 실력, 후회 없는 액션</text>
  <text
    x="520" y="445"
    font-family="Inter, 'Pretendard Variable', sans-serif"
    font-size="32"
    font-weight="400"
    fill="rgba(244,239,230,0.82)"
  >매일 10핸드, 감이 아닌 솔버의 답.</text>
  <text
    x="520" y="490"
    font-family="Inter, 'Pretendard Variable', sans-serif"
    font-size="32"
    font-weight="400"
    fill="rgba(244,239,230,0.82)"
  >AI 코치의 한국어 해설까지 — 포커 GTO 훈련.</text>
</svg>
`);

const chipBuf = await readFile(join(publicDir, 'logos', 'mark-g3-transparent.png'));
const chipResized = await sharp(chipBuf).resize(380, 380, { fit: 'contain' }).png().toBuffer();

const out = await sharp(bgSvg)
  .composite([
    { input: chipResized, left: 90, top: 125 },
    { input: textSvg, left: 0, top: 0 },
  ])
  .png({ compressionLevel: 9 })
  .toBuffer();

await writeFile(join(publicDir, 'og.png'), out);
console.log(`✓ og.png  ${W}×${H}  ${(out.length / 1024).toFixed(1)}KB`);
