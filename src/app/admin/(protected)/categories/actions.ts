"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { categorySchema } from "@/lib/validations";
import { slugify } from "@/lib/slug";

export type CategoryActionState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

async function ensureUniqueCategorySlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let slug = baseSlug;
  let suffix = 1;
  while (true) {
    let query = supabase.from("categories").select("id").eq("slug", slug);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return slug;
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

function parseCategoryForm(formData: FormData) {
  return categorySchema.safeParse({
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    isActive: formData.get("isActive") === "on",
  });
}

function buildFieldErrors(
  issues: { path: (string | number)[]; message: string }[]
): CategoryActionState["fieldErrors"] {
  const fieldErrors: CategoryActionState["fieldErrors"] = {};
  for (const issue of issues) fieldErrors[String(issue.path[0])] = issue.message;
  return fieldErrors;
}

export async function createCategoryAction(
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const parsed = parseCategoryForm(formData);
  if (!parsed.success) return { fieldErrors: buildFieldErrors(parsed.error.issues) };

  const supabase = await createClient();
  const slug = await ensureUniqueCategorySlug(supabase, slugify(parsed.data.name));

  const { error } = await supabase.from("categories").insert({
    name: parsed.data.name,
    slug,
    description: parsed.data.description || null,
    is_active: parsed.data.isActive ?? true,
  });

  if (error) return { error: "Impossible de créer la catégorie." };

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategoryAction(
  categoryId: string,
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const parsed = parseCategoryForm(formData);
  if (!parsed.success) return { fieldErrors: buildFieldErrors(parsed.error.issues) };

  const supabase = await createClient();
  const slug = await ensureUniqueCategorySlug(supabase, slugify(parsed.data.name), categoryId);

  const { error } = await supabase
    .from("categories")
    .update({
      name: parsed.data.name,
      slug,
      description: parsed.data.description || null,
      is_active: parsed.data.isActive ?? true,
    })
    .eq("id", categoryId);

  if (error) return { error: "Impossible de modifier la catégorie." };

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategoryAction(categoryId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) return { error: "Impossible de supprimer la catégorie." };
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function reorderCategoriesAction(orderedIds: string[]) {
  const supabase = await createClient();
  const updates = orderedIds.map((id, index) =>
    supabase.from("categories").update({ display_order: index }).eq("id", id)
  );
  await Promise.all(updates);
  revalidatePath("/admin/categories");
  return { success: true };
}
