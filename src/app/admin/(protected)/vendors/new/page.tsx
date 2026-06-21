import Link from "next/link";
import VendorForm from "../vendor-form";

export const metadata = {
  title: "Nouveau vendeur",
  robots: { index: false, follow: false },
};

export default function NewVendorPage() {
  return (
    <div className="px-8 py-8">
      <Link
        href="/admin/vendors"
        className="text-[0.65rem] uppercase tracking-wider text-bone/40 hover:text-gold transition-colors"
      >
        ← Retour aux vendeurs
      </Link>
      <h1 className="font-serif text-2xl font-normal mt-3 mb-8">Nouveau vendeur</h1>
      <VendorForm />
    </div>
  );
}
