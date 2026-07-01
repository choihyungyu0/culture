"use client";

import { motion, useReducedMotion } from "framer-motion";
import { problem } from "@/lib/content";

const EASE = [0.16, 1, 0.3, 1] as const;
const S = problem.series;

/* viewBox geometry */
const W = 640;
const H = 320;
const PAD = { l: 20, r: 20, t: 26, b: 40 };
const plotW = W - PAD.l - PAD.r;
const plotH = H - PAD.t - PAD.b;

const xOf = (i: number) => PAD.l + (i / (S.years.length - 1)) * plotW;
// support: relative index domain [95,185]
const supY = (v: number) => PAD.t + (1 - (v - 95) / (185 - 95)) * plotH;
// gap: absolute sacrifice-index domain [0,100] → sits high & flat
const gapY = (v: number) => PAD.t + (1 - v / 100) * plotH;

const linePath = (vals: readonly number[], y: (v: number) => number) =>
  vals.map((v, i) => `${i === 0 ? "M" : "L"} ${xOf(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");

const areaPath = (vals: readonly number[], y: (v: number) => number) =>
  `${linePath(vals, y)} L ${xOf(vals.length - 1).toFixed(1)} ${PAD.t + plotH} L ${xOf(0).toFixed(1)} ${PAD.t + plotH} Z`;

export function ProblemGapChart() {
  const reduce = useReducedMotion();
  const supportLine = linePath(S.support, supY);
  const supportArea = areaPath(S.support, supY);
  const gapLine = linePath(S.gapRural, gapY);

  const draw = reduce
    ? {}
    : {
        initial: { pathLength: 0, opacity: 0 },
        whileInView: { pathLength: 1, opacity: 1 },
        viewport: { once: true, margin: "-80px" },
      };

  const supEnd = S.support[S.support.length - 1];
  const growth = Math.round((supEnd / S.support[0] - 1) * 100);

  return (
    <figure className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 lg:p-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <span className="kicker text-rose">{S.kicker}</span>
        <span className="badge-exploratory">탐색용 · 예시</span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`연도별 ${S.supportLabel}는 6년간 약 ${growth}% 증가했으나 ${S.gapLabel}는 거의 변하지 않았음을 보여주는 그래프`}
      >
        <defs>
          <linearGradient id="pg-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff4fa0" />
            <stop offset="100%" stopColor="#b47cf0" />
          </linearGradient>
          <linearGradient id="pg-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b47cf0" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#ff4fa0" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* faint baseline grid */}
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={PAD.l}
            x2={W - PAD.r}
            y1={PAD.t + t * plotH}
            y2={PAD.t + t * plotH}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}

        {/* year labels */}
        {S.years.map((yr, i) => (
          <text
            key={yr}
            x={xOf(i)}
            y={H - 14}
            textAnchor="middle"
            fontSize="12"
            className="font-mono"
            fill="rgba(255,255,255,0.4)"
          >
            {yr}
          </text>
        ))}

        {/* support area */}
        <motion.path
          d={supportArea}
          fill="url(#pg-area)"
          initial={reduce ? undefined : { opacity: 0 }}
          whileInView={reduce ? undefined : { opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
        />

        {/* gap line — flat & high, heat, dashed */}
        <motion.path
          d={gapLine}
          fill="none"
          stroke="#ff7a36"
          strokeWidth="2.5"
          strokeDasharray="6 5"
          strokeLinecap="round"
          transition={{ duration: 1.4, ease: EASE }}
          {...draw}
        />

        {/* support line — rising, rose→violet */}
        <motion.path
          d={supportLine}
          fill="none"
          stroke="url(#pg-line)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          transition={{ duration: 1.6, ease: EASE }}
          {...draw}
        />

        {/* endpoint dots + callouts */}
        <motion.g
          initial={reduce ? undefined : { opacity: 0 }}
          whileInView={reduce ? undefined : { opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <circle cx={xOf(5)} cy={supY(supEnd)} r="5" fill="#b47cf0" />
          <text
            x={xOf(5) - 8}
            y={supY(supEnd) - 10}
            textAnchor="end"
            fontSize="15"
            fontWeight="700"
            fill="#fff"
          >
            +{growth}%
          </text>
          <circle cx={xOf(5)} cy={gapY(S.gapRural[5])} r="5" fill="#ff7a36" />
          <text
            x={xOf(5) - 8}
            y={gapY(S.gapRural[5]) - 10}
            textAnchor="end"
            fontSize="13"
            fontWeight="600"
            fill="#ff7a36"
          >
            거의 그대로
          </text>
        </motion.g>
      </svg>

      {/* legend */}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/60">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "linear-gradient(90deg,#ff4fa0,#b47cf0)" }} />
          {S.supportLabel}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-4 rounded-full" style={{ background: "#ff7a36" }} />
          {S.gapLabel}
        </span>
      </div>

      <figcaption className="mt-4 text-sm leading-relaxed text-white/70">
        {S.caption}
      </figcaption>
    </figure>
  );
}
