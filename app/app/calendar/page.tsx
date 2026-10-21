"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import KindTabs from "@/components/KindTabs";
import RaceCard from "@/components/RaceCard";
import { btnGhost, Empty } from "@/components/ui";
import { addDays, iso, monthKey, parse, today } from "@/lib/date";
import { matchKind, useKind } from "@/lib/kind";
import { useApp } from "@/lib/store";
import type { Race } from "@/lib/types";

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

export default function CalendarPage() {
  const { data, myFavorites } = useApp();
  const t = today();
  const [month, setMonth] = useState(monthKey(t));
  const [selected, setSelected] = useState<string | null>(t);
  const [onlyFav, setOnlyFav] = useState(false);
  const [kind, setKind] = useKind();

  const [y, m] = month.split("-").map(Number);

  const byDate = useMemo(() => {
    const map = new Map<string, Race[]>();
    data.races
      .filter((r) => matchKind(r, kind) && (!onlyFav || myFavorites.includes(r.id)))
      .forEach((r) => map.set(r.date, [...(map.get(r.date) ?? []), r]));
    return map;
  }, [data.races, kind, onlyFav, myFavorites]);

  const cells = useMemo(() => {
    const first = new Date(y, m - 1, 1);
    const start = addDays(iso(first), -first.getDay());
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [y, m]);

  const move = (delta: number) => {
    const d = new Date(y, m - 1 + delta, 1);
    setMonth(monthKey(iso(d)));
    setSelected(null);
  };

  const todayMonth = monthKey(t);
  const dayRaces = selected ? byDate.get(selected) ?? [] : [];

  return (
    <div>
      <h1 className="text-xl font-bold">캘린더</h1>
      <div className="mt-3">
        <KindTabs kind={kind} onChange={setKind} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button onClick={() => move(-1)} aria-label="이전 달" className={btnGhost}><ChevronLeft size={16} /></button>
          <h2 className="min-w-28 text-center text-lg font-bold">{y}년 {m}월</h2>
          <button onClick={() => move(1)} aria-label="다음 달" className={btnGhost}><ChevronRight size={16} /></button>
        </div>
        <button onClick={() => { setMonth(todayMonth); setSelected(t); }} className={btnGhost}>오늘</button>
      </div>

      <label className="mt-2 inline-flex items-center gap-2 text-sm text-zinc-600">
        <input type="checkbox" checked={onlyFav} onChange={(e) => setOnlyFav(e.target.checked)} />
        관심 대회만 보기
      </label>

      <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="grid grid-cols-7 border-b border-zinc-100 bg-zinc-50 text-center text-xs text-zinc-500">
          {DOW.map((d, i) => (
            <div key={d} className={`py-2 ${i === 0 ? "text-red-500" : i === 6 ? "text-sky-600" : ""}`}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((date) => {
            const inMonth = monthKey(date) === month;
            const list = byDate.get(date) ?? [];
            const isToday = date === t;
            const isSel = date === selected;
            const day = parse(date).getDate();
            return (
              <button
                key={date}
                onClick={() => setSelected(date)}
                aria-label={`${date} 대회 ${list.length}개`}
                className={`min-h-16 border-b border-r border-zinc-100 p-1 text-left align-top sm:min-h-20 ${
                  inMonth ? "bg-white" : "bg-zinc-50 text-zinc-300"
                } ${isSel ? "ring-2 ring-inset ring-orange-500" : ""}`}
              >
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                    isToday ? "bg-orange-600 font-bold text-white" : ""
                  }`}
                >
                  {day}
                </span>
                {inMonth &&
                  list.slice(0, 2).map((r) => (
                    <span
                      key={r.id}
                      className={`mt-0.5 block truncate rounded px-1 text-[10px] leading-4 ${
                        r.cancelled ? "bg-red-50 text-red-600 line-through" : myFavorites.includes(r.id) ? "bg-orange-100 text-orange-800" : "bg-sky-50 text-sky-800"
                      }`}
                    >
                      {r.name}
                    </span>
                  ))}
                {inMonth && list.length > 2 && <span className="block text-[10px] text-zinc-500">+{list.length - 2}개</span>}
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-2 text-xs text-zinc-500">주황색은 내가 저장한 대회, 취소된 대회는 취소선으로 표시돼요.</p>

      <h2 className="mb-2 mt-5 text-lg font-bold">
        {selected ? `${selected.replace(/-/g, ".")} 대회 ${dayRaces.length}` : "날짜를 선택하세요"}
      </h2>
      {selected &&
        (dayRaces.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {dayRaces.map((r) => <RaceCard key={r.id} race={r} />)}
          </div>
        ) : (
          <Empty>선택한 날짜에 대회가 없어요.</Empty>
        ))}
    </div>
  );
}
