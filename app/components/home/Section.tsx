"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function SectionHead({
  eyebrow, title, sub, cta, dark = false,
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
  cta?: { href: string; label: string; onClick?: () => void };
  /** 색 배경 위에 올릴 때 글자를 흰색으로 */
  dark?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div>
        <p className={`text-xs font-bold uppercase tracking-widest ${dark ? "text-amber-200" : "text-orange-600"}`}>{eyebrow}</p>
        <h2 className={`mt-1.5 text-xl font-extrabold leading-tight tracking-tight ${dark ? "text-white" : ""}`}>{title}</h2>
        {sub && <p className={`mt-2 hidden max-w-xl text-sm leading-relaxed sm:block ${dark ? "text-white/90" : "text-zinc-600"}`}>{sub}</p>}
      </div>
      {cta && (
        <Link
          href={cta.href}
          onClick={cta.onClick}
          className={`inline-flex shrink-0 items-center justify-center self-start rounded-full border px-3.5 py-1.5 text-xs font-semibold sm:self-auto sm:px-4 sm:py-2 sm:text-sm ${dark ? "border-white bg-white text-red-700 hover:bg-amber-50" : "border-zinc-300 bg-white hover:border-orange-400 hover:text-orange-700"}`}
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}

/** 목록 위의 라벨 줄. 예: "접수 오픈 예정 · 6개" */
export function CountRow({ label, count, dark = false }: { label: string; count: number; dark?: boolean }) {
  return (
    <div className={`mt-8 flex items-center justify-between border-b pb-3 ${dark ? "border-white/40" : "border-zinc-200"}`}>
      <p className={`text-sm font-semibold ${dark ? "text-white" : "text-zinc-700"}`}>{label}</p>
      <p className={`text-sm font-bold ${dark ? "text-amber-200" : "text-orange-700"}`}>{count}개</p>
    </div>
  );
}

const BAND_TONE = {
  sky: "bg-sky-50",
  stone: "bg-stone-100",
  orange: "bg-orange-50",
  green: "bg-emerald-50",
  indigo: "bg-indigo-50",
} as const;

/** 홈 구획을 색 배경으로 구분한다. 카드는 흰색이라 배경 위에서 또렷하다 */
export function Band({ tone, children }: { tone: keyof typeof BAND_TONE; children: ReactNode }) {
  return <section className={`mt-6 rounded-2xl px-4 py-8 ring-1 ring-black/5 sm:px-8 sm:py-10 ${BAND_TONE[tone]}`}>{children}</section>;
}
