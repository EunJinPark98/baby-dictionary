import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "@/lib/env";
import { AUTH_PAGES, isPrivatePath, matchesPrefix } from "@/lib/routes";
import type { Database } from "./database.types";

/**
 * 요청마다 Supabase 세션을 갱신하고, 개인 페이지 접근을 보호한다.
 * (실제 데이터 보호는 DB RLS 가 담당하며, 여기서는 UX 용 리다이렉트만 처리)
 */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const privatePath = isPrivatePath(pathname);

  let response = NextResponse.next({ request });
  const env = getSupabasePublicEnv();
  if (!env) return withPrivacyHeaders(response, privatePath);

  const supabase = createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // getClaims() 는 JWT 를 검증하고 필요 시 세션을 갱신한다. 이 호출과 createServerClient 사이에 다른 로직을 두지 않는다.
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims?.sub);

  if (!isLoggedIn && privatePath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname + request.nextUrl.search);
    return redirectWithCookies(url, response);
  }

  if (isLoggedIn && (pathname === "/" || matchesPrefix(pathname, AUTH_PAGES))) {
    const url = request.nextUrl.clone();
    url.pathname = "/today";
    url.search = "";
    return redirectWithCookies(url, response);
  }

  return withPrivacyHeaders(response, privatePath);
}

function redirectWithCookies(url: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

function withPrivacyHeaders(response: NextResponse, privatePath: boolean) {
  if (privatePath) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}
