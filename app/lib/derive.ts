import { today } from "./date";
import type { BuddyPost, Data, Race, RaceStatus } from "./types";

/** 날짜로 계산하는 접수 상태. 취소는 운영자가 직접 입력한 값이다. */
export function raceStatus(r: Race, t = today()): RaceStatus {
  if (r.cancelled) return "취소";
  if (t > r.date) return "종료";
  if (t < r.regOpen) return "접수 예정";
  if (t <= r.regClose) return "접수중";
  return "접수 마감";
}

export const raceOver = (r: Race, t = today()) => {
  const s = raceStatus(r, t);
  return s === "종료" || s === "취소";
};

/** 작성자가 마감했거나, 모집 마감일이 지났거나, 대회가 끝났으면 모집 완료 */
export function buddyClosed(p: BuddyPost, r: Race | undefined, t = today()) {
  return p.closed || p.recruitUntil < t || !r || raceOver(r, t);
}

export function raceStats(d: Data, raceId: string, meId: string | null) {
  const race = d.races.find((r) => r.id === raceId);
  const t = today();
  const blocked = meId ? d.blocked[meId] ?? [] : [];
  const posts = d.buddyPosts.filter((p) => p.raceId === raceId && !blocked.includes(p.authorId));
  const reviews = d.reviews.filter((v) => v.raceId === raceId && !blocked.includes(v.authorId));
  const cposts = d.cposts.filter((c) => c.raceId === raceId && !blocked.includes(c.authorId));
  const avg = reviews.length ? reviews.reduce((s, v) => s + v.rating, 0) / reviews.length : 0;
  const faved = meId ? (d.favorites[meId] ?? []).includes(raceId) : false;
  return {
    interest: (race?.baseInterest ?? 0) + (faved ? 1 : 0),
    openBuddy: posts.filter((p) => !buddyClosed(p, race, t)).length,
    avg,
    reviewCount: reviews.length,
    postCount: cposts.length,
    faved,
  };
}
