"use client";

import Link from "next/link";
import { BellRing } from "lucide-react";
import BuddyCard from "@/components/BuddyCard";
import CommunityRows from "@/components/CommunityRows";
import { Empty } from "@/components/ui";
import { BigRaceCard, CompactRaceCard } from "./RaceCards";
import { CountRow, SectionHead } from "./Section";
import { HANDOFF } from "./Hero";
import { buddyClosed, raceStatus } from "@/lib/derive";
import { monthKey, today } from "@/lib/date";
import { useApp } from "@/lib/store";

export function UpcomingSection() {
  const { data } = useApp();
  const t = today();
  const list = data.races
    .filter((r) => raceStatus(r, t) === "접수 예정")
    .sort((a, b) => a.regOpen.localeCompare(b.regOpen));

  return (
    <section className="mt-16">
      <SectionHead
        eyebrow="Registration soon"
        title={<>곧 접수가 시작되는 대회를<br className="hidden sm:block" /> 미리 준비하세요</>}
        sub="접수 시작일을 확인하고, 관심 대회로 저장해 신청 일정을 놓치지 마세요."
        cta={{ href: "/races", label: "전체 대회 살펴보기" }}
      />
      <CountRow label="접수 오픈 예정" count={list.length} />
      {list.length ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, 6).map((r) => <BigRaceCard key={r.id} race={r} />)}
        </div>
      ) : (
        <div className="mt-5"><Empty>접수 예정인 대회가 없어요.</Empty></div>
      )}
    </section>
  );
}

export function ThisMonthSection() {
  const { data } = useApp();
  const t = today();
  const month = Number(t.slice(5, 7));
  const list = data.races
    .filter((r) => monthKey(r.date) === monthKey(t) && r.date >= t)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <section className="mt-16">
      <SectionHead
        eyebrow="This month"
        title={<>{month}월에 열리는<br className="hidden sm:block" /> 러닝 대회를 만나보세요</>}
        sub="이번 달 남은 대회 일정을 개최일 순서로 한눈에 확인해 보세요."
        cta={{ href: "/calendar", label: "전체 달력 보기" }}
      />
      <CountRow label={`${month}월 남은 대회`} count={list.length} />
      {list.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, 12).map((r) => <CompactRaceCard key={r.id} race={r} />)}
        </div>
      ) : (
        <div className="mt-5"><Empty>이번 달에 남은 대회가 없어요.</Empty></div>
      )}
    </section>
  );
}

export function OpenSection() {
  const { data } = useApp();
  const t = today();
  const list = data.races
    .filter((r) => raceStatus(r, t) === "접수중")
    .sort((a, b) => a.regClose.localeCompare(b.regClose));

  return (
    <section className="mt-16">
      <SectionHead
        eyebrow="Registration open"
        title={<>지금 접수 중인<br className="hidden sm:block" /> 대회를 확인하세요</>}
        sub="현재 접수 중인 대회를 마감이 가까운 순서로 확인해 보세요."
        cta={{ href: "/races", label: "접수 중 대회 전체 보기" }}
      />
      <CountRow label="현재 접수 중" count={list.length} />
      {list.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, 12).map((r) => <CompactRaceCard key={r.id} race={r} showDeadline />)}
        </div>
      ) : (
        <div className="mt-5"><Empty>지금 접수 중인 대회가 없어요.</Empty></div>
      )}
    </section>
  );
}

/** TogeRun 고유 구획: 모집 중인 동행 */
export function BuddySection() {
  const { data, myBlocked } = useApp();
  const t = today();
  const list = data.buddyPosts
    .filter((p) => !myBlocked.includes(p.authorId) && !buddyClosed(p, data.races.find((r) => r.id === p.raceId), t))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <section className="mt-16">
      <SectionHead
        eyebrow="Running buddies"
        title={<>같이 뛸 사람을<br className="hidden sm:block" /> 지금 찾고 있어요</>}
        sub="종목, 동행 방식, 출발 지역을 보고 나에게 맞는 모집글을 골라 보세요."
        cta={{ href: "/races", label: "대회에서 모집글 쓰기" }}
      />
      <CountRow label="모집 중인 동행" count={list.length} />
      {list.length ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, 6).map((p) => <BuddyCard key={p.id} post={p} showRace />)}
        </div>
      ) : (
        <div className="mt-5"><Empty>지금 모집 중인 동행이 없어요.</Empty></div>
      )}
    </section>
  );
}

/** TogeRun 고유 구획: 대회별 커뮤니티 최신 글 */
export function CommunitySection() {
  const { data, myBlocked } = useApp();
  const list = data.cposts
    .filter((p) => !myBlocked.includes(p.authorId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <section className="mt-16">
      <SectionHead
        eyebrow="Community"
        title={<>대회별 커뮤니티의<br className="hidden sm:block" /> 최신 이야기</>}
        sub="코스, 이동, 준비물까지 같은 대회에 나가는 러너들의 질문과 팁을 확인해 보세요."
        cta={{ href: "/community", label: "커뮤니티 전체 보기" }}
      />
      <div className="mt-6">
        {list.length ? <CommunityRows posts={list} showRace /> : <Empty>아직 글이 없어요.</Empty>}
      </div>
    </section>
  );
}

export function AlertBand() {
  const { me } = useApp();
  return (
    <section className="mt-16 overflow-hidden rounded-3xl bg-zinc-900 px-6 py-10 text-white sm:px-10">
      <p className="text-xs font-bold uppercase tracking-widest text-orange-400">Registration alerts</p>
      <h2 className="mt-2 text-2xl font-extrabold leading-tight sm:text-3xl">접수 소식을 놓치지 마세요</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-300">
        관심 대회를 저장하면 접수 오픈과 마감 전에 알려 드려요. 필요한 소식만 한눈에 정리해 드릴게요.
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-white/10 px-3 py-1">새로운 대회 일정</span>
        <span className="rounded-full bg-white/10 px-3 py-1">접수 오픈 알림</span>
        <span className="rounded-full bg-white/10 px-3 py-1">마감 임박 알림</span>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/races" className="inline-flex items-center gap-1.5 rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold hover:bg-orange-700">
          <BellRing size={16} /> 관심 대회 저장하고 알림 받기
        </Link>
        <Link href={me ? "/alerts" : "/login"} className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold hover:bg-white/10">
          {me ? "내 알림 보기" : "로그인"}
        </Link>
      </div>
    </section>
  );
}

export { HANDOFF };
