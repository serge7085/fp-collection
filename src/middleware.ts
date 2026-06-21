import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // --- Garde /setup : si setup déjà fait, on bloque l'accès -----------------
  if (pathname.startsWith("/setup")) {
    const { data: settings } = await supabase
      .from("settings")
      .select("setup_completed")
      .single();

    if (settings?.setup_completed) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return response;
  }

  // --- Garde /admin : nécessite un compte admin authentifié -----------------
  if (pathname.startsWith("/admin")) {
    const { data: settings } = await supabase
      .from("settings")
      .select("setup_completed")
      .single();

    if (!settings?.setup_completed) {
      return NextResponse.redirect(new URL("/setup", request.url));
    }

    // /admin/login doit rester accessible sans session, sinon personne ne
    // peut jamais se connecter. Si l'utilisateur est déjà un admin
    // authentifié, on le renvoie directement vers /admin.
    if (pathname.startsWith("/admin/login")) {
      if (user) {
        const { data: admin } = await supabase
          .from("admins")
          .select("id")
          .eq("id", user.id)
          .single();
        if (admin) {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      }
      return response;
    }

    if (!user) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { data: admin } = await supabase
      .from("admins")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!admin) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/setup/:path*",
  ],
};
