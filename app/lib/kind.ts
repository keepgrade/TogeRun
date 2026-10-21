"use client";

import { useCallback, useState } from "react";
import type { Race, RaceScope, RaceType } from "./types";

/** 대회를 보는 기준: 종류(마라톤/트레일러닝)와 범위(국내/해외) */
export interface Kind {
  type: RaceType;
  scope: RaceScope;
}

export const DEFAULT_KIND: Kind = { type: "마라톤", scope: "국내" };
export const KIND_KEY = "togerun-kind";

export const matchKind = (r: Race, k: Kind) => r.type === k.type && r.scope === k.scope;

export function readKind(): Kind {
  try {
    const raw = sessionStorage.getItem(KIND_KEY);
    if (raw) {
      const k = JSON.parse(raw) as Kind;
      if ((k.type === "마라톤" || k.type === "트레일") && (k.scope === "국내" || k.scope === "해외")) return k;
    }
  } catch {
    /* 저장된 값이 깨졌으면 기본값을 쓴다 */
  }
  return DEFAULT_KIND;
}

export function writeKind(k: Kind) {
  try {
    sessionStorage.setItem(KIND_KEY, JSON.stringify(k));
  } catch {
    /* 저장 공간이 없으면 이 화면에서만 유지된다 */
  }
}

/** 목록·캘린더·지도가 같은 선택을 공유하도록 세션 저장소에 둔다 */
export function useKind(): [Kind, (k: Kind) => void] {
  const [kind, setKind] = useState<Kind>(readKind);
  const update = useCallback((k: Kind) => {
    setKind(k);
    writeKind(k);
  }, []);
  return [kind, update];
}
