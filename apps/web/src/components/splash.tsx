'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const SESSION_KEY = 'gto.splash.seen';

/**
 * Full-screen splash. Wordmark is drawn in plain HTML (not the SVG Logo
 * component) so every line sits on the same horizontal axis — prevents
 * the off-center rendering we saw when using the Logo whose viewBox
 * left-aligned its text content.
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
          className="fixed inset-0 z-50 bg-felt-gradient"
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
                  filter: 'drop-shadow(0 4px 18px rgba(212,175,55,0.35))',
                }}
              />
              <h1
                className="mt-6 flex items-baseline gap-1 font-display leading-none tracking-[-0.02em]"
                style={{ fontSize: 36 }}
              >
                <span className="font-bold uppercase text-ivory">GTO</span>
                <span
                  aria-hidden
                  className="inline-block h-[6px] w-[6px] rounded-full bg-[color:var(--color-gold)]"
                  style={{ transform: 'translateY(-0.35em)' }}
                />
                <span className="font-light text-ivory/90">today</span>
              </h1>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-gold)]">
                매일 · 한 걸음
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
