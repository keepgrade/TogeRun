"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CalendarCheck, Flag, Search, Users } from "lucide-react";
import { buddyClosed, raceStatus } from "@/lib/derive";
import { fmtDate, monthKey, today } from "@/lib/date";
import { useApp } from "@/lib/store";

/** 목록 화면으로 검색어·상태를 넘긴다. URL 파라미터 대신 세션 저장소를 쓴다. */
export const HANDOFF = { q: "togerun-q", status: "togerun-status" } as const;

function Tile({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={`block rounded-2xl p-4 transition hover:-translate-y-0.5 ${className}`}>
      {children}
    </Link>
  );
}

export default function Hero() {
  const router = useRouter();
  const { data, myBlocked } = useApp();
  const [q, setQ] = useState("");
  const t = today();

  const live = data.races.filter((r) => {
    const s = raceStatus(r, t);
    return s !== "종료" && s !== "취소";
  });
  const open = live.filter((r) => raceStatus(r, t) === "접수중").length;
  const soon = live.filter((r) => raceStatus(r, t) === "접수 예정").length;
  const month = live.filter((r) => monthKey(r.date) === monthKey(t)).length;
  const buddies = data.buddyPosts.filter(
    (p) => !myBlocked.includes(p.authorId) && !buddyClosed(p, data.races.find((r) => r.id === p.raceId), t),
  ).length;

  const go = (status?: string) => {
    if (status) sessionStorage.setItem(HANDOFF.status, status);
    router.push("/races");
  };

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) sessionStorage.setItem(HANDOFF.q, q.trim());
    router.push("/races");
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 via-white to-amber-50 px-5 py-10 sm:px-10 sm:py-14">
      <div className="grid items-center gap-10 md:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-semibold text-orange-700">
            <Flag size={12} /> 마라톤 버디 가이드
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl">
            같이 뛸 사람을
            <br />
            찾는 가장
            <br />
            빠른 방법.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-600">
            대회 일정과 접수 정보를 한곳에서 보고, 마음에 드는 대회 페이지에서 바로 버디를 구하세요. 접수 오픈도 놓치지 않게 알려 드려요.
          </p>
          <form onSubmit={search} className="mt-6 flex max-w-md items-center gap-2 rounded-full border border-zinc-300 bg-white p-1.5 pl-4 shadow-sm focus-within:border-orange-500">
            <Search size={16} className="shrink-0 text-zinc-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="대회명, 지역, 장소 검색"
              aria-label="대회 검색"
              className="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none"
            />
            <button type="submit" className="shrink-0 rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
              대회 찾아보기
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-lg shadow-orange-100/60">
          <div className="mb-3 flex items-center justify-between px-1 text-xs">
            <span className="font-bold tracking-wider text-orange-700">TOGERUN LIVE</span>
            <span className="text-zinc-500">{fmtDate(t)} 기준</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Tile href="/races" className="border border-zinc-200 bg-zinc-50 hover:border-orange-300">
              <p className="text-xs text-zinc-500">현재 확인 가능한 대회</p>
              <p className="mt-2 text-4xl font-extrabold tabular-nums">{live.length}<span className="ml-1 text-base font-semibold text-zinc-500">개</span></p>
            </Tile>
            <button onClick={() => go("접수중")} className="rounded-2xl bg-orange-600 p-4 text-left text-white transition hover:-translate-y-0.5 hover:bg-orange-700">
              <p className="text-xs text-orange-100">지금 접수 중인 대회</p>
              <p className="mt-2 text-4xl font-extrabold tabular-nums">{open}<span className="ml-1 text-base font-semibold text-orange-100">개</span></p>
            </button>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <button onClick={() => go("접수 예정")} className="rounded-xl border border-zinc-200 p-3 hover:border-orange-300">
              <CalendarCheck size={16} className="mx-auto text-sky-600" />
              <p className="mt-1 text-zinc-500">접수 예정</p>
              <p className="text-base font-bold">{soon}</p>
            </button>
            <Link href="/calendar" className="rounded-xl border border-zinc-200 p-3 hover:border-orange-300">
              <CalendarCheck size={16} className="mx-auto text-emerald-600" />
              <p className="mt-1 text-zinc-500">이번 달</p>
              <p className="text-base font-bold">{month}</p>
            </Link>
            <Link href="/buddy" className="rounded-xl border border-zinc-200 p-3 hover:border-orange-300">
              <Users size={16} className="mx-auto text-orange-600" />
              <p className="mt-1 text-zinc-500">모집 중 버디</p>
              <p className="text-base font-bold">{buddies}</p>
            </Link>
          </div>
          <Link href="/buddy" className="mt-3 flex items-center justify-between rounded-xl bg-orange-50 px-3 py-2.5 text-xs text-orange-900">
            <span>지금 모집 중인 버디를 한곳에서 확인해 보세요</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
