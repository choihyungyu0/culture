"use client";

import { REGIONS, REGION_BY_CODE, recompute } from "@/lib/twin-data";
import { useTwinStore, type TwinMode } from "@/store/useStore";
import { cn } from "@/lib/utils";

const WORST = [...REGIONS].sort((a, b) => b.gap_index - a.gap_index).slice(0, 6);
const MODES: TwinMode[] = ["현황", "사각지대"];
const MODE_LABEL: Record<TwinMode, string> = {
  현황: "현황",
  사각지대: "AI 사각지대",
};

export function TwinControls() {
  const {
    selectedCode,
    mode,
    addInstructors,
    addPrograms,
    setMode,
    setAddInstructors,
    setAddPrograms,
    select,
    reset,
  } = useTwinStore();

  const region = REGION_BY_CODE[selectedCode];
  const active = addInstructors > 0 || addPrograms > 0;
  const sim = region ? recompute(region, addInstructors, addPrograms) : null;

  function exportBrief() {
    if (!region || !sim) return;
    const lines = [
      "CULTURE TWIN — 정책 개입 근거자료 (탐색용·예시)",
      "=".repeat(48),
      `지역: ${region.name} (${region.code})`,
      `개입안: 예술강사 +${addInstructors}명, 프로그램 +${addPrograms}개`,
      "",
      "[Before → After]",
      `· 공급 밀도(10만명당): ${sim.before.density} → ${sim.after.density} (Δ ${sim.deltaDensity >= 0 ? "+" : ""}${sim.deltaDensity})`,
      `· 사각지대지수: ${sim.before.gap} → ${sim.after.gap} (Δ ${sim.deltaGap >= 0 ? "+" : ""}${sim.deltaGap})`,
      `· 프로그램: ${sim.before.programs} → ${sim.after.programs}`,
      `· 예술강사: ${sim.before.instructors} → ${sim.after.instructors}`,
      "",
      "[가정·계수]",
      "· Δ프로그램 = 강사증가 × 강사당 평균 프로그램수(2.4) + 직접 추가",
      "· 사각지대지수 = 공급 밀도 역정규화(목표범위 1.2~7.0 기준)",
      "",
      "[데이터 출처]",
      "· 행안부 주민등록인구(2026-06 실측) · 진흥원 문화예술교육 프로그램 목록(2025-12 실측, 시·도 지오코딩)",
      "· 국민문화예술활동조사 교육경험률 Q9(2023 원시데이터 가중 실측·검증용)",
      "",
      "※ 공급·인구·교육경험률은 공개데이터 실측입니다. 개입 시뮬레이션(강사→프로그램 환산·계수 2.4)만 규칙기반 탐색 추정이니, 보정 전 참고 근거로 활용하세요.",
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `culture-twin_${region.code}_근거자료.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="instrument-panel rounded-2xl p-6 lg:p-7">
      <div className="flex items-center justify-between gap-3">
        <div className="kicker text-white/40">Intervention Simulator</div>
        <span className="badge-exploratory">탐색용 · 예시</span>
      </div>

      {/* mode toggle */}
      <div className="mt-5">
        <div className="flex gap-1 rounded-full border border-white/10 bg-white/5 p-1">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={cn(
                "flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                mode === m
                  ? "bg-white text-ink"
                  : "text-white/60 hover:text-white"
              )}
            >
              {MODE_LABEL[m]}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[0.72rem] text-white/40">
          {mode === "현황"
            ? "밝을수록 공급 밀도가 높습니다 (rose→violet)."
            : "붉을수록 사각지대가 큽니다 · 최고 격차 노드는 맥동합니다 (mint→heat)."}
        </p>
      </div>

      {/* quick select */}
      <div className="mt-6">
        <div className="kicker mb-2.5 text-white/40">사각지대 상위 지역</div>
        <div className="flex flex-wrap gap-2">
          {WORST.map((r) => (
            <button
              key={r.code}
              type="button"
              onClick={() => select(r.code)}
              aria-pressed={selectedCode === r.code}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                selectedCode === r.code
                  ? "bg-heat/20 text-heat ring-1 ring-heat/40"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              {r.code}
              <span className="ml-1.5 font-mono text-white/30">{r.gap_index}</span>
            </button>
          ))}
        </div>
      </div>

      {/* sliders */}
      <div className="mt-6 space-y-5">
        <Slider
          label="예술강사 추가"
          value={addInstructors}
          min={0}
          max={50}
          unit="명"
          onChange={setAddInstructors}
        />
        <Slider
          label="프로그램 직접 추가"
          value={addPrograms}
          min={0}
          max={120}
          unit="개"
          onChange={setAddPrograms}
        />
      </div>

      {/* delta readout */}
      {sim && (
        <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <DeltaStat
            label="밀도 변화"
            value={active ? `${sim.deltaDensity >= 0 ? "+" : ""}${sim.deltaDensity}` : "—"}
            good={active && sim.deltaDensity > 0}
          />
          <DeltaStat
            label="사각지대 변화"
            value={active ? `${sim.deltaGap > 0 ? "+" : ""}${sim.deltaGap}` : "—"}
            good={active && sim.deltaGap < 0}
          />
        </div>
      )}

      {/* actions */}
      <div className="mt-5 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={exportBrief}
          disabled={!active}
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          예산 근거자료 내보내기 ↓
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={!active}
          className="inline-flex items-center rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          초기화
        </button>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm text-white/70">{label}</label>
        <span className="font-mono text-lg font-bold tabular-nums text-white">
          +{value}
          <span className="ml-1 text-xs font-normal text-white/40">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label} (현재 +${value}${unit})`}
        className="mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15"
        style={{ accentColor: "#ff4fa0" }}
      />
    </div>
  );
}

function DeltaStat({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good: boolean;
}) {
  return (
    <div>
      <div className="kicker text-white/40">{label}</div>
      <div
        className="mt-1 font-mono text-xl font-bold tabular-nums"
        style={{ color: value === "—" ? "rgba(255,255,255,0.4)" : good ? "var(--mint)" : "var(--heat)" }}
      >
        {value}
      </div>
    </div>
  );
}
