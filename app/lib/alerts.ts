import { addDays, parse } from "./date";
import { raceOver } from "./derive";
import type { Data } from "./types";

/**
 * PoC의 임시 알림 규칙. 알림 시점은 PRD의 열린 질문이라 확정된 값이 아니다.
 * 실제 알림은 발송하지 않고, 언제 도착할지만 계산해 보여 준다.
 */
export const OPEN_LEAD_DAYS = 1;
export const CLOSE_LEAD_DAYS = 2;
export const NOTIFY_TIME = "09:00";

export interface AlertItem {
  id: string;
  raceId: string;
  kind: "접수 오픈" | "마감 임박" | "취소";
  notifyAt: Date;
  eventAt: Date;
  message: string;
}

const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const pad = (n: number) => String(n).padStart(2, "0");

export const fmtAt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}(${DOW[d.getDay()]}) ${pad(d.getHours())}:${pad(d.getMinutes())}`;

const at = (date: string, time: string | undefined, fallback: string) => {
  const [h, m] = (time ?? fallback).split(":").map(Number);
  const d = parse(date);
  d.setHours(h, m, 0, 0);
  return d;
};

export function computeAlerts(d: Data, meId: string, now = new Date()) {
  const favs = d.favorites[meId] ?? [];
  const prefs = d.alertPrefs[meId] ?? {};
  const upcoming: AlertItem[] = [];
  const received: AlertItem[] = [];

  for (const id of favs) {
    const r = d.races.find((x) => x.id === id);
    if (!r) continue;

    if (r.cancelled) {
      received.push({
        id: `${id}-cancel`, raceId: id, kind: "취소", notifyAt: now, eventAt: parse(r.date),
        message: `${r.name} 대회가 취소됐어요`,
      });
      continue;
    }
    if (raceOver(r)) continue;

    const pref = prefs[id] ?? { open: true, close: true };
    const place = (item: AlertItem) => (item.notifyAt <= now ? received : upcoming).push(item);

    if (pref.open) {
      const eventAt = at(r.regOpen, r.regOpenTime, "00:00");
      if (eventAt >= now) {
        place({
          id: `${id}-open`, raceId: id, kind: "접수 오픈", eventAt,
          notifyAt: at(addDays(r.regOpen, -OPEN_LEAD_DAYS), undefined, NOTIFY_TIME),
          message: `${r.name} 접수가 ${fmtAt(eventAt)}에 열려요`,
        });
      }
    }
    if (pref.close) {
      const eventAt = at(r.regClose, r.regCloseTime, "23:59");
      if (eventAt >= now) {
        place({
          id: `${id}-close`, raceId: id, kind: "마감 임박", eventAt,
          notifyAt: at(addDays(r.regClose, -CLOSE_LEAD_DAYS), undefined, NOTIFY_TIME),
          message: `${r.name} 접수가 ${fmtAt(eventAt)}에 마감돼요`,
        });
      }
    }
  }

  upcoming.sort((a, b) => a.notifyAt.getTime() - b.notifyAt.getTime());
  received.sort((a, b) => b.notifyAt.getTime() - a.notifyAt.getTime());
  return { upcoming, received };
}
