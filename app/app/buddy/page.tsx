"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import BuddyCard from "@/components/BuddyCard";
import Pagination, { usePaged } from "@/components/Pagination";
import { btnGhost, btnPrimary, Empty, inputCls } from "@/components/ui";
import { buddyClosed } from "@/lib/derive";
import { today } from "@/lib/date";
import { useApp } from "@/lib/store";
import { DISTANCES, REGIONS, STYLES } from "@/lib/types";


/** 모든 대회의 모집글을 모아 보는 버디 찾기 페이지 */
export default function BuddyListPage() {
  const { data, myBlocked } = useApp();
  const t = today();
  const [q, setQ] = useState("");
  const [distance, setDistance] = useState("");
  const [style, setStyle] = useState("");
  const [region, setRegion] = useState("");
  const [type, setType] = useState("");
  const [scope, setScope] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [sort, setSort] = useState<"latest" | "deadline">("latest");

  const raceOf = useMemo(() => new Map(data.races.map((r) => [r.id, r])), [data.races]);

  const visible = useMemo(
    () => data.buddyPosts.filter((p) => !myBlocked.includes(p.authorId) && raceOf.has(p.raceId)),
    [data.buddyPosts, myBlocked, raceOf],
  );
  const openCount = useMemo(() => visible.filter((p) => !buddyClosed(p, raceOf.get(p.raceId), t)).length, [visible, raceOf, t]);

  const list = useMemo(() => {
    const kw = q.trim();
    return visible
      .filter((p) => (onlyOpen ? !buddyClosed(p, raceOf.get(p.raceId), t) : true))
      .filter((p) => (!distance || p.distance === distance) && (!style || p.style === style) && (!region || p.departRegion === region))
      .filter((p) => (!type || raceOf.get(p.raceId)?.type === type) && (!scope || raceOf.get(p.raceId)?.scope === scope))
      .filter((p) => !kw || `${raceOf.get(p.raceId)?.name ?? ""} ${p.intro ?? ""}`.includes(kw))
      .sort((a, b) => (sort === "latest" ? b.createdAt.localeCompare(a.createdAt) : a.recruitUntil.localeCompare(b.recruitUntil)));
  }, [visible, raceOf, onlyOpen, distance, style, region, type, scope, q, sort, t]);

  const pg = usePaged(list);

  const reset = () => {
    setQ(""); setDistance(""); setStyle(""); setRegion(""); setType(""); setScope(""); setOnlyOpen(true); setSort("latest"); pg.resetPage();
  };
  const change = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    pg.resetPage();
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">모집 중인 버디</h1>
          <p className="mt-1 text-sm text-zinc-500">대회마다 올라온 모집글을 한곳에서 보고, 나에게 맞는 버디를 골라 보세요.</p>
        </div>
        <Link href="/races" className={btnPrimary}>대회에서 모집글 쓰기</Link>
      </div>

      <div className="relative mt-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={q}
          onChange={(e) => change(setQ)(e.target.value)}
          placeholder="대회명이나 소개 문구로 검색"
          aria-label="모집글 검색"
          className={`${inputCls} pl-9`}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <select value={scope} onChange={(e) => change(setScope)(e.target.value)} className={inputCls} aria-label="범위">
          <option value="">국내·해외 전체</option>
          <option value="국내">국내</option>
          <option value="해외">해외</option>
        </select>
        <select value={type} onChange={(e) => change(setType)(e.target.value)} className={inputCls} aria-label="대회 종류">
          <option value="">마라톤·트레일 전체</option>
          <option value="마라톤">마라톤</option>
          <option value="트레일">트레일러닝</option>
        </select>
        <select value={distance} onChange={(e) => change(setDistance)(e.target.value)} className={inputCls} aria-label="종목">
          <option value="">종목 전체</option>
          {DISTANCES.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select value={style} onChange={(e) => change(setStyle)(e.target.value)} className={inputCls} aria-label="버디 방식">
          <option value="">버디 방식 전체</option>
          {STYLES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={region} onChange={(e) => change(setRegion)(e.target.value)} className={inputCls} aria-label="출발 지역">
          <option value="">출발 지역 전체</option>
          {REGIONS.map((r) => <option key={r}>{r}</option>)}
        </select>
        <select value={sort} onChange={(e) => { setSort(e.target.value as "latest" | "deadline"); pg.resetPage(); }} className={inputCls} aria-label="정렬">
          <option value="latest">최신순</option>
          <option value="deadline">모집 마감 임박순</option>
        </select>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <label className="inline-flex items-center gap-2 text-zinc-600">
          <input type="checkbox" checked={onlyOpen} onChange={(e) => change(setOnlyOpen)(e.target.checked)} />
          모집중인 글만 보기
        </label>
        <button onClick={reset} className="text-zinc-500 underline">필터 초기화</button>
      </div>

      <p className="mt-4 text-sm text-zinc-500">
        조건에 맞는 모집글 {list.length}개 <span className="text-zinc-400">· 지금 모집 중 {openCount}개</span>
      </p>

      {list.length === 0 ? (
        <div className="mt-3">
          <Empty action={<button onClick={reset} className={btnGhost}>필터 초기화</button>}>조건에 맞는 모집글이 없어요.</Empty>
        </div>
      ) : (
        <>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pg.slice.map((p) => <BuddyCard key={p.id} post={p} showRace />)}
          </div>
          <Pagination page={pg.page} pages={pg.pages} size={pg.size} total={list.length} onPage={pg.setPage} onSize={pg.setSize} />
        </>
      )}
    </div>
  );
}
