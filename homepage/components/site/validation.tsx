"use client";

import { Reveal, RevealLines } from "./reveal";
import { validation } from "@/lib/content";

export function Validation() {
  return (
    <section
      id="validation"
      className="relative overflow-hidden bg-ink text-white scroll-mt-20"
    >
      <div className="grain-local absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-[100rem] px-6 py-24 lg:px-10 lg:py-32">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <Reveal>
              <span className="kicker text-rose">{validation.kicker}</span>
            </Reveal>
            <RevealLines
              as="h2"
              text={validation.title}
              className="display mt-4 block text-[clamp(2rem,4.5vw,3.75rem)]"
            />
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
                {validation.lead}
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <span className="inline-flex items-center gap-2 rounded-full bg-mint/10 px-4 py-1.5 font-mono text-sm text-mint ring-1 ring-mint/30">
              <span className="h-1.5 w-1.5 rounded-full bg-mint" aria-hidden />
              공개데이터 실증
            </span>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {validation.methods.map((m, i) => (
            <Reveal key={m.no} delay={i * 0.08}>
              <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-7 lg:p-8">
                <span className="font-mono text-sm text-rose">{m.no}</span>
                <h3 className="mt-4 text-xl font-bold tracking-tight">
                  {m.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  {m.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* key empirical findings (국민문화예술활동조사 실증) */}
        <div className="mt-16">
          <Reveal>
            <span className="kicker text-mint">{validation.findings.kicker}</span>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-3 max-w-xl text-lg leading-relaxed text-white/70">
              {validation.findings.lead}
            </p>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {validation.findings.items.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <div className="flex h-full flex-col rounded-2xl border border-mint/20 bg-mint/[0.04] p-7">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-4xl font-bold tracking-tight text-mint">
                      {f.stat}
                    </span>
                    <span className="font-mono text-xs text-white/40">
                      {f.unit}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold tracking-tight">
                    {f.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">
                    {f.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="mt-6 text-xs leading-relaxed text-white/40">
              {validation.findings.note}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
