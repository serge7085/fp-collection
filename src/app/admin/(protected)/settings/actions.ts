"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { settingsSchema } from "@/lib/validations";

export type SettingsActionState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
  success?: boolean;
};

export async function updateSettingsAction(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const raw = {
    siteName: String(formData.get("siteName") ?? ""),
    siteTagline: String(formData.get("siteTagline") ?? ""),
    whatsappNumber: String(formData.get("whatsappNumber") ?? ""),
    whatsappMessage: String(formData.get("whatsappMessage") ?? ""),
    tiktokUrl: String(formData.get("tiktokUrl") ?? ""),
    instagramUrl: String(formData.get("instagramUrl") ?? ""),
    facebookUrl: String(formData.get("facebookUrl") ?? ""),
    primaryColor: String(formData.get("primaryColor") ?? ""),
    backgroundColor: String(formData.get("backgroundColor") ?? ""),
    textColor: String(formData.get("textColor") ?? ""),
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
  };

  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: SettingsActionState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { fieldErrors };
  }

  const logoUrl = String(formData.get("logoUrl") ?? "") || null;
  const faviconUrl = String(formData.get("faviconUrl") ?? "") || null;
  const whatsappQrUrl = String(formData.get("whatsappQrUrl") ?? "") || null;
  const data = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .update({
      site_name: data.siteName,
      site_tagline: data.siteTagline || "",
      logo_url: logoUrl,
      favicon_url: faviconUrl,
      whatsapp_number: data.whatsappNumber.replace(/\s+/g, ""),
      whatsapp_qr_url: whatsappQrUrl,
      whatsapp_message: data.whatsappMessage,
      tiktok_url: data.tiktokUrl || null,
      instagram_url: data.instagramUrl || null,
      facebook_url: data.facebookUrl || null,
      primary_color: data.primaryColor,
      background_color: data.backgroundColor,
      text_color: data.textColor,
      seo_title: data.seoTitle || null,
      seo_description: data.seoDescription || null,
    })
    .eq("id", true);

  if (error) {
    return { error: "Impossible d'enregistrer les paramètres. Réessayez." };
  }

  // Le layout racine, le footer, et toutes les pages publiques dépendent
  // de ces réglages : on revalide largement plutôt que page par page.
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");

  return { success: true };
}
