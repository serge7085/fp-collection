import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "../login/actions";

const NAV_ITEMS = [
  { href: "/admin", label: "Tableau de bord", icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" },
  { href: "/admin/products", label: "Produits", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { href: "/admin/categories", label: "Catégories", icon: "M4 6h16M4 12h16M4 18h7" },
  { href: "/admin/vendors", label: "Vendeurs", icon: "M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 100-8 4 4 0 000 8zm6 4v-2a4 4 0 00-3-3.87m-9 0a4 4 0 00-3 3.87v2" },
  { href: "/admin/settings", label: "Paramètres", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Le middleware protège déjà /admin, mais on garde cette vérification
  // au niveau du layout par défense en profondeur.
  if (!user) {
    redirect("/admin/login");
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-ink text-bone flex">
      <aside className="w-60 shrink-0 border-r border-bone/10 flex flex-col">
        <div className="px-5 py-5 border-b border-bone/10 flex items-center gap-3">
          <div className="w-8 h-8 border border-gold flex items-center justify-center text-gold text-xs font-semibold shrink-0">
            FP
          </div>
          <span className="text-sm tracking-[0.15em] text-bone/90">F-P Admin</span>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-bone/60 hover:text-bone hover:bg-bone/5 transition-colors rounded-sm"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="shrink-0"
              >
                <path d={item.icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-bone/10">
          <p className="text-xs text-bone/70 truncate">{admin.full_name}</p>
          <p className="text-[0.65rem] text-bone/35 truncate mb-3">{admin.email}</p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-[0.65rem] uppercase tracking-[0.15em] text-bone/40 hover:text-gold transition-colors"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
