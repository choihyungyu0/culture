"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion, type AnimationPlaybackControls } from "framer-motion";

/**
 * Counts a number up from 0 → value when it scrolls into view (once).
 * Uses a self-managed IntersectionObserver so each mount re-arms cleanly
 * (avoids framer once-viewport being consumed by StrictMode double-mount).
 * Respects reduced-motion (shows the final value immediately).
 */
export function CountUp({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.5,
  className,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    const el = ref.current;
    if (!el) return;
    let controls: AnimationPlaybackControls | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          io.disconnect();
          controls = animate(0, value, {
            duration,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (v) => setDisplay(v),
          });
        }
      },
      { rootMargin: "0px 0px -60px 0px", threshold: 0 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      controls?.stop();
    };
  }, [value, reduce, duration]);

  return (
    <span ref={ref} title={String(value)} className={className}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
