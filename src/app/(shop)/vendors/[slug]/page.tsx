import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSettings, buildWhatsAppUrl } from "@/lib/settings";
import ProductCard from "@/components/shop/product-card";

type VendorProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  promo_price: number | null;
  product_images: { url: string; is_primary: boolean }[];
};

async function getVendor(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vendors")
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
  const vendor = await getVendor(slug);
  if (!vendor) return { title: "Vendeur introuvable" };
  return {
    title: vendor.name,
    description: vendor.description || `Découvrez les produits de ${vendor.name} sur F-P Collection.`,
  };
}

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vendor = await getVendor(slug);
  if (!vendor) notFound();

  const settings = await getSettings();
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, price, promo_price, product_images(url, is_primary)")
    .eq("status", "active")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false })
    .returns<VendorProduct[]>();

  const whatsappMessage = `Bonjour, je vous contacte depuis votre profil F-P Collection.`;
  const whatsappUrl = vendor.whatsapp
    ? `https://wa.me/${vendor.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`
    : buildWhatsAppUrl(settings, whatsappMessage);

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
      <nav className="text-[0.65rem] text-bone/35 mb-8 flex gap-2">
        <Link href="/" className="hover:text-bone/60">Accueil</Link>
        <span>/</span>
        <Link href="/vendors" className="hover:text-bone/60">Vendeurs</Link>
      </nav>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-14 text-center sm:text-left">
        <div className="w-24 h-24 rounded-full bg-ink2 overflow-hidden shrink-0">
          {vendor.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={vendor.photo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-bone/20 text-2xl font-serif">
              {vendor.name[0]}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="font-serif text-3xl font-normal mb-3">{vendor.name}</h1>
          {vendor.description && (
            <p className="text-sm text-bone/50 leading-relaxed max-w-xl mb-5">
              {vendor.description}
            </p>
          )}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-whatsapp/15 border border-whatsapp/40 text-green-300 text-[0.65rem] uppercase tracking-[0.15em] font-semibold py-2.5 px-5 hover:bg-whatsapp/20 transition-colors"
          >
            Contacter sur WhatsApp
          </a>
        </div>
      </div>

      <h2 className="text-[0.65rem] uppercase tracking-[0.15em] text-bone/40 mb-6">
        Produits ({products?.length ?? 0})
      </h2>

      {products && products.length > 0 ? (
        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(200px,280px))] gap-px bg-bone/10">
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
        <div className="py-16 text-center text-sm text-bone/30">
          Ce vendeur n&apos;a pas encore de produit actif.
        </div>
      )}
    </div>
  );
}
