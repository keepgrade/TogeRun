"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import PublicProfile from "@/components/PublicProfile";
import SafetyActions from "@/components/SafetyActions";
import { Badge, btnGhost, btnPrimary, card, Empty } from "@/components/ui";
import { buddyClosed } from "@/lib/derive";
import { dday, fmtDate, today } from "@/lib/date";
import { useApp, useGuard } from "@/lib/store";

export default function BuddyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, me, myBlocked, userName, a } = useApp();
  const guard = useGuard();
  const t = today();

  const post = data.buddyPosts.find((p) => p.id === id);
  const race = post && data.races.find((r) => r.id === post.raceId);

  if (!post || !race) {
    return <Empty action={<Link href="/races" className={btnGhost}>대회 목록으로</Link>}>찾을 수 없는 모집글이에요.</Empty>;
  }

  const closed = buddyClosed(post, race, t);
  const mine = me?.id === post.authorId;

  if (myBlocked.includes(post.authorId)) {
    return (
      <Empty
        action={
          <button onClick={() => a.unblock(post.authorId)} className={btnGhost}>
            차단 해제하고 보기
          </button>
        }
      >
        차단한 사용자의 모집글이에요.
      </Empty>
    );
  }

  const rows: [string, string][] = [
    ["대회", race.name],
    ["종목", post.distance],
    ["동행 방식", post.style],
    ["모집 인원", `${post.capacity}명`],
    ["모집 마감일", `${fmtDate(post.recruitUntil)} (${dday(post.recruitUntil, t)})`],
    ["출발 지역", post.departRegion],
  ];
  if (post.targetPace) rows.push(["목표 기록·페이스", post.targetPace]);

  const remove = () => {
    if (window.confirm("이 모집글을 삭제할까요?")) {
      a.deleteBuddy(post.id);
      router.replace(`/races/${race.id}`);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/races/${race.id}`} className="mb-3 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800">
        <ArrowLeft size={14} /> {race.name}
      </Link>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone={closed ? "gray" : "green"}>{closed ? "모집 완료" : "모집중"}</Badge>
        <Badge tone="orange">{post.distance}</Badge>
        <Badge tone="blue">{post.style}</Badge>
        <Badge>{post.departRegion}</Badge>
      </div>
      <h1 className="mt-2 text-xl font-bold">{post.intro || "함께 뛸 분을 찾고 있어요"}</h1>
      <p className="mt-1 text-sm text-zinc-500">{userName(post.authorId)}</p>

      <dl className={`${card} mt-4 divide-y divide-zinc-100 text-sm`}>
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-4 px-4 py-2.5">
            <dt className="w-28 shrink-0 text-zinc-500">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mb-2 mt-5 text-sm font-semibold text-zinc-700">작성자 공개 프로필</h2>
      <PublicProfile userId={post.authorId} />

      <div className="mt-5">
        {mine ? (
          <div className="flex flex-wrap gap-2">
            <button disabled={closed} onClick={() => a.closeBuddy(post.id)} className={btnPrimary}>
              모집 마감 처리
            </button>
            <Link href={`/buddy/${post.id}/edit`} className={btnGhost}>수정</Link>
            <button onClick={remove} className={btnGhost}>삭제</button>
          </div>
        ) : (
          <>
            <button
              disabled={closed}
              onClick={() => guard(() => window.open(post.chatUrl, "_blank", "noopener,noreferrer"))}
              className={`${btnPrimary} w-full py-3`}
            >
              <MessageCircle size={16} /> {closed ? "모집이 끝났어요" : "오픈채팅으로 연락하기"}
            </button>
            <p className="mt-2 text-xs text-zinc-500">
              연락은 오픈채팅으로만 해요. 처음 만날 때는 사람이 많은 장소에서, 개인정보는 먼저 주지 마세요. (PoC: 링크는 샘플이라 열리지 않을 수 있어요)
            </p>
            <div className="mt-4 space-y-2 border-t border-zinc-200 pt-4">
              <SafetyActions
                targetType="모집글"
                targetId={post.id}
                authorId={post.authorId}
                onBlocked={() => router.replace(`/races/${race.id}`)}
              />
              <SafetyActions targetType="사용자" targetId={post.authorId} authorId={post.authorId} showBlock={false} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
