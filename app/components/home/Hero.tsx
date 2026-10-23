"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Flag, Search } from "lucide-react";
import { buddyClosed, raceStatus } from "@/lib/derive";
import { monthKey, today } from "@/lib/date";
import { kindLabel, matchKind, useKind } from "@/lib/kind";
import { useApp } from "@/lib/store";
import RunnerTrack from "./RunnerTrack";

/** 목록 화면으로 검색어·상태를 넘긴다. URL 파라미터 대신 세션 저장소를 쓴다. */
export const HANDOFF = { q: "togerun-q", status: "togerun-status", past: "togerun-past" } as const;

/** 앱 홈의 맨 위: 검색, 현황 숫자, 종류별 바로가기. 아래에서는 러너가 트랙을 달린다 */
export default function Hero() {
  const router = useRouter();
  const { data, myBlocked } = useApp();
  const [q, setQ] = useState("");
  const t = today();

  const [kind] = useKind();
  const live = data.races.filter((r) => {
    const s = raceStatus(r, t);
    return matchKind(r, kind) && s !== "종료" && s !== "취소";
  });
  const open = live.filter((r) => raceStatus(r, t) === "접수중").length;
  const soon = live.filter((r) => raceStatus(r, t) === "접수 예정").length;
  const month = live.filter((r) => monthKey(r.date) === monthKey(t)).length;
  const buddies = data.buddyPosts.filter((p) => {
    const race = data.races.find((r) => r.id === p.raceId);
    return !!race && matchKind(race, kind) && !myBlocked.includes(p.authorId) && !buddyClosed(p, race, t);
  }).length;

  const go = (status: string) => {
    sessionStorage.setItem(HANDOFF.status, status);
    router.push("/races");
  };
  const search = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) sessionStorage.setItem(HANDOFF.q, q.trim());
    router.push("/races");
  };

  const stats = [
    { label: "접수 중", value: open, onClick: () => go("접수중"), strong: true },
    { label: "접수 예정", value: soon, onClick: () => go("접수 예정") },
    { label: "이번 달", value: month, onClick: () => router.push("/calendar") },
    { label: "버디 모집", value: buddies, onClick: () => router.push("/buddy") },
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl bg-orange-50 px-4 pb-28 pt-5">
      <h1 className="sr-only">TogeRun 홈</h1>
      <Link href="/info/guide" className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-semibold text-orange-700">
        <Flag size={12} /> 마라톤 버디 가이드
      </Link>
      <p className="mt-3 text-[1.75rem] font-extrabold leading-[1.2] tracking-tight">
        같이 뛸 사람을
        <br />
        찾는 가장 빠른 방법.
      </p>

      <form onSubmit={search} className="mt-4 flex items-center gap-2 rounded-full border border-zinc-300 bg-white p-1.5 pl-4 focus-within:border-orange-500">
        <Search size={16} className="shrink-0 text-zinc-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="대회명, 지역, 장소 검색"
          aria-label="대회 검색"
          className="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none"
        />
        <button type="submit" className="shrink-0 rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white">
          검색
        </button>
      </form>

      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        {stats.map((s) => (
          <button
            key={s.label}
            onClick={s.onClick}
            className={`rounded-xl border px-1 py-2.5 ${s.strong ? "border-orange-600 bg-orange-600 text-white" : "border-zinc-200 bg-white"}`}
          >
            <p className="text-lg font-extrabold tabular-nums">{s.value}</p>
            <p className={`text-xs ${s.strong ? "text-orange-50" : "text-zinc-600"}`}>{s.label}</p>
          </button>
        ))}
      </div>

      <p className="mt-2 text-center text-xs text-zinc-600">{kindLabel(kind)} 기준 현황이에요. 위 버튼으로 종류를 바꿔 보세요.</p>

      <RunnerTrack />
    </section>
  );
}
