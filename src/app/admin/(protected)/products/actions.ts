"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/lib/validations";
import { slugify, generateReference } from "@/lib/slug";

export type ProductActionState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
  success?: boolean;
};

/**
 * Garantit un slug unique en ajoutant un suffixe numérique en cas de
 * collision (ex: "sac-cuir-milano", "sac-cuir-milano-2", ...).
 * excludeId permet d'ignorer le produit lui-même lors d'une modification.
 */
async function ensureUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    let query = supabase.from("products").select("id").eq("slug", slug);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();

    if (!data) return slug;
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

function parseProductForm(formData: FormData) {
  const raw = {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    reference: String(formData.get("reference") ?? ""),
    price: String(formData.get("price") ?? ""),
    promoPrice: String(formData.get("promoPrice") ?? ""),
    stock: String(formData.get("stock") ?? "0"),
    categoryId: String(formData.get("categoryId") ?? ""),
    vendorId: String(formData.get("vendorId") ?? ""),
    status: String(formData.get("status") ?? "draft"),
    isFeatured: formData.get("isFeatured") === "on",
  };
  return productSchema.safeParse(raw);
}

function buildFieldErrors(
  issues: { path: (string | number)[]; message: string }[]
): ProductActionState["fieldErrors"] {
  const fieldErrors: ProductActionState["fieldErrors"] = {};
  for (const issue of issues) {
    fieldErrors[String(issue.path[0])] = issue.message;
  }
  return fieldErrors;
}

export async function createProductAction(
  _prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { fieldErrors: buildFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  const data = parsed.data;

  const baseSlug = slugify(data.name);
  const slug = await ensureUniqueSlug(supabase, baseSlug);
  const reference = data.reference || generateReference();

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name: data.name,
      slug,
      description: data.description || null,
      reference,
      price: data.price,
      promo_price: isNaN(data.promoPrice as number) ? null : (data.promoPrice as number),
      stock: data.stock,
      category_id: data.categoryId || null,
      vendor_id: data.vendorId || null,
      status: data.status,
      is_featured: data.isFeatured ?? false,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Cette référence produit est déjà utilisée." };
    }
    return { error: "Impossible de créer le produit. Réessayez." };
  }

  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}`);
}

export async function updateProductAction(
  productId: string,
  _prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { fieldErrors: buildFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  const data = parsed.data;

  const baseSlug = slugify(data.name);
  const slug = await ensureUniqueSlug(supabase, baseSlug, productId);

  const { error } = await supabase
    .from("products")
    .update({
      name: data.name,
      slug,
      description: data.description || null,
      reference: data.reference || null,
      price: data.price,
      promo_price: isNaN(data.promoPrice as number) ? null : (data.promoPrice as number),
      stock: data.stock,
      category_id: data.categoryId || null,
      vendor_id: data.vendorId || null,
      status: data.status,
      is_featured: data.isFeatured ?? false,
    })
    .eq("id", productId);

  if (error) {
    if (error.code === "23505") {
      return { error: "Cette référence produit est déjà utilisée." };
    }
    return { error: "Impossible de modifier le produit. Réessayez." };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  return { success: true };
}

export async function deleteProductAction(productId: string) {
  const supabase = await createClient();

  // Récupère les chemins de stockage des images pour les supprimer aussi
  // du bucket (sinon elles restent orphelines dans Supabase Storage).
  const { data: images } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("product_id", productId);

  if (images && images.length > 0) {
    await supabase.storage
      .from("product-images")
      .remove(images.map((img) => img.storage_path));
  }

  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) {
    return { error: "Impossible de supprimer le produit." };
  }

  revalidatePath("/admin/products");
  return { success: true };
}

export async function duplicateProductAction(productId: string) {
  const supabase = await createClient();

  const { data: original, error: fetchError } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (fetchError || !original) {
    return { error: "Produit introuvable." };
  }

  const baseSlug = slugify(`${original.name}-copie`);
  const slug = await ensureUniqueSlug(supabase, baseSlug);

  const { data: copy, error: insertError } = await supabase
    .from("products")
    .insert({
      name: `${original.name} (copie)`,
      slug,
      description: original.description,
      reference: generateReference(), // une nouvelle référence, pas de doublon
      price: original.price,
      promo_price: original.promo_price,
      stock: original.stock,
      category_id: original.category_id,
      vendor_id: original.vendor_id,
      status: "draft", // une copie démarre toujours en brouillon
      is_featured: false,
    })
    .select("id")
    .single();

  if (insertError || !copy) {
    return { error: "Impossible de dupliquer le produit." };
  }

  // Duplique aussi les références d'images (mêmes fichiers Storage,
  // partagés entre original et copie — pas de re-upload nécessaire).
  const { data: images } = await supabase
    .from("product_images")
    .select("storage_path, url, display_order, is_primary")
    .eq("product_id", productId);

  if (images && images.length > 0) {
    await supabase.from("product_images").insert(
      images.map((img) => ({
        product_id: copy.id,
        storage_path: img.storage_path,
        url: img.url,
        display_order: img.display_order,
        is_primary: img.is_primary,
      }))
    );
  }

  revalidatePath("/admin/products");
  return { success: true };
}

export async function toggleProductStatusAction(
  productId: string,
  currentStatus: "active" | "inactive" | "draft"
) {
  const supabase = await createClient();
  const newStatus = currentStatus === "active" ? "inactive" : "active";

  const { error } = await supabase
    .from("products")
    .update({ status: newStatus })
    .eq("id", productId);

  if (error) {
    return { error: "Impossible de changer le statut." };
  }

  revalidatePath("/admin/products");
  return { success: true, newStatus };
}

// ----------------------------------------------------------------------------
// Images
// ----------------------------------------------------------------------------

export async function addProductImageAction(
  productId: string,
  storagePath: string,
  url: string,
  displayOrder: number,
  isPrimary: boolean
) {
  const supabase = await createClient();

  if (isPrimary) {
    // Un seul primaire par produit : on retire le flag des autres avant.
    await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", productId);
  }

  const { error } = await supabase.from("product_images").insert({
    product_id: productId,
    storage_path: storagePath,
    url,
    display_order: displayOrder,
    is_primary: isPrimary,
  });

  if (error) {
    return { error: "Impossible d'enregistrer l'image." };
  }

  revalidatePath(`/admin/products/${productId}`);
  return { success: true };
}

export async function deleteProductImageAction(
  imageId: string,
  storagePath: string,
  productId: string
) {
  const supabase = await createClient();

  await supabase.storage.from("product-images").remove([storagePath]);

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (error) {
    return { error: "Impossible de supprimer l'image." };
  }

  revalidatePath(`/admin/products/${productId}`);
  return { success: true };
}

export async function setPrimaryImageAction(imageId: string, productId: string) {
  const supabase = await createClient();

  await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId);

  const { error } = await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId);

  if (error) {
    return { error: "Impossible de définir l'image principale." };
  }

  revalidatePath(`/admin/products/${productId}`);
  return { success: true };
}

export async function reorderProductImagesAction(
  productId: string,
  orderedImageIds: string[]
) {
  const supabase = await createClient();

  // Met à jour chaque display_order en parallèle. Pour un nombre d'images
  // raisonnable par produit (typiquement < 20), c'est largement suffisant
  // sans avoir besoin d'une transaction SQL dédiée.
  const updates = orderedImageIds.map((id, index) =>
    supabase.from("product_images").update({ display_order: index }).eq("id", id)
  );

  await Promise.all(updates);
  revalidatePath(`/admin/products/${productId}`);
  return { success: true };
}
