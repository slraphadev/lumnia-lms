import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// Checagem otimista (só a presença do cookie). A autorização de verdade
// acontece em cada página e server action, via src/lib/session.ts.
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();
  const url = new URL("/entrar", request.url);
  url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/meus-cursos/:path*", "/professor/:path*", "/cursos/:slug/aulas/:path*"],
};
