"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BuddyCard from "./BuddyCard";
import CommunityRows from "./CommunityRows";
import { btnPrimary, Empty, inputCls } from "./ui";
import { buddyClosed, raceOver } from "@/lib/derive";
import { today } from "@/lib/date";
import { uniqueDistances } from "@/lib/format";
import { useApp, useGuard } from "@/lib/store";
import { REGIONS, STYLES, TAGS, type Race } from "@/lib/types";

export function BuddyTab({ race }: { race: Race }) {
  const { data, myBlocked } = useApp();
  const guard = useGuard();
  const router = useRouter();
  const t = today();
  const [distance, setDistance] = useState("");
  const [style, setStyle] = useState("");
  const [region, setRegion] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(true);

  const over = raceOver(race, t);

  const list = useMemo(
    () =>
      data.buddyPosts
        .filter((p) => p.raceId === race.id && !myBlocked.includes(p.authorId))
        .filter((p) => (onlyOpen ? !buddyClosed(p, race, t) : true))
        .filter((p) => (!distance || p.distance === distance) && (!style || p.style === style) && (!region || p.departRegion === region))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [data.buddyPosts, race, myBlocked, onlyOpen, distance, style, region, t],
  );

  return (
    <div>
      <div className="rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
        <p className="font-semibold">함께 뛰기 전 안전 규칙</p>
        <p>처음 만날 때는 사람이 많은 장소에서, 개인정보는 먼저 주지 말고, 금전 요구에는 응하지 말고 신고해 주세요.</p>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <h3 className="font-semibold">같이 뛸 사람</h3>
        <button
          disabled={over}
          onClick={() => guard(() => router.push(`/races/${race.id}/buddy/new`))}
          className={btnPrimary}
        >
          모집글 쓰기
        </button>
      </div>
      {over && <p className="mt-1 text-xs text-zinc-500">끝났거나 취소된 대회는 모집글을 쓸 수 없어요.</p>}

      <div className="mt-3 grid grid-cols-3 gap-2">
        <select value={distance} onChange={(e) => setDistance(e.target.value)} className={inputCls} aria-label="종목">
          <option value="">종목 전체</option>
          {uniqueDistances(race.courses).map((d) => <option key={d}>{d}</option>)}
        </select>
        <select value={style} onChange={(e) => setStyle(e.target.value)} className={inputCls} aria-label="동행 방식">
          <option value="">동행 방식 전체</option>
          {STYLES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={region} onChange={(e) => setRegion(e.target.value)} className={inputCls} aria-label="출발 지역">
          <option value="">출발 지역 전체</option>
          {REGIONS.map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>
      <label className="mt-2 inline-flex items-center gap-2 text-sm text-zinc-600">
        <input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} />
        모집중인 글만 보기
      </label>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {list.map((p) => <BuddyCard key={p.id} post={p} />)}
      </div>
      {list.length === 0 && (
        <div className="mt-3">
          <Empty
            action={
              !over && (
                <button onClick={() => guard(() => router.push(`/races/${race.id}/buddy/new`))} className={btnPrimary}>
                  첫 모집글 올리기
                </button>
              )
            }
          >
            조건에 맞는 모집글이 없어요.
          </Empty>
        </div>
      )}
    </div>
  );
}

export function CommunityTab({ race }: { race: Race }) {
  const { data, myBlocked } = useApp();
  const guard = useGuard();
  const router = useRouter();
  const [tag, setTag] = useState("");

  const posts = useMemo(
    () =>
      data.cposts
        .filter((p) => p.raceId === race.id && !myBlocked.includes(p.authorId))
        .filter((p) => !tag || p.tag === tag)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [data.cposts, race.id, myBlocked, tag],
  );

  return (
    <div>
      <div className="rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
        <p>같이 갈 사람을 구하는 글은 <b>같이 뛸 사람</b> 탭의 모집글로 써 주세요. 이곳은 질문, 정보, 이동·주차 이야기를 나누는 공간이에요.</p>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <h3 className="font-semibold">{race.name} 커뮤니티</h3>
        <button onClick={() => guard(() => router.push(`/races/${race.id}/community/new`))} className={btnPrimary}>
          글쓰기
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {["", ...TAGS].map((t) => (
          <button
            key={t || "all"}
            onClick={() => setTag(t)}
            className={`rounded-full border px-3 py-1 text-sm ${tag === t ? "border-orange-600 bg-orange-600 text-white" : "border-zinc-300 bg-white text-zinc-700"}`}
          >
            {t || "전체"}
          </button>
        ))}
      </div>

      <div className="mt-3">
        {posts.length ? (
          <CommunityRows posts={posts} />
        ) : (
          <Empty action={<button onClick={() => guard(() => router.push(`/races/${race.id}/community/new`))} className={btnPrimary}>첫 글 남기기</button>}>
            아직 글이 없어요.
          </Empty>
        )}
      </div>
    </div>
  );
}

