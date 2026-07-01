"use client";

import { Section, SectionHeader } from "./section";
import { Reveal } from "./reveal";
import { data } from "@/lib/content";

const STEP_COLOR = ["var(--mint)", "var(--rose)", "var(--violet-soft)"];

export function DataLayer() {
  return (
    <Section id="data">
      <SectionHeader
        kicker={data.kicker}
        title={data.title}
        description={data.lead}
      />

      {/* hierarchy: 공급 → 경험 → 행동 */}
      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {data.hierarchy.map((h, i) => (
          <Reveal key={h.step} delay={i * 0.08}>
            <div className="relative h-full rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm font-bold text-ink"
                  style={{ background: STEP_COLOR[i] }}
                >
                  {i + 1}
                </span>
                <span className="text-lg font-bold tracking-tight">
                  {h.step}
                </span>
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {h.title}
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {h.desc}
              </p>
              {i < data.hierarchy.length - 1 && (
                <span
                  aria-hidden
                  className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-xl text-muted-foreground/50 md:block"
                >
                  →
                </span>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      {/* datasets */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {data.groups.map((g, gi) => (
          <Reveal key={g.label} delay={gi * 0.08}>
            <div className="h-full rounded-2xl border border-border bg-card p-7 lg:p-8">
              <div className="kicker text-brand">{g.label}</div>
              <ul className="mt-5 flex flex-col divide-y divide-border">
                {g.items.map((it) => (
                  <li
                    key={it.name}
                    className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <span className="font-medium">{it.name}</span>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {it.role}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <p className="mt-6 rounded-xl bg-secondary px-5 py-4 text-sm leading-relaxed text-secondary-foreground/80">
          {data.note}
        </p>
      </Reveal>
    </Section>
  );
}
