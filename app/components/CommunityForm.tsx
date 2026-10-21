"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { btnGhost, btnPrimary, card, Field, inputCls } from "./ui";
import { uid, useApp } from "@/lib/store";
import { TAGS, type CPost, type Race, type Tag } from "@/lib/types";

const PHONE = /01[016789][-\s]?\d{3,4}[-\s]?\d{4}/;

export default function CommunityForm({ race, post }: { race: Race; post?: CPost }) {
  const router = useRouter();
  const { me, a } = useApp();
  const [tag, setTag] = useState<Tag>(post?.tag ?? "질문");
  const [title, setTitle] = useState(post?.title ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "제목을 입력해 주세요";
    else if (title.length > 60) e.title = "제목은 60자 이내로 적어 주세요";
    if (!body.trim()) e.body = "내용을 입력해 주세요";
    else if (body.length > 2000) e.body = "내용은 2000자 이내로 적어 주세요";
    if (PHONE.test(title) || PHONE.test(body)) e.body = "연락처 같은 개인정보는 적지 마세요";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!me || !validate()) return;
    const saved: CPost = {
      id: post?.id ?? uid(),
      raceId: race.id,
      authorId: post?.authorId ?? me.id,
      tag,
      title: title.trim(),
      body: body.trim(),
      createdAt: post?.createdAt ?? new Date().toISOString(),
    };
    a.saveCPost(saved);
    router.push(`/community/${saved.id}`);
  };

  return (
    <form onSubmit={submit} className={`${card} space-y-4 p-5`} noValidate>
      <div>
        <p className="text-xs text-zinc-500">대회</p>
        <p className="font-semibold">{race.name}</p>
        <p className="text-xs text-zinc-500">대회에 자동으로 연결돼요</p>
      </div>
      <p className="rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
        같이 갈 사람을 구하는 글은 커뮤니티가 아니라 <b>모집글</b>로 써 주세요. 연락처 같은 개인정보는 적지 마세요.
      </p>
      <Field label="말머리" required>
        <select value={tag} onChange={(e) => setTag(e.target.value as Tag)} className={inputCls}>
          {TAGS.map((t) => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="제목" required error={errors.title} hint={`${title.length}/60`}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
      </Field>
      <Field label="내용" required error={errors.body}>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={7} className={inputCls} />
      </Field>
      <div className="flex gap-2">
        <button type="submit" className={btnPrimary}>{post ? "수정 완료" : "글 등록"}</button>
        <button type="button" onClick={() => router.back()} className={btnGhost}>취소</button>
      </div>
    </form>
  );
}
