import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSettings, buildWhatsAppUrl } from "@/lib/settings";
import ProductGallery from "@/components/shop/product-gallery";
import ProductCard from "@/components/shop/product-card";

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value) + " FCFA";
}

type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  reference: string | null;
  price: number;
  promo_price: number | null;
  stock: number;
  category_id: string | null;
  vendor_id: string | null;
  meta_title: string | null;
  meta_description: string | null;
  category: { name: string; slug: string } | null;
  vendor: {
    id: string;
    name: string;
    slug: string;
    photo_url: string | null;
    whatsapp: string | null;
  } | null;
  product_images: { url: string; is_primary: boolean }[];
};

async function getProduct(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(
      "id, name, slug, description, reference, price, promo_price, stock, category_id, vendor_id, meta_title, meta_description, category:categories(name, slug), vendor:vendors(id, name, slug, photo_url, whatsapp), product_images(url, is_primary)"
    )
    .eq("slug", slug)
    .eq("status", "active")
    .single()
    .returns<ProductDetail>();

  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return { title: "Produit introuvable" };

  return {
    title: product.meta_title || product.name,
    description:
      product.meta_description ||
      product.description?.slice(0, 160) ||
      `${product.name} — disponible sur F-P Collection`,
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160) ?? undefined,
      images: product.product_images?.[0]?.url
        ? [{ url: product.product_images[0].url }]
        : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const settings = await getSettings();
  const supabase = await createClient();

  // Incrémentation atomique du compteur de vues côté SQL (voir la fonction
  // increment_product_views dans la migration). On ignore volontairement
  // une éventuelle erreur ici : un échec de comptage ne doit jamais
  // empêcher l'affichage de la fiche produit au visiteur.
  void supabase.rpc("increment_product_views", { product_id: product.id });

  const { data: similarProducts } = await supabase
    .from("products")
    .select("id, name, slug, price, promo_price, product_images(url, is_primary)")
    .eq("status", "active")
    .eq("category_id", product.category_id ?? "")
    .neq("id", product.id)
    .limit(4)
    .returns<
      {
        id: string;
        name: string;
        slug: string;
        price: number;
        promo_price: number | null;
        product_images: { url: string; is_primary: boolean }[];
      }[]
    >();

  const whatsappMessage = `Bonjour, je suis intéressé par "${product.name}" (réf. ${product.reference ?? product.id}) vu sur F-P Collection. Pouvez-vous me donner plus d'informations ?`;
  const productWhatsappUrl = product.vendor?.whatsapp
    ? `https://wa.me/${product.vendor.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`
    : buildWhatsAppUrl(settings, whatsappMessage);

  const inStock = product.stock > 0;

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
      <nav className="text-[0.65rem] text-bone/35 mb-8 flex gap-2 flex-wrap">
        <Link href="/" className="hover:text-bone/60">Accueil</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-bone/60">Produits</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/collections/${product.category.slug}`}
              className="hover:text-bone/60"
            >
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <ProductGallery images={product.product_images ?? []} productName={product.name} />

        <div>
          {product.category && (
            <p className="text-[0.6rem] uppercase tracking-[0.2em] text-gold mb-2">
              {product.category.name}
            </p>
          )}
          <h1 className="font-serif text-3xl font-normal mb-3">{product.name}</h1>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl font-medium">
              {formatPrice(product.promo_price ?? product.price)}
            </span>
            {product.promo_price && (
              <span className="text-base text-bone/30 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-8">
            <span
              className={`w-2 h-2 rounded-full ${inStock ? "bg-green-400" : "bg-red-400"}`}
            />
            <span className="text-xs text-bone/50">
              {inStock ? `En stock (${product.stock} disponible${product.stock > 1 ? "s" : ""})` : "Rupture de stock"}
            </span>
          </div>

          {product.description && (
            <p className="text-sm text-bone/60 leading-relaxed mb-8 whitespace-pre-line">
              {product.description}
            </p>
          )}

          <a
            href={productWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 bg-whatsapp/15 border border-whatsapp/40 text-green-300 text-[0.72rem] uppercase tracking-[0.15em] font-semibold py-4 px-6 hover:bg-whatsapp/20 transition-colors w-full"
          >
            Commander sur WhatsApp
          </a>

          {product.reference && (
            <p className="text-[0.65rem] text-bone/25 mt-4">
              Référence : {product.reference}
            </p>
          )}

          {product.vendor && (
            <Link
              href={`/vendors/${product.vendor.slug}`}
              className="flex items-center gap-3 mt-8 pt-6 border-t border-bone/10 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-full bg-ink2 overflow-hidden shrink-0">
                {product.vendor.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.vendor.photo_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <p className="text-[0.6rem] uppercase tracking-wider text-bone/35">
                  Vendu par
                </p>
                <p className="text-sm">{product.vendor.name}</p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {similarProducts && similarProducts.length > 0 && (
        <section className="mt-20">
          <h2 className="font-serif text-2xl font-normal mb-8 text-center">
            Produits <em className="text-gold not-italic">similaires</em>
          </h2>
          <div className="grid [grid-template-columns:repeat(auto-fit,minmax(200px,280px))] gap-px bg-bone/10">
            {similarProducts.map((p) => (
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
        </section>
      )}
    </div>
  );
}
