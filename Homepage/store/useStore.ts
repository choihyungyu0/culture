import { create } from "zustand";

// UI store: shared entry state so the hero can begin its reveal exactly when
// the preloader curtain lifts (decouples timing from a magic delay constant).
interface UiState {
  entered: boolean;
  setEntered: (v: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  entered: false,
  setEntered: (v) => set({ entered: v }),
}));

// ── Twin instrument store ──────────────────────────────────────────────
// Drives the interactive twin: selected region, current mode, and the
// What-if intervention (added instructors / programs). Kept minimal — the
// heavy lifting (recompute) lives as a pure function in lib/twin-data.
export type TwinMode = "현황" | "사각지대";

interface TwinState {
  selectedCode: string;
  mode: TwinMode;
  addInstructors: number;
  addPrograms: number;
  /** bumped on each intervention change → drives the node "wave" animation */
  pulse: number;
  select: (code: string) => void;
  setMode: (mode: TwinMode) => void;
  setAddInstructors: (n: number) => void;
  setAddPrograms: (n: number) => void;
  reset: () => void;
}

export const useTwinStore = create<TwinState>((set) => ({
  selectedCode: "전남", // 기본: 최고 사각지대 지역
  mode: "현황",
  addInstructors: 0,
  addPrograms: 0,
  pulse: 0,
  select: (code) => set({ selectedCode: code }),
  setMode: (mode) => set({ mode }),
  setAddInstructors: (n) =>
    set((s) => ({ addInstructors: n, pulse: s.pulse + 1 })),
  setAddPrograms: (n) => set((s) => ({ addPrograms: n, pulse: s.pulse + 1 })),
  reset: () => set((s) => ({ addInstructors: 0, addPrograms: 0, pulse: s.pulse + 1 })),
}));
