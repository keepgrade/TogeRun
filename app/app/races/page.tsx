"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import RaceCard from "@/components/RaceCard";
import { btnGhost, Empty, inputCls } from "@/components/ui";
import { raceStatus } from "@/lib/derive";
import { monthKey, today } from "@/lib/date";
import { useApp } from "@/lib/store";
import { DISTANCES, REGIONS } from "@/lib/types";

const PAGE = 12;
const STATUS_CHIPS = ["전체", "접수 예정", "접수중", "접수 마감"] as const;

/** 홈에서 넘어온 검색어·상태를 읽는다(세션 저장소). 소비는 마운트 후 효과에서 한다. */
const readHandoff = (key: string) => {
  try {
    return sessionStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
};

export default function RacesPage() {
  const { data } = useApp();
  const [q, setQ] = useState(() => readHandoff("togerun-q"));
  const [region, setRegion] = useState("");
  const [distance, setDistance] = useState("");
  const [month, setMonth] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_CHIPS)[number]>(() => {
    const s = readHandoff("togerun-status");
    return (STATUS_CHIPS as readonly string[]).includes(s) ? (s as (typeof STATUS_CHIPS)[number]) : "전체";
  });
  useEffect(() => {
    sessionStorage.removeItem("togerun-q");
    sessionStorage.removeItem("togerun-status");
  }, []);
  const [past, setPast] = useState(false);
  const [sort, setSort] = useState<"date" | "close">("date");
  const [limit, setLimit] = useState(PAGE);

  const t = today();
  const list = useMemo(() => {
    const kw = q.trim();
    return data.races
      .filter((r) => {
        const s = raceStatus(r, t);
        if (!past && (s === "종료" || s === "취소")) return false;
        if (status !== "전체" && s !== status) return false;
        if (region && r.region !== region) return false;
        if (distance && !r.courses.some((c) => c.distance === distance)) return false;
        if (month && monthKey(r.date) !== month) return false;
        if (kw && !`${r.name} ${r.region} ${r.venue}`.includes(kw)) return false;
        return true;
      })
      .sort((a, b) => (sort === "date" ? a.date.localeCompare(b.date) : a.regClose.localeCompare(b.regClose)));
  }, [data.races, q, region, distance, month, status, past, sort, t]);

  const months = useMemo(
    () => Array.from(new Set(data.races.map((r) => monthKey(r.date)))).sort(),
    [data.races],
  );

  const reset = () => {
    setQ(""); setRegion(""); setDistance(""); setMonth(""); setStatus("전체"); setPast(false); setLimit(PAGE);
  };

  return (
    <div>
      <h1 className="text-xl font-bold">대회</h1>

      <div className="relative mt-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }}
          placeholder="대회명, 지역, 장소 검색"
          className={`${inputCls} pl-9`}
          aria-label="대회 검색"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {STATUS_CHIPS.map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setLimit(PAGE); }}
            className={`rounded-full border px-3 py-1 text-sm ${status === s ? "border-orange-600 bg-orange-600 text-white" : "border-zinc-300 bg-white text-zinc-700"}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <select value={region} onChange={(e) => { setRegion(e.target.value); setLimit(PAGE); }} className={inputCls} aria-label="지역">
          <option value="">지역 전체</option>
          {REGIONS.map((r) => <option key={r}>{r}</option>)}
        </select>
        <select value={distance} onChange={(e) => { setDistance(e.target.value); setLimit(PAGE); }} className={inputCls} aria-label="종목">
          <option value="">종목 전체</option>
          {DISTANCES.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select value={month} onChange={(e) => { setMonth(e.target.value); setLimit(PAGE); }} className={inputCls} aria-label="시기">
          <option value="">시기 전체</option>
          {months.map((m) => <option key={m} value={m}>{m.replace("-", "년 ")}월</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as "date" | "close")} className={inputCls} aria-label="정렬">
          <option value="date">개최일 빠른순</option>
          <option value="close">접수 마감 임박순</option>
        </select>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <label className="inline-flex items-center gap-2 text-zinc-600">
          <input type="checkbox" checked={past} onChange={(e) => setPast(e.target.checked)} />
          지난·취소 대회 포함
        </label>
        <button onClick={reset} className="text-zinc-500 underline">필터 초기화</button>
      </div>

      <p className="mt-4 text-sm text-zinc-500">조건에 맞는 대회 {list.length}개</p>

      {list.length === 0 ? (
        <div className="mt-3">
          <Empty action={<button onClick={reset} className={btnGhost}>필터 초기화</button>}>조건에 맞는 대회가 없어요.</Empty>
        </div>
      ) : (
        <>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {list.slice(0, limit).map((r) => <RaceCard key={r.id} race={r} />)}
          </div>
          {list.length > limit && (
            <div className="mt-4 text-center">
              <button onClick={() => setLimit(limit + PAGE)} className={btnGhost}>대회 더보기</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
