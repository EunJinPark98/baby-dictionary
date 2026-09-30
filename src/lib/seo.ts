import type { Metadata } from "next";

export const SITE_NAME = "아기별 지도";
export const SITE_TAGLINE = "태어난 날부터 첫돌까지, 우리 아기의 성장 길을 한눈에.";
export const SITE_DESCRIPTION =
  "아기 생년월일만 등록하면 생후 일수·주수·개월 수에 맞춰 발달, 이유식, 놀이, 예방접종, 건강·안전 정보를 자동으로 보여주는 0세 맞춤 성장 가이드.";

interface PageMetadataInput {
  title: string;
  description: string;
  /** canonical 경로 (예: /food/ingredients/carrot) */
  path: string;
  type?: "website" | "article";
}

/** 공개 페이지 metadata: title, description, canonical, Open Graph */
export function pageMetadata({ title, description, path, type = "website" }: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} · ${SITE_NAME}`,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "ko_KR",
      type,
    },
    twitter: { card: "summary_large_image", title: `${title} · ${SITE_NAME}`, description },
  };
}

/** 개인 페이지 metadata: 검색엔진 비노출 */
export function privateMetadata(title: string): Metadata {
  return {
    title,
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  };
}
