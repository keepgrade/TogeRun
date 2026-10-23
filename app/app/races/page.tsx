"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import FilterPanel from "@/components/FilterPanel";
import KindTabs from "@/components/KindTabs";
import Pagination, { usePaged } from "@/components/Pagination";
import RaceCard from "@/components/RaceCard";
import { btnGhost, Empty, inputCls } from "@/components/ui";
import { raceStatus } from "@/lib/derive";
import { monthKey, today } from "@/lib/date";
import { matchKind, useKind, type Kind } from "@/lib/kind";
import { useApp } from "@/lib/store";
import { DISTANCES, REGIONS, TYPE_LABEL } from "@/lib/types";

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
    sessionStorage.removeItem("togerun-past");
  }, []);
  const [past, setPast] = useState(() => readHandoff("togerun-past") === "1");
  const [sort, setSort] = useState<"date" | "close">("date");
  const [kind, setKind] = useKind();

  /** 종류·범위가 바뀌면 그 종류에 없는 지역·종목·시기 선택을 비운다 */
  const changeKind = (k: Kind) => {
    setKind(k);
    setRegion(""); setDistance(""); setMonth(""); pg.resetPage();
  };

  const t = today();
  const inKind = useMemo(() => data.races.filter((r) => matchKind(r, kind)), [data.races, kind]);
  const regionOptions = useMemo(
    () => (kind.scope === "국내" ? REGIONS : Array.from(new Set(inKind.map((r) => r.region))).sort()),
    [kind.scope, inKind],
  );
  const distanceOptions = useMemo(
    () => DISTANCES.filter((d) => inKind.some((r) => r.courses.some((c) => c.distance === d))),
    [inKind],
  );
  const list = useMemo(() => {
    const kw = q.trim();
    return inKind
      .filter((r) => {
        const s = raceStatus(r, t);
        if (!past && (s === "종료" || s === "취소")) return false;
        if (status !== "전체" && s !== status) return false;
        if (region && r.region !== region) return false;
        if (distance && !r.courses.some((c) => c.distance === distance)) return false;
        if (month && monthKey(r.date) !== month) return false;
        if (kw && !`${r.name} ${r.region} ${r.venue} ${r.city ?? ""}`.includes(kw)) return false;
        return true;
      })
      .sort((a, b) => (sort === "date" ? a.date.localeCompare(b.date) : a.regClose.localeCompare(b.regClose)));
  }, [inKind, q, region, distance, month, status, past, sort, t]);

  const pg = usePaged(list);

  const months = useMemo(
    () => Array.from(new Set(inKind.map((r) => monthKey(r.date)))).sort(),
    [inKind],
  );

  const reset = () => {
    setQ(""); setRegion(""); setDistance(""); setMonth(""); setStatus("전체"); setPast(false); pg.resetPage();
  };

  return (
    <div>
      <h1 className="sr-only">대회</h1>

      <div className="mt-3">
        <KindTabs kind={kind} onChange={changeKind} />
      </div>

      <div className="relative mt-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); pg.resetPage(); }}
          placeholder="대회명, 지역, 장소 검색"
          className={`${inputCls} pl-9`}
          aria-label="대회 검색"
        />
      </div>

      <div className="tg-chips mt-3">
        {STATUS_CHIPS.map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); pg.resetPage(); }}
            className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-sm ${status === s ? "border-orange-600 bg-orange-600 text-white" : "border-zinc-300 bg-white text-zinc-700"}`}
          >
            {s}
          </button>
        ))}
      </div>

      <FilterPanel active={[region, distance, month].filter(Boolean).length + (past ? 1 : 0)} onReset={reset}>
        <div className="grid grid-cols-2 gap-2">
          <select value={region} onChange={(e) => { setRegion(e.target.value); pg.resetPage(); }} className={inputCls} aria-label={kind.scope === "국내" ? "지역" : "국가"}>
          <option value="">{kind.scope === "국내" ? "지역 전체" : "국가 전체"}</option>
          {regionOptions.map((r) => <option key={r}>{r}</option>)}
        </select>
        <select value={distance} onChange={(e) => { setDistance(e.target.value); pg.resetPage(); }} className={inputCls} aria-label="종목">
          <option value="">종목 전체</option>
          {distanceOptions.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select value={month} onChange={(e) => { setMonth(e.target.value); pg.resetPage(); }} className={inputCls} aria-label="시기">
          <option value="">시기 전체</option>
          {months.map((m) => <option key={m} value={m}>{m.replace("-", "년 ")}월</option>)}
        </select>
        <select value={sort} onChange={(e) => { setSort(e.target.value as "date" | "close"); pg.resetPage(); }} className={inputCls} aria-label="정렬">
          <option value="date">개최일 빠른순</option>
          <option value="close">접수 마감 임박순</option>
        </select>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-zinc-600">
          <input type="checkbox" checked={past} onChange={(e) => { setPast(e.target.checked); pg.resetPage(); }} />
          지난·취소 대회 포함
        </label>
      </FilterPanel>

      <p className="mt-4 text-sm text-zinc-500">
        {kind.scope} {TYPE_LABEL[kind.type]} 중 조건에 맞는 대회 {list.length}개
      </p>

      {list.length === 0 ? (
        <div className="mt-3">
          <Empty action={<button onClick={reset} className={btnGhost}>필터 초기화</button>}>조건에 맞는 대회가 없어요.</Empty>
        </div>
      ) : (
        <>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {pg.slice.map((r) => <RaceCard key={r.id} race={r} />)}
          </div>
          <Pagination page={pg.page} pages={pg.pages} size={pg.size} total={list.length} onPage={pg.setPage} onSize={pg.setSize} />
        </>
      )}
    </div>
  );
}
