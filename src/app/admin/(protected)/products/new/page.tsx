import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "../product-form";

export const metadata = {
  title: "Nouveau produit",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: vendors }] = await Promise.all([
    supabase.from("categories").select("*").order("display_order"),
    supabase.from("vendors").select("*").order("name"),
  ]);

  return (
    <div className="px-8 py-8">
      <Link
        href="/admin/products"
        className="text-[0.65rem] uppercase tracking-wider text-bone/40 hover:text-gold transition-colors"
      >
        ← Retour aux produits
      </Link>
      <h1 className="font-serif text-2xl font-normal mt-3 mb-1">
        Nouveau produit
      </h1>
      <p className="text-sm text-bone/40 mb-8">
        L&apos;ajout d&apos;images sera disponible une fois le produit créé.
      </p>

      <ProductForm categories={categories ?? []} vendors={vendors ?? []} />
    </div>
  );
}
