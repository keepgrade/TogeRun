"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { btnGhost, btnPrimary, card, Empty, Field, inputCls } from "@/components/ui";
import { useApp } from "@/lib/store";

export default function RaceReportPage() {
  const { id } = useParams<{ id: string }>();
  const { data, a } = useApp();
  const race = data.races.find((r) => r.id === id);

  const [kind, setKind] = useState<"정보 오류" | "등록 문의">("정보 오류");
  const [detail, setDetail] = useState("");
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!race) return <Empty>찾을 수 없는 대회예요.</Empty>;

  if (done) {
    return (
      <Empty action={<Link href={`/races/${race.id}`} className={btnGhost}>대회로 돌아가기</Link>}>
        제보가 접수됐어요. 공식 자료를 확인한 뒤 반영할게요. (PoC: 이 브라우저에만 저장돼요)
      </Empty>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail.trim()) return setError("내용을 입력해 주세요");
    if (email && !consent) return setError("이메일을 남기려면 개인정보 수집에 동의해 주세요");
    a.addRaceError({ kind, raceId: race.id, detail: detail.trim(), evidenceUrl: url.trim() || undefined, email: email.trim() || undefined });
    setDone(true);
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-xl font-bold">정보 오류 제보 · 등록 문의</h1>
      <p className="mt-1 text-sm text-zinc-500">{race.name} · 공식 자료를 확인한 뒤 반영하며, 주최 측 공지를 우선해요.</p>
      <form onSubmit={submit} className={`${card} mt-4 space-y-4 p-5`} noValidate>
        <Field label="유형" required>
          <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} className={inputCls}>
            <option>정보 오류</option>
            <option>등록 문의</option>
          </select>
        </Field>
        <Field label="내용" required>
          <textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={5} className={inputCls} />
        </Field>
        <Field label="공식 출처 링크" hint="변경을 확인할 수 있는 공식 주소를 남겨 주세요">
          <input value={url} onChange={(e) => setUrl(e.target.value)} className={inputCls} placeholder="https://" />
        </Field>
        <Field label="답변 받을 이메일">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </Field>
        {email && (
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            (필수) 답변을 위한 이메일 수집에 동의합니다
          </label>
        )}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button type="submit" className={btnPrimary}>제보하기</button>
      </form>
    </div>
  );
}
