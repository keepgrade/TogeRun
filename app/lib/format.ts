import type { Course } from "./types";

export const courseName = (c: Course) => (c.label ? `${c.distance} (${c.label})` : c.distance);

export const uniqueDistances = (courses: Course[]) => Array.from(new Set(courses.map((c) => c.distance)));

export const won =(n: number | null) => (n == null ? "미정" : `${n.toLocaleString("ko-KR")}원`);

export function feeRange(courses: Course[]) {
  const fees = courses.map((c) => c.fee).filter((f): f is number => f != null);
  if (!fees.length) return "참가비 미정";
  const min = Math.min(...fees);
  const max = Math.max(...fees);
  return min === max ? won(min) : `${won(min)} ~ ${won(max)}`;
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
