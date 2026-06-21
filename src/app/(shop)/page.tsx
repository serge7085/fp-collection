import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";
import ProductCard from "@/components/shop/product-card";

// Comme pour la liste admin des produits, le client Database typé n'a pas
// de système de Relationships génériques, donc une requête avec jointure
// imbriquée (product_images(...)) revient en `never` sans ce typage explicite.
type FeaturedProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  promo_price: number | null;
  product_images: { url: string; is_primary: boolean }[];
};

export default async function HomePage() {
  const settings = await getSettings();
  const supabase = await createClient();

  const [{ data: categories }, { data: featuredProducts }, { count: activeProductCount }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("id, name, slug, image_url")
        .eq("is_active", true)
        .order("display_order")
        .limit(4),
      supabase
        .from("products")
        .select(
          "id, name, slug, price, promo_price, product_images(url, is_primary)"
        )
        .eq("status", "active")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(8)
        .returns<FeaturedProduct[]>(),
      supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "active"),
    ]);

  const { count: vendorCount } = await supabase
    .from("vendors")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  return (
    <div>
      {/* Hero */}
      <section className="min-h-[85vh] flex items-center justify-center text-center px-6 py-20 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.07)_0%,transparent_70%)]">
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.4em] text-gold mb-5">
            Nouvelle collection
          </p>
          <h1 className="font-serif text-4xl sm:text-6xl font-normal leading-tight mb-5">
            {settings.site_tagline.split(" à ")[0] || "L'élégance"}
            <br />
            <em className="text-gold not-italic">à votre portée</em>
          </h1>
          <p className="text-sm text-bone/45 tracking-wide mb-10">
            Marketplace premium · Mode · Luxe · Excellence
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/products"
              className="bg-gold text-ink font-semibold text-[0.72rem] uppercase tracking-[0.2em] px-9 py-3.5 hover:opacity-90 transition-opacity"
            >
              Découvrir les produits
            </Link>
            <Link
              href="/vendors"
              className="border border-bone/20 text-bone text-[0.72rem] uppercase tracking-[0.2em] px-9 py-3.5 hover:border-bone/40 transition-colors"
            >
              Nos vendeurs
            </Link>
          </div>
        </div>
      </section>

      {/* Bandeau confiance */}
      <div className="border-y border-gold/15 bg-bone/[0.02] py-8 px-6 flex flex-wrap justify-around gap-6">
        {[
          [String(activeProductCount ?? 0) + "+", "Produits actifs"],
          [String(vendorCount ?? 0) + "+", "Vendeurs certifiés"],
          ["100%", "Paiement à la livraison"],
          ["WhatsApp", "Contact direct vendeur"],
        ].map(([n, l]) => (
          <div key={l} className="text-center">
            <div className="font-serif text-2xl font-normal text-gold">{n}</div>
            <div className="text-[0.62rem] uppercase tracking-[0.15em] text-bone/40 mt-1">
              {l}
            </div>
          </div>
        ))}
      </div>

      {/* Collections */}
      {categories && categories.length > 0 && (
        <section className="px-6 py-20 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-gold mb-3">
              Nos univers
            </p>
            <h2 className="font-serif text-3xl font-normal">
              Collections <em className="text-gold not-italic">Signature</em>
            </h2>
          </div>
          <div className="grid [grid-template-columns:repeat(auto-fill,minmax(220px,300px))] gap-px bg-bone/10">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/collections/${c.slug}`}
                className="bg-ink p-10 text-center hover:bg-ink2 transition-colors group"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-ink2 group-hover:bg-ink3 transition-colors overflow-hidden">
                  {c.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.image_url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="font-serif text-base font-normal">{c.name}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Produits vedettes */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="px-6 py-20 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-gold mb-3">
              Sélection
            </p>
            <h2 className="font-serif text-3xl font-normal">
              Pièces <em className="text-gold not-italic">d&apos;Exception</em>
            </h2>
          </div>
          <div className="grid [grid-template-columns:repeat(auto-fill,minmax(200px,280px))] gap-px bg-bone/10">
            {featuredProducts.map((p) => (
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
