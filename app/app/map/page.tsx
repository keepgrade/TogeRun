"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { LocateFixed } from "lucide-react";
import KindTabs from "@/components/KindTabs";
import RaceCard from "@/components/RaceCard";
import RaceMap, { type MapMarker } from "@/components/RaceMap";
import { btnGhost, Empty, StatusBadge, card } from "@/components/ui";
import { raceStatus } from "@/lib/derive";
import { dday, fmtDate, today } from "@/lib/date";
import { matchKind, useKind, type Kind } from "@/lib/kind";
import { distanceKm, STATUS_COLOR } from "@/lib/maps";
import { useApp } from "@/lib/store";

const KOREA_CENTER: [number, number] = [36.4, 127.8];
const WORLD_CENTER: [number, number] = [28, 40];

export default function MapPage() {
  const { data } = useApp();
  const t = today();
  const [kind, setKind] = useKind();
  const [region, setRegion] = useState("");
  const [past, setPast] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [user, setUser] = useState<[number, number] | null>(null);
  const [geoMsg, setGeoMsg] = useState("");

  const inKind = useMemo(() => data.races.filter((r) => matchKind(r, kind)), [data.races, kind]);

  const visible = useMemo(
    () =>
      inKind.filter((r) => {
        const s = raceStatus(r, t);
        if (!past && (s === "종료" || s === "취소")) return false;
        return !region || r.region === region;
      }),
    [inKind, past, region, t],
  );

  const regions = useMemo(() => Array.from(new Set(inKind.map((r) => r.region))).sort(), [inKind]);

  const changeKind = (k: Kind) => {
    setKind(k);
    setRegion("");
    setSelectedId(null);
  };

  const withDistance = useMemo(
    () =>
      visible
        .map((r) => ({ r, km: user ? distanceKm(user[0], user[1], r.lat, r.lng) : null }))
        .sort((a, b) => (a.km != null && b.km != null ? a.km - b.km : a.r.date.localeCompare(b.r.date))),
    [visible, user],
  );

  const markers: MapMarker[] = useMemo(
    () => visible.map((r) => ({ id: r.id, lat: r.lat, lng: r.lng, title: r.name, color: STATUS_COLOR[raceStatus(r, t)] })),
    [visible, t],
  );

  const select = useCallback((id: string) => setSelectedId(id), []);
  const selected = visible.find((r) => r.id === selectedId) ?? null;

  const locate = () => {
    if (!navigator.geolocation) return setGeoMsg("이 브라우저는 위치 기능을 지원하지 않아요.");
    setGeoMsg("위치를 확인하는 중…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUser([pos.coords.latitude, pos.coords.longitude]);
        setGeoMsg("");
      },
      () => setGeoMsg("위치 권한이 없어서 거리순 정렬을 쓸 수 없어요."),
      { timeout: 8000 },
    );
  };

  return (
    <div>
      <h1 className="sr-only">지도</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {kind.scope === "국내" ? "가까운 지역의 대회를 지도에서 찾아보세요." : "해외 주요 대회가 열리는 도시를 지도에서 확인해 보세요."}
      </p>
      <div className="mt-3">
        <KindTabs kind={kind} onChange={changeKind} />
      </div>

      <div className="tg-chips mt-3">
        {["", ...regions].map((r) => (
          <button
            key={r || "all"}
            onClick={() => { setRegion(r); setSelectedId(null); }}
            className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-sm ${region === r ? "border-orange-600 bg-orange-600 text-white" : "border-zinc-300 bg-white text-zinc-700"}`}
          >
            {r || "전체"}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <label className="inline-flex items-center gap-2 text-zinc-600">
          <input type="checkbox" checked={past} onChange={(e) => setPast(e.target.checked)} />
          지난·취소 대회 포함
        </label>
        <button onClick={locate} className={btnGhost}>
          <LocateFixed size={14} /> 내 위치에서 가까운 순
        </button>
      </div>
      {geoMsg && <p className="mt-1 text-xs text-zinc-500">{geoMsg}</p>}

      <div className={`${card} mt-3 overflow-hidden`}>
        <RaceMap
          markers={markers}
          selectedId={selectedId}
          onSelect={select}
          center={kind.scope === "국내" ? KOREA_CENTER : WORLD_CENTER}
          zoom={kind.scope === "국내" ? 7 : 2}
          fitKey={`${kind.scope}|${kind.type}|${region}|${past}`}
          user={user}
          className="h-72 w-full md:h-96"
        />
        <div className="flex flex-wrap gap-3 border-t border-zinc-100 px-3 py-2 text-xs text-zinc-600">
          {(["접수중", "접수 예정", "접수 마감", "종료", "취소"] as const).map((s) => (
            <span key={s} className="inline-flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLOR[s] }} /> {s}
            </span>
          ))}
        </div>
      </div>

      {selected && (
        <Link href={`/races/${selected.id}`} className={`${card} mt-3 block border-orange-300 p-4`}>
          <div className="flex items-center justify-between gap-2">
            <StatusBadge status={raceStatus(selected, t)} />
            <span className="text-sm font-bold">{dday(selected.date, t)}</span>
          </div>
          <p className="mt-1.5 font-semibold">{selected.name}</p>
          <p className="text-sm text-zinc-500">
            {fmtDate(selected.date)} · {selected.region} {selected.venue}
          </p>
          <p className="mt-1 text-xs text-orange-700">대회 상세 보기 →</p>
        </Link>
      )}

      <p className="mt-5 text-sm text-zinc-500">지도에서 확인할 수 있는 대회 {visible.length}개</p>
      {withDistance.length === 0 ? (
        <div className="mt-3"><Empty>이 지역에는 표시할 대회가 없어요.</Empty></div>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {withDistance.map(({ r, km }) => (
            <div key={r.id} onMouseEnter={() => setSelectedId(r.id)}>
              <RaceCard race={r} extra={km != null ? `${km.toFixed(km < 10 ? 1 : 0)}km` : undefined} />
            </div>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-zinc-400">
        지도는 OpenStreetMap 기반 미리보기예요. 카카오맵·네이버 지도로 직접 보기는 대회 상세의 &lsquo;대회 위치&rsquo;에서 열 수 있어요.
      </p>
    </div>
  );
}
