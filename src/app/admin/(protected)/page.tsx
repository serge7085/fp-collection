import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Tableau de bord",
  robots: { index: false, follow: false },
};

async function getStats() {
  const supabase = await createClient();

  const [productsCount, vendorsCount, categoriesCount, activeProductsCount] =
    await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("vendors").select("id", { count: "exact", head: true }),
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
    ]);

  return {
    products: productsCount.count ?? 0,
    vendors: vendorsCount.count ?? 0,
    categories: categoriesCount.count ?? 0,
    activeProducts: activeProductsCount.count ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Produits actifs", value: stats.activeProducts },
    { label: "Produits au total", value: stats.products },
    { label: "Vendeurs", value: stats.vendors },
    { label: "Catégories", value: stats.categories },
  ];

  return (
    <div className="px-8 py-8">
      <h1 className="font-serif text-2xl font-normal mb-1">Tableau de bord</h1>
      <p className="text-sm text-bone/40 mb-8">
        Vue d&apos;ensemble de votre marketplace.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-bone/10">
        {cards.map((card) => (
          <div key={card.label} className="bg-ink p-6">
            <div className="text-3xl font-serif text-gold mb-1">{card.value}</div>
            <div className="text-xs uppercase tracking-[0.1em] text-bone/40">
              {card.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
