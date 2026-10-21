"use client";

import { useState } from "react";
import { Ban, Flag } from "lucide-react";
import { btnGhost, btnPrimary, Field, inputCls, Modal } from "./ui";
import { useApp, useGuard } from "@/lib/store";
import { REPORT_REASONS, type TargetType } from "@/lib/types";

interface Props {
  targetType: TargetType;
  targetId: string;
  authorId: string;
  /** 차단하면 호출된다. 보통 목록 화면으로 돌려보낸다. */
  onBlocked?: () => void;
  showBlock?: boolean;
  compact?: boolean;
}

/**
 * 신고·차단. 내가 쓴 글에는 보이지 않는다.
 * 신고는 운영자 확인 대상으로 접수되고, 신고하면서 작성자를 함께 차단할 수 있다.
 */
export default function SafetyActions({ targetType, targetId, authorId, onBlocked, showBlock = true, compact }: Props) {
  const { data, me, myBlocked, userName, a } = useApp();
  const guard = useGuard();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [detail, setDetail] = useState("");
  const [alsoBlock, setAlsoBlock] = useState(false);
  const [notice, setNotice] = useState("");

  if (me?.id === authorId) return null;

  const reported = !!me && data.reports.some((r) => r.reporterId === me.id && r.targetType === targetType && r.targetId === targetId);
  const blocked = myBlocked.includes(authorId);
  const size = compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    a.report({ targetType, targetId, reason, detail: detail.trim() });
    if (alsoBlock) a.block(authorId);
    setOpen(false);
    setDetail("");
    setAlsoBlock(false);
    setNotice(alsoBlock ? "신고가 접수됐고 작성자를 차단했어요" : "신고가 접수됐어요. 운영자가 확인해요");
    if (alsoBlock) onBlocked?.();
  };

  const block = () =>
    guard(() => {
      if (window.confirm(`${userName(authorId)} 님을 차단할까요?\n이 사용자의 글과 댓글이 보이지 않아요. 내 정보에서 해제할 수 있어요.`)) {
        a.block(authorId);
        setNotice("차단했어요");
        onBlocked?.();
      }
    });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => guard(() => setOpen(true))}
          disabled={reported}
          className={`${btnGhost} ${size} text-zinc-600`}
        >
          <Flag size={compact ? 12 : 14} /> {reported ? "신고함" : `${targetType} 신고`}
        </button>
        {showBlock && (
          <button onClick={block} disabled={blocked} className={`${btnGhost} ${size} text-zinc-600`}>
            <Ban size={compact ? 12 : 14} /> {blocked ? "차단됨" : "작성자 차단"}
          </button>
        )}
      </div>
      {notice && (
        <p role="status" className="mt-1.5 text-xs text-emerald-700">
          {notice}
        </p>
      )}

      {open && (
        <Modal title={`${targetType} 신고`} onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="space-y-4">
            <p className="text-sm text-zinc-600">
              <b>{userName(authorId)}</b> 님의 {targetType}를 신고해요. 운영자가 확인한 뒤 조치해요.
            </p>
            <Field label="신고 사유" required>
              <select value={reason} onChange={(e) => setReason(e.target.value)} className={inputCls}>
                {REPORT_REASONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="자세한 내용" hint={`${detail.length}/200 · 연락처 같은 개인정보는 적지 마세요`}>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value.slice(0, 200))}
                rows={3}
                className={inputCls}
              />
            </Field>
            {showBlock && (
              <label className="flex items-start gap-2 text-sm text-zinc-700">
                <input type="checkbox" checked={alsoBlock} onChange={(e) => setAlsoBlock(e.target.checked)} className="mt-0.5" />
                <span>이 작성자도 함께 차단하기 <span className="text-xs text-zinc-500">(글과 댓글이 보이지 않아요)</span></span>
              </label>
            )}
            <div className="flex gap-2">
              <button type="submit" className={btnPrimary}>신고하기</button>
              <button type="button" onClick={() => setOpen(false)} className={btnGhost}>취소</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
