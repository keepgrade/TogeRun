"use client";

import { Star, X } from "lucide-react";
import type { ReactNode } from "react";
import type { RaceStatus } from "@/lib/types";

type Tone = "gray" | "green" | "blue" | "orange" | "red" | "ink";

const TONES: Record<Tone, string> = {
  gray: "bg-zinc-100 text-zinc-600",
  green: "bg-emerald-50 text-emerald-700",
  blue: "bg-sky-50 text-sky-700",
  orange: "bg-orange-50 text-orange-700",
  red: "bg-red-50 text-red-700",
  ink: "bg-zinc-900 text-white",
};

export function Badge({ children, tone = "gray" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}>{children}</span>
  );
}

const STATUS_TONE: Record<RaceStatus, Tone> = {
  "접수 예정": "blue",
  접수중: "green",
  "접수 마감": "gray",
  종료: "gray",
  취소: "red",
};

export const StatusBadge = ({ status }: { status: RaceStatus }) => <Badge tone={STATUS_TONE[status]}>{status}</Badge>;

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500" aria-label={`별점 ${value.toFixed(1)}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} fill={n <= Math.round(value) ? "currentColor" : "none"} />
      ))}
    </span>
  );
}

export function Empty({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-10 text-center text-sm text-zinc-500">
      <p>{children}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-label={title}
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="닫기" className="rounded p-1 text-zinc-500 hover:bg-zinc-100">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, required, hint, error, children }: { label: string; required?: boolean; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-800">
        {label} {required ? <span className="text-orange-600">*</span> : <span className="text-xs font-normal text-zinc-400">(선택)</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-zinc-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-zinc-100";

export const btnPrimary =
  "inline-flex items-center justify-center gap-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-zinc-300";

export const btnGhost =
  "inline-flex items-center justify-center gap-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50";

export const card = "rounded-xl border border-zinc-200 bg-white";
