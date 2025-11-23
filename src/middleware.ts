import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intl = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 检查是否有多个连续的语言前缀（如 /es/ms/, /zh/pt/ 等）
  const localePrefixes = routing.locales.join("|");
  const multipleLocalePattern = new RegExp(`^/(${localePrefixes})/(${localePrefixes})(/|$)`);
  
  if (multipleLocalePattern.test(pathname)) {
    // 如果检测到多个语言前缀，提取最后一个作为目标语言，其余部分作为路径
    const match = pathname.match(new RegExp(`^/(${localePrefixes})/(${localePrefixes})(.*)$`));
    if (match) {
      const [, firstLocale, secondLocale, restPath] = match;
      // 使用最后一个语言前缀，忽略第一个
      const correctPath = `/${secondLocale}${restPath || '/'}`;
      return NextResponse.redirect(new URL(correctPath, request.url));
    }
  }
  
  const response = intl(request) as NextResponse;

  const isBlocked =
    pathname === "/zh" ||
    pathname === "/docs" ||
    pathname.startsWith("/docs/");

  if (isBlocked) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_vercel|favicon.ico|robots.txt|sitemap.xml|BingSiteAuth.xml|ads.txt|.*\\..*|privacy-policy|terms-of-service).*)",
  ],
};
