"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { brand, hero } from "@/lib/content";
import { useUiStore } from "@/store/useStore";
import { Magnetic } from "./magnetic";

const EASE = [0.16, 1, 0.3, 1] as const;

const TITLE_LINES: ReactNode[] = [
  <>예산을 쓰기 전에,</>,
  <>
    결과를 <span className="shimmer">본다</span>
  </>,
];

const VIDEO_SRC = "/hero-choreos.mp4";
const POSTER_SRC = "/hero-choreos-poster.jpg";

export function Hero() {
  const reduce = useReducedMotion() ?? false;
  const entered = useUiStore((s) => s.entered);
  const show = reduce || entered;

  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  // reveal + play control. readyState check catches the case where the video
  // fires canplay before React hydration attaches the listener.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || reduce) return;
    v.muted = true;
    const markReady = () => setVideoReady(true);
    if (v.readyState >= 2) markReady();
    v.addEventListener("loadeddata", markReady);
    v.addEventListener("playing", markReady);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.1 }
    );
    io.observe(v);
    return () => {
      v.removeEventListener("loadeddata", markReady);
      v.removeEventListener("playing", markReady);
      io.disconnect();
    };
  }, [reduce]);

  function go(href: string) {
    if (href.startsWith("/")) {
      router.push(href);
      return;
    }
    document.querySelector(href)?.scrollIntoView();
  }

  const rise: Variants = {
    hidden: { opacity: 0, y: 32 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.95, delay: 0.1 + i * 0.11, ease: EASE },
    }),
  };
  const anim = (i: number) => ({
    custom: i,
    variants: rise,
    initial: "hidden",
    animate: show ? "show" : "hidden",
  });

  return (
    <section
      id="top"
      className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-ink text-white"
    >
      {/* base: instant on-brand aurora (fallback while video buffers).
          Stops animating + fades out once the opaque video covers it. */}
      <div
        aria-hidden
        className={
          "aurora absolute inset-0 transition-opacity duration-1000 " +
          (videoReady && !reduce ? "opacity-0" : "aurora-drift opacity-70")
        }
      />

      {/* CHOREOS art video — the "경험의 얼굴" first impression */}
      {reduce ? (
        <img
          src={POSTER_SRC}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-60"
          style={{ filter: "brightness(0.55) contrast(1.05)" }}
        />
      ) : (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
          style={{
            filter: "brightness(0.55) contrast(1.05) saturate(1.06)",
            opacity: videoReady ? 1 : 0,
          }}
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          onCanPlay={() => setVideoReady(true)}
        />
      )}

      {/* rose/violet duotone tint (normal blend — cheaper than mix-blend over video) */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(120deg, rgba(255,79,160,0.16), rgba(138,75,216,0.2))",
        }}
      />
      {/* legibility: lift the lower-left where the copy sits */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/50"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(125%_95%_at_12%_88%,rgba(22,18,26,0.72),transparent_62%)]"
      />

      <div className="relative z-10 mx-auto flex h-full max-w-[100rem] flex-col px-6 lg:px-10">
        {/* top hairline row */}
        <motion.div
          {...anim(0)}
          className="flex items-center justify-between pt-28 lg:pt-32"
        >
          <span className="kicker text-white/55">{hero.kicker}</span>
          <span className="kicker hidden text-white/40 sm:block">
            {brand.location}
          </span>
        </motion.div>

        {/* headline block, lower third */}
        <div className="mt-auto max-w-5xl pb-24 lg:pb-28">
          <h1
            className="display text-[clamp(2.6rem,7.5vw,7rem)]"
            style={{ lineHeight: 1.03 }}
          >
            {TITLE_LINES.map((line, i) => (
              <span key={i} className="block overflow-hidden pb-[0.12em]">
                <motion.span className="block" {...anim(1 + i)}>
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            {...anim(3)}
            className="font-display mt-5 text-xl text-white/60 sm:text-2xl"
          >
            {hero.accent}
          </motion.p>

          <motion.p
            {...anim(4)}
            className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg"
          >
            {hero.subcopy}
          </motion.p>

          <motion.div
            {...anim(5)}
            className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4"
          >
            <Magnetic className="inline-block">
              <button
                type="button"
                onClick={() => go(hero.primary.href)}
                className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.03]"
              >
                {hero.primary.label}
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            </Magnetic>
            <button
              type="button"
              onClick={() => go(hero.secondary.href)}
              className="group inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              <span className="relative">
                {hero.secondary.label}
                <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-white/60 transition-transform duration-300 group-hover:scale-x-100" />
              </span>
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* scroll cue */}
      <motion.button
        type="button"
        onClick={() => go("#problem")}
        aria-label="아래로 스크롤"
        {...anim(6)}
        className="group absolute bottom-7 right-6 z-10 hidden items-center gap-3 text-white/45 transition-colors hover:text-white sm:flex lg:right-10"
      >
        <span className="kicker">Scroll</span>
        <span className="relative block h-10 w-px overflow-hidden bg-white/20">
          <span className="scroll-cue absolute left-0 top-0 block h-1/2 w-full bg-white" />
        </span>
      </motion.button>
    </section>
  );
}
