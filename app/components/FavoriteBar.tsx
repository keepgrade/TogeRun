"use client";

import { CalendarPlus, Heart } from "lucide-react";
import { btnGhost, card } from "./ui";
import { CLOSE_LEAD_DAYS, NOTIFY_TIME, OPEN_LEAD_DAYS } from "@/lib/alerts";
import { raceOver } from "@/lib/derive";
import { downloadIcs } from "@/lib/ics";
import { useApp, useGuard } from "@/lib/store";
import type { Race } from "@/lib/types";

export default function FavoriteBar({ race }: { race: Race }) {
  const { data, me, myFavorites, a } = useApp();
  const guard = useGuard();
  const faved = myFavorites.includes(race.id);
  const pref = (me && data.alertPrefs[me.id]?.[race.id]) || { open: true, close: true };
  const over = raceOver(race);

  return (
    <div className={`${card} mt-3 p-3`}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => guard(() => a.toggleFavorite(race.id))}
          aria-pressed={faved}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold ${
            faved ? "border-orange-600 bg-orange-50 text-orange-700" : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          <Heart size={16} fill={faved ? "currentColor" : "none"} /> {faved ? "관심 대회 저장됨" : "관심 대회 저장"}
        </button>
        <button onClick={() => downloadIcs([race], `togerun-${race.id}.ics`)} className={btnGhost}>
          <CalendarPlus size={16} /> 내 캘린더에 추가
        </button>
      </div>

      {faved && !over && (
        <div className="mt-3 border-t border-zinc-100 pt-3 text-sm">
          <p className="mb-1.5 text-xs font-medium text-zinc-500">접수 알림</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={pref.open}
                onChange={(e) => a.setAlertPref(race.id, { ...pref, open: e.target.checked })}
              />
              접수 오픈 {OPEN_LEAD_DAYS}일 전
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={pref.close}
                onChange={(e) => a.setAlertPref(race.id, { ...pref, close: e.target.checked })}
              />
              마감 임박 {CLOSE_LEAD_DAYS}일 전
            </label>
          </div>
          <p className="mt-1.5 text-xs text-zinc-400">PoC 임시 규칙: 오전 {NOTIFY_TIME}에 알려 줘요. 실제 알림은 발송되지 않아요.</p>
        </div>
      )}
      {faved && over && <p className="mt-2 text-xs text-zinc-500">끝났거나 취소된 대회는 알림이 오지 않아요.</p>}
    </div>
  );
}
