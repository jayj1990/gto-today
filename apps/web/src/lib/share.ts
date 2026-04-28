/**
 * Cross-surface share helper. Tries the native Web Share API first
 * (which gets KakaoTalk / Messages / Twitter on mobile, the OS share
 * sheet on desktop), and falls back to copying a formatted snippet to
 * the clipboard so the user can paste anywhere themselves.
 *
 * Returns the channel that handled the share so callers can show an
 * appropriate toast: "share" → native sheet, "clipboard" → copied,
 * "failed" → both paths errored.
 */
export type ShareChannel = 'share' | 'clipboard' | 'failed';

export interface SharePayload {
  /** OS share-sheet title (often shown as the share preview heading). */
  readonly title?: string;
  /** Body text. The clipboard fallback writes "{text}\n{url}" together. */
  readonly text: string;
  /** Canonical URL for the thing being shared. */
  readonly url: string;
}

export async function shareOrCopy(payload: SharePayload): Promise<ShareChannel> {
  const { title, text, url } = payload;
  if (typeof window === 'undefined') return 'failed';

  // 1) Web Share API — best UX where supported.
  if (
    typeof navigator !== 'undefined' &&
    'share' in navigator &&
    typeof navigator.share === 'function'
  ) {
    try {
      await navigator.share(title ? { title, text, url } : { text, url });
      return 'share';
    } catch (e) {
      // User cancelled (AbortError) — don't fall back to clipboard.
      if (e instanceof Error && e.name === 'AbortError') return 'failed';
      // Other errors fall through to clipboard.
    }
  }

  // 2) Clipboard fallback — write the formatted snippet so the user
  //    can paste into KakaoTalk / Slack / wherever themselves.
  const snippet = `${text}\n${url}`;
  if (
    typeof navigator !== 'undefined' &&
    'clipboard' in navigator &&
    typeof navigator.clipboard?.writeText === 'function'
  ) {
    try {
      await navigator.clipboard.writeText(snippet);
      return 'clipboard';
    } catch {
      // fall through
    }
  }
  return 'failed';
}
