"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** 루트 주소는 앱 홈으로 보낸다. 서비스 소개 랜딩페이지는 /about에 따로 있다 */
export default function Root() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/home");
  }, [router]);
  return null;
}
