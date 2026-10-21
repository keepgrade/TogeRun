"use client";

import { paceText, recordText } from "@/lib/format";
import { useApp } from "@/lib/store";
import { card } from "./ui";

/** 작성자가 공개로 설정한 항목만 보여 준다. 비공개 항목은 존재 여부도 드러내지 않는다. */
export default function PublicProfile({ userId }: { userId: string }) {
  const { data, userName } = useApp();
  const p = data.profiles[userId];
  const history = data.histories[userId] ?? [];

  const rows: [string, string][] = [];
  if (p?.pub.gender && p.gender) rows.push(["성별", p.gender]);
  if (p?.pub.age && p.age) rows.push(["나이", p.age]);
  if (p?.pub.pace && p.paceSec) rows.push(["러닝 페이스", paceText(p.paceSec)]);
  const showHistory = p?.pub.history && history.length > 0;
  const finished = history.filter((h) => h.result === "완주").length;

  return (
    <div className={`${card} p-4`}>
      <p className="text-sm font-semibold">{userName(userId)}</p>
      {rows.length === 0 && !showHistory && <p className="mt-1 text-xs text-zinc-500">공개한 프로필 정보가 없어요.</p>}
      {rows.length > 0 && (
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-zinc-500">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}
      {showHistory && (
        <div className="mt-3 border-t border-zinc-100 pt-3">
          <p className="text-xs text-zinc-500">
            마라톤 경험 {history.length}건 · 완주 {finished}회
          </p>
          <ul className="mt-1 space-y-0.5 text-sm">
            {history.slice(0, 3).map((h) => (
              <li key={h.id}>
                {h.year} {h.raceName} · {h.distance} · {h.result}
                {h.recordSec ? ` · ${recordText(h.recordSec)}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
