"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LoginGate from "@/components/LoginGate";
import ProfileForm from "@/components/ProfileForm";
import PublicProfile from "@/components/PublicProfile";
import RunRecords from "@/components/RunRecords";
import { useApp } from "@/lib/store";

function Body() {
  const { me } = useApp();
  if (!me) return null;

  return (
    <div className="space-y-8">
      <ProfileForm />
      <RunRecords />
      <section>
        <h2 className="mb-1 text-lg font-bold">다른 사람에게 이렇게 보여요</h2>
        <p className="mb-3 text-xs text-zinc-500">모집글 상세의 작성자 영역에 보이는 모습이에요. 비공개 항목은 나타나지 않아요.</p>
        <PublicProfile userId={me.id} />
      </section>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/me" className="mb-3 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800">
        <ArrowLeft size={14} /> 내 정보
      </Link>
      <h1 className="text-xl font-bold">러닝 프로필</h1>
      <p className="mt-1 text-sm text-zinc-500">같이 뛸 사람에게 나를 알리되, 보여 줄 항목은 내가 정해요.</p>
      <div className="mt-5">
        <LoginGate>
          <Body />
        </LoginGate>
      </div>
    </div>
  );
}
