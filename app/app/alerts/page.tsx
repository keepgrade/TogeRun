"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Bell, CalendarPlus } from "lucide-react";
import LoginGate from "@/components/LoginGate";
import { Badge, btnGhost, card, Empty } from "@/components/ui";
import { CLOSE_LEAD_DAYS, computeAlerts, fmtAt, NOTIFY_TIME, OPEN_LEAD_DAYS, type AlertItem } from "@/lib/alerts";
import { raceStatus } from "@/lib/derive";
import { downloadIcs } from "@/lib/ics";
import { useApp } from "@/lib/store";
import { StatusBadge } from "@/components/ui";

const TONE = { "접수 오픈": "blue", "마감 임박": "orange", 취소: "red" } as const;

function Row({ item, soon }: { item: AlertItem; soon?: boolean }) {
  return (
    <li>
      <Link href={`/races/${item.raceId}`} className={`${card} flex items-start gap-3 p-3 hover:border-orange-300`}>
        <Badge tone={TONE[item.kind]}>{item.kind}</Badge>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-zinc-800">{item.message}</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {soon ? `${fmtAt(item.notifyAt)}에 알려 드려요` : item.kind === "취소" ? "대회 정보가 바뀌었어요" : `${fmtAt(item.notifyAt)}에 도착했어요`}
          </p>
        </div>
      </Link>
    </li>
  );
}

function AlertsBody() {
  const { data, me, myFavorites } = useApp();
  const { upcoming, received } = useMemo(() => (me ? computeAlerts(data, me.id) : { upcoming: [], received: [] }), [data, me]);
  const saved = data.races.filter((r) => myFavorites.includes(r.id));

  return (
    <div>
      <p className="rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
        PoC라서 실제 알림은 발송되지 않아요. 저장한 대회의 알림이 언제 도착할지만 보여 줘요. 임시 규칙: 접수 오픈 {OPEN_LEAD_DAYS}일 전, 마감 {CLOSE_LEAD_DAYS}일 전 오전 {NOTIFY_TIME}.
      </p>

      <h2 className="mb-2 mt-6 text-lg font-bold">받은 알림 {received.length}</h2>
      {received.length ? (
        <ul className="space-y-2">{received.map((i) => <Row key={i.id} item={i} />)}</ul>
      ) : (
        <Empty>지금 도착한 알림이 없어요.</Empty>
      )}

      <h2 className="mb-2 mt-6 text-lg font-bold">알림 예정 {upcoming.length}</h2>
      {upcoming.length ? (
        <ul className="space-y-2">{upcoming.map((i) => <Row key={i.id} item={i} soon />)}</ul>
      ) : (
        <Empty
          action={<Link href="/races" className={btnGhost}>대회에서 관심 저장하기</Link>}
        >
          예정된 알림이 없어요. 대회를 저장하면 접수 오픈과 마감 전에 알려 드려요.
        </Empty>
      )}

      <div className="mb-2 mt-6 flex items-center justify-between">
        <h2 className="text-lg font-bold">저장한 대회 {saved.length}</h2>
        {saved.length > 0 && (
          <button onClick={() => downloadIcs(saved, "togerun-favorites.ics")} className={btnGhost}>
            <CalendarPlus size={14} /> 모두 내 캘린더에 추가
          </button>
        )}
      </div>
      {saved.length ? (
        <ul className="space-y-2">
          {saved.map((r) => (
            <li key={r.id}>
              <Link href={`/races/${r.id}`} className={`${card} flex items-center justify-between gap-2 p-3 hover:border-orange-300`}>
                <span className="min-w-0 truncate text-sm font-medium">{r.name}</span>
                <StatusBadge status={raceStatus(r)} />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>저장한 대회가 없어요.</Empty>
      )}
    </div>
  );
}

export default function AlertsPage() {
  return (
    <div>
      <h1 className="flex items-center gap-2 text-xl font-bold">
        <Bell size={20} /> 알림
      </h1>
      <div className="mt-4">
        <LoginGate>
          <AlertsBody />
        </LoginGate>
      </div>
    </div>
  );
}
