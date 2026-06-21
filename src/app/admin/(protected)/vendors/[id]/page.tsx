import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VendorForm from "../vendor-form";

export const metadata = {
  title: "Modifier le vendeur",
  robots: { index: false, follow: false },
};

export default async function EditVendorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("id", id)
    .single();

  if (!vendor) notFound();

  return (
    <div className="px-8 py-8">
      <Link
        href="/admin/vendors"
        className="text-[0.65rem] uppercase tracking-wider text-bone/40 hover:text-gold transition-colors"
      >
        ← Retour aux vendeurs
      </Link>
      <h1 className="font-serif text-2xl font-normal mt-3 mb-8">{vendor.name}</h1>
      <VendorForm vendor={vendor} />
    </div>
  );
}
