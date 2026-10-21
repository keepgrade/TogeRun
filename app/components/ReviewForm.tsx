"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { btnGhost, btnPrimary, card, Field, inputCls, StarInput } from "./ui";
import { uniqueDistances } from "@/lib/format";
import { uid, useApp } from "@/lib/store";
import type { Distance, Race, Review } from "@/lib/types";

const PHONE = /01[016789][-\s]?\d{3,4}[-\s]?\d{4}/;
const MIN_BODY = 10;
const MAX_BODY = 1000;

const PARTS = [
  { key: "course", label: "코스" },
  { key: "operation", label: "운영" },
  { key: "access", label: "접근성(교통·주차)" },
  { key: "goods", label: "기념품" },
] as const;

/** 리뷰 작성·수정. 한 대회에 한 사람이 하나만 쓰고, 이후에는 수정한다. */
export default function ReviewForm({ race, review }: { race: Race; review?: Review }) {
  const router = useRouter();
  const { me, a } = useApp();

  const [distance, setDistance] = useState<Distance>(review?.distance ?? uniqueDistances(race.courses)[0]);
  const [joined, setJoined] = useState(!!review);
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [parts, setParts] = useState<Review["parts"]>(review?.parts ?? {});
  const [body, setBody] = useState(review?.body ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!joined) e.joined = "참가한 대회에만 리뷰를 쓸 수 있어요. '참가했어요'를 확인해 주세요";
    if (!rating) e.rating = "종합 별점을 선택해 주세요";
    const text = body.trim();
    if (!text) e.body = "후기를 입력해 주세요";
    else if (text.length < MIN_BODY) e.body = `후기는 ${MIN_BODY}자 이상 적어 주세요`;
    else if (text.length > MAX_BODY) e.body = `후기는 ${MAX_BODY}자 이내로 적어 주세요`;
    else if (PHONE.test(text)) e.body = "연락처 같은 개인정보는 적지 마세요";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!me || !validate()) return;
    const cleaned: Review["parts"] = {};
    PARTS.forEach(({ key }) => {
      if (parts[key]) cleaned[key] = parts[key];
    });
    a.saveReview({
      id: review?.id ?? uid(),
      raceId: race.id,
      authorId: review?.authorId ?? me.id,
      distance,
      rating,
      parts: cleaned,
      body: body.trim(),
      createdAt: review?.createdAt ?? new Date().toISOString(),
    });
    sessionStorage.setItem("togerun-tab", "review");
    router.push(`/races/${race.id}`);
  };

  return (
    <form onSubmit={submit} className={`${card} space-y-5 p-5`} noValidate>
      <div>
        <p className="text-xs text-zinc-500">대회</p>
        <p className="font-semibold">{race.name}</p>
        <p className="text-xs text-zinc-500">대회에 자동으로 연결돼요</p>
      </div>

      <div className="rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
        대회 정보가 틀렸다면 리뷰 대신 <b>정보 오류 제보</b>로 알려 주세요. 연락처 같은 개인정보는 적지 마세요.
      </div>

      <Field label="참가 종목" required>
        <select value={distance} onChange={(e) => setDistance(e.target.value as Distance)} className={inputCls}>
          {uniqueDistances(race.courses).map((d) => <option key={d}>{d}</option>)}
        </select>
      </Field>

      <div>
        <label className="inline-flex items-start gap-2 text-sm">
          <input type="checkbox" checked={joined} onChange={(e) => setJoined(e.target.checked)} className="mt-0.5" />
          <span>
            이 대회에 참가했어요 <span className="text-orange-600">*</span>
            <span className="block text-xs text-zinc-500">참가 증빙은 받지 않고, 직접 확인한 내용만 적어 주세요.</span>
          </span>
        </label>
        {errors.joined && <p className="mt-1 text-xs text-red-600">{errors.joined}</p>}
      </div>

      <Field label="종합 별점" required error={errors.rating}>
        <StarInput value={rating} onChange={setRating} label="종합 별점" />
      </Field>

      <div>
        <p className="mb-2 text-sm font-medium text-zinc-800">
          항목별 별점 <span className="text-xs font-normal text-zinc-400">(선택)</span>
        </p>
        <ul className="space-y-1.5">
          {PARTS.map(({ key, label }) => (
            <li key={key} className="flex items-center justify-between gap-3">
              <span className="text-sm text-zinc-600">{label}</span>
              <StarInput
                value={parts[key] ?? 0}
                onChange={(v) => setParts((prev) => ({ ...prev, [key]: v || undefined }))}
                label={`${label} 별점`}
                clearable
                size={20}
              />
            </li>
          ))}
        </ul>
      </div>

      <Field label="후기" required error={errors.body} hint={`${body.length}/${MAX_BODY} · 최소 ${MIN_BODY}자`}>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} className={inputCls} />
      </Field>

      <div className="flex gap-2">
        <button type="submit" className={btnPrimary}>{review ? "수정 완료" : "리뷰 등록"}</button>
        <button type="button" onClick={() => router.back()} className={btnGhost}>취소</button>
      </div>
    </form>
  );
}
