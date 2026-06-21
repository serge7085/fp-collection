import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CategoryForm from "../category-form";

export const metadata = {
  title: "Modifier la catégorie",
  robots: { index: false, follow: false },
};

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (!category) notFound();

  return (
    <div className="px-8 py-8">
      <Link
        href="/admin/categories"
        className="text-[0.65rem] uppercase tracking-wider text-bone/40 hover:text-gold transition-colors"
      >
        ← Retour aux catégories
      </Link>
      <h1 className="font-serif text-2xl font-normal mt-3 mb-8">{category.name}</h1>
      <CategoryForm category={category} />
    </div>
  );
}
