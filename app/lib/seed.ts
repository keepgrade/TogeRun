import { addDays, today } from "./date";
import type { BuddyPost, CPost, Comment, Data, Race, Review } from "./types";
import { defaultProfile } from "./types";

/** 대회별 지도 좌표(위도, 경도). 해당 지역 근처의 대략적인 값이다. */
const GEO: Record<string, [number, number]> = {
  r01: [37.5283, 126.9326],
  r02: [35.0230, 128.8190],
  r03: [38.1695, 128.4650],
  r04: [37.5600, 127.0680],
  r05: [35.8650, 127.0640],
  r06: [33.5200, 126.5300],
  r07: [35.8296, 128.6821],
  r08: [37.3920, 126.6390],
  r09: [37.8590, 127.7330],
  r10: [37.2830, 127.0140],
  r11: [37.5440, 127.0374],
  r12: [35.1587, 129.1604],
  r13: [36.3600, 127.3700],
  r14: [35.8400, 129.2900],
  r15: [35.1300, 126.9880],
  r16: [35.5380, 129.3110],
  r17: [36.4970, 127.2670],
  r18: [37.7940, 128.9070],
  r19: [36.6420, 127.4890],
  r20: [35.4030, 127.3760],
};

/** 기본값 위에 덮어쓰는 대회별 상세 정보(상세 일정, 시각, 부문 등) */
const EXTRA: Record<string, Partial<Race>> = {
  r01: {
    startTime: "07:30", endTime: "12:00", regCloseTime: "18:00", phone: "02-0000-0101",
    schedule: [
      { time: "06:30", title: "집결 및 물품 보관" },
      { time: "07:30", title: "하프 출발" },
      { time: "08:00", title: "10K 출발" },
      { time: "08:30", title: "5K 출발" },
      { time: "11:30", title: "시상식" },
    ],
  },
  r03: {
    startTime: "07:00", endTime: "15:00", regCloseTime: "23:59", phone: "033-000-0303",
    schedule: [
      { time: "06:00", title: "셔틀버스 탑승" },
      { time: "07:00", title: "하프 출발" },
      { time: "07:30", title: "10K 출발" },
      { time: "14:30", title: "제한 시간 종료" },
    ],
  },
  r07: {
    startTime: "08:00", endTime: "12:30",
    schedule: [
      { time: "07:00", title: "입장 시작" },
      { time: "08:00", title: "하프 출발" },
      { time: "08:30", title: "10K 출발" },
      { time: "09:00", title: "5K 출발" },
    ],
  },
  r10: {
    courses: [
      { distance: "5K", fee: 25000 },
      { distance: "5K", label: "학생부", fee: 15000 },
      { distance: "10K", fee: 35000 },
    ],
    memo: "학생부는 학생증 확인 후 참가 가능",
  },
  r14: {
    startTime: "06:30", endTime: "13:30", phone: "054-000-1414",
    schedule: [
      { time: "05:30", title: "집결" },
      { time: "06:30", title: "풀코스 출발" },
      { time: "07:30", title: "하프·10K 출발" },
      { time: "13:30", title: "제한 시간 종료" },
    ],
  },
};

/**
 * PoC용 가상 샘플 데이터. 실제 대회·실제 사용자와 무관하다.
 * 날짜는 오늘 기준 상대값이라 접수 예정·접수중·마감·종료·취소가 골고루 나온다.
 */
export function buildSeed(): Data {
  const t = today();
  const d = (n: number) => addDays(t, n);
  const stamp = (n: number) => new Date(Date.now() + n * 86400000).toISOString();

  type RaceInput = Omit<Race, "sourceUrl" | "officialUrl" | "lat" | "lng" | "startTime" | "endTime" | "host"> & Partial<Race>;
  const race = (r: RaceInput): Race => ({
    officialUrl: "https://example.com/race/" + r.id,
    sourceUrl: "https://example.com/source/" + r.id,
    lat: GEO[r.id][0],
    lng: GEO[r.id][1],
    startTime: "08:00",
    endTime: "12:00",
    regOpenTime: "14:00",
    host: r.organizer,
    phone: "02-0000-0000",
    snsUrl: "https://www.instagram.com/",
    ...r,
  });

  const races: Race[] = [
    race({
      id: "r01", name: "한강 가을 러닝 페스티벌", type: "마라톤", date: d(21), regOpen: d(-20), regClose: d(10),
      region: "서울", venue: "여의도 한강공원", address: "서울 영등포구 여의동로 330",
      courses: [{ distance: "5K", fee: 30000 }, { distance: "10K", fee: 40000 }, { distance: "하프", fee: 50000 }],
      scale: 8000, organizer: "샘플 러닝협회", parking: "공원 주차장은 혼잡하니 대중교통 권장", souvenir: "기념 티셔츠, 완주 메달",
      memo: "만 14세 이상 참가 가능", baseInterest: 340,
    }),
    race({
      id: "r02", name: "가덕 바다 마라톤", type: "마라톤", date: d(45), regOpen: d(5), regClose: d(25),
      region: "부산", venue: "가덕도 해안도로", address: "부산 강서구 가덕해안로 100",
      courses: [{ distance: "10K", fee: 45000 }, { distance: "하프", fee: 55000 }, { distance: "풀", fee: 70000 }],
      scale: 5000, organizer: "샘플 부산체육회", souvenir: "완주 메달", baseInterest: 210,
    }),
    race({
      id: "r03", name: "설악 트레일 챌린지", type: "트레일", date: d(30), regOpen: d(-10), regClose: d(12),
      region: "강원", venue: "속초 설악산 입구", address: "강원 속초시 설악산로 833",
      courses: [{ distance: "10K", fee: 60000 }, { distance: "하프", fee: 80000 }],
      scale: 1200, organizer: "샘플 트레일클럽", memo: "트레일 러닝화 필수, 필수 장비 목록 공지 예정", baseInterest: 95,
    }),
    race({
      id: "r04", name: "중랑천 나이트런", type: "마라톤", date: d(8), regOpen: d(-30), regClose: d(-3),
      region: "서울", venue: "중랑천 체육공원", address: "서울 동대문구 장안동 일대",
      courses: [{ distance: "5K", fee: 25000 }, { distance: "10K", fee: 35000 }],
      scale: 3000, organizer: "샘플 서울러닝", souvenir: "LED 밴드", baseInterest: 150,
    }),
    race({
      id: "r05", name: "전주 벚꽃 하프", type: "마라톤", date: d(120), regOpen: d(60), regClose: d(90),
      region: "전북", venue: "전주 월드컵경기장", address: "전북 전주시 덕진구 기린대로 1055",
      courses: [{ distance: "10K", fee: 40000 }, { distance: "하프", fee: 50000 }],
      scale: 6000, organizer: "샘플 전북육상연맹", baseInterest: 60,
    }),
    race({
      id: "r06", name: "제주 해안 마라톤", type: "마라톤", date: d(60), regOpen: d(2), regClose: d(30),
      region: "제주", venue: "제주 해안도로 일대", address: "제주 제주시 연안로 일대",
      courses: [{ distance: "하프", fee: 60000 }, { distance: "풀", fee: 80000 }],
      scale: 4000, organizer: "샘플 제주러닝", souvenir: "기념품 미정", baseInterest: 180,
    }),
    race({
      id: "r07", name: "대구 시민 마라톤", type: "마라톤", date: d(18), regOpen: d(-25), regClose: d(3),
      region: "대구", venue: "대구 스타디움", address: "대구 수성구 유니버시아드로 180",
      courses: [{ distance: "5K", fee: 20000 }, { distance: "10K", fee: 30000 }, { distance: "하프", fee: 40000 }],
      scale: 10000, organizer: "샘플 대구시", baseInterest: 280,
    }),
    race({
      id: "r08", name: "송도 센트럴 10K", type: "마라톤", date: d(35), regOpen: d(-5), regClose: d(20),
      region: "인천", venue: "송도 센트럴파크", address: "인천 연수구 컨벤시아대로 160",
      courses: [{ distance: "5K", fee: 30000 }, { distance: "10K", fee: 38000 }],
      scale: null, organizer: "샘플 인천러너스", baseInterest: 70,
    }),
    race({
      id: "r09", name: "호반 단풍 마라톤", type: "마라톤", date: d(75), regOpen: d(14), regClose: d(40),
      region: "강원", venue: "호반 둘레길", address: "강원 춘천시 스포츠타운길 일대",
      courses: [{ distance: "10K", fee: 45000 }, { distance: "하프", fee: 55000 }, { distance: "풀", fee: null }],
      scale: 7000, organizer: "샘플 강원체육회", memo: "풀코스 참가비는 추후 공지", baseInterest: 130,
    }),
    race({
      id: "r10", name: "수원 성곽 마라톤", type: "마라톤", date: d(12), regOpen: d(-40), regClose: d(2),
      region: "경기", venue: "수원 성곽길", address: "경기 수원시 팔달구 정조로 일대",
      courses: [{ distance: "5K", fee: 25000 }, { distance: "10K", fee: 35000 }],
      scale: 4500, organizer: "샘플 수원시", baseInterest: 110,
    }),
    race({
      id: "r11", name: "서울 봄 러닝 데이", type: "마라톤", date: d(-20), regOpen: d(-70), regClose: d(-35),
      region: "서울", venue: "서울숲", address: "서울 성동구 뚝섬로 273",
      courses: [{ distance: "5K", fee: 25000 }, { distance: "10K", fee: 35000 }],
      scale: 5000, organizer: "샘플 서울러닝", baseInterest: 200,
    }),
    race({
      id: "r12", name: "부산 여름 해변런", type: "마라톤", date: d(-50), regOpen: d(-100), regClose: d(-65),
      region: "부산", venue: "해운대 해수욕장", address: "부산 해운대구 해운대해변로 264",
      courses: [{ distance: "5K", fee: 28000 }, { distance: "10K", fee: 38000 }, { distance: "하프", fee: 48000 }],
      scale: 6000, organizer: "샘플 부산체육회", baseInterest: 170,
    }),
    race({
      id: "r13", name: "대전 갑천 가을런", type: "마라톤", date: d(25), regOpen: d(-15), regClose: d(8),
      region: "대전", venue: "갑천 시민공원", address: "대전 서구 둔산대로 일대",
      courses: [{ distance: "5K", fee: 22000 }, { distance: "10K", fee: 32000 }],
      scale: 2000, organizer: "샘플 대전러닝", cancelled: true, memo: "주최 측 사정으로 취소", baseInterest: 40,
    }),
    race({
      id: "r14", name: "경주 고도 마라톤", type: "마라톤", date: d(50), regOpen: d(-2), regClose: d(28),
      region: "경북", venue: "경주 보문단지", address: "경북 경주시 보문로 일대",
      courses: [{ distance: "10K", fee: 40000 }, { distance: "하프", fee: 50000 }, { distance: "풀", fee: 65000 }],
      scale: 9000, organizer: "샘플 경북육상", extraRegOpen: d(31), baseInterest: 190,
    }),
    race({
      id: "r15", name: "무등산 트레일 데이", type: "트레일", date: d(5), regOpen: d(-30), regClose: d(1),
      region: "광주", venue: "무등산 국립공원 입구", address: "광주 동구 무등로 일대",
      courses: [{ distance: "10K", fee: 50000 }, { distance: "하프", fee: 65000 }],
      scale: 1500, organizer: "샘플 광주산악연맹", baseInterest: 85,
    }),
    race({
      id: "r16", name: "태화강 러닝 페스티벌", type: "마라톤", date: d(8), regOpen: d(-20), regClose: d(4),
      region: "울산", venue: "태화강 국가정원", address: "울산 중구 태화동 일대",
      courses: [{ distance: "5K", fee: 25000 }, { distance: "10K", fee: 35000 }, { distance: "하프", fee: 45000 }],
      scale: 4000, organizer: "샘플 울산시", baseInterest: 100,
    }),
    race({
      id: "r17", name: "세종 호수공원 런", type: "마라톤", date: d(9), regOpen: d(-40), regClose: d(-2),
      region: "세종", venue: "세종 호수공원", address: "세종 어진동 일대",
      courses: [{ distance: "5K", fee: 20000 }, { distance: "10K", fee: 30000 }],
      scale: 2500, organizer: "샘플 세종육상연맹", baseInterest: 60,
    }),
    race({
      id: "r18", name: "경포 해변 마라톤", type: "마라톤", date: d(40), regOpen: d(10), regClose: d(30),
      region: "강원", venue: "강릉 경포해변", address: "강원 강릉시 경포로 일대",
      courses: [{ distance: "10K", fee: 40000 }, { distance: "하프", fee: 50000 }],
      scale: 3500, organizer: "샘플 강릉시", baseInterest: 75,
    }),
    race({
      id: "r19", name: "직지 하프 마라톤", type: "마라톤", date: d(55), regOpen: d(8), regClose: d(35),
      region: "충북", venue: "청주종합경기장", address: "충북 청주시 서원구 일대",
      courses: [{ distance: "10K", fee: 35000 }, { distance: "하프", fee: 45000 }],
      scale: 5000, organizer: "샘플 충북체육회", baseInterest: 55,
    }),
    race({
      id: "r20", name: "광한루 러닝 데이", type: "마라톤", date: d(65), regOpen: d(20), regClose: d(45),
      region: "전북", venue: "남원 광한루원", address: "전북 남원시 요천로 일대",
      courses: [{ distance: "5K", fee: 22000 }, { distance: "10K", fee: 32000 }],
      scale: 3000, organizer: "샘플 남원시", baseInterest: 45,
    }),
  ].map((r) => ({ ...r, ...EXTRA[r.id] }));

  const users = [
    { id: "u1", nickname: "새벽 달팽이" },
    { id: "u2", nickname: "바람 구두" },
    { id: "u3", nickname: "느린 토끼" },
    { id: "u4", nickname: "조용한 마라토너" },
    { id: "u5", nickname: "초록 러너" },
    { id: "u6", nickname: "하프 수집가" },
  ];

  const profiles = {
    u1: { gender: "여성" as const, age: "30대", paceSec: 370, pub: { gender: false, age: true, pace: true, history: true } },
    u2: { age: "20대", paceSec: 330, pub: { gender: false, age: false, pace: true, history: true } },
    u3: { gender: "남성" as const, age: "40대", paceSec: 420, pub: { gender: true, age: true, pace: true, history: false } },
    u4: { paceSec: 300, pub: { gender: false, age: false, pace: true, history: true } },
    u5: { ...defaultProfile() },
    u6: { gender: "밝히지 않음" as const, age: "30대", paceSec: 345, pub: { gender: false, age: false, pace: true, history: true } },
  };

  const histories = {
    u2: [
      { id: "h1", raceName: "서울 봄 러닝 데이", raceId: "r11", year: 2026, distance: "10K" as const, result: "완주" as const, recordSec: 3300 },
      { id: "h2", raceName: "예전 가을 하프", year: 2025, distance: "하프" as const, result: "완주" as const, recordSec: 7500 },
    ],
    u4: [{ id: "h3", raceName: "예전 겨울 풀코스", year: 2025, distance: "풀" as const, result: "완주" as const, recordSec: 15300 }],
    u6: [
      { id: "h4", raceName: "부산 여름 해변런", raceId: "r12", year: 2026, distance: "하프" as const, result: "완주" as const, recordSec: 7200 },
      { id: "h5", raceName: "예전 봄 10K", year: 2025, distance: "10K" as const, result: "기권" as const },
    ],
  };

  const buddyPosts: BuddyPost[] = [
    { id: "b01", raceId: "r01", authorId: "u1", distance: "10K", style: "현장 합류", capacity: 2, recruitUntil: d(10), departRegion: "서울", chatUrl: "https://open.kakao.com/o/demo001", targetPace: "6'10\"", intro: "혼자 신청했는데 같이 뛸 분 구해요", closed: false, createdAt: stamp(-3) },
    { id: "b02", raceId: "r01", authorId: "u2", distance: "하프", style: "페이스 맞춰 같이 완주", capacity: 1, recruitUntil: d(9), departRegion: "경기", chatUrl: "https://open.kakao.com/o/demo002", targetPace: "5'30\"", intro: "후반 페이스 같이 끌어줄 분", closed: false, createdAt: stamp(-2) },
    { id: "b03", raceId: "r01", authorId: "u3", distance: "5K", style: "같이 이동", capacity: 3, recruitUntil: d(-1), departRegion: "인천", chatUrl: "https://open.kakao.com/o/demo003", intro: "지난 모집, 마감일 지남", closed: false, createdAt: stamp(-9) },
    { id: "b04", raceId: "r03", authorId: "u4", distance: "하프", style: "현장 합류", capacity: 2, recruitUntil: d(12), departRegion: "강원", chatUrl: "https://open.kakao.com/o/demo004", intro: "트레일 처음이라 경험자 환영", closed: false, createdAt: stamp(-1) },
    { id: "b05", raceId: "r07", authorId: "u5", distance: "10K", style: "같이 이동", capacity: 2, recruitUntil: d(3), departRegion: "대구", chatUrl: "https://open.kakao.com/o/demo005", closed: false, createdAt: stamp(-1) },
    { id: "b06", raceId: "r07", authorId: "u6", distance: "하프", style: "현장 합류", capacity: 1, recruitUntil: d(3), departRegion: "경북", chatUrl: "https://open.kakao.com/o/demo006", intro: "인원 찼어요", closed: true, createdAt: stamp(-5) },
    { id: "b07", raceId: "r10", authorId: "u2", distance: "10K", style: "페이스 맞춰 같이 완주", capacity: 2, recruitUntil: d(2), departRegion: "경기", chatUrl: "https://open.kakao.com/o/demo007", targetPace: "5'40\"", closed: false, createdAt: stamp(-2) },
    { id: "b08", raceId: "r14", authorId: "u4", distance: "풀", style: "같이 이동", capacity: 2, recruitUntil: d(28), departRegion: "서울", chatUrl: "https://open.kakao.com/o/demo008", intro: "KTX로 같이 내려가요", closed: false, createdAt: stamp(0) },
    { id: "b09", raceId: "r04", authorId: "u5", distance: "5K", style: "현장 합류", capacity: 2, recruitUntil: d(7), departRegion: "서울", chatUrl: "https://open.kakao.com/o/demo009", intro: "접수는 끝났지만 현장 합류 모집", closed: false, createdAt: stamp(-1) },
    { id: "b10", raceId: "r06", authorId: "u6", distance: "하프", style: "같이 이동", capacity: 3, recruitUntil: d(30), departRegion: "서울", chatUrl: "https://open.kakao.com/o/demo010", intro: "접수 열리면 같이 신청해요", closed: false, createdAt: stamp(0) },
  ];

  const reviews: Review[] = [
    { id: "v01", raceId: "r11", authorId: "u2", distance: "10K", rating: 5, parts: { course: 5, operation: 4, access: 5, goods: 4 }, body: "코스가 평탄하고 급수대 간격이 적당했습니다. 지하철역에서 가까워 이동이 편했어요.", createdAt: stamp(-18) },
    { id: "v02", raceId: "r11", authorId: "u6", distance: "5K", rating: 4, parts: { course: 4, operation: 4, access: 5 }, body: "출발 구간이 조금 좁아서 초반에 막혔지만 전체적으로 운영은 깔끔했습니다.", createdAt: stamp(-17) },
    { id: "v03", raceId: "r11", authorId: "u3", distance: "10K", rating: 3, parts: { operation: 2, goods: 3 }, body: "물품 보관 줄이 길었고 완주 후 기념품 수령이 오래 걸렸습니다.", createdAt: stamp(-16) },
    { id: "v04", raceId: "r12", authorId: "u6", distance: "하프", rating: 4, parts: { course: 5, access: 3, goods: 4 }, body: "해변 코스 풍경은 좋았지만 주차가 어려워서 대중교통을 추천합니다.", createdAt: stamp(-45) },
    { id: "v05", raceId: "r12", authorId: "u1", distance: "10K", rating: 5, parts: { course: 5, operation: 5 }, body: "날씨까지 좋아서 만족스러웠고 현장 안내가 친절했습니다.", createdAt: stamp(-44) },
  ];

  const cposts: CPost[] = [
    { id: "c01", raceId: "r01", authorId: "u3", tag: "이동·주차", title: "여의도 주차 어떻게 하시나요?", body: "차를 가져갈지 대중교통을 탈지 고민 중입니다. 작년에 다녀오신 분 계신가요?", createdAt: stamp(-2) },
    { id: "c02", raceId: "r01", authorId: "u5", tag: "정보·팁", title: "물품 보관 팁", body: "보관소가 일찍 붐비니 가능하면 최소한만 챙기고 일찍 도착하는 걸 추천해요.", createdAt: stamp(-1) },
    { id: "c03", raceId: "r11", authorId: "u2", tag: "잡담", title: "다들 기록 어떠셨어요?", body: "10K 기록이 생각보다 안 나와서 아쉬웠어요. 다음 대회 준비 같이 해요.", createdAt: stamp(-15) },
    { id: "c04", raceId: "r03", authorId: "u4", tag: "질문", title: "트레일 필수 장비가 뭔가요?", body: "공지에 필수 장비 목록이 예정이라고 되어 있는데, 지난 대회 때는 어떤 걸 검사했는지 아시는 분 계세요?", createdAt: stamp(-0.5) },
    { id: "c05", raceId: "r07", authorId: "u6", tag: "이동·주차", title: "경기장 근처 주차 정보", body: "경기장 주차장은 새벽에 일찍 찹니다. 인근 지하철역에서 걸어가는 코스를 추천해요.", createdAt: stamp(-1.5) },
    { id: "c06", raceId: "r14", authorId: "u1", tag: "정보·팁", title: "보문단지 숙소 예약 팁", body: "대회 전날은 숙소가 빨리 마감돼서 접수 직후에 예약하는 걸 추천합니다.", createdAt: stamp(-0.2) },
  ];

  const comments: Comment[] = [
    { id: "m01", postId: "c01", authorId: "u2", body: "공원 주차장은 일찍 차서 지하철 추천드려요.", createdAt: stamp(-1) },
    { id: "m02", postId: "c01", authorId: "u5", body: "저도 대중교통으로 갈 예정이에요.", createdAt: stamp(-1) },
    { id: "m03", postId: "c05", authorId: "u2", body: "정보 감사해요. 지하철로 가야겠어요.", createdAt: stamp(-1) },
  ];

  return {
    version: 3,
    users,
    accounts: {},
    meId: null,
    profiles,
    histories,
    races,
    favorites: {},
    alertPrefs: {},
    blocked: {},
    buddyPosts,
    reviews,
    cposts,
    comments,
    reports: [],
    raceErrors: [],
  };
}
