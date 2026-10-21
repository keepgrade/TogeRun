"use client";

import { useState } from "react";
import { btnPrimary, card, Field, inputCls, Toggle } from "./ui";
import { useApp } from "@/lib/store";
import { AGE_BANDS, GENDERS, type Gender, type Profile } from "@/lib/types";

const MIN_PACE = 150; // 2'30"/km
const MAX_PACE = 900; // 15'00"/km

/** 기본 정보와 항목별 공개 범위 */
export default function ProfileForm() {
  const { me, myProfile, a } = useApp();
  const [gender, setGender] = useState<Gender | "">(myProfile.gender ?? "");
  const [age, setAge] = useState(myProfile.age ?? "");
  const [min, setMin] = useState(myProfile.paceSec ? String(Math.floor(myProfile.paceSec / 60)) : "");
  const [sec, setSec] = useState(myProfile.paceSec ? String(myProfile.paceSec % 60) : "");
  const [pub, setPub] = useState(myProfile.pub);
  const [consent, setConsent] = useState(!!myProfile.consent);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const touch = () => setSaved(false);
  const sensitive = !!gender || !!age;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    let paceSec: number | undefined;
    if (min !== "" || sec !== "") {
      const m = Number(min || 0);
      const s = Number(sec || 0);
      paceSec = m * 60 + s;
      if (!Number.isInteger(m) || !Number.isInteger(s) || m < 0 || s < 0 || s > 59) err.pace = "분·초를 숫자로 입력해 주세요 (초는 0~59)";
      else if (paceSec < MIN_PACE || paceSec > MAX_PACE) err.pace = `km당 2'30"에서 15'00" 사이로 입력해 주세요`;
    }
    if (sensitive && !consent) err.consent = "성별·나이를 입력하려면 수집·이용에 동의해 주세요";
    setErrors(err);
    if (Object.keys(err).length) return;

    const next: Profile = {
      gender: gender || undefined,
      age: age || undefined,
      paceSec,
      consent: sensitive ? consent : false,
      pub,
    };
    a.saveProfile(next);
    setSaved(true);
  };

  return (
    <form onSubmit={save} className={`${card} space-y-5 p-5`} noValidate>
      <div>
        <p className="text-xs text-zinc-500">익명 닉네임</p>
        <p className="font-semibold">{me?.nickname}</p>
        <p className="text-xs text-zinc-500">닉네임은 항상 공개돼요. 실명과 연락처는 받지 않아요.</p>
      </div>

      <div className="rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
        <p className="font-semibold">성별·나이는 선택이에요</p>
        <p>
          같이 뛸 사람이 나를 가늠하는 데만 쓰이고, 기본은 비공개예요. 모집 조건이나 필터로는 쓰이지 않아요. 모든 항목은 비워 둬도 모집글과
          리뷰를 쓸 수 있어요.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Field label="성별">
              <select value={gender} onChange={(e) => { setGender(e.target.value as Gender | ""); touch(); }} className={inputCls}>
                <option value="">입력 안 함</option>
                {GENDERS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </Field>
          </div>
          <Toggle checked={pub.gender} onChange={(v) => { setPub({ ...pub, gender: v }); touch(); }} label="성별 공개 범위" />
        </div>

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Field label="나이 (연령대)">
              <select value={age} onChange={(e) => { setAge(e.target.value); touch(); }} className={inputCls}>
                <option value="">입력 안 함</option>
                {AGE_BANDS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </Field>
          </div>
          <Toggle checked={pub.age} onChange={(v) => { setPub({ ...pub, age: v }); touch(); }} label="나이 공개 범위" />
        </div>

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Field label="러닝 페이스 (1km당)" error={errors.pace}>
              <div className="flex items-center gap-2">
                <input
                  type="number" min={0} inputMode="numeric" value={min} placeholder="분" aria-label="페이스 분"
                  onChange={(e) => { setMin(e.target.value); touch(); }} className={inputCls}
                />
                <span className="text-sm text-zinc-500">분</span>
                <input
                  type="number" min={0} max={59} inputMode="numeric" value={sec} placeholder="초" aria-label="페이스 초"
                  onChange={(e) => { setSec(e.target.value); touch(); }} className={inputCls}
                />
                <span className="text-sm text-zinc-500">초</span>
              </div>
            </Field>
          </div>
          <Toggle checked={pub.pace} onChange={(v) => { setPub({ ...pub, pace: v }); touch(); }} label="페이스 공개 범위" />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-4">
          <div>
            <p className="text-sm font-medium">마라톤 경험 기록</p>
            <p className="text-xs text-zinc-500">아래에서 기록을 추가하고, 여기서 공개 여부를 정해요.</p>
          </div>
          <Toggle checked={pub.history} onChange={(v) => { setPub({ ...pub, history: v }); touch(); }} label="마라톤 경험 공개 범위" />
        </div>
      </div>

      {sensitive && (
        <label className="flex items-start gap-2 text-sm text-zinc-700">
          <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); touch(); }} className="mt-0.5" />
          <span>
            (필수) 성별·나이를 프로필 표시 목적으로 수집·이용하는 데 동의합니다.
            <span className="block text-xs text-zinc-500">동의는 프로필에서 항목을 지우면 철회돼요.</span>
          </span>
        </label>
      )}
      {errors.consent && <p role="alert" className="text-sm text-red-600">{errors.consent}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" className={btnPrimary}>프로필 저장</button>
        {saved && <span role="status" className="text-sm text-emerald-700">저장됐어요</span>}
      </div>
    </form>
  );
}
