"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { ask } from "@/lib/content";
import {
  REGIONS,
  REGION_BY_CODE,
  recompute,
  type Region,
} from "@/lib/twin-data";
import { useTwinStore } from "@/store/useStore";

type Msg = { role: "user" | "assistant"; content: string; applied?: string };

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/** 자연어 → 트윈 개입 의도 파싱 (규칙기반, 결정적) */
function parseIntent(text: string): {
  region?: Region;
  addInstructors?: number;
  addPrograms?: number;
} {
  // 지역: 약칭(서울/전남…) 우선, 없으면 정식명 부분일치
  let region = REGIONS.find((r) => text.includes(r.code));
  if (!region) {
    region = REGIONS.find((r) => {
      const short = r.name
        .replace(/(특별자치도|특별자치시|특별시|광역시|도)$/u, "")
        .slice(0, 2);
      return short.length >= 2 && text.includes(short);
    });
  }
  const instr = text.match(/강사[^\d]{0,6}(\d{1,3})/);
  const prog = text.match(/프로그램[^\d]{0,6}(\d{1,3})/);
  return {
    region,
    addInstructors: instr ? clamp(Number(instr[1]), 0, 50) : undefined,
    addPrograms: prog ? clamp(Number(prog[1]), 0, 120) : undefined,
  };
}

export function TwinAsk() {
  const { selectedCode, addInstructors, addPrograms, select, setAddInstructors, setAddPrograms } =
    useTwinStore();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const started = messages.length > 0;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;

    // 1) 자연어 → 트윈 조작 (지도가 실제로 반응)
    const intent = parseIntent(content);
    const code = intent.region?.code ?? selectedCode;
    const region = REGION_BY_CODE[code];
    const effI = intent.addInstructors ?? addInstructors;
    const effP = intent.addPrograms ?? addPrograms;
    if (intent.region) select(code);
    if (intent.addInstructors != null) setAddInstructors(effI);
    if (intent.addPrograms != null) setAddPrograms(effP);

    const appliedParts: string[] = [];
    if (intent.region) appliedParts.push(region.name);
    if (intent.addInstructors != null) appliedParts.push(`강사 +${effI}`);
    if (intent.addPrograms != null) appliedParts.push(`프로그램 +${effP}`);
    const applied = appliedParts.length
      ? `${ask.appliedPrefix}: ${appliedParts.join(" · ")}`
      : undefined;

    // 2) AI grounding용 컨텍스트 (정확한 Before→After 수치)
    const sim = recompute(region, effI, effP);
    const context = `선택 지역: ${region.name}(${code}); 개입: 강사 +${effI}, 프로그램 +${effP}; 결과(탐색용): 밀도 ${sim.before.density}→${sim.after.density}, 사각지대지수 ${sim.before.gap}→${sim.after.gap}.`;

    const next: Msg[] = [...messages, { role: "user", content, applied }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          context,
        }),
      });
      if (!res.ok || !res.body) throw new Error(String(res.status));

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          const last = copy[copy.length - 1];
          if (last?.role === "assistant") {
            copy[copy.length - 1] = { ...last, content: last.content + chunk };
          }
          return copy;
        });
      }
    } catch {
      setMessages((m) => {
        const copy = [...m];
        const last = copy[copy.length - 1];
        if (last?.role === "assistant") {
          copy[copy.length - 1] = { ...last, content: ask.errorMessage };
        }
        return copy;
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="instrument-panel flex flex-col rounded-2xl p-6 lg:p-7">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-mint" />
        <span className="kicker text-white/40">{ask.kicker}</span>
      </div>

      {/* transcript */}
      <div
        ref={scrollRef}
        aria-live="polite"
        className="mt-5 max-h-72 min-h-[7rem] overflow-y-auto pr-1"
        data-lenis-prevent
      >
        {!started ? (
          <p className="text-sm leading-relaxed text-white/60">{ask.greeting}</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {messages.map((m, i) => (
              <li
                key={i}
                className={m.role === "user" ? "flex flex-col items-end" : "flex flex-col items-start"}
              >
                <div
                  className={
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed " +
                    (m.role === "user"
                      ? "bg-white text-ink"
                      : "bg-white/[0.06] text-white/85")
                  }
                >
                  {m.content || (
                    <span className="inline-flex gap-1">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/50" />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/50 [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/50 [animation-delay:0.4s]" />
                    </span>
                  )}
                </div>
                {m.applied && (
                  <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-mint/15 px-2.5 py-1 font-mono text-[0.62rem] text-mint ring-1 ring-mint/30">
                    ↳ {m.applied}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* suggestions */}
      {!started && (
        <div className="mt-5 flex flex-wrap gap-2">
          {ask.suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="rounded-full border border-white/12 bg-white/[0.03] px-3 py-1.5 text-xs text-white/65 transition-colors hover:bg-white/10 hover:text-white"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-5 flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] py-1.5 pl-4 pr-1.5"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={ask.placeholder}
          aria-label="트윈에게 질문하기"
          className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="보내기"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-ink transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </form>

      <p className="mt-3 text-[0.7rem] leading-relaxed text-white/35">
        {ask.disclaimer}
      </p>
    </div>
  );
}
