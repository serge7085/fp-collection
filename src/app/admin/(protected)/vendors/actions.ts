"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { vendorSchema } from "@/lib/validations";
import { slugify } from "@/lib/slug";

export type VendorActionState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

async function ensureUniqueVendorSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let slug = baseSlug;
  let suffix = 1;
  while (true) {
    let query = supabase.from("vendors").select("id").eq("slug", slug);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return slug;
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

function parseVendorForm(formData: FormData) {
  return vendorSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    tiktokUrl: String(formData.get("tiktokUrl") ?? ""),
    instagramUrl: String(formData.get("instagramUrl") ?? ""),
    facebookUrl: String(formData.get("facebookUrl") ?? ""),
    isActive: formData.get("isActive") === "on",
  });
}

function buildFieldErrors(
  issues: { path: (string | number)[]; message: string }[]
): VendorActionState["fieldErrors"] {
  const fieldErrors: VendorActionState["fieldErrors"] = {};
  for (const issue of issues) fieldErrors[String(issue.path[0])] = issue.message;
  return fieldErrors;
}

export async function createVendorAction(
  _prevState: VendorActionState,
  formData: FormData
): Promise<VendorActionState> {
  const parsed = parseVendorForm(formData);
  if (!parsed.success) return { fieldErrors: buildFieldErrors(parsed.error.issues) };

  const supabase = await createClient();
  const slug = await ensureUniqueVendorSlug(supabase, slugify(parsed.data.name));
  const photoUrl = String(formData.get("photoUrl") ?? "") || null;

  const { error } = await supabase.from("vendors").insert({
    name: parsed.data.name,
    slug,
    description: parsed.data.description || null,
    photo_url: photoUrl,
    phone: parsed.data.phone || null,
    whatsapp: parsed.data.whatsapp || null,
    tiktok_url: parsed.data.tiktokUrl || null,
    instagram_url: parsed.data.instagramUrl || null,
    facebook_url: parsed.data.facebookUrl || null,
    is_active: parsed.data.isActive ?? true,
  });

  if (error) return { error: "Impossible de créer le vendeur." };

  revalidatePath("/admin/vendors");
  redirect("/admin/vendors");
}

export async function updateVendorAction(
  vendorId: string,
  _prevState: VendorActionState,
  formData: FormData
): Promise<VendorActionState> {
  const parsed = parseVendorForm(formData);
  if (!parsed.success) return { fieldErrors: buildFieldErrors(parsed.error.issues) };

  const supabase = await createClient();
  const slug = await ensureUniqueVendorSlug(supabase, slugify(parsed.data.name), vendorId);
  const photoUrl = String(formData.get("photoUrl") ?? "") || null;

  const { error } = await supabase
    .from("vendors")
    .update({
      name: parsed.data.name,
      slug,
      description: parsed.data.description || null,
      photo_url: photoUrl,
      phone: parsed.data.phone || null,
      whatsapp: parsed.data.whatsapp || null,
      tiktok_url: parsed.data.tiktokUrl || null,
      instagram_url: parsed.data.instagramUrl || null,
      facebook_url: parsed.data.facebookUrl || null,
      is_active: parsed.data.isActive ?? true,
    })
    .eq("id", vendorId);

  if (error) return { error: "Impossible de modifier le vendeur." };

  revalidatePath("/admin/vendors");
  redirect("/admin/vendors");
}

export async function deleteVendorAction(vendorId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("vendors").delete().eq("id", vendorId);
  if (error) return { error: "Impossible de supprimer le vendeur." };
  revalidatePath("/admin/vendors");
  return { success: true };
}
