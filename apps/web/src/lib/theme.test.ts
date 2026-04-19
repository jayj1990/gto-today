import { describe, expect, it } from 'vitest';
import { resolveTheme } from './theme';

describe('resolveTheme', () => {
  it('passes through explicit modes', () => {
    expect(resolveTheme('dark')).toBe('dark');
    expect(resolveTheme('light')).toBe('light');
    expect(resolveTheme('tonight')).toBe('tonight');
  });

  it('auto → tonight at 23:00', () => {
    expect(resolveTheme('auto', new Date('2026-04-19T23:00:00'))).toBe('tonight');
  });

  it('auto → tonight at 03:00', () => {
    expect(resolveTheme('auto', new Date('2026-04-19T03:00:00'))).toBe('tonight');
  });

  it('auto → light at 10:00', () => {
    expect(resolveTheme('auto', new Date('2026-04-19T10:00:00'))).toBe('light');
  });

  it('auto → dark at 19:00', () => {
    expect(resolveTheme('auto', new Date('2026-04-19T19:00:00'))).toBe('dark');
  });
});
