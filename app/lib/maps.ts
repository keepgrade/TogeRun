import type { Race } from "./types";

/**
 * 카카오맵·네이버 지도 연동. 앱 키 없이 쓸 수 있는 공개 링크 방식이다.
 * 지도를 화면 안에 직접 넣으려면 각 사의 개발자 앱 키가 필요하다.
 */
export const naverMapUrl = (r: Pick<Race, "address" | "lat" | "lng">) =>
  `https://map.naver.com/p/search/${encodeURIComponent(r.address)}?c=${r.lng},${r.lat},15,0,0,0,dh`;

export const kakaoMapUrl = (r: Pick<Race, "venue" | "lat" | "lng">) =>
  `https://map.kakao.com/link/map/${encodeURIComponent(r.venue)},${r.lat},${r.lng}`;

export const kakaoRouteUrl = (r: Pick<Race, "venue" | "lat" | "lng">) =>
  `https://map.kakao.com/link/to/${encodeURIComponent(r.venue)},${r.lat},${r.lng}`;

/** 두 좌표 사이의 거리(km), 하버사인 공식 */
export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(bLat - aLat);
  const dLng = rad(bLng - aLng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export const STATUS_COLOR: Record<string, string> = {
  접수중: "#16a34a",
  "접수 예정": "#0284c7",
  "접수 마감": "#71717a",
  종료: "#a1a1aa",
  취소: "#dc2626",
};
