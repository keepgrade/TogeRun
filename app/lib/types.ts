export type Distance = "5K" | "10K" | "하프" | "풀";
export const DISTANCES: Distance[] = ["5K", "10K", "하프", "풀"];

export type Style = "현장 합류" | "같이 이동" | "페이스 맞춰 같이 완주";
export const STYLES: Style[] = ["현장 합류", "같이 이동", "페이스 맞춰 같이 완주"];

export const REGIONS = [
  "서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산", "세종",
  "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
];

export type RaceStatus = "접수 예정" | "접수중" | "접수 마감" | "종료" | "취소";

export interface Course {
  distance: Distance;
  /** 같은 거리의 부문 구분(예: 학생부). 없으면 일반 부문 */
  label?: string;
  fee: number | null;
}

export interface ScheduleItem {
  time: string;
  title: string;
}

export interface Race {
  id: string;
  name: string;
  type: "마라톤" | "트레일";
  date: string;
  /** 대회 시작·종료 시각 (HH:MM) */
  startTime: string;
  endTime: string;
  regOpen: string;
  regOpenTime?: string;
  regClose: string;
  regCloseTime?: string;
  extraRegOpen?: string;
  region: string;
  venue: string;
  address: string;
  /** 지도 좌표. PoC에서는 해당 지역 근처의 대략적인 값 */
  lat: number;
  lng: number;
  officialUrl: string;
  sourceUrl: string;
  courses: Course[];
  scale: number | null;
  organizer: string;
  host: string;
  phone?: string;
  snsUrl?: string;
  parking?: string;
  souvenir?: string;
  memo?: string;
  schedule?: ScheduleItem[];
  cancelled?: boolean;
  baseInterest: number;
}

export interface User {
  id: string;
  nickname: string;
}

export type Gender = "여성" | "남성" | "밝히지 않음";
export const GENDERS: Gender[] = ["여성", "남성", "밝히지 않음"];
export const AGE_BANDS = ["10대", "20대", "30대", "40대", "50대", "60대 이상"];

export interface Profile {
  gender?: Gender;
  age?: string;
  paceSec?: number;
  /** 성별·나이 수집·이용에 동의했는지. 둘 중 하나라도 입력하려면 필요하다 */
  consent?: boolean;
  pub: { gender: boolean; age: boolean; pace: boolean; history: boolean };
}

export const defaultProfile = (): Profile => ({
  pub: { gender: false, age: false, pace: true, history: true },
});

export interface RunRecord {
  id: string;
  raceName: string;
  raceId?: string;
  year: number;
  distance: Distance | "기타";
  result: "완주" | "기권";
  recordSec?: number;
  memo?: string;
}

export interface BuddyPost {
  id: string;
  raceId: string;
  authorId: string;
  distance: Distance;
  style: Style;
  capacity: number;
  recruitUntil: string;
  departRegion: string;
  chatUrl: string;
  targetPace?: string;
  intro?: string;
  closed: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  raceId: string;
  authorId: string;
  distance: Distance;
  rating: number;
  parts: { course?: number; operation?: number; access?: number; goods?: number };
  body: string;
  createdAt: string;
}

export const TAGS = ["질문", "정보·팁", "이동·주차", "잡담"] as const;
export type Tag = (typeof TAGS)[number];

export interface CPost {
  id: string;
  raceId: string;
  authorId: string;
  tag: Tag;
  title: string;
  body: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export type TargetType = "모집글" | "리뷰" | "커뮤니티 글" | "댓글" | "사용자";
export const REPORT_REASONS = ["스팸·광고", "개인정보 노출", "부적절한 내용", "사기·사칭", "기타"];

export interface Report {
  id: string;
  targetType: TargetType;
  targetId: string;
  reason: string;
  detail: string;
  reporterId: string;
  createdAt: string;
}

export interface RaceErrorReport {
  id: string;
  kind: "정보 오류" | "등록 문의";
  raceId?: string;
  detail: string;
  evidenceUrl?: string;
  email?: string;
  createdAt: string;
}

export interface AlertPref {
  open: boolean;
  close: boolean;
}

export interface Data {
  version: 4;
  users: User[];
  accounts: Record<string, string>;
  meId: string | null;
  profiles: Record<string, Profile>;
  histories: Record<string, RunRecord[]>;
  races: Race[];
  favorites: Record<string, string[]>;
  alertPrefs: Record<string, Record<string, AlertPref>>;
  blocked: Record<string, string[]>;
  buddyPosts: BuddyPost[];
  reviews: Review[];
  cposts: CPost[];
  comments: Comment[];
  reports: Report[];
  raceErrors: RaceErrorReport[];
}
