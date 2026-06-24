'use client';

import { useEffect, useState } from 'react';
import {
  fetchBoardNodes,
  type BoardNodeTree,
  type BoardRange,
  type PostflopSpot,
} from '@gto/gto-data';
import { NodeNavigator } from './node-navigator';
import { RangeChartPanel } from './range-chart-panel';
import { BoardMixPanel } from './board-mix-panel';

/**
 * One board's result, with graceful degradation across data tiers:
 *   1. full node tree (Wizard browser)        — per-board fetch
 *   2. flat 169-range grid                      — pairing range file
 *   3. sample-hand list                         — sample chunk
 * Pairings re-solve into tier 1 incrementally; until then a board
 * shows whatever richest tier it has.
 */
export function BoardResult({
  pairingKey,
  canonKey,
  range,
  spots,
}: {
  pairingKey: string;
  canonKey: string;
  range?: BoardRange | undefined;
  spots: readonly PostflopSpot[];
}) {
  const [tree, setTree] = useState<BoardNodeTree | null>(null);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setTree(null);
    setTried(false);
    void fetchBoardNodes(pairingKey, canonKey).then((t) => {
      if (cancelled) return;
      setTree(t);
      setTried(true);
    });
    return () => {
      cancelled = true;
    };
  }, [pairingKey, canonKey]);

  if (tree) return <NodeNavigator key={canonKey} tree={tree} />;
  // Node fetch resolved with no tree → fall back to flat range / sample.
  if (tried) {
    if (range) return <RangeChartPanel key={canonKey} range={range} />;
    return <BoardMixPanel key={canonKey} spots={spots} />;
  }
  // Still fetching the node tree — show the flat range immediately if we
  // have it (no flash), else nothing until the fetch resolves.
  if (range) return <RangeChartPanel key={canonKey} range={range} />;
  return null;
}
