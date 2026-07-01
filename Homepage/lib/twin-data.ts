/**
 * CULTURE TWIN — 시·도 단위 문화예술교육 공급 트윈 데이터.
 *
 * ⚠️ EXPLORATORY: 아래 programs/instructors/experience_rate 는 스토리 검증용
 *    *예시 수치*다. population 만 실제 공개 통계(행안부 주민등록인구, 2024 근사)를
 *    반영한다. 실측 파이프라인(`culture_gap.py` → regions.json)이 준비되면
 *    같은 스키마(PRD §6)로 이 파일을 교체하면 UI 는 그대로 동작한다.
 *
 * 데이터 위계 원칙: 공급(계산 가능) → 경험(조사로 검증) → 행동(보정 후 시뮬레이션).
 */

export const EXPLORATORY = true;

/** 강사 1명이 추가로 운영 가능한 평균 프로그램 수 — 투명한 탄력성 계수(조정 가능). */
export const PROGRAMS_PER_INSTRUCTOR = 2.4;

/** 사각지대지수 정규화 기준(정책 목표 공급 밀도 범위, 인구 10만명당 프로그램 수). */
export const DENSITY_FLOOR = 1.8; // 이하 → 지수 100 (심각한 부족)
export const DENSITY_CEIL = 6.0; // 이상 → 지수 0 (충분)

export type FieldKey = "음악" | "미술" | "무용" | "공예" | "문학";
export type DiagnosisType = "structural" | "delivery" | "stable" | "watch";

export interface Region {
  /** 시·도 약칭 (지도 라벨) */
  code: string;
  /** 정식 명칭 */
  name: string;
  level: "sido";
  /** 주민등록인구 (행안부, 2024 근사 · 실측) */
  population: number;
  /** 운영 프로그램 수 (예시) */
  programs: number;
  /** 예술강사 수 (예시) */
  instructors: number;
  /** 공급 밀도 = 인구 10만명당 프로그램 수 */
  density_per_100k: number;
  /** 사각지대지수 = 밀도 역정규화 (0~100, 높을수록 부족) */
  gap_index: number;
  /** 문화예술 경험률 (국민문화예술활동조사, P1 · 선택 · 예시) */
  experience_rate: number;
  /** 추상 좌표 (0~100 캔버스, 대략적 국토 배치) */
  coords: { x: number; y: number };
  /** 분야 구성 비율 (합 ≈ 1, 예시) */
  field_breakdown: Record<FieldKey, number>;
  /** AI 진단 한 줄 */
  diagnosis: string;
  diagnosisType: DiagnosisType;
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const round1 = (v: number) => Math.round(v * 100) / 100;

/** 공급 밀도 = (프로그램수 ÷ 인구) × 10만 */
export function densityOf(programs: number, population: number): number {
  return round1((programs / population) * 1e5);
}

/** 사각지대지수 = 밀도 역정규화 (0~100) */
export function gapIndexOf(density: number): number {
  const t = (DENSITY_CEIL - density) / (DENSITY_CEIL - DENSITY_FLOOR);
  return Math.round(clamp(t, 0, 1) * 100);
}

const fields = (
  음악: number,
  미술: number,
  무용: number,
  공예: number,
  문학: number
): Record<FieldKey, number> => ({ 음악, 미술, 무용, 공예, 문학 });

/**
 * 시드 데이터 — targetDensity 로 프로그램 수를 역산해 내부 정합성을 보장한다.
 * (density_per_100k / gap_index 는 programs 로부터 재계산되어 저장된다.)
 */
type Seed = {
  code: string;
  name: string;
  population: number;
  targetDensity: number;
  experience_rate: number;
  coords: { x: number; y: number };
  fb: Record<FieldKey, number>;
};

const SEEDS: Seed[] = [
  { code: "서울", name: "서울특별시", population: 9386000, targetDensity: 5.4, experience_rate: 0.74, coords: { x: 38, y: 20 }, fb: fields(0.3, 0.28, 0.16, 0.14, 0.12) },
  { code: "인천", name: "인천광역시", population: 3012000, targetDensity: 3.2, experience_rate: 0.63, coords: { x: 30, y: 23 }, fb: fields(0.28, 0.27, 0.15, 0.18, 0.12) },
  { code: "경기", name: "경기도", population: 13630000, targetDensity: 3.1, experience_rate: 0.66, coords: { x: 41, y: 27 }, fb: fields(0.29, 0.27, 0.16, 0.16, 0.12) },
  { code: "강원", name: "강원특별자치도", population: 1527000, targetDensity: 2.6, experience_rate: 0.55, coords: { x: 62, y: 19 }, fb: fields(0.26, 0.24, 0.14, 0.24, 0.12) },
  { code: "세종", name: "세종특별자치시", population: 386000, targetDensity: 5.1, experience_rate: 0.6, coords: { x: 43, y: 41 }, fb: fields(0.31, 0.29, 0.16, 0.13, 0.11) },
  { code: "대전", name: "대전광역시", population: 1442000, targetDensity: 4.2, experience_rate: 0.68, coords: { x: 44, y: 47 }, fb: fields(0.3, 0.28, 0.17, 0.13, 0.12) },
  { code: "충북", name: "충청북도", population: 1591000, targetDensity: 2.9, experience_rate: 0.56, coords: { x: 53, y: 40 }, fb: fields(0.27, 0.25, 0.14, 0.22, 0.12) },
  { code: "충남", name: "충청남도", population: 2130000, targetDensity: 2.4, experience_rate: 0.53, coords: { x: 34, y: 45 }, fb: fields(0.26, 0.24, 0.13, 0.25, 0.12) },
  { code: "전북", name: "전북특별자치도", population: 1754000, targetDensity: 2.8, experience_rate: 0.62, coords: { x: 37, y: 59 }, fb: fields(0.25, 0.23, 0.15, 0.23, 0.14) },
  { code: "광주", name: "광주광역시", population: 1419000, targetDensity: 4.0, experience_rate: 0.7, coords: { x: 34, y: 68 }, fb: fields(0.3, 0.27, 0.18, 0.13, 0.12) },
  { code: "전남", name: "전라남도", population: 1804000, targetDensity: 2.2, experience_rate: 0.49, coords: { x: 31, y: 75 }, fb: fields(0.24, 0.22, 0.13, 0.27, 0.14) },
  { code: "경북", name: "경상북도", population: 2554000, targetDensity: 2.3, experience_rate: 0.51, coords: { x: 65, y: 43 }, fb: fields(0.25, 0.23, 0.13, 0.26, 0.13) },
  { code: "대구", name: "대구광역시", population: 2374000, targetDensity: 3.4, experience_rate: 0.64, coords: { x: 62, y: 52 }, fb: fields(0.29, 0.27, 0.16, 0.16, 0.12) },
  { code: "울산", name: "울산광역시", population: 1103000, targetDensity: 3.0, experience_rate: 0.58, coords: { x: 74, y: 56 }, fb: fields(0.28, 0.26, 0.15, 0.19, 0.12) },
  { code: "경남", name: "경상남도", population: 3251000, targetDensity: 2.5, experience_rate: 0.54, coords: { x: 57, y: 63 }, fb: fields(0.26, 0.24, 0.14, 0.23, 0.13) },
  { code: "부산", name: "부산광역시", population: 3293000, targetDensity: 3.6, experience_rate: 0.65, coords: { x: 70, y: 64 }, fb: fields(0.29, 0.27, 0.17, 0.15, 0.12) },
  { code: "제주", name: "제주특별자치도", population: 675000, targetDensity: 4.8, experience_rate: 0.67, coords: { x: 30, y: 92 }, fb: fields(0.28, 0.26, 0.16, 0.18, 0.12) },
];

function diagnose(density: number, experience: number): {
  diagnosis: string;
  diagnosisType: DiagnosisType;
} {
  const lowSupply = density < 2.8; // 공급 부족 임계
  const lowExp = experience < 0.58; // 경험 부족 임계
  if (lowSupply && lowExp)
    return {
      diagnosisType: "structural",
      diagnosis: "구조적 사각지대 — 공급과 경험이 함께 낮아 우선 개입이 필요합니다.",
    };
  if (!lowSupply && lowExp)
    return {
      diagnosisType: "delivery",
      diagnosis: "전달 실패 — 공급은 있으나 경험이 낮습니다. 홍보·접근성 개선이 핵심입니다.",
    };
  if (lowSupply && !lowExp)
    return {
      diagnosisType: "watch",
      diagnosis: "공급 열세 — 경험률은 유지되나 프로그램 밀도 보강이 필요합니다.",
    };
  return {
    diagnosisType: "stable",
    diagnosis: "상대적 안정 — 공급·경험 모두 평균 이상입니다.",
  };
}

export const REGIONS: Region[] = SEEDS.map((s) => {
  const programs = Math.round((s.targetDensity * s.population) / 1e5);
  const instructors = Math.round(programs / PROGRAMS_PER_INSTRUCTOR);
  const density_per_100k = densityOf(programs, s.population);
  const gap_index = gapIndexOf(density_per_100k);
  const d = diagnose(density_per_100k, s.experience_rate);
  return {
    code: s.code,
    name: s.name,
    level: "sido" as const,
    population: s.population,
    programs,
    instructors,
    density_per_100k,
    gap_index,
    experience_rate: s.experience_rate,
    coords: s.coords,
    field_breakdown: s.fb,
    ...d,
  };
});

export const REGION_BY_CODE: Record<string, Region> = Object.fromEntries(
  REGIONS.map((r) => [r.code, r])
);

/** 시·도 대표 실좌표 (lat/lng) — 실지도(3D·MapLibre) 오버레이 공용 */
export const GEO: Record<string, { lat: number; lng: number }> = {
  서울: { lat: 37.5665, lng: 126.978 },
  인천: { lat: 37.4563, lng: 126.7052 },
  경기: { lat: 37.5, lng: 127.2 },
  강원: { lat: 37.8, lng: 128.16 },
  세종: { lat: 36.48, lng: 127.289 },
  대전: { lat: 36.3504, lng: 127.3845 },
  충북: { lat: 36.8, lng: 127.7 },
  충남: { lat: 36.6, lng: 126.8 },
  전북: { lat: 35.72, lng: 127.15 },
  광주: { lat: 35.1595, lng: 126.8526 },
  전남: { lat: 34.8, lng: 126.9 },
  경북: { lat: 36.4, lng: 128.7 },
  대구: { lat: 35.8714, lng: 128.6014 },
  울산: { lat: 35.5384, lng: 129.3114 },
  경남: { lat: 35.4, lng: 128.2 },
  부산: { lat: 35.1796, lng: 129.0756 },
  제주: { lat: 33.4, lng: 126.55 },
};

/** 전국 요약 지표 */
export const NATIONAL = {
  population: REGIONS.reduce((a, r) => a + r.population, 0),
  programs: REGIONS.reduce((a, r) => a + r.programs, 0),
  instructors: REGIONS.reduce((a, r) => a + r.instructors, 0),
  avgDensity:
    round1(
      REGIONS.reduce((a, r) => a + r.density_per_100k, 0) / REGIONS.length
    ),
  worst: [...REGIONS].sort((a, b) => b.gap_index - a.gap_index)[0],
  best: [...REGIONS].sort((a, b) => a.gap_index - b.gap_index)[0],
};

export interface SimSnapshot {
  programs: number;
  instructors: number;
  density: number;
  gap: number;
}

export interface SimResult {
  before: SimSnapshot;
  after: SimSnapshot;
  addedPrograms: number;
  deltaDensity: number;
  deltaGap: number;
}

/**
 * 개입 재계산 (규칙기반, What-if). 순수 함수.
 * Δ프로그램 = 강사증가 × 강사당 평균 프로그램수 + 직접 추가 프로그램.
 */
export function recompute(
  region: Region,
  addInstructors: number,
  addPrograms: number
): SimResult {
  const addedPrograms = Math.round(
    addInstructors * PROGRAMS_PER_INSTRUCTOR + addPrograms
  );
  const afterPrograms = region.programs + addedPrograms;
  const afterInstructors = region.instructors + addInstructors;
  const afterDensity = densityOf(afterPrograms, region.population);
  const afterGap = gapIndexOf(afterDensity);
  return {
    before: {
      programs: region.programs,
      instructors: region.instructors,
      density: region.density_per_100k,
      gap: region.gap_index,
    },
    after: {
      programs: afterPrograms,
      instructors: afterInstructors,
      density: afterDensity,
      gap: afterGap,
    },
    addedPrograms,
    deltaDensity: round1(afterDensity - region.density_per_100k),
    deltaGap: afterGap - region.gap_index,
  };
}
