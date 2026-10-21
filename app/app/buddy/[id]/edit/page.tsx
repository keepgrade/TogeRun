"use client";

import { useParams } from "next/navigation";
import BuddyForm from "@/components/BuddyForm";
import LoginGate from "@/components/LoginGate";
import { Empty } from "@/components/ui";
import { useApp } from "@/lib/store";

export default function EditBuddyPage() {
  const { id } = useParams<{ id: string }>();
  const { data, me } = useApp();
  const post = data.buddyPosts.find((p) => p.id === id);
  const race = post && data.races.find((r) => r.id === post.raceId);

  if (!post || !race) return <Empty>찾을 수 없는 모집글이에요.</Empty>;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">모집글 수정</h1>
      <LoginGate>
        {me?.id === post.authorId ? <BuddyForm race={race} post={post} /> : <Empty>내가 쓴 글만 수정할 수 있어요.</Empty>}
      </LoginGate>
    </div>
  );
}
