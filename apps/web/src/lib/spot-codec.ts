import type { PostflopSpot, TrainingSpot } from '@gto/gto-data';

/**
 * Spot codec — round-trip a TrainingSpot or PostflopSpot through a
 * URL-safe base64 string. Used by the friend-share link so the
 * recipient sees the EXACT same spot the sharer played, even if the
 * solver-generated postflop pool has grown in the meantime (which
 * would otherwise shift the index-based daily list).
 *
 * Trade-off: encoded payload (~600–900 bytes) is larger than a
 * locator (date + idx) but eliminates non-determinism. Modern URL
 * lengths handle this comfortably.
 */

export type SharedSpot =
  | { kind: 'preflop'; spot: TrainingSpot }
  | { kind: 'postflop'; spot: PostflopSpot };

/** Browser-safe URL-safe base64. Avoids the +/= chars that need
 *  escaping inside a query string. */
function b64urlEncode(text: string): string {
  if (typeof window === 'undefined') {
    return Buffer.from(text, 'utf-8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
  // Convert UTF-8 string → bytes → base64 (handles Korean text).
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return window.btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(encoded: string): string {
  // Restore standard base64 padding before decoding.
  const padded =
    encoded.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((encoded.length + 3) % 4);
  if (typeof window === 'undefined') {
    return Buffer.from(padded, 'base64').toString('utf-8');
  }
  const bin = window.atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeSharedSpot(payload: SharedSpot): string {
  return b64urlEncode(JSON.stringify(payload));
}

export function decodeSharedSpot(encoded: string): SharedSpot | null {
  try {
    const json = b64urlDecode(encoded);
    const parsed = JSON.parse(json) as SharedSpot;
    if (
      parsed &&
      (parsed.kind === 'preflop' || parsed.kind === 'postflop') &&
      parsed.spot &&
      typeof parsed.spot === 'object'
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
