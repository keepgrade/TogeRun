"use client";

import Link from "next/link";
import BuddyCard from "@/components/BuddyCard";
import CommunityRows from "@/components/CommunityRows";
import { Empty } from "@/components/ui";
import RunnerTrack from "./RunnerTrack";
import { BigRaceCard, CompactRaceCard } from "./RaceCards";
import { Band, CountRow, SectionHead } from "./Section";
import { HANDOFF } from "./Hero";
import { buddyClosed, raceStatus } from "@/lib/derive";
import { monthKey, today } from "@/lib/date";
import { kindLabel, matchKind, useKind } from "@/lib/kind";
import { useApp } from "@/lib/store";

export function UpcomingSection() {
  const { data } = useApp();
  const [kind] = useKind();
  const t = today();
  const list = data.races
    .filter((r) => matchKind(r, kind) && raceStatus(r, t) === "접수 예정")
    .sort((a, b) => a.regOpen.localeCompare(b.regOpen));

  return (
    <Band tone="sky">
      <SectionHead
        eyebrow="Registration soon"
        title={<>곧 접수가 시작되는 대회를<br className="hidden sm:block" /> 미리 준비하세요</>}
        sub="접수 시작일을 확인하고, 관심 대회로 저장해 신청 일정을 놓치지 마세요."
        cta={{ href: "/races", label: "전체 대회 살펴보기" }}
      />
      <CountRow label={`${kindLabel(kind)} 접수 오픈 예정`} count={list.length} />
      {list.length ? (
        <div className="tg-rail mt-5 sm:grid sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, 6).map((r) => <BigRaceCard key={r.id} race={r} />)}
        </div>
      ) : (
        <div className="mt-5"><Empty>접수 예정인 대회가 없어요.</Empty></div>
      )}
    </Band>
  );
}

export function ThisMonthSection() {
  const { data } = useApp();
  const [kind] = useKind();
  const t = today();
  const month = Number(t.slice(5, 7));
  const list = data.races
    .filter((r) => matchKind(r, kind) && monthKey(r.date) === monthKey(t) && r.date >= t)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Band tone="stone">
      <SectionHead
        eyebrow="This month"
        title={<>{month}월에 열리는<br className="hidden sm:block" /> 러닝 대회를 만나보세요</>}
        sub="이번 달 남은 대회 일정을 개최일 순서로 한눈에 확인해 보세요."
        cta={{ href: "/calendar", label: "전체 달력 보기" }}
      />
      <CountRow label={`${kindLabel(kind)} · ${month}월 남은 대회`} count={list.length} />
      {list.length ? (
        <div className="tg-rail mt-5 sm:grid sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, 12).map((r) => <CompactRaceCard key={r.id} race={r} />)}
        </div>
      ) : (
        <div className="mt-5"><Empty>이번 달에 남은 대회가 없어요.</Empty></div>
      )}
    </Band>
  );
}

export function OpenSection() {
  const { data } = useApp();
  const [kind] = useKind();
  const t = today();
  const list = data.races
    .filter((r) => matchKind(r, kind) && raceStatus(r, t) === "접수중")
    .sort((a, b) => a.regClose.localeCompare(b.regClose));

  return (
    <Band tone="orange">
      <SectionHead
        eyebrow="Registration open"
        title={<>지금 접수 중인<br className="hidden sm:block" /> 대회를 확인하세요</>}
        sub="현재 접수 중인 대회를 마감이 가까운 순서로 확인해 보세요."
        cta={{ href: "/races", label: "접수 중 대회 전체 보기" }}
      />
      <CountRow label={`${kindLabel(kind)} 현재 접수 중`} count={list.length} />
      {list.length ? (
        <div className="tg-rail mt-5 sm:grid sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, 12).map((r) => <CompactRaceCard key={r.id} race={r} showDeadline />)}
        </div>
      ) : (
        <div className="mt-5"><Empty>지금 접수 중인 대회가 없어요.</Empty></div>
      )}
    </Band>
  );
}

/** TogeRun 고유 구획: 후기가 많은 지난 대회 */
export function ReviewedSection() {
  const { data, myBlocked } = useApp();
  const [kind] = useKind();
  const t = today();
  const items = data.races
    .filter((r) => matchKind(r, kind) && raceStatus(r, t) === "종료")
    .map((r) => {
      const vs = data.reviews
        .filter((v) => v.raceId === r.id && !myBlocked.includes(v.authorId))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return { r, n: vs.length, avg: vs.length ? vs.reduce((sum, v) => sum + v.rating, 0) / vs.length : 0, latest: vs[0]?.body ?? "" };
    })
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n || b.avg - a.avg)
    .slice(0, 6);
  if (!items.length) return null;

  return (
    <Band tone="stone">
      <SectionHead
        eyebrow="Race reviews"
        title={<>먼저 뛰어본 사람들의<br className="hidden sm:block" /> 솔직한 후기</>}
        sub="끝난 대회의 코스, 운영, 접근성 후기를 보고 다음 대회를 골라 보세요."
        cta={{ href: "/races", label: "지난 대회 전체 보기", onClick: () => { sessionStorage.setItem(HANDOFF.past, "1"); } }}
      />
      <ul className="tg-rail mt-8 sm:grid sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ r, n, avg, latest }) => (
          <li key={r.id}>
            <Link
              href={`/races/${r.id}`}
              onClick={() => sessionStorage.setItem("togerun-tab", "review")}
              className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-4 hover:border-orange-300"
            >
              <p className="text-xs text-zinc-500">{r.scope === "해외" ? `${r.region} · ${r.city ?? ""}` : r.region} · {r.date.replaceAll("-", ".")}</p>
              <h3 className="mt-1 font-bold">{r.name}</h3>
              <p className="mt-2 text-sm">
                <span className="font-bold text-orange-700">★ {avg.toFixed(1)}</span>
                <span className="ml-2 text-zinc-500">후기 {n}개</span>
              </p>
              <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-zinc-600">“{latest}”</p>
            </Link>
          </li>
        ))}
      </ul>
    </Band>
  );
}

/** TogeRun 고유 구획: 모집 중인 버디 */
export function BuddySection() {
  const { data, myBlocked } = useApp();
  const [kind] = useKind();
  const t = today();
  const list = data.buddyPosts
    .filter((p) => {
      const race = data.races.find((r) => r.id === p.raceId);
      return !!race && matchKind(race, kind) && !myBlocked.includes(p.authorId) && !buddyClosed(p, race, t);
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <section
      className="relative mt-6 overflow-hidden rounded-2xl bg-orange-100 px-4 pb-32 pt-10 sm:px-10 sm:pb-40 sm:pt-14"
      style={{
        backgroundImage: "radial-gradient(rgba(234,88,12,0.16) 1.5px, transparent 1.6px), linear-gradient(#ffedd5, #ffedd5)",
        backgroundSize: "28px 28px, auto",
      }}
    >
      <SectionHead
        eyebrow="Running buddies"
        title={<>같이 뛸 사람을<br className="hidden sm:block" /> 지금 찾고 있어요</>}
        sub="종목, 버디 방식, 출발 지역을 보고 나에게 맞는 모집글을 골라 보세요."
        cta={{ href: "/buddy", label: "모집 중인 버디 전체 보기" }}
      />
      <CountRow dark={false} label={`${kindLabel(kind)} 모집 중인 버디`} count={list.length} />
      {list.length ? (
        <div className="tg-rail mt-5 sm:grid sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, 6).map((p) => <BuddyCard key={p.id} post={p} showRace />)}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl bg-white p-2"><Empty>이 종류에는 지금 모집 중인 버디가 없어요. 첫 모집글을 올려 보세요.</Empty></div>
      )}
      <RunnerTrack startScene={2} />
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

export { HANDOFF };
