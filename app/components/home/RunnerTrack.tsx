"use client";

import { useEffect, useState } from "react";

interface Scene {
  name: string;
  /** 하늘 쪽을 물들이는 색 */
  tint: string;
  art: React.ReactNode;
}

const W = 1200;
const H = 120;

/** 산: 겹친 능선 */
const Mountain = (
  <>
    <circle cx="980" cy="34" r="16" fill="#fff7d6" opacity="0.9" />
    <path d={`M0 ${H} L0 78 L120 40 L210 74 L330 24 L450 72 L540 52 L660 ${H} Z`} fill="#6b8f71" opacity="0.55" />
    <path d={`M380 ${H} L520 50 L610 80 L760 30 L900 76 L1010 46 L1200 90 L1200 ${H} Z`} fill="#4f7a5a" opacity="0.7" />
    <path d={`M0 ${H} L0 100 L150 82 L300 98 L460 84 L640 100 L800 86 L980 100 L1200 84 L1200 ${H} Z`} fill="#3d6a49" />
  </>
);

/** 바다: 해와 물결 */
const Sea = (
  <>
    <circle cx="240" cy="40" r="20" fill="#ffe9a8" opacity="0.95" />
    <rect x="0" y="62" width={W} height="40" fill="#5cb0d6" opacity="0.55" />
    <path d={`M0 74 Q50 64 100 74 T200 74 T300 74 T400 74 T500 74 T600 74 T700 74 T800 74 T900 74 T1000 74 T1100 74 T1200 74 V${H} H0 Z`} fill="#3f9bc7" opacity="0.7" />
    <path d={`M0 92 Q50 84 100 92 T200 92 T300 92 T400 92 T500 92 T600 92 T700 92 T800 92 T900 92 T1000 92 T1100 92 T1200 92 V${H} H0 Z`} fill="#2f86b3" />
  </>
);

const buildings = [
  [20, 44, 36], [64, 30, 30], [100, 52, 40], [150, 24, 34], [196, 46, 28], [236, 34, 44], [292, 56, 32], [336, 28, 38],
  [384, 48, 34], [430, 22, 30], [470, 40, 42], [520, 58, 30], [560, 32, 36], [606, 46, 40], [660, 26, 32], [704, 54, 36],
  [752, 36, 30], [792, 50, 42], [846, 30, 34], [892, 60, 30], [934, 40, 38], [982, 28, 34], [1028, 52, 40], [1080, 34, 32], [1124, 46, 36],
];

/** 도시: 건물과 창문 */
const City = (
  <>
    {buildings.map(([x, h, w], i) => (
      <g key={x}>
        <rect x={x} y={H - 14 - h} width={w} height={h + 14} fill={i % 2 ? "#7b86a1" : "#5f6b88"} opacity="0.85" />
        {Array.from({ length: Math.floor(h / 12) }).map((_, k) => (
          <rect key={k} x={x + 6} y={H - 12 - h + k * 12 + 4} width={w - 12} height="3" fill="#ffe9a8" opacity={(i + k) % 3 ? 0.35 : 0.9} />
        ))}
      </g>
    ))}
  </>
);

const trees = [30, 90, 150, 230, 300, 380, 440, 520, 600, 680, 760, 830, 910, 990, 1070, 1140];

/** 트레일: 숲길과 나무 */
const Forest = (
  <>
    <path d={`M0 ${H} L0 84 Q200 66 400 82 T800 80 T1200 78 L1200 ${H} Z`} fill="#8b6b4a" opacity="0.5" />
    {trees.map((x, i) => (
      <g key={x}>
        <rect x={x + 7} y={H - 34} width="4" height="22" fill="#6b4a2f" />
        <path d={`M${x} ${H - 30} L${x + 9} ${H - 62 - (i % 3) * 8} L${x + 18} ${H - 30} Z`} fill={i % 2 ? "#2f6b3f" : "#3e7f4c"} />
        <path d={`M${x + 1} ${H - 46} L${x + 9} ${H - 74 - (i % 3) * 8} L${x + 17} ${H - 46} Z`} fill={i % 2 ? "#357548" : "#478a56"} />
      </g>
    ))}
  </>
);

const SCENES: Scene[] = [
  { name: "산길", tint: "rgba(120,170,130,0.30)", art: Mountain },
  { name: "바닷가", tint: "rgba(110,180,220,0.30)", art: Sea },
  { name: "도심", tint: "rgba(120,130,170,0.30)", art: City },
  { name: "트레일", tint: "rgba(110,150,90,0.30)", art: Forest },
];

const LINES = [
  "포기하고 싶다!!", "달려!", "조금만 더!", "같이 뛰실래요?", "버디 구해요~", "페이스 좀 맞춰 주세요",
  "접수 열렸대요!", "물 어디 있죠?", "첫 하프 도전!", "완주가 목표!", "혼자보단 같이!", "오늘 컨디션 최고",
  "숨이 차요…", "결승선까지 파이팅", "내년엔 풀코스!",
];

const RUNNERS = [
  { face: "🏃🏻", delay: -4, dur: 26, stop: "8cqw" },
  { face: "🏃🏽‍♀️", delay: -13, dur: 32, stop: "26cqw" },
  { face: "🏃🏿", delay: -21, dur: 22, stop: "44cqw" },
  { face: "🏃🏼‍♀️", delay: -9, dur: 36, stop: "62cqw" },
  { face: "🏃🏾", delay: -17, dur: 29, stop: "80cqw" },
];

function Runner({ face, delay, dur, stop, seed }: { face: string; delay: number; dur: number; stop: string; seed: number }) {
  const [say, setSay] = useState("");

  useEffect(() => {
    let hide: ReturnType<typeof setTimeout>;
    let next: ReturnType<typeof setTimeout>;
    const speak = () => {
      setSay(LINES[Math.floor(Math.random() * LINES.length)]);
      hide = setTimeout(() => setSay(""), 2600);
      next = setTimeout(speak, 5000 + Math.random() * 6000);
    };
    next = setTimeout(speak, 800 + seed * 1400);
    return () => {
      clearTimeout(hide);
      clearTimeout(next);
    };
  }, [seed]);

  return (
    <div
      className="tg-run absolute bottom-4 left-0"
      style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s`, ["--stop" as string]: stop }}
    >
      {say && (
        <span className="absolute bottom-full left-1/2 mb-0.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-800 shadow">
          {say}
          <span className="absolute left-1/2 top-full -ml-1 h-0 w-0 border-x-4 border-t-4 border-x-transparent border-t-white" />
        </span>
      )}
      <span className="tg-bob inline-block text-3xl leading-none drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]" style={{ animationDelay: `${delay % 1}s` }} aria-hidden>
        <span className="inline-block -scale-x-100">{face}</span>
      </span>
    </div>
  );
}

/** 구획 아래를 달리는 러너들과 바뀌는 풍경. 부모는 relative에 높이 7rem(h-28)이어야 한다. 장식이라 스크린 리더에는 숨긴다 */
export default function RunnerTrack({ startScene = 0, calm = false, track = false }: { startScene?: number; calm?: boolean; track?: boolean }) {
  const [i, setI] = useState(startScene % SCENES.length);

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % SCENES.length), 9000);
    return () => clearInterval(id);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-28 overflow-hidden [container-type:inline-size]">
      {track && (
        <div
          className="absolute inset-x-0 bottom-0 h-14"
          style={{
            background:
              "repeating-linear-gradient(to bottom, #e5693f 0 18px, #ee7a50 18px 36px, #e5693f 36px 54px), #e5693f",
          }}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-white/80" />
          <div className="absolute inset-x-0 top-[18px] border-t-2 border-white/70" />
          <div className="absolute inset-x-0 top-[36px] border-t-2 border-white/70" />
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/80" />
        </div>
      )}
      {!track && SCENES.map((s, k) => (
        <div key={s.name} className="absolute inset-0 transition-opacity duration-[1600ms]" style={{ opacity: k === i ? (calm ? 0.28 : 1) : 0 }}>
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${s.tint}, transparent 85%)` }} />
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
            {s.art}
          </svg>
        </div>
      ))}
      {!track && <div className={`absolute inset-x-0 bottom-2.5 border-t border-dashed ${calm ? "border-white/60" : "border-zinc-500/50"}`} />}
      {RUNNERS.map((r, k) => (
        <Runner key={k} {...r} seed={k} />
      ))}
      {!track && (
        <span className="absolute bottom-4 right-4 rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-600 backdrop-blur">
          지금은 {SCENES[i].name}
        </span>
      )}
    </div>
  );
}
