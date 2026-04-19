export type ThemeMode = 'dark' | 'light' | 'tonight' | 'auto';

export const THEME_STORAGE_KEY = 'gto.theme';

/**
 * Derive the concrete theme to apply given a mode and a Date.
 * Tonight is 22:00–04:59 local; daytime 06:00–17:59 = light; evening fallback = dark.
 */
export function resolveTheme(mode: ThemeMode, now: Date = new Date()): 'dark' | 'light' | 'tonight' {
  if (mode !== 'auto') return mode;
  const hour = now.getHours();
  if (hour >= 22 || hour < 5) return 'tonight';
  if (hour >= 6 && hour < 18) return 'light';
  return 'dark';
}

/**
 * Inline script body (stringified) that runs before hydration so there is no
 * theme flash on first paint. Exported for use in <Script id="theme-init" …>.
 */
export const themeInitScript = `
(function(){try{
  var m=localStorage.getItem('${THEME_STORAGE_KEY}')||'auto';
  var h=new Date().getHours(), t=m;
  if(m==='auto'){ t=(h>=22||h<5)?'tonight':(h>=6&&h<18)?'light':'dark'; }
  document.documentElement.setAttribute('data-theme',t);
  document.documentElement.style.colorScheme=(t==='light'?'light':'dark');
}catch(e){}})();
`.trim();
