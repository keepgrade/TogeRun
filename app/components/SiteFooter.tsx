"use client";

import Link from "next/link";
import { MENU_COLUMNS, type MenuLink } from "@/lib/links";

const linkCls = "text-sm text-zinc-600 hover:text-orange-700 hover:underline";

/** 랜딩페이지 하단 안내 메뉴. 앱 안에서는 마이 화면의 더보기가 같은 링크를 보여 준다 */
export default function SiteFooter({ openIn }: { openIn?: (link: MenuLink) => void }) {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-lg font-extrabold tracking-tight text-zinc-900">TogeRun</p>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-zinc-600">
          혼자 신청하기 망설여지는 대회, 같이 뛸 사람을 찾는 마라톤 버디 서비스입니다. 국내외 마라톤·트레일러닝 대회 정보와 버디 모집, 리뷰, 커뮤니티를 제공합니다.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 min-[640px]:grid-cols-3 min-[1024px]:grid-cols-5">
          {MENU_COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-sm font-bold text-zinc-900">{col.title}</h2>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.external ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className={linkCls}>{l.label}</a>
                    ) : openIn ? (
                      <button onClick={() => openIn(l)} className={`${linkCls} text-left`}>{l.label}</button>
                    ) : (
                      <Link href={l.href} className={linkCls} onClick={l.past ? () => sessionStorage.setItem("togerun-past", "1") : undefined}>{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-10 border-t border-zinc-100 pt-5 text-xs leading-relaxed text-zinc-500">
          <p>대회 정보는 가상 샘플 데이터이며 실제 대회와 무관합니다. 접수·결제는 공식 사이트에서 진행해 주세요.</p>
          <p className="mt-1">© 2026 TogeRun. 프런트엔드 시험판 · 서버 없이 이 브라우저에만 저장됩니다.</p>
        </div>
      </div>
    </footer>
  );
}
