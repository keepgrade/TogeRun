import { addDays, parse } from "./date";
import type { Race } from "./types";

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** RFC 5545: 한 줄은 75옥텟을 넘지 않게 접는다 */
function fold(line: string) {
  const enc = new TextEncoder();
  const out: string[] = [];
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const b = enc.encode(ch).length;
    if (bytes + b > 74) {
      out.push(cur);
      cur = " " + ch;
      bytes = 1 + b;
    } else {
      cur += ch;
      bytes += b;
    }
  }
  out.push(cur);
  return out.join("\r\n");
}

const compact = (date: string) => date.replace(/-/g, "");
const local = (date: string, time: string) => `${compact(date)}T${time.replace(":", "")}00`;

function plusMinutes(date: string, time: string, minutes: number) {
  const d = parse(date);
  const [h, m] = time.split(":").map(Number);
  d.setHours(h, m + minutes, 0, 0);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;
}

function stamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
}

function event(r: Race, kind: string, date: string, time: string | undefined, endTime?: string): string[] {
  const uidKind = { 대회: "race", "접수 오픈": "open", "접수 마감": "close" }[kind] ?? "event";
  const lines = ["BEGIN:VEVENT", `UID:${r.id}-${uidKind}@togerun.poc`, `DTSTAMP:${stamp()}`];
  if (time) {
    lines.push(`DTSTART:${local(date, time)}`);
    lines.push(`DTEND:${endTime ? local(date, endTime) : plusMinutes(date, time, 30)}`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${compact(date)}`, `DTEND;VALUE=DATE:${compact(addDays(date, 1))}`);
  }
  lines.push(
    `SUMMARY:${esc(`[${kind}] ${r.name}`)}`,
    `LOCATION:${esc(`${r.venue} (${r.address})`)}`,
    `DESCRIPTION:${esc(`접수·결제는 공식 사이트에서 진행해 주세요.\n${r.officialUrl}`)}`,
    `URL:${r.officialUrl}`,
    "END:VEVENT",
  );
  return lines;
}

/** 대회일, 접수 오픈, 접수 마감을 각각 하나의 일정으로 담은 .ics 내용 */
export function buildIcs(races: Race[]) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//TogeRun PoC//KO", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:TogeRun"];
  for (const r of races) {
    lines.push(...event(r, "대회", r.date, r.startTime, r.endTime));
    lines.push(...event(r, "접수 오픈", r.regOpen, r.regOpenTime));
    lines.push(...event(r, "접수 마감", r.regClose, r.regCloseTime));
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function downloadFile(filename: string, content: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const downloadIcs = (races: Race[], filename: string) =>
  downloadFile(filename, buildIcs(races), "text/calendar;charset=utf-8");
