"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import BuddyForm from "@/components/BuddyForm";
import LoginGate from "@/components/LoginGate";
import { btnGhost, Empty } from "@/components/ui";
import { raceOver } from "@/lib/derive";
import { useApp } from "@/lib/store";

export default function NewBuddyPage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useApp();
  const race = data.races.find((r) => r.id === id);

  if (!race) return <Empty>찾을 수 없는 대회예요.</Empty>;
  if (raceOver(race)) {
    return (
      <Empty action={<Link href={`/races/${race.id}`} className={btnGhost}>대회로 돌아가기</Link>}>
        끝났거나 취소된 대회는 모집글을 쓸 수 없어요.
      </Empty>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">모집글 쓰기</h1>
      <LoginGate>
        <BuddyForm race={race} />
      </LoginGate>
    </div>
  );
}
