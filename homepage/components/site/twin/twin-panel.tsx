"use client";

import {
  REGION_BY_CODE,
  recompute,
  type DiagnosisType,
  type FieldKey,
} from "@/lib/twin-data";
import { useTwinStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

const DIAG_STYLE: Record<DiagnosisType, { label: string; color: string }> = {
  structural: { label: "구조적 사각지대", color: "var(--heat)" },
  delivery: { label: "전달 실패", color: "var(--violet-soft)" },
  watch: { label: "공급 열세", color: "var(--rose)" },
  stable: { label: "상대적 안정", color: "var(--mint)" },
};

const FIELD_COLOR: Record<FieldKey, string> = {
  음악: "var(--rose)",
  미술: "var(--violet-soft)",
  무용: "var(--mint)",
  공예: "var(--heat)",
  문학: "rgba(255,255,255,0.55)",
};

function fmt(n: number) {
  return n.toLocaleString("ko-KR");
}

export function TwinPanel() {
  const { selectedCode, addInstructors, addPrograms } = useTwinStore();
  const region = REGION_BY_CODE[selectedCode];
  if (!region) return null;

  const active = addInstructors > 0 || addPrograms > 0;
  const sim = recompute(region, addInstructors, addPrograms);
  const diag = DIAG_STYLE[region.diagnosisType];

  return (
    <div className="instrument-panel rounded-2xl p-6 lg:p-7">
      {/* header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="kicker text-white/40">Selected Region</div>
          <h3 className="mt-1.5 text-2xl font-bold tracking-tight text-white">
            {region.name}
          </h3>
        </div>
        <span
          className="mt-1 shrink-0 rounded-full px-3 py-1 text-[0.68rem] font-medium"
          style={{
            color: diag.color,
            background: `color-mix(in srgb, ${diag.color} 16%, transparent)`,
            border: `1px solid color-mix(in srgb, ${diag.color} 34%, transparent)`,
          }}
        >
          {diag.label}
        </span>
      </div>

      {/* diagnosis line */}
      <p className="mt-4 text-sm leading-relaxed text-white/70">
        <span className="font-mono text-[0.62rem] uppercase tracking-widest text-white/35">
          AI 진단&nbsp;
        </span>
        {region.diagnosis}
      </p>

      {/* metrics */}
      <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-5">
        <Metric
          label="공급 밀도"
          unit="/10만명"
          before={region.density_per_100k}
          after={active ? sim.after.density : undefined}
          betterWhenUp
        />
        <Metric
          label="사각지대지수"
          unit="/100"
          before={region.gap_index}
          after={active ? sim.after.gap : undefined}
          betterWhenUp={false}
        />
        <Metric
          label="예술강사"
          unit="명"
          before={region.instructors}
          after={active ? sim.after.instructors : undefined}
          betterWhenUp
          integer
        />
        <Metric
          label="프로그램"
          unit="개"
          before={region.programs}
          after={active ? sim.after.programs : undefined}
          betterWhenUp
          integer
        />
      </div>

      {/* secondary stats */}
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-4 text-xs text-white/50">
        <span>
          인구 <span className="font-mono text-white/75">{fmt(region.population)}</span>
        </span>
        <span>
          경험률{" "}
          <span className="font-mono text-white/75">
            {Math.round(region.experience_rate * 100)}%
          </span>
          <span className="ml-1 text-white/30">(조사·선택)</span>
        </span>
      </div>

      {/* field breakdown */}
      <div className="mt-6">
        <div className="kicker mb-3 text-white/40">분야 구성</div>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full">
          {(Object.keys(region.field_breakdown) as FieldKey[]).map((k) => (
            <div
              key={k}
              style={{
                width: `${region.field_breakdown[k] * 100}%`,
                background: FIELD_COLOR[k],
              }}
            />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {(Object.keys(region.field_breakdown) as FieldKey[]).map((k) => (
            <span
              key={k}
              className="flex items-center gap-1.5 text-[0.7rem] text-white/55"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: FIELD_COLOR[k] }}
              />
              {k} {Math.round(region.field_breakdown[k] * 100)}%
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  unit,
  before,
  after,
  betterWhenUp,
  integer = false,
}: {
  label: string;
  unit: string;
  before: number;
  after?: number;
  betterWhenUp: boolean;
  integer?: boolean;
}) {
  const show = (v: number) => (integer ? v.toLocaleString("ko-KR") : v.toFixed(2));
  const changed = after !== undefined && after !== before;
  const improved =
    after !== undefined && (betterWhenUp ? after > before : after < before);

  return (
    <div>
      <div className="kicker text-white/40">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span
          className={cn(
            "font-mono text-2xl font-bold tabular-nums",
            changed ? "text-white/35 line-through decoration-1" : "text-white"
          )}
        >
          {show(before)}
        </span>
        {changed && (
          <span
            className="font-mono text-2xl font-bold tabular-nums"
            style={{ color: improved ? "var(--mint)" : "var(--heat)" }}
          >
            {show(after!)}
          </span>
        )}
        <span className="text-[0.62rem] text-white/30">{unit}</span>
      </div>
    </div>
  );
}
