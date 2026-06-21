import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";

// Utilisé dans Server Components, Server Actions, Route Handlers.
// Respecte la session de l'utilisateur (RLS s'applique normalement).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Appelé depuis un Server Component : peut être ignoré si un
            // middleware rafraîchit déjà les sessions utilisateur.
          }
        },
      },
    }
  );
}

// Client "admin" avec la service_role key : bypass RLS.
// À utiliser UNIQUEMENT côté serveur, pour des opérations précises et
// volontairement privilégiées (ex: création du tout premier compte admin
// via /setup, où aucun utilisateur n'est encore authentifié).
// Ne jamais importer ce fichier dans un composant client.
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createSupabaseJsClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
