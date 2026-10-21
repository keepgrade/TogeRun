"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import SafetyActions from "@/components/SafetyActions";
import { Badge, btnGhost, btnPrimary, card, Empty, inputCls } from "@/components/ui";
import { timeAgo } from "@/lib/date";
import { uid, useApp, useGuard } from "@/lib/store";

export default function CommunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, me, myBlocked, userName, a } = useApp();
  const guard = useGuard();
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const post = data.cposts.find((p) => p.id === id);
  const race = post && data.races.find((r) => r.id === post.raceId);

  if (!post || !race) {
    return <Empty action={<Link href="/community" className={btnGhost}>커뮤니티로</Link>}>찾을 수 없는 글이에요.</Empty>;
  }

  if (myBlocked.includes(post.authorId)) {
    return (
      <Empty
        action={
          <button onClick={() => a.unblock(post.authorId)} className={btnGhost}>
            차단 해제하고 보기
          </button>
        }
      >
        차단한 사용자의 글이에요.
      </Empty>
    );
  }

  const comments = data.comments.filter((c) => c.postId === post.id && !myBlocked.includes(c.authorId));
  const mine = me?.id === post.authorId;

  const remove = () => {
    if (window.confirm("이 글을 삭제할까요? 댓글도 함께 삭제돼요.")) {
      a.deleteCPost(post.id);
      router.replace(`/races/${race.id}`);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    guard(() => {
      if (!me) return;
      if (!text.trim()) return setError("댓글 내용을 입력해 주세요");
      if (/01[016789][-\s]?\d{3,4}[-\s]?\d{4}/.test(text)) return setError("연락처 같은 개인정보는 적지 마세요");
      a.addComment({ id: uid(), postId: post.id, authorId: me.id, body: text.trim(), createdAt: new Date().toISOString() });
      setText("");
      setError("");
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/races/${race.id}`} className="mb-3 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800">
        <ArrowLeft size={14} /> {race.name}
      </Link>

      <div className="flex items-center gap-1.5">
        <Badge tone="orange">{post.tag}</Badge>
      </div>
      <h1 className="mt-2 text-xl font-bold leading-snug">{post.title}</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {userName(post.authorId)} · {timeAgo(post.createdAt)}
      </p>

      <div className={`${card} mt-4 whitespace-pre-wrap p-5 text-sm leading-relaxed`}>{post.body}</div>

      {mine ? (
        <div className="mt-3 flex gap-2">
          <Link href={`/community/${post.id}/edit`} className={btnGhost}>수정</Link>
          <button onClick={remove} className={btnGhost}>삭제</button>
        </div>
      ) : (
        <div className="mt-3">
          <SafetyActions
            targetType="커뮤니티 글"
            targetId={post.id}
            authorId={post.authorId}
            onBlocked={() => router.replace(`/races/${race.id}`)}
          />
        </div>
      )}

      <h2 className="mb-2 mt-8 text-base font-bold">댓글 {comments.length}</h2>
      {comments.length ? (
        <ul className="space-y-2">
          {comments.map((c) => (
            <li key={c.id} className={`${card} p-3 text-sm`}>
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>{userName(c.authorId)} · {timeAgo(c.createdAt)}</span>
                {me?.id === c.authorId && (
                  <button onClick={() => a.deleteComment(c.id)} className="text-zinc-400 hover:text-red-600">삭제</button>
                )}
              </div>
              <p className="mt-1 whitespace-pre-wrap text-zinc-800">{c.body}</p>
              {me?.id !== c.authorId && (
                <div className="mt-2">
                  <SafetyActions targetType="댓글" targetId={c.id} authorId={c.authorId} compact />
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <Empty>아직 댓글이 없어요. 첫 댓글을 남겨 보세요.</Empty>
      )}

      <form onSubmit={submit} className="mt-4" noValidate>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder={me ? "댓글을 입력하세요" : "로그인하고 댓글을 남겨 보세요"}
          aria-label="댓글 입력"
          className={inputCls}
        />
        {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
        <button type="submit" className={`${btnPrimary} mt-2`}>{me ? "댓글 등록" : "로그인하고 댓글 쓰기"}</button>
      </form>
    </div>
  );
}
