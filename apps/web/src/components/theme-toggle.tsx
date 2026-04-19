'use client';

import { useCallback, useEffect, useState } from 'react';
import { Moon, Sun, Sparkles, CircleDot } from 'lucide-react';
import { resolveTheme, THEME_STORAGE_KEY, type ThemeMode } from '@/lib/theme';
import { cn } from '@gto/ui';

const MODES: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'tonight', label: 'Tonight', icon: Sparkles },
  { value: 'auto', label: 'Auto', icon: CircleDot },
];

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('auto');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null) ?? 'auto';
    setMode(stored);
    setMounted(true);
  }, []);

  const applyMode = useCallback((next: ThemeMode) => {
    setMode(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    const resolved = resolveTheme(next);
    const root = document.documentElement;
    root.setAttribute('data-theme', resolved);
    root.style.colorScheme = resolved === 'light' ? 'light' : 'dark';
  }, []);

  if (!mounted) {
    return <div aria-hidden className="h-9 w-[9.5rem]" />;
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex items-center rounded-full border-hair surface-raised p-0.5"
    >
      {MODES.map(({ value, label, icon: Icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            role="radio"
            aria-checked={active}
            aria-label={`${label} theme`}
            type="button"
            onClick={() => applyMode(value)}
            className={cn(
              'flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[13px] transition-colors',
              active
                ? 'bg-[var(--color-accent)] text-noir font-semibold'
                : 'text-fg-muted hover:text-fg',
            )}
          >
            <Icon aria-hidden size={14} strokeWidth={1.75} />
            <span className="sr-only sm:not-sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
