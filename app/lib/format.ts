import type { Course, Currency } from "./types";
import { CURRENCY_INFO } from "./types";

export const courseName = (c: Course) => (c.label ? `${c.distance} (${c.label})` : c.distance);

export const uniqueDistances = (courses: Course[]) => Array.from(new Set(courses.map((c) => c.distance)));

export const won =(n: number | null) => (n == null ? "미정" : `${n.toLocaleString("ko-KR")}원`);

/** 해외 통화 금액을 현지 표기로. 원화는 "30,000원" */
export function money(n: number | null, currency: Currency = "KRW") {
  if (n == null) return "미정";
  if (currency === "KRW") return won(n);
  return `${CURRENCY_INFO[currency].symbol}${n.toLocaleString("en-US")}`;
}

/** 원화 환산(참고용). 1만원 이상은 "약 14만원"처럼 줄여 쓴다 */
export function approxKrw(n: number, currency: Currency) {
  const krw = Math.round(n * CURRENCY_INFO[currency].rate);
  return krw >= 10000 ? `약 ${Math.round(krw / 10000).toLocaleString("ko-KR")}만원` : `약 ${krw.toLocaleString("ko-KR")}원`;
}

/** 해외 참가비: "€150 (약 23만원)" */
export function moneyWithKrw(n: number | null, currency: Currency = "KRW") {
  if (n == null) return "미정";
  return currency === "KRW" ? won(n) : `${money(n, currency)} (${approxKrw(n, currency)})`;
}

export function feeRange(courses: Course[], currency: Currency = "KRW") {
  const fees = courses.map((c) => c.fee).filter((f): f is number => f != null);
  if (!fees.length) return "참가비 미정";
  const min = Math.min(...fees);
  const max = Math.max(...fees);
  if (currency === "KRW") return min === max ? won(min) : `${won(min)} ~ ${won(max)}`;
  return min === max ? moneyWithKrw(min, currency) : `${money(min, currency)} ~ ${money(max, currency)} (${approxKrw(min, currency)} ~)`;
}

export const paceText = (sec: number) => `${Math.floor(sec / 60)}'${String(sec % 60).padStart(2, "0")}"/km`;

export const recordText = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

/** 오픈채팅 링크 형식 검사 (PoC용 단순 규칙) */
export const isChatUrl = (u: string) => /^https:\/\/open\.kakao\.com\/o\/[A-Za-z0-9_-]+$/.test(u.trim());

export const scaleText = (n: number | null) => (n == null ? "규모 미정" : `약 ${n.toLocaleString("ko-KR")}명`);
