/**
 * CULTURE TWIN — 사이트 카피 단일 원본.
 * 2026 한국문화예술교육진흥원 공공데이터 활용 아이디어 공모전 '아이디어 기획' 부문을
 * 뒷받침하는 컨셉 경험 사이트. 각 섹션 객체는 대응 컴포넌트가 직접 소비한다.
 */

export const brand = {
  name: "CULTURE TWIN",
  initials: "CT",
  slogan: "예산을 쓰기 전에, 결과를 본다.",
  definition: "공공데이터로 만든 문화예술교육 정책 디지털 트윈.",
  email: "team@culture-twin.kr",
  location: "Republic of Korea",
} as const;

export const nav = [
  { label: "문제", href: "/#problem" },
  { label: "개념", href: "/#concept" },
  { label: "트윈", href: "/twin" },
  { label: "데이터", href: "/data" },
  { label: "확장", href: "/#impact" },
] as const;

/* ── Hero ── */
export const hero = {
  kicker: "Cultural Arts Education · Policy Digital Twin",
  accent: "See the outcome before you spend.",
  subcopy:
    "공공데이터로 시민과 지역을 복제한 정책 트윈에서, 강사·프로그램 배치 같은 개입을 실행 전에 시뮬레이션합니다. 지역 간 공급 격차와 사각지대를 빛의 밀도로 드러냅니다.",
  primary: { label: "트윈 체험하기", href: "/twin" },
  secondary: { label: "문제부터 보기", href: "#problem" },
} as const;

/* ── 01. 문제 인식 · 공공성 (평가 25점) ── */
export const problem = {
  kicker: "The Problem · 01",
  title: "지원은 늘었지만,\n격차는 보이지 않았다",
  lead:
    "문화예술교육 예산과 프로그램은 매년 늘어난다. 그러나 '어느 지역이, 왜 부족한가'는 흩어진 데이터 뒤에 가려져 있다. 배치는 여전히 관성과 직감으로 결정되고, 사각지대는 통계가 아니라 뒤늦은 민원으로 드러난다.",
  types: [
    {
      tag: "Type A",
      title: "구조적 사각지대",
      signal: "공급 ↓ · 경험 ↓",
      desc:
        "프로그램도 적고 시민 경험률도 낮은 지역. 가장 먼저 자원을 투입해야 하지만, 존재 자체가 지표로 잡히지 않는다.",
    },
    {
      tag: "Type B",
      title: "전달 실패",
      signal: "공급 ↑ · 경험 ↓",
      desc:
        "프로그램은 있으나 시민에게 닿지 못하는 지역. 필요한 건 예산 증액이 아니라 홍보·접근성 개선이다. 둘을 구분하지 못하면 예산이 헛돈다.",
    },
  ],
  note:
    "* 최고↔최저 밀도(제주 6.94 · 울산 1.20)와 전국 평균(2.76)은 공개데이터 분석 실측치입니다. 시·도별 세부값은 탐색용 추정이며, 전체 실측표로 교체 시 그대로 반영됩니다.",
  // 시그니처 데이터-비주얼: 지원은 늘어도 지방 사각지대는 그대로 (예시 시리즈)
  series: {
    kicker: "지원 ↑ · 격차 그대로",
    years: [2019, 2020, 2021, 2022, 2023, 2024],
    support: [100, 108, 121, 138, 156, 178], // 지원·프로그램 상대 지수(2019=100)
    gapRural: [88, 87, 89, 86, 87, 85], // 지방 평균 사각지대지수
    supportLabel: "지원·프로그램 수",
    gapLabel: "지방 사각지대지수",
    caption:
      "지원·프로그램은 6년간 +78% 늘었지만, 지방 사각지대지수는 88 → 85로 거의 그대로다.",
  },
  // 시네마틱 백드롭 (듀오톤 처리) — 로드 확인된 Unsplash 이미지
  photo: {
    src: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&h=1100&q=80&auto=format&fit=crop",
    credit: "Unsplash",
    alt: "문화예술교육 현장",
  },
} as const;

/* ── 02. 개념 — 세 겹의 트윈 ── */
export const concept = {
  kicker: "The Concept · 02",
  title: "세 겹의 트윈",
  lead:
    "'디지털 트윈'을 절제해 정의한다 — 실제 데이터로 보정된 정책 시뮬레이션. 감각적 시각화, 가상 시민, 자연어 인터페이스가 한 몸으로 움직인다.",
  layers: [
    {
      no: "Ⅰ",
      name: "감각적 트윈 시각화",
      tagline: "데이터가 빛이 된다",
      desc:
        "지역·프로그램을 빛의 밀도를 띤 노드로, 정책 개입은 트윈에 퍼지는 파동으로 본다. 격차는 숫자이기 전에 색온도로 감지된다.",
    },
    {
      no: "Ⅱ",
      name: "시민 에이전트 시뮬레이션",
      tagline: "실행 전에 반응을 본다",
      desc:
        "인구·프로그램 데이터로 보정된 가상 시민이 정책 신호에 반응한다. '강사를 15명 늘리면?' 같은 반사실(What-if)을 실행 전에 시험한다.",
    },
    {
      no: "Ⅲ",
      name: "자연어 정책 인터페이스",
      tagline: "코딩 없이 질문한다",
      desc:
        "묻고, 개입을 바꿔 끼우고, 결과를 비교한다. 통계·코딩 지식 없는 정책담당자가 근거를 직접 만든다.",
    },
  ],
} as const;

/* ── 04. 데이터 활용성 (평가 30점 + 가점 AI) ── */
export const data = {
  kicker: "Public Data · 04",
  title: "허공에서\n예측하지 않는다",
  lead:
    "예측은 위계를 지킨다. 계산 가능한 공급에서 출발해, 조사로 경험을 검증하고, 보정된 모델 위에서만 행동을 시뮬레이션한다.",
  hierarchy: [
    {
      step: "공급",
      title: "계산 가능",
      desc: "프로그램·강사·인구로 밀도를 직접 산출한다.",
    },
    {
      step: "경험",
      title: "조사로 검증",
      desc: "국민문화예술활동조사 경험률로 공급 진단을 교차 검증한다.",
    },
    {
      step: "행동",
      title: "보정 후 시뮬레이션",
      desc: "검증된 관계 위에서만 개입의 결과를 예측한다.",
    },
  ],
  groups: [
    {
      label: "코어 · 진흥원 개방데이터 (필수)",
      items: [
        { name: "문화예술교육 프로그램 목록", role: "공급 밀도·격차 코어" },
        { name: "사업단위별 강사수 통계", role: "자원 배치 시뮬레이션" },
        { name: "단체 목록 · 지역문화재단 위키맵", role: "기관 분포·접근성" },
        { name: "자원지도 조회 OpenAPI", role: "전국·실시간 보강" },
        { name: "연구·연차보고서 OpenAPI", role: "RAG 요약·질의응답 (AI 가점)" },
        { name: "일자리 창출 현황", role: "수혜자·성과 보조" },
      ],
    },
    {
      label: "보정·검증 · 출처 명시 (선택)",
      items: [
        { name: "국민문화예술활동조사", role: "지역 경험률로 공급 보정·검증" },
        { name: "주민등록인구 (행안부)", role: "밀도 분모 (실측)" },
        { name: "문화셈터 국가승인통계", role: "지표 대조" },
      ],
    },
  ],
  note:
    "진흥원 개방 공공데이터 22건 중 1종 이상 필수 활용 요건을 충족하며, 연구·연차보고서 RAG로 AI 가점 요건에 대응한다.",
} as const;

/* ── 05. 검증 · 신뢰 ── */
export const validation = {
  kicker: "Trust · 05",
  title: "추정에는 반드시\n'탐색용' 꼬리표를 단다",
  lead:
    "화려한 예측일수록 검증 부담을 진다. CULTURE TWIN은 미검증 산출물을 UI에서 숨기지 않고 배지로 드러낸다.",
  methods: [
    {
      no: "01",
      title: "진단 타당성",
      desc:
        "공급 밀도 순위와 국민문화예술활동조사 경험률 순위의 스피어만 순위상관으로, 밀도 진단이 실제 경험을 설명하는지 검증한다.",
    },
    {
      no: "02",
      title: "예측 백테스트",
      desc:
        "과거 연도 데이터를 홀드아웃해 개입 예측의 MAE·순위상관을 측정한다. 탄력성 계수는 공개·조정 가능하다.",
    },
    {
      no: "03",
      title: "정직한 표기",
      desc:
        "보정 전 모든 추정치에는 '탐색용' 배지를 부착한다. 근거자료 내보내기에도 가정·출처·한계를 함께 담는다.",
    },
  ],
} as const;

/* ── 06. 기대효과 (15점) · 확장성 (10점) ── */
export const impact = {
  kicker: "Impact & Scale · 06",
  title: "근거가\n예산을 움직인다",
  lead:
    "북극성 지표는 하나 — 실무자가 예산·배치 의사결정에 이 도구의 산출물을 실제 근거로 쓰는 것.",
  effects: [
    {
      title: "예산 근거자료, 원클릭",
      desc: "지역·개입안·Before/After·출처를 담은 근거자료를 즉시 내보낸다.",
    },
    {
      title: "사각지대 우선순위",
      desc: "직감이 아니라 지수로, 어디에 먼저 투입할지 순서를 매긴다.",
    },
    {
      title: "배치 적중률 추적",
      desc: "도입 이후 개선 여부를 지표로 되짚어, 다음 배치를 학습시킨다.",
    },
  ],
  roadmap: [
    { phase: "P0", title: "MVP — 밀도·사각지대 지도 + What-if + 내보내기", desc: "공개 CSV/API, 규칙기반 계산 (현재)" },
    { phase: "P1", title: "공급↔경험 교차진단 · 시·군·구 드릴다운 · 배치 추천", desc: "+ 국민문화예술활동조사, 최적화" },
    { phase: "P2", title: "RAG 요약 · 자연어 질의응답", desc: "+ 연구·연차보고서 API, LLM" },
    { phase: "P3", title: "시민 에이전트 행동 시뮬레이션", desc: "보정 후 에이전트 모델" },
  ],
} as const;

/* ── 레이어 Ⅲ · 자연어 정책 인터페이스 (OpenAI 연동) ── */
export const ask = {
  kicker: "Ask the Twin · 자연어 정책 인터페이스",
  title: "코딩 없이,\n트윈에게 묻는다",
  lead:
    "통계·코딩 지식이 없어도 됩니다. 자연어로 물으면 트윈이 지도를 움직여 답합니다. 지역·강사 수를 말하면 위 시뮬레이션이 실제로 반응합니다.",
  greeting:
    "안녕하세요. CULTURE TWIN 정책 분석 어시스턴트입니다. 지역과 개입(강사·프로그램 수)을 말씀하시면 트윈이 반응하고, 사각지대 변화를 함께 해석해 드립니다. 예: \"울산에 강사 10명을 추가하면?\"",
  placeholder: "예: 울산에 강사 10명을 추가하면 사각지대가 얼마나 줄어드나요?",
  suggestions: [
    "사각지대가 가장 심한 지역은 어디인가요?",
    "울산에 강사 10명을 추가하면?",
    "인구 큰 도시인데 밀도가 낮은 곳은?",
    "울산과 대구 중 어디가 더 시급한가요?",
  ],
  appliedPrefix: "트윈 반영",
  disclaimer:
    "AI 응답은 탐색용 예시 데이터에 근거한 참고 정보입니다. 실측 데이터로 교체 시 실제 수치가 반영됩니다.",
  errorMessage:
    "지금은 자연어 응답 연결이 어렵습니다. 잠시 후 다시 시도해 주세요. (OPENAI_API_KEY 설정을 확인하세요.)",
} as const;

/* ── 디자인 DNA / 기원 ── */
export const dna = {
  kicker: "Origin",
  title: "보이지 않는 것을\n감각으로",
  body:
    "CULTURE TWIN의 시각 언어는 두 개의 원작에서 왔다. 명제 프로젝트 ABSTRACT VISUALIZER — '보이지 않는 힘·소리·에너지를 빛과 움직임으로 치환한다'. 그리고 아트 영상 CHOREOS — 반투명한 유기적 조형과 유동하는 빛. 이 감각을 데이터에 적용한 것이 트윈의 살아 움직이는 시각 피부다.",
  sources: [
    { name: "ABSTRACT VISUALIZER", note: "명제 — 보이지 않는 것을 감각으로" },
    { name: "CHOREOS", note: "반투명 유기 조형 · 빛의 밀도" },
    { name: "Refik Anadol · Dataland", note: "영감 — 데이터가 안료가 된다" },
    { name: "MIT Social Digital Twin", note: "영감 — LLM 에이전트 시뮬레이션" },
  ],
  disclaimer:
    "해외 사례는 벤치마크·영감이며, 진흥원 데이터 적용은 국내 첫 시도로 제안된다.",
} as const;

/* ── Footer ── */
export const footer = {
  description:
    "예산을 쓰기 전에, 결과를 본다. 공공데이터로 만든 문화예술교육 정책 디지털 트윈 — 2026 한국문화예술교육진흥원 공공데이터 활용 아이디어 공모전 출품작.",
  groups: [
    {
      title: "둘러보기",
      links: [
        { label: "문제 인식", href: "/#problem" },
        { label: "개념", href: "/#concept" },
        { label: "기대효과·확장성", href: "/#impact" },
        { label: "디자인 기원", href: "/#dna" },
      ],
    },
    {
      title: "체험 · 데이터",
      links: [
        { label: "트윈 체험", href: "/twin" },
        { label: "활용 데이터", href: "/data" },
        { label: "검증·방법론", href: "/data" },
      ],
    },
  ],
  sources: [
    { label: "한국문화예술교육진흥원", href: "https://www.arte.or.kr" },
    { label: "공공데이터포털", href: "https://www.data.go.kr" },
    { label: "국민문화예술활동조사", href: "https://www.mcst.go.kr" },
  ],
  legal: [
    { label: "출품 · artedata@arte.or.kr", href: "mailto:artedata@arte.or.kr" },
  ],
} as const;
