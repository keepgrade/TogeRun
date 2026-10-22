"use client";

import Link from "next/link";
import { useState } from "react";
import { BellRing, Check, Mail } from "lucide-react";
import BuddyCard from "@/components/BuddyCard";
import CommunityRows from "@/components/CommunityRows";
import { btnPrimary, Empty, Field, inputCls, Modal } from "@/components/ui";
import RunnerTrack from "./RunnerTrack";
import { BigRaceCard, CompactRaceCard } from "./RaceCards";
import { Band, CountRow, SectionHead } from "./Section";
import { HANDOFF } from "./Hero";
import { buddyClosed, raceStatus } from "@/lib/derive";
import { monthKey, today } from "@/lib/date";
import { writeKind } from "@/lib/kind";
import { useApp } from "@/lib/store";
import type { Race } from "@/lib/types";

/** 홈의 기본 구획은 국내 마라톤만 보여 준다. 트레일러닝과 해외는 아래 별도 구획으로 분리한다 */
const domesticMarathon = (r: Race) => r.scope === "국내" && r.type === "마라톤";

export function UpcomingSection() {
  const { data } = useApp();
  const t = today();
  const list = data.races
    .filter((r) => domesticMarathon(r) && raceStatus(r, t) === "접수 예정")
    .sort((a, b) => a.regOpen.localeCompare(b.regOpen));

  return (
    <Band tone="sky">
      <SectionHead
        eyebrow="Registration soon"
        title={<>곧 접수가 시작되는 대회를<br className="hidden sm:block" /> 미리 준비하세요</>}
        sub="접수 시작일을 확인하고, 관심 대회로 저장해 신청 일정을 놓치지 마세요."
        cta={{ href: "/races", label: "전체 대회 살펴보기" }}
      />
      <CountRow label="접수 오픈 예정" count={list.length} />
      {list.length ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, 6).map((r) => <BigRaceCard key={r.id} race={r} />)}
        </div>
      ) : (
        <div className="mt-5"><Empty>접수 예정인 대회가 없어요.</Empty></div>
      )}
    </Band>
  );
}

export function ThisMonthSection() {
  const { data } = useApp();
  const t = today();
  const month = Number(t.slice(5, 7));
  const list = data.races
    .filter((r) => domesticMarathon(r) && monthKey(r.date) === monthKey(t) && r.date >= t)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Band tone="stone">
      <SectionHead
        eyebrow="This month"
        title={<>{month}월에 열리는<br className="hidden sm:block" /> 러닝 대회를 만나보세요</>}
        sub="이번 달 남은 대회 일정을 개최일 순서로 한눈에 확인해 보세요."
        cta={{ href: "/calendar", label: "전체 달력 보기" }}
      />
      <CountRow label={`${month}월 남은 대회`} count={list.length} />
      {list.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, 12).map((r) => <CompactRaceCard key={r.id} race={r} />)}
        </div>
      ) : (
        <div className="mt-5"><Empty>이번 달에 남은 대회가 없어요.</Empty></div>
      )}
    </Band>
  );
}

export function OpenSection() {
  const { data } = useApp();
  const t = today();
  const list = data.races
    .filter((r) => domesticMarathon(r) && raceStatus(r, t) === "접수중")
    .sort((a, b) => a.regClose.localeCompare(b.regClose));

  return (
    <Band tone="orange">
      <SectionHead
        eyebrow="Registration open"
        title={<>지금 접수 중인<br className="hidden sm:block" /> 대회를 확인하세요</>}
        sub="현재 접수 중인 대회를 마감이 가까운 순서로 확인해 보세요."
        cta={{ href: "/races", label: "접수 중 대회 전체 보기" }}
      />
      <CountRow label="현재 접수 중" count={list.length} />
      {list.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, 12).map((r) => <CompactRaceCard key={r.id} race={r} showDeadline />)}
        </div>
      ) : (
        <div className="mt-5"><Empty>지금 접수 중인 대회가 없어요.</Empty></div>
      )}
    </Band>
  );
}

/** 국내 트레일러닝: 마라톤과 분리해 따로 보여 준다 */
export function TrailSection() {
  const { data } = useApp();
  const t = today();
  const list = data.races
    .filter((r) => r.scope === "국내" && r.type === "트레일" && ["접수중", "접수 예정"].includes(raceStatus(r, t)))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Band tone="green">
      <SectionHead
        eyebrow="Trail running"
        title={<>산과 숲을 달리는<br className="hidden sm:block" /> 트레일러닝 대회</>}
        sub="상승고도, 제한 시간, 필수 장비까지 트레일 대회만의 정보를 따로 모아 봤어요."
        cta={{ href: "/races", label: "트레일러닝 전체 보기", onClick: () => writeKind({ type: "트레일", scope: "국내" }) }}
      />
      <CountRow label="접수 중이거나 접수 예정인 트레일러닝" count={list.length} />
      {list.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, 6).map((r) => <CompactRaceCard key={r.id} race={r} showDeadline />)}
        </div>
      ) : (
        <div className="mt-5"><Empty>지금 확인할 수 있는 트레일러닝 대회가 없어요.</Empty></div>
      )}
    </Band>
  );
}

/** 해외 주요 마라톤: 국내 대회와 분리해 따로 보여 준다 */
export function OverseasSection() {
  const { data } = useApp();
  const t = today();
  const live = data.races.filter((r) => r.scope === "해외" && !["종료", "취소"].includes(raceStatus(r, t)));
  const marathons = live.filter((r) => r.type === "마라톤").sort((a, b) => a.date.localeCompare(b.date));
  const trails = live.filter((r) => r.type === "트레일").sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Band tone="indigo">
      <SectionHead
        eyebrow="Overseas"
        title={<>해외 주요 마라톤을<br className="hidden sm:block" /> 한곳에서 확인하세요</>}
        sub="도쿄, 뉴욕, 런던 같은 해외 대회를 국내 대회와 따로 모았어요. 참가비는 현지 통화와 원화 환산을 함께 보여 줘요."
        cta={{ href: "/races", label: "해외 대회 전체 보기", onClick: () => writeKind({ type: "마라톤", scope: "해외" }) }}
      />
      <CountRow label="해외 마라톤" count={marathons.length} />
      {marathons.length ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {marathons.slice(0, 6).map((r) => <BigRaceCard key={r.id} race={r} />)}
        </div>
      ) : (
        <div className="mt-5"><Empty>확인할 수 있는 해외 마라톤이 없어요.</Empty></div>
      )}
      {trails.length > 0 && (
        <>
          <CountRow label="해외 트레일러닝" count={trails.length} />
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trails.slice(0, 3).map((r) => <CompactRaceCard key={r.id} race={r} />)}
          </div>
        </>
      )}
      <p className="mt-3 text-xs text-zinc-400">해외 대회의 일정·접수·참가비는 PoC 샘플이에요. 실제 정보는 공식 사이트에서 확인하세요.</p>
    </Band>
  );
}

/** TogeRun 고유 구획: 후기가 많은 지난 대회 */
export function ReviewedSection() {
  const { data, myBlocked } = useApp();
  const t = today();
  const items = data.races
    .filter((r) => raceStatus(r, t) === "종료")
    .map((r) => {
      const vs = data.reviews
        .filter((v) => v.raceId === r.id && !myBlocked.includes(v.authorId))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return { r, n: vs.length, avg: vs.length ? vs.reduce((sum, v) => sum + v.rating, 0) / vs.length : 0, latest: vs[0]?.body ?? "" };
    })
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n || b.avg - a.avg)
    .slice(0, 6);
  if (!items.length) return null;

  return (
    <Band tone="stone">
      <SectionHead
        eyebrow="Race reviews"
        title={<>먼저 뛰어본 사람들의<br className="hidden sm:block" /> 솔직한 후기</>}
        sub="끝난 대회의 코스, 운영, 접근성 후기를 보고 다음 대회를 골라 보세요."
        cta={{ href: "/races", label: "지난 대회 전체 보기", onClick: () => { sessionStorage.setItem(HANDOFF.past, "1"); } }}
      />
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ r, n, avg, latest }) => (
          <li key={r.id}>
            <Link
              href={`/races/${r.id}`}
              onClick={() => sessionStorage.setItem("togerun-tab", "review")}
              className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-4 hover:border-orange-300"
            >
              <p className="text-xs text-zinc-500">{r.scope === "해외" ? `${r.region} · ${r.city ?? ""}` : r.region} · {r.date.replaceAll("-", ".")}</p>
              <h3 className="mt-1 font-bold">{r.name}</h3>
              <p className="mt-2 text-sm">
                <span className="font-bold text-orange-700">★ {avg.toFixed(1)}</span>
                <span className="ml-2 text-zinc-500">후기 {n}개</span>
              </p>
              <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-zinc-600">“{latest}”</p>
            </Link>
          </li>
        ))}
      </ul>
    </Band>
  );
}

/** TogeRun 고유 구획: 모집 중인 버디 */
export function BuddySection() {
  const { data, myBlocked } = useApp();
  const t = today();
  const list = data.buddyPosts
    .filter((p) => !myBlocked.includes(p.authorId) && !buddyClosed(p, data.races.find((r) => r.id === p.raceId), t))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <section
      className="relative mt-16 overflow-hidden rounded-2xl bg-orange-100 px-5 pb-40 pt-10 sm:px-10 sm:pt-14"
      style={{
        backgroundImage: "radial-gradient(rgba(234,88,12,0.16) 1.5px, transparent 1.6px), linear-gradient(#ffedd5, #ffedd5)",
        backgroundSize: "28px 28px, auto",
      }}
    >
      <SectionHead
        eyebrow="Running buddies"
        title={<>같이 뛸 사람을<br className="hidden sm:block" /> 지금 찾고 있어요</>}
        sub="종목, 버디 방식, 출발 지역을 보고 나에게 맞는 모집글을 골라 보세요."
        cta={{ href: "/buddy", label: "모집 중인 버디 전체 보기" }}
      />
      <CountRow label="모집 중인 버디" count={list.length} />
      {list.length ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, 6).map((p) => <BuddyCard key={p.id} post={p} showRace />)}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl bg-white p-2"><Empty>지금 모집 중인 버디가 없어요.</Empty></div>
      )}
      <RunnerTrack startScene={2} />
    </section>
  );
}

/** TogeRun 고유 구획: 대회별 커뮤니티 최신 글 */
export function CommunitySection() {
  const { data, myBlocked } = useApp();
  const list = data.cposts
    .filter((p) => !myBlocked.includes(p.authorId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <section className="mt-16">
      <SectionHead
        eyebrow="Community"
        title={<>대회별 커뮤니티의<br className="hidden sm:block" /> 최신 이야기</>}
        sub="코스, 이동, 준비물까지 같은 대회에 나가는 러너들의 질문과 팁을 확인해 보세요."
        cta={{ href: "/community", label: "커뮤니티 전체 보기" }}
      />
      <div className="mt-6">
        {list.length ? <CommunityRows posts={list} showRace /> : <Empty>아직 글이 없어요.</Empty>}
      </div>
    </section>
  );
}

/** 공식 인스타그램 주소(PoC에서는 인스타그램 첫 화면으로 연결한다. 계정이 정해지면 바꾼다) */
const InstagramGlyph = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
);

const INSTAGRAM_URL = "https://www.instagram.com/";
const NEWSLETTER_KEY = "togerun-newsletter";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const readSubscribed = () => {
  try {
    return localStorage.getItem(NEWSLETTER_KEY) ?? "";
  } catch {
    return "";
  }
};

const AGE_OPTIONS = ["10대", "20대", "30대", "40대", "50대", "60대 이상"];
const ROUTE_OPTIONS = ["인스타그램", "지인 추천", "검색", "러닝 커뮤니티", "기타"];

/** 뉴스레터 구독 모달. PoC에서는 서버로 보내지 않고 이 브라우저에만 저장한다 */
function NewsletterModal({ onClose, onDone }: { onClose: () => void; onDone: (email: string) => void }) {
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
    <section className="relative mt-6 overflow-hidden rounded-2xl bg-orange-50 px-6 pb-28 pt-12 text-center sm:px-10">
      <p className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-700">
        <BellRing size={12} /> TogeRun Subscribe
      </p>
      <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">러닝 소식을 놓치지 마세요!</h2>
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

export { HANDOFF };
