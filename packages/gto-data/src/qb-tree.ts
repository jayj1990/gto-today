import type { ComboKey, Position, TableFormat } from '@gto/poker-core';
import type { PreAction, Scenario, TrainingSpot } from './spot-generator';

/**
 * qb_decisions.json loader + scenario classifier.
 *
 * The JSON ships a flat map of node keys like
 *   "CO_2.5bb_BTN_8.5bb_BB" → { actions: { "22.0bb": {...freqs}, "Call": {...}, "FOLD": {...} } }
 *
 * Node keys encode the full prior action list as `Actor_Action`
 * pairs followed by the decider's position. Actions are either:
 *   • "N.0bb" — a raise to N big blinds
 *   • "Call"
 *   • "AllIn"
 *   • "FOLD"
 *
 * We classify each node into a Scenario (rfi / vs_open / vs_3bet / ...)
 * by inspecting the last action in the prior trace.
 */

export type QbStrategyJson = Record<
  string,
  Record<string, Record<string, number>>
>;

interface Loader {
  (key: string): Promise<QbStrategyJson | null>;
}

const cache = new Map<string, QbStrategyJson>();
const pending = new Map<string, Promise<QbStrategyJson | null>>();
let basePath = '/data/preflop';
let loader: Loader = defaultLoader;

export function setQbBasePath(path: string): void {
  basePath = path;
}
export function setQbLoader(fn: Loader): void {
  loader = fn;
}

async function defaultLoader(key: string): Promise<QbStrategyJson | null> {
  try {
    const res = await fetch(`${basePath}/${key}.json`, { cache: 'force-cache' });
    if (!res.ok) return null;
    return (await res.json()) as QbStrategyJson;
  } catch {
    return null;
  }
}

async function load(key: string): Promise<QbStrategyJson | null> {
  const hit = cache.get(key);
  if (hit) return hit;
  const existing = pending.get(key);
  if (existing) return existing;
  const p = loader(key).then((data) => {
    pending.delete(key);
    if (data) cache.set(key, data);
    return data;
  });
  pending.set(key, p);
  return p;
}

export async function getQbTree(
  format: TableFormat = '6max',
  stackBB = 100,
): Promise<QbStrategyJson | null> {
  const key = `${format}_${stackBB}bb_qb_decisions`;
  return load(key);
}

export interface ParsedNode {
  readonly nodeKey: string;
  readonly decider: Position;
  readonly preActions: readonly PreAction[];
  readonly potBB: number;
  readonly scenario: Scenario;
}

export function parseNodeKey(nodeKey: string): ParsedNode | null {
  const tokens = nodeKey.split('_');
  if (tokens.length < 1) return null;
  const decider = tokens[tokens.length - 1] as Position;
  // Actions come in pairs after each actor except the terminal decider.
  const preActions: PreAction[] = [];
  for (let i = 0; i < tokens.length - 1; i += 2) {
    const actor = tokens[i] as Position;
    const action = tokens[i + 1];
    if (!action) break;
    preActions.push({ actor, action });
  }
  const scenario = classifyScenario(preActions);
  const potBB = computePotBB(preActions);
  return { nodeKey, decider, preActions, potBB, scenario };
}

function classifyScenario(preActions: readonly PreAction[]): Scenario {
  if (preActions.length === 0) return 'rfi';
  if (preActions.length === 1) return 'vs_open';
  const last = preActions[preActions.length - 1]!;
  if (last.action === 'AllIn') return 'vs_allin';
  if (last.action === 'Call') return 'vs_squeeze';
  // Remaining case: last action is a size ("9.0bb"/"22.0bb"…).
  // 2 hops total = 3bet, 3+ hops = 4bet+, but we collapse 4bet+ into
  // vs_4bet since the UX (fold/call/jam) is the same.
  if (preActions.length === 2) return 'vs_3bet';
  return 'vs_4bet';
}

function computePotBB(preActions: readonly PreAction[]): number {
  // Blinds contribute 1.5bb. Each subsequent action adds to pot.
  // Calls pick up the facing bet size. Raises replace it.
  let pot = 1.5;
  let facing = 0;
  for (const { action } of preActions) {
    if (action === 'FOLD') continue;
    if (action === 'Call') {
      pot += facing;
      continue;
    }
    if (action === 'AllIn') {
      pot += 100 - (facing || 0); // 100bb effective, crude
      facing = 100;
      continue;
    }
    // Size like "8.5bb"
    const m = action.match(/^([\d.]+)bb$/);
    if (m) {
      const size = parseFloat(m[1]!);
      pot += size - facing;
      facing = size;
    }
  }
  return Math.round(pot * 10) / 10;
}

export function describePreActions(preActions: readonly PreAction[]): string {
  if (preActions.length === 0) return '첫 액션';
  return preActions
    .filter((p) => p.action !== 'FOLD')
    .map((p) => {
      const label = translateAction(p.action);
      return `${p.actor} ${label}`;
    })
    .join(' · ');
}

function translateAction(action: string): string {
  if (action === 'FOLD') return '폴드';
  if (action === 'Call') return '콜';
  if (action === 'AllIn') return '올인';
  const m = action.match(/^([\d.]+)bb$/);
  if (m) return `${m[1]}bb`;
  return action;
}

/** Collapse qb action space → our 5-way user choice.
 *
 * Inputs look like { "22.0bb": {...}, "Call": {...}, "FOLD": {...}, "AllIn": {...} }.
 * We sum all bb-sized raises into either `raise` or `allin` depending
 * on whether the qb actually named it AllIn.
 */
export interface CollapsedMix {
  readonly combo: ComboKey;
  readonly fold: number;
  readonly call: number;
  readonly raise: number;
  readonly allin: number;
  /** Sizes actually seen in this node so the UI can show
   *  "raise to ~22bb" on the label when a single size dominates. */
  readonly raiseSizes: readonly number[];
}

export function collapseForCombo(
  node: Record<string, Record<string, number>>,
  combo: ComboKey,
): CollapsedMix | null {
  const actions = Object.keys(node);
  let fold = 0;
  let call = 0;
  let raise = 0;
  let allin = 0;
  const raiseSizes: number[] = [];
  let total = 0;
  for (const a of actions) {
    const freq = node[a]?.[combo] ?? 0;
    if (freq <= 0) continue;
    total += freq;
    if (a === 'FOLD') fold += freq;
    else if (a === 'Call') call += freq;
    else if (a === 'AllIn') allin += freq;
    else {
      const m = a.match(/^([\d.]+)bb$/);
      if (m) {
        raise += freq;
        raiseSizes.push(parseFloat(m[1]!));
      }
    }
  }
  if (total <= 0) return null;
  return {
    combo,
    fold: fold / total,
    call: call / total,
    raise: raise / total,
    allin: allin / total,
    raiseSizes,
  };
}

export function availableActionsFor(scenario: Scenario): TrainingSpot['availableActions'] {
  if (scenario === 'rfi') return ['fold', 'raise'];
  if (scenario === 'vs_allin') return ['fold', 'call'];
  // 3-way baseline (fold/call/raise) used by vs_open + vs_squeeze.
  // Deeper reraise lines add 'allin' as a separate button.
  if (scenario === 'vs_open' || scenario === 'vs_squeeze') {
    return ['fold', 'call', 'raise'];
  }
  // vs_3bet + vs_4bet: fold / call / raise / allin
  return ['fold', 'call', 'raise', 'allin'];
}
