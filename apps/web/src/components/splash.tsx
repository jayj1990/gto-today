'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Logo } from '@gto/ui';

const SESSION_KEY = 'gto.splash.seen';

/**
 * Full-screen splash. Uses the shared Logo component — the full wordmark
 * was migrated to HTML so the middle dot no longer drifts across faces.
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
    }, 1500);
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
          className="bg-felt-gradient fixed inset-0 z-50"
          aria-hidden
        >
          <div className="grid h-full w-full place-items-center">
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 6 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              {/* G3 chip logo — the canonical brand mark */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/mark-g3-transparent.png"
                alt=""
                width={140}
                height={140}
                style={{
                  width: 140,
                  height: 140,
                  objectFit: 'contain',
                  filter:
                    'drop-shadow(0 4px 18px color-mix(in oklab, var(--color-gold) 35%, transparent))',
                }}
              />
              <h1 className="text-ivory mt-6">
                <Logo variant="full" width={200} title="gto.today" />
              </h1>
              <p className="mt-3 text-center font-mono text-[11px] tracking-[0.2em] text-[color:var(--color-gold)]">
                매일 쌓이는 실력, 후회 없는 액션
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
