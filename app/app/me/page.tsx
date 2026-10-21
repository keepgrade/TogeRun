"use client";

import Link from "next/link";
import BuddyCard from "@/components/BuddyCard";
import { btnGhost, btnPrimary, card, Empty } from "@/components/ui";
import { useApp, useGuard } from "@/lib/store";

export default function MePage() {
  const { data, me, a } = useApp();
  const guard = useGuard();

  if (!me) {
    return (
      <Empty action={<button className={btnPrimary} onClick={() => guard(() => {})}>로그인</button>}>
        로그인하면 내 모집글을 볼 수 있어요.
      </Empty>
    );
  }

  const mine = data.buddyPosts.filter((p) => p.authorId === me.id);

  return (
    <div>
      <div className={`${card} flex items-center justify-between p-4`}>
        <div>
          <p className="text-xs text-zinc-500">익명 닉네임</p>
          <p className="text-lg font-bold">{me.nickname}</p>
        </div>
        <button onClick={a.logout} className={btnGhost}>로그아웃</button>
      </div>

      <h2 className="mb-2 mt-6 text-lg font-bold">내 모집글 {mine.length}</h2>
      {mine.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {mine.map((p) => <BuddyCard key={p.id} post={p} showRace />)}
        </div>
      ) : (
        <Empty action={<Link href="/races" className={btnGhost}>대회 둘러보기</Link>}>아직 쓴 모집글이 없어요.</Empty>
      )}

      <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
        <p className="font-semibold text-zinc-800">PoC 도구</p>
        <button
          onClick={() => window.confirm("샘플 데이터로 되돌리고 내가 만든 글을 모두 지울까요?") && a.resetData()}
          className={`${btnGhost} mt-2`}
        >
          데이터 초기화
        </button>
      </div>
    </div>
  );
}
