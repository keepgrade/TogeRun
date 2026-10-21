"use client";

import type { ReactNode } from "react";
import { btnPrimary, Empty } from "./ui";
import { useApp, useGuard } from "@/lib/store";

export default function LoginGate({ children }: { children: ReactNode }) {
  const { me } = useApp();
  const guard = useGuard();
  if (me) return <>{children}</>;
  return (
    <Empty
      action={
        <button className={btnPrimary} onClick={() => guard(() => {})}>
          로그인하고 계속하기
        </button>
      }
    >
      이 화면은 로그인이 필요해요.
    </Empty>
  );
}
