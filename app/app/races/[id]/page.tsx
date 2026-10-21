"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ExternalLink, Star } from "lucide-react";
import FavoriteBar from "@/components/FavoriteBar";
import RaceInfo from "@/components/RaceInfo";
import { BuddyTab, ComingTab, CommunityTab } from "@/components/RaceTabs";
import { Empty, StatusBadge, btnGhost, card } from "@/components/ui";
import { raceStats, raceStatus } from "@/lib/derive";
import { dday, fmtDate, today } from "@/lib/date";
import { useApp } from "@/lib/store";

const TABS = [
  { key: "info", label: "정보" },
  { key: "buddy", label: "같이 뛸 사람" },
  { key: "review", label: "리뷰" },
  { key: "community", label: "커뮤니티" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function RaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, me } = useApp();
  const [tab, setTab] = useState<TabKey>("buddy");

  const race = data.races.find((r) => r.id === id);
  if (!race) {
    return (
      <Empty action={<Link href="/races" className={btnGhost}>대회 목록으로</Link>}>
        찾을 수 없는 대회예요.
      </Empty>
    );
  }

  const t = today();
  const status = raceStatus(race, t);
  const s = raceStats(data, race.id, me?.id ?? null);

  const dates = [
    { label: "접수 오픈", value: race.regOpen },
    { label: "접수 마감", value: race.regClose },
    { label: "대회일", value: race.date },
  ];

  return (
    <div>
      <Link href="/races" className="mb-3 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800">
        <ArrowLeft size={14} /> 대회 목록
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={status} />
        {race.type === "트레일" && <span className="text-xs text-zinc-500">트레일</span>}
      </div>
      <h1 className="mt-2 text-2xl font-extrabold leading-tight">{race.name}</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {race.region} · {race.venue}
      </p>

      <div className={`${card} mt-4 grid grid-cols-3 divide-x divide-zinc-100`}>
        {dates.map((d) => (
          <div key={d.label} className="p-3 text-center">
            <p className="text-xs text-zinc-500">{d.label}</p>
            <p className="mt-0.5 text-sm font-semibold">{fmtDate(d.value)}</p>
            <p className="text-xs font-bold text-orange-700">{dday(d.value, t)}</p>
          </div>
        ))}
      </div>
      {race.extraRegOpen && (
        <p className="mt-1 text-xs text-zinc-500">추가 접수 시작: {fmtDate(race.extraRegOpen)}</p>
      )}

      <FavoriteBar race={race} />

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <a href={race.officialUrl} target="_blank" rel="noreferrer" className={btnGhost}>
          <ExternalLink size={14} /> 공식 사이트에서 접수
        </a>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-600">
        <span>관심 러너 {s.interest}</span>
        <button onClick={() => setTab("buddy")} className="font-medium text-orange-700 underline-offset-2 hover:underline">
          모집중 {s.openBuddy}
        </button>
        <button onClick={() => setTab("review")} className="inline-flex items-center gap-1 hover:underline">
          <Star size={13} className="text-amber-500" />
          {s.reviewCount ? `${s.avg.toFixed(1)} (${s.reviewCount})` : "리뷰 없음"}
        </button>
        <button onClick={() => setTab("community")} className="hover:underline">
          커뮤니티 글 {s.postCount}
        </button>
      </div>

      <div role="tablist" className="mt-5 flex border-b border-zinc-200">
        {TABS.map((x) => (
          <button
            key={x.key}
            role="tab"
            aria-selected={tab === x.key}
            onClick={() => setTab(x.key)}
            className={`-mb-px flex-1 border-b-2 px-2 py-2.5 text-sm font-medium ${tab === x.key ? "border-orange-600 text-orange-700" : "border-transparent text-zinc-500"}`}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "info" && <RaceInfo race={race} />}
        {tab === "buddy" && <BuddyTab race={race} />}
        {tab === "review" && <ComingTab name="리뷰" />}
        {tab === "community" && <CommunityTab race={race} />}
      </div>
    </div>
  );
}
