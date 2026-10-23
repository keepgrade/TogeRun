"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";

/**
 * 접어 둘 수 있는 상세 필터. 모바일에서는 필터가 화면 대부분을 차지하지 않도록 기본은 접어 두고,
 * 접힌 상태에서도 몇 개가 적용 중인지 보여 준다.
 */
export default function FilterPanel({ active, onReset, children }: { active: number; onReset: () => void; children: ReactNode }) {
  return (
    <details className="group mt-3 rounded-xl border border-zinc-200 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold marker:content-none">
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-zinc-500" />
          상세 필터
          {active > 0 && <span className="rounded-full bg-orange-600 px-2 py-0.5 text-xs font-bold text-white">{active}</span>}
        </span>
        <ChevronDown size={18} className="text-zinc-500 transition group-open:rotate-180" />
      </summary>
      <div className="space-y-3 border-t border-zinc-100 px-4 pb-4 pt-3">
        {children}
        <div className="flex justify-end">
          <button onClick={onReset} className="text-sm text-zinc-600 underline">필터 초기화</button>
        </div>
      </div>
    </details>
  );
}
