'use client';

import type { CSSProperties } from 'react';
import { cn } from '@gto/ui';

export interface SkeletonProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  style?: CSSProperties;
}

const ROUND: Record<NonNullable<SkeletonProps['rounded']>, string> = {
  sm: '4px',
  md: '8px',
  lg: '14px',
  full: '9999px',
};

export function Skeleton({
  className,
  width = '100%',
  height = 14,
  rounded = 'md',
  style,
}: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn('skeleton-shimmer', className)}
      style={{
        width,
        height,
        borderRadius: ROUND[rounded],
        ...style,
      }}
    />
  );
}

/** Composed skeleton for the preflop/postflop training card — board
 *  area + hero cards + action bar. Used while daily items load. */
export function HandCardSkeleton() {
  return (
    <div className="border-hair surface mt-6 rounded-[var(--radius-panel)] p-5">
      <div className="flex items-center justify-between gap-3">
        <Skeleton width={90} height={14} />
        <div className="flex gap-1.5">
          <Skeleton width={32} height={18} rounded="full" />
          <Skeleton width={40} height={18} rounded="full" />
          <Skeleton width={52} height={18} rounded="full" />
        </div>
      </div>
      <Skeleton className="mt-3" width={160} height={10} />

      {/* Felt ellipse placeholder */}
      <div className="relative mt-4 overflow-hidden rounded-[120px/88px] border border-[color:var(--color-border)]">
        <div
          className="skeleton-shimmer"
          style={{
            width: '100%',
            aspectRatio: '10 / 14',
            borderRadius: '120px / 88px',
          }}
        />
      </div>

      <Skeleton className="mx-auto mt-4" width={240} height={12} />
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Skeleton height={44} rounded="md" />
        <Skeleton height={44} rounded="md" />
      </div>
    </div>
  );
}
