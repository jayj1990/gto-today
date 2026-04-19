'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Logo } from '@gto/ui';

const SESSION_KEY = 'gto.splash.seen';

/**
 * Full-screen branded splash, centered with place-items-center so the
 * content lands at the exact middle of the viewport regardless of
 * iOS safe-area or scroll offset.
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
          className="fixed inset-0 z-50 grid place-items-center bg-felt-gradient"
          style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
          aria-hidden
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-3 text-center"
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
