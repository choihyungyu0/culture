"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Reveal } from "../reveal";
import { RevealLines } from "../reveal";
import { NATIONAL } from "@/lib/twin-data";
import { TwinMap3D } from "./twin-map-3d";

// MapLibre GL (~200KB) — lazy so it only loads when the twin page is opened.
const TwinMapStreet = dynamic(
  () => import("./twin-map-street").then((m) => m.TwinMapStreet),
  {
    ssr: false,
    loading: () => <div className="h-full w-full rounded-xl bg-ink" aria-hidden />,
  }
);

import { TwinPanel } from "./twin-panel";
import { TwinControls } from "./twin-controls";
import { TwinAsk } from "./twin-ask";
import { ask } from "@/lib/content";

type MapView = "street" | "3d";

export function TwinSection() {
  const [view, setView] = useState<MapView>("street");
  return (
    <section
      id="twin"
      className="relative overflow-hidden bg-ink text-white scroll-mt-20"
    >
      <div
        aria-hidden
        className="aurora aurora-drift pointer-events-none absolute inset-0 opacity-40"
      />
      <div className="grain-local absolute inset-0" aria-hidden />

      <div className="relative mx-auto max-w-[100rem] px-6 py-24 lg:px-10 lg:py-32">
        {/* header */}
        <div className="max-w-3xl">
          <Reveal>
            <span className="kicker text-rose">The Twin · 03</span>
          </Reveal>
          <RevealLines
            as="h2"
            text={"지도 위에서\n예산을 실험합니다"}
            className="display mt-4 block text-[clamp(2rem,4.5vw,3.75rem)]"
          />
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
              17개 시·도를 빛의 밀도 노드로 봅니다. 모드를 바꿔 사각지대를 드러내고,
              강사·프로그램을 더해 격차가 어떻게 줄어드는지 실행 전에 시뮬레이션하세요.
            </p>
          </Reveal>
        </div>

        {/* national summary */}
        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-y border-white/10 py-5">
            <Stat label="전국 평균 밀도" value={`${NATIONAL.avgDensity}`} unit="/10만명" />
            <Stat label="시·도" value="17" unit="개" />
            <Stat
              label="최고 사각지대"
              value={NATIONAL.worst.code}
              unit={`지수 ${NATIONAL.worst.gap_index}`}
            />
            <Stat
              label="최저 사각지대"
              value={NATIONAL.best.code}
              unit={`지수 ${NATIONAL.best.gap_index}`}
            />
          </div>
        </Reveal>

        {/* main grid */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
          {/* map */}
          <Reveal className="min-w-0">
            <div className="instrument-panel relative flex flex-col rounded-2xl p-5 lg:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="kicker text-white/40">
                  {view === "3d" ? "Satellite 3D" : "Dark Street Map"}
                </span>
                <div className="flex gap-1 rounded-full border border-white/10 bg-white/5 p-1">
                  {(["street", "3d"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setView(v)}
                      aria-pressed={view === v}
                      className={
                        "rounded-full px-4 py-1.5 text-xs font-medium transition-colors " +
                        (view === v
                          ? "bg-white text-ink"
                          : "text-white/60 hover:text-white")
                      }
                    >
                      {v === "street" ? "다크 지도" : "3D 실사"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative mx-auto aspect-[3/4] w-full max-w-[520px] flex-1">
                {view === "3d" ? <TwinMap3D /> : <TwinMapStreet />}
              </div>
              <Legend view={view} />
            </div>
          </Reveal>

          {/* panel + controls */}
          <div className="flex min-w-0 flex-col gap-6">
            <Reveal delay={0.05}>
              <TwinPanel />
            </Reveal>
            <Reveal delay={0.1}>
              <TwinControls />
            </Reveal>
          </div>
        </div>

        {/* Layer Ⅲ · natural-language interface (asks drive the map above) */}
        <div className="mt-14 max-w-3xl">
          <Reveal>
            <span className="kicker text-rose">{ask.kicker}</span>
          </Reveal>
          <RevealLines
            as="h3"
            text={ask.title}
            className="display mt-4 block text-[clamp(1.6rem,3.5vw,2.6rem)]"
          />
          <Reveal delay={0.1}>
            <p className="mt-5 text-base leading-relaxed text-white/70">
              {ask.lead}
            </p>
          </Reveal>
        </div>
        <Reveal className="mt-6">
          <TwinAsk />
        </Reveal>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div>
      <div className="kicker text-white/40">{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="font-mono text-2xl font-bold tabular-nums text-white">
          {value}
        </span>
        <span className="text-xs text-white/40">{unit}</span>
      </div>
    </div>
  );
}

function Legend({ view }: { view: MapView }) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-[0.7rem] text-white/50">
      <div className="flex items-center gap-2">
        <span>낮음</span>
        <span
          className="h-2 w-24 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #7fd9cc, #ff4fa0, #b47cf0, #ff7a36)",
          }}
        />
        <span>높음</span>
      </div>
      <span className="font-mono text-white/35">
        {view === "3d"
          ? "밀도=빛 기둥 높이 · 격차=색온도"
          : "밀도=빛 크기 · 격차=색온도"}
      </span>
    </div>
  );
}
