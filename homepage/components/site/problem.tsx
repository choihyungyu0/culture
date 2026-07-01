"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Reveal, RevealLines } from "./reveal";
import { ScrollRevealText } from "./scroll-reveal-text";
import { ProblemGapChart } from "./problem-gap-chart";
import { CountUp } from "./count-up";
import { Tilt } from "./tilt";
import { problem } from "@/lib/content";
import { REGIONS } from "@/lib/twin-data";

const byDensity = [...REGIONS].sort(
  (a, b) => b.density_per_100k - a.density_per_100k
);
const top = byDensity[0];
const bottom = byDensity[byDensity.length - 1];
const ratio = top.density_per_100k / bottom.density_per_100k;
const structural = REGIONS.filter((r) => r.diagnosisType === "structural").length;

const STATS = [
  {
    value: ratio,
    decimals: 1,
    suffix: "배",
    label: `최고 ↔ 최저 지역 공급 밀도 격차 (${top.code}·${bottom.code})`,
    color: "var(--rose)",
  },
  {
    value: bottom.gap_index,
    decimals: 0,
    suffix: "",
    label: `최고 사각지대지수 · ${bottom.name}`,
    color: "var(--heat)",
  },
  {
    value: structural,
    decimals: 0,
    suffix: "개",
    label: "공급·경험이 함께 낮은 구조적 사각지대 시·도",
    color: "var(--violet-soft)",
  },
];

const ACCENT = ["var(--heat)", "var(--violet-soft)"];

export function Problem() {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Parallax via a transform on the (unfiltered) wrapper + a cheap opacity
  // shift. The blur is STATIC (rasterized once) — animating blur per scroll
  // frame was the main scroll-jank source, so it's intentionally not animated.
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "10%"]);
  const bgOpacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.85, 1],
    [0.12, 0.34, 0.34, 0.12]
  );

  return (
    <section
      ref={ref}
      id="problem"
      className="relative overflow-hidden bg-ink text-white scroll-mt-20"
    >
      {/* cinematic duotone photo backdrop (parallax + blur→focus) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ y: reduce ? 0 : bgY }}
      >
        <motion.img
          src={problem.photo.src}
          alt=""
          aria-hidden
          className="h-full w-full scale-110 object-cover"
          style={{
            filter: "grayscale(1) contrast(1.06) blur(4px)",
            opacity: reduce ? 0.24 : bgOpacity,
          }}
        />
        {/* rose/violet duotone tint */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(120deg, rgba(255,79,160,0.3), rgba(138,75,216,0.3))",
            mixBlendMode: "overlay",
          }}
        />
        {/* darken to ink for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/75 via-ink/80 to-ink" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_8%,transparent,rgba(22,18,26,0.65))]" />
      </motion.div>
      <div className="grain-local absolute inset-0" aria-hidden />

      <div className="relative mx-auto max-w-[100rem] px-6 py-24 lg:px-10 lg:py-32">
        {/* header */}
        <div className="max-w-3xl">
          <Reveal>
            <span className="kicker text-rose">{problem.kicker}</span>
          </Reveal>
          <RevealLines
            as="h2"
            text={problem.title}
            className="display mt-4 block text-[clamp(2rem,5vw,4rem)]"
          />
          <div className="mt-6 max-w-xl">
            <ScrollRevealText
              text={problem.lead}
              className="text-lg leading-relaxed text-white/80"
            />
          </div>
        </div>

        {/* signature data-visual */}
        <Reveal className="mt-14">
          <ProblemGapChart />
        </Reveal>

        {/* count-up stats */}
        <div className="mt-12 grid gap-8 border-y border-white/10 py-8 sm:grid-cols-3">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div>
                <div
                  className="font-display text-5xl font-bold tracking-tight sm:text-6xl"
                  style={{ color: s.color }}
                >
                  <CountUp value={s.value} decimals={s.decimals} suffix={s.suffix} />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* failure-type cards with 3D tilt */}
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {problem.types.map((t, i) => (
            <Reveal key={t.tag} delay={i * 0.08}>
              <Tilt className="h-full">
                <div
                  className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-7 lg:p-8"
                  style={{ borderTopColor: ACCENT[i], borderTopWidth: 3 }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-40 blur-3xl"
                    style={{ background: ACCENT[i] }}
                  />
                  <div className="relative flex items-center justify-between">
                    <span className="kicker text-white/40">{t.tag}</span>
                    <span
                      className="font-mono text-sm font-bold"
                      style={{ color: ACCENT[i] }}
                    >
                      {t.signal}
                    </span>
                  </div>
                  <h3 className="relative mt-5 text-2xl font-bold tracking-tight">
                    {t.title}
                  </h3>
                  <p className="relative mt-3 leading-relaxed text-white/65">
                    {t.desc}
                  </p>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mt-6 text-xs leading-relaxed text-white/40">
            {problem.note}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
