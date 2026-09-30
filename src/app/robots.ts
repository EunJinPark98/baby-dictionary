import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";
import { PRIVATE_PATH_PREFIXES } from "@/lib/routes";

/** 개인 페이지와 인증/관리 경로는 검색엔진 수집 제외 (개인 페이지는 noindex 헤더·메타도 함께 적용) */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...PRIVATE_PATH_PREFIXES, "/login", "/auth/"],
      },
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
