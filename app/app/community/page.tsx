"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import CommunityRows from "@/components/CommunityRows";
import { btnGhost, Empty, inputCls } from "@/components/ui";
import { useApp } from "@/lib/store";
import { TAGS } from "@/lib/types";

export default function CommunityPage() {
  const { data, myBlocked } = useApp();
  const [tag, setTag] = useState<string>("");
  const [q, setQ] = useState("");

  const posts = useMemo(() => {
    const kw = q.trim();
    return data.cposts
      .filter((p) => !myBlocked.includes(p.authorId))
      .filter((p) => !tag || p.tag === tag)
      .filter((p) => {
        if (!kw) return true;
        const race = data.races.find((r) => r.id === p.raceId);
        return `${p.title} ${p.body} ${race?.name ?? ""}`.includes(kw);
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [data.cposts, data.races, myBlocked, tag, q]);

  return (
    <div>
      <h1 className="text-xl font-bold">커뮤니티</h1>
      <p className="mt-1 text-sm text-zinc-500">대회마다 열린 커뮤니티의 최신 글을 모아 봐요. 글은 대회 상세의 커뮤니티 탭에서 쓸 수 있어요.</p>

      <div className="relative mt-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="제목, 내용, 대회명 검색" aria-label="커뮤니티 검색" className={`${inputCls} pl-9`} />
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

      <p className="mt-4 text-sm text-zinc-500">글 {posts.length}개</p>
      <div className="mt-2">
        {posts.length ? (
          <CommunityRows posts={posts} showRace />
        ) : (
          <Empty action={<Link href="/races" className={btnGhost}>대회 찾아보기</Link>}>조건에 맞는 글이 없어요.</Empty>
        )}
      </div>
    </div>
  );
}
