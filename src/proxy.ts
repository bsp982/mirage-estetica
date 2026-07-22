import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, readSessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isGestorPage =
    pathname.startsWith("/gestor") && !pathname.startsWith("/gestor/login");
  // Onboarding público: POST /api/platform/companies cria conta FREE sem sessão.
  const isPublicPlatformOnboarding =
    pathname === "/api/platform/companies" && request.method === "POST";

  const isPublicBillingWebhook =
    pathname === "/api/billing/webhook" && request.method === "POST";

  const isPrivateApi =
    pathname.startsWith("/api/gestor") ||
    pathname.startsWith("/api/billing") ||
    (pathname === "/api/appointments" && request.method === "GET") ||
    pathname.startsWith("/api/customers") ||
    pathname.startsWith("/api/vehicles") ||
    pathname.startsWith("/api/services/admin") ||
    pathname.startsWith("/api/financial") ||
    pathname.startsWith("/api/referrals") ||
    pathname.startsWith("/api/settings") ||
    pathname.startsWith("/api/gallery") ||
    (pathname.startsWith("/api/platform") && !isPublicPlatformOnboarding);

  if (
    (!isGestorPage && !isPrivateApi) ||
    isPublicPlatformOnboarding ||
    isPublicBillingWebhook
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await readSessionToken(token) : null;

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const login = new URL("/gestor/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  const headers = new Headers(request.headers);
  headers.set("x-company-id", session.companyId);
  headers.set("x-user-id", session.userId);
  headers.set("x-user-role", session.role);

  return NextResponse.next({ request: { headers } });
}

export const proxyConfig = {
  matcher: ["/gestor/:path*", "/api/:path*"],
};
