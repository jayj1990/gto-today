'use client';

import { motion } from 'framer-motion';
import { cn } from '@gto/ui';
import { pressScale } from '@gto/ui/motion';
import type { AvailableAction } from '@gto/gto-data';
import { useRipple } from '@/lib/use-ripple';

export type ActionKind = 'fold' | 'check' | 'call' | 'raise' | 'allin';

export interface ActionBarProps {
  disabled?: boolean;
  /** Which actions to render, driven by the current spot's scenario. */
  actions: readonly AvailableAction[];
  /** Size to display on the call button (e.g. 2.5 for "콜 2.5BB"). */
  callSize?: number | undefined;
  /** Size to display on the raise button (3-bet size). */
  raiseSize?: number | undefined;
  onAnswer: (kind: ActionKind) => void;
  className?: string;
}

const LABELS: Record<ActionKind, string> = {
  fold: '폴드',
  check: '체크',
  call: '콜',
  raise: '레이즈',
  allin: '올인',
};

// Every button fills with its action color (white bold text) so they
// read as one coherent family — matches the chart-navigator buttons.
function RippleActionButton({
  kind,
  label,
  compact,
  disabled,
  onClick,
}: {
  kind: ActionKind;
  label: string;
  compact: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const { onPointerDown, node } = useRipple();
  return (
    <motion.button
      type="button"
      disabled={disabled}
      whileTap={pressScale}
      onPointerDown={onPointerDown}
      onClick={onClick}
      className={cn(
        'ripple-host select-none whitespace-nowrap rounded-[var(--radius-button)] px-1 transition-colors disabled:opacity-40',
        compact ? 'h-11 text-[12px]' : 'h-12 text-[14px]',
        TONE[kind].cls,
      )}
    >
      <span className="relative z-10">{label}</span>
      {node}
    </motion.button>
  );
}

const TONE: Record<ActionKind, { cls: string }> = {
  fold: {
    cls: 'bg-[color:var(--color-fold)] text-on-primary font-bold shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-fold)]',
  },
  check: {
    cls: 'bg-[color:var(--color-graphite)] text-on-primary font-bold shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-border)]',
  },
  call: {
    cls: 'bg-[color:var(--color-call)] text-on-primary font-bold shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-call)]',
  },
  raise: {
    cls: 'bg-[color:var(--color-raise)] text-on-primary font-bold shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-raise)]',
  },
  allin: {
    // AllIn button — deeper, darker red than a regular raise so the
    // stake escalation reads visually. Gold ring to mark the jam.
    cls: 'bg-[color:var(--color-raise-deep)] text-on-primary font-bold shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold)]',
  },
};

/**
 * Dynamic action buttons — renders only the actions available in the
 * current spot. 2 buttons (RFI: fold/raise) on a 2-col grid, 3+ buttons
 * on a wrapping flex row so mobile never squashes them.
 */
export function ActionBar({
  disabled = false,
  actions,
  callSize,
  raiseSize,
  onAnswer,
  className,
}: ActionBarProps) {
  const count = actions.length;
  const compact = count >= 3;
  return (
    <div
      className={cn('safe-bottom mt-3 grid gap-2', className)}
      style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
    >
      {actions.map((kind) => {
        const size = kind === 'call' ? callSize : kind === 'raise' ? raiseSize : undefined;
        // Always keep the kind prefix ("콜" / "레이즈") so the label
        // matches what the result screen shows. In compact mode (3+
        // buttons) drop the "BB" suffix so "콜 2.5" + "레이즈 9"
        // still fit on a 360px viewport.
        const label =
          size !== undefined
            ? compact
              ? `${LABELS[kind]} ${size}`
              : `${LABELS[kind]} ${size}BB`
            : LABELS[kind];
        return (
          <RippleActionButton
            key={kind}
            kind={kind}
            label={label}
            compact={compact}
            disabled={disabled}
            onClick={() => onAnswer(kind)}
          />
        );
      })}
    </div>
  );
}
