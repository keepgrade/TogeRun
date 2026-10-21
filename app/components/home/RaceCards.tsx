"use client";

import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui";
import { raceStats, raceStatus } from "@/lib/derive";
import { dday, fmtDate, parse, today } from "@/lib/date";
import { feeRange, scaleText, uniqueDistances } from "@/lib/format";
import { useApp } from "@/lib/store";
import { TYPE_LABEL, type Race } from "@/lib/types";

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

const mmdd = (date: string) => {
  const d = parse(date);
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
};

/** 큰 카드: 곧 접수가 시작되는 대회 */
export function BigRaceCard({ race }: { race: Race }) {
  const { data, me } = useApp();
  const t = today();
  const s = raceStats(data, race.id, me?.id ?? null);
  const status = raceStatus(race, t);
  const dow = DOW[parse(race.date).getDay()];

  return (
    <Link
      href={`/races/${race.id}`}
      className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-extrabold leading-none tracking-tight">{mmdd(race.date)}</p>
          <p className="mt-1 text-xs text-zinc-500">{dow}요일</p>
        </div>
        <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-bold text-white">{dday(race.date, t)}</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge tone="ink">{TYPE_LABEL[race.type]}</Badge>
        {race.scope === "해외" && <Badge tone="blue">해외</Badge>}
        <StatusBadge status={status} />
      </div>
      <h3 className="mt-2 text-lg font-bold leading-snug group-hover:text-orange-700">{race.name}</h3>
      <p className="mt-1 flex items-center gap-1 text-sm text-zinc-500">
        <MapPin size={14} /> {race.region} · {race.venue}
      </p>
      <p className="mt-3 text-sm font-semibold">{feeRange(race.courses, race.currency)}</p>
      <p className="mt-1 text-sm text-zinc-600">{uniqueDistances(race.courses).join(" / ")}</p>
      <p className="mt-0.5 text-sm text-zinc-500">{scaleText(race.scale)}</p>
      <div className="mt-4 flex items-center justify-between rounded-xl bg-orange-50 px-3 py-2 text-xs">
        <span className="text-orange-800">접수 시작</span>
        <span className="font-semibold text-orange-900">
          {fmtDate(race.regOpen)}
          {race.regOpenTime ? ` · ${race.regOpenTime}` : ""}
        </span>
      </div>
      <p className="mt-2 inline-flex items-center gap-1 text-xs text-zinc-500">
        <Users size={12} /> 모집중 {s.openBuddy} · 관심 {s.interest}
      </p>
    </Link>
  );
}

/** 작은 카드: 이번 달 대회, 지금 접수 중인 대회 */
export function CompactRaceCard({ race, showDeadline }: { race: Race; showDeadline?: boolean }) {
  const t = today();
  const status = raceStatus(race, t);
  const d = parse(race.date);
  let deadline = "";
  if (showDeadline && status === "접수중") deadline = race.regClose === t ? "오늘 마감" : `마감 ${dday(race.regClose, t)}`;
  const urgent = deadline === "오늘 마감" || /D-[0-3]$/.test(deadline);

  return (
    <Link
      href={`/races/${race.id}`}
      className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-orange-300 hover:shadow-sm"
    >
      <div className="w-14 shrink-0 text-center">
        <p className="text-xl font-extrabold leading-none">{mmdd(race.date)}</p>
        <p className="mt-1 text-xs text-zinc-500">{DOW[d.getDay()]}요일</p>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {status !== "접수 예정" && <StatusBadge status={status} />}
          {deadline && <span className={`text-xs font-bold ${urgent ? "text-red-600" : "text-zinc-600"}`}>{deadline}</span>}
        </div>
        <h3 className="mt-1 truncate font-semibold">{race.name}</h3>
        <p className="mt-0.5 truncate text-sm text-zinc-500">
          {race.region} · {race.venue}
        </p>
      </div>
    </Link>
  );
}
