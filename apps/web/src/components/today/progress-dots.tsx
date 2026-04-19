import { cn } from '@gto/ui';

export interface ProgressDotsProps {
  total: number;
  done: number;
  correct?: number;
  className?: string;
}

/**
 * 10-dot progress row. Filled dots use the current answer color:
 *   gold = sharp (correct), info = acceptable/mixed, raise = wrong, graphite = remaining.
 * For Phase 4a we only distinguish done vs remaining. Breakdown comes in 4b.
 */
export function ProgressDots({ total, done, correct, className }: ProgressDotsProps) {
  return (
    <ul
      className={cn('flex items-center gap-1.5', className)}
      aria-label={`${done}/${total} 완료${correct !== undefined ? ` · 정답 ${correct}` : ''}`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < done;
        return (
          <li
            key={i}
            aria-hidden
            className={cn(
              'h-2 w-2 rounded-full transition-colors duration-[var(--dur-base)]',
              filled ? 'bg-[color:var(--color-accent)]' : 'bg-[color:var(--color-border)]',
            )}
          />
        );
      })}
    </ul>
  );
}
