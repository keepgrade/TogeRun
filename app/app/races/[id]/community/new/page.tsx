"use client";

import { useParams } from "next/navigation";
import CommunityForm from "@/components/CommunityForm";
import LoginGate from "@/components/LoginGate";
import { Empty } from "@/components/ui";
import { useApp } from "@/lib/store";

export default function NewCommunityPage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useApp();
  const race = data.races.find((r) => r.id === id);

  if (!race) return <Empty>찾을 수 없는 대회예요.</Empty>;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">커뮤니티 글쓰기</h1>
      <LoginGate>
        <CommunityForm race={race} />
      </LoginGate>
    </div>
  );
}
