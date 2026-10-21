import { addDays, diffDays, today } from "./date";
import { raceStatus } from "./derive";
import type {
  BuddyPost, CPost, Comment, Course, Distance, Gender, Profile, Race, Review, RunRecord, Style, Tag, User,
} from "./types";
import { AGE_BANDS, REGIONS } from "./types";

/** PoC용 더미 데이터 생성기. 고정 시드 난수라 같은 결과가 나온다. 실제 대회·사용자와 무관하다. */
export type Rng = () => number;

export const makeRng = (seed: number): Rng => {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}
const int = (rng: Rng, min: number, max: number) => min + Math.floor(rng() * (max - min + 1));
const chance = (rng: Rng, p: number) => rng() < p;

const CENTER: Record<string, [number, number]> = {
  서울: [37.5665, 126.978], 경기: [37.4138, 127.5183], 인천: [37.4563, 126.7052], 부산: [35.1796, 129.0756],
  대구: [35.8714, 128.6014], 대전: [36.3504, 127.3845], 광주: [35.1595, 126.8526], 울산: [35.5384, 129.3114],
  세종: [36.48, 127.289], 강원: [37.8228, 128.1555], 충북: [36.6357, 127.4917], 충남: [36.6588, 126.6728],
  전북: [35.8203, 127.1088], 전남: [34.8161, 126.4629], 경북: [36.4919, 128.8889], 경남: [35.4606, 128.2132],
  제주: [33.4996, 126.5312],
};

const PLACES = ["시민공원", "호수공원", "강변 산책로", "해안도로", "둘레길", "종합운동장", "수목원", "산성길", "체육공원", "문화단지", "생태공원", "도심 광장"];
const ROAD_THEMES = ["가을 러닝 페스티벌", "시민 마라톤", "하프 마라톤", "나이트런", "10K 챌린지", "런 페스티벌", "건강 달리기", "단풍 마라톤", "해맞이 런", "별빛 나이트런", "그린 마라톤", "도심 레이스"];
const TRAIL_THEMES = ["트레일 데이", "산성 트레일", "숲길 트레일 챌린지", "능선 트레일런"];
const ORGS = ["러닝협회", "체육회", "육상연맹", "러너스", "시청"];
const PARKING = ["공영주차장 이용 가능(혼잡 예상)", "인근 유료주차장 이용, 대중교통 권장", "행사장 주차 불가, 셔틀버스 운행", "주차장이 협소해 일찍 도착 권장"];
const SOUVENIR = ["기념 티셔츠, 완주 메달", "기록 칩, 완주 메달", "러닝 양말, 기념 타월", "참가 기념품 미정"];
const MEMOS = ["만 14세 이상 참가 가능", "우천 시에도 진행, 우비 지참 권장", "사전 신청자에 한해 배번 수령", "반려견 동반 불가", "참가자 보험 가입 포함"];

const COURSE_SETS: Distance[][] = [
  ["5K", "10K"], ["5K", "10K", "하프"], ["10K", "하프"], ["하프", "풀"], ["10K", "하프", "풀"], ["5K", "10K", "하프", "풀"],
];
const BASE_FEE: Record<Distance, [number, number]> = { "5K": [20000, 30000], "10K": [30000, 45000], 하프: [40000, 60000], 풀: [60000, 90000] };

const addMinutes = (hhmm: string, minutes: number) => {
  const [h, m] = hhmm.split(":").map(Number);
  const total = (((h * 60 + m + minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

type Plan = "month" | "open" | "soon" | "closed" | "past" | "cancel";

function pickPlan(rng: Rng, i: number): Plan {
  if (i < 8) return "month";
  const r = rng();
  if (r < 0.45) return "open";
  if (r < 0.67) return "soon";
  if (r < 0.81) return "closed";
  if (r < 0.92) return "past";
  return "cancel";
}

export function generateRaces(rng: Rng, count: number, startNumber: number): Race[] {
  const t = today();
  const d = (n: number) => addDays(t, n);
  const used = new Set<string>();
  const races: Race[] = [];

  for (let i = 0; i < count; i++) {
    const id = `r${startNumber + i}`;
    const region = pick(rng, REGIONS);
    const trail = chance(rng, 0.14);
    let name = "";
    let night = false;
    for (let tries = 0; tries < 20; tries++) {
      const place = pick(rng, PLACES);
      const theme = pick(rng, trail ? TRAIL_THEMES : ROAD_THEMES);
      name = `${region} ${place} ${theme}`;
      night = theme.includes("나이트런");
      if (!used.has(name)) break;
    }
    used.add(name);

    const plan = pickPlan(rng, i);
    let regOpenO: number, regCloseO: number, dateO: number;
    switch (plan) {
      case "month":
        dateO = int(rng, 1, 9);
        regCloseO = dateO - int(rng, 1, 4);
        regOpenO = regCloseO - int(rng, 14, 35);
        break;
      case "soon":
        regOpenO = int(rng, 1, 35);
        regCloseO = regOpenO + int(rng, 14, 40);
        dateO = regCloseO + int(rng, 5, 45);
        break;
      case "closed":
        regCloseO = -int(rng, 1, 12);
        regOpenO = regCloseO - int(rng, 15, 40);
        dateO = int(rng, 2, 50);
        break;
      case "past":
        dateO = -int(rng, 3, 70);
        regCloseO = dateO - int(rng, 10, 30);
        regOpenO = regCloseO - int(rng, 15, 40);
        break;
      default: // open, cancel
        regCloseO = int(rng, 1, 30);
        regOpenO = -int(rng, 5, 35);
        dateO = regCloseO + int(rng, 4, 40);
    }

    const sets = trail ? [["10K", "하프"], ["10K", "하프", "풀"]] as Distance[][] : COURSE_SETS;
    const courses: Course[] = pick(rng, sets).map((dist) => {
      const [a, b] = BASE_FEE[dist];
      const raw = int(rng, a, b) * (trail ? 1.3 : 1);
      return { distance: dist, fee: chance(rng, 0.04) ? null : Math.round(raw / (trail ? 5000 : 1000)) * (trail ? 5000 : 1000) };
    });
    if (!trail && chance(rng, 0.12)) courses.push({ distance: courses[0].distance, label: "학생부", fee: Math.round((courses[0].fee ?? 20000) * 0.6 / 1000) * 1000 });

    const startTime = night ? "19:00" : pick(rng, ["07:00", "08:00", "09:00", "10:00"]);
    const race: Race = {
      id,
      name,
      type: trail ? "트레일" : "마라톤",
      date: d(dateO),
      startTime,
      endTime: addMinutes(startTime, night ? 180 : int(rng, 4, 7) * 60),
      regOpen: d(regOpenO),
      regOpenTime: pick(rng, ["10:00", "12:00", "14:00"]),
      regClose: d(regCloseO),
      regCloseTime: chance(rng, 0.4) ? pick(rng, ["18:00", "23:59"]) : undefined,
      extraRegOpen: chance(rng, 0.1) && plan !== "past" ? d(regCloseO + int(rng, 2, 6)) : undefined,
      region,
      venue: name.split(" ").slice(1, -2).join(" ") || name.split(" ")[1],
      address: `${region} ${name.split(" ")[1]} 일대`,
      lat: CENTER[region][0] + (rng() - 0.5) * 0.24,
      lng: CENTER[region][1] + (rng() - 0.5) * 0.24,
      officialUrl: `https://example.com/race/${id}`,
      sourceUrl: `https://example.com/source/${id}`,
      courses,
      scale: chance(rng, 0.08) ? null : Math.round(int(rng, 1000, 20000) / 500) * 500,
      organizer: `샘플 ${region} ${pick(rng, ORGS)}`,
      host: `샘플 ${region} ${pick(rng, ORGS)}`,
      phone: `0${pick(rng, ["2", "31", "32", "51", "53", "42"])}-000-${int(rng, 1000, 9999)}`,
      snsUrl: "https://www.instagram.com/",
      parking: chance(rng, 0.6) ? pick(rng, PARKING) : undefined,
      souvenir: chance(rng, 0.6) ? pick(rng, SOUVENIR) : undefined,
      memo: chance(rng, 0.45) ? pick(rng, MEMOS) : undefined,
      schedule: chance(rng, 0.35)
        ? [
            { time: addMinutes(startTime, -60), title: "집결 및 물품 보관" },
            { time: startTime, title: `${courses[courses.length - 1].distance} 출발` },
            { time: addMinutes(startTime, 150), title: "시상식" },
          ]
        : undefined,
      cancelled: plan === "cancel" ? true : undefined,
      baseInterest: int(rng, 20, 400),
    };
    if (plan === "cancel") race.memo = "주최 측 사정으로 취소";
    races.push(race);
  }
  return races;
}

const ADJ = ["새벽", "바람", "느린", "초록", "조용한", "달리는", "부지런한", "씩씩한", "가벼운", "단단한", "햇살", "푸른", "은빛", "든든한", "활기찬", "여유로운", "꾸준한", "용감한"];
const NOUN = ["토끼", "구두", "거북이", "러너", "다람쥐", "마라토너", "여우", "고래", "참새", "곰", "표범", "펭귄", "수달", "고양이", "사슴"];
const GENDER_POOL: (Gender | undefined)[] = ["여성", "남성", "밝히지 않음", undefined, undefined];
const HIST_NAMES = ["지난 봄 10K", "예전 가을 하프", "첫 풀코스 도전", "도심 나이트런", "해안 마라톤", "동네 5K 대회", "겨울 하프 챌린지", "강변 시민 마라톤"];
const RECORD_RANGE: Record<Distance, [number, number]> = { "5K": [1300, 2100], "10K": [2700, 4200], 하프: [6000, 9000], 풀: [13500, 20000] };

export function generateUsers(rng: Rng, taken: string[], count: number) {
  const users: User[] = [];
  const profiles: Record<string, Profile> = {};
  const histories: Record<string, RunRecord[]> = {};
  const names = new Set(taken);

  for (let i = 0; i < count; i++) {
    let nickname = "";
    do nickname = `${pick(rng, ADJ)} ${pick(rng, NOUN)}`;
    while (names.has(nickname));
    names.add(nickname);

    const id = `g${String(i + 1).padStart(2, "0")}`;
    users.push({ id, nickname });

    const gender = pick(rng, GENDER_POOL);
    const age = chance(rng, 0.7) ? pick(rng, AGE_BANDS) : undefined;
    profiles[id] = {
      gender,
      age,
      paceSec: chance(rng, 0.85) ? int(rng, 270, 480) : undefined,
      consent: !!(gender || age),
      pub: { gender: chance(rng, 0.2), age: chance(rng, 0.3), pace: chance(rng, 0.85), history: chance(rng, 0.8) },
    };

    if (chance(rng, 0.6)) {
      histories[id] = Array.from({ length: int(rng, 1, 3) }, (_, k) => {
        const distance = pick(rng, ["5K", "10K", "하프", "풀"] as Distance[]);
        const done = chance(rng, 0.9);
        const [lo, hi] = RECORD_RANGE[distance];
        return {
          id: `${id}-h${k}`,
          raceName: pick(rng, HIST_NAMES),
          year: int(rng, 2022, 2026),
          distance,
          result: done ? ("완주" as const) : ("기권" as const),
          recordSec: done && chance(rng, 0.8) ? int(rng, lo, hi) : undefined,
        };
      });
    }
  }
  return { users, profiles, histories };
}

const INTROS = [
  "처음 나가는 대회라 같이 뛸 분을 찾아요", "후반에 페이스 같이 끌어주실 분 환영해요", "기록보다 완주가 목표예요",
  "대중교통으로 같이 이동해요", "현장에서 만나 같이 워밍업해요", "초보 러너도 편하게 연락 주세요",
  "사진 찍으면서 천천히 뛰어요", "완주 후에 같이 식사해요", "여유 있게 즐기는 페이스예요",
  "PB 도전하는 분과 같이 달리고 싶어요", "새벽 출발이라 같이 이동하실 분 구해요", "10K가 처음이라 같이 긴장 풀어요",
  "하프 두 번째 도전, 페이스메이커 구해요", "퇴근 후 합류 가능한 분이면 좋아요", "친구와 같이 나가는데 한 분 더 모집해요",
  "혼자 신청했는데 막상 걱정돼서요", "기념사진 같이 찍어요", "목표 기록은 느슨하게 잡았어요",
  "같은 동네에서 출발하실 분 있나요", "러닝 크루 없이 혼자 훈련 중이에요", "오르막 구간 같이 버텨요",
  "출발선 근처에서 만나요", "완주 메달 같이 받아요", "응원 겸 같이 뛰어도 좋아요",
  "비 와도 같이 뛰실 분", "코스 답사 같이 해보실 분", "이번이 세 번째 대회예요, 편하게 연락 주세요",
];
const PACES = ["4'50\"", "5'00\"", "5'20\"", "5'40\"", "6'00\"", "6'20\"", "6'40\"", "7'00\"", "7'30\""];
const STYLE_POOL: Style[] = ["현장 합류", "현장 합류", "현장 합류", "같이 이동", "같이 이동", "페이스 맞춰 같이 완주", "페이스 맞춰 같이 완주"];

export function generateBuddies(rng: Rng, races: Race[], userIds: string[], count: number, startNumber: number): BuddyPost[] {
  const t = today();
  const eligible = races.filter((r) => {
    const s = raceStatus(r, t);
    return s !== "종료" && s !== "취소" && diffDays(r.date, t) >= 1;
  });
  const weighted = eligible.flatMap((r) => Array(1 + Math.floor(r.baseInterest / 120)).fill(r) as Race[]);
  const posts: BuddyPost[] = [];

  for (let i = 0; i < count; i++) {
    const race = pick(rng, weighted);
    const rd = diffDays(race.date, t);
    const until = addDays(t, int(rng, -2, Math.min(rd - 1, 40)));
    const id = `gb${String(startNumber + i).padStart(2, "0")}`;
    posts.push({
      id,
      raceId: race.id,
      authorId: pick(rng, userIds),
      distance: pick(rng, race.courses).distance,
      style: pick(rng, STYLE_POOL),
      capacity: pick(rng, [1, 1, 2, 2, 3, 4]),
      recruitUntil: until,
      departRegion: chance(rng, 0.55) ? race.region : pick(rng, REGIONS),
      chatUrl: `https://open.kakao.com/o/demo${id}`,
      targetPace: chance(rng, 0.45) ? pick(rng, PACES) : undefined,
      intro: chance(rng, 0.85) ? pick(rng, INTROS) : undefined,
      closed: chance(rng, 0.1),
      createdAt: new Date(Date.now() - rng() * 10 * 86400000).toISOString(),
    });
  }
  return posts;
}

type PostTemplate = { title: string; body: string };

const POOLS: Record<Tag, PostTemplate[]> = {
  질문: [
    { title: "처음 나가는 10K인데 준비 어떻게 하세요?", body: "한 달 전부터 주 3회 5K 정도 뛰고 있어요. 대회 전 마지막 주에는 어떻게 훈련하는 게 좋을까요?" },
    { title: "배번표 수령은 대회 당일에도 되나요?", body: "공지에는 사전 수령이라고만 되어 있어서요. 당일 현장 수령이 가능한지 아시는 분 있으면 알려 주세요." },
    { title: "컷오프 시간이 빡빡한 편인가요?", body: "제 페이스가 평균 7분 정도인데 제한 시간 안에 들어올 수 있을지 걱정이에요. 경험 있으신 분들 의견 부탁드려요." },
    { title: "비가 오면 대회는 그대로 진행되나요?", body: "예보에 비가 있어서요. 우천 시 일정이 바뀌는지, 아니면 그대로 진행하는지 아시는 분 계신가요?" },
    { title: "하프 처음인데 러닝화 어떤 기준으로 고르세요?", body: "지금 신는 신발이 400km 정도 탔어요. 대회 전에 새 신발을 길들여야 할까요, 그냥 신던 걸 신을까요?" },
    { title: "보급 구간에 뭐가 나오나요?", body: "물이랑 이온음료는 나오는 것 같은데 간식도 있는지 궁금해요. 젤을 따로 챙겨야 하는지 고민 중이에요." },
    { title: "물품 보관은 몇 시까지 맡길 수 있나요?", body: "출발이 이른 시간이라 보관 마감이 언제인지 궁금해요. 줄이 긴지도 알려 주시면 감사해요." },
    { title: "출발 그룹은 어떻게 나뉘나요?", body: "예상 기록 기준으로 나뉘는지, 선착순인지 헷갈려요. 처음이라 뒤쪽에서 출발하고 싶은데 괜찮을까요?" },
    { title: "코스 후반에 오르막이 많은가요?", body: "고도표를 봤는데 후반부가 애매하게 보여서요. 지난 대회 뛰어 보신 분 후기가 궁금해요." },
    { title: "혼자 가도 어색하지 않을까요?", body: "같이 갈 사람이 없어서 혼자 신청했어요. 현장 분위기가 어떤지, 혼자 오는 분들이 많은지 궁금해요." },
    { title: "대회 전날 숙소는 어디가 편한가요?", body: "지방에서 올라가야 해서 전날 숙소를 잡으려고 해요. 출발지까지 가까운 지역 추천해 주세요." },
    { title: "완주 기념품은 현장에서 바로 받나요?", body: "메달이랑 티셔츠를 결승선에서 주는지, 따로 수령 부스가 있는지 궁금합니다." },
  ],
  "정보·팁": [
    { title: "대회 전날 탄수화물 로딩 이렇게 했어요", body: "전날 저녁에 밥이랑 면 위주로 평소보다 조금 더 먹고, 기름진 건 피했어요. 아침엔 바나나와 토스트로 가볍게 먹었더니 속이 편했어요." },
    { title: "초반 오버페이스 막는 방법", body: "첫 2km는 목표 페이스보다 일부러 15초 느리게 시작해 보세요. 시계 보다 호흡을 기준으로 삼으면 후반이 훨씬 편해요." },
    { title: "비 오는 날 러닝 복장 팁", body: "방수 재킷보다 얇은 바람막이에 챙 있는 모자를 추천해요. 양말은 두꺼운 것보다 얇은 걸 신어야 젖어도 덜 무거워요." },
    { title: "급수대 이용 요령", body: "급수대 직전에 속도를 줄이고, 컵을 살짝 접어서 마시면 덜 흘려요. 앞사람과 거리를 두고 한쪽 끝을 이용하면 덜 붐벼요." },
    { title: "발에 물집 안 생기게 하는 법", body: "대회 당일 새 양말은 피하고, 발가락 사이에 바셀린 계열 크림을 살짝 발라 두세요. 신발 끈은 발등을 너무 조이지 않게 매면 좋아요." },
    { title: "새벽 대회 준비물 체크리스트", body: "배번, 안전핀, 보조 배터리, 여분 양말, 비닐 우비, 간식. 전날 밤에 가방에 다 넣어 두면 아침이 훨씬 여유로워요." },
    { title: "스타트 라인 위치 팁", body: "출발 신호가 울려도 뒤쪽은 1~2분 뒤에 움직여요. 칩 타임이 따로 재어지는지 확인하고 너무 앞에서 서지 않는 게 좋아요." },
    { title: "완주 후 회복 루틴", body: "결승 후 바로 앉지 말고 5분 정도 걸으면서 심박을 내려 주세요. 그날은 단백질과 수분을 충분히 챙기고, 다음 날 가볍게 걷는 걸 추천해요." },
    { title: "후반 근육 경련 대처", body: "경련이 오면 속도를 줄이고 해당 근육을 천천히 늘려 주세요. 평소 훈련에서 전해질을 챙기는 습관도 도움이 됐어요." },
    { title: "러닝 양말 고르는 기준", body: "솔기가 적고 발가락 부분이 분리된 제품이 마찰이 덜해요. 대회 전에 최소 한 번은 같은 양말로 장거리를 뛰어 보세요." },
    { title: "배번 안전핀 말고 이렇게 달아 보세요", body: "배번 고정 벨트를 쓰면 옷에 구멍이 안 나고 추울 때 겉옷 위아래로 옮기기도 편해요. 안전핀은 네 모서리 중 두 개만 써도 충분했어요." },
    { title: "지난 대회 후기 요약", body: "코스는 평탄했고 급수대 간격이 적당했어요. 출발 혼잡은 5K 구간까지 이어졌으니 여유 있게 출발 라인에 서세요." },
  ],
  "이동·주차": [
    { title: "주차장 일찍 차요, 서두르세요", body: "새벽 6시 전에 도착했는데도 가까운 주차장은 이미 가득 차 있었어요. 조금 떨어진 곳에 대고 걸어가는 게 마음이 편해요." },
    { title: "지하철+도보 경로 공유", body: "가장 가까운 역에서 내려 도보 10분 정도예요. 출구가 여러 개라서 안내 표지판을 꼭 확인하세요." },
    { title: "셔틀버스 시간표 정리", body: "공지에 올라온 셔틀 시간을 정리해 봤어요. 마지막 차가 일찍 끊기니 귀가 시간은 넉넉하게 잡으세요." },
    { title: "KTX 타고 가실 분들 참고하세요", body: "역에서 행사장까지 택시로 15분 정도 걸려요. 새벽에는 호출이 잘 안 잡혀서 미리 예약해 두는 걸 추천합니다." },
    { title: "택시 호출이 어려운 구간 안내", body: "행사 종료 직후에는 호출이 몰려서 30분 이상 걸렸어요. 한 정거장 걸어서 이동하면 훨씬 수월했어요." },
    { title: "근처 무료 주차 가능한 곳", body: "행사장에서 도보 15분 거리에 무료 공영주차장이 있어요. 다만 현수막이 붙는 날은 통제될 수 있으니 확인하세요." },
    { title: "대회 후 귀가 혼잡 피하는 법", body: "결승 후 바로 이동하지 말고 근처 카페에서 1시간 정도 쉬다가 가면 훨씬 덜 붐벼요." },
    { title: "자전거로 오시는 분 주차 참고", body: "행사장 근처 자전거 거치대가 적어서 일찍 와야 자리가 있어요. 자물쇠는 꼭 챙기세요." },
    { title: "막차 시간 꼭 확인하세요", body: "시상식까지 보고 가려다 막차를 놓칠 뻔했어요. 지방에서 오시는 분들은 귀가 교통편을 미리 확인하세요." },
    { title: "새벽 대중교통 첫차 시간", body: "출발이 이른 시간이면 첫차로 도착해도 빠듯해요. 전날 근처에서 묵는 것도 방법이에요." },
  ],
  잡담: [
    { title: "D-day 다가오니 설레네요", body: "접수하고 나서 한 달 동안 꾸준히 뛰었어요. 이제 일주일 남았는데 설레면서도 살짝 긴장돼요." },
    { title: "다들 목표 기록 어떻게 되세요?", body: "저는 이번에 10K 55분 안에 들어오는 게 목표예요. 다른 분들은 어떤 목표로 준비하고 계신지 궁금해요." },
    { title: "러닝 시작한 지 3개월 됐어요", body: "처음엔 1km도 힘들었는데 이제 5K는 거뜬해요. 같이 시작한 친구와 이번 대회 같이 나가기로 했어요." },
    { title: "오늘 새벽 러닝 후기", body: "날씨가 선선해서 뛰기 딱 좋았어요. 대회 때도 이 정도 날씨면 좋겠어요." },
    { title: "같이 뛰면 확실히 덜 힘들어요", body: "지난 대회에서 처음 본 분과 페이스를 맞춰 뛰었는데 후반에 정말 큰 힘이 됐어요. 동행 구하길 잘했다는 생각이 들었어요." },
    { title: "인증샷 어떻게 찍으세요?", body: "결승선에서 줄이 길어서 사진 찍기가 어렵더라고요. 요령 있으신 분들 팁 부탁드려요." },
    { title: "요즘 날씨 러닝하기 딱 좋네요", body: "아침저녁으로 선선해서 훈련 강도를 조금 올려 봤어요. 다들 컨디션 관리 잘 하세요." },
    { title: "마라톤 입문 한 달 차 소감", body: "생각보다 중독성이 있네요. 기록은 느리지만 달리고 나면 하루가 개운해요." },
    { title: "완주 메달 모으시는 분 계세요?", body: "벽에 걸어 두는 재미가 쏠쏠해요. 이번에도 하나 추가하러 갑니다." },
    { title: "첫 풀코스 도전합니다", body: "신청 버튼 누르고 한참 고민했어요. 후회하지 않도록 남은 기간 열심히 준비해 보려고요. 응원 부탁드려요!" },
  ],
};

const COMMENTS = [
  "저도 같은 고민이에요.", "정보 감사합니다!", "작년에 참가했는데 괜찮았어요.", "정확한 시간은 공식 공지를 한 번 확인해 보세요.",
  "화이팅입니다!", "저도 그 코스는 처음이라 궁금했어요.", "도움이 많이 됐어요.", "새벽 대회는 전날 일찍 자는 게 제일이죠.",
  "비 오면 방수 자켓 챙기세요.", "저는 지하철로 갈 예정이에요.", "같이 뛰게 되면 인사드릴게요!", "후기 올려 주세요, 기대할게요.",
  "초반에 너무 달리지 마세요 ㅎㅎ", "저도 비슷하게 준비했어요.", "좋은 팁이네요, 저장해 둘게요.", "이 부분은 저도 헷갈렸어요.",
  "완주 응원합니다!", "저도 이번이 첫 대회예요.", "공감해요.", "혹시 다른 방법도 있을까요?",
  "대회장에서 뵈어요!", "맞아요, 일찍 가는 게 마음 편해요.", "참고하겠습니다.", "컨디션 관리 잘 하세요.",
];

const REVIEW_FRAGS = {
  course: [
    "코스가 평탄해서 달리기 좋았어요.", "후반 오르막이 생각보다 힘들었어요.", "코스 안내 표지가 잘 되어 있었어요.",
    "강변 구간 경치가 좋았어요.", "반환점 위치가 헷갈렸어요.", "노면 상태가 좋아서 기록 내기에 괜찮았어요.",
  ],
  operation: [
    "급수대 간격이 적당했어요.", "출발 구간이 붐벼서 초반에 막혔어요.", "자원봉사자분들이 친절했어요.",
    "물품 보관 줄이 길었어요.", "기록 칩 수령과 반납 안내가 명확했어요.", "결승선 부근 동선이 혼잡했어요.",
  ],
  access: [
    "지하철역에서 가까워 편했어요.", "주차가 어려워서 대중교통을 추천해요.", "셔틀 운행이 잘 되어 있었어요.",
    "대회 후 귀가 혼잡이 심했어요.", "새벽 첫차로도 시간에 맞게 도착했어요.",
  ],
  goods: [
    "기념품이 알찼어요.", "완주 메달 디자인이 마음에 들었어요.", "티셔츠 사이즈가 작게 나왔어요.",
    "기념품은 조금 아쉬웠어요.", "완주 후 간식이 넉넉했어요.",
  ],
  closing: [
    "내년에도 참가하고 싶어요.", "처음 나가는 분께 추천합니다.", "전체적으로 만족스러웠어요.",
    "다음에는 친구와 같이 가려고요.", "기록 욕심 없이 즐기기 좋았어요.", "준비를 더 하고 갈 걸 그랬어요.",
  ],
} as const;

/** 끝난 대회마다 리뷰를 만든다. existing에 이미 있는 (대회, 작성자) 조합은 피한다. */
export function generateReviews(rng: Rng, races: Race[], userIds: string[], existing: Review[], startNumber: number): Review[] {
  const t = today();
  const out: Review[] = [];
  let no = startNumber;

  for (const race of races.filter((r) => raceStatus(r, t) === "종료")) {
    const taken = new Set(existing.filter((v) => v.raceId === race.id).map((v) => v.authorId));
    const n = int(rng, 3, 9);
    for (let k = 0; k < n; k++) {
      const author = pick(rng, userIds);
      if (taken.has(author)) continue;
      taken.add(author);

      const roll = rng();
      const rating = roll < 0.45 ? 5 : roll < 0.8 ? 4 : roll < 0.93 ? 3 : int(rng, 1, 2);
      const near = () => Math.max(1, Math.min(5, rating + int(rng, -1, 1)));
      const parts: Review["parts"] = {};
      const frags: string[] = [];
      (["course", "operation", "access", "goods"] as const).forEach((key) => {
        if (chance(rng, 0.55)) {
          parts[key] = near();
          frags.push(pick(rng, REVIEW_FRAGS[key]));
        }
      });
      if (!frags.length) frags.push(pick(rng, REVIEW_FRAGS.course));
      frags.push(pick(rng, REVIEW_FRAGS.closing));

      const base = new Date(`${race.date}T12:00:00`).getTime();
      const when = Math.min(Date.now() - 60000, base + int(rng, 1, 8) * 86400000 + rng() * 6 * 3600000);
      out.push({
        id: `gv${String(no++).padStart(3, "0")}`,
        raceId: race.id,
        authorId: author,
        distance: pick(rng, race.courses).distance,
        rating,
        parts,
        body: frags.join(" "),
        createdAt: new Date(when).toISOString(),
      });
    }
  }
  return out;
}

export function generateCommunity(rng: Rng, races: Race[], userIds: string[], count: number, startNumber: number) {
  const t = today();
  const eligible = races.filter((r) => raceStatus(r, t) !== "취소");
  const weighted = eligible.flatMap((r) => Array(1 + Math.floor(r.baseInterest / 100)).fill(r) as Race[]);
  const tags = Object.keys(POOLS) as Tag[];
  const posts: CPost[] = [];
  const comments: Comment[] = [];
  const usedPerRace = new Set<string>();
  let commentNo = 1;

  for (let i = 0; i < count; i++) {
    const tag = tags[i % tags.length];
    const pool = POOLS[tag];
    let race = pick(rng, weighted);
    let tpl = pick(rng, pool);
    for (let tries = 0; tries < 12 && usedPerRace.has(`${race.id}|${tpl.title}`); tries++) {
      race = pick(rng, weighted);
      tpl = pick(rng, pool);
    }
    usedPerRace.add(`${race.id}|${tpl.title}`);

    const id = `gc${String(startNumber + i).padStart(2, "0")}`;
    const author = pick(rng, userIds);
    const createdAt = new Date(Date.now() - rng() * 14 * 86400000).toISOString();
    posts.push({ id, raceId: race.id, authorId: author, tag, title: tpl.title, body: tpl.body, createdAt });

    const n = chance(rng, 0.3) ? 0 : int(rng, 1, 5);
    for (let k = 0; k < n; k++) {
      let who = pick(rng, userIds);
      if (who === author) who = userIds[(userIds.indexOf(who) + 1) % userIds.length];
      comments.push({
        id: `gm${String(commentNo++).padStart(3, "0")}`,
        postId: id,
        authorId: who,
        body: pick(rng, COMMENTS),
        createdAt: new Date(new Date(createdAt).getTime() + (k + 1) * rng() * 6 * 3600000).toISOString(),
      });
    }
  }
  return { posts, comments };
}
