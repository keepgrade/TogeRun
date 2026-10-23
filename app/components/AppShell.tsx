"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronLeft, Home, ListChecks, MessagesSquare, Plus, User } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { computeAlerts } from "@/lib/alerts";
import { INFO, SUPPORT } from "@/lib/info";
import { useApp } from "@/lib/store";

/** 앱의 가운데 열 최대 폭. PC에서도 이 폭의 열로 보여 준다(러너블과 같은 방식) */

export const APP_WIDTH = "30rem";

/** 대회 탭 안에서 오가는 화면들 */
const RACE_SECTIONS = [
  { href: "/races", label: "대회" },
  { href: "/buddy", label: "버디" },
  { href: "/calendar", label: "캘린더" },
  { href: "/map", label: "지도" },
];

/** 하단 탭 가운데 버튼은 버디 구하기 흐름으로 이어진다 */
const TAB_LEFT = [
  { href: "/home", label: "홈", icon: Home },
  { href: "/races", label: "대회", icon: ListChecks },
];
const TAB_RIGHT = [
  { href: "/community", label: "커뮤니티", icon: MessagesSquare },
  { href: "/me", label: "마이", icon: User },
];

/** 앱 틀(제목줄·하단 탭) 없이 그리는 화면 */
const BARE_PATHS = ["/about"];

const ROOT_PATHS = ["/home", "/races", "/buddy", "/calendar", "/map", "/community", "/me"];

/** 뒤로가기 줄에 보여 줄 제목. null이면 탭의 첫 화면이라 로고를 보여 준다 */
function titleFor(path: string): string | null {
  if (ROOT_PATHS.includes(path)) return null;
  if (path === "/alerts") return "알림";
  if (path === "/login") return "로그인";
  if (path === "/buddy/new") return "버디 구하기";
  if (path === "/me/profile") return "프로필 편집";
  if (/^\/races\/[^/]+\/buddy\/new$/.test(path)) return "버디 모집글 쓰기";
  if (/^\/races\/[^/]+\/review\/new$/.test(path)) return "리뷰 쓰기";
  if (/^\/races\/[^/]+\/community\/new$/.test(path)) return "커뮤니티 글쓰기";
  if (/^\/races\/[^/]+\/report$/.test(path)) return "정보 오류 제보";
  if (/^\/races\/[^/]+$/.test(path)) return "대회 상세";
  if (/^\/buddy\/[^/]+\/edit$/.test(path)) return "모집글 수정";
  if (/^\/buddy\/[^/]+$/.test(path)) return "버디 모집글";
  if (/^\/community\/[^/]+\/edit$/.test(path)) return "글 수정";
  if (/^\/community\/[^/]+$/.test(path)) return "커뮤니티";
  const info = path.match(/^\/info\/([^/]+)$/);
  if (info) return INFO[info[1]]?.title ?? "안내";
  const support = path.match(/^\/support\/([^/]+)$/);
  if (support) return SUPPORT[support[1]]?.title ?? "문의";
  return "TogeRun";
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { me, data } = useApp();
  const unread = useMemo(() => (me ? computeAlerts(data, me.id).received.length : 0), [data, me]);

  // 서비스 소개 랜딩페이지는 앱 틀 없이 넓게 보여 준다
  if (BARE_PATHS.includes(pathname)) return <>{children}</>;

  const active = (href: string) => {
    if (href === "/races") return RACE_SECTIONS.some((s) => pathname === s.href || pathname.startsWith(s.href + "/")) && !pathname.startsWith("/buddy/new");
    return pathname === href || pathname.startsWith(href + "/");
  };
  const title = titleFor(pathname);
  const sections = RACE_SECTIONS.some((s) => s.href === pathname);

  const back = () => {
    if (window.history.length > 1) router.back();
    else router.push("/home");
  };

  return (
    <div className="min-h-dvh bg-zinc-200">
      <div className="relative mx-auto min-h-dvh bg-zinc-50 pb-[calc(4.75rem+env(safe-area-inset-bottom))]" style={{ maxWidth: APP_WIDTH }}>
        <header className="sticky top-0 z-[2000] border-b border-zinc-200 bg-white/95 backdrop-blur">
          <div className="flex h-14 items-center gap-2 px-3">
            {title === null ? (
              <Link href="/home" className="text-xl font-extrabold tracking-tight text-zinc-900">
                Toge<span className="text-orange-600">Run</span>
              </Link>
            ) : (
              <>
                <button onClick={back} aria-label="뒤로가기" className="-ml-1 inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100">
                  <ChevronLeft size={24} />
                </button>
                <h1 className="truncate text-base font-bold">{title}</h1>
              </>
            )}
            <div className="ml-auto flex items-center gap-1">
              {title === null && (
                <Link href="/about" className="mr-1 text-xs font-semibold text-zinc-500 hover:text-orange-700">서비스 소개</Link>
              )}
              <Link href="/alerts" aria-label="알림" className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100">
                <Bell size={22} />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-orange-600 px-1 text-[10px] font-bold text-white">{unread}</span>
                )}
              </Link>
            </div>
          </div>
          {sections && (
            <nav aria-label="대회 보기" className="flex border-t border-zinc-100">
              {RACE_SECTIONS.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  aria-current={pathname === s.href ? "page" : undefined}
                  className={`flex-1 border-b-2 py-2.5 text-center text-sm font-semibold ${pathname === s.href ? "border-orange-600 text-orange-700" : "border-transparent text-zinc-500"}`}
                >
                  {s.label}
                </Link>
              ))}
            </nav>
          )}
        </header>

        <main className="px-4 py-4">{children}</main>

        <nav
          className="fixed bottom-0 left-1/2 z-[2000] w-full -translate-x-1/2 border-t border-zinc-200 bg-white pb-[env(safe-area-inset-bottom)]"
          style={{ maxWidth: APP_WIDTH }}
          aria-label="하단 메뉴"
        >
          <ul className="grid grid-cols-5 items-end">
            {TAB_LEFT.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link href={href} className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${active(href) ? "text-orange-600" : "text-zinc-500"}`}>
                  <Icon size={22} />
                  {label}
                </Link>
              </li>
            ))}
            <li className="flex justify-center">
              <Link href="/buddy/new" className="-mt-6 flex flex-col items-center gap-0.5 text-[11px] font-bold text-orange-700" aria-label="버디 구하기">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-white shadow-lg shadow-orange-300/50 ring-4 ring-white">
                  <Plus size={28} strokeWidth={2.5} />
                </span>
                <span className="pb-1">버디 구하기</span>
              </Link>
            </li>
            {TAB_RIGHT.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link href={href} className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${active(href) ? "text-orange-600" : "text-zinc-500"}`}>
                  <Icon size={22} />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
