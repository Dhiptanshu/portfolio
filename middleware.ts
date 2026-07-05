import { NextResponse, type NextRequest } from "next/server";
import type { CookieOptions } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isLoginRoute = request.nextUrl.pathname === "/admin/login";
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin") && !isLoginRoute;

  if (!url || !key) {
    if (isAdminRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admin/login";
      redirectUrl.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  let user = null;

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.warn("Supabase auth lookup failed in middleware:", error.message);
    } else {
      user = data.user;
    }
  } catch (error) {
    console.warn("Supabase middleware fetch failed:", error);
  }

  if (isAdminRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/login";
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"]
};
