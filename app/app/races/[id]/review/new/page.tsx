"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import LoginGate from "@/components/LoginGate";
import ReviewForm from "@/components/ReviewForm";
import { btnGhost, Empty } from "@/components/ui";
import { raceStatus } from "@/lib/derive";
import { useApp } from "@/lib/store";

function Body() {
  const { id } = useParams<{ id: string }>();
  const { data, me } = useApp();
  const race = data.races.find((r) => r.id === id);
  if (!race || !me) return <Empty>찾을 수 없는 대회예요.</Empty>;

  const status = raceStatus(race);
  const existing = data.reviews.find((v) => v.raceId === race.id && v.authorId === me.id);

  if (status !== "종료" && !existing) {
    return (
      <Empty action={<Link href={`/races/${race.id}`} className={btnGhost}>대회로 돌아가기</Link>}>
        {status === "취소" ? "취소된 대회에는 리뷰를 쓸 수 없어요." : "대회가 끝난 뒤에 리뷰를 쓸 수 있어요."}
      </Empty>
    );
  }

  return (
    <>
      {existing && (
        <p role="status" className="mb-3 rounded-lg bg-sky-50 p-3 text-sm text-sky-900">
          이 대회에는 이미 리뷰를 썼어요. 새로 쓰는 대신 내 리뷰를 수정해 주세요.
        </p>
      )}
      <ReviewForm race={race} review={existing} />
    </>
  );
}

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useApp();
  const race = data.races.find((r) => r.id === id);
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-xl font-bold">리뷰 쓰기</h1>
      {race && <p className="mb-4 text-sm text-zinc-500">{race.name}</p>}
      <LoginGate>
        <Body />
      </LoginGate>
    </div>
  );
}
