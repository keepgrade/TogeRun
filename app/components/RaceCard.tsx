"use client";

import Link from "next/link";
import { Heart, MapPin, MessageSquare, Star, Users } from "lucide-react";
import RacePoster from "./RacePoster";
import { Badge, StatusBadge, card } from "./ui";
import { raceStats, raceStatus } from "@/lib/derive";
import { dday, fmtDate, today } from "@/lib/date";
import { feeRange, scaleText, uniqueDistances } from "@/lib/format";
import { useApp } from "@/lib/store";
import type { Race } from "@/lib/types";

export default function RaceCard({ race, extra }: { race: Race; extra?: string }) {
  const { data, me } = useApp();
  const t = today();
  const status = raceStatus(race, t);
  const s = raceStats(data, race.id, me?.id ?? null);

  let note = "";
  if (status === "접수 예정") note = `접수 오픈 ${dday(race.regOpen, t)}`;
  else if (status === "접수중") note = t === race.regClose ? "오늘 마감" : `마감 ${dday(race.regClose, t)}`;

  return (
    <Link href={`/races/${race.id}`} className={`${card} block p-4 transition hover:border-orange-300 hover:shadow-sm`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={status} />
          {note && <span className="text-xs font-semibold text-orange-700">{note}</span>}
          {race.type === "트레일" && <Badge tone="ink">트레일</Badge>}
          {race.scope === "해외" && <Badge tone="blue">해외</Badge>}
        </div>
        <span className="shrink-0 text-sm font-bold text-zinc-900">{dday(race.date, t)}</span>
      </div>
      <h3 className="mt-2 text-base font-semibold leading-snug">{race.name}</h3>
      <div className="mt-2 flex gap-3 sm:block">
        <RacePoster race={race} className="aspect-square w-[42%] shrink-0 self-start sm:w-full" />
        <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-700 sm:mt-2">🗓️ {fmtDate(race.date)}</p>
        <p className="mt-0.5 flex items-center gap-1 text-sm text-zinc-500">
          <MapPin size={14} /> {race.region} · {race.venue}
          {extra && <span className="ml-1 font-semibold text-sky-700">· {extra}</span>}
        </p>
        <dl className="mt-2 space-y-1.5 text-sm">
          <div className="flex items-start gap-2">
            <dt className="w-[3.75rem] shrink-0 text-zinc-500">📏 구간</dt>
            <dd className="flex flex-wrap gap-1">
              {uniqueDistances(race.courses).map((d) => (
                <Badge key={d}>{d}</Badge>
              ))}
            </dd>
          </div>
          <div className="flex items-start gap-2">
            <dt className="w-[3.75rem] shrink-0 text-zinc-500">💰 가격</dt>
            <dd className="font-medium text-zinc-800">{feeRange(race.courses, race.currency)}</dd>
          </div>
          <div className="flex items-start gap-2">
            <dt className="w-[3.75rem] shrink-0 text-zinc-500">👥 인원</dt>
            <dd className="text-zinc-800">{scaleText(race.scale)}</dd>
          </div>
        </dl>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3 border-t border-zinc-100 pt-2 text-xs text-zinc-500">
        <span className="inline-flex items-center gap-1">
          <Heart size={13} /> {s.interest}
        </span>
        <span className="inline-flex items-center gap-1 font-medium text-orange-700">
          <Users size={13} /> 모집중 {s.openBuddy}
        </span>
        {s.reviewCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <Star size={13} className="text-amber-500" /> {s.avg.toFixed(1)} ({s.reviewCount})
          </span>
        )}
        {s.postCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <MessageSquare size={13} /> {s.postCount}
          </span>
        )}
      </div>
    </Link>
  );
}
