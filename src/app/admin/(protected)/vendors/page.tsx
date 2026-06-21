import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteVendorButton from "./delete-button";

export const metadata = {
  title: "Vendeurs",
  robots: { index: false, follow: false },
};

export default async function VendorsPage() {
  const supabase = await createClient();
  const { data: vendors } = await supabase.from("vendors").select("*").order("name");

  const { data: counts } = await supabase.from("products").select("vendor_id");
  const countByVendor = new Map<string, number>();
  counts?.forEach((p) => {
    if (p.vendor_id) {
      countByVendor.set(p.vendor_id, (countByVendor.get(p.vendor_id) ?? 0) + 1);
    }
  });

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-normal mb-1">Vendeurs</h1>
          <p className="text-sm text-bone/40">
            {vendors?.length ?? 0} vendeur{(vendors?.length ?? 0) > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/vendors/new"
          className="bg-gold text-ink font-semibold text-[0.7rem] uppercase tracking-[0.15em] px-5 py-2.5 hover:opacity-90 transition-opacity"
        >
          + Ajouter un vendeur
        </Link>
      </div>

      <div className="border border-bone/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-bone/10 text-left text-[0.65rem] uppercase tracking-wider text-bone/40">
              <th className="px-4 py-3 font-normal">Vendeur</th>
              <th className="px-4 py-3 font-normal">Contact</th>
              <th className="px-4 py-3 font-normal">Produits</th>
              <th className="px-4 py-3 font-normal">Statut</th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors?.map((v) => (
              <tr key={v.id} className="border-b border-bone/5 last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/vendors/${v.id}`}
                    className="flex items-center gap-3 hover:text-gold transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-ink2 shrink-0 overflow-hidden">
                      {v.photo_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={v.photo_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    {v.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-bone/50">{v.whatsapp || v.phone || "—"}</td>
                <td className="px-4 py-3 text-bone/50">{countByVendor.get(v.id) ?? 0}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[0.65rem] uppercase tracking-wider px-2 py-1 border ${
                      v.is_active
                        ? "border-green-500/40 text-green-400"
                        : "border-bone/15 text-bone/40"
                    }`}
                  >
                    {v.is_active ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 justify-end">
                    <Link
                      href={`/admin/vendors/${v.id}`}
                      className="text-[0.65rem] uppercase tracking-wider text-bone/40 hover:text-gold transition-colors"
                    >
                      Modifier
                    </Link>
                    <DeleteVendorButton vendorId={v.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {vendors?.length === 0 && (
          <div className="px-4 py-16 text-center text-sm text-bone/30">
            Aucun vendeur pour le moment.{" "}
            <Link href="/admin/vendors/new" className="text-gold hover:underline">
              Ajouter le premier vendeur
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
