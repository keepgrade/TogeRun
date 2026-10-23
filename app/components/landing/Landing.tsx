"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import RunnerTrack from "@/components/home/RunnerTrack";
import { AlertBand } from "@/components/Newsletter";
import SiteFooter from "@/components/SiteFooter";

const CONCEPTS = [
  { no: "01", title: "대회를 한곳에서", body: "국내·해외, 마라톤·트레일러닝 대회의 일정과 접수 소식을 한눈에 봐요." },
  { no: "02", title: "같이 뛸 사람 찾기", body: "신청이 망설여지는 대회에서 페이스가 맞는 버디를 만나요." },
  { no: "03", title: "먼저 뛴 사람의 후기", body: "끝난 대회의 솔직한 후기와 대회별 이야기로 다음 대회를 골라요." },
];

const ctaCls = "inline-flex items-center rounded-full bg-orange-600 px-6 py-3 text-sm font-bold text-white hover:bg-orange-700";

/**
 * 서비스 소개 랜딩페이지(/about). 앱 내용을 보여 주지 않고 서비스의 컨셉만 전한다.
 * 앱은 PC에서도 /home에서 그대로 쓸 수 있다.
 */
export default function Landing() {
  return (
    <div className="min-h-dvh bg-white text-zinc-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/home" className="text-xl font-extrabold tracking-tight">
          Toge<span className="text-orange-600">Run</span>
        </Link>
        <Link href="/home" className="rounded-full border border-orange-600 px-4 py-1.5 text-sm font-bold text-orange-700 hover:bg-orange-50">
          웹앱 열기
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-6 min-[1024px]:grid-cols-2 min-[1024px]:pt-10">
        <div>
          <p className="text-sm font-bold text-orange-700">마라톤 버디 서비스</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.15] tracking-tight min-[640px]:text-5xl">
            혼자 신청하기 망설여지는
            <br />
            대회, 같이 뛸 사람을
            <br />
            찾아보세요.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-zinc-600">
            대회 일정과 접수 정보를 보고, 마음에 드는 대회에서 바로 버디를 구하세요. 접수 오픈과 마감도 놓치지 않게 알려 드려요.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/home" className={ctaCls}>지금 시작하기</Link>
            <Link href="/info/guide" className="text-sm font-semibold text-zinc-700 underline underline-offset-4 hover:text-orange-700">마라톤 버디 가이드 보기</Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {["App Store", "Google Play"].map((s) => (
              <span key={s} className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-500">
                {s}
                <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[11px] font-bold text-zinc-600">출시 예정</span>
              </span>
            ))}
          </div>
        </div>

        {/* 앱 화면 대신 컨셉을 전하는 그림: 트랙 위를 같이 달리는 러너들 */}
        <div className="relative h-80 overflow-hidden rounded-3xl bg-orange-50">
          <p className="absolute left-8 top-8 text-3xl font-extrabold leading-snug tracking-tight text-orange-900 min-[640px]:text-4xl">
            혼자보다
            <br />
            같이 뛰면
            <br />
            더 멀리.
          </p>
          <RunnerTrack track />
        </div>
      </section>

      <section id="concept" className="border-t border-zinc-200 bg-stone-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 min-[768px]:grid-cols-3">
          {CONCEPTS.map((f) => (
            <div key={f.no}>
              <p className="text-sm font-bold text-orange-700">{f.no}</p>
              <h2 className="mt-2 text-xl font-bold">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <ul className="grid gap-3 text-sm text-zinc-700 min-[768px]:grid-cols-3">
          {["실명과 전화번호 없이 오픈채팅으로만 연락", "접수·결제는 공식 사이트에서, TogeRun은 중개하지 않아요", "신고·차단으로 불편한 글을 바로 숨겨요"].map((t) => (
            <li key={t} className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-3">
              <Check size={16} className="shrink-0 text-orange-600" /> {t}
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-zinc-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-6 py-14 min-[768px]:flex-row min-[768px]:items-center min-[768px]:justify-between">
          <div>
            <p className="text-2xl font-extrabold tracking-tight">다음 대회, 같이 뛸 사람과 함께 시작해 보세요.</p>
            <p className="mt-1 text-sm text-zinc-300">가입 없이 둘러볼 수 있어요.</p>
          </div>
          <Link href="/home" className={ctaCls}>지금 시작하기</Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <AlertBand />
      </div>

      <SiteFooter />
    </div>
  );
}
