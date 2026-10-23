"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { inputCls } from "@/components/ui";

export const PAGE_SIZES = [15, 30] as const;

/** 목록을 쪽(페이지)으로 나눈다. 필터가 바뀌면 resetPage()로 1쪽으로 돌아간다. */
export function usePaged<T>(items: T[]) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState<number>(PAGE_SIZES[0]);
  const pages = Math.max(1, Math.ceil(items.length / size));
  const cur = Math.min(page, pages);
  return {
    page: cur,
    pages,
    size,
    slice: items.slice((cur - 1) * size, cur * size),
    resetPage: () => setPage(1),
    setPage: (p: number) => {
      setPage(p);
      window.scrollTo({ top: 0 });
    },
    setSize: (s: number) => {
      setSize(s);
      setPage(1);
    },
  };
}

/** 보여 줄 쪽 번호. 많으면 처음·끝과 현재 주변만 남기고 …로 줄인다 */
function pageNumbers(cur: number, pages: number): (number | "…")[] {
  const keep = new Set([1, pages, cur - 1, cur, cur + 1]);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const n of [...keep].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b)) {
    if (n - prev > 1) out.push("…");
    out.push(n);
    prev = n;
  }
  return out;
}

const btn = "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm";

export default function Pagination({
  page, pages, size, total, onPage, onSize,
}: {
  page: number;
  pages: number;
  size: number;
  total: number;
  onPage: (p: number) => void;
  onSize: (s: number) => void;
}) {
  if (total === 0) return null;
  return (
    <nav aria-label="쪽 이동" className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <div className="flex flex-wrap items-center justify-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="이전 쪽"
          className={`${btn} border-zinc-300 bg-white text-zinc-700 disabled:opacity-40`}
        >
          <ChevronLeft size={16} />
        </button>
        {pageNumbers(page, pages).map((n, i) =>
          n === "…" ? (
            <span key={`gap${i}`} className="px-1 text-zinc-400">…</span>
          ) : (
            <button
              key={n}
              onClick={() => onPage(n)}
              aria-current={n === page ? "page" : undefined}
              aria-label={`${n}쪽`}
              className={`${btn} ${n === page ? "border-orange-600 bg-orange-600 text-white" : "border-zinc-300 bg-white text-zinc-700"}`}
            >
              {n}
            </button>
          ),
        )}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= pages}
          aria-label="다음 쪽"
          className={`${btn} border-zinc-300 bg-white text-zinc-700 disabled:opacity-40`}
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-zinc-500">
        한 쪽에
        <select
          value={size}
          onChange={(e) => onSize(Number(e.target.value))}
          className={`${inputCls} !w-auto`}
          aria-label="한 쪽에 보여 줄 개수"
        >
          {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}개</option>)}
        </select>
      </label>
    </nav>
  );
}
