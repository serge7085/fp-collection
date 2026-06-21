import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "../product-form";
import ImageUploader from "../image-uploader";

export const metadata = {
  title: "Modifier le produit",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }, { data: vendors }, { data: images }] =
    await Promise.all([
      supabase.from("products").select("*").eq("id", id).single(),
      supabase.from("categories").select("*").order("display_order"),
      supabase.from("vendors").select("*").order("name"),
      supabase
        .from("product_images")
        .select("*")
        .eq("product_id", id)
        .order("display_order"),
    ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="px-8 py-8 max-w-4xl">
      <Link
        href="/admin/products"
        className="text-[0.65rem] uppercase tracking-wider text-bone/40 hover:text-gold transition-colors"
      >
        ← Retour aux produits
      </Link>
      <h1 className="font-serif text-2xl font-normal mt-3 mb-1">{product.name}</h1>
      <p className="text-sm text-bone/40 mb-8">Référence : {product.reference}</p>

      <section className="mb-10">
        <h2 className="text-[0.65rem] uppercase tracking-[0.15em] text-gold mb-4">
          Images du produit
        </h2>
        <ImageUploader productId={product.id} initialImages={images ?? []} />
      </section>

      <section>
        <h2 className="text-[0.65rem] uppercase tracking-[0.15em] text-gold mb-4">
          Informations
        </h2>
        <ProductForm
          product={product}
          categories={categories ?? []}
          vendors={vendors ?? []}
        />
      </section>
    </div>
  );
}
