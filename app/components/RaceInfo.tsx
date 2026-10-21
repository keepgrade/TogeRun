"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Check, Copy, ExternalLink, MapPin, Navigation, Pencil, Phone, ShieldAlert } from "lucide-react";
import RaceMap from "./RaceMap";
import { Badge, btnGhost, card, StatusBadge } from "./ui";
import { raceStatus } from "@/lib/derive";
import { dday, fmtDate, today } from "@/lib/date";
import { courseName, feeRange, moneyWithKrw, scaleText } from "@/lib/format";
import { kakaoMapUrl, kakaoRouteUrl, naverMapUrl, STATUS_COLOR } from "@/lib/maps";
import { TYPE_LABEL, type Race } from "@/lib/types";

function Section({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <section className={`${card} overflow-hidden`}>
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <h3 className="text-base font-bold">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}

function Rows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="divide-y divide-zinc-100 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex gap-4 px-4 py-2.5">
          <dt className="w-20 shrink-0 text-zinc-500">{k}</dt>
          <dd className="min-w-0 break-words text-zinc-800">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

const withTime = (date: string, time?: string) => `${fmtDate(date)}${time ? ` · ${time}` : ""}`;

export default function RaceInfo({ race }: { race: Race }) {
  const t = today();
  const status = raceStatus(race, t);
  const [copy, setCopy] = useState<"idle" | "done" | "failed">("idle");

  /** Clipboard API가 막힌 환경을 위해 임시 입력창과 execCommand로 한 번 더 시도한다. */
  const writeClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    }
  };

  const copyAddress = async () => {
    setCopy((await writeClipboard(race.address)) ? "done" : "failed");
    setTimeout(() => setCopy("idle"), 2000);
  };

  const infoRows: [string, ReactNode][] = [
    ["대회 유형", `${race.scope} ${TYPE_LABEL[race.type]}`],
    ["대회 기간", fmtDate(race.date)],
    [
      "접수 기간",
      `${withTime(race.regOpen, race.regOpenTime)} ~ ${withTime(race.regClose, race.regCloseTime)}`,
    ],
    ["장소", race.scope === "해외" ? `${race.region} · ${race.city ?? race.venue}` : `${race.region} · ${race.venue}`],
    ["종목", race.courses.map(courseName).join(", ")],
    ["참가비", feeRange(race.courses, race.currency)],
    ["규모", scaleText(race.scale)],
    ["주최", race.organizer],
    ["주관", race.host],
  ];
  if (race.type === "트레일") {
    if (race.elevationGain) infoRows.push(["누적 상승고도", `D+ ${race.elevationGain.toLocaleString("ko-KR")}m`]);
    if (race.timeLimit) infoRows.push(["제한 시간", race.timeLimit]);
    if (race.difficulty) infoRows.push(["난이도", race.difficulty]);
    if (race.gear?.length) infoRows.push(["필수 장비", race.gear.join(", ")]);
  }
  if (race.phone) {
    infoRows.push([
      "연락처",
      <a key="tel" href={`tel:${race.phone.replace(/[^0-9]/g, "")}`} className="inline-flex items-center gap-1 text-sky-700 underline-offset-2 hover:underline">
        <Phone size={13} /> {race.phone}
      </a>,
    ]);
  }
  if (race.snsUrl) {
    infoRows.push([
      "인스타",
      <a key="sns" href={race.snsUrl} target="_blank" rel="noreferrer" className="text-sky-700 underline-offset-2 hover:underline">
        Instagram
      </a>,
    ]);
  }
  if (race.parking) infoRows.push(["주차", race.parking]);
  if (race.souvenir) infoRows.push(["기념품", race.souvenir]);
  if (race.memo) infoRows.push(["메모", race.memo]);

  return (
    <div className="space-y-4">
      <Section title="대회 정보" right={<Badge tone="red">{dday(race.date, t)}</Badge>}>
        <Rows rows={infoRows} />
      </Section>

      <Section title="대회 기간">
        <Rows
          rows={[
            ["대회 시작", withTime(race.date, race.startTime)],
            ["대회 종료", withTime(race.date, race.endTime)],
          ]}
        />
        <div className="border-t border-zinc-100 px-4 py-3 text-sm">
          <p className="mb-2 text-xs font-medium text-zinc-500">상세 일정</p>
          {race.schedule?.length ? (
            <ol className="space-y-1.5">
              {race.schedule.map((s) => (
                <li key={s.time + s.title} className="flex gap-3">
                  <span className="w-12 shrink-0 font-semibold tabular-nums text-zinc-900">{s.time}</span>
                  <span className="text-zinc-700">{s.title}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-zinc-500">등록된 상세 일정이 없어요.</p>
          )}
        </div>
        <div className="border-t border-zinc-100 px-4 py-3">
          <a href={race.officialUrl} target="_blank" rel="noreferrer" className={btnGhost}>
            <ExternalLink size={14} /> 대회 사이트
          </a>
        </div>
      </Section>

      <Section title="접수 정보" right={<StatusBadge status={status} />}>
        <Rows
          rows={[
            ["접수 시작", withTime(race.regOpen, race.regOpenTime)],
            ["접수 마감", withTime(race.regClose, race.regCloseTime)],
            ...(race.extraRegOpen ? ([["추가 접수", fmtDate(race.extraRegOpen) + " 시작"]] as [string, ReactNode][]) : []),
          ]}
        />
        <table className="w-full border-t border-zinc-100 text-sm">
          <thead className="bg-zinc-50 text-left text-xs text-zinc-500">
            <tr>
              <th className="px-4 py-2 font-medium">종목</th>
              <th className="px-4 py-2 text-right font-medium">참가비</th>
            </tr>
          </thead>
          <tbody>
            {race.courses.map((c) => (
              <tr key={courseName(c)} className="border-t border-zinc-100">
                <td className="px-4 py-2">{courseName(c)}</td>
                <td className="px-4 py-2 text-right">{moneyWithKrw(c.fee, race.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="flex items-start gap-1 border-t border-zinc-100 px-4 py-3 text-xs text-zinc-500">
          <ShieldAlert size={13} className="mt-0.5 shrink-0" />
          접수·결제는 TogeRun이 아니라 공식 사이트에서 진행해요. 참가 신청 전에 공식 안내를 꼭 확인하세요.
        </p>
        {race.scope === "해외" && (
          <p className="border-t border-zinc-100 bg-sky-50 px-4 py-3 text-xs leading-relaxed text-sky-900">
            해외 대회예요. 접수 일시는 현지 기준이고, 원화 환산은 PoC의 고정 환율을 쓴 참고용이에요. 입국 서류와 항공·숙소는 직접 확인해야 해요.
          </p>
        )}
        {race.type === "트레일" && (
          <p className="border-t border-zinc-100 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
            트레일 대회는 필수 장비와 제한 시간을 지키지 못하면 실격될 수 있어요. 참가 전에 공식 안내의 장비 목록을 꼭 확인하세요.
          </p>
        )}
      </Section>

      <Section title="대회 위치">
        <div className="px-4 pt-3 text-sm">
          <p className="flex items-center gap-1 font-medium">
            <MapPin size={14} className="text-orange-600" /> {race.venue}
          </p>
          <p className="mt-0.5 text-zinc-600">{race.address}</p>
        </div>
        <div className="mt-3 overflow-hidden border-y border-zinc-100">
          <RaceMap
            markers={[{ id: race.id, lat: race.lat, lng: race.lng, title: race.venue, color: STATUS_COLOR[status] }]}
            center={[race.lat, race.lng]}
            zoom={15}
            className="h-56 w-full"
          />
        </div>
        <div className="flex flex-wrap gap-2 p-4">
          <a href={naverMapUrl(race)} target="_blank" rel="noreferrer" className={btnGhost}>
            <ExternalLink size={14} /> 네이버 지도
          </a>
          <a href={kakaoMapUrl(race)} target="_blank" rel="noreferrer" className={btnGhost}>
            <ExternalLink size={14} /> 카카오맵
          </a>
          <a href={kakaoRouteUrl(race)} target="_blank" rel="noreferrer" className={btnGhost}>
            <Navigation size={14} /> 길찾기
          </a>
          <button onClick={copyAddress} className={btnGhost}>
            {copy === "done" ? <Check size={14} /> : <Copy size={14} />}{" "}
            {copy === "done" ? "복사됨" : copy === "failed" ? "복사하지 못했어요" : "주소 복사"}
          </button>
        </div>
        <p className="px-4 pb-3 text-xs text-zinc-500">PoC의 지도 좌표는 해당 지역 근처의 대략적인 값이에요.</p>
      </Section>

      <div className="flex justify-end">
        <Link href={`/races/${race.id}/report`} className={btnGhost}>
          <Pencil size={14} /> 정보가 틀려요
        </Link>
      </div>
    </div>
  );
}
