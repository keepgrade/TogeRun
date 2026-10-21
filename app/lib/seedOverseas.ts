import { addDays, diffDays, today } from "./date";
import type { Course, Currency, Race, RaceType } from "./types";

/**
 * 해외 주요 마라톤·트레일 시드. 대회 이름과 개최 시기(월·일)는 실제 대회를 따랐지만,
 * 접수 기간·참가비·규모는 PoC용 샘플 값이다. 실제 정보는 공식 사이트에서 확인해야 한다.
 */
interface Spec {
  id: string;
  name: string;
  type: RaceType;
  country: string;
  city: string;
  lat: number;
  lng: number;
  month: number;
  day: number;
  startTime: string;
  currency: Currency;
  courses: [string, number | null][];
  /** 접수 시작·마감이 대회일에서 며칠 전인지 */
  reg: [number, number];
  scale: number | null;
  interest: number;
  note?: string;
  trail?: { elevationGain: number; timeLimit: string; difficulty: "하" | "중" | "상"; gear: string[] };
}

const SPECS: Spec[] = [
  { id: "r101", name: "도쿄마라톤", type: "마라톤", country: "일본", city: "도쿄", lat: 35.6812, lng: 139.7671, month: 3, day: 1, startTime: "09:10", currency: "JPY", courses: [["풀", 23000]], reg: [-160, -110], scale: 38000, interest: 520, note: "추첨제로 운영돼요." },
  { id: "r102", name: "오사카마라톤", type: "마라톤", country: "일본", city: "오사카", lat: 34.6937, lng: 135.5023, month: 2, day: 22, startTime: "09:00", currency: "JPY", courses: [["풀", 20000]], reg: [-140, -50], scale: 30000, interest: 330 },
  { id: "r103", name: "교토마라톤", type: "마라톤", country: "일본", city: "교토", lat: 35.0116, lng: 135.7681, month: 2, day: 15, startTime: "09:00", currency: "JPY", courses: [["풀", 18000]], reg: [-130, -40], scale: 16000, interest: 240 },
  { id: "r104", name: "홍콩마라톤", type: "마라톤", country: "홍콩", city: "홍콩", lat: 22.3193, lng: 114.1694, month: 1, day: 18, startTime: "05:30", currency: "HKD", courses: [["10K", 400], ["하프", 600], ["풀", 1100]], reg: [-130, -40], scale: 74000, interest: 310 },
  { id: "r105", name: "싱가포르 마라톤", type: "마라톤", country: "싱가포르", city: "싱가포르", lat: 1.3521, lng: 103.8198, month: 12, day: 6, startTime: "05:00", currency: "SGD", courses: [["10K", 90], ["하프", 120], ["풀", 150]], reg: [-120, -20], scale: 50000, interest: 280 },
  { id: "r106", name: "방콕마라톤", type: "마라톤", country: "태국", city: "방콕", lat: 13.7563, lng: 100.5018, month: 11, day: 21, startTime: "04:30", currency: "THB", courses: [["10K", 1100], ["하프", 1500], ["풀", 2200]], reg: [-100, -10], scale: 20000, interest: 260 },
  { id: "r107", name: "타이베이 마라톤", type: "마라톤", country: "대만", city: "타이베이", lat: 25.033, lng: 121.5654, month: 12, day: 20, startTime: "05:30", currency: "TWD", courses: [["10K", 1000], ["하프", 1300], ["풀", 1700]], reg: [-90, -15], scale: 28000, interest: 230 },
  { id: "r108", name: "호놀룰루 마라톤", type: "마라톤", country: "미국", city: "호놀룰루", lat: 21.3069, lng: -157.8583, month: 12, day: 13, startTime: "05:00", currency: "USD", courses: [["풀", 280]], reg: [-110, -30], scale: 30000, interest: 270 },
  { id: "r109", name: "보스턴 마라톤", type: "마라톤", country: "미국", city: "보스턴", lat: 42.3601, lng: -71.0589, month: 4, day: 19, startTime: "09:00", currency: "USD", courses: [["풀", 250]], reg: [-170, -120], scale: 30000, interest: 480, note: "기록 자격 기준이 있어요." },
  { id: "r110", name: "시카고 마라톤", type: "마라톤", country: "미국", city: "시카고", lat: 41.8781, lng: -87.6298, month: 10, day: 11, startTime: "07:30", currency: "USD", courses: [["풀", 240]], reg: [-250, -200], scale: 45000, interest: 450 },
  { id: "r111", name: "뉴욕시티 마라톤", type: "마라톤", country: "미국", city: "뉴욕", lat: 40.7128, lng: -74.006, month: 11, day: 1, startTime: "09:10", currency: "USD", courses: [["풀", 300]], reg: [-250, -130], scale: 50000, interest: 560, note: "추첨제로 운영돼요." },
  { id: "r112", name: "런던 마라톤", type: "마라톤", country: "영국", city: "런던", lat: 51.5074, lng: -0.1278, month: 4, day: 26, startTime: "09:30", currency: "GBP", courses: [["풀", 90]], reg: [-230, -190], scale: 50000, interest: 510, note: "추첨제로 운영돼요." },
  { id: "r113", name: "베를린 마라톤", type: "마라톤", country: "독일", city: "베를린", lat: 52.52, lng: 13.405, month: 9, day: 27, startTime: "09:15", currency: "EUR", courses: [["풀", 150]], reg: [-250, -200], scale: 45000, interest: 470 },
  { id: "r114", name: "파리 마라톤", type: "마라톤", country: "프랑스", city: "파리", lat: 48.8566, lng: 2.3522, month: 4, day: 12, startTime: "08:30", currency: "EUR", courses: [["10K", 40], ["풀", 110]], reg: [-200, -150], scale: 50000, interest: 350 },
  { id: "r115", name: "암스테르담 마라톤", type: "마라톤", country: "네덜란드", city: "암스테르담", lat: 52.3676, lng: 4.9041, month: 10, day: 18, startTime: "09:30", currency: "EUR", courses: [["10K", 60], ["하프", 100], ["풀", 140]], reg: [-250, -200], scale: 40000, interest: 260 },
  { id: "r116", name: "발렌시아 마라톤", type: "마라톤", country: "스페인", city: "발렌시아", lat: 39.4699, lng: -0.3763, month: 12, day: 6, startTime: "08:15", currency: "EUR", courses: [["10K", 30], ["풀", 70]], reg: [-120, -20], scale: 30000, interest: 240 },
  { id: "r117", name: "시드니 마라톤", type: "마라톤", country: "호주", city: "시드니", lat: -33.8688, lng: 151.2093, month: 9, day: 20, startTime: "06:00", currency: "AUD", courses: [["10K", 120], ["하프", 180], ["풀", 250]], reg: [-250, -180], scale: 35000, interest: 250 },
  {
    id: "r118", name: "UTMB 몽블랑", type: "트레일", country: "프랑스", city: "샤모니", lat: 45.9237, lng: 6.8694, month: 8, day: 28, startTime: "18:00", currency: "EUR",
    courses: [["50K", 190], ["100K", 330], ["100M", 480]], reg: [-250, -200], scale: 10000, interest: 600, note: "참가 자격을 위한 포인트 요건이 있어요.",
    trail: { elevationGain: 10000, timeLimit: "46시간 30분", difficulty: "상", gear: ["방수 재킷·바지", "헤드랜턴 2개", "보온 의류", "응급 담요", "물통 1L 이상", "호루라기"] },
  },
  {
    id: "r119", name: "웨스턴 스테이츠 100", type: "트레일", country: "미국", city: "스쿼밸리", lat: 39.1968, lng: -120.2354, month: 6, day: 26, startTime: "05:00", currency: "USD",
    courses: [["100M", 400]], reg: [-200, -120], scale: 370, interest: 300, note: "추첨제로 운영돼요.",
    trail: { elevationGain: 5500, timeLimit: "30시간", difficulty: "상", gear: ["헤드랜턴", "물통 1L 이상", "보온 의류", "응급 담요"] },
  },
  {
    id: "r120", name: "라바레도 울트라 트레일", type: "트레일", country: "이탈리아", city: "코르티나담페초", lat: 46.5405, lng: 12.1357, month: 6, day: 25, startTime: "23:00", currency: "EUR",
    courses: [["50K", 120], ["100K", 200]], reg: [-200, -150], scale: 2500, interest: 280,
    trail: { elevationGain: 5800, timeLimit: "30시간", difficulty: "상", gear: ["방수 재킷", "헤드랜턴", "보온 의류", "물통 500ml 이상"] },
  },
  {
    id: "r121", name: "마운트 후지 울트라 트레일", type: "트레일", country: "일본", city: "후지", lat: 35.3606, lng: 138.7274, month: 4, day: 23, startTime: "05:00", currency: "JPY",
    courses: [["50K", 25000], ["100M", 38000]], reg: [-150, -100], scale: 4300, interest: 340,
    trail: { elevationGain: 7000, timeLimit: "46시간", difficulty: "상", gear: ["방수 재킷", "헤드랜턴", "보온 의류", "응급 키트"] },
  },
  {
    id: "r122", name: "홍콩 100 울트라 트레일", type: "트레일", country: "홍콩", city: "홍콩", lat: 22.3964, lng: 114.1095, month: 1, day: 22, startTime: "08:00", currency: "HKD",
    courses: [["50K", 1400], ["100K", 2300]], reg: [-140, -80], scale: 1500, interest: 210,
    trail: { elevationGain: 4500, timeLimit: "30시간", difficulty: "상", gear: ["헤드랜턴", "물통 1L 이상", "방수 재킷"] },
  },
];

const pad = (n: number) => String(n).padStart(2, "0");

/** 해당 월·일의 가장 가까운 개최일. 최근 45일 안에 끝난 대회도 지난 대회로 남긴다 */
function raceDate(month: number, day: number) {
  const t = today();
  const y = Number(t.slice(0, 4));
  for (const yy of [y - 1, y, y + 1]) {
    const s = `${yy}-${pad(month)}-${pad(day)}`;
    if (diffDays(s, t) >= -45) return s;
  }
  return `${y + 1}-${pad(month)}-${pad(day)}`;
}

const addHours = (hhmm: string, hours: number) => {
  const [h, m] = hhmm.split(":").map(Number);
  return `${pad((h + hours) % 24)}:${pad(m)}`;
};

export function generateOverseasRaces(): Race[] {
  return SPECS.map((s) => {
    const date = raceDate(s.month, s.day);
    const courses: Course[] = s.courses.map(([distance, fee]) => ({ distance, fee }));
    return {
      id: s.id,
      name: s.name,
      type: s.type,
      scope: "해외",
      city: s.city,
      currency: s.currency,
      ...(s.trail ?? {}),
      date,
      startTime: s.startTime,
      endTime: addHours(s.startTime, s.type === "트레일" ? 30 : 7),
      regOpen: addDays(date, s.reg[0]),
      regOpenTime: "10:00",
      regClose: addDays(date, s.reg[1]),
      region: s.country,
      venue: `${s.city} 일원`,
      address: `${s.city}, ${s.country}`,
      lat: s.lat,
      lng: s.lng,
      officialUrl: `https://example.com/race/${s.id}`,
      sourceUrl: `https://example.com/source/${s.id}`,
      courses,
      scale: s.scale,
      organizer: `${s.city} 대회 조직위 (샘플)`,
      host: `${s.city} 대회 조직위 (샘플)`,
      memo: `PoC 샘플 정보예요. 일정·접수 방식·참가비는 실제와 다를 수 있으니 공식 사이트에서 확인하세요. 시각은 현지 기준이에요.${s.note ? ` ${s.note}` : ""}`,
      baseInterest: s.interest,
    } satisfies Race;
  });
}
