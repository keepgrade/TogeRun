"use client";

import Hero from "@/components/home/Hero";
import { Finder, MapPreview } from "@/components/home/FinderAndMap";
import {
  AlertBand, BuddySection, CommunitySection, OpenSection, OverseasSection, ThisMonthSection, TrailSection, UpcomingSection,
} from "@/components/home/Lists";

/**
 * 홈. 섹션 순서와 배치는 대회 정보 서비스의 홈 구조(히어로+현황 카드 → 탐색 방식 → 지도 →
 * 접수 예정 → 이번 달 → 접수중 → 알림 안내)를 따르되, TogeRun의 핵심 기능인 버디·커뮤니티 구획을
 * 탐색 방식 카드 바로 아래로 올렸다.
 */
export default function Home() {
  return (
    <div className="pb-8">
      <Hero />
      <Finder />
      <BuddySection />
      <CommunitySection />
      <MapPreview />
      <UpcomingSection />
      <ThisMonthSection />
      <OpenSection />
      <TrailSection />
      <OverseasSection />
      <AlertBand />
    </div>
  );
}
