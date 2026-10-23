"use client";

import Hero from "@/components/home/Hero";
import KindTabs from "@/components/KindTabs";
import { BuddySection, CommunitySection, OpenSection, ReviewedSection, ThisMonthSection, UpcomingSection } from "@/components/home/Lists";
import { useKind } from "@/lib/kind";

/**
 * 앱 홈. 맨 위의 종류·범위 선택(마라톤/트레일러닝, 국내/해외)에 따라 아래 모든 구획이 바뀐다:
 * 검색·현황 → 모집 중인 버디 → 접수 중 → 접수 예정 → 이번 달 → 후기 → 커뮤니티.
 */
export default function Home() {
  const [kind, setKind] = useKind();
  return (
    <div className="-mt-4">
      <div className="sticky top-14 z-[1900] -mx-4 border-b border-zinc-200 bg-zinc-50/95 px-4 py-2.5 backdrop-blur">
        <KindTabs kind={kind} onChange={setKind} />
      </div>
      <div className="mt-4 space-y-4">
        <Hero />
        <BuddySection />
        <OpenSection />
        <UpcomingSection />
        <ThisMonthSection />
        <ReviewedSection />
        <CommunitySection />
      </div>
    </div>
  );
}
