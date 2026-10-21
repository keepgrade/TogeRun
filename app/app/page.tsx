"use client";

import Hero from "@/components/home/Hero";
import { Finder, MapPreview } from "@/components/home/FinderAndMap";
import { AlertBand, BuddySection, CommunitySection, OpenSection, ThisMonthSection, UpcomingSection } from "@/components/home/Lists";

/**
 * 홈. 섹션 순서와 배치는 대회 정보 서비스의 홈 구조(히어로+현황 카드 → 탐색 방식 → 지도 →
 * 접수 예정 → 이번 달 → 접수중 → 알림 안내)를 따르고, TogeRun의 동행·커뮤니티 구획을 더했다.
 */
export default function Home() {
  return (
    <div className="pb-8">
      <Hero />
      <Finder />
      <MapPreview />
      <UpcomingSection />
      <ThisMonthSection />
      <OpenSection />
      <BuddySection />
      <CommunitySection />
      <AlertBand />
    </div>
  );
}
