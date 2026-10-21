"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Badge } from "./ui";
import { timeAgo } from "@/lib/date";
import { useApp } from "@/lib/store";
import type { CPost } from "@/lib/types";

export default function CommunityRows({ posts, showRace }: { posts: CPost[]; showRace?: boolean }) {
  const { data, userName } = useApp();

  return (
    <ul className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      {posts.map((p) => {
        const race = data.races.find((r) => r.id === p.raceId);
        const comments = data.comments.filter((c) => c.postId === p.id).length;
        return (
          <li key={p.id}>
            <Link href={`/community/${p.id}`} className="block px-4 py-3 hover:bg-orange-50/40">
              <div className="flex items-center gap-1.5">
                <Badge tone="orange">{p.tag}</Badge>
                {showRace && race && <span className="truncate text-xs text-zinc-500">{race.name}</span>}
              </div>
              <p className="mt-1 truncate font-medium text-zinc-900">{p.title}</p>
              <p className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
                <span>{userName(p.authorId)}</span>
                <span>{timeAgo(p.createdAt)}</span>
                {comments > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-orange-700">
                    <MessageSquare size={12} /> {comments}
                  </span>
                )}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
