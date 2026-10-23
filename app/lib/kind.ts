"use client";

import { useSyncExternalStore } from "react";
import { TYPE_LABEL, type Race, type RaceScope, type RaceType } from "./types";

/** 대회를 보는 기준: 종류(마라톤/트레일러닝)와 범위(국내/해외) */
export interface Kind {
  type: RaceType;
  scope: RaceScope;
}

export const DEFAULT_KIND: Kind = { type: "마라톤", scope: "국내" };
export const KIND_KEY = "togerun-kind";

export const matchKind = (r: Race, k: Kind) => r.type === k.type && r.scope === k.scope;

/** 예: "국내 마라톤", "해외 트레일러닝" */
export const kindLabel = (k: Kind) => `${k.scope} ${TYPE_LABEL[k.type]}`;

const parse = (raw: string | null): Kind => {
  try {
    if (raw) {
      const k = JSON.parse(raw) as Kind;
      if ((k.type === "마라톤" || k.type === "트레일") && (k.scope === "국내" || k.scope === "해외")) return k;
    }
  } catch {
    /* 저장된 값이 깨졌으면 기본값을 쓴다 */
  }
  return DEFAULT_KIND;
};

const listeners = new Set<() => void>();
let cache: { raw: string | null; kind: Kind } = { raw: null, kind: DEFAULT_KIND };

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

/** 같은 문자열이면 같은 객체를 돌려줘서 구독하는 쪽이 불필요하게 다시 그려지지 않게 한다 */
function getSnapshot(): Kind {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(KIND_KEY);
  } catch {
    /* 저장소를 못 읽으면 기본값 */
  }
  if (raw !== cache.raw) cache = { raw, kind: parse(raw) };
  return cache.kind;
}

export const readKind = getSnapshot;

export function writeKind(k: Kind) {
  try {
    sessionStorage.setItem(KIND_KEY, JSON.stringify(k));
  } catch {
    /* 저장 공간이 없으면 이 화면에서만 유지된다 */
  }
  listeners.forEach((l) => l());
}

/** 홈·목록·캘린더·지도가 같은 선택을 공유한다. 한 곳에서 바꾸면 모두 따라 바뀐다 */
export function useKind(): [Kind, (k: Kind) => void] {
  const kind = useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_KIND);
  return [kind, writeKind];
}
