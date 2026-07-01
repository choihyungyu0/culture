"use client";

import { Reveal, RevealLines } from "./reveal";
import { ScrollRevealText } from "./scroll-reveal-text";
import { dna } from "@/lib/content";

export function DesignDna() {
  return (
    <section
      id="dna"
      className="relative overflow-hidden bg-ink text-white scroll-mt-20"
    >
      <div
        aria-hidden
        className="aurora aurora-drift pointer-events-none absolute inset-0 opacity-30"
      />
      <div className="relative mx-auto max-w-[100rem] px-6 py-24 lg:px-10 lg:py-32">
        <Reveal>
          <span className="kicker text-rose">{dna.kicker}</span>
        </Reveal>
        <RevealLines
          as="h2"
          text={dna.title}
          className="display mt-4 block text-[clamp(2.4rem,6vw,5rem)]"
        />

        <div className="mt-10 max-w-3xl">
          <ScrollRevealText
            text={dna.body}
            className="text-xl leading-relaxed sm:text-2xl"
          />
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {dna.sources.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.06} className="bg-ink">
              <div className="flex h-full flex-col justify-between gap-6 p-6">
                <span className="font-mono text-xs text-white/40">
                  0{i + 1}
                </span>
                <div>
                  <div className="font-display text-lg font-bold leading-tight">
                    {s.name}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-white/55">
                    {s.note}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mt-8 max-w-2xl text-sm leading-relaxed text-white/45">
            {dna.disclaimer}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
