'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Logo } from '@gto/ui';

const SESSION_KEY = 'gto.splash.seen';

/**
 * Brief branded splash shown once per session on first landing visit.
 * Auto-dismisses after 1.4s; users who've already seen it today skip it.
 * Session-scoped (sessionStorage) so it reappears once per browsing session
 * but isn't a constant friction.
 */
export function Splash() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      return;
    }
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        /* ignore */
      }
    }, 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-felt-gradient"
          aria-hidden
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-3"
          >
            <Logo variant="mark" width={88} height={88} />
            <Logo variant="full" width={180} className="text-ivory" />
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-gold)]">
              GTO · Today
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
