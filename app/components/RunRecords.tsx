"use client";

import { useState } from "react";
import { BadgeCheck, Paperclip, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge, btnGhost, btnPrimary, card, Empty, Field, inputCls, Modal } from "./ui";
import { recordText } from "@/lib/format";
import { uid, useApp } from "@/lib/store";
import { DISTANCES, type Distance, type RecordProof, type RunRecord } from "@/lib/types";

const THIS_YEAR = new Date().getFullYear();
const CUSTOM = "__custom__";

function RecordForm({ record, onClose }: { record?: RunRecord; onClose: () => void }) {
  const { data, a } = useApp();
  const [pick, setPick] = useState(record ? (record.raceId ?? CUSTOM) : "");
  const [name, setName] = useState(record?.raceName ?? "");
  const [year, setYear] = useState(String(record?.year ?? THIS_YEAR));
  const [distance, setDistance] = useState<Distance | "기타">(record?.distance ?? "10K");
  const [result, setResult] = useState<"완주" | "기권">(record?.result ?? "완주");
  const [h, setH] = useState(record?.recordSec ? String(Math.floor(record.recordSec / 3600)) : "");
  const [m, setM] = useState(record?.recordSec ? String(Math.floor((record.recordSec % 3600) / 60)) : "");
  const [s, setS] = useState(record?.recordSec ? String(record.recordSec % 60) : "");
  const [memo, setMemo] = useState(record?.memo ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [file, setFile] = useState("");
  const [dropProof, setDropProof] = useState(false);

  const choose = (v: string) => {
    setPick(v);
    const race = data.races.find((r) => r.id === v);
    if (race) {
      setName(race.name);
      setYear(race.date.slice(0, 4));
    } else if (v !== CUSTOM) setName("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!name.trim()) err.name = "대회를 고르거나 이름을 입력해 주세요";
    const y = Number(year);
    if (!Number.isInteger(y) || y < 1980 || y > THIS_YEAR + 1) err.year = `1980~${THIS_YEAR + 1} 사이의 연도를 입력해 주세요`;

    let recordSec: number | undefined;
    if (result === "완주" && (h || m || s)) {
      const hh = Number(h || 0), mm = Number(m || 0), ss = Number(s || 0);
      if (![hh, mm, ss].every(Number.isInteger) || hh < 0 || mm < 0 || mm > 59 || ss < 0 || ss > 59) err.record = "시·분·초를 올바른 숫자로 입력해 주세요 (분·초는 0~59)";
      else {
        recordSec = hh * 3600 + mm * 60 + ss;
        if (recordSec <= 0) err.record = "기록이 0이에요. 비워 두거나 시간을 입력해 주세요";
      }
    }
    if (file && recordSec === undefined) err.proof = "기록(시·분·초)을 입력해야 인증 자료를 낼 수 있어요";
    if (memo.length > 60) err.memo = "메모는 60자 이내로 적어 주세요";
    setErrors(err);
    if (Object.keys(err).length) return;

    // 인증된 기록의 핵심 내용을 바꾸면 인증은 풀린다
    const changed =
      !!record && (name.trim() !== record.raceName || y !== record.year || distance !== record.distance || result !== record.result || recordSec !== record.recordSec);
    const proof: RecordProof | undefined = file
      ? { status: "검토 중", fileName: file, submittedAt: new Date().toISOString() }
      : record?.proof && !changed && !dropProof
        ? record.proof
        : undefined;
    a.saveRecord({
      id: record?.id ?? uid(),
      raceName: name.trim(),
      raceId: data.races.some((r) => r.id === pick) ? pick : undefined,
      year: y,
      distance,
      result,
      recordSec,
      memo: memo.trim() || undefined,
      proof,
    });
    onClose();
  };

  return (
    <Modal title={record ? "경험 기록 수정" : "경험 기록 추가"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="대회" required error={errors.name}>
          <select value={pick} onChange={(e) => choose(e.target.value)} className={inputCls}>
            <option value="">대회 선택</option>
            {data.races.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            <option value={CUSTOM}>직접 입력</option>
          </select>
        </Field>
        {(pick === CUSTOM || (pick === "" && name)) && (
          <Field label="대회 이름" required>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="예: 지난 가을 하프" />
          </Field>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="참가 연도" required error={errors.year}>
            <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className={inputCls} />
          </Field>
          <Field label="종목" required>
            <select value={distance} onChange={(e) => setDistance(e.target.value as Distance | "기타")} className={inputCls}>
              {DISTANCES.map((d) => <option key={d}>{d}</option>)}
              <option>기타</option>
            </select>
          </Field>
        </div>
        <Field label="결과" required>
          <div className="flex gap-4 text-sm">
            {(["완주", "기권"] as const).map((r) => (
              <label key={r} className="inline-flex items-center gap-1.5">
                <input type="radio" name="result" checked={result === r} onChange={() => setResult(r)} /> {r}
              </label>
            ))}
          </div>
        </Field>
        {result === "완주" && (
          <Field label="기록 (시:분:초)" error={errors.record}>
            <div className="flex items-center gap-2">
              <input type="number" min={0} value={h} placeholder="시" aria-label="기록 시" onChange={(e) => setH(e.target.value)} className={inputCls} />
              <input type="number" min={0} max={59} value={m} placeholder="분" aria-label="기록 분" onChange={(e) => setM(e.target.value)} className={inputCls} />
              <input type="number" min={0} max={59} value={s} placeholder="초" aria-label="기록 초" onChange={(e) => setS(e.target.value)} className={inputCls} />
            </div>
          </Field>
        )}
        {result === "완주" && (
          <Field
            label="기록 인증 (선택)"
            error={errors.proof}
            hint="기록증이나 결과 화면 사진을 올리면 확인 후 '인증됨'이 붙어요. 이름·배번·연락처는 가리고 올려 주세요. 사진은 확인 뒤 보관하지 않아요."
          >
            {record?.proof && !dropProof && !file ? (
              <p className="flex items-center gap-2 text-sm text-zinc-600">
                <Paperclip size={14} /> {record.proof.fileName} · {record.proof.status}
                <button type="button" onClick={() => setDropProof(true)} className="text-xs text-zinc-500 underline">인증 자료 삭제</button>
              </p>
            ) : (
              <input
                type="file"
                accept="image/*"
                aria-label="기록 인증 사진"
                onChange={(e) => setFile(e.target.files?.[0]?.name ?? "")}
                className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-md file:border file:border-zinc-300 file:bg-white file:px-3 file:py-1.5 file:text-sm"
              />
            )}
            {record?.proof && !dropProof && (
              <p className="mt-1 text-xs text-amber-600">기록 내용(대회·연도·종목·결과·시간)을 바꾸면 인증이 풀려요.</p>
            )}
          </Field>
        )}
        <Field label="메모" error={errors.memo} hint={`${memo.length}/60`}>
          <input value={memo} onChange={(e) => setMemo(e.target.value)} className={inputCls} />
        </Field>
        <div className="flex gap-2">
          <button type="submit" className={btnPrimary}>{record ? "수정 완료" : "기록 추가"}</button>
          <button type="button" onClick={onClose} className={btnGhost}>취소</button>
        </div>
      </form>
    </Modal>
  );
}

/** 마라톤 경험 기록 목록과 추가·수정·삭제 */
export default function RunRecords() {
  const { myHistory, a } = useApp();
  const [editing, setEditing] = useState<RunRecord | "new" | null>(null);

  const sorted = [...myHistory].sort((x, y) => y.year - x.year);
  const finished = myHistory.filter((r) => r.result === "완주").length;
  const verified = myHistory.filter((r) => r.proof?.status === "인증됨").length;

  const remove = (r: RunRecord) => {
    if (window.confirm(`'${r.raceName}' 기록을 삭제할까요?`)) a.deleteRecord(r.id);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-bold">
          마라톤 경험 기록 <span className="text-sm font-normal text-zinc-500">· 기록한 대회 {myHistory.length} · 완주 {finished}회 · 인증 {verified}건</span>
        </h2>
        <button onClick={() => setEditing("new")} className={btnPrimary}>
          <Plus size={14} /> 기록 추가
        </button>
      </div>
      <p className="mb-3 text-xs text-zinc-500">기본은 직접 적는 기록이에요. 기록증이나 결과 화면을 첨부하면 확인 후 ‘인증됨’이 표시돼 버디가 더 믿고 볼 수 있어요.</p>

      {sorted.length ? (
        <ul className="space-y-2">
          {sorted.map((r) => (
            <li key={r.id} className={`${card} flex items-start justify-between gap-3 p-3`}>
              <div className="min-w-0">
                <p className="truncate font-medium">{r.raceName}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
                  <span>{r.year}</span>
                  <Badge tone="orange">{r.distance}</Badge>
                  <Badge tone={r.result === "완주" ? "green" : "gray"}>{r.result}</Badge>
                  {r.recordSec ? <span className="font-medium text-zinc-700">{recordText(r.recordSec)}</span> : null}
                  {r.proof && (
                    <Badge tone={r.proof.status === "인증됨" ? "green" : r.proof.status === "반려" ? "red" : "blue"}>
                      {r.proof.status === "인증됨" && <BadgeCheck size={12} className="mr-0.5" />}
                      {r.proof.status === "인증됨" ? "인증됨" : `인증 ${r.proof.status}`}
                    </Badge>
                  )}
                </p>
                {r.proof?.status === "검토 중" && (
                  <p className="mt-1 text-xs text-zinc-500">
                    운영자가 확인하고 있어요. <span className="text-zinc-400">(PoC 시뮬레이션)</span>{" "}
                    <button onClick={() => a.saveRecord({ ...r, proof: { ...r.proof!, status: "인증됨" } })} className="underline">승인</button>{" · "}
                    <button onClick={() => a.saveRecord({ ...r, proof: { ...r.proof!, status: "반려" } })} className="underline">반려</button>
                  </p>
                )}
                {r.proof?.status === "반려" && (
                  <p className="mt-1 text-xs text-red-600">자료가 기록과 맞지 않아 인증되지 않았어요. 수정에서 다시 올릴 수 있어요.</p>
                )}
                {r.memo && <p className="mt-1 text-sm text-zinc-600">{r.memo}</p>}
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => setEditing(r)} aria-label={`${r.raceName} 수정`} className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100">
                  <Pencil size={15} />
                </button>
                <button onClick={() => remove(r)} aria-label={`${r.raceName} 삭제`} className="rounded p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Empty action={<button onClick={() => setEditing("new")} className={btnGhost}>첫 기록 추가하기</button>}>
          아직 기록이 없어요. 참가했던 대회를 적어 두면 함께 뛸 버디가 나를 가늠하는 데 도움이 돼요.
        </Empty>
      )}

      {editing && <RecordForm record={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
