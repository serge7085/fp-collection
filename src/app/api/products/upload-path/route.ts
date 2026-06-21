import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Génère un chemin de stockage unique et vérifie les droits admin avant
// de retourner les infos nécessaires à l'upload direct depuis le navigateur.
// L'upload réel passe par le SDK Supabase côté client (avec la session
// utilisateur), ce endpoint sert juste à calculer un chemin sûr et unique.
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!admin) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const fileName = body?.fileName as string | undefined;
  const productId = body?.productId as string | undefined;

  if (!fileName || !productId) {
    return NextResponse.json(
      { error: "fileName et productId sont requis." },
      { status: 400 }
    );
  }

  const ext = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "jpg";
  const uniqueName = `${crypto.randomUUID()}.${safeExt}`;
  const storagePath = `${productId}/${uniqueName}`;

  return NextResponse.json({ storagePath });
}
