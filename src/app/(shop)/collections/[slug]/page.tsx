import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/shop/product-card";

type CategoryProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  promo_price: number | null;
  product_images: { url: string; is_primary: boolean }[];
};

async function getCategory(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Collection introuvable" };
  return {
    title: category.name,
    description: category.description || `Découvrez notre collection ${category.name}.`,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, price, promo_price, product_images(url, is_primary)")
    .eq("status", "active")
    .eq("category_id", category.id)
    .order("created_at", { ascending: false })
    .returns<CategoryProduct[]>();

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
      <nav className="text-[0.65rem] text-bone/35 mb-8 flex gap-2">
        <Link href="/" className="hover:text-bone/60">Accueil</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-bone/60">Produits</Link>
      </nav>

      <div className="text-center mb-12">
        <p className="text-[0.6rem] uppercase tracking-[0.3em] text-gold mb-3">
          Collection
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal mb-3">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-sm text-bone/45 max-w-xl mx-auto leading-relaxed">
            {category.description}
          </p>
        )}
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-bone/10">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              slug={p.slug}
              name={p.name}
              price={p.price}
              promoPrice={p.promo_price}
              imageUrl={
                p.product_images?.find((img) => img.is_primary)?.url ??
                p.product_images?.[0]?.url
              }
            />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center text-sm text-bone/30">
          Aucun produit dans cette collection pour le moment.
        </div>
      )}
    </div>
  );
}
