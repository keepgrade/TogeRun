"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { CalendarDays, ListFilter, MapPinned, Users } from "lucide-react";
import RaceMap, { type MapMarker } from "@/components/RaceMap";
import { SectionHead } from "./Section";
import { raceStatus } from "@/lib/derive";
import { today } from "@/lib/date";
import { STATUS_COLOR } from "@/lib/maps";
import { useApp } from "@/lib/store";

const CARDS = [
  { href: "/races", icon: ListFilter, title: "조건으로 찾기", desc: "지역, 일정, 종목 등 원하는 조건을 골라 딱 맞는 대회를 찾아보세요." },
  { href: "/buddy", icon: Users, title: "같이 뛸 사람 찾기", desc: "종목, 버디 방식, 출발 지역으로 모집글을 골라 함께 뛸 러너를 만나보세요." },
  { href: "/calendar", icon: CalendarDays, title: "달력으로 확인하기", desc: "월별 대회 일정을 달력에서 확인하고 나만의 러닝 계획을 세워보세요." },
  { href: "/map", icon: MapPinned, title: "지도로 둘러보기", desc: "내 주변과 가고 싶은 지역의 대회를 지도에서 찾아보세요." },
];

export function Finder() {
  return (
    <section className="mt-16">
      <SectionHead
        eyebrow="Race finder"
        title={<>원하는 대회를 가장<br className="hidden sm:block" /> 편한 방법으로 찾아보세요</>}
        sub="조건으로 좁히고, 버디를 구하고, 달력과 지도에서 일정을 확인하세요."
      />
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map(({ href, icon: Icon, title, desc }) => (
          <li key={title}>
            <Link
              href={href}
              className="group flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Icon size={22} />
              </span>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-zinc-600">{desc}</p>
              <span className="mt-4 text-sm font-semibold text-orange-700 group-hover:underline">자세히 살펴보기 →</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MapPreview() {
  const router = useRouter();
  const { data } = useApp();
  const t = today();

  const markers: MapMarker[] = useMemo(
    () =>
      data.races
        .filter((r) => {
          const s = raceStatus(r, t);
          return s !== "종료" && s !== "취소";
        })
        .map((r) => ({ id: r.id, lat: r.lat, lng: r.lng, title: r.name, color: STATUS_COLOR[raceStatus(r, t)] })),
    [data.races, t],
  );

  return (
    <section className="mt-16 grid items-center gap-8 md:grid-cols-[1.1fr_1fr]">
      <div>
        <SectionHead
          eyebrow="TogeRun Map"
          title={<>내 주변의 러닝 대회,<br className="hidden sm:block" /> 지도에서 더 빠르게</>}
          sub="현재 위치를 기준으로 가까운 대회를 찾고, 개최 장소와 접수 정보를 한 번에 확인해 보세요."
        />
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/map" className="rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700">
            대회 지도 열기
          </Link>
          <Link href="/calendar" className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold hover:border-orange-400">
            달력으로 일정 보기
          </Link>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <span className="absolute left-3 top-3 z-[500] rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-orange-700 shadow">
          가까운 대회가 한눈에
        </span>
        <RaceMap
          markers={markers}
          onSelect={(id) => router.push(`/races/${id}`)}
          center={[36.4, 127.8]}
          zoom={6}
          fitKey={String(markers.length)}
          className="h-72 w-full"
        />
      </div>
    </section>
  );
}
