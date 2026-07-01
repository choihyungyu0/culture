"use client";

import Link from "next/link";
import { Reveal, RevealLines } from "./reveal";
import { concept } from "@/lib/content";

const NUM_COLOR = ["var(--rose)", "var(--violet-soft)", "var(--mint)"];

export function Concept() {
  return (
    <section
      id="concept"
      className="relative overflow-hidden bg-ink text-white scroll-mt-20"
    >
      <div
        aria-hidden
        className="aurora aurora-drift pointer-events-none absolute inset-0 opacity-25"
      />
      <div className="relative mx-auto max-w-[100rem] px-6 py-24 lg:px-10 lg:py-32">
        <div className="max-w-3xl">
          <Reveal>
            <span className="kicker text-rose">{concept.kicker}</span>
          </Reveal>
          <RevealLines
            as="h2"
            text={concept.title}
            className="display mt-4 block text-[clamp(2rem,4.5vw,3.75rem)]"
          />
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
              {concept.lead}
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
          {concept.layers.map((l, i) => (
            <Reveal key={l.no} delay={i * 0.1} className="bg-ink">
              <div className="flex h-full flex-col p-8 lg:p-9">
                <span
                  className="font-display text-6xl font-bold leading-none"
                  style={{ color: NUM_COLOR[i] }}
                >
                  {l.no}
                </span>
                <h3 className="mt-8 text-xl font-bold tracking-tight">
                  {l.name}
                </h3>
                <p
                  className="mt-1 font-mono text-xs uppercase tracking-widest"
                  style={{ color: NUM_COLOR[i] }}
                >
                  {l.tagline}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-white/65">
                  {l.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/twin"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.03]"
            >
              트윈 체험하기
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              href="/data"
              className="group inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              <span className="relative">
                데이터·검증 보기
                <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-white/60 transition-transform duration-300 group-hover:scale-x-100" />
              </span>
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
