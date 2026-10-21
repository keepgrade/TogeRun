"use client";

import { useParams } from "next/navigation";
import CommunityForm from "@/components/CommunityForm";
import LoginGate from "@/components/LoginGate";
import { Empty } from "@/components/ui";
import { useApp } from "@/lib/store";

export default function EditCommunityPage() {
  const { id } = useParams<{ id: string }>();
  const { data, me } = useApp();
  const post = data.cposts.find((p) => p.id === id);
  const race = post && data.races.find((r) => r.id === post.raceId);

  if (!post || !race) return <Empty>찾을 수 없는 글이에요.</Empty>;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">글 수정</h1>
      <LoginGate>
        {me?.id === post.authorId ? <CommunityForm race={race} post={post} /> : <Empty>내가 쓴 글만 수정할 수 있어요.</Empty>}
      </LoginGate>
    </div>
  );
}
