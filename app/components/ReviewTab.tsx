"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SafetyActions from "./SafetyActions";
import { Badge, btnGhost, btnPrimary, card, Empty, inputCls, Stars } from "./ui";
import { raceStatus } from "@/lib/derive";
import { timeAgo } from "@/lib/date";
import { uniqueDistances } from "@/lib/format";
import { useApp, useGuard } from "@/lib/store";
import type { Race, Review } from "@/lib/types";

const PARTS = [
  { key: "course", label: "코스" },
  { key: "operation", label: "운영" },
  { key: "access", label: "접근성" },
  { key: "goods", label: "기념품" },
] as const;

const mean = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);

function ReviewItem({ review, race }: { review: Review; race: Race }) {
  const { me, userName, a } = useApp();
  const mine = me?.id === review.authorId;

  const remove = () => {
    if (window.confirm("이 리뷰를 삭제할까요?")) a.deleteReview(review.id);
  };

  return (
    <li className={`${card} p-4`}>
      <div className="flex flex-wrap items-center gap-2">
        <Stars value={review.rating} />
        <span className="text-sm font-semibold">{review.rating.toFixed(1)}</span>
        <Badge tone="orange">{review.distance}</Badge>
        {mine && <Badge tone="blue">내 리뷰</Badge>}
        <span className="ml-auto text-xs text-zinc-500">
          {userName(review.authorId)} · {timeAgo(review.createdAt)}
        </span>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">{review.body}</p>
      {PARTS.some(({ key }) => review.parts[key]) && (
        <ul className="mt-2 flex flex-wrap gap-1.5 text-xs">
          {PARTS.filter(({ key }) => review.parts[key]).map(({ key, label }) => (
            <li key={key} className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600">
              {label} <span className="font-semibold text-amber-600">★{review.parts[key]}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3">
        {mine ? (
          <div className="flex gap-2">
            <Link href={`/races/${race.id}/review/new`} className={`${btnGhost} px-3 py-1.5 text-sm`}>수정</Link>
            <button onClick={remove} className={`${btnGhost} px-3 py-1.5 text-sm`}>삭제</button>
          </div>
        ) : (
          <SafetyActions targetType="리뷰" targetId={review.id} authorId={review.authorId} compact />
        )}
      </div>
    </li>
  );
}

export function ReviewTab({ race }: { race: Race }) {
  const { data, me, myBlocked } = useApp();
  const guard = useGuard();
  const router = useRouter();
  const [distance, setDistance] = useState("");
  const [sort, setSort] = useState<"latest" | "high" | "low">("latest");

  const status = raceStatus(race);
  const ended = status === "종료";
  const mine = me ? data.reviews.find((v) => v.raceId === race.id && v.authorId === me.id) : undefined;

  const all = useMemo(
    () => data.reviews.filter((v) => v.raceId === race.id && !myBlocked.includes(v.authorId)),
    [data.reviews, race.id, myBlocked],
  );

  const summary = useMemo(() => {
    const dist = [5, 4, 3, 2, 1].map((n) => ({ n, count: all.filter((v) => v.rating === n).length }));
    const parts = PARTS.map(({ key, label }) => {
      const xs = all.map((v) => v.parts[key]).filter((x): x is number => !!x);
      return { label, avg: mean(xs), n: xs.length };
    });
    return { avg: mean(all.map((v) => v.rating)), dist, parts };
  }, [all]);

  const list = useMemo(() => {
    const filtered = all.filter((v) => !distance || v.distance === distance);
    return [...filtered].sort((x, y) =>
      sort === "latest" ? y.createdAt.localeCompare(x.createdAt) : sort === "high" ? y.rating - x.rating || y.createdAt.localeCompare(x.createdAt) : x.rating - y.rating || y.createdAt.localeCompare(x.createdAt),
    );
  }, [all, distance, sort]);

  const write = () => guard(() => router.push(`/races/${race.id}/review/new`));
  const blockReason = status === "취소" ? "취소된 대회에는 리뷰를 쓸 수 없어요." : !ended ? "대회가 끝난 뒤에 리뷰를 쓸 수 있어요." : "";

  return (
    <div>
      {all.length > 0 ? (
        <div className={`${card} p-4`}>
          <div className="flex flex-wrap items-center gap-5">
            <div className="text-center">
              <p className="text-4xl font-extrabold tabular-nums">{summary.avg.toFixed(1)}</p>
              <Stars value={summary.avg} size={16} />
              <p className="mt-1 text-xs text-zinc-500">리뷰 {all.length}개</p>
            </div>
            <ul className="min-w-40 flex-1 space-y-1">
              {summary.dist.map(({ n, count }) => (
                <li key={n} className="flex items-center gap-2 text-xs text-zinc-500">
                  <span className="w-6">{n}점</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                    <span className="block h-full rounded-full bg-amber-400" style={{ width: `${all.length ? (count / all.length) * 100 : 0}%` }} />
                  </span>
                  <span className="w-5 text-right">{count}</span>
                </li>
              ))}
            </ul>
          </div>
          {summary.parts.some((p) => p.n > 0) && (
            <ul className="mt-4 grid grid-cols-2 gap-2 border-t border-zinc-100 pt-3 text-sm sm:grid-cols-4">
              {summary.parts.map((p) => (
                <li key={p.label} className="rounded-lg bg-zinc-50 px-3 py-2">
                  <p className="text-xs text-zinc-500">{p.label}</p>
                  <p className="font-semibold">{p.n ? <>★ {p.avg.toFixed(1)} <span className="text-xs font-normal text-zinc-400">({p.n})</span></> : "-"}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-2">
        <h3 className="font-semibold">참가자 리뷰</h3>
        {mine ? (
          <Link href={`/races/${race.id}/review/new`} className={btnPrimary}>내 리뷰 수정</Link>
        ) : (
          <button onClick={write} disabled={!ended} className={btnPrimary}>리뷰 쓰기</button>
        )}
      </div>
      {blockReason && !mine && <p className="mt-1 text-xs text-zinc-500">{blockReason}</p>}
      <p className="mt-1 text-xs text-zinc-400">
        대회 정보가 틀렸다면 <Link href={`/races/${race.id}/report`} className="underline">정보 오류 제보</Link>로 알려 주세요.
      </p>

      {all.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <select value={distance} onChange={(e) => setDistance(e.target.value)} className={inputCls} aria-label="종목">
            <option value="">종목 전체</option>
            {uniqueDistances(race.courses).map((d) => <option key={d}>{d}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={inputCls} aria-label="정렬">
            <option value="latest">최신순</option>
            <option value="high">별점 높은순</option>
            <option value="low">별점 낮은순</option>
          </select>
        </div>
      )}

      <div className="mt-3">
        {list.length ? (
          <ul className="space-y-3">{list.map((v) => <ReviewItem key={v.id} review={v} race={race} />)}</ul>
        ) : all.length ? (
          <Empty>선택한 종목의 리뷰가 없어요.</Empty>
        ) : (
          <Empty>{ended ? "아직 리뷰가 없어요. 첫 리뷰를 남겨 보세요." : "아직 리뷰가 없어요. 대회가 끝난 뒤 참가자들이 리뷰를 남겨요."}</Empty>
        )}
      </div>
    </div>
  );
}
