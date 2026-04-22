'use client';

import { useCallback, useRef, useState } from 'react';

/**
 * Click/tap ripple — returns props to spread on a button host + a
 * node to render inside it. The host must have `position: relative;
 * overflow: hidden;` (or the shared `.ripple-host` class) so the
 * expanding disc stays clipped to the button's rounded rectangle.
 *
 * The effect is CSS-only (gto-ripple keyframes in globals.css); this
 * hook just toggles a key each tap so the animation restarts.
 *
 *   const { onPointerDown, node } = useRipple();
 *   <button className="ripple-host" onPointerDown={onPointerDown}>
 *     <span className="relative z-10">Label</span>
 *     {node}
 *   </button>
 */
export function useRipple() {
  const [ripples, setRipples] = useState<number[]>([]);
  const counter = useRef(0);

  const onPointerDown = useCallback(() => {
    const id = counter.current++;
    setRipples((arr) => [...arr, id]);
    // Clean up after the CSS animation finishes (460ms + safety margin).
    window.setTimeout(() => {
      setRipples((arr) => arr.filter((x) => x !== id));
    }, 520);
  }, []);

  const node = ripples.map((id) => <span key={id} className="ripple-ink" />);

  return { onPointerDown, node };
}
