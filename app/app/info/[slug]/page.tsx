"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { btnGhost, Empty } from "@/components/ui";
import { INFO } from "@/lib/info";

export default function InfoPage() {
  const { slug } = useParams<{ slug: string }>();
  const page = INFO[slug];
  if (!page) return <Empty action={<Link href="/" className={btnGhost}>홈으로</Link>}>찾을 수 없는 페이지예요.</Empty>;

  return (
    <article className="mx-auto max-w-2xl py-2">
      <h1 className="text-2xl font-extrabold tracking-tight">{page.title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">{page.intro}</p>
      <div className="mt-6 space-y-6">
        {page.sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-base font-bold">{s.h}</h2>
            {s.p?.map((t) => (
              <p key={t} className="mt-1.5 text-sm leading-relaxed text-zinc-700">{t}</p>
            ))}
            {s.list && (
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-relaxed text-zinc-700">
                {s.list.map((t) => <li key={t}>{t}</li>)}
              </ul>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
