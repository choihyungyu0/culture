import { NextRequest } from "next/server";
import {
  REGIONS,
  NATIONAL,
  PROGRAMS_PER_INSTRUCTOR,
  DENSITY_FLOOR,
  DENSITY_CEIL,
} from "@/lib/twin-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ── 트윈 데이터를 프롬프트에 주입 (항상 실제 데이터와 동기화) ── */
const REGION_TABLE = REGIONS.map(
  (r) =>
    `${r.code}(${r.name}): 밀도 ${r.density_per_100k}/10만, 사각지대지수 ${r.gap_index}, 경험률 ${Math.round(
      r.experience_rate * 100
    )}%, 진단 ${r.diagnosis.split(" —")[0]}`
).join("\n");

/* ── 레이어 Ⅲ · 자연어 정책 인터페이스 페르소나 (데이터 grounded) ── */
const SYSTEM_PROMPT = `당신은 "CULTURE TWIN"의 문화예술교육 정책 분석 어시스턴트입니다.
CULTURE TWIN은 공공데이터로 만든 정책 디지털 트윈으로, 지역 간 문화예술교육 공급 격차와 사각지대를 진단하고
'강사·프로그램을 N개 추가하면?' 같은 정책 개입을 실행 전에 시뮬레이션합니다. 슬로건: "예산을 쓰기 전에, 결과를 본다."

[중요 · 데이터 성격]
아래 수치는 인구(행안부 실측)만 실제이고, 프로그램·강사·경험률은 스토리 검증용 '탐색용 예시' 데이터입니다.
반드시 단정하지 말고, 필요한 경우 "탐색용 예시 기준"임을 짧게 밝히세요.

[계산 규칙 (투명한 규칙기반)]
- 공급 밀도 = (프로그램 수 ÷ 인구) × 10만
- 사각지대지수 = 공급 밀도를 목표범위(${DENSITY_FLOOR}~${DENSITY_CEIL})로 역정규화한 0~100 값 (높을수록 부족)
- 개입 탄력성: 예술강사 1명 추가 ≈ 프로그램 ${PROGRAMS_PER_INSTRUCTOR}개 추가
- 개입 질문에는 위 규칙으로 대략적 Before→After(밀도·사각지대지수)를 추정해 제시하되, 탐색용 추정임을 밝히세요.

[진단 유형]
- 구조적 사각지대(공급↓·경험↓): 최우선 개입
- 전달 실패(공급↑·경험↓): 홍보·접근성 개선
- 공급 열세(공급↓·경험 유지): 프로그램 밀도 보강

[전국 요약] 시·도 17개, 평균 밀도 ${NATIONAL.avgDensity}/10만, 최고 사각지대 ${NATIONAL.worst.code}(지수 ${NATIONAL.worst.gap_index}), 최저 ${NATIONAL.best.code}(지수 ${NATIONAL.best.gap_index}).

[시·도별 데이터]
${REGION_TABLE}

[응답 원칙]
- 한국어로 간결하게, 보통 2~5문장. 표·수치는 위 데이터에 근거해 정확히 인용하세요.
- 지어내지 마세요. 데이터에 없는 건 "현재 트윈에는 없는 지표"라고 솔직히 말하세요.
- 개입을 물으면 어느 지역에 왜 먼저 투입해야 하는지 근거와 함께 제안하세요.
- 정책·데이터와 무관한 질문에는 가볍게만 답하고 본 주제로 돌아오세요.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return new Response(
      "자연어 인터페이스가 아직 설정되지 않았습니다(OPENAI_API_KEY 없음).",
      { status: 503 }
    );
  }

  let messages: ChatMessage[] = [];
  let context = "";
  try {
    const body = await req.json();
    messages = Array.isArray(body?.messages) ? body.messages : [];
    context = String(body?.context ?? "").slice(0, 1200);
  } catch {
    return new Response("잘못된 요청입니다.", { status: 400 });
  }

  const safe = messages
    .slice(-12)
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m?.content ?? "").slice(0, 2000),
    }))
    .filter((m) => m.content.trim().length > 0);

  if (safe.length === 0) {
    return new Response("메시지가 비어 있습니다.", { status: 400 });
  }

  const systemMessages = [{ role: "system", content: SYSTEM_PROMPT }];
  if (context.trim()) {
    systemMessages.push({
      role: "system",
      content: `[사용자가 방금 자연어로 만든 트윈 상태 — 이 수치를 최우선 근거로 답하세요]\n${context}`,
    });
  }

  let upstream: Response;
  try {
    upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        stream: true,
        temperature: 0.4,
        max_tokens: 500,
        messages: [...systemMessages, ...safe],
      }),
    });
  } catch {
    return new Response("응답을 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.", {
      status: 502,
    });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response(
      "응답을 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      { status: 502 }
    );
  }

  // Transform OpenAI SSE → plain text delta stream
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const dataStr = trimmed.slice(5).trim();
            if (dataStr === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(dataStr);
              const delta = json?.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // ignore keep-alive / partial frames
            }
          }
        }
      } catch {
        // upstream interrupted — close gracefully
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
