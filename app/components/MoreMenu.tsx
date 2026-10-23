"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail } from "lucide-react";
import { NewsletterModal, readSubscribed } from "@/components/Newsletter";
import { btnGhost } from "@/components/ui";
import { MENU_COLUMNS } from "@/lib/links";
import { useApp } from "@/lib/store";

const rowCls = "flex items-center justify-between border-b border-zinc-100 px-4 py-3 text-sm last:border-b-0 hover:bg-zinc-50";

/** 마이 화면 맨 아래 더보기: 랜딩페이지 하단과 같은 안내 링크, 뉴스레터, 시험판 도구 */
export default function MoreMenu() {
  const { a } = useApp();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(() => {
    const raw = readSubscribed();
    try {
      return raw ? ((JSON.parse(raw) as { email?: string }).email ?? raw) : "";
    } catch {
      return raw;
    }
  });

  return (
    <div className="mt-8">
      <h2 className="mb-2 text-lg font-bold">더보기</h2>
      <div className="space-y-3">
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <button onClick={() => setOpen(true)} className={`${rowCls} w-full text-left`}>
            <span className="inline-flex items-center gap-2 font-medium">
              <Mail size={16} className="text-orange-600" /> 뉴스레터 구독
            </span>
            <span className="text-xs text-zinc-500">{done ? `${done} 신청됨` : "새 대회·접수 소식 받기"}</span>
          </button>
        </div>

        {MENU_COLUMNS.filter((c) => c.title !== "서비스").map((col) => (
          <div key={col.title}>
            <p className="mb-1 px-1 text-xs font-bold text-zinc-500">{col.title}</p>
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
              {col.links.map((l) =>
                l.external ? (
                  <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={rowCls}>
                    {l.label}
                    <span className="text-zinc-300">↗</span>
                  </a>
                ) : (
                  <Link
                    key={l.label}
                    href={l.href}
                    onClick={l.past ? () => sessionStorage.setItem("togerun-past", "1") : undefined}
                    className={rowCls}
                  >
                    {l.label}
                    <span className="text-zinc-300">›</span>
                  </Link>
                ),
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
        <p className="font-semibold text-zinc-800">시험판 안내</p>
        <p className="mt-1">대회 정보는 가상 샘플 데이터이며, 입력한 내용은 이 브라우저에만 저장돼요. 접수·결제는 공식 사이트에서 진행해 주세요.</p>
        <button
          onClick={() => window.confirm("샘플 데이터로 되돌리고 내가 만든 글을 모두 지울까요?") && a.resetData()}
          className={`${btnGhost} mt-3`}
        >
          데이터 초기화
        </button>
      </div>
      <p className="mt-4 text-center text-xs text-zinc-400">© 2026 TogeRun</p>

      {open && <NewsletterModal onClose={() => setOpen(false)} onDone={(e) => { setDone(e); setOpen(false); }} />}
    </div>
  );
}
