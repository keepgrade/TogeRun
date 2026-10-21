"use client";

import type { Kind } from "@/lib/kind";
import { TYPE_LABEL, type RaceScope, type RaceType } from "@/lib/types";

function Segment<T extends string>({
  label, value, options, onChange, render,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
  render: (v: T) => string;
}) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex rounded-xl bg-zinc-100 p-1">
      {options.map((o) => (
        <button
          key={o}
          role="tab"
          aria-selected={value === o}
          onClick={() => onChange(o)}
          className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
            value === o ? "bg-white text-orange-700 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
          }`}
        >
          {render(o)}
        </button>
      ))}
    </div>
  );
}

/** 종류(마라톤/트레일러닝)와 범위(국내/해외)를 따로 고르는 탭 */
export default function KindTabs({ kind, onChange }: { kind: Kind; onChange: (k: Kind) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Segment<RaceType>
        label="대회 종류"
        value={kind.type}
        options={["마라톤", "트레일"]}
        onChange={(type) => onChange({ ...kind, type })}
        render={(v) => TYPE_LABEL[v]}
      />
      <Segment<RaceScope>
        label="국내 해외"
        value={kind.scope}
        options={["국내", "해외"]}
        onChange={(scope) => onChange({ ...kind, scope })}
        render={(v) => v}
      />
    </div>
  );
}
