import type { HTMLAttributes } from 'react';
import { cn } from './cn';

export interface ChipProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  tone?: 'gold' | 'felt' | 'raise' | 'call';
}

const toneCls: Record<NonNullable<ChipProps['tone']>, string> = {
  gold: 'bg-[var(--gradient-gold)] text-noir ring-gold-deep',
  felt: 'bg-felt text-ivory ring-felt-deep',
  raise: 'bg-raise text-ivory ring-raise/70',
  call: 'bg-call text-ivory ring-call/70',
};

export function Chip({ value, tone = 'gold', className, ...rest }: ChipProps) {
  return (
    <div
      role="img"
      aria-label={`chip ${value}`}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-full font-mono text-[13px] font-semibold',
        'ring-2 ring-inset shadow-[var(--shadow-card)]',
        toneCls[tone],
        className,
      )}
      {...rest}
    >
      {value}
    </div>
  );
}
