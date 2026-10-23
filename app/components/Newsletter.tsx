"use client";

import Link from "next/link";
import { useState } from "react";
import { BellRing, Check, Mail } from "lucide-react";
import { btnPrimary, Field, inputCls, Modal } from "@/components/ui";
import RunnerTrack from "@/components/home/RunnerTrack";
import { INSTAGRAM_URL } from "@/lib/links";
import { useApp } from "@/lib/store";

export const InstagramGlyph = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
);

const NEWSLETTER_KEY = "togerun-newsletter";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const readSubscribed = () => {
  try {
    return localStorage.getItem(NEWSLETTER_KEY) ?? "";
  } catch {
    return "";
  }
};

const AGE_OPTIONS = ["10대", "20대", "30대", "40대", "50대", "60대 이상"];
const ROUTE_OPTIONS = ["인스타그램", "지인 추천", "검색", "러닝 커뮤니티", "기타"];

/** 뉴스레터 구독 모달. PoC에서는 서버로 보내지 않고 이 브라우저에만 저장한다 */
export function NewsletterModal({ onClose, onDone }: { onClose: () => void; onDone: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [route, setRoute] = useState("");
  const [want, setWant] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!EMAIL.test(email.trim())) err.email = "이메일 주소를 올바르게 입력해 주세요";
    if (!age) err.age = "나이대를 선택해 주세요";
    if (!route) err.route = "알게 된 경로를 선택해 주세요";
    if (!agree) err.agree = "수집·수신 동의가 필요해요";
    setErrors(err);
    if (Object.keys(err).length) return;
    try {
      localStorage.setItem(NEWSLETTER_KEY, JSON.stringify({ email: email.trim(), age, route, want: want.trim() }));
    } catch {
      /* 저장하지 못해도 이번 화면에서는 완료로 보여 준다 */
    }
    onDone(email.trim());
  };

  return (
    <Modal title="놓치기 아쉬운 러닝 소식" onClose={onClose}>
      <p className="-mt-2 mb-4 text-sm text-zinc-500">필요한 소식만 골라서 가볍게 보내드릴게요.</p>
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="이메일" required error={errors.email}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="runner@example.com" className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="나이대" required error={errors.age}>
            <select value={age} onChange={(e) => setAge(e.target.value)} className={inputCls}>
              <option value="">선택해 주세요</option>
              {AGE_OPTIONS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </Field>
          <Field label="알게 된 경로" required error={errors.route}>
            <select value={route} onChange={(e) => setRoute(e.target.value)} className={inputCls}>
              <option value="">선택해 주세요</option>
              {ROUTE_OPTIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </Field>
        </div>
        <Field label="가장 받고 싶은 정보 (선택)" hint={`${want.length}/40`}>
          <input value={want} maxLength={40} onChange={(e) => setWant(e.target.value)} placeholder="예: 서울 지역 하프마라톤 접수 소식" className={inputCls} />
        </Field>
        <div>
          <label className="flex items-start gap-2 rounded-xl bg-orange-50 px-3 py-3 text-sm text-zinc-800">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />
            <span><span className="font-semibold text-orange-700">(필수)</span> 개인정보 수집 및 뉴스레터 수신에 동의합니다.</span>
          </label>
          {errors.agree && <p role="alert" className="mt-1 text-xs text-red-600">{errors.agree}</p>}
        </div>
        <button type="submit" className={`${btnPrimary} w-full justify-center`}>뉴스레터 구독하기</button>
      </form>
    </Modal>
  );
}

/** 홈 하단. 뉴스레터와 인스타그램으로 이어지고, 러닝 트랙 위를 러너가 달린다 */
export function AlertBand() {
  const { me } = useApp();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(() => {
    const raw = readSubscribed();
    try {
      return raw ? (JSON.parse(raw) as { email?: string }).email ?? raw : "";
    } catch {
      return raw;
    }
  });

  return (
    <section id="newsletter" className="relative mt-6 scroll-mt-24 overflow-hidden rounded-2xl bg-orange-50 px-6 pb-28 pt-12 text-center min-[640px]:px-10">
      <p className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-700">
        <BellRing size={12} /> TogeRun Subscribe
      </p>
      <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 min-[640px]:text-4xl">러닝 소식을 놓치지 마세요!</h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-zinc-600">
        새로운 대회 일정부터 접수 오픈, 모집 중인 버디 소식까지 필요한 정보만 한눈에 정리해 드려요.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-zinc-700">
        <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">새로운 대회 일정</span>
        <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">접수 오픈 알림</span>
        <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">마감 임박 알림</span>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {done ? (
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-800">
            <Check size={16} /> {done} 구독 신청 완료 <span className="font-normal text-emerald-700">(PoC: 실제 발송 없음)</span>
          </p>
        ) : (
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-700">
            <Mail size={16} /> 뉴스레터 구독하기
          </button>
        )}
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 hover:border-orange-400"
        >
          <InstagramGlyph size={16} /> 인스타그램 팔로우
        </a>
        <Link href={me ? "/alerts" : "/races"} className="inline-flex items-center rounded-full px-4 py-3 text-sm font-semibold text-zinc-600 underline-offset-2 hover:underline">
          {me ? "내 알림 보기" : "관심 대회 저장하고 알림 받기"}
        </Link>
      </div>

      <RunnerTrack track />
      {open && <NewsletterModal onClose={() => setOpen(false)} onDone={(e) => { setDone(e); setOpen(false); }} />}
    </section>
  );
}
