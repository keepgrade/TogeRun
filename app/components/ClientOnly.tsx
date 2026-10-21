"use client";

import { useSyncExternalStore, type ReactNode } from "react";

const subscribe = () => () => {};

/**
 * PoC는 브라우저 로컬 저장소와 현재 시각에 의존하므로 서버 렌더링을 건너뛰고
 * 하이드레이션 이후에만 화면을 그린다.
 */
export default function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  return <>{mounted ? children : fallback}</>;
}
