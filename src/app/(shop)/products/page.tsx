import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/shop/product-card";

export const metadata = {
  title: "Boutique",
  description: "Découvrez tous nos produits : maroquinerie, joaillerie, prêt-à-porter et accessoires.",
};

const PAGE_SIZE = 12;

type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  promo_price: number | null;
  product_images: { url: string; is_primary: boolean }[];
};

const SORT_OPTIONS = [
  { value: "recent", label: "Plus récents" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "name", label: "Nom (A-Z)" },
] as const;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    vendor?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const { q, category, vendor, sort = "recent", page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  const [{ data: categories }, { data: vendors }] = await Promise.all([
    supabase.from("categories").select("id, name, slug").eq("is_active", true).order("display_order"),
    supabase.from("vendors").select("id, name, slug").eq("is_active", true).order("name"),
  ]);

  let query = supabase
    .from("products")
    .select(
      "id, name, slug, price, promo_price, product_images(url, is_primary)",
      { count: "exact" }
    )
    .eq("status", "active");

  if (q) query = query.ilike("name", `%${q}%`);

  if (category) {
    const cat = categories?.find((c) => c.slug === category);
    if (cat) query = query.eq("category_id", cat.id);
  }
  if (vendor) {
    const vnd = vendors?.find((v) => v.slug === vendor);
    if (vnd) query = query.eq("vendor_id", vnd.id);
  }

  switch (sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "name":
      query = query.order("name", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data: products, count, error } = await query
    .range(from, to)
    .returns<ProductListItem[]>();

  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1;

  function buildPageUrl(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (category) sp.set("category", category);
    if (vendor) sp.set("vendor", vendor);
    if (sort !== "recent") sp.set("sort", sort);
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v);
      else sp.delete(k);
    });
    const qs = sp.toString();
    return qs ? `/products?${qs}` : "/products";
  }

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
      <div className="text-center mb-10">
        <p className="text-[0.6rem] uppercase tracking-[0.3em] text-gold mb-3">
          Catalogue complet
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal">
          Tous nos <em className="text-gold not-italic">produits</em>
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Filtres */}
        <aside className="lg:w-56 shrink-0">
          <form method="get" className="mb-8">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Rechercher..."
              className="bg-ink2 border border-bone/10 px-4 py-2.5 text-sm w-full placeholder:text-bone/25 focus:outline-none focus:border-gold/60 transition-colors"
            />
          </form>

          <div className="mb-8">
            <h3 className="text-[0.65rem] uppercase tracking-[0.15em] text-bone/40 mb-3">
              Catégories
            </h3>
            <div className="flex flex-col gap-2">
              <Link
                href={buildPageUrl({ category: undefined, page: undefined })}
                className={`text-sm transition-colors ${
                  !category ? "text-gold" : "text-bone/55 hover:text-bone"
                }`}
              >
                Toutes
              </Link>
              {categories?.map((c) => (
                <Link
                  key={c.id}
                  href={buildPageUrl({ category: c.slug, page: undefined })}
                  className={`text-sm transition-colors ${
                    category === c.slug ? "text-gold" : "text-bone/55 hover:text-bone"
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[0.65rem] uppercase tracking-[0.15em] text-bone/40 mb-3">
              Vendeurs
            </h3>
            <div className="flex flex-col gap-2">
              <Link
                href={buildPageUrl({ vendor: undefined, page: undefined })}
                className={`text-sm transition-colors ${
                  !vendor ? "text-gold" : "text-bone/55 hover:text-bone"
                }`}
              >
                Tous
              </Link>
              {vendors?.map((v) => (
                <Link
                  key={v.id}
                  href={buildPageUrl({ vendor: v.slug, page: undefined })}
                  className={`text-sm transition-colors ${
                    vendor === v.slug ? "text-gold" : "text-bone/55 hover:text-bone"
                  }`}
                >
                  {v.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Liste produits */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-bone/40">
              {count ?? 0} produit{(count ?? 0) > 1 ? "s" : ""}
            </p>
            <div className="flex gap-1">
              {SORT_OPTIONS.map((opt) => (
                <Link
                  key={opt.value}
                  href={buildPageUrl({
                    sort: opt.value === "recent" ? undefined : opt.value,
                    page: undefined,
                  })}
                  className={`text-[0.65rem] uppercase tracking-wider px-2.5 py-1.5 transition-colors ${
                    sort === opt.value
                      ? "text-gold"
                      : "text-bone/40 hover:text-bone"
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-500/30 text-red-300 text-sm px-4 py-3 mb-4">
              Impossible de charger les produits.
            </div>
          )}

          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-bone/10">
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
              Aucun produit ne correspond à votre recherche.
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildPageUrl({ page: p === 1 ? undefined : String(p) })}
                  className={`w-8 h-8 flex items-center justify-center text-xs border transition-colors ${
                    p === currentPage
                      ? "border-gold text-gold"
                      : "border-bone/15 text-bone/50 hover:border-bone/30"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
