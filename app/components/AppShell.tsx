"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, Home, ListChecks, MapPinned, MessagesSquare, User } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { computeAlerts } from "@/lib/alerts";
import { useApp } from "@/lib/store";

/** 상단 메뉴(데스크톱): 로고 옆에 대회·캘린더·지도·커뮤니티, 맨 오른쪽에 알림과 내 정보 */
const TOP = [
  { href: "/races", label: "대회" },
  { href: "/calendar", label: "캘린더" },
  { href: "/map", label: "지도" },
  { href: "/community", label: "커뮤니티" },
];

/** 하단 탭(모바일) */
const TABS = [
  { href: "/", label: "홈", icon: Home },
  { href: "/races", label: "대회", icon: ListChecks },
  { href: "/map", label: "지도", icon: MapPinned },
  { href: "/community", label: "커뮤니티", icon: MessagesSquare },
  { href: "/alerts", label: "알림", icon: Bell },
  { href: "/me", label: "내 정보", icon: User },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { me, data } = useApp();
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const unread = useMemo(() => (me ? computeAlerts(data, me.id).received.length : 0), [data, me]);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 md:pb-0">
      <div className="bg-zinc-900 px-4 py-1.5 text-center text-xs text-zinc-300">
        PoC · 가상 샘플 데이터이며 서버 없이 이 브라우저에만 저장됩니다
      </div>
      <header className="sticky top-0 z-[2000] border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
          <Link href="/" className="flex items-center gap-1.5 text-xl font-extrabold tracking-tight text-zinc-900">
            <CalendarDays size={22} className="text-orange-600" />
            TogeRun
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="주요 메뉴">
            {TOP.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${active(href) ? "bg-orange-50 text-orange-700" : "text-zinc-600 hover:bg-zinc-100"}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-xs text-zinc-500 sm:inline">{me ? me.nickname : "로그아웃 상태"}</span>
            <Link href="/alerts" aria-label="알림" className="relative hidden h-10 w-10 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100 md:inline-flex">
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute right-1 top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-orange-600 px-1 text-[10px] font-bold text-white">{unread}</span>
              )}
            </Link>
            <Link href="/me" aria-label="내 정보" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-white hover:bg-orange-700">
              <User size={18} />
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-5">{children}</main>
      <footer className="mx-auto hidden max-w-6xl border-t border-zinc-200 px-4 py-8 text-xs text-zinc-500 md:block">
        <p className="font-semibold text-zinc-700">TogeRun</p>
        <p className="mt-1">혼자 신청하기 망설여지는 대회, 같이 뛸 사람을 찾는 마라톤 동행 서비스 · 프론트엔드 PoC</p>
        <p className="mt-1">대회 정보는 가상 샘플 데이터이며 실제 대회와 무관합니다. 접수·결제는 공식 사이트에서 진행해 주세요.</p>
      </footer>
      <nav className="fixed inset-x-0 bottom-0 z-[2000] border-t border-zinc-200 bg-white md:hidden" aria-label="하단 메뉴">
        <ul className="mx-auto flex max-w-6xl">
          {TABS.map(({ href, label, icon: Icon }) => (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`relative flex flex-col items-center gap-0.5 py-2 text-[11px] ${active(href) ? "text-orange-600" : "text-zinc-500"}`}
              >
                <Icon size={20} />
                {label}
                {href === "/alerts" && unread > 0 && (
                  <span className="absolute right-3 top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-orange-600 px-1 text-[10px] font-bold text-white">{unread}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
