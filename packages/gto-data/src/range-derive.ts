/**
 * Derive OOP / IP range strings for the postflop WASM solver from a
 * preflop qb_decisions path.
 *
 * Given:
 *   decisions — the 6max_100bb_qb_decisions.json blob (action → combo → freq)
 *   path      — ['UTG_FOLD','MP_FOLD','CO_2.5bb','BB_Call']
 *
 * Returns the postflop-position-adjusted range strings plus who's OOP/IP.
 * Currently handles single-raised pots only (exactly one raise + one call
 * in the active line). 3bet/4bet pots return null and the caller should
 * fall back to a generic range.
 */

type DecisionsJson = Record<string, Record<string, Record<string, number>>>;

export interface DerivedRanges {
  /** Position of the player who acts first on the flop (closer to SB). */
  oopPos: string;
  /** Position of the player who acts last on the flop. */
  ipPos: string;
  /** Pio-style comma-separated range string for OOP. */
  oopRange: string;
  /** Pio-style comma-separated range string for IP. */
  ipRange: string;
}

// Postflop action order — SB acts first after the flop, BTN last. When two
// players reach the flop, IP = whichever sits later in this list.
const POSTFLOP_ORDER: Record<string, number> = {
  SB: 0,
  BB: 1,
  UTG: 2,
  MP: 3,
  CO: 4,
  BTN: 5,
};

export function deriveRanges(
  decisions: DecisionsJson,
  path: readonly string[],
): DerivedRanges | null {
  // Step-by-step parse with prefix tracking so we can look up each
  // actor's decision node by key (= active-tokens + actor).
  const activeSteps: Array<{ actor: string; action: string; freqs: Record<string, number> }> = [];
  const prefix: string[] = [];

  for (const token of path) {
    const us = token.indexOf('_');
    if (us < 0) return null;
    const actor = token.slice(0, us);
    const action = token.slice(us + 1);

    if (action === 'FOLD') {
      prefix.push(token);
      continue;
    }

    const activeTokens = prefix.filter((t) => !t.endsWith('_FOLD'));
    const key = [...activeTokens, actor].join('_');
    // The root node (CO RFI etc.) isn't stored under a multi-token key;
    // look it up by the actor alone when no prior active tokens exist.
    const lookupKey = activeTokens.length === 0 ? actor : key;
    const freqs = decisions[lookupKey]?.[action];
    if (!freqs) return null;
    activeSteps.push({ actor, action, freqs });
    prefix.push(token);
  }

  // SRP = exactly one raise + one call.
  if (activeSteps.length !== 2) return null;

  const raiser = activeSteps.find((s) => s.action !== 'Call');
  const caller = activeSteps.find((s) => s.action === 'Call');
  if (!raiser || !caller) return null;

  const rOrder = POSTFLOP_ORDER[raiser.actor];
  const cOrder = POSTFLOP_ORDER[caller.actor];
  if (rOrder === undefined || cOrder === undefined) return null;

  const ipActor = rOrder > cOrder ? raiser.actor : caller.actor;
  const oopActor = ipActor === raiser.actor ? caller.actor : raiser.actor;

  const raiserRange = freqsToRangeString(raiser.freqs);
  const callerRange = freqsToRangeString(caller.freqs);

  return {
    oopPos: oopActor,
    ipPos: ipActor,
    oopRange: ipActor === raiser.actor ? callerRange : raiserRange,
    ipRange: ipActor === raiser.actor ? raiserRange : callerRange,
  };
}

/**
 * Convert a {combo: freq} map into a Pio-style comma-separated range
 * string. `AKs:0.85` for partial weights, bare `AA` for 1.0.
 *
 * `minFreq` drops combos below the threshold entirely. WASM solver
 * memory scales roughly quadratically with range width, so small-
 * weight long-tail combos inflate the tree without changing the
 * top-level strategy meaningfully. Default 0.05 (5%) keeps strategic
 * action but strips the 1-2% "noise" combos the preflop solver
 * occasionally emits.
 */
export function freqsToRangeString(freqs: Record<string, number>, minFreq = 0.1): string {
  const parts: string[] = [];
  for (const [combo, freq] of Object.entries(freqs)) {
    if (freq < minFreq) continue;
    parts.push(freq >= 0.999 ? combo : `${combo}:${freq.toFixed(3)}`);
  }
  return parts.join(',');
}
