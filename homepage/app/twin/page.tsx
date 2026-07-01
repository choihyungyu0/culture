import type { Metadata } from "next";
import { TwinSection } from "@/components/site/twin/twin-section";

export const metadata: Metadata = {
  title: "트윈 체험",
  description:
    "17개 시·도를 빛의 밀도로 보고, 강사·프로그램 개입을 실행 전에 시뮬레이션하는 인터랙티브 정책 디지털 트윈.",
};

export default function TwinPage() {
  return (
    <main id="main" className="bg-ink pt-16 lg:pt-20">
      <TwinSection />
    </main>
  );
}
