const DOW = ["일", "월", "화", "수", "목", "금", "토"];

const pad = (n: number) => String(n).padStart(2, "0");

export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parse = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const today = () => iso(new Date());

export const addDays = (base: string, n: number) => {
  const d = parse(base);
  d.setDate(d.getDate() + n);
  return iso(d);
};

/** a - b 를 일 단위로 계산한다 */
export const diffDays = (a: string, b: string) =>
  Math.round((parse(a).getTime() - parse(b).getTime()) / 86400000);

export const dday = (target: string, base = today()) => {
  const n = diffDays(target, base);
  if (n === 0) return "D-day";
  return n > 0 ? `D-${n}` : `D+${-n}`;
};

export const fmtDate = (s: string) => {
  const d = parse(s);
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}(${DOW[d.getDay()]})`;
};

export const fmtShort = (s: string) => {
  const d = parse(s);
  return `${d.getMonth() + 1}/${d.getDate()}(${DOW[d.getDay()]})`;
};

export const monthKey = (s: string) => s.slice(0, 7);

export const fmtDateTime = (isoString: string) => {
  const d = new Date(isoString);
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
