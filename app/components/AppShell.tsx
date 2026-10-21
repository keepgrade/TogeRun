"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, ListChecks, MapPinned, User } from "lucide-react";
import type { ReactNode } from "react";
import { useApp } from "@/lib/store";

const NAV = [
  { href: "/", label: "홈", icon: Home },
  { href: "/races", label: "대회", icon: ListChecks },
  { href: "/map", label: "지도", icon: MapPinned },
  { href: "/me", label: "내 정보", icon: User },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { me } = useApp();
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 md:pb-0">
      <div className="bg-zinc-900 px-4 py-1.5 text-center text-xs text-zinc-300">
        PoC · 가상 샘플 데이터이며 서버 없이 이 브라우저에만 저장됩니다
      </div>
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-1.5 text-lg font-extrabold tracking-tight text-zinc-900">
            <CalendarDays size={20} className="text-orange-600" />
            TogeRun
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${active(href) ? "bg-orange-50 text-orange-700" : "text-zinc-600 hover:bg-zinc-100"}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <span className="text-xs text-zinc-500">{me ? me.nickname : "로그아웃 상태"}</span>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-5">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white md:hidden">
        <ul className="mx-auto flex max-w-4xl">
          {NAV.map(({ href, label, icon: Icon }) => (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 py-2 text-xs ${active(href) ? "text-orange-600" : "text-zinc-500"}`}
              >
                <Icon size={20} />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
