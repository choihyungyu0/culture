"use client";

import { Section, SectionHeader } from "./section";
import { Reveal } from "./reveal";
import { impact } from "@/lib/content";

export function Impact() {
  return (
    <Section id="impact">
      <SectionHeader
        kicker={impact.kicker}
        title={impact.title}
        description={impact.lead}
      />

      {/* effects */}
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {impact.effects.map((e, i) => (
          <Reveal key={e.title} delay={i * 0.08}>
            <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-7">
              <span className="font-mono text-sm text-brand">
                0{i + 1}
              </span>
              <h3 className="mt-4 text-lg font-bold tracking-tight">
                {e.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {e.desc}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* roadmap */}
      <Reveal>
        <div className="mt-16">
          <div className="kicker text-brand">Roadmap · P0 → P3</div>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {impact.roadmap.map((p, i) => {
              const current = i === 0;
              return (
                <div
                  key={p.phase}
                  className={
                    "relative rounded-2xl border p-6 " +
                    (current
                      ? "border-transparent bg-ink text-white"
                      : "border-border bg-card")
                  }
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        "font-display text-2xl font-bold " +
                        (current ? "text-rose" : "text-foreground")
                      }
                    >
                      {p.phase}
                    </span>
                    {current && (
                      <span className="rounded-full bg-rose px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-widest text-white">
                        현재
                      </span>
                    )}
                  </div>
                  <h4 className="mt-4 text-sm font-bold leading-snug">
                    {p.title}
                  </h4>
                  <p
                    className={
                      "mt-2 text-xs leading-relaxed " +
                      (current ? "text-white/60" : "text-muted-foreground")
                    }
                  >
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
