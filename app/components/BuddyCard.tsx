"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { Badge, card } from "./ui";
import { buddyClosed } from "@/lib/derive";
import { dday, today } from "@/lib/date";
import { useApp } from "@/lib/store";
import type { BuddyPost } from "@/lib/types";

export default function BuddyCard({ post, showRace }: { post: BuddyPost; showRace?: boolean }) {
  const { data, userName } = useApp();
  const race = data.races.find((r) => r.id === post.raceId);
  const t = today();
  const closed = buddyClosed(post, race, t);

  return (
    <Link
      href={`/buddy/${post.id}`}
      className={`${card} block p-4 transition hover:border-orange-300 hover:shadow-sm ${closed ? "opacity-60" : ""}`}
    >
      {showRace && race && <p className="mb-1 text-sm font-semibold text-zinc-700 sm:text-xs sm:font-normal sm:text-zinc-500">{race.name}</p>}
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone={closed ? "gray" : "green"}>{closed ? "모집 완료" : "모집중"}</Badge>
        {race?.scope === "해외" && <Badge tone="blue">해외</Badge>}
        {race?.type === "트레일" && <Badge tone="ink">트레일</Badge>}
        <Badge tone="orange">{post.distance}</Badge>
        <Badge tone="blue">{post.style}</Badge>
        <Badge>{post.departRegion}</Badge>
      </div>
      <p className="mt-2 line-clamp-2 text-base font-semibold text-zinc-900 sm:text-sm sm:font-normal sm:text-zinc-800">{post.intro || "한 줄 소개가 없어요"}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
        <span>{userName(post.authorId)}</span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <Users size={13} /> {post.capacity}명
          </span>
          {!closed && <span>모집 마감 {dday(post.recruitUntil, t)}</span>}
        </span>
      </div>
    </Link>
  );
}
