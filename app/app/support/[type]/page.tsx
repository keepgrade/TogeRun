"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { btnGhost, btnPrimary, card, Empty, Field, inputCls } from "@/components/ui";
import { SUPPORT } from "@/lib/info";
import { useApp } from "@/lib/store";

export default function SupportPage() {
  const { type } = useParams<{ type: string }>();
  const { a } = useApp();
  const conf = SUPPORT[type];
  const [detail, setDetail] = useState("");
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!conf) return <Empty action={<Link href="/" className={btnGhost}>홈으로</Link>}>찾을 수 없는 페이지예요.</Empty>;
  if (done) return <Empty action={<Link href="/" className={btnGhost}>홈으로</Link>}>접수됐어요. 확인 후 반영할게요. (PoC: 이 브라우저에만 저장돼요)</Empty>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail.trim()) return setError("내용을 입력해 주세요");
    if (email && !consent) return setError("이메일을 남기려면 개인정보 수집에 동의해 주세요");
    a.addRaceError({ kind: conf.kind, detail: detail.trim(), evidenceUrl: url.trim() || undefined, email: email.trim() || undefined });
    setDone(true);
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-xl font-bold">{conf.title}</h1>
      <p className="mt-1 text-sm text-zinc-600">{conf.desc}</p>
      <form onSubmit={submit} className={`${card} mt-4 space-y-4 p-5`} noValidate>
        <Field label="내용" required>
          <textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={5} className={inputCls} />
        </Field>
        <Field label="관련 링크" hint="공식 출처나 해당 화면 주소가 있으면 남겨 주세요">
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
        <button type="submit" className={btnPrimary}>접수하기</button>
      </form>
    </div>
  );
}
