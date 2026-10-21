import Link from "next/link";
import type { ReactNode } from "react";

export function SectionHead({
  eyebrow, title, sub, cta,
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-orange-600">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">{title}</h2>
        {sub && <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600">{sub}</p>}
      </div>
      {cta && (
        <Link
          href={cta.href}
          className="inline-flex shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:border-orange-400 hover:text-orange-700"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}

/** 목록 위의 라벨 줄. 예: "접수 오픈 예정 · 6개" */
export function CountRow({ label, count }: { label: string; count: number }) {
  return (
    <div className="mt-8 flex items-center justify-between border-b border-zinc-200 pb-3">
      <p className="text-sm font-semibold text-zinc-700">{label}</p>
      <p className="text-sm font-bold text-orange-700">{count}개</p>
    </div>
  );
}
