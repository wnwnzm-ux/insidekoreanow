import type { Metadata } from "next";
import { CampingApp } from "./CampingApp";

export const metadata: Metadata = {
  title: "캠핑 플래너 — 준비물 & 식단 체크리스트",
  description: "캠핑 준비물 체크리스트, 식단 플랜, 여행 일정 관리까지 한번에.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "캠핑 플래너",
  },
};

export default function CampingPage() {
  return <CampingApp />;
}
