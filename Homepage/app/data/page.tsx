import type { Metadata } from "next";
import { DataLayer } from "@/components/site/data-layer";
import { Validation } from "@/components/site/validation";

export const metadata: Metadata = {
  title: "데이터 · 검증",
  description:
    "진흥원 공공데이터 활용과 데이터 위계 원칙, 그리고 스피어만 순위상관·홀드아웃 백테스트로 신뢰를 검증하는 방법.",
};

export default function DataPage() {
  return (
    <main id="main" className="pt-16 lg:pt-20">
      <DataLayer />
      <Validation />
    </main>
  );
}
