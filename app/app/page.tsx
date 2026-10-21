"use client";

import Link from "next/link";
import RaceCard from "@/components/RaceCard";
import BuddyCard from "@/components/BuddyCard";
import { btnGhost, btnPrimary, Empty } from "@/components/ui";
import { buddyClosed, raceStatus } from "@/lib/derive";
import { monthKey, today } from "@/lib/date";
import { useApp } from "@/lib/store";

function Section({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        {href && (
          <Link href={href} className="text-sm text-zinc-500 hover:text-orange-700">
            전체 보기
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export default function Home() {
  const { data, myBlocked } = useApp();
  const t = today();

  const urgent = data.races
    .filter((r) => {
      const s = raceStatus(r, t);
      return s === "접수중" || s === "접수 예정";
    })
    .map((r) => ({ r, key: raceStatus(r, t) === "접수중" ? r.regClose : r.regOpen }))
    .sort((a, b) => a.key.localeCompare(b.key))
    .slice(0, 4)
    .map((x) => x.r);

  const openBuddy = data.buddyPosts
    .filter((p) => !myBlocked.includes(p.authorId) && !buddyClosed(p, data.races.find((r) => r.id === p.raceId), t))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);

  const thisMonth = data.races
    .filter((r) => monthKey(r.date) === monthKey(t) && r.date >= t && !r.cancelled)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  return (
    <div>
      <div className="rounded-2xl bg-gradient-to-br from-orange-600 to-orange-500 p-6 text-white">
        <p className="text-sm font-medium text-orange-100">혼자 신청하기 망설여지는 대회</p>
        <h1 className="mt-1 text-2xl font-extrabold leading-tight">같이 뛸 사람을 대회 페이지에서 바로 찾으세요</h1>
        <div className="mt-4 flex gap-2">
          <Link href="/races" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-orange-700">
            대회 둘러보기
          </Link>
        </div>
      </div>

      <Section title="접수 임박" href="/races">
        <div className="grid gap-3 sm:grid-cols-2">
          {urgent.map((r) => (
            <RaceCard key={r.id} race={r} />
          ))}
        </div>
      </Section>

      <Section title="모집 중인 동행">
        {openBuddy.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {openBuddy.map((p) => (
              <BuddyCard key={p.id} post={p} showRace />
            ))}
          </div>
        ) : (
          <Empty
            action={
              <Link href="/races" className={btnPrimary}>
                대회에서 모집글 쓰기
              </Link>
            }
          >
            지금 모집 중인 동행이 없어요.
          </Empty>
        )}
      </Section>

      <Section title="이번 달 대회" href="/races">
        {thisMonth.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {thisMonth.map((r) => (
              <RaceCard key={r.id} race={r} />
            ))}
          </div>
        ) : (
          <Empty
            action={
              <Link href="/races" className={btnGhost}>
                전체 대회 보기
              </Link>
            }
          >
            이번 달에 남은 대회가 없어요.
          </Empty>
        )}
      </Section>
    </div>
  );
}
