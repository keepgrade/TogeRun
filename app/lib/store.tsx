"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { buildSeed } from "./seed";
import type {
  AlertPref, BuddyPost, CPost, Comment, Data, Profile, Report, RunRecord, Review, RaceErrorReport, User,
} from "./types";
import { defaultProfile } from "./types";

const KEY = "togerun-poc-v10";
const NEXT_KEY = "togerun-poc-next";

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const ADJ = ["새벽", "바람", "느린", "초록", "조용한", "달리는", "부지런한", "씩씩한", "가벼운", "단단한"];
const NOUN = ["토끼", "구두", "거북이", "러너", "다람쥐", "마라토너", "여우", "고래", "참새", "곰"];
const randomNick = () => `${ADJ[Math.floor(Math.random() * ADJ.length)]} ${NOUN[Math.floor(Math.random() * NOUN.length)]} ${Math.floor(Math.random() * 90 + 10)}`;

function load(): Data {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Data;
      if (parsed.version === 10) return parsed;
    }
  } catch {
    /* 저장된 값이 깨졌으면 시드로 되돌린다 */
  }
  return buildSeed();
}

interface Actions {
  login: (provider: string) => User;
  logout: () => void;
  resetData: () => void;
  toggleFavorite: (raceId: string) => void;
  setAlertPref: (raceId: string, pref: AlertPref) => void;
  saveBuddy: (post: BuddyPost) => void;
  closeBuddy: (id: string) => void;
  deleteBuddy: (id: string) => void;
  saveReview: (review: Review) => void;
  deleteReview: (id: string) => void;
  saveCPost: (post: CPost) => void;
  deleteCPost: (id: string) => void;
  addComment: (c: Comment) => void;
  deleteComment: (id: string) => void;
  saveProfile: (p: Profile) => void;
  saveRecord: (r: RunRecord) => void;
  deleteRecord: (id: string) => void;
  report: (r: Omit<Report, "id" | "createdAt" | "reporterId">) => void;
  block: (userId: string) => void;
  unblock: (userId: string) => void;
  addRaceError: (e: Omit<RaceErrorReport, "id" | "createdAt">) => void;
}

interface Ctx {
  data: Data;
  me: User | null;
  myProfile: Profile;
  myHistory: RunRecord[];
  myFavorites: string[];
  myBlocked: string[];
  userName: (id: string) => string;
  a: Actions;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* 저장 공간이 없으면 이번 세션에서만 유지된다 */
    }
  }, [data]);

  const upd = useCallback((fn: (d: Data) => Data) => setData(fn), []);

  const a: Actions = useMemo(() => {
    const withMe = (fn: (d: Data, meId: string) => Data) => upd((d) => (d.meId ? fn(d, d.meId) : d));
    const upsert = <T extends { id: string }>(list: T[], item: T) =>
      list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list];

    return {
      login: (provider) => {
        let created: User | null = null;
        upd((d) => {
          const existing = d.accounts[provider];
          if (existing) return { ...d, meId: existing };
          const user = { id: uid(), nickname: randomNick() };
          created = user;
          return {
            ...d,
            users: [...d.users, user],
            accounts: { ...d.accounts, [provider]: user.id },
            profiles: { ...d.profiles, [user.id]: defaultProfile() },
            meId: user.id,
          };
        });
        return created ?? { id: "", nickname: "" };
      },
      logout: () => upd((d) => ({ ...d, meId: null })),
      resetData: () => {
        localStorage.removeItem(KEY);
        setData(buildSeed());
      },
      toggleFavorite: (raceId) =>
        withMe((d, me) => {
          const cur = d.favorites[me] ?? [];
          const next = cur.includes(raceId) ? cur.filter((x) => x !== raceId) : [...cur, raceId];
          const prefs = { ...(d.alertPrefs[me] ?? {}) };
          if (!cur.includes(raceId) && !prefs[raceId]) prefs[raceId] = { open: true, close: true };
          return { ...d, favorites: { ...d.favorites, [me]: next }, alertPrefs: { ...d.alertPrefs, [me]: prefs } };
        }),
      setAlertPref: (raceId, pref) =>
        withMe((d, me) => ({ ...d, alertPrefs: { ...d.alertPrefs, [me]: { ...(d.alertPrefs[me] ?? {}), [raceId]: pref } } })),
      saveBuddy: (post) => upd((d) => ({ ...d, buddyPosts: upsert(d.buddyPosts, post) })),
      closeBuddy: (id) => upd((d) => ({ ...d, buddyPosts: d.buddyPosts.map((p) => (p.id === id ? { ...p, closed: true } : p)) })),
      deleteBuddy: (id) => upd((d) => ({ ...d, buddyPosts: d.buddyPosts.filter((p) => p.id !== id) })),
      saveReview: (review) => upd((d) => ({ ...d, reviews: upsert(d.reviews, review) })),
      deleteReview: (id) => upd((d) => ({ ...d, reviews: d.reviews.filter((v) => v.id !== id) })),
      saveCPost: (post) => upd((d) => ({ ...d, cposts: upsert(d.cposts, post) })),
      deleteCPost: (id) =>
        upd((d) => ({ ...d, cposts: d.cposts.filter((c) => c.id !== id), comments: d.comments.filter((m) => m.postId !== id) })),
      addComment: (c) => upd((d) => ({ ...d, comments: [...d.comments, c] })),
      deleteComment: (id) => upd((d) => ({ ...d, comments: d.comments.filter((m) => m.id !== id) })),
      saveProfile: (p) => withMe((d, me) => ({ ...d, profiles: { ...d.profiles, [me]: p } })),
      saveRecord: (r) => withMe((d, me) => ({ ...d, histories: { ...d.histories, [me]: upsert(d.histories[me] ?? [], r) } })),
      deleteRecord: (id) =>
        withMe((d, me) => ({ ...d, histories: { ...d.histories, [me]: (d.histories[me] ?? []).filter((r) => r.id !== id) } })),
      report: (r) =>
        withMe((d, me) => ({
          ...d,
          reports: [{ ...r, id: uid(), reporterId: me, createdAt: new Date().toISOString() }, ...d.reports],
        })),
      block: (userId) =>
        withMe((d, me) => {
          const cur = d.blocked[me] ?? [];
          return cur.includes(userId) || userId === me ? d : { ...d, blocked: { ...d.blocked, [me]: [...cur, userId] } };
        }),
      unblock: (userId) =>
        withMe((d, me) => ({ ...d, blocked: { ...d.blocked, [me]: (d.blocked[me] ?? []).filter((x) => x !== userId) } })),
      addRaceError: (e) =>
        upd((d) => ({ ...d, raceErrors: [{ ...e, id: uid(), createdAt: new Date().toISOString() }, ...d.raceErrors] })),
    };
  }, [upd]);

  const value = useMemo<Ctx>(() => {
    const me = data.users.find((u) => u.id === data.meId) ?? null;
    return {
      data,
      me,
      myProfile: (me && data.profiles[me.id]) || defaultProfile(),
      myHistory: (me && data.histories[me.id]) || [],
      myFavorites: (me && data.favorites[me.id]) || [],
      myBlocked: (me && data.blocked[me.id]) || [],
      userName: (id) => data.users.find((u) => u.id === id)?.nickname ?? "알 수 없음",
      a,
    };
  }, [data, a]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("AppProvider 안에서만 사용할 수 있습니다");
  return ctx;
}

/** 로그인이 필요한 동작을 감싼다. 로그인 후 원래 화면으로 돌아온다. */
export function useGuard() {
  const { me } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  return useCallback(
    (cb: () => void) => {
      if (!me) {
        sessionStorage.setItem(NEXT_KEY, pathname);
        router.push("/login");
        return;
      }
      cb();
    },
    [me, router, pathname],
  );
}

export const takeNextPath = () => {
  const n = sessionStorage.getItem(NEXT_KEY);
  sessionStorage.removeItem(NEXT_KEY);
  return n || "/";
};
