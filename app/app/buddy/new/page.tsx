"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { Empty, inputCls, StatusBadge } from "@/components/ui";
import { raceStatus } from "@/lib/derive";
import { dday, fmtDate, today } from "@/lib/date";
import { useApp } from "@/lib/store";

/** 하단 가운데 "버디 구하기" 버튼의 첫 화면: 모집글을 올릴 대회를 고른다 */
export default function BuddyNewPage() {
  const { data } = useApp();
  const [q, setQ] = useState("");
  const t = today();

  const list = useMemo(() => {
    const kw = q.trim();
    return data.races
      .filter((r) => {
        const s = raceStatus(r, t);
        return s !== "종료" && s !== "취소";
      })
      .filter((r) => !kw || `${r.name} ${r.region} ${r.venue} ${r.city ?? ""}`.includes(kw))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 40);
  }, [data.races, q, t]);

  return (
    <div>
      <p className="text-lg font-extrabold">어떤 대회에서 같이 뛸 사람을 구할까요?</p>
      <p className="mt-1 text-sm text-zinc-600">대회를 고르면 모집글 쓰기로 이어져요. 접수는 공식 사이트에서 하세요.</p>

      <div className="relative mt-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="대회명, 지역, 장소 검색" aria-label="대회 검색" className={`${inputCls} pl-9`} />
      </div>

      {list.length === 0 ? (
        <div className="mt-4">
          <Empty>조건에 맞는 대회가 없어요.</Empty>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {list.map((r) => (
            <li key={r.id}>
              <Link
                href={`/races/${r.id}/buddy/new`}
                className="block rounded-xl border border-zinc-200 bg-white p-3.5 hover:border-orange-300"
              >
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge status={raceStatus(r, t)} />
                  <span className="text-sm font-bold">{dday(r.date, t)}</span>
                </div>
                <p className="mt-1.5 font-semibold">{r.name}</p>
                <p className="mt-0.5 text-sm text-zinc-600">{fmtDate(r.date)}</p>
                <p className="mt-0.5 flex items-center gap-1 text-sm text-zinc-500">
                  <MapPin size={14} /> {r.region} · {r.venue}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
