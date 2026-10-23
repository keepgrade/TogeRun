/** 안내 메뉴 링크 묶음. 랜딩페이지 하단과 앱의 마이 화면이 함께 쓴다 */
export const INSTAGRAM_URL = "https://www.instagram.com/";

export type MenuLink = { label: string; href: string; external?: boolean; past?: boolean };

export const MENU_COLUMNS: { title: string; links: MenuLink[] }[] = [
  {
    title: "서비스",
    links: [
      { label: "대회 찾기", href: "/races" },
      { label: "버디 찾기", href: "/buddy" },
      { label: "대회 캘린더", href: "/calendar" },
      { label: "대회 지도", href: "/map" },
      { label: "커뮤니티", href: "/community" },
    ],
  },
  {
    title: "소식",
    links: [
      { label: "공지사항", href: "/info/notice" },
      { label: "업데이트", href: "/info/updates" },
      { label: "인스타그램", href: INSTAGRAM_URL, external: true },
    ],
  },
  {
    title: "지원",
    links: [
      { label: "등록 문의", href: "/support/registration" },
      { label: "문의사항", href: "/support/inquiry" },
      { label: "불편 신고", href: "/support/complaint" },
      { label: "수정 요청", href: "/support/correction" },
    ],
  },
  {
    title: "정책",
    links: [
      { label: "서비스 소개", href: "/about" },
      { label: "운영정책", href: "/info/policy" },
      { label: "이용약관", href: "/info/terms" },
      { label: "개인정보처리방침", href: "/info/privacy" },
      { label: "마라톤 버디 가이드", href: "/info/guide" },
    ],
  },
  {
    title: "아카이브",
    links: [
      { label: "지난 대회", href: "/races", past: true },
      { label: "내 캘린더에 추가", href: "/calendar" },
      { label: "내 알림 설정", href: "/alerts" },
    ],
  },
];
