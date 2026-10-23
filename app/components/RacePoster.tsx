import type { Race } from "@/lib/types";

/** 대회 포스터가 아직 없어서 쓰는 데모 이미지. 대회마다 색과 풍경이 달라 보이게 id로 고른다 */
const PALETTES = [
  { sky: "#fde4cf", ground: "#e5693f", accent: "#b84a25" },
  { sky: "#d8ecf7", ground: "#3f86b3", accent: "#2a5f82" },
  { sky: "#e4f1d9", ground: "#4f8a55", accent: "#336b3b" },
  { sky: "#ece3f5", ground: "#7a6bb0", accent: "#54468a" },
  { sky: "#fbeab8", ground: "#d9972b", accent: "#a56e12" },
];

const hash = (s: string) => [...s].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);

export default function RacePoster({ race, className = "" }: { race: Race; className?: string }) {
  const h = hash(race.id);
  const p = PALETTES[h % PALETTES.length];
  const scene = race.type === "트레일" ? "mountain" : race.scope === "해외" ? "city" : h % 2 ? "sea" : "track";

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`} style={{ background: p.sky }} role="img" aria-label={`${race.name} 포스터 (데모 이미지)`}>
      <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <text x="28" y="200" fontSize="92" fontWeight="800" fill={p.accent} opacity="0.22" fontFamily="sans-serif">{race.date.slice(5).replace("-", ".")}</text>
        <text x="30" y="234" fontSize="22" fontWeight="700" fill={p.accent} opacity="0.5" fontFamily="sans-serif">{race.date.slice(0, 4)} {race.type === "트레일" ? "TRAIL" : "MARATHON"}</text>
        <g transform="translate(0 240)">
        {scene === "mountain" && (
          <>
            <path d="M0 160 L0 100 L80 50 L140 90 L220 30 L300 95 L360 60 L400 85 L400 160Z" fill={p.ground} opacity="0.55" />
            <path d="M0 160 L0 125 L90 95 L180 125 L270 90 L400 130 L400 160Z" fill={p.accent} />
          </>
        )}
        {scene === "city" &&
          [10, 50, 95, 140, 190, 235, 280, 325, 365].map((x, i) => (
            <rect key={x} x={x} y={160 - 50 - (i % 4) * 14} width="30" height={50 + (i % 4) * 14} fill={i % 2 ? p.accent : p.ground} opacity="0.85" />
          ))}
        {scene === "sea" && (
          <>
            <circle cx="320" cy="48" r="20" fill="#fff4cf" />
            <path d="M0 110 Q50 98 100 110 T200 110 T300 110 T400 110 V160 H0Z" fill={p.ground} opacity="0.7" />
            <path d="M0 132 Q50 122 100 132 T200 132 T300 132 T400 132 V160 H0Z" fill={p.accent} />
          </>
        )}
        {scene === "track" && (
          <>
            <rect y="104" width="400" height="56" fill={p.ground} />
            <path d="M0 122 H400 M0 140 H400" stroke="#fff" strokeWidth="2" opacity="0.8" />
          </>
        )}
        </g>
      </svg>
      <span className="absolute left-2 top-2 rounded bg-white/85 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-zinc-700">POSTER · DEMO</span>
    </div>
  );
}
