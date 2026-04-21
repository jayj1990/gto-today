import type { BoardTexture, PostflopSpot } from './postflop';

/** User-facing texture buckets for the flop picker. Multiple raw
 *  classifier values can collapse into one UI group (e.g. semi_wet +
 *  wet_draw both land under "젖은 보드"). */
export interface TextureGroup {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly textures: readonly BoardTexture[];
}

export const TEXTURE_GROUPS: readonly TextureGroup[] = [
  {
    id: 'ace-dry',
    label: '에이스 하이 드라이',
    description: 'A 탑, 드로우 없음',
    textures: ['ace_high'],
  },
  {
    id: 'dry-high',
    label: '하이카드 드라이',
    description: 'K/Q 탑, 정적',
    textures: ['dry_high'],
  },
  {
    id: 'wet',
    label: '젖은 보드',
    description: '드로우 · 커넥티드',
    textures: ['wet_draw', 'semi_wet'],
  },
  {
    id: 'paired',
    label: '페어드 보드',
    description: '페어 포함',
    textures: ['paired'],
  },
  {
    id: 'monotone',
    label: '모노톤',
    description: '한 수트 삼연',
    textures: ['monotone'],
  },
  {
    id: 'low-mid',
    label: '로우 · 미들',
    description: '6 이하 / 중간',
    textures: ['low_connected', 'dry_mid'],
  },
  {
    id: 'broadway',
    label: '브로드웨이',
    description: 'JQK 조합',
    textures: ['broadway'],
  },
];

/** Group the given spot list by their UI texture bucket. Spots whose
 *  texture isn't covered by any group go under `id="other"`. Each
 *  group's spots share board+scenario; the caller usually de-dupes by
 *  board in presentation. */
export function groupSpotsByTexture(
  spots: readonly PostflopSpot[],
): Record<string, readonly PostflopSpot[]> {
  const out: Record<string, PostflopSpot[]> = {};
  for (const g of TEXTURE_GROUPS) out[g.id] = [];
  out.other = [];
  for (const s of spots) {
    const group = TEXTURE_GROUPS.find((g) => g.textures.includes(s.texture));
    const bucket = group ? out[group.id] : out.other;
    bucket!.push(s);
  }
  return out;
}

/** Distinct boards (de-duped by 3-card join) present in a spot list,
 *  returned in deterministic order. Useful for the flop picker UI
 *  which shows one row per board, not per hero combo. */
export function distinctBoards(
  spots: readonly PostflopSpot[],
): { board: readonly string[]; key: string; sampleSpot: PostflopSpot }[] {
  const seen = new Map<string, PostflopSpot>();
  for (const s of spots) {
    const key = s.board.join(',');
    if (!seen.has(key)) seen.set(key, s);
  }
  return [...seen.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, spot]) => ({ board: spot.board, key, sampleSpot: spot }));
}
