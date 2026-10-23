"use client";

import Link from "next/link";
import BuddyCard from "@/components/BuddyCard";
import RaceCard from "@/components/RaceCard";
import MoreMenu from "@/components/MoreMenu";
import { btnGhost, btnPrimary, card, Empty } from "@/components/ui";
import { timeAgo } from "@/lib/date";
import { paceText } from "@/lib/format";
import { useApp, useGuard } from "@/lib/store";

export default function MePage() {
  const { data, me, myFavorites, myBlocked, myProfile, myHistory, userName, a } = useApp();
  const guard = useGuard();

  if (!me) {
    return (
      <div>
        <Empty action={<button className={btnPrimary} onClick={() => guard(() => {})}>로그인</button>}>
          로그인하면 내 모집글을 볼 수 있어요.
        </Empty>
        <MoreMenu />
      </div>
    );
  }

  const mine = data.buddyPosts.filter((p) => p.authorId === me.id);
  const saved = data.races.filter((r) => myFavorites.includes(r.id));
  const myReports = data.reports.filter((r) => r.reporterId === me.id);
  const myReviews = data.reviews.filter((v) => v.authorId === me.id);

  return (
    <div>
      <div className={`${card} flex items-center justify-between p-4`}>
        <div>
          <p className="text-xs text-zinc-500">익명 닉네임</p>
          <p className="text-lg font-bold">{me.nickname}</p>
        </div>
        <button onClick={a.logout} className={btnGhost}>로그아웃</button>
      </div>

      <div className={`${card} mt-4 flex items-center justify-between gap-3 p-4`}>
        <div className="min-w-0 text-sm">
          <p className="font-semibold">러닝 프로필</p>
          <p className="mt-0.5 text-zinc-500">
            {myProfile.paceSec ? `페이스 ${paceText(myProfile.paceSec)} · ` : ""}
            경험 {myHistory.length}건 · 공개 항목 {Object.values(myProfile.pub).filter(Boolean).length}개
          </p>
        </div>
        <Link href="/me/profile" className={btnGhost}>프로필 편집</Link>
      </div>

      <h2 className="mb-2 mt-6 text-lg font-bold">저장한 대회 {saved.length}</h2>
      {saved.length ? (
        <div className="grid gap-3">
          {saved.map((r) => <RaceCard key={r.id} race={r} />)}
        </div>
      ) : (
        <Empty action={<Link href="/races" className={btnGhost}>대회 둘러보기</Link>}>저장한 대회가 없어요.</Empty>
      )}

      <h2 className="mb-2 mt-6 text-lg font-bold">내 리뷰 {myReviews.length}</h2>
      {myReviews.length ? (
        <ul className="space-y-2">
          {myReviews.map((v) => {
            const race = data.races.find((r) => r.id === v.raceId);
            return (
              <li key={v.id}>
                <Link href={`/races/${v.raceId}`} className={`${card} block p-3 hover:border-orange-300`}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate font-medium">{race?.name ?? "알 수 없는 대회"}</span>
                    <span className="shrink-0 text-amber-600">★ {v.rating.toFixed(1)}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{v.body}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <Empty>아직 쓴 리뷰가 없어요. 참가한 대회가 끝나면 리뷰를 남길 수 있어요.</Empty>
      )}

      <h2 className="mb-2 mt-6 text-lg font-bold">내 모집글 {mine.length}</h2>
      {mine.length ? (
        <div className="grid gap-3">
          {mine.map((p) => <BuddyCard key={p.id} post={p} showRace />)}
        </div>
      ) : (
        <Empty action={<Link href="/races" className={btnGhost}>대회 둘러보기</Link>}>아직 쓴 모집글이 없어요.</Empty>
      )}

      <h2 className="mb-2 mt-6 text-lg font-bold">차단 목록 {myBlocked.length}</h2>
      {myBlocked.length ? (
        <ul className="space-y-2">
          {myBlocked.map((id) => (
            <li key={id} className={`${card} flex items-center justify-between p-3 text-sm`}>
              <span>{userName(id)}</span>
              <button onClick={() => a.unblock(id)} className={btnGhost}>차단 해제</button>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>차단한 사용자가 없어요.</Empty>
      )}

      <h2 className="mb-2 mt-6 text-lg font-bold">내 신고 내역 {myReports.length}</h2>
      {myReports.length ? (
        <ul className="space-y-2">
          {myReports.map((r) => (
            <li key={r.id} className={`${card} p-3 text-sm`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">{r.targetType} · {r.reason}</span>
                <span className="text-xs text-emerald-700">접수됨</span>
              </div>
              {r.detail && <p className="mt-1 text-zinc-600">{r.detail}</p>}
              <p className="mt-1 text-xs text-zinc-400">{timeAgo(r.createdAt)} · 운영자가 확인 중이에요</p>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>접수한 신고가 없어요.</Empty>
      )}

      <MoreMenu />
    </div>
  );
}
