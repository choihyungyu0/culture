import type { Metadata } from "next";
import "./globals.css";
import { Syne, Space_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Preloader } from "@/components/site/preloader";
import { Cursor } from "@/components/site/cursor";
import { ScrollProgress } from "@/components/site/scroll-progress";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";

// Self-hosted Pretendard Variable (OFL) — body / UI (Korean-safe).
const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  weight: "45 920",
  variable: "--font-pretendard",
  display: "swap",
  preload: true,
});

// Syne — Latin display face (wordmark, latin accents, big numerals).
const syne = Syne({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

// Space Mono — labels / data readouts.
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

const SITE_NAME = "CULTURE TWIN";
const SITE_DESC =
  "예산을 쓰기 전에, 결과를 본다. 공공데이터로 만든 문화예술교육 정책 디지털 트윈에서 강사·프로그램 배치 같은 정책 개입을 실행 전에 시뮬레이션하고, 지역 간 공급 격차와 사각지대를 감각적으로 시각화합니다.";

export const metadata: Metadata = {
  metadataBase: new URL("https://culture-twin.kr"),
  title: {
    default: `${SITE_NAME} — 예산을 쓰기 전에, 결과를 본다`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESC,
  keywords: [
    "문화예술교육",
    "정책 디지털 트윈",
    "공공데이터",
    "사각지대",
    "정책 시뮬레이션",
    "한국문화예술교육진흥원",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — 예산을 쓰기 전에, 결과를 본다`,
    description: SITE_DESC,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${syne.variable} ${spaceMono.variable}`}
    >
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          본문으로 건너뛰기
        </a>
        <Preloader />
        <Navbar />
        {children}
        <Footer />
        <div className="grain" aria-hidden />
        <ScrollProgress />
        <Cursor />
      </body>
    </html>
  );
}
