"use client";

import { useRouter } from "next/navigation";
import { btnGhost, card } from "@/components/ui";
import { takeNextPath, useApp } from "@/lib/store";

const PROVIDERS = [
  { id: "kakao", label: "카카오로 계속하기", cls: "bg-yellow-300 text-zinc-900 hover:bg-yellow-400" },
  { id: "google", label: "Google로 계속하기", cls: "bg-white text-zinc-800 border border-zinc-300 hover:bg-zinc-50" },
  { id: "naver", label: "네이버로 계속하기", cls: "bg-green-600 text-white hover:bg-green-700" },
];

export default function LoginPage() {
  const router = useRouter();
  const { me, a } = useApp();

  const go = (provider: string) => {
    a.login(provider);
    router.replace(takeNextPath());
  };

  return (
    <div className="mx-auto max-w-sm pt-6">
      <h1 className="text-xl font-bold">로그인</h1>
      <p className="mt-1 text-sm text-zinc-500">
        PoC라서 실제 인증 없이 익명 닉네임이 만들어져요. 같은 버튼으로 다시 들어오면 같은 계정으로 돌아와요.
      </p>
      {me && (
        <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          지금 <b>{me.nickname}</b> 님으로 로그인되어 있어요.
        </p>
      )}
      <div className={`${card} mt-4 space-y-2 p-4`}>
        {PROVIDERS.map((p) => (
          <button key={p.id} onClick={() => go(p.id)} className={`w-full rounded-lg px-4 py-3 text-sm font-semibold ${p.cls}`}>
            {p.label}
          </button>
        ))}
      </div>
      <button onClick={() => router.back()} className={`${btnGhost} mt-3`}>뒤로</button>
    </div>
  );
}
