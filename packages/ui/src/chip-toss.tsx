'use client';

import type { CSSProperties } from 'react';
import { useId } from 'react';

/**
 * Celebration burst — five small gold chips scatter up-and-out when
 * the user answers sharp. Each chip reads its own trajectory via
 * CSS variables (--tx / --ty / --tr), which the keyframes
 * `gto-chip-toss` in globals.css consume.
 *
 * No framer-motion so this is cheap to mount/unmount. The host
 * container should be absolutely positioned over the reveal target
 * (e.g. above the result sheet headline).
 */
export interface ChipTossProps {
  show: boolean;
  /** Chip count. Default 5. */
  count?: number;
  className?: string;
  style?: CSSProperties;
}

const TRAJECTORIES: Array<{ tx: string; ty: string; tr: string }> = [
  { tx: '-64px', ty: '-72px', tr: '-280deg' },
  { tx: '-32px', ty: '-94px', tr: '180deg' },
  { tx: '0px', ty: '-102px', tr: '-120deg' },
  { tx: '36px', ty: '-90px', tr: '220deg' },
  { tx: '64px', ty: '-74px', tr: '-200deg' },
];

export function ChipToss({ show, count = 5, className, style }: ChipTossProps) {
  const id = useId();
  if (!show) return null;
  const chips = TRAJECTORIES.slice(0, Math.max(1, Math.min(count, TRAJECTORIES.length)));
  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 0,
        height: 0,
        pointerEvents: 'none',
        ...style,
      }}
    >
      {chips.map((t, i) => (
        <span
          key={`${id}-${i}`}
          className="animate-chip-toss"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 14,
            height: 14,
            marginLeft: -7,
            marginTop: -7,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, #F0C857, #D4AF37 60%, #8C6F1F)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.35)',
            outline: '2px dashed rgba(255,255,255,0.22)',
            outlineOffset: '-3px',
            animationDelay: `${i * 35}ms`,
            // Tell the keyframes where this chip flies to.
            ['--tx' as keyof CSSProperties]: t.tx,
            ['--ty' as keyof CSSProperties]: t.ty,
            ['--tr' as keyof CSSProperties]: t.tr,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
