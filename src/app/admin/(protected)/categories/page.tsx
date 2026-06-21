import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteCategoryButton from "./delete-button";

export const metadata = {
  title: "Catégories",
  robots: { index: false, follow: false },
};

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order");

  // Compte le nombre de produits par catégorie pour info contextuelle.
  const { data: counts } = await supabase
    .from("products")
    .select("category_id");

  const countByCategory = new Map<string, number>();
  counts?.forEach((p) => {
    if (p.category_id) {
      countByCategory.set(p.category_id, (countByCategory.get(p.category_id) ?? 0) + 1);
    }
  });

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-normal mb-1">Catégories</h1>
          <p className="text-sm text-bone/40">
            {categories?.length ?? 0} catégorie{(categories?.length ?? 0) > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="bg-gold text-ink font-semibold text-[0.7rem] uppercase tracking-[0.15em] px-5 py-2.5 hover:opacity-90 transition-opacity"
        >
          + Ajouter une catégorie
        </Link>
      </div>

      <div className="border border-bone/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-bone/10 text-left text-[0.65rem] uppercase tracking-wider text-bone/40">
              <th className="px-4 py-3 font-normal">Nom</th>
              <th className="px-4 py-3 font-normal">Slug</th>
              <th className="px-4 py-3 font-normal">Produits</th>
              <th className="px-4 py-3 font-normal">Statut</th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((c) => (
              <tr key={c.id} className="border-b border-bone/5 last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/categories/${c.id}`}
                    className="hover:text-gold transition-colors"
                  >
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-bone/40">{c.slug}</td>
                <td className="px-4 py-3 text-bone/50">
                  {countByCategory.get(c.id) ?? 0}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[0.65rem] uppercase tracking-wider px-2 py-1 border ${
                      c.is_active
                        ? "border-green-500/40 text-green-400"
                        : "border-bone/15 text-bone/40"
                    }`}
                  >
                    {c.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 justify-end">
                    <Link
                      href={`/admin/categories/${c.id}`}
                      className="text-[0.65rem] uppercase tracking-wider text-bone/40 hover:text-gold transition-colors"
                    >
                      Modifier
                    </Link>
                    <DeleteCategoryButton categoryId={c.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories?.length === 0 && (
          <div className="px-4 py-16 text-center text-sm text-bone/30">
            Aucune catégorie pour le moment.{" "}
            <Link href="/admin/categories/new" className="text-gold hover:underline">
              Créer la première catégorie
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
