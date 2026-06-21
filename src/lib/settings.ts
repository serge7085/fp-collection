import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Settings } from "@/lib/database.types";

// `cache()` de React dé-duplique les appels identiques au sein d'un même
// rendu serveur : layout, page, et composants enfants peuvent tous appeler
// getSettings() sans déclencher plusieurs requêtes Supabase redondantes.
export const getSettings = cache(async (): Promise<Settings> => {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("*").single();

  // Filet de sécurité : si jamais la ligne singleton manquait (ne devrait
  // pas arriver vu le `insert ... on conflict do nothing` de la migration),
  // on retombe sur des valeurs par défaut plutôt que de planter le rendu.
  return (
    data ?? {
      id: true,
      site_name: "F-P Collection",
      site_tagline: "L'élégance à votre portée",
      logo_url: null,
      favicon_url: null,
      whatsapp_number: "22890000000",
      whatsapp_qr_url: null,
      whatsapp_message:
        "Bonjour, je suis intéressé par un produit vu sur F-P Collection. Pouvez-vous me donner plus d'informations ?",
      tiktok_url: null,
      instagram_url: null,
      facebook_url: null,
      primary_color: "#D4AF37",
      background_color: "#0F0F0F",
      text_color: "#F8F8F8",
      seo_title: null,
      seo_description: null,
      setup_completed: false,
      updated_at: new Date().toISOString(),
    }
  );
});

export function buildWhatsAppUrl(settings: Settings, customMessage?: string) {
  const message = customMessage ?? settings.whatsapp_message;
  return `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(message)}`;
}
