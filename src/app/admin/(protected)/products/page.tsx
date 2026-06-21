import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusToggle, ProductRowActions } from "./row-actions";
import type { ProductStatus } from "@/lib/database.types";

export const metadata = {
  title: "Produits",
  robots: { index: false, follow: false },
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value) + " FCFA";
}

// Le client Database typé ne connaît pas les relations FK (Relationships
// est volontairement vide), donc une requête avec jointures imbriquées
// (category:categories(name)) revient en `never`. On type le résultat
// explicitement ici plutôt que de complexifier database.types.ts avec un
// système de Relationships génériques pour un seul usage.
type ProductListRow = {
  id: string;
  name: string;
  reference: string | null;
  price: number;
  promo_price: number | null;
  stock: number;
  status: ProductStatus;
  is_featured: boolean;
  category: { name: string } | null;
  vendor: { name: string } | null;
  product_images: { url: string; is_primary: boolean }[];
};

export default async function ProductsListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      "id, name, reference, price, promo_price, stock, status, is_featured, category:categories(name), vendor:vendors(name), product_images(url, is_primary)"
    )
    .order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }
  if (status && ["active", "inactive", "draft"].includes(status)) {
    query = query.eq("status", status as "active" | "inactive" | "draft");
  }

  const { data: products, error } = await query.returns<ProductListRow[]>();

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-normal mb-1">Produits</h1>
          <p className="text-sm text-bone/40">
            {products?.length ?? 0} produit{(products?.length ?? 0) > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-gold text-ink font-semibold text-[0.7rem] uppercase tracking-[0.15em] px-5 py-2.5 hover:opacity-90 transition-opacity"
        >
          + Ajouter un produit
        </Link>
      </div>

      <form className="flex gap-3 mb-6" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Rechercher un produit..."
          className="bg-ink2 border border-bone/10 px-4 py-2.5 text-sm text-bone placeholder:text-bone/25 focus:outline-none focus:border-gold/60 transition-colors flex-1 max-w-sm"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="bg-ink2 border border-bone/10 px-4 py-2.5 text-sm text-bone focus:outline-none focus:border-gold/60 transition-colors"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
          <option value="draft">Brouillon</option>
        </select>
        <button
          type="submit"
          className="text-[0.7rem] uppercase tracking-wider text-bone/50 border border-bone/15 px-4 py-2.5 hover:text-bone hover:border-bone/30 transition-colors"
        >
          Filtrer
        </button>
      </form>

      {error && (
        <div className="bg-red-950/40 border border-red-500/30 text-red-300 text-sm px-4 py-3 mb-4">
          Impossible de charger les produits.
        </div>
      )}

      <div className="border border-bone/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-bone/10 text-left text-[0.65rem] uppercase tracking-wider text-bone/40">
              <th className="px-4 py-3 font-normal">Produit</th>
              <th className="px-4 py-3 font-normal">Catégorie</th>
              <th className="px-4 py-3 font-normal">Vendeur</th>
              <th className="px-4 py-3 font-normal">Prix</th>
              <th className="px-4 py-3 font-normal">Stock</th>
              <th className="px-4 py-3 font-normal">Statut</th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => {
              const primaryImage =
                p.product_images?.find((img) => img.is_primary) ??
                p.product_images?.[0];
              return (
                <tr key={p.id} className="border-b border-bone/5 last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="flex items-center gap-3 hover:text-gold transition-colors"
                    >
                      <div className="w-10 h-10 bg-ink2 shrink-0 overflow-hidden">
                        {primaryImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={primaryImage.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate">{p.name}</div>
                        <div className="text-[0.65rem] text-bone/30">{p.reference}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-bone/50">
                    {p.category?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-bone/50">{p.vendor?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div>{formatPrice(p.price)}</div>
                    {p.promo_price && (
                      <div className="text-[0.65rem] text-bone/30 line-through">
                        {formatPrice(p.promo_price)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-bone/50">{p.stock}</td>
                  <td className="px-4 py-3">
                    <StatusToggle productId={p.id} status={p.status} />
                  </td>
                  <td className="px-4 py-3">
                    <ProductRowActions productId={p.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {products?.length === 0 && (
          <div className="px-4 py-16 text-center text-sm text-bone/30">
            Aucun produit pour le moment.{" "}
            <Link href="/admin/products/new" className="text-gold hover:underline">
              Créer le premier produit
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
