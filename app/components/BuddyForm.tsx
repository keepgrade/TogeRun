"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { btnGhost, btnPrimary, card, Field, inputCls } from "./ui";
import { addDays, fmtDate, today } from "@/lib/date";
import { isChatUrl, uniqueDistances } from "@/lib/format";
import { uid, useApp } from "@/lib/store";
import { REGIONS, STYLES, type BuddyPost, type Distance, type Race, type Style } from "@/lib/types";

const PHONE = /01[016789][-\s]?\d{3,4}[-\s]?\d{4}/;

/** 모집 마감일 기본값: 접수 마감일. 이미 지났으면 대회 전날(오늘보다 앞서지 않게). */
function defaultUntil(race: Race, t: string) {
  const base = race.regClose >= t ? race.regClose : addDays(race.date, -1);
  const clipped = base > race.date ? race.date : base;
  return clipped < t ? t : clipped;
}

export default function BuddyForm({ race, post }: { race: Race; post?: BuddyPost }) {
  const router = useRouter();
  const { me, a } = useApp();
  const t = today();

  const [distance, setDistance] = useState<Distance>(post?.distance ?? uniqueDistances(race.courses)[0]);
  const [style, setStyle] = useState<Style>(post?.style ?? "현장 합류");
  const [capacity, setCapacity] = useState(String(post?.capacity ?? 1));
  const [until, setUntil] = useState(post?.recruitUntil ?? defaultUntil(race, t));
  const [region, setRegion] = useState(post?.departRegion ?? "");
  const [chatUrl, setChatUrl] = useState(post?.chatUrl ?? "");
  const [pace, setPace] = useState(post?.targetPace ?? "");
  const [intro, setIntro] = useState(post?.intro ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    const cap = Number(capacity);
    if (!Number.isInteger(cap) || cap < 1 || cap > 30) e.capacity = "1~30명 사이의 숫자로 입력해 주세요";
    if (!until) e.until = "모집 마감일을 선택해 주세요";
    else if (until > race.date) e.until = `대회일(${fmtDate(race.date)}) 이전 날짜를 골라 주세요`;
    else if (until < t && until !== post?.recruitUntil) e.until = "오늘 이후 날짜를 골라 주세요";
    if (!region) e.region = "출발 지역을 선택해 주세요";
    if (!chatUrl.trim()) e.chatUrl = "오픈채팅 링크를 입력해 주세요";
    else if (!isChatUrl(chatUrl)) e.chatUrl = "https://open.kakao.com/o/… 형식의 링크만 쓸 수 있어요";
    if (intro.length > 60) e.intro = "60자 이내로 적어 주세요";
    else if (PHONE.test(intro) || PHONE.test(pace)) e.intro = "연락처는 적지 마세요. 연락은 오픈채팅으로만 해요";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!me || !validate()) return;
    const saved: BuddyPost = {
      id: post?.id ?? uid(),
      raceId: race.id,
      authorId: post?.authorId ?? me.id,
      distance,
      style,
      capacity: Number(capacity),
      recruitUntil: until,
      departRegion: region,
      chatUrl: chatUrl.trim(),
      targetPace: pace.trim() || undefined,
      intro: intro.trim() || undefined,
      closed: post?.closed ?? false,
      createdAt: post?.createdAt ?? new Date().toISOString(),
    };
    a.saveBuddy(saved);
    router.push(`/buddy/${saved.id}`);
  };

  return (
    <form onSubmit={submit} className={`${card} space-y-4 p-5`} noValidate>
      <div>
        <p className="text-xs text-zinc-500">대회</p>
        <p className="font-semibold">{race.name}</p>
        <p className="text-xs text-zinc-500">{fmtDate(race.date)} · 대회에 자동으로 연결돼요</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="종목" required>
          <select value={distance} onChange={(e) => setDistance(e.target.value as Distance)} className={inputCls}>
            {uniqueDistances(race.courses).map((d) => <option key={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="모집 인원" required error={errors.capacity}>
          <input type="number" min={1} max={30} value={capacity} onChange={(e) => setCapacity(e.target.value)} className={inputCls} />
        </Field>
      </div>

      <Field label="동행 방식" required hint="기본값은 현장 합류예요">
        <select value={style} onChange={(e) => setStyle(e.target.value as Style)} className={inputCls}>
          {STYLES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="모집 마감일" required error={errors.until} hint="기본값은 접수 마감일, 대회일 이후는 고를 수 없어요">
          <input type="date" value={until} max={race.date} onChange={(e) => setUntil(e.target.value)} className={inputCls} />
        </Field>
        <Field label="출발 지역" required error={errors.region}>
          <select value={region} onChange={(e) => setRegion(e.target.value)} className={inputCls}>
            <option value="">선택</option>
            {REGIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>
      </div>

      <Field label="연락 방법 (오픈채팅 링크)" required error={errors.chatUrl} hint="예: https://open.kakao.com/o/abc123 · 다른 연락처는 받지 않아요">
        <input value={chatUrl} onChange={(e) => setChatUrl(e.target.value)} placeholder="https://open.kakao.com/o/…" className={inputCls} />
      </Field>

      <Field label="목표 기록·페이스">
        <input value={pace} onChange={(e) => setPace(e.target.value)} placeholder={`예: 6'00"/km`} className={inputCls} />
      </Field>

      <Field label="한 줄 소개" error={errors.intro} hint={`${intro.length}/60 · 연락처 같은 개인정보는 적지 마세요`}>
        <input value={intro} onChange={(e) => setIntro(e.target.value)} className={inputCls} />
      </Field>

      {Object.keys(errors).length > 0 && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          입력을 확인해 주세요. 표시된 항목을 고치면 등록할 수 있어요.
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit" className={btnPrimary}>{post ? "수정 완료" : "모집글 등록"}</button>
        <button type="button" onClick={() => router.back()} className={btnGhost}>취소</button>
      </div>
    </form>
  );
}
