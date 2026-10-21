import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import ClientOnly from "@/components/ClientOnly";
import { AppProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "TogeRun · 같이 뛸 사람을 찾는 마라톤 버디 (PoC)",
  description: "대회 정보 위에 버디 모집을 얹는 마라톤 버디 서비스의 프론트엔드 PoC",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body className="text-zinc-900 antialiased">
        <ClientOnly fallback={<div className="p-8 text-center text-sm text-zinc-400">불러오는 중…</div>}>
          <AppProvider>
            <AppShell>{children}</AppShell>
          </AppProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
