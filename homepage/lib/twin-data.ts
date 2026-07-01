/**
 * CULTURE TWIN — 시·도 단위 문화예술교육 공급 트윈 데이터.
 *
 * 데이터 성격: 공급(population·programs·density)은 공개데이터 실측 —
 *    행안부 주민등록인구(2026-06) + 문화예술교육 프로그램 목록(2025-12) CSV를
 *    시·도로 지오코딩해 산출(울산 1.20 최저·제주 6.94 최고·전국 2.72·최대 5.8배).
 *    experience_rate = 문화예술교육 경험률(Q9). 2023 국민문화예술활동조사 원시데이터
 *    10,182명 가중 실측(전국 8.5%). 밀도와 약한 양의 순위상관(Spearman +0.20, 탐색적).
 *
 * 데이터 위계 원칙: 공급(계산 가능) → 경험(조사로 검증) → 행동(보정 후 시뮬레이션).
 */

export const EXPLORATORY = true;

/** 강사 1명이 추가로 운영 가능한 평균 프로그램 수 — 투명한 탄력성 계수(조정 가능). */
export const PROGRAMS_PER_INSTRUCTOR = 2.4;

/** 사각지대지수 정규화 기준(정책 목표 공급 밀도 범위, 인구 10만명당 프로그램 수). */
export const DENSITY_FLOOR = 1.2; // 이하 → 지수 100 (최저 울산 1.20 = 100)
export const DENSITY_CEIL = 7.0; // 이상 → 지수 0 (최고 제주 6.94 ≈ 0)

export type FieldKey = "음악" | "미술" | "무용" | "공예" | "문학";
export type DiagnosisType = "structural" | "delivery" | "stable" | "watch";

export interface Region {
  /** 시·도 약칭 (지도 라벨) */
  code: string;
  /** 정식 명칭 */
  name: string;
  level: "sido";
  /** 주민등록인구 (행안부, 2026-06 실측) */
  population: number;
  /** 운영 프로그램 수 (프로그램 목록 CSV 실측, 시·도 지오코딩) */
  programs: number;
  /** 예술강사 수 (프로그램수÷탄력성계수로 역산 · 시뮬레이터용) */
  instructors: number;
  /** 공급 밀도 = 인구 10만명당 프로그램 수 */
  density_per_100k: number;
  /** 사각지대지수 = 밀도 역정규화 (0~100, 높을수록 부족) */
  gap_index: number;
  /** 문화예술교육 경험률 (Q9 any=경험있음, 2023 국민문화예술활동조사 가중 실측) */
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

// SEEDS — 공급 실측(2025-12 프로그램 목록 CSV + 행안부 2026-06 인구):
//   population = 행안부 주민등록인구(2026-06) 실측.
//   targetDensity = 프로그램 목록 CSV의 시·도별 실측 밀도(운영주소 → 시·도 지오코딩,
//     커버리지 ~83%). 파생 programs 는 실제 CSV 카운트와 일치(서울 165·제주 46·충북 88…).
//   결과: 울산 1.20 최저·사각지대 100, 제주 6.94 최고, 전국 평균 2.72, 최대 5.8배.
//   experience_rate = 문화예술교육 경험률(Q9, 2023 국민문화예술활동조사 10,182명 가중 실측,
//     전국 8.5%·지역 3.2~24.8%). 밀도와 약한 양의 상관(Spearman +0.20). 관람률(Q1)은 밀도와
//     음의 상관(-0.66, 도심 관람인프라 교란)이라 경험 축에서 제외.
const SEEDS: Seed[] = [
  { code: "서울", name: "서울특별시", population: 9289813, targetDensity: 1.78, experience_rate: 0.074, coords: { x: 38, y: 20 }, fb: fields(0.3, 0.28, 0.16, 0.14, 0.12) },
  { code: "인천", name: "인천광역시", population: 3061002, targetDensity: 1.7, experience_rate: 0.068, coords: { x: 30, y: 23 }, fb: fields(0.28, 0.27, 0.15, 0.18, 0.12) },
  { code: "경기", name: "경기도", population: 13761783, targetDensity: 1.38, experience_rate: 0.061, coords: { x: 41, y: 27 }, fb: fields(0.29, 0.27, 0.16, 0.16, 0.12) },
  { code: "강원", name: "강원특별자치도", population: 1507217, targetDensity: 1.53, experience_rate: 0.054, coords: { x: 62, y: 19 }, fb: fields(0.26, 0.24, 0.14, 0.24, 0.12) },
  { code: "세종", name: "세종특별자치시", population: 390923, targetDensity: 1.79, experience_rate: 0.07, coords: { x: 43, y: 41 }, fb: fields(0.31, 0.29, 0.16, 0.13, 0.11) },
  { code: "대전", name: "대전광역시", population: 1442034, targetDensity: 5.06, experience_rate: 0.114, coords: { x: 44, y: 47 }, fb: fields(0.3, 0.28, 0.17, 0.13, 0.12) },
  { code: "충북", name: "충청북도", population: 1600787, targetDensity: 5.5, experience_rate: 0.061, coords: { x: 53, y: 40 }, fb: fields(0.27, 0.25, 0.14, 0.22, 0.12) },
  { code: "충남", name: "충청남도", population: 2138785, targetDensity: 1.54, experience_rate: 0.089, coords: { x: 34, y: 45 }, fb: fields(0.26, 0.24, 0.13, 0.25, 0.12) },
  { code: "전북", name: "전북특별자치도", population: 1718633, targetDensity: 3.72, experience_rate: 0.085, coords: { x: 37, y: 59 }, fb: fields(0.25, 0.23, 0.15, 0.23, 0.14) },
  { code: "광주", name: "광주광역시", population: 1385460, targetDensity: 3.03, experience_rate: 0.032, coords: { x: 34, y: 68 }, fb: fields(0.3, 0.27, 0.18, 0.13, 0.12) },
  { code: "전남", name: "전라남도", population: 1773646, targetDensity: 2.2, experience_rate: 0.064, coords: { x: 31, y: 75 }, fb: fields(0.24, 0.22, 0.13, 0.27, 0.14) },
  { code: "경북", name: "경상북도", population: 2495919, targetDensity: 2.64, experience_rate: 0.039, coords: { x: 65, y: 43 }, fb: fields(0.25, 0.23, 0.13, 0.26, 0.13) },
  { code: "대구", name: "대구광역시", population: 2348165, targetDensity: 1.36, experience_rate: 0.062, coords: { x: 62, y: 52 }, fb: fields(0.29, 0.27, 0.16, 0.16, 0.12) },
  { code: "울산", name: "울산광역시", population: 1087089, targetDensity: 1.2, experience_rate: 0.087, coords: { x: 74, y: 56 }, fb: fields(0.28, 0.26, 0.15, 0.19, 0.12) },
  { code: "경남", name: "경상남도", population: 3195351, targetDensity: 2.66, experience_rate: 0.137, coords: { x: 57, y: 63 }, fb: fields(0.26, 0.24, 0.14, 0.23, 0.13) },
  { code: "부산", name: "부산광역시", population: 3232370, targetDensity: 2.29, experience_rate: 0.248, coords: { x: 70, y: 64 }, fb: fields(0.29, 0.27, 0.17, 0.15, 0.12) },
  { code: "제주", name: "제주특별자치도", population: 662792, targetDensity: 6.94, experience_rate: 0.237, coords: { x: 30, y: 92 }, fb: fields(0.28, 0.26, 0.16, 0.18, 0.12) },
];

function diagnose(density: number, experience: number): {
  diagnosis: string;
  diagnosisType: DiagnosisType;
} {
  const lowSupply = density < 2.72; // 공급 부족 임계 = 전국 평균 밀도(2.72) 하회
  const lowExp = experience < 0.085; // 경험 부족 임계 = 문화예술교육 경험률 전국 가중평균(8.5%) 하회
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
  // 밀도는 CSV 실측치(targetDensity)를 그대로 표시.
  const density_per_100k = round1(s.targetDensity);
  // programs = 밀도×인구로 역산 → 실제 프로그램 목록 CSV 카운트와 일치. instructors 는 시뮬레이터용 파생.
  const programs = Math.round((density_per_100k * s.population) / 1e5);
  const instructors = Math.round(programs / PROGRAMS_PER_INSTRUCTOR);
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

/** 시·도 대표 실좌표 (lat/lng) — 실지도(3D·MapLibre) 오버레이 공용.
 *  각 시·도청/시청 소재지 정확 좌표(도 단위는 도청 소재 도시). */
export const GEO: Record<string, { lat: number; lng: number }> = {
  서울: { lat: 37.5665, lng: 126.978 }, // 서울시청
  인천: { lat: 37.4563, lng: 126.7052 }, // 인천시청(남동구)
  경기: { lat: 37.2752, lng: 127.0095 }, // 경기도청(수원 광교)
  강원: { lat: 37.8813, lng: 127.73 }, // 강원도청(춘천)
  세종: { lat: 36.4801, lng: 127.289 }, // 세종시청
  대전: { lat: 36.3504, lng: 127.3845 }, // 대전시청
  충북: { lat: 36.6357, lng: 127.4914 }, // 충북도청(청주)
  충남: { lat: 36.6585, lng: 126.6727 }, // 충남도청(홍성 내포)
  전북: { lat: 35.8203, lng: 127.1089 }, // 전북도청(전주)
  광주: { lat: 35.1595, lng: 126.8526 }, // 광주시청
  전남: { lat: 34.8161, lng: 126.4629 }, // 전남도청(무안 남악)
  경북: { lat: 36.5759, lng: 128.5058 }, // 경북도청(안동 풍천)
  대구: { lat: 35.8714, lng: 128.6014 }, // 대구시청
  울산: { lat: 35.5384, lng: 129.3114 }, // 울산시청
  경남: { lat: 35.2383, lng: 128.6924 }, // 경남도청(창원)
  부산: { lat: 35.1796, lng: 129.0756 }, // 부산시청
  제주: { lat: 33.489, lng: 126.4983 }, // 제주도청(제주시)
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
